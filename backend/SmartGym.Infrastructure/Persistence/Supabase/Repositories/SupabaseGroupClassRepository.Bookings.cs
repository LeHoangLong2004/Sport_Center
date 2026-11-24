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
        Guid? subscriptionId = null,
        string bookingStatus = "confirmed"
    )
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // Serialize booking attempts for the same member so two concurrent requests
                // cannot both pass the overlap check before either reservation is visible.
                await _dbContext.Database.ExecuteSqlRawAsync(
                    "SELECT pg_advisory_xact_lock(hashtextextended({0}::text, 0))",
                    userId
                );

                // Lấy toàn bộ các buổi học thuộc khóa học (Buổi gốc + các buổi con)
                var allTargetSessions = await _dbContext.Database
                    .SqlQueryRaw<ClassSessionBookingTargetRawModel>(
                        @"SELECT id, schedule_time, duration_minutes, current_enrolled, capacity 
                          FROM classes 
                          WHERE (id = (SELECT COALESCE(parent_id, id) FROM classes WHERE id = {0})
                             OR parent_id = (SELECT COALESCE(parent_id, id) FROM classes WHERE id = {0}))
                            AND status = true AND approval_status = 'approved'
                            ORDER BY schedule_time ASC FOR UPDATE",
                        classId
                    )
                    .ToListAsync();

                if (allTargetSessions.Count == 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Lớp học không còn hoạt động hoặc chưa được phê duyệt.");
                }

                // Repair residual active rows from older cancellations. When a
                // course invoice is already refunded, any booking row created no
                // later than that refund is stale and must not block rebooking.
                await _dbContext.Database.ExecuteSqlRawAsync(
                    """
                    WITH target_course AS (
                        SELECT COALESCE(parent_id, id) AS root_id FROM classes WHERE id = {1}
                    ), target_sessions AS (
                        SELECT c.id FROM classes c, target_course t
                        WHERE c.id = t.root_id OR c.parent_id = t.root_id
                    ), latest_refund AS (
                        SELECT MAX(i.created_at) AS refunded_at
                        FROM invoices i, target_course t
                        WHERE i.user_id = {0} AND i.class_id = t.root_id
                          AND i.payment_status = 'refunded'
                    ), stale_bookings AS (
                        UPDATE class_bookings b
                        SET status = 'cancelled'
                        WHERE b.user_id = {0}
                          AND b.class_id IN (SELECT id FROM target_sessions)
                          AND LOWER(b.status) IN ('confirmed', 'pending', 'approved', 'pending_payment')
                          AND b.created_at <= (SELECT refunded_at FROM latest_refund)
                          AND (SELECT refunded_at FROM latest_refund) IS NOT NULL
                        RETURNING b.class_id
                    )
                    UPDATE classes c
                    SET current_enrolled = (
                        SELECT COUNT(*) FROM class_bookings b
                        WHERE b.class_id = c.id
                          AND LOWER(b.status) IN ('confirmed', 'pending', 'approved', 'pending_payment')
                    )
                    WHERE c.id IN (SELECT id FROM target_sessions)
                    """,
                    userId,
                    classId);

                await _dbContext.Database.ExecuteSqlRawAsync(
                    """
                    WITH target_course AS (
                        SELECT COALESCE(parent_id, id) AS root_id FROM classes WHERE id = {1}
                    )
                    UPDATE class_booking_payment_holds h
                    SET status = 'cancelled'
                    WHERE h.user_id = {0}
                      AND h.status = 'active'
                      AND h.class_id IN (
                          SELECT c.id FROM classes c, target_course t
                          WHERE c.id = t.root_id OR c.parent_id = t.root_id
                      )
                      AND h.invoice_id IN (
                          SELECT i.id FROM invoices i, target_course t
                          WHERE i.user_id = {0} AND i.class_id = t.root_id
                            AND i.payment_status = 'refunded'
                      )
                    """,
                    userId,
                    classId);

                var existingBookings = await _dbContext
                    .Database.SqlQueryRaw<ClassBookingRawModel>(
                        @"SELECT id, user_id, class_id, status, created_at 
                          FROM class_bookings 
                          WHERE user_id = {0} 
                            AND class_id IN (
                                SELECT id FROM classes
                                WHERE id = (SELECT COALESCE(parent_id, id) FROM classes WHERE id = {1})
                                   OR parent_id = (SELECT COALESCE(parent_id, id) FROM classes WHERE id = {1})
                            )
                            AND LOWER(status) IN ('confirmed', 'pending', 'approved', 'pending_payment')",
                        userId,
                        classId
                    )
                    .ToListAsync();

                if (existingBookings.Count > 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Hội viên đã đặt chỗ khóa học này trước đó rồi.");
                }

                // Lấy các ca học hiện có của hội viên để đối soát xung đột (BR-13)
                var memberClassTimes = await _dbContext.Database
                    .SqlQueryRaw<ClassTimeConflictRawModel>(
                        @"SELECT c.schedule_time, c.duration_minutes
                          FROM class_bookings b
                          INNER JOIN classes c ON c.id = b.class_id
                          WHERE b.user_id = {0}
                            AND b.class_id NOT IN (
                                SELECT id FROM classes
                                WHERE id = (SELECT COALESCE(parent_id, id) FROM classes WHERE id = {1})
                                   OR parent_id = (SELECT COALESCE(parent_id, id) FROM classes WHERE id = {1})
                            )
                            AND (
                                LOWER(b.status) IN ('confirmed', 'pending', 'approved')
                                OR (
                                    LOWER(b.status) = 'pending_payment'
                                    AND EXISTS (
                                        SELECT 1 FROM class_booking_payment_holds h
                                        WHERE h.user_id = b.user_id AND h.class_id = b.class_id
                                          AND h.status = 'active' AND h.expires_at > now()
                                    )
                                )
                            )
                            AND c.status = true
                            AND c.approval_status = 'approved'",
                        userId,
                        classId
                    )
                    .ToListAsync();

                // Quét kiểm tra trùng lịch và kiểm tra sĩ số trên toàn bộ các buổi học của khóa
                foreach (var s in allTargetSessions)
                {
                    var sEnd = s.ScheduleTime.AddMinutes(Math.Max(1, s.DurationMinutes));
                    if (memberClassTimes.Any(x => Overlaps(s.ScheduleTime, sEnd, x.ScheduleTime, x.DurationMinutes)))
                    {
                        await transaction.RollbackAsync();
                        return (false, $"Bạn đã có một lịch học khác trùng thời gian với buổi học ngày {s.ScheduleTime:dd/MM/yyyy HH:mm}.");
                    }

                    if (s.CurrentEnrolled >= s.Capacity)
                    {
                        await transaction.RollbackAsync();
                        return (false, $"Đặt lớp thất bại: Buổi học ngày {s.ScheduleTime:dd/MM/yyyy} đã hết chỗ.");
                    }
                }

                // Thực thi đặt chỗ nguyên tử cho toàn bộ các buổi trong chuỗi khóa học
                foreach (var s in allTargetSessions)
                {
                    await _dbContext.Database.ExecuteSqlRawAsync(
                        @"UPDATE classes 
                          SET current_enrolled = current_enrolled + 1
                          WHERE id = {0}",
                        s.Id
                    );

                    if (subscriptionId.HasValue)
                    {
                        await _dbContext.Database.ExecuteSqlRawAsync(
                            @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                              VALUES ({0}, {1}, {2}, {3})
                              ON CONFLICT (user_id, class_id) 
                              DO UPDATE SET status = {3}, subscription_id = {2}",
                            userId,
                            s.Id,
                            subscriptionId.Value,
                            bookingStatus
                        );
                    }
                    else
                    {
                        await _dbContext.Database.ExecuteSqlRawAsync(
                            @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                              VALUES ({0}, {1}, NULL, {2})
                              ON CONFLICT (user_id, class_id) 
                              DO UPDATE SET status = {2}, subscription_id = NULL",
                            userId,
                            s.Id,
                            bookingStatus
                        );
                    }
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
                var cancelledBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
                    """
                    WITH target_course AS (
                        SELECT COALESCE(parent_id, id) AS root_id FROM classes WHERE id = {1}
                    ), target_sessions AS (
                        SELECT c.id FROM classes c, target_course t
                        WHERE c.id = t.root_id OR c.parent_id = t.root_id
                    ), cancelled_bookings AS (
                        UPDATE class_bookings b
                        SET status = 'cancelled'
                        WHERE b.user_id = {0}
                          AND b.class_id IN (SELECT id FROM target_sessions)
                          AND LOWER(b.status) IN ('confirmed', 'pending', 'approved', 'pending_payment')
                        RETURNING b.id, b.user_id, b.class_id, b.status, b.created_at
                    ), session_counts AS (
                        SELECT class_id FROM cancelled_bookings GROUP BY class_id
                    ), adjusted_classes AS (
                        UPDATE classes c
                        SET current_enrolled = (
                            SELECT COUNT(*) FROM class_bookings b
                            WHERE b.class_id = c.id
                              AND LOWER(b.status) IN ('confirmed', 'pending', 'approved', 'pending_payment')
                        )
                        FROM session_counts counts
                        WHERE c.id = counts.class_id
                        RETURNING c.id
                    ), cancelled_holds AS (
                        UPDATE class_booking_payment_holds h
                        SET status = 'cancelled'
                        WHERE h.user_id = {0}
                          AND h.status = 'active'
                          AND h.class_id IN (SELECT id FROM target_sessions)
                        RETURNING h.invoice_id
                    ), failed_invoices AS (
                        UPDATE invoices i
                        SET payment_status = 'failed'
                        WHERE i.payment_status = 'pending'
                          AND i.id IN (SELECT invoice_id FROM cancelled_holds WHERE invoice_id IS NOT NULL)
                        RETURNING i.id
                    )
                    SELECT id, user_id, class_id, status, created_at FROM cancelled_bookings
                    """,
                    userId,
                    classId
                ).ToListAsync();

                if (cancelledBookings.Count == 0)
                {
                    await transaction.RollbackAsync();
                    return (false, "Không tìm thấy thông tin đặt chỗ hoặc đã bị hủy.");
                }

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
