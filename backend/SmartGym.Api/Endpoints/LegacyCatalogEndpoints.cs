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
app.MapCoachScheduleRequestManagerEndpoints();
app.MapMemberEndpoints();

app.MapClassEndpoints();
app.MapBookingEndpoints();
app.MapCheckInEndpoints();
app.MapWorkoutPlanEndpoints();
app.MapHomeworkEndpoints();
app.MapReviewEndpoints();

app.MapSportFacilityEndpoints();

app.MapGet(
    "/api/sports/{sportId:guid}/coach-assignments",
    async (Guid sportId, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
    {
        await db.Database.OpenConnectionAsync();
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText =
            @"
        SELECT c.id, u.full_name, u.email, c.status,
               EXISTS (
                   SELECT 1 FROM coach_sports cs
                   WHERE cs.coach_id = c.id AND cs.sport_id = @sportId
               ) AS assigned
        FROM coaches c
        JOIN users u ON c.user_id = u.id
        WHERE c.status = TRUE
        ORDER BY u.full_name";

        var sportParameter = command.CreateParameter();
        sportParameter.ParameterName = "@sportId";
        sportParameter.Value = sportId;
        command.Parameters.Add(sportParameter);

        var assignments = new List<object>();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            assignments.Add(new
            {
                id = reader.GetGuid(0),
                fullName = reader.IsDBNull(1) ? "Coach chưa cập nhật tên" : reader.GetString(1),
                email = reader.IsDBNull(2) ? null : reader.GetString(2),
                isAssigned = !reader.IsDBNull(4) && reader.GetBoolean(4),
            });
        }

        return Results.Ok(assignments);
    }
).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapPost(
    "/api/sports/{sportId:guid}/coaches/{coachId:guid}",
    async (Guid sportId, Guid coachId, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
    {
        await db.Database.OpenConnectionAsync();
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText =
            @"
        INSERT INTO coach_sports (coach_id, sport_id)
        SELECT @coachId, @sportId
        WHERE EXISTS (SELECT 1 FROM coaches WHERE id = @coachId AND status = TRUE)
          AND EXISTS (SELECT 1 FROM sports WHERE id = @sportId)
        ON CONFLICT DO NOTHING";

        var coachParameter = command.CreateParameter();
        coachParameter.ParameterName = "@coachId";
        coachParameter.Value = coachId;
        command.Parameters.Add(coachParameter);

        var sportParameter = command.CreateParameter();
        sportParameter.ParameterName = "@sportId";
        sportParameter.Value = sportId;
        command.Parameters.Add(sportParameter);

        var affected = await command.ExecuteNonQueryAsync();
        return affected > 0
            ? Results.Ok(new { message = "Đã gán Coach cho bộ môn." })
            : Results.NotFound(new { message = "Không tìm thấy bộ môn hoặc Coach đang hoạt động." });
    }
).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapDelete(
    "/api/sports/{sportId:guid}/coaches/{coachId:guid}",
    async (Guid sportId, Guid coachId, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
    {
        await db.Database.OpenConnectionAsync();
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText =
            "DELETE FROM coach_sports WHERE coach_id = @coachId AND sport_id = @sportId";

        var coachParameter = command.CreateParameter();
        coachParameter.ParameterName = "@coachId";
        coachParameter.Value = coachId;
        command.Parameters.Add(coachParameter);

        var sportParameter = command.CreateParameter();
        sportParameter.ParameterName = "@sportId";
        sportParameter.Value = sportId;
        command.Parameters.Add(sportParameter);

        var affected = await command.ExecuteNonQueryAsync();
        return affected > 0
            ? Results.Ok(new { message = "Đã gỡ Coach khỏi bộ môn." })
            : Results.NotFound(new { message = "Coach chưa được gán cho bộ môn này." });
    }
).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapGet(
    "/api/coaches",
    async (Guid? sportId, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
    {
        var coaches = new List<object>();
        using var command = db.Database.GetDbConnection().CreateCommand();
        string sql =
            @"
        SELECT c.id, u.full_name, u.email, u.phone_number, u.avatar_url, c.specialty, c.bio, c.experience_years, c.rating 
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
            var fullName = reader.IsDBNull(1) ? "Huấn luyện viên" : reader.GetString(1);
            var coachId = reader.GetGuid(0);
            var dbAvatar = reader.IsDBNull(4) ? null : reader.GetString(4);
            var avatarUrl = SmartGym.Domain.Common.CoachAvatarHelper.GetRealCoachAvatar(fullName, dbAvatar, coachId);

            coaches.Add(
                new
                {
                    id = reader.GetGuid(0),
                    fullName = fullName,
                    email = reader.IsDBNull(2) ? null : reader.GetString(2),
                    phoneNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                    avatarUrl = avatarUrl,
                    specialty = reader.IsDBNull(5) ? "Huấn luyện viên Thể hình" : reader.GetString(5),
                    bio = reader.IsDBNull(6) ? "Huấn luyện viên chuyên nghiệp tại Sport Center." : reader.GetString(6),
                    experienceYears = reader.IsDBNull(7) ? (int?)null : reader.GetInt32(7),
                    rating = reader.IsDBNull(8) ? (decimal?)null : reader.GetDecimal(8),
                }
            );
        }

        return Results.Ok(coaches);
    }
);


    }
}
