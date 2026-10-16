using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

internal static class CoachProfileResolver
{
    public static Task<Guid?> FindByUserIdAsync(
        SmartGymDbContext db,
        Guid userId,
        bool activeOnly = false
    )
    {
        var whereClause = activeOnly
            ? "WHERE user_id = @userId AND status = TRUE"
            : "WHERE user_id = @userId";

        return ExecuteAsync(db, $"SELECT id FROM coaches {whereClause}", userId);
    }

    public static Task<Guid?> FindByIdOrUserIdAsync(SmartGymDbContext db, Guid identifier)
    {
        return ExecuteAsync(
            db,
            "SELECT id FROM coaches WHERE id = @userId OR user_id = @userId",
            identifier
        );
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
