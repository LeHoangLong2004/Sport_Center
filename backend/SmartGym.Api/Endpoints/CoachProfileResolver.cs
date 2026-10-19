using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

internal static class CoachProfileResolver
{
    public static async Task<Guid?> FindByUserIdAsync(
        SmartGymDbContext db,
        Guid userId,
        bool activeOnly = false
    )
    {
        var whereClause = activeOnly
            ? "WHERE user_id = @userId AND status = TRUE"
            : "WHERE user_id = @userId";

        var coachId = await ExecuteAsync(db, $"SELECT id FROM coaches {whereClause}", userId);
        if (coachId != null)
        {
            return coachId;
        }

        return await AutoProvisionCoachAsync(db, userId);
    }

    public static async Task<Guid?> FindByIdOrUserIdAsync(SmartGymDbContext db, Guid identifier)
    {
        var coachId = await ExecuteAsync(
            db,
            "SELECT id FROM coaches WHERE id = @userId OR user_id = @userId",
            identifier
        );
        if (coachId != null)
        {
            return coachId;
        }

        return await AutoProvisionCoachAsync(db, identifier);
    }

    private static async Task<Guid?> AutoProvisionCoachAsync(SmartGymDbContext db, Guid userId)
    {
        try
        {
            var sql = @"
                INSERT INTO coaches (id, user_id, specialty, bio, experience_years, rating, status)
                SELECT u.id, u.id,
                       COALESCE(cp.specialties, 'Huấn luyện viên'),
                       COALESCE(cp.bio, 'Huấn luyện viên thể thao chuyên nghiệp'),
                       COALESCE(cp.experience_years, 1),
                       5.0,
                       TRUE
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN coach_profiles cp ON cp.user_id = u.id
                WHERE u.id = @userId AND (LOWER(r.name) IN ('coach', 'pt') OR cp.user_id IS NOT NULL)
                ON CONFLICT (user_id) DO UPDATE SET status = TRUE
                RETURNING id;
            ";

            var result = await ExecuteAsync(db, sql, userId);
            if (result != null) return result;
        }
        catch
        {
            try
            {
                var sqlFallback = @"
                    INSERT INTO coaches (id, user_id, specialty, bio, experience_years, rating, status)
                    SELECT u.id, u.id, 'Huấn luyện viên', 'Huấn luyện viên thể thao chuyên nghiệp', 1, 5.0, TRUE
                    FROM users u
                    JOIN roles r ON u.role_id = r.id
                    WHERE u.id = @userId AND LOWER(r.name) IN ('coach', 'pt')
                    ON CONFLICT (user_id) DO UPDATE SET status = TRUE
                    RETURNING id;
                ";
                var result = await ExecuteAsync(db, sqlFallback, userId);
                if (result != null) return result;
            }
            catch
            {
                // Fallback failed
            }
        }

        return null;
    }

    private static async Task<Guid?> ExecuteAsync(
        SmartGymDbContext db,
        string sql,
        Guid parameterValue
    )
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;

        if (shouldClose)
            await connection.OpenAsync();

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = sql;

            var parameter = command.CreateParameter();
            parameter.ParameterName = "@userId";
            parameter.Value = parameterValue;
            command.Parameters.Add(parameter);

            var value = await command.ExecuteScalarAsync();
            return value is Guid coachId ? coachId : null;
        }
        finally
        {
            if (shouldClose)
                await connection.CloseAsync();
        }
    }
}
