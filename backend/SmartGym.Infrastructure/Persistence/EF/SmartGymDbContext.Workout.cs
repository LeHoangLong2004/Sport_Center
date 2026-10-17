using Microsoft.EntityFrameworkCore;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.EF;

public partial class SmartGymDbContext
{
    private static void ConfigureWorkoutAndReviewEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WorkoutPlan>(entity =>
        {
            entity.ToTable("workout_plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CoachId).HasColumnName("coach_id");
            entity.Property(e => e.SportId).HasColumnName("sport_id");
            entity.Property(e => e.PlanName).HasColumnName("plan_name").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Goal).HasColumnName("goal");
            entity.Property(e => e.Level).HasColumnName("level");
            entity.Property(e => e.DurationMinutes).HasColumnName("duration_minutes");
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("Nháp");
            entity.Property(e => e.Version).HasColumnName("version").HasDefaultValue(1);
            entity
                .Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()");
            entity
                .Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<WorkoutPlanExercise>(entity =>
        {
            entity.ToTable("workout_plan_exercises");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.PlanId).HasColumnName("plan_id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.Reps).HasColumnName("reps");
            entity.Property(e => e.Rest).HasColumnName("rest");
            entity.Property(e => e.Note).HasColumnName("note");

            entity
                .HasOne(d => d.Plan)
                .WithMany(p => p.Exercises)
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HomeworkProgress>(entity =>
        {
            entity.ToTable("homework_progress");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.MemberId).HasColumnName("member_id");
            entity.Property(e => e.PlanId).HasColumnName("plan_id");
            entity.Property(e => e.AssignedBy).HasColumnName("assigned_by");
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("assigned");
            entity.Property(e => e.ProgressPct).HasColumnName("progress_pct").HasDefaultValue(0m);
            entity.Property(e => e.AssignedDate).HasColumnName("assigned_date");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity
                .Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()");

            entity
                .HasOne(d => d.Member)
                .WithMany()
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(d => d.Plan)
                .WithMany()
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("reviews");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            // The running Supabase schema names this relation user_id. Keep the
            // domain property as MemberId while mapping it to the real column.
            entity.Property(e => e.MemberId).HasColumnName("user_id");
            entity.Property(e => e.CoachId).HasColumnName("coach_id");
            entity.Property(e => e.Rating).HasColumnName("rating").IsRequired();
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.SessionName).HasColumnName("session_name");
            entity.Property(e => e.TagsJson).HasColumnName("tags_json");
            entity
                .Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()");

            entity
                .HasOne(d => d.Member)
                .WithMany()
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
