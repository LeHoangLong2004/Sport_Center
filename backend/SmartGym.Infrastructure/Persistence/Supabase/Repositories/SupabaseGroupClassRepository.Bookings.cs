using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed partial class SupabaseGroupClassRepository
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(
        Guid userId,
        Guid classId,
        Guid? subscriptionId = null
    )
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var existingBookings = await _dbContext
                    .Database.SqlQueryRaw<ClassBookingRawModel>(
                        "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE user_id = {0} AND class_id = {1} AND LOWER(status) IN ('confirmed', 'pending', 'approved')",
                        userId,
                        classId
                    )
                    .ToListAsync();

                if (existingBookings.Count > 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Hội viên đã đặt chỗ lớp học này trước đó rồi.");
                }

                var targetTime = await _dbContext.Database
                    .SqlQueryRaw<ClassTimeConflictRawModel>(
                        "SELECT schedule_time, duration_minutes FROM classes WHERE id = {0} AND status = true AND approval_status = 'approved'",
                        classId
                    )
                    .FirstOrDefaultAsync();

                if (targetTime == null)
                {
                    await transaction.RollbackAsync();
                    return (false, "Lớp học không còn hoạt động.");
                }

                var targetEnd = targetTime.ScheduleTime.AddMinutes(Math.Max(1, targetTime.DurationMinutes));
                var memberClassTimes = await _dbContext.Database
                    .SqlQueryRaw<ClassTimeConflictRawModel>(
                        @"SELECT c.schedule_time, c.duration_minutes
                          FROM class_bookings b
                          INNER JOIN classes c ON c.id = b.class_id
                          WHERE b.user_id = {0}
                            AND b.class_id <> {1}
                            AND LOWER(b.status) IN ('confirmed', 'pending', 'approved')
                            AND c.status = true
                            AND c.approval_status = 'approved'",
                        userId,
                        classId
                    )
                    .ToListAsync();

                if (memberClassTimes.Any(x => Overlaps(targetTime.ScheduleTime, targetEnd, x.ScheduleTime, x.DurationMinutes)))
                {
                    await transaction.RollbackAsync();
                    return (false, "Bạn đã có một lớp học khác trùng thời gian.");
                }

                var memberPtTimes = await _dbContext.Database
                    .SqlQueryRaw<ClassTimeConflictRawModel>(
                        @"SELECT ps.schedule_time, ps.duration_minutes
                          FROM pt_sessions ps
                          INNER JOIN pt_enrollments pe ON pe.id = ps.enrollment_id
                          WHERE pe.user_id = {0}
                            AND ps.status IN ('scheduled', 'pending', 'confirmed')",
                        userId
                    )
                    .ToListAsync();

                if (memberPtTimes.Any(x => Overlaps(targetTime.ScheduleTime, targetEnd, x.ScheduleTime, x.DurationMinutes)))
                {
                    await transaction.RollbackAsync();
                    return (false, "Bạn đã có một buổi PT trùng thời gian với lớp học này.");
                }

                var affectedRows = await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE classes 
                  SET current_enrolled = current_enrolled + 1
                  WHERE id = {0} AND status = true 
                    AND approval_status = 'approved'
                    AND current_enrolled < capacity AND schedule_time > now()",
                    classId
                );

                if (affectedRows == 0)
                {
                    await transaction.RollbackAsync();
                    return (
                        false,
                        "Đặt lớp thất bại: Lớp học đã hết chỗ hoặc đã ngưng nhận đăng ký."
                    );
                }

                if (subscriptionId.HasValue)
                {
                    await _dbContext.Database.ExecuteSqlRawAsync(
                        @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                      VALUES ({0}, {1}, {2}, 'confirmed')
                      ON CONFLICT (user_id, class_id) 
                      DO UPDATE SET status = 'confirmed', subscription_id = {2}",
                        userId,
                        classId,
                        subscriptionId.Value
                    );
                }
                else
                {
                    await _dbContext.Database.ExecuteSqlRawAsync(
                        @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                      VALUES ({0}, {1}, NULL, 'confirmed')
                      ON CONFLICT (user_id, class_id) 
                      DO UPDATE SET status = 'confirmed', subscription_id = NULL",
                        userId,
                        classId
                    );
                }

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi đặt lớp. " + ex.Message);
            }
        });
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(
        Guid userId,
        Guid classId
    )
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var affectedBooking = await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE class_bookings 
                  SET status = 'cancelled' 
                  WHERE user_id = {0} AND class_id = {1} AND LOWER(status) IN ('confirmed', 'pending', 'approved')",
                    userId,
                    classId
                );

                if (affectedBooking == 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Không tìm thấy thông tin đặt chỗ hoặc đã bị hủy.");
                }

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE classes 
                  SET current_enrolled = current_enrolled - 1 
                  WHERE id = {0}",
                    classId
                );

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi hủy đặt lớp. " + ex.Message);
            }
        });
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

    private static bool Overlaps(DateTime start, DateTime end, DateTime otherStart, int otherDurationMinutes)
    {
        var otherEnd = otherStart.AddMinutes(Math.Max(1, otherDurationMinutes));
        return start < otherEnd && otherStart < end;
    }
}
