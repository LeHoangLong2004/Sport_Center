using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Services;

namespace SmartGym.Api.Endpoints;

public static class LegacyCatalogEndpoints
{
    public static void MapLegacyCatalogEndpoints(this WebApplication app)
    {
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapPackageEndpoints();
app.MapSubscriptionEndpoints();
app.MapPackageCatalogEndpoints();
app.MapPaymentEndpoints();
app.MapCoachEndpoints();
app.MapMemberEndpoints();

app.MapClassEndpoints();
app.MapBookingEndpoints();
app.MapCheckInEndpoints();
app.MapWorkoutPlanEndpoints();
app.MapHomeworkEndpoints();
app.MapReviewEndpoints();

app.MapGet(
    "/api/sports",
    async (Supabase.Client client) =>
    {
        var response = await client
            .From<SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel>()
            .Get();
        return Results.Ok(response.Models.Select(s => new { id = s.Id, name = s.Name }));
    }
);

app.MapPost(
        "/api/sports",
        async (
            SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel request,
            Supabase.Client client
        ) =>
        {
            request.Id = Guid.NewGuid();
            await client
                .From<SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel>()
                .Insert(request);
            return Results.Ok(new { id = request.Id, name = request.Name });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapGet(
    "/api/facilities",
    async (Supabase.Client client) =>
    {
        var response = await client
            .From<SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel>()
            .Get();
        return Results.Ok(response.Models.Select(f => new { id = f.Id, name = f.Name }));
    }
);

app.MapPost(
        "/api/facilities",
        async (
            SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel request,
            Supabase.Client client
        ) =>
        {
            request.Id = Guid.NewGuid();
            await client
                .From<SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel>()
                .Insert(request);
            return Results.Ok(new { id = request.Id, name = request.Name });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapGet(
    "/api/coaches",
    async (Guid? sportId, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
    {
        var coaches = new List<object>();
        using var command = db.Database.GetDbConnection().CreateCommand();
        string sql =
            @"
        SELECT c.id, u.full_name, u.email 
        FROM coaches c
        JOIN users u ON c.user_id = u.id";

        if (sportId.HasValue)
        {
            sql +=
                @"
        JOIN coach_sports cs ON c.id = cs.coach_id
        WHERE cs.sport_id = @sportId";

            var param = command.CreateParameter();
            param.ParameterName = "@sportId";
            param.Value = sportId.Value;
            command.Parameters.Add(param);
        }

        command.CommandText = sql;
        await db.Database.OpenConnectionAsync();
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            coaches.Add(
                new
                {
                    id = reader.GetGuid(0),
                    fullName = reader.IsDBNull(1) ? null : reader.GetString(1),
                    email = reader.IsDBNull(2) ? null : reader.GetString(2),
                }
            );
        }

        return Results.Ok(coaches);
    }
);


    }
}
