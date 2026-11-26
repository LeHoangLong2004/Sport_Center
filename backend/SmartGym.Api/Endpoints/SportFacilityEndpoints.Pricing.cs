using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class SportFacilityEndpoints
{
    private static void MapSportPricingEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sports/{sportId:guid}/pricing")
            .WithTags("Sports")
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        group.MapGet("", async (Guid sportId, SmartGymDbContext db) =>
        {
            var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            var prices = await db.Database.SqlQueryRaw<SportPriceRow>("""
                SELECT price_per_session AS "PricePerSession", effective_from AS "EffectiveFrom"
                FROM sport_class_pricing
                WHERE sport_id = {0} AND is_active = TRUE AND effective_from <= {1}
                  AND (effective_to IS NULL OR effective_to >= {1})
                ORDER BY effective_from DESC, created_at DESC
                LIMIT 1
                """, sportId, today).ToListAsync();
            var price = prices.FirstOrDefault();
            return Results.Ok(new
            {
                pricePerSession = price?.PricePerSession,
                effectiveFrom = price?.EffectiveFrom
            });
        });

        group.MapPut("", async (Guid sportId, SportPriceRequest request, SmartGymDbContext db) =>
        {
            if (request.PricePerSession <= 0)
                return Results.BadRequest(new { message = "Giá mỗi buổi phải lớn hơn 0." });

            var sportExists = await db.Database.SqlQueryRaw<Guid>(
                "SELECT id AS \"Value\" FROM sports WHERE id = {0} LIMIT 1", sportId).AnyAsync();
            if (!sportExists)
                return Results.NotFound(new { message = "Không tìm thấy bộ môn." });

            var effectiveDate = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO sport_class_pricing (sport_id, price_per_session, effective_from, effective_to, is_active)
                VALUES ({sportId}, {request.PricePerSession}, {effectiveDate}, NULL, TRUE)
                ON CONFLICT (sport_id, effective_from)
                DO UPDATE SET price_per_session = EXCLUDED.price_per_session,
                              effective_to = NULL,
                              is_active = TRUE,
                              updated_at = now()
                """);

            return Results.Ok(new { pricePerSession = request.PricePerSession, effectiveFrom = effectiveDate });
        });
    }

    public sealed class SportPriceRow
    {
        public decimal PricePerSession { get; set; }
        public DateOnly EffectiveFrom { get; set; }
    }

    private sealed record SportPriceRequest(decimal PricePerSession);
}
