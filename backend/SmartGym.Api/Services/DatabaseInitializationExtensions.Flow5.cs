using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api;

public static partial class DatabaseInitializationExtensions
{
    /// <summary>
    /// Adds Flow 5 lifecycle columns to existing workout-plan tables without creating
    /// a new table. Every statement is idempotent for local restarts and old databases.
    /// </summary>
    private static void InitializeFlow5WorkoutPlanSchema(
        WebApplication app,
        SmartGymDbContext db)
    {
        try
        {
            db.Database.ExecuteSqlRaw(
                @"
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS parent_plan_id UUID;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS recommendation_target_type TEXT;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS recommendation_target_id UUID;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS ai_metadata_json TEXT;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS approved_by UUID;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS approval_note TEXT;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
                ALTER TABLE workout_plans
                    ADD COLUMN IF NOT EXISTS archived_by UUID;
                ALTER TABLE workout_plan_exercises
                    ADD COLUMN IF NOT EXISTS sets TEXT;
                ALTER TABLE workout_plan_exercises
                    ADD COLUMN IF NOT EXISTS duration TEXT;
                ALTER TABLE workout_plan_exercises
                    ADD COLUMN IF NOT EXISTS exercise_order INTEGER NOT NULL DEFAULT 0;
                ALTER TABLE workout_plans
                    ALTER COLUMN status SET DEFAULT 'draft';
                UPDATE workout_plans
                    SET source = 'manual'
                    WHERE source IS NULL OR source = '';
                "
            );
            app.Logger.LogInformation("Flow 5 workout-plan lifecycle schema is ready.");
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "Flow 5 workout-plan schema sync failed.");
        }
    }
}
