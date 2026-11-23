using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Phần mở rộng (partial) của ClassEndpoints chuyên xử lý nghiệp vụ Đặt chỗ lớp học (Class Booking).
/// Bao gồm: thanh toán trực tiếp/tại quầy, hủy đặt lớp và nhân viên đặt hộ.
/// </summary>
public static partial class ClassEndpoints
{
    /// <summary>
    /// Đăng ký các route đặt chỗ lớp học vào nhóm route của lớp học.
    /// </summary>
    /// <param name="classGroup">Nhóm route /api/classes</param>
    private static void MapClassBookingEndpoints(RouteGroupBuilder classGroup)
    {
        // 1. Legacy direct booking without payment (disabled)
        /// <summary>
        /// POST /api/classes/{id}/book
        /// Luồng đặt lớp trực tiếp không thanh toán đã ngừng sử dụng.
        /// Quyền hạn yêu cầu: Member, Admin hoặc Manager.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/book",
            async (HttpContext context) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out _))
                    return Results.Unauthorized();

                return Results.BadRequest(new { message = "Vui lòng sử dụng luồng thanh toán để đăng ký lớp học." });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 2. Pay and Book Class (Direct purchase or Pay at Counter)
        /// <summary>
        /// POST /api/classes/{id}/pay-and-book
        /// Đặt chỗ lớp học kèm thanh toán trực tiếp (qua mã QR chuyển khoản hoặc thanh toán tại quầy).
        /// Tự động tạo bản ghi Payment & Invoice tương ứng.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/pay-and-book",
            async (Guid id, [FromBody] PayAndBookClassRequest? request, HttpContext context, ClassService service, SmartGymDbContext db) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                var method = request?.PaymentMethod ?? "qr";
                var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
                var priceRows = await db.Database.SqlQueryRaw<ClassPriceSnapshotRaw>(
                    """
                    SELECT root.id AS "RootId",
                           root.sport_id AS "SportId",
                           GREATEST(COALESCE(root.total_sessions, 1), 1) AS "TotalSessions",
                           active_price.id AS "PricingVersionId",
                           active_price.price_per_session AS "PricePerSession"
                    FROM classes current_class
                    LEFT JOIN classes root ON root.id = COALESCE(current_class.parent_id, current_class.id)
                    LEFT JOIN LATERAL (
                        SELECT p.id, p.price_per_session
                        FROM sport_class_pricing p
                        WHERE p.sport_id = root.sport_id
                          AND p.is_active = TRUE
                          AND p.effective_from <= {1}
                          AND (p.effective_to IS NULL OR p.effective_to >= {1})
                        ORDER BY p.effective_from DESC, p.created_at DESC
                        LIMIT 1
                    ) active_price ON TRUE
                    WHERE current_class.id = {0}
                    """, id, today).ToListAsync();
                var pricing = priceRows.SingleOrDefault();
                if (pricing == null)
                    return Results.NotFound(new { message = "Không tìm thấy lớp học." });
                if (pricing.PricingVersionId == null || pricing.PricePerSession == null)
                    return Results.BadRequest(new { message = "Khóa học chưa có học phí được chốt. Vui lòng liên hệ quản lý trung tâm." });

                // Tạm thời dùng bảng giá hiệu lực hiện tại trong DB, bỏ qua course_fee_snapshot.
                var amount = pricing.PricePerSession.Value * pricing.TotalSessions;
                var isWallet = method.ToLower() is "wallet" or "ewallet";
                var deductedFromWallet = false;

                // 1. Kiểm tra số dư ví trước (KHÔNG trừ tiền trước) nếu thanh toán bằng Ví
                if (isWallet)
                {
                    var curBalance = await MemberEndpoints.GetMemberBalanceAsync(db, userId);
                    if (curBalance < amount)
                    {
                        return Results.BadRequest(new { message = $"Số dư ví không đủ (hiện có {curBalance:N0} đ). Vui lòng nạp thêm tiền vào ví!" });
                    }
                }

                try
                {
                    // 2. Kiểm tra tính hợp lệ và thực hiện đặt lớp trước (kiểm tra trùng lịch, sĩ số, v.v.)
                    var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
                    if (!isSuccess)
                    {
                        // Đặt lớp thất bại: KHÔNG trừ tiền ví, báo lỗi trực tiếp về client
                        if (errorMessage != null && (errorMessage.Contains("đã đặt chỗ") || errorMessage.Contains("đã đăng ký")))
                        {
                            ClassDetailResponse? existingDetail = null;
                            try { existingDetail = await service.GetClassDetailAsync(id); } catch { }
                            return Results.Ok(new
                            {
                                success = true,
                                alreadyBooked = true,
                                message = "Bạn đã hoàn tất đặt chỗ lớp học này trước đó rồi.",
                                classInfo = existingDetail
                            });
                        }
                        return Results.BadRequest(new { message = errorMessage });
                    }

                    // 3. Đặt lớp thành công -> Mới tiến hành trừ tiền từ ví hội viên
                    decimal? updatedWalletBalance = null;
                    if (isWallet)
                    {
                        var (deductOk, newBal, deductErr) = await MemberEndpoints.DeductFromWalletAsync(
                            db,
                            userId,
                            amount,
                            $"Thanh toán đặt lớp học (Mã: {id.ToString()[..8]})"
                        );
                        if (!deductOk)
                        {
                            // Nếu trừ ví thất bại thì hủy lượt đặt giữ chỗ vừa tạo
                            await service.CancelBookingAsync(userId, id);
                            return Results.BadRequest(new { message = deductErr ?? "Số dư ví không đủ để thanh toán." });
                        }
                        deductedFromWallet = true;
                        updatedWalletBalance = newBal;
                    }

                    var isCounter = method.ToLower() is "counter" or "cashatcounter";
                    try
                    {
                        if (amount > 0)
                        {
                            await db.Database.ExecuteSqlRawAsync(
                                "UPDATE class_bookings SET subscription_id = NULL" + (isCounter ? ", status = 'pending'" : "") + " WHERE user_id = {0} AND class_id = {1}",
                                userId, id);
                        }
                        else if (isCounter)
                        {
                            await db.Database.ExecuteSqlRawAsync(
                                "UPDATE class_bookings SET status = 'pending' WHERE user_id = {0} AND class_id = {1}",
                                userId, id);
                        }
                    }
                    catch { }

                    var invoice = new Invoice
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        ClassId = pricing.RootId,
                        TotalAmount = amount,
                        PaymentMethod = method.ToLower() switch
                        {
                            "card" or "creditcard" or "credit_card" => PaymentMethod.CreditCard,
                            "counter" or "cashatcounter" => PaymentMethod.CashAtCounter,
                            "wallet" or "ewallet" => PaymentMethod.EWallet,
                            "bank_transfer" or "banktransfer" => PaymentMethod.BankTransfer,
                            _ => PaymentMethod.QRCode
                        },
                        Status = isCounter ? PaymentStatus.Pending : PaymentStatus.Completed,
                        PaidAt = isCounter ? null : DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    };
                    await db.Invoices.AddAsync(invoice);
                    await db.SaveChangesAsync();

                    ClassDetailResponse? classDetail = null;
                    try
                    {
                        classDetail = await service.GetClassDetailAsync(id);
                    }
                    catch { }

                    return Results.Ok(new
                    {
                        success = true,
                        isCounter = isCounter,
                        paymentStatus = isCounter ? "pending" : "completed",
                        message = isCounter
                            ? "Đã đặt giữ chỗ thành công! Vui lòng thanh toán tại quầy lễ tân trước giờ học."
                            : "Thanh toán với giá gốc và đặt lịch thành công!",
                        invoiceId = invoice.Id,
                        amount = amount,
                        classInfo = classDetail,
                        newBalance = updatedWalletBalance
                    });
                }
                catch (Exception ex)
                {
                    if (deductedFromWallet)
                    {
                        try
                        {
                            await MemberEndpoints.RefundToWalletAsync(db, userId, amount, "Hoàn tiền ví do lỗi hệ thống khi đặt lớp");
                        }
                        catch { }
                    }
                    return Results.Problem(detail: ex.Message, title: "Lỗi hệ thống khi đặt lớp học");
                }
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 3. Cancel Booking
        /// <summary>
        /// POST /api/classes/{id}/cancel-booking
        /// Hủy lượt đặt chỗ của hội viên đối với một lớp học.
        /// Tự động hoàn tiền vào Ví hội viên nếu đơn đặt chỗ đã thanh toán thành công.
        /// Quyền hạn yêu cầu: Member, Admin hoặc Manager.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/cancel-booking",
            async (Guid id, HttpContext context, ClassService service, SmartGymDbContext db) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                return await ProcessCancelBookingInternalAsync(id, userId, isStaffAction: false, service, db);
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 3.1 Cancel Booking For Member (Staff/Receptionist Action)
        /// <summary>
        /// POST /api/classes/{id}/cancel-for-member
        /// Nhân viên lễ tân hoặc quản lý hủy lịch đặt lớp hộ cho một hội viên tại quầy.
        /// Quyền hạn yêu cầu: Receptionist, Manager, Staff hoặc Admin.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/cancel-for-member",
            async (Guid id, [FromBody] CancelForMemberRequest request, ClassService service, SmartGymDbContext db) =>
            {
                if (request == null || request.MemberId == Guid.Empty)
                    return Results.BadRequest(new { message = "Vui lòng chọn hội viên cần hủy lịch." });

                return await ProcessCancelBookingInternalAsync(id, request.MemberId, isStaffAction: true, service, db);
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("receptionist", "admin", "manager", "staff"));

        // 4. Receptionist / Manager Book For Member
        /// <summary>
        /// POST /api/classes/{id}/book-for-member
        /// Nhân viên lễ tân hoặc Quản lý đặt chỗ lớp học hộ cho một hội viên tại quầy.
        /// Quyền hạn yêu cầu: Manager, Receptionist hoặc Admin.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/book-for-member",
            async (Guid id, [FromBody] BookForMemberRequest request, ClassService service) =>
            {
                if (request == null || request.MemberId == Guid.Empty)
                    return Results.BadRequest(new { message = "Vui lòng chọn hội viên cần đặt lớp." });

                var (isSuccess, errorMessage) = await service.BookClassAsync(request.MemberId, id);
                if (!isSuccess)
                {
                    return Results.BadRequest(new { message = errorMessage });
                }

                ClassDetailResponse? classDetail = null;
                try
                {
                    classDetail = await service.GetClassDetailAsync(id);
                }
                catch { }

                return Results.Ok(new 
                { 
                    message = "Đặt lớp thành công cho hội viên.",
                    classInfo = classDetail
                });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("receptionist", "admin", "manager", "staff"));
    }

    private static async Task<IResult> ProcessCancelBookingInternalAsync(
        Guid classId,
        Guid targetUserId,
        bool isStaffAction,
        ClassService service,
        SmartGymDbContext db)
    {
        ClassDetailResponse? classDetail = null;
        try
        {
            classDetail = await service.GetClassDetailAsync(classId);
        }
        catch { }

        // Kiểm tra thông tin đặt chỗ trước khi hủy
        CancelBookingInfoRaw? bookingRow = null;
        try
        {
            bookingRow = await db.Database
                .SqlQueryRaw<CancelBookingInfoRaw>(
                    """
                    SELECT id AS "Id", user_id AS "UserId", class_id AS "ClassId",
                           COALESCE(status, '') AS "Status",
                           COALESCE(created_at, now()) AS "CreatedAt",
                           subscription_id AS "SubscriptionId"
                    FROM class_bookings
                    WHERE user_id = {0} AND class_id = {1}
                    """,
                    targetUserId, classId)
                .FirstOrDefaultAsync();
        }
        catch { }

        var (isSuccess, isLate, errorMessage) = await service.CancelBookingAsync(targetUserId, classId);
        if (!isSuccess)
            return Results.BadRequest(new { message = errorMessage });

        // Phân loại hình thức đặt chỗ:
        var bookingTime = bookingRow?.CreatedAt ?? DateTime.UtcNow;

        // Tìm hóa đơn liên quan trực tiếp tới lượt đặt lớp này (trong vòng +-5 phút khi đặt)
        Invoice? bookingInvoice = null;
        try
        {
            bookingInvoice = await db.Invoices
                .Where(i => i.UserId == targetUserId 
                         && i.CreatedAt >= bookingTime.AddMinutes(-5)
                         && i.CreatedAt <= bookingTime.AddMinutes(5))
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync();
        }
        catch { }

        // 1. Lượt đặt không phát sinh thanh toán:
        // - bookingRow.SubscriptionId có giá trị
        // - hoặc hóa đơn ghi nhận số tiền thanh toán = 0 đ (TotalAmount <= 0)
        // - hoặc không có hóa đơn thanh toán nào trong hệ thống
        var isFreeBooking = (bookingRow?.SubscriptionId.HasValue == true)
            || (bookingInvoice != null && bookingInvoice.TotalAmount <= 0)
            || bookingInvoice == null;

        // 2. Đặt vé lẻ trả sau tại quầy (pending): Chưa thanh toán tiền
        var wasCounterPending = (bookingRow != null &&
            string.Equals(bookingRow.Status, "pending", StringComparison.OrdinalIgnoreCase))
            || (bookingInvoice != null && bookingInvoice.PaymentMethod == PaymentMethod.CashAtCounter && bookingInvoice.Status == PaymentStatus.Pending);

        decimal refundAmount = 0m;
        bool isRefunded = false;
        decimal updatedBalance = 0m;

        // Hoàn tiền vào ví CHỈ KHI:
        // - ĐÃ THANH TOÁN TIỀN THỰC TẾ: bookingInvoice != null && bookingInvoice.TotalAmount > 0 && bookingInvoice.Status == PaymentStatus.Completed
        // - KHÔNG PHẢI MIỄN PHÍ: !isFreeBooking
        // - KHÔNG PHẢI TRẢ SAU TẠI QUẦY: !wasCounterPending
        // - HỦY TRƯỚC GIỜ HỌC TRÊN 2 TIẾNG HOẶC DO NHÂN VIÊN LỄ TÂN HỦY HỘ: (!isLate || isStaffAction)
        bool shouldRefund = !isFreeBooking && !wasCounterPending && (!isLate || isStaffAction)
            && bookingInvoice != null && bookingInvoice.TotalAmount > 0 && bookingInvoice.Status == PaymentStatus.Completed;

        if (shouldRefund && bookingInvoice != null)
        {
            refundAmount = bookingInvoice.TotalAmount;
            if (refundAmount > 0)
            {
                var className = classDetail?.ClassName ?? "lớp học";
                var (refundSuccess, newBal, _) = await MemberEndpoints.RefundToWalletAsync(
                    db,
                    targetUserId,
                    refundAmount,
                    $"Hoàn tiền hủy đặt lớp: {className}" + (isStaffAction ? " (Lễ tân hủy hộ)" : "")
                );
                if (refundSuccess)
                {
                    isRefunded = true;
                    updatedBalance = newBal;
                    bookingInvoice.Status = PaymentStatus.Refunded;
                    await db.SaveChangesAsync();
                }
            }
        }

        var targetClassName = classDetail?.ClassName ?? "lớp học";
        string message;
        if (isStaffAction)
        {
            if (isRefunded)
            {
                message = $"Đã hủy lịch tập lớp \"{targetClassName}\" hộ học viên thành công! Số tiền {refundAmount:N0} đ đã được hoàn lại vào Ví học viên.";
            }
            else if (isFreeBooking || bookingInvoice == null || bookingInvoice.TotalAmount <= 0)
            {
                message = $"Đã hủy lịch tập lớp \"{targetClassName}\" hộ học viên thành công! Suất tập gói môn của học viên đã được giải phóng.";
            }
            else if (wasCounterPending)
            {
                message = $"Đã hủy lịch giữ chỗ lớp \"{targetClassName}\" hộ học viên thành công (Chưa thanh toán tại quầy).";
            }
            else
            {
                message = $"Đã hủy lịch tập lớp \"{targetClassName}\" hộ học viên thành công.";
            }
        }
        else
        {
            if (isRefunded)
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Số tiền {refundAmount:N0} đ đã được hoàn lại vào Ví hội viên của bạn!";
            }
            else if (isFreeBooking || bookingInvoice == null || bookingInvoice.TotalAmount <= 0)
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Suất tập thuộc gói môn của bạn đã được giải phóng để bạn có thể đặt lịch tập khác!";
            }
            else if (isLate && !wasCounterPending)
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Chỗ học đã được giải phóng (Hủy muộn trong vòng 2 tiếng trước giờ học nên không hoàn tiền ví theo quy định).";
            }
            else if (wasCounterPending)
            {
                message = $"Đã hủy lịch giữ chỗ lớp \"{targetClassName}\" thành công (Chưa thanh toán tại quầy).";
            }
            else
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công.";
            }
        }

        return Results.Ok(new
        {
            success = true,
            message = message,
            refunded = isRefunded,
            refundAmount = isRefunded ? refundAmount : 0m,
            newBalance = updatedBalance
        });
    }
}

public record CancelForMemberRequest(Guid MemberId);
public record PayAndBookClassRequest(string? PaymentMethod = "qr", decimal Amount = 150000);

public sealed class ClassPriceSnapshotRaw
{
    public Guid RootId { get; set; }
    public Guid SportId { get; set; }
    public int TotalSessions { get; set; }
    public Guid? PricingVersionId { get; set; }
    public decimal? PricePerSession { get; set; }
}

public class CancelBookingInfoRaw
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? SubscriptionId { get; set; }
}
