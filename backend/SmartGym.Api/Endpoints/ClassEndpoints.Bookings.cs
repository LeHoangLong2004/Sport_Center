using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Phần mở rộng (partial) của ClassEndpoints chuyên xử lý nghiệp vụ Đặt chỗ lớp học (Class Booking).
/// Bao gồm: Đặt chỗ bằng số buổi trong gói, thanh toán trực tiếp/tại quầy, hủy đặt lớp và nhân viên đặt hộ.
/// </summary>
public static partial class ClassEndpoints
{
    /// <summary>
    /// Đăng ký các route đặt chỗ lớp học vào nhóm route của lớp học.
    /// </summary>
    /// <param name="classGroup">Nhóm route /api/classes</param>
    private static void MapClassBookingEndpoints(RouteGroupBuilder classGroup)
    {
        // 1. Standard Book Class (Membership slot)
        /// <summary>
        /// POST /api/classes/{id}/book
        /// Đặt chỗ tham gia lớp học bằng cách trừ số buổi trong gói tập hội viên.
        /// Quyền hạn yêu cầu: Member, Admin hoặc Manager.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/book",
            async (Guid id, HttpContext context, ClassService service) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
                if (!isSuccess)
                {
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

                ClassDetailResponse? classDetail = null;
                try
                {
                    classDetail = await service.GetClassDetailAsync(id);
                }
                catch { }

                return Results.Ok(new 
                { 
                    message = "Đặt lớp thành công.",
                    classInfo = classDetail
                });
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
                var amount = request?.Amount ?? 150000m;
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
                    if (isWallet)
                    {
                        var (deductOk, _, deductErr) = await MemberEndpoints.DeductFromWalletAsync(
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
                    }

                    var isCounter = method.ToLower() is "counter" or "cashatcounter";
                    if (isCounter)
                    {
                        try
                        {
                            await db.Database.ExecuteSqlRawAsync(
                                "UPDATE class_bookings SET status = 'pending' WHERE user_id = {0} AND class_id = {1}",
                                userId, id);
                        }
                        catch { }
                    }

                    var invoice = new Invoice
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
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
                        classInfo = classDetail
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

                ClassDetailResponse? classDetail = null;
                try
                {
                    classDetail = await service.GetClassDetailAsync(id);
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
                            userId, id)
                        .FirstOrDefaultAsync();
                }
                catch { }

                var (isSuccess, isLate, errorMessage) = await service.CancelBookingAsync(userId, id);
                if (!isSuccess)
                    return Results.BadRequest(new { message = errorMessage });

                // Phân loại hình thức đặt chỗ:
                // 1. Đặt theo gói môn / gói tập (SubscriptionId != null): Suất đặt 0 đ theo gói, không có tiền mặt cần hoàn
                var isUnderSubscription = bookingRow?.SubscriptionId.HasValue == true;

                // 2. Đặt vé lẻ trả sau tại quầy (pending): Chưa thanh toán tiền
                var wasCounterPending = bookingRow != null &&
                    string.Equals(bookingRow.Status, "pending", StringComparison.OrdinalIgnoreCase);

                decimal refundAmount = 0m;
                bool isRefunded = false;
                decimal updatedBalance = 0m;

                // Hoàn tiền vào ví CHỈ KHI:
                // - Đặt vé lẻ ngoài gói (không phải theo gói môn)
                // - Đã thanh toán tiền (không phải trả sau tại quầy)
                // - Hủy hợp lệ trước giờ học từ 2 tiếng trở lên (!isLate)
                bool shouldRefund = !isUnderSubscription && !wasCounterPending && !isLate;

                if (shouldRefund)
                {
                    refundAmount = 150000m;
                    try
                    {
                        var bookingTime = bookingRow?.CreatedAt ?? DateTime.UtcNow;
                        // Tìm hóa đơn vé lẻ tương ứng (chỉ lấy hóa đơn <= 150.000 đ tạo cùng thời điểm đặt, TUYỆT ĐỐI không lấy nhầm hóa đơn gói tập lớn)
                        var paidInvoice = await db.Invoices
                            .Where(i => i.UserId == userId 
                                     && i.Status == PaymentStatus.Completed
                                     && i.TotalAmount <= 150000m
                                     && i.CreatedAt >= bookingTime.AddMinutes(-10) 
                                     && i.CreatedAt <= bookingTime.AddMinutes(10))
                            .OrderByDescending(i => i.CreatedAt)
                            .FirstOrDefaultAsync();

                        if (paidInvoice != null && paidInvoice.TotalAmount > 0)
                        {
                            refundAmount = paidInvoice.TotalAmount;
                        }
                        else
                        {
                            // Nếu không tìm thấy hóa đơn rời, kiểm tra xem có được hưởng giảm giá hạng thành viên không
                            var activeSub = await db.Subscriptions
                                .Where(s => s.UserId == userId && s.PaymentStatus == PaymentStatus.Completed && s.StartDate <= bookingTime && s.EndDate >= bookingTime)
                                .ToListAsync();
                            if (activeSub.Any(s => (s.PackageSnapshotJson ?? "").Contains("premium", StringComparison.OrdinalIgnoreCase)))
                                refundAmount = 127500m;
                            else if (activeSub.Any(s => (s.PackageSnapshotJson ?? "").Contains("plus", StringComparison.OrdinalIgnoreCase)))
                                refundAmount = 138000m;
                        }
                    }
                    catch { }

                    if (refundAmount > 0)
                    {
                        var className = classDetail?.ClassName ?? "lớp học";
                        var (refundSuccess, newBal, _) = await MemberEndpoints.RefundToWalletAsync(
                            db,
                            userId,
                            refundAmount,
                            $"Hoàn tiền hủy đặt lớp: {className}"
                        );
                        if (refundSuccess)
                        {
                            isRefunded = true;
                            updatedBalance = newBal;
                        }
                    }
                }

                var targetClassName = classDetail?.ClassName ?? "lớp học";
                string message;
                if (isUnderSubscription)
                {
                    message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Suất tập thuộc gói môn của bạn đã được giải phóng để bạn có thể đặt lịch tập khác!";
                }
                else if (isRefunded)
                {
                    message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Số tiền {refundAmount:N0} đ đã được hoàn lại vào Ví hội viên của bạn!";
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

                return Results.Ok(new
                {
                    success = true,
                    message = message,
                    refunded = isRefunded,
                    refundAmount = isRefunded ? refundAmount : 0m,
                    newBalance = updatedBalance
                });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

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
}

public record PayAndBookClassRequest(string? PaymentMethod = "qr", decimal Amount = 150000);

public class CancelBookingInfoRaw
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? SubscriptionId { get; set; }
}
