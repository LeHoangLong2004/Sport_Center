using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed partial class SupabaseGroupClassRepository
{
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

    public async Task<(bool IsSuccess, string? ErrorMessage)> ApproveBookingAsync(Guid bookingId)
    {
        try
        {
            var affected = await _dbContext.Database.ExecuteSqlRawAsync(
                @"WITH approved_booking AS (
                    UPDATE class_bookings
                    SET status = 'confirmed'
                    WHERE id = {0} AND status = 'pending'
                    RETURNING user_id, class_id
                  )
                  INSERT INTO notifications (user_id, title, message, type, target_type, target_id)
                  SELECT approved_booking.user_id,
                         'Yêu cầu đặt lớp đã được duyệt',
                         'Yêu cầu đặt lớp ' || COALESCE(classes.class_name, 'lớp học') || ' của bạn đã được Manager duyệt.',
                         'booking_event',
                         'class',
                         approved_booking.class_id
                  FROM approved_booking
                  LEFT JOIN classes ON classes.id = approved_booking.class_id",
                bookingId
            );

            if (affected == 0)
                return (false, "Không tìm thấy đơn đặt hoặc đơn không ở trạng thái chờ duyệt.");
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, "Lỗi hệ thống khi duyệt lớp: " + ex.Message);
        }
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectBookingAsync(Guid bookingId)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var booking = await _dbContext
                    .Database.SqlQueryRaw<ClassBookingRawModel>(
                        "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE id = {0}",
                        bookingId
                    )
                    .FirstOrDefaultAsync();

                if (booking == null || booking.Status != "pending")
                {
                    await transaction.RollbackAsync();
                    return (false, "Không tìm thấy đơn đặt hoặc đơn không ở trạng thái chờ duyệt.");
                }

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"WITH rejected_booking AS (
                        UPDATE class_bookings
                        SET status = 'rejected'
                        WHERE id = {0}
                        RETURNING user_id, class_id
                      )
                      INSERT INTO notifications (user_id, title, message, type, target_type, target_id)
                      SELECT rejected_booking.user_id,
                             'Yêu cầu đặt lớp bị từ chối',
                             'Yêu cầu đặt lớp ' || COALESCE(classes.class_name, 'lớp học') || ' của bạn đã bị Manager từ chối.',
                             'booking_event',
                             'class',
                             rejected_booking.class_id
                      FROM rejected_booking
                      LEFT JOIN classes ON classes.id = rejected_booking.class_id",
                    bookingId
                );

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE classes 
                      SET current_enrolled = current_enrolled - 1 
                      WHERE id = {0}",
                    booking.ClassId
                );

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi từ chối đơn: " + ex.Message);
            }
        });
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

                // A class cancellation marks active bookings as class_cancelled.
                // Restoring the class makes those bookings pending again so they
                // can be reviewed without incrementing the enrollment counter twice.
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

    private static bool Overlaps(DateTime start, DateTime end, DateTime otherStart, int otherDurationMinutes)
    {
        var otherEnd = otherStart.AddMinutes(Math.Max(1, otherDurationMinutes));
        return start < otherEnd && otherStart < end;
    }
}

