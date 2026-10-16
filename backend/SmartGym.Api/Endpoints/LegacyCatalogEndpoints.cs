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

app.MapSportFacilityEndpoints();

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
