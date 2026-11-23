using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.ClassScheduling;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class SportClassPricingEndpoints
{
    public static void MapSportClassPricingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/class-pricing").WithTags("Class Pricing");

        group.MapGet("/", async (SmartGymDbContext db) =>
        {
            var rows = await db.Database.SqlQueryRaw<PricingListRow>("""
                SELECT p.sport_id AS "SportId", s.name AS "SportName", p.price_per_session AS "PricePerSession",
                       p.effective_from AS "EffectiveFrom", p.effective_to AS "EffectiveTo", p.is_active AS "IsActive"
                FROM sport_class_pricing p
                INNER JOIN sports s ON s.id = p.sport_id
                ORDER BY s.name, p.effective_from DESC
                """).ToListAsync();
            return Results.Ok(rows.Select(row => new SportClassPricingResponse(
                row.SportId, row.SportName, row.PricePerSession, row.EffectiveFrom, row.EffectiveTo, row.IsActive)));
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        group.MapGet("/{sportId:guid}/quote", async (Guid sportId, int totalSessions, SmartGymDbContext db) =>
        {
            if (totalSessions is < 1 or > 120)
                return Results.BadRequest(new { message = "Tổng số buổi phải từ 1 đến 120." });

            var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            var price = await FindActivePriceAsync(db, sportId, today);
            return price == null
                ? Results.NotFound(new { message = "Bộ môn chưa có bảng giá hiệu lực." })
                : Results.Ok(new ClassCoursePriceQuote(sportId, price.Value, totalSessions, price.Value * totalSessions));
        }).RequireAuthorization(policy => policy.RequireRole("coach", "manager", "admin"));

        group.MapPut("/{sportId:guid}", async (Guid sportId, UpsertSportClassPricingRequest request, HttpContext context, SmartGymDbContext db) =>
        {
            if (request.PricePerSession < 0)
                return Results.BadRequest(new { message = "Đơn giá mỗi buổi không được âm." });
            var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            if (request.EffectiveFrom < today)
                return Results.BadRequest(new { message = "Ngày hiệu lực không được ở quá khứ." });
            if (!Guid.TryParse(context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? context.User.FindFirst("sub")?.Value, out var actorId))
                return Results.Unauthorized();

            var sportExists = await db.Database.SqlQueryRaw<int>("SELECT 1 AS \"Value\" FROM sports WHERE id = {0}", sportId).AnyAsync();
            if (!sportExists)
                return Results.NotFound(new { message = "Không tìm thấy bộ môn." });

            await using var transaction = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                UPDATE sport_class_pricing
                SET effective_to = {request.EffectiveFrom.AddDays(-1)}, updated_at = now()
                WHERE sport_id = {sportId}
                  AND is_active = TRUE
                  AND effective_from < {request.EffectiveFrom}
                  AND (effective_to IS NULL OR effective_to >= {request.EffectiveFrom})
                """);
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO sport_class_pricing (id, sport_id, price_per_session, effective_from, is_active, created_by)
                VALUES ({Guid.NewGuid()}, {sportId}, {request.PricePerSession}, {request.EffectiveFrom}, TRUE, {actorId})
                """);
            await transaction.CommitAsync();

            return Results.Ok(new { message = "Đã lưu phiên bản giá mới. Các khóa chưa có lượt đăng ký sẽ dùng giá đang hiệu lực; giá của khóa đã có lượt đăng ký được giữ nguyên." });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
    }

    private static async Task<decimal?> FindActivePriceAsync(SmartGymDbContext db, Guid sportId, DateOnly onDate)
    {
        var rows = await db.Database.SqlQueryRaw<PriceRow>("""
            SELECT price_per_session AS "PricePerSession"
            FROM sport_class_pricing
            WHERE sport_id = {0} AND is_active = TRUE AND effective_from <= {1}
              AND (effective_to IS NULL OR effective_to >= {1})
            ORDER BY effective_from DESC, created_at DESC
            LIMIT 1
            """, sportId, onDate).ToListAsync();
        return rows.SingleOrDefault()?.PricePerSession;
    }

    private sealed class PriceRow { public decimal PricePerSession { get; set; } }
    private sealed class PricingListRow
    {
        public Guid SportId { get; set; }
        public string SportName { get; set; } = string.Empty;
        public decimal PricePerSession { get; set; }
        public DateOnly EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public bool IsActive { get; set; }
    }
}
