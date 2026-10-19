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

public static partial class ClassEndpoints
{
    private static void MapClassBookingEndpoints(RouteGroupBuilder classGroup)
    {
        // 1. Standard Book Class (Membership slot)
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
        classGroup.MapPost(
            "/{id:guid}/pay-and-book",
            async (Guid id, [FromBody] PayAndBookClassRequest? request, HttpContext context, ClassService service, SmartGymDbContext db) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                var method = request?.PaymentMethod ?? "qr";
                var amount = request?.Amount ?? 150000m;

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
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 3. Cancel Booking
        classGroup.MapPost(
            "/{id:guid}/cancel-booking",
            async (Guid id, HttpContext context, ClassService service) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                var (isSuccess, errorMessage) = await service.CancelBookingAsync(userId, id);
                return isSuccess
                    ? Results.Ok(new { message = "Hủy đặt lớp thành công." })
                    : Results.BadRequest(new { message = errorMessage });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));
    }
}

public record PayAndBookClassRequest(string? PaymentMethod = "qr", decimal Amount = 150000);
