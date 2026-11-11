using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Chỉ số cơ thể hội viên (Body Metrics / InBody).
/// Hỗ trợ: Ghi nhận chỉ số mới (Cân nặng, Chiều cao, Tỷ lệ mỡ, Cơ bắp, tự động tính BMI),
/// tra cứu lịch sử tiến độ của hội viên, làm nguồn dữ liệu đầu vào cho Flow 5 AI may đo giáo án.
/// </summary>
public static class BodyMetricEndpoints
{
    public static void MapBodyMetricEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/body-metrics").RequireAuthorization();

        /// <summary>
        /// GET /api/body-metrics/me
        /// Lấy toàn bộ lịch sử chỉ số cơ thể của hội viên đang đăng nhập.
        /// </summary>
        group.MapGet("/me", async (HttpContext context, SmartGymDbContext db) =>
        {
            var userIdString = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                return Results.Unauthorized();

            var metrics = await db.BodyMetrics.AsNoTracking()
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.RecordedAt)
                .Select(m => new
                {
                    m.Id,
                    m.UserId,
                    m.Weight,
                    m.Height,
                    m.BodyFat,
                    m.MuscleMass,
                    m.Bmi,
                    m.RecordedAt
                })
                .ToListAsync();

            return Results.Ok(metrics);
        }).WithTags("Body Metrics")
          .WithSummary("Lấy lịch sử chỉ số cơ thể của hội viên hiện tại");

        /// <summary>
        /// GET /api/body-metrics/member/{memberId}
        /// HLV hoặc Quản lý tra cứu chỉ số cơ thể của một học viên cụ thể.
        /// </summary>
        group.MapGet("/member/{memberId:guid}", async (Guid memberId, SmartGymDbContext db) =>
        {
            var metrics = await db.BodyMetrics.AsNoTracking()
                .Where(m => m.UserId == memberId)
                .OrderByDescending(m => m.RecordedAt)
                .Select(m => new
                {
                    m.Id,
                    m.UserId,
                    m.Weight,
                    m.Height,
                    m.BodyFat,
                    m.MuscleMass,
                    m.Bmi,
                    m.RecordedAt
                })
                .ToListAsync();

            return Results.Ok(metrics);
        }).WithTags("Body Metrics")
          .WithSummary("HLV/Admin xem chỉ số cơ thể của học viên");

        /// <summary>
        /// POST /api/body-metrics
        /// Thêm mới một bản ghi chỉ số cơ thể InBody cho hội viên.
        /// Tự động tính toán BMI = Weight / (Height/100)^2 nếu chưa có.
        /// </summary>
        group.MapPost("/", async (
            HttpContext context,
            [FromBody] CreateBodyMetricDto request,
            SmartGymDbContext db) =>
        {
            var userIdString = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var currentUserId))
                return Results.Unauthorized();

            // Nếu người gọi là Coach/Admin thì cho phép truyền UserId của học viên, nếu không thì lấy chính hội viên đăng nhập
            var targetUserId = request.UserId.HasValue && request.UserId.Value != Guid.Empty
                ? request.UserId.Value
                : currentUserId;

            decimal? computedBmi = request.Bmi;
            if ((computedBmi == null || computedBmi == 0) && request.Weight.HasValue && request.Height.HasValue && request.Height.Value > 0)
            {
                var heightInMeters = request.Height.Value / 100m;
                computedBmi = Math.Round(request.Weight.Value / (heightInMeters * heightInMeters), 2);
            }

            var metric = new BodyMetric
            {
                Id = Guid.NewGuid(),
                UserId = targetUserId,
                Weight = request.Weight,
                Height = request.Height,
                BodyFat = request.BodyFat,
                MuscleMass = request.MuscleMass,
                Bmi = computedBmi,
                RecordedAt = request.RecordedAt ?? DateTime.UtcNow
            };

            db.BodyMetrics.Add(metric);
            await db.SaveChangesAsync();

            return Results.Created($"/api/body-metrics/{metric.Id}", new
            {
                metric.Id,
                metric.UserId,
                metric.Weight,
                metric.Height,
                metric.BodyFat,
                metric.MuscleMass,
                metric.Bmi,
                metric.RecordedAt
            });
        }).WithTags("Body Metrics")
          .WithSummary("Ghi nhận chỉ số cơ thể mới cho hội viên");
    }
}

public class CreateBodyMetricDto
{
    public Guid? UserId { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? BodyFat { get; set; }
    public decimal? MuscleMass { get; set; }
    public decimal? Bmi { get; set; }
    public DateTime? RecordedAt { get; set; }
}
