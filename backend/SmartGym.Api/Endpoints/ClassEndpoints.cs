using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Application.Common;
using SmartGym.Api.Services;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Lớp học thể thao (Group Classes & Scheduling).
/// Hỗ trợ: Tạo lớp học mới (Quản lý/Admin), HLV gửi đề xuất mở lớp,
/// lấy danh sách lớp đang mở đăng ký và xem thông tin chi tiết lớp học.
/// </summary>
public static partial class ClassEndpoints
{
    /// <summary>
    /// Đăng ký các route quản lý lớp học vào hệ thống định tuyến.
    /// Nhóm route gốc: /api/classes
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapClassEndpoints(this IEndpointRouteBuilder app)
    {
        var classGroup = app.MapGroup("/api/classes").WithTags("Classes");

        // 1. Create Class (Admin/Manager)
        /// <summary>
        /// POST /api/classes
        /// Tạo mới một lớp học thể thao (trực tiếp được duyệt - approved).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        classGroup
            .MapPost(
                "/",
                async ([FromBody] CreateClassRequest request, ClassService service) =>
                {
                    var (isSuccess, errorMessage) = await service.CreateClassAsync(request, "approved");
                    if (!isSuccess)
                        return Results.BadRequest(new { message = errorMessage });
                    return Results.Ok(new { message = "Class created successfully" });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        // 2. Propose Class (Coach)
        /// <summary>
        /// POST /api/classes/proposals
        /// Huấn luyện viên đề xuất mở lớp học mới (chờ quản lý phê duyệt).
        /// - Yêu cầu thời gian mở lớp phải trước tối thiểu 24 giờ.
        /// Quyền hạn yêu cầu: Coach.
        /// </summary>
        classGroup
            .MapPost(
                "/proposals",
                async (
                    [FromBody] CreateClassProposalRequest request,
                    HttpContext context,
                    SmartGymDbContext db,
                    ClassService service,
                    ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? context.User.FindFirst("sub")?.Value;
                        if (!Guid.TryParse(userIdValue, out var userId))
                            return Results.Unauthorized();

                        var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                        if (coachId == null)
                            return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });

                        var scheduleTimeUtc = request.ScheduleTime.Kind == DateTimeKind.Utc
                            ? request.ScheduleTime
                            : request.ScheduleTime.ToUniversalTime();

                        if (scheduleTimeUtc < DateTime.UtcNow.AddHours(24))
                        {
                            return Results.BadRequest(new { message = "Thời gian bắt đầu lớp học đề xuất phải cách thời điểm hiện tại ít nhất 24 giờ để Ban quản lý kịp phê duyệt và hội viên đăng ký." });
                        }

                        if (request.SportId != Guid.Empty)
                        {
                            var isAssignedSport = await db.Database.SqlQueryRaw<int>(
                                @"SELECT 1 AS ""Value"" FROM coach_sports WHERE coach_id = {0} AND sport_id = {1}",
                                coachId.Value, request.SportId
                            ).AnyAsync();

                            if (!isAssignedSport)
                            {
                                return Results.BadRequest(new { message = "Bạn chưa được phân công phụ trách bộ môn này. Vui lòng liên hệ Quản lý để được cấp quyền chuyên môn trước khi đề xuất mở lớp." });
                            }
                        }

                        var createRequest = new CreateClassRequest
                        {
                            SportId = request.SportId,
                            FacilityId = request.FacilityId,
                            CoachId = coachId.Value,
                            ClassName = request.ClassName,
                            ScheduleTime = scheduleTimeUtc,
                            DurationMinutes = request.DurationMinutes,
                            Capacity = request.Capacity,
                            DaysOfWeek = request.DaysOfWeek,
                            Weeks = request.Weeks,
                            TotalSessions = request.TotalSessions
                        };
                        var (isSuccess, errorMessage) = await service.CreateClassAsync(createRequest, "pending");
                        if (!isSuccess)
                            return Results.BadRequest(new { message = errorMessage });

                        return Results.Ok(new { message = "Đề xuất lớp học đã được gửi và đang chờ Manager duyệt." });
                    }
                    catch (Exception ex)
                    {
                        loggerFactory.CreateLogger("ClassProposal").LogError(ex, "Failed to create recurring class proposal for the current coach.");
                        return Results.Problem(
                            title: "Không thể gửi đề xuất mở lớp.",
                            detail: ex.InnerException?.Message ?? ex.Message,
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        /// <summary>
        /// GET /api/classes/proposals/my
        /// Lấy danh sách các đề xuất mở lớp học do chính Huấn luyện viên hiện tại gửi (bao gồm pending, approved, rejected).
        /// </summary>
        classGroup
            .MapGet(
                "/proposals/my",
                async (
                    HttpContext context,
                    SmartGymDbContext db) =>
                {
                    var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;
                    if (!Guid.TryParse(userIdValue, out var userId))
                        return Results.Unauthorized();

                    var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                    if (coachId == null)
                        return Results.Ok(Array.Empty<object>());

                    var effectiveDate = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
                    var sql = @"
                        SELECT c.id, c.class_name, c.schedule_time, c.duration_minutes, c.capacity,
                               c.status, c.approval_status, c.sport_id, s.name AS sport_name, f.name AS facility_name,
                               CASE
                                   WHEN EXISTS (
                                       SELECT 1
                                       FROM class_bookings booking
                                       INNER JOIN classes booked_class ON booked_class.id = booking.class_id
                                       WHERE COALESCE(booked_class.parent_id, booked_class.id) = COALESCE(c.parent_id, c.id)
                                         AND LOWER(COALESCE(booking.status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')
                                   )
                                   THEN COALESCE(
                                       c.course_fee_snapshot,
                                       current_price.price_per_session * GREATEST(COALESCE(c.total_sessions, 1), 1)
                                   )
                                   ELSE current_price.price_per_session * GREATEST(COALESCE(c.total_sessions, 1), 1)
                               END AS price,
                               c.parent_id, c.session_number, c.total_sessions
                        FROM classes c
                        LEFT JOIN sports s ON c.sport_id = s.id
                        LEFT JOIN facilities f ON c.facility_id = f.id
                        LEFT JOIN LATERAL (
                            SELECT p.price_per_session
                            FROM sport_class_pricing p
                            WHERE p.sport_id = c.sport_id
                              AND p.is_active = TRUE
                              AND p.effective_from <= {2}
                              AND (p.effective_to IS NULL OR p.effective_to >= {2})
                            ORDER BY p.effective_from DESC, p.created_at DESC
                            LIMIT 1
                        ) current_price ON TRUE
                        WHERE (c.coach_id = {0} OR c.coach_id = {1})
                          AND c.approval_status IN ('pending', 'approved', 'rejected')
                          AND (c.parent_id IS NULL OR c.session_number = 1)
                        ORDER BY c.schedule_time DESC";

                    var proposals = await db.Database.SqlQueryRaw<CoachClassProposalRow>(sql, coachId.Value, userId, effectiveDate).ToListAsync();
                    return Results.Ok(proposals.Select(p => new
                    {
                        id = p.id,
                        className = p.class_name,
                        scheduleTime = (p.schedule_time.Kind == DateTimeKind.Local
                            ? p.schedule_time.ToUniversalTime()
                            : DateTime.SpecifyKind(p.schedule_time, DateTimeKind.Utc)).ToString("o"),
                        durationMinutes = p.duration_minutes,
                        capacity = p.capacity,
                        sportId = p.sport_id,
                        sportName = p.sport_name ?? "Bộ môn",
                        facilityName = p.facility_name ?? "Phòng tập",
                        price = p.price,
                        status = p.approval_status ?? (p.status ? "approved" : "cancelled"),
                        totalSessions = p.total_sessions ?? 1,
                        sessionNumber = p.session_number ?? 1
                    }));
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        /// <summary>
        /// DELETE /api/classes/proposals/{id:guid}
        /// Huấn luyện viên tự thu hồi / hủy đề xuất mở lớp học khi đang ở trạng thái pending.
        /// </summary>
        classGroup
            .MapDelete(
                "/proposals/{id:guid}",
                async (
                    Guid id,
                    HttpContext context,
                    SmartGymDbContext db,
                    ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? context.User.FindFirst("sub")?.Value;
                        if (!Guid.TryParse(userIdValue, out var userId))
                            return Results.Unauthorized();

                        var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                        if (coachId == null)
                            return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });

                        var affected = await db.Database.ExecuteSqlInterpolatedAsync($@"
                            DELETE FROM classes
                            WHERE (id = {id} OR parent_id = {id})
                              AND (coach_id = {coachId.Value} OR coach_id = {userId}) 
                              AND approval_status = 'pending'");

                        if (affected == 0)
                        {
                            return Results.BadRequest(new { message = "Không tìm thấy đề xuất lớp học hoặc đề xuất không ở trạng thái chờ duyệt." });
                        }

                        return Results.Ok(new { success = true, message = "Đã thu hồi đề xuất mở lớp học thành công." });
                    }
                    catch (Exception ex)
                    {
                        var logger = loggerFactory.CreateLogger("ClassEndpoints");
                        logger.LogError(ex, "Lỗi khi thu hồi đề xuất lớp học {ClassId}", id);
                        return Results.Problem(detail: ex.Message, statusCode: 500);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        // 3. Approve Class Proposal
        /// <summary>
        /// PUT /api/classes/{id}/approve
        /// Quản lý phê duyệt đề xuất mở lớp của Huấn luyện viên.
        /// Kiểm tra xung đột phòng tập, HLV trước khi chuyển trạng thái thành Approved.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        classGroup
            .MapPut(
                "/{id:guid}/approve",
                async (Guid id, ClassService service, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var (isSuccess, errorMessage) = await service.ApproveClassAsync(id);
                        return isSuccess
                            ? Results.Ok(new { message = "Đã duyệt lớp học." })
                            : Results.BadRequest(new { message = errorMessage });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể duyệt lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể duyệt lớp học",
                            detail: "Máy chủ gặp lỗi khi kiểm tra xung đột hoặc cập nhật trạng thái lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4. Reject Class Proposal
        /// <summary>
        /// PUT /api/classes/{id}/reject
        /// Từ chối đề xuất mở lớp học của Huấn luyện viên.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        classGroup
            .MapPut(
                "/{id:guid}/reject",
                async (Guid id, ClassService service, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var (isSuccess, errorMessage) = await service.RejectClassAsync(id);
                        return isSuccess
                            ? Results.Ok(new { message = "Đã từ chối đề xuất lớp học." })
                            : Results.BadRequest(new { message = errorMessage });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể từ chối lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể từ chối lớp học",
                            detail: "Máy chủ gặp lỗi khi cập nhật trạng thái lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4b. Cancel Class (Manager/Admin)
        /// <summary>
        /// POST /api/classes/{id}/cancel
        /// Quản lý hủy lớp học.
        /// Đánh dấu status = false và cập nhật trạng thái đơn đặt của học viên.
        /// </summary>
        classGroup
            .MapPost(
                "/{id:guid}/cancel",
                async (Guid id, SmartGymDbContext db, IGroupClassRepository repository, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var targetClass = await repository.GetByIdAsync(id);
                        if (targetClass == null)
                            return Results.BadRequest(new { message = "Không tìm thấy buổi học để hủy." });

                        var affected = await db.Database.ExecuteSqlInterpolatedAsync(
                            $"UPDATE classes SET status = FALSE, current_enrolled = 0 WHERE id = {id}");

                        if (affected == 0)
                            return Results.BadRequest(new { message = "Không tìm thấy lớp học để hủy." });

                        await repository.NotifyAffectedMembersAsync(
                            id,
                            "Buổi học đã bị hủy",
                            $"Buổi {targetClass.ClassName} ngày {CenterTime.ToLocal(targetClass.ScheduleTime):dd/MM/yyyy HH:mm} đã bị hủy bởi trung tâm. Vui lòng kiểm tra lịch học để biết thông tin cập nhật."
                        );

                        try
                        {
                            await db.Database.ExecuteSqlInterpolatedAsync(
                                $"UPDATE class_bookings SET status = 'class_cancelled' WHERE class_id = {id} AND status NOT IN ('cancelled', 'rejected', 'class_cancelled')");
                        }
                        catch { }

                        return Results.Ok(new { success = true, message = "Đã hủy lớp học thành công." });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể hủy lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể hủy lớp học",
                            detail: "Máy chủ gặp lỗi khi cập nhật trạng thái hủy lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // Manager can directly adjust one session without modifying the rest of its course.
        classGroup.MapPost(
            "/{id:guid}/manager-adjustment",
            async (
                Guid id,
                ManagerClassAdjustmentRequest adjustment,
                SmartGymDbContext db,
                IGroupClassRepository repository,
                ClassService service) =>
            {
                var target = await repository.GetByIdAsync(id);
                if (target == null)
                    return Results.NotFound(new { message = "Không tìm thấy buổi học." });
                if (!target.Status || target.ScheduleTime <= DateTime.UtcNow)
                    return Results.BadRequest(new { message = "Chỉ có thể điều chỉnh buổi học đang hoạt động và chưa bắt đầu." });
                if (target.CoachId == null)
                    return Results.BadRequest(new { message = "Buổi học chưa được phân công HLV nên không thể điều chỉnh." });
                if (string.IsNullOrWhiteSpace(adjustment.Reason))
                    return Results.BadRequest(new { message = "Vui lòng nhập lý do điều chỉnh." });

                var action = (adjustment.Action ?? string.Empty).Trim().ToLowerInvariant();
                var coachId = target.CoachId.Value;
                if (action == "substitute")
                {
                    if (!adjustment.SubstituteCoachId.HasValue)
                        return Results.BadRequest(new { message = "Vui lòng chọn HLV dạy thay." });
                    coachId = adjustment.SubstituteCoachId.Value;
                    if (coachId == target.CoachId.Value)
                        return Results.BadRequest(new { message = "HLV dạy thay phải khác HLV đang phụ trách." });
                    var coachRows = await db.Database.SqlQueryRaw<ManagerCoachSpecialtyRow>(
                        "SELECT specialty AS \"Specialty\" FROM coaches WHERE id = {0} LIMIT 1", coachId).ToListAsync();
                    if (coachRows.Count == 0)
                        return Results.BadRequest(new { message = "Không tìm thấy HLV dạy thay." });
                    var classDetail = await service.GetClassDetailAsync(id);
                    if (!IsCoachQualifiedForSport(coachRows[0].Specialty, classDetail?.SportName, target.ClassName))
                        return Results.BadRequest(new { message = $"HLV được chọn không phụ trách bộ môn {classDetail?.SportName ?? "của buổi học này"}." });
                }
                else if (action != "reschedule")
                {
                    return Results.BadRequest(new { message = "Loại điều chỉnh không hợp lệ." });
                }

                var newScheduleTime = target.ScheduleTime;
                if (action == "reschedule")
                {
                    if (!adjustment.NewScheduleTime.HasValue)
                        return Results.BadRequest(new { message = "Vui lòng chọn ngày và giờ mới." });
                    newScheduleTime = adjustment.NewScheduleTime.Value;
                    if (newScheduleTime.Kind == DateTimeKind.Unspecified)
                        newScheduleTime = DateTime.SpecifyKind(newScheduleTime, DateTimeKind.Utc);
                    else if (newScheduleTime.Kind == DateTimeKind.Local)
                        newScheduleTime = newScheduleTime.ToUniversalTime();
                    if (newScheduleTime == target.ScheduleTime)
                        return Results.BadRequest(new { message = "Ngày giờ mới phải khác lịch hiện tại." });
                }

                var update = await service.UpdateClassAsync(id, new CreateClassRequest
                {
                    SportId = target.SportId,
                    FacilityId = target.FacilityId,
                    CoachId = coachId,
                    ClassName = target.ClassName,
                    ScheduleTime = newScheduleTime,
                    DurationMinutes = target.DurationMinutes,
                    Capacity = target.Capacity,
                    Reason = adjustment.Reason.Trim(),
                });
                if (!update.IsSuccess)
                    return Results.BadRequest(new { message = update.ErrorMessage });

                return Results.Ok(new
                {
                    success = true,
                    message = action == "reschedule" ? "Đã dời buổi học và thông báo cho học viên." : "Đã phân công HLV dạy thay và thông báo cho học viên.",
                });
            })
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // Cancel the remaining sessions in a recurring course, preserving completed sessions.
        classGroup.MapPost(
            "/{id:guid}/cancel-course",
            async (Guid id, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
            {
                var executionStrategy = db.Database.CreateExecutionStrategy();
                try
                {
                    return await executionStrategy.ExecuteAsync<IResult>(async () =>
                    {
                        await using var transaction = await db.Database.BeginTransactionAsync();
                        try
                        {
                            var roots = await db.Database.SqlQueryRaw<CourseCancellationRootRow>(
                                """
                                SELECT root.id AS "RootId", root.class_name AS "ClassName",
                                       GREATEST(COALESCE(root.total_sessions, 1), 1) AS "TotalSessions",
                                       root.coach_id AS "CoachId"
                                FROM classes selected
                                INNER JOIN classes root ON root.id = COALESCE(selected.parent_id, selected.id)
                                WHERE selected.id = {0}
                                FOR UPDATE OF root
                                """, id).ToListAsync();
                            var root = roots.SingleOrDefault();
                            if (root == null)
                            {
                                await transaction.RollbackAsync();
                                return Results.NotFound(new { message = "Không tìm thấy khóa học." });
                            }

                            var now = DateTime.UtcNow;
                            var upcomingSessions = await db.Database.SqlQueryRaw<CourseCancellationSessionRow>(
                                """
                                SELECT id AS "Id", class_name AS "ClassName", schedule_time AS "ScheduleTime"
                                FROM classes
                                WHERE (id = {0} OR parent_id = {0})
                                  AND schedule_time > {1}
                                  AND status = TRUE
                                  AND COALESCE(approval_status, 'approved') = 'approved'
                                ORDER BY schedule_time
                                FOR UPDATE
                                """, root.RootId, now).ToListAsync();
                            if (upcomingSessions.Count == 0)
                            {
                                await transaction.RollbackAsync();
                                return Results.BadRequest(new { message = "Khóa học không còn buổi nào sắp diễn ra để hủy." });
                            }

                            var sessionIds = upcomingSessions.Select(session => session.Id).ToArray();
                            var bookings = await db.Database.SqlQueryRaw<CourseCancellationBookingRow>(
                                """
                                SELECT user_id AS "UserId", class_id AS "ClassId", subscription_id AS "SubscriptionId"
                                FROM class_bookings
                                WHERE class_id = ANY({0})
                                  AND LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')
                                """, sessionIds).ToListAsync();
                            var memberIds = bookings.Select(booking => booking.UserId).Distinct().ToArray();

                            await db.Database.ExecuteSqlInterpolatedAsync($"""
                                UPDATE class_bookings
                                SET status = 'class_cancelled'
                                WHERE class_id = ANY({sessionIds})
                                  AND LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')
                                """);
                            await db.Database.ExecuteSqlInterpolatedAsync($"""
                                UPDATE classes
                                SET status = FALSE, current_enrolled = 0
                                WHERE id = ANY({sessionIds})
                                """);

                            decimal totalRefunded = 0m;
                            var updatedWalletBalances = new Dictionary<Guid, decimal>();
                            var linkedInvoices = memberIds.Length == 0
                                ? new List<SmartGym.Domain.Entities.Invoice>()
                                : (await db.Invoices
                                    .Where(invoice => invoice.ClassId == root.RootId)
                                    .ToListAsync())
                                    .Where(invoice => memberIds.Contains(invoice.UserId))
                                    .ToList();
                            var linkedInvoiceUsers = linkedInvoices.Select(invoice => invoice.UserId).ToHashSet();
                            var unlinkedBookings = bookings
                                .Where(booking => !booking.SubscriptionId.HasValue && !linkedInvoiceUsers.Contains(booking.UserId))
                                .Select(booking => booking.UserId)
                                .Distinct()
                                .Count();

                            var cancelledSessionCount = upcomingSessions.Count;
                            foreach (var invoice in linkedInvoices)
                            {
                                if (invoice.Status == PaymentStatus.Pending)
                                {
                                    invoice.Status = PaymentStatus.Expired;
                                    continue;
                                }
                                if (invoice.Status != PaymentStatus.Completed || invoice.TotalAmount <= 0)
                                    continue;

                                var targetRefund = Math.Round(
                                    invoice.TotalAmount * cancelledSessionCount / Math.Max(1m, root.TotalSessions),
                                    2,
                                    MidpointRounding.AwayFromZero);
                                var refundAmount = Math.Min(
                                    Math.Max(0m, invoice.TotalAmount - invoice.RefundedAmount),
                                    Math.Max(0m, targetRefund - invoice.RefundedAmount));
                                if (refundAmount <= 0)
                                    continue;

                                var referenceCode = $"COURSE-CANCEL-{root.RootId:N}-{invoice.Id:N}";
                                var existingRefund = await db.Database.SqlQueryRaw<GuidValueRow>(
                                    "SELECT id AS \"Value\" FROM wallet_transactions WHERE reference_code = {0} LIMIT 1",
                                    referenceCode).ToListAsync();
                                if (existingRefund.Count > 0)
                                    continue;

                                var balances = await db.Database.SqlQueryRaw<WalletBalanceRow>(
                                    """
                                    INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                                    VALUES ({0}, {1}, now())
                                    ON CONFLICT (user_id) DO UPDATE
                                    SET balance = member_wallet_balances.balance + EXCLUDED.balance,
                                        last_updated_at = now()
                                    RETURNING balance AS "Balance"
                                    """, invoice.UserId, refundAmount).ToListAsync();
                                var balance = balances.Single().Balance;
                                var note = $"Hoàn tiền hủy khóa {root.ClassName}: {cancelledSessionCount} buổi chưa diễn ra";
                                await db.Database.ExecuteSqlInterpolatedAsync($"""
                                    INSERT INTO wallet_transactions
                                        (id, user_id, type, amount, balance_after, method, status, reference_code, note, created_at)
                                    VALUES
                                        ({Guid.NewGuid()}, {invoice.UserId}, 'refund', {refundAmount}, {balance}, 'Ví hoàn tiền', 'completed', {referenceCode}, {note}, now())
                                    """);

                                invoice.RefundedAmount += refundAmount;
                                if (invoice.RefundedAmount >= invoice.TotalAmount)
                                    invoice.Status = PaymentStatus.Refunded;
                                updatedWalletBalances[invoice.UserId] = balance;
                                totalRefunded += refundAmount;
                            }

                            await db.SaveChangesAsync();
                            foreach (var memberId in memberIds)
                            {
                                await db.Database.ExecuteSqlInterpolatedAsync($"""
                                    INSERT INTO notifications (user_id, title, message, type, target_type, target_id)
                                    VALUES ({memberId}, 'Khóa học đã bị hủy',
                                            {root.ClassName + " đã hủy các buổi chưa diễn ra trong khóa học."},
                                            'booking_event', 'class', {root.RootId})
                                    """);
                            }

                            if (root.CoachId.HasValue)
                            {
                                await db.Database.ExecuteSqlInterpolatedAsync($"""
                                    INSERT INTO notifications (user_id, title, message, type, target_type, target_id)
                                    SELECT user_id, 'Khóa học đã bị hủy',
                                           {root.ClassName + " đã hủy các buổi chưa diễn ra trong khóa học."},
                                           'coach_event', 'class', {root.RootId}
                                    FROM coaches WHERE id = {root.CoachId.Value} AND user_id IS NOT NULL
                                    ON CONFLICT DO NOTHING
                                    """);
                            }

                            await transaction.CommitAsync();
                            foreach (var (memberId, balance) in updatedWalletBalances)
                                MemberEndpoints.SetMemberWalletCache(memberId, balance);

                            var message = $"Đã hủy {cancelledSessionCount} buổi chưa diễn ra trong khóa học; giữ nguyên lịch sử buổi đã diễn ra.";
                            if (unlinkedBookings > 0)
                                message += $" Có {unlinkedBookings} lượt đăng ký cũ chưa liên kết hóa đơn với khóa học, cần đối soát hoàn tiền thủ công.";

                            return Results.Ok(new
                            {
                                success = true,
                                message,
                                cancelledSessionCount,
                                cancelledBookingCount = bookings.Count,
                                refundedAmount = totalRefunded,
                                unlinkedBookingCount = unlinkedBookings
                            });
                        }
                        catch
                        {
                            await transaction.RollbackAsync();
                            db.ChangeTracker.Clear();
                            throw;
                        }
                    });
                }
                catch (Exception exception)
                {
                    loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể hủy khóa học {ClassId}.", id);
                    return Results.Problem(
                        title: "Không thể hủy khóa học",
                        detail: exception.InnerException?.Message ?? exception.Message,
                        statusCode: StatusCodes.Status500InternalServerError);
                }
            })
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4c. Restore Class (Manager/Admin)
        /// <summary>
        /// POST /api/classes/{id}/restore
        /// Quản lý khôi phục lớp học đã bị hủy.
        /// </summary>
        classGroup
            .MapPost(
                "/{id:guid}/restore",
                async (Guid id, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var affected = await db.Database.ExecuteSqlInterpolatedAsync(
                            $"UPDATE classes SET status = TRUE WHERE id = {id}");

                        if (affected == 0)
                            return Results.BadRequest(new { message = "Không tìm thấy lớp học để khôi phục." });

                        return Results.Ok(new { success = true, message = "Đã khôi phục lớp học thành công." });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể khôi phục lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể khôi phục lớp học",
                            detail: "Máy chủ gặp lỗi khi khôi phục lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4d. All Classes (Manager/Admin/Coach schedule view)
        /// <summary>
        /// GET /api/classes/all & GET /api/classes
        /// Lấy toàn bộ danh sách lớp học thể thao (Manager/Admin quản lý lịch trình và phân công).
        /// </summary>
        classGroup.MapGet(
            "/all",
            async (ClassService service) =>
            {
                try
                {
                    return Results.Ok(await service.GetAllClassesAsync());
                }
                catch (Exception ex)
                {
                    return Results.Problem(detail: ex.ToString(), statusCode: 500);
                }
            }
        );

        // 5. Available Classes
        /// <summary>
        /// DELETE /api/classes/by-date/{date}
        /// Xóa tất cả các lớp học nhóm (không phải PT 1-1) theo ngày đã cho.
        /// Định dạng ngày: yyyy-MM-dd (UTC). Không xóa các PT session vì chúng nằm trong bảng pt_sessions.
        /// </summary>
        classGroup
            .MapDelete(
                "/by-date/{date:datetime}",
                async (DateTime date, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var start = date.Date;
                        var end = start.AddDays(1);
                        var affected = await db.Database.ExecuteSqlInterpolatedAsync($"""
                            DELETE FROM classes
                            WHERE schedule_time >= {start} AND schedule_time < {end}
                        """);
                        return Results.Ok(new { success = true, deleted = affected, message = $"Đã xóa {affected} lớp vào ngày {start:yyyy-MM-dd}." });
                    }
                    catch (Exception ex)
                    {
                        var logger = loggerFactory.CreateLogger("ClassEndpoints");
                        logger.LogError(ex, "Lỗi khi xóa lớp theo ngày {Date}", date);
                        return Results.Problem(detail: ex.Message, statusCode: 500);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 5. Available Classes
        /// <summary>
        /// GET /api/classes/available
        /// Lấy danh sách các lớp học đang mở và khả dụng cho hội viên đăng ký.
        /// </summary>
        classGroup.MapGet(
            "/available",
            async (ClassService service, ILoggerFactory loggerFactory) =>
            {
                try
                {
                    var classes = await service.GetAvailableClassesAsync();
                    return Results.Ok(classes);
                }
                catch (Exception exception)
                {
                    var logger = loggerFactory.CreateLogger("ClassEndpoints");
                    logger.LogError(exception, "Không thể tải danh sách lớp học khả dụng.");
                    return Results.Problem(
                        title: "Không thể tải lịch học",
                        detail: "Database hiện không khả dụng. Vui lòng kiểm tra kết nối máy chủ rồi thử lại.",
                        statusCode: StatusCodes.Status503ServiceUnavailable
                    );
                }
            }
        );

        // 6. Class Detail
        /// <summary>
        /// GET /api/classes/{id}
        /// Lấy chi tiết thông tin lớp học (HLV phụ trách, thời gian, số chỗ, danh sách học viên tham gia).
        /// </summary>
        classGroup.MapGet(
            "/{id:guid}",
            async (Guid id, ClassService service) =>
            {
                var classDetail = await service.GetClassDetailAsync(id);
                if (classDetail == null)
                    return Results.NotFound(new { message = "Không tìm thấy lớp học" });
                return Results.Ok(classDetail);
            }
        );

        // 7. Booking & Cancellation Endpoints
        MapClassBookingEndpoints(classGroup);
    }

    private static bool IsCoachQualifiedForSport(string? specialty, string? sportName, string? className)
    {
        var spec = (specialty ?? string.Empty).Trim().ToLowerInvariant();
        if (spec.Length == 0) return false;
        var sport = (sportName ?? string.Empty).Trim().ToLowerInvariant();
        var target = $"{sport} {(className ?? string.Empty).ToLowerInvariant()}";
        if (sport.Length == 0 && className is null) return false;
        if (target.Contains("yoga") && spec.Contains("yoga")) return true;
        if (target.Contains("pilates") && (spec.Contains("pilates") || spec.Contains("yoga"))) return true;
        if ((target.Contains("gym") || target.Contains("fitness") || target.Contains("thể lực") || target.Contains("thể hình"))
            && (spec.Contains("gym") || spec.Contains("fitness") || spec.Contains("thể hình") || spec.Contains("body"))) return true;
        if ((target.Contains("bóng đá") || target.Contains("futsal")) && (spec.Contains("bóng đá") || spec.Contains("futsal"))) return true;
        if (target.Contains("cầu lông") && (spec.Contains("cầu lông") || spec.Contains("badminton"))) return true;
        if ((target.Contains("bơi") || target.Contains("swim")) && (spec.Contains("bơi") || spec.Contains("swim"))) return true;
        if ((target.Contains("boxing") || target.Contains("võ") || target.Contains("combat"))
            && (spec.Contains("boxing") || spec.Contains("võ") || spec.Contains("combat"))) return true;
        if ((target.Contains("dance") || target.Contains("zumba")) && (spec.Contains("dance") || spec.Contains("zumba"))) return true;
        return sport.Length > 0 && spec.Contains(sport);
    }

    public class CoachClassProposalRow
    {
        public Guid id { get; set; }
        public string class_name { get; set; } = "";
        public DateTime schedule_time { get; set; }
        public int duration_minutes { get; set; }
        public int capacity { get; set; }
        public bool status { get; set; }
        public string? approval_status { get; set; }
        public Guid sport_id { get; set; }
        public string? sport_name { get; set; }
        public string? facility_name { get; set; }
        public decimal? price { get; set; }
        public Guid? parent_id { get; set; }
        public int? session_number { get; set; }
        public int? total_sessions { get; set; }
    }

public sealed class CourseCancellationRootRow
{
    public Guid RootId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public int TotalSessions { get; set; }
    public Guid? CoachId { get; set; }
}

public sealed class CourseCancellationSessionRow
{
    public Guid Id { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
}

public sealed class CourseCancellationBookingRow
{
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public Guid? SubscriptionId { get; set; }
}

public sealed class GuidValueRow
{
    public Guid Value { get; set; }
}

public sealed class WalletBalanceRow
{
    public decimal Balance { get; set; }
}

public sealed class ManagerClassAdjustmentRequest
{
    public string? Action { get; set; }
    public DateTime? NewScheduleTime { get; set; }
    public Guid? SubstituteCoachId { get; set; }
    public string? Reason { get; set; }
}

public sealed class ManagerCoachSpecialtyRow
{
    public string? Specialty { get; set; }
}
}
