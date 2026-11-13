using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Đăng ký gói tập cá nhân (Member Subscriptions).
/// Hỗ trợ: Xem các gói hội viên đang đăng ký (active/expired), đăng ký gói tập mới.
/// Yêu cầu xác thực JWT cho toàn bộ các route.
/// </summary>
public static class SubscriptionEndpoints
{
    /// <summary>
    /// Đăng ký các route đăng ký gói tập vào hệ thống.
    /// Nhóm route gốc: /api/subscriptions
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapSubscriptionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/subscriptions").RequireAuthorization();

        /// <summary>
        /// GET /api/subscriptions/me
        /// Lấy toàn bộ danh sách các gói đăng ký tập luyện của hội viên đang đăng nhập.
        /// </summary>
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

        /// <summary>
        /// POST /api/subscriptions
        /// Đăng ký gói tập mới cho hội viên hiện tại.
        /// </summary>
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
    }
}
