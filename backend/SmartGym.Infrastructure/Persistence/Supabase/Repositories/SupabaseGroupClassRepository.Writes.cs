using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed partial class SupabaseGroupClassRepository
{
    public async Task<bool> HasCoachAvailabilityConflictAsync(Guid coachId, DateTime startTime, DateTime endTime)
    {
        startTime = AsUtc(startTime);
        endTime = AsUtc(endTime);

        var conflicts = await _dbContext.Database.SqlQueryRaw<int>(
            @"SELECT 1 AS ""Value""
              FROM coach_availability_slots
              WHERE coach_id = {0}
                AND status IN ('open', 'booked')
                AND start_time < {1}
                AND end_time > {2}
              LIMIT 1",
            coachId,
            endTime,
            startTime
        ).ToListAsync();

        return conflicts.Count > 0;
    }

    public async Task AddAsync(GroupClass groupClass)
    {
        if (groupClass.CoachId.HasValue)
        {
            try
            {
                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO coaches (id, user_id, specialty, experience_years)
                      SELECT {0}, {0}, 'General Coach', 3
                      WHERE NOT EXISTS (SELECT 1 FROM coaches WHERE id = {0})",
                    groupClass.CoachId.Value
                );
            }
            catch
            {
                // Ignore if coach record already exists or provisioned
            }
        }

        var model = new GroupClassModel
        {
            Id = groupClass.Id,
            SportId = groupClass.SportId,
            CoachId = groupClass.CoachId,
            FacilityId = groupClass.FacilityId,
            ClassName = groupClass.ClassName,
            ScheduleTime = groupClass.ScheduleTime,
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status,
            ApprovalStatus = groupClass.ApprovalStatus,
        };

        await _client.From<GroupClassModel>().Insert(model);
    }

    public async Task UpdateAsync(GroupClass groupClass)
    {
        var model = new GroupClassModel
        {
            Id = groupClass.Id,
            SportId = groupClass.SportId,
            CoachId = groupClass.CoachId,
            FacilityId = groupClass.FacilityId,
            ClassName = groupClass.ClassName,
            ScheduleTime = groupClass.ScheduleTime,
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status,
            ApprovalStatus = groupClass.ApprovalStatus,
        };

        await _client.From<GroupClassModel>().Update(model);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> ApproveClassAsync(Guid classId)
    {
        var classToApprove = await _dbContext.Database
            .SqlQueryRaw<ClassApprovalRawModel>(
                "SELECT id, coach_id, class_name, approval_status FROM classes WHERE id = {0}",
                classId)
            .FirstOrDefaultAsync();

        if (classToApprove == null || !string.Equals(classToApprove.ApprovalStatus, "pending", StringComparison.OrdinalIgnoreCase))
            return (false, "Không tìm thấy đề xuất lớp hoặc lớp không còn ở trạng thái chờ duyệt.");

        var affected = await _dbContext.Database.ExecuteSqlRawAsync(
            "UPDATE classes SET approval_status = 'approved', status = true WHERE id = {0} AND approval_status = 'pending'",
            classId);

        if (affected == 0)
            return (false, "Đề xuất lớp đã được xử lý trước đó.");

        if (classToApprove.CoachId.HasValue)
        {
            await NotifyCoachAsync(
                classToApprove.CoachId.Value,
                "Đề xuất lớp học đã được duyệt",
                $"Lớp {classToApprove.ClassName} đã được Manager duyệt và sẽ hiển thị cho hội viên.",
                "class",
                classId);
        }

        return (true, null);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectClassAsync(Guid classId)
    {
        var classToReject = await _dbContext.Database
            .SqlQueryRaw<ClassApprovalRawModel>(
                "SELECT id, coach_id, class_name, approval_status FROM classes WHERE id = {0}",
                classId)
            .FirstOrDefaultAsync();

        if (classToReject == null || !string.Equals(classToReject.ApprovalStatus, "pending", StringComparison.OrdinalIgnoreCase))
            return (false, "Không tìm thấy đề xuất lớp hoặc lớp không còn ở trạng thái chờ duyệt.");

        var affected = await _dbContext.Database.ExecuteSqlRawAsync(
            "UPDATE classes SET approval_status = 'rejected' WHERE id = {0} AND approval_status = 'pending'",
            classId);

        if (affected == 0)
            return (false, "Đề xuất lớp đã được xử lý trước đó.");

        if (classToReject.CoachId.HasValue)
        {
            await NotifyCoachAsync(
                classToReject.CoachId.Value,
                "Đề xuất lớp học bị từ chối",
                $"Đề xuất lớp {classToReject.ClassName} đã bị Manager từ chối.",
                "class",
                classId);
        }

        return (true, null);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(
        Guid classId
    )
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var affected = await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE classes 
                  SET status = false 
                  WHERE id = {0}",
                    classId
                );

                if (affected == 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Lớp học không tồn tại.");
                }

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE class_bookings 
                  SET status = 'class_cancelled' 
                  WHERE class_id = {0} AND LOWER(status) IN ('confirmed', 'pending', 'approved')",
                    classId
                );

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi hủy lớp học. " + ex.Message);
            }
        });
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RestoreClassTransactionAsync(
        Guid classId
    )
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var affected = await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE classes
                      SET status = true
                      WHERE id = {0} AND status = false",
                    classId
                );

                if (affected == 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Lớp học không tồn tại hoặc đang hoạt động.");
                }

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE class_bookings
                      SET status = 'pending'
                      WHERE class_id = {0} AND status = 'class_cancelled'",
                    classId
                );

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi khôi phục lớp học. " + ex.Message);
            }
        });
    }
}

