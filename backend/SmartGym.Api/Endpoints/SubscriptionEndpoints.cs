using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public class RenewPackageRequest
{
    public string Action { get; set; } = "extend"; // "extend" | "upgrade"
    public string? PackageId { get; set; }
    public int DurationMonths { get; set; } = 1;
    public string PaymentMethod { get; set; } = "cash"; // "cash" | "vietqr" | "wallet"
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}

/// <summary>
/// Endpoint quản lý Đăng ký gói tập cá nhân (Member Subscriptions).
/// Hỗ trợ: Xem các gói hội viên đang đăng ký (active/expired), đăng ký gói tập mới, gia hạn tại quầy.
/// </summary>
public static class SubscriptionEndpoints
{
    public static void MapSubscriptionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/subscriptions").RequireAuthorization();

        group.MapGet(
            "/me",
            async (HttpContext context, ISubscriptionService subscriptionService) =>
            {
                var userIdString = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (
                    string.IsNullOrEmpty(userIdString)
                    || !Guid.TryParse(userIdString, out var userId)
                )
                    return Results.Unauthorized();

                var subscriptions = await subscriptionService.GetMySubscriptionsAsync(userId);
                return Results.Ok(subscriptions);
            }
        );

        var handleSubscription = async (
            HttpContext context,
            [FromBody] CreateSubscriptionRequest request,
            ISubscriptionService subscriptionService
        ) =>
        {
            try
            {
                var userIdString = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (
                    string.IsNullOrEmpty(userIdString)
                    || !Guid.TryParse(userIdString, out var userId)
                )
                    return Results.Unauthorized();

                var subscription = await subscriptionService.SubscribeToPackageAsync(
                    userId,
                    request
                );
                return Results.Created($"/api/subscriptions/{subscription.Id}", subscription);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        };

        group.MapPost("", handleSubscription);

        // ── Receptionist: Gia hạn & Nâng cấp gói tập cho hội viên tại quầy ──
        app.MapPost("/api/receptionist/members/{memberId:guid}/renew-package", async (
            Guid memberId,
            [FromBody] RenewPackageRequest request,
            SmartGymDbContext db) =>
        {
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == memberId);
            if (user == null)
            {
                return Results.NotFound(new { message = "Không tìm thấy hội viên này trong hệ thống." });
            }

            var today = DateTime.UtcNow.Date;
            var months = request.DurationMonths > 0 ? request.DurationMonths : 1;

            // 1. Tìm gói tập hiện tại của user
            var currentSub = await db.Subscriptions
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync(s => s.UserId == memberId);

            DateTime newEndDate;
            string targetPackageId;

            if (request.Action == "upgrade" && !string.IsNullOrWhiteSpace(request.PackageId))
            {
                targetPackageId = request.PackageId;
                // Nâng cấp: tính từ hôm nay + số tháng
                newEndDate = today.AddMonths(months);
            }
            else
            {
                targetPackageId = currentSub?.PackageId ?? request.PackageId ?? "yoga_pack";
                // Gia hạn: nếu hạn cũ còn hiệu lực thì cộng dồn sau hạn cũ; nếu hết hạn thì cộng từ hôm nay
                if (currentSub != null && currentSub.EndDate >= today)
                {
                    newEndDate = currentSub.EndDate.AddMonths(months);
                }
                else
                {
                    newEndDate = today.AddMonths(months);
                }
            }

            // Lấy tên gói tập
            var pkgName = await db.Packages
                .Where(p => p.Id == targetPackageId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync() ?? "Gói tập";

            if (currentSub != null)
            {
                currentSub.EndDate = newEndDate;
                currentSub.PackageId = targetPackageId;
                currentSub.TotalAmount += request.Amount;
                currentSub.PaymentStatus = SmartGym.Domain.Enums.PaymentStatus.Completed;
                db.Subscriptions.Update(currentSub);
            }
            else
            {
                var newSub = new SmartGym.Domain.Entities.Subscription
                {
                    Id = Guid.NewGuid(),
                    UserId = memberId,
                    PackageId = targetPackageId,
                    StartDate = today,
                    EndDate = newEndDate,
                    TotalAmount = request.Amount,
                    PaymentStatus = SmartGym.Domain.Enums.PaymentStatus.Completed,
                    DurationMonths = months,
                    AutoRenew = false
                };
                db.Subscriptions.Add(newSub);
            }

            // Ghi nhận hóa đơn tại quầy
            var invoiceId = Guid.NewGuid();
            try
            {
                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO invoices (
                        id, user_id, total_amount, payment_method, payment_status, paid_at, created_at, fulfillment_status
                    )
                    VALUES (
                        {invoiceId}, {memberId}, {request.Amount}, {request.PaymentMethod}, 'completed', now(), now(), 'completed'
                    );
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Renew Invoice Log Error]: {ex.Message}");
            }

            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                success = true,
                message = $"Đã gia hạn thành công gói '{pkgName}' đến ngày {newEndDate:dd/MM/yyyy}!",
                newEndDate = newEndDate.ToString("yyyy-MM-dd"),
                newPackageId = targetPackageId,
                packageName = pkgName,
                totalAmount = request.Amount,
                invoiceId = invoiceId
            });
        })
        .WithTags("Receptionist Portal")
        .WithSummary("Lễ tân gia hạn hoặc nâng cấp gói tập cho hội viên");
    }
}
