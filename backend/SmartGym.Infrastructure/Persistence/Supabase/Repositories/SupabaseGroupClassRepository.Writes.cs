using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed partial class SupabaseGroupClassRepository
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> LockCoursePriceAsync(
        Guid rootClassId,
        bool removeCourseWhenPriceMissing = false)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            var courseRows = await _dbContext.Database.SqlQueryRaw<CoursePriceLockRow>(
                "SELECT id, sport_id AS \"SportId\", COALESCE(total_sessions, 1) AS \"TotalSessions\", price_locked_at AS \"PriceLockedAt\" FROM classes WHERE id = {0} AND parent_id IS NULL FOR UPDATE",
                rootClassId).ToListAsync();
            var course = courseRows.SingleOrDefault();
            if (course == null)
            {
                await transaction.RollbackAsync();
                return (false, "Không tìm thấy lớp gốc để chốt học phí.");
            }

            if (course.PriceLockedAt.HasValue)
            {
                await _dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                    UPDATE classes child
                    SET pricing_version_id = root.pricing_version_id,
                        price_per_session_snapshot = root.price_per_session_snapshot,
                        course_fee_snapshot = root.course_fee_snapshot,
                        price_locked_at = root.price_locked_at
                    FROM classes root
                    WHERE root.id = {rootClassId}
                      AND child.parent_id = root.id
                      AND child.price_locked_at IS NULL
                    """);
                await transaction.CommitAsync();
                return (true, null);
            }

            var effectiveDate = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            var prices = await _dbContext.Database.SqlQueryRaw<CoursePriceVersionRow>(
                """
                SELECT id AS "Id", price_per_session AS "PricePerSession"
                FROM sport_class_pricing
                WHERE sport_id = {0} AND is_active = TRUE AND effective_from <= {1}
                  AND (effective_to IS NULL OR effective_to >= {1})
                ORDER BY effective_from DESC, created_at DESC
                LIMIT 1
                """, course.SportId, effectiveDate).ToListAsync();
            var price = prices.SingleOrDefault();
            if (price == null)
            {
                if (removeCourseWhenPriceMissing)
                {
                    await _dbContext.Database.ExecuteSqlRawAsync(
                        "DELETE FROM classes WHERE id = {0} OR parent_id = {0}", rootClassId);
                    await transaction.CommitAsync();
                }
                else
                {
                    await transaction.RollbackAsync();
                }
                return (false, "Bộ môn chưa có bảng giá hiệu lực. Manager cần cấu hình giá trước khi duyệt/mở đăng ký khóa học.");
            }

            var fee = price.PricePerSession * Math.Max(1, course.TotalSessions);
            var affected = await _dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                UPDATE classes
                SET pricing_version_id = {price.Id},
                    price_per_session_snapshot = {price.PricePerSession},
                    course_fee_snapshot = {fee},
                    price_locked_at = now()
                WHERE (id = {rootClassId} OR parent_id = {rootClassId})
                  AND price_locked_at IS NULL
                """);
            if (affected < 1)
            {
                await transaction.RollbackAsync();
                return (false, "Không thể chốt học phí cho khóa học.");
            }

            await transaction.CommitAsync();
            return (true, null);
        });
    }

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

    public async Task<GroupClass> AddAsync(GroupClass groupClass)
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
            ScheduleTime = groupClass.ScheduleTime.Kind == DateTimeKind.Utc
                ? groupClass.ScheduleTime
                : groupClass.ScheduleTime.ToUniversalTime(),
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status,
            ApprovalStatus = groupClass.ApprovalStatus,
            ParentId = groupClass.ParentId,
            SessionNumber = groupClass.SessionNumber,
            TotalSessions = groupClass.TotalSessions,
        };

        var response = await _client.From<GroupClassModel>().Insert(model);
        var inserted = response.Models.FirstOrDefault();
        return inserted != null ? inserted.ToDomain() : groupClass;
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
            ScheduleTime = groupClass.ScheduleTime.Kind == DateTimeKind.Utc
                ? groupClass.ScheduleTime
                : groupClass.ScheduleTime.ToUniversalTime(),
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status,
            ApprovalStatus = groupClass.ApprovalStatus,
            ParentId = groupClass.ParentId,
            SessionNumber = groupClass.SessionNumber,
            TotalSessions = groupClass.TotalSessions,
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

        var priceLocked = await LockCoursePriceAsync(classId);
        if (!priceLocked.IsSuccess)
            return priceLocked;

        var affected = await _dbContext.Database.ExecuteSqlRawAsync(
            "UPDATE classes SET approval_status = 'approved', status = true WHERE (id = {0} OR parent_id = {0}) AND approval_status = 'pending'",
            classId);

        if (affected == 0)
            return (false, "Đề xuất lớp đã được xử lý trước đó.");

        if (classToApprove.CoachId.HasValue)
        {
            await NotifyCoachAsync(
                classToApprove.CoachId.Value,
                "Đề xuất lớp học đã được duyệt",
                $"Lớp {classToApprove.ClassName} (toàn bộ các buổi) đã được Manager duyệt và sẽ hiển thị cho hội viên.",
                "class",
                classId);
        }

        return (true, null);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectClassAsync(Guid classId, string reason)
    {
        var classToReject = await _dbContext.Database
            .SqlQueryRaw<ClassApprovalRawModel>(
                "SELECT id, coach_id, class_name, approval_status FROM classes WHERE id = {0}",
                classId)
            .FirstOrDefaultAsync();

        if (classToReject == null || !string.Equals(classToReject.ApprovalStatus, "pending", StringComparison.OrdinalIgnoreCase))
            return (false, "Không tìm thấy đề xuất lớp hoặc lớp không còn ở trạng thái chờ duyệt.");

        var affected = await _dbContext.Database.ExecuteSqlRawAsync(
            "UPDATE classes SET approval_status = 'rejected', rejection_reason = {1} WHERE (id = {0} OR parent_id = {0}) AND approval_status = 'pending'",
            classId, reason);

        if (affected == 0)
            return (false, "Đề xuất lớp đã được xử lý trước đó.");

        if (classToReject.CoachId.HasValue)
        {
            await NotifyCoachAsync(
                classToReject.CoachId.Value,
                "Đề xuất lớp học bị từ chối",
                $"Đề xuất lớp {classToReject.ClassName} đã bị Manager từ chối. Lý do: {reason}",
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
                return (true, string.Empty);
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
                return (true, string.Empty);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi khôi phục lớp học. " + ex.Message);
            }
        });
    }
}

internal sealed class CoursePriceLockRow
{
    public Guid Id { get; set; }
    public Guid SportId { get; set; }
    public int TotalSessions { get; set; }
    public DateTimeOffset? PriceLockedAt { get; set; }
}

internal sealed class CoursePriceVersionRow
{
    public Guid Id { get; set; }
    public decimal PricePerSession { get; set; }
}

