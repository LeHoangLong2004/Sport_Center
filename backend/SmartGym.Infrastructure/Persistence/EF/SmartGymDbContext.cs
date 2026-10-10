using Microsoft.EntityFrameworkCore;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Infrastructure.Persistence.EF;

public class SmartGymDbContext : DbContext
{
    public SmartGymDbContext(DbContextOptions<SmartGymDbContext> options)
        : base(options)
    {
    }

    private static PaymentStatus ParsePaymentStatus(string value) =>
        Enum.TryParse<PaymentStatus>(value, true, out var status) ? status : PaymentStatus.Pending;

    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<CoachProfile> CoachProfiles { get; set; } = null!;
    public DbSet<Package> Packages { get; set; } = null!;
    public DbSet<PackageFeature> PackageFeatures { get; set; } = null!;
    public DbSet<MembershipBenefit> MembershipBenefits { get; set; } = null!;
    public DbSet<Subscription> Subscriptions { get; set; } = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<BodyMetric> BodyMetrics { get; set; } = null!;
    public DbSet<WorkoutPlan> WorkoutPlans { get; set; } = null!;
    public DbSet<WorkoutPlanExercise> WorkoutPlanExercises { get; set; } = null!;
    public DbSet<HomeworkProgress> HomeworkProgresses { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Description).HasColumnName("description");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.FullName).HasColumnName("full_name").IsRequired();
            entity.Property(e => e.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20).IsRequired();
            entity.HasIndex(e => e.PhoneNumber).IsUnique();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired();
            entity.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Gender).HasColumnName("gender").HasMaxLength(20);
            entity.Property(e => e.EmergencyContact).HasColumnName("emergency_contact");
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

            entity.HasOne(d => d.Role)
                .WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CoachProfile>(entity =>
        {
            entity.ToTable("coach_profiles");
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Specialties).HasColumnName("specialties");
            entity.Property(e => e.Certifications).HasColumnName("certifications");
            entity.Property(e => e.ExperienceYears).HasColumnName("experience_years");
            entity.Property(e => e.Bio).HasColumnName("bio");

            entity.HasOne(d => d.User)
                .WithOne(p => p.CoachProfile)
                .HasForeignKey<CoachProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Package>(entity =>
        {
            entity.ToTable("packages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasMaxLength(50);
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.Tagline).HasColumnName("tagline");
            entity.Property(e => e.PackageType).HasColumnName("package_type").HasDefaultValue("sport");
            entity.Property(e => e.MonthlyPrice).HasColumnName("monthly_price");
            entity.Property(e => e.YearlyPrice).HasColumnName("yearly_price");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue(true);
            entity.Property(e => e.CatalogJson).HasColumnName("catalog_json").HasColumnType("jsonb");
        });

        modelBuilder.Entity<PackageFeature>(entity =>
        {
            entity.ToTable("package_features");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.PackageId).HasColumnName("package_id").IsRequired();
            entity.Property(e => e.FeatureText).HasColumnName("feature_text").IsRequired();
            entity.Property(e => e.IsHighlighted).HasColumnName("is_highlighted").HasDefaultValue(false);

            entity.HasOne(d => d.Package)
                .WithMany(p => p.Features)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MembershipBenefit>(entity =>
        {
            entity.ToTable("membership_benefits");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.PackageId).HasColumnName("package_id").IsRequired();
            entity.Property(e => e.BenefitType).HasColumnName("benefit_type").IsRequired();
            entity.Property(e => e.BenefitValue).HasColumnName("benefit_value");
            entity.Property(e => e.Description).HasColumnName("description").IsRequired();

            entity.HasOne(d => d.Package)
                .WithMany(p => p.Benefits)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.ToTable("subscriptions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.SportId).HasColumnName("sport_id");
            entity.Property(e => e.FacilityId).HasColumnName("facility_id");
            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");
            entity.Property(e => e.BillingPeriod).HasColumnName("billing_period");
            entity.Property(e => e.DurationMonths).HasColumnName("duration_months");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").IsRequired();
            entity.Property(e => e.DiscountPct).HasColumnName("discount_pct").HasDefaultValue(0m);
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasDefaultValue(0m);
            entity.Property(e => e.PackageSnapshotJson).HasColumnName("package_snapshot_json").HasColumnType("jsonb");
            entity.Property(e => e.PaymentMethod)
                            .HasColumnName("payment_method")
                            .HasConversion(
                                v => v.HasValue ? v.Value.ToDbValue() : null,
                                v => string.IsNullOrWhiteSpace(v) ? (PaymentMethod?)null : PaymentMethodExtensions.ParseDbValue(v));
                        entity.Property(e => e.PaymentStatus)
                            .HasColumnName("payment_status")
                            .HasConversion(
                                v => v.ToString().ToLower(),
                                v => ParsePaymentStatus(v)
                            )
                .HasDefaultValue(SmartGym.Domain.Enums.PaymentStatus.Pending);
            entity.Property(e => e.StartDate).HasColumnName("start_date").HasColumnType("date").IsRequired();
            entity.Property(e => e.EndDate).HasColumnName("end_date").HasColumnType("date").IsRequired();
            entity.Property(e => e.AutoRenew).HasColumnName("auto_renew").HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            entity.Property(e => e.PaidAt).HasColumnName("paid_at");

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Package)
                .WithMany()
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("invoices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.BranchId).HasColumnName("facility_id");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").IsRequired();
            entity.Property(e => e.PaymentMethod)
                            .HasColumnName("payment_method")
                            .HasConversion(
                                v => v.ToDbValue(),
                                v => PaymentMethodExtensions.ParseDbValue(v));
                        entity.Property(e => e.Status)
                            .HasColumnName("payment_status")
                            .HasConversion(
                                v => v.ToString().ToLower(),
                                v => ParsePaymentStatus(v)
                            )
                .HasDefaultValue(SmartGym.Domain.Enums.PaymentStatus.Pending);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            entity.Property(e => e.PaidAt).HasColumnName("paid_at");

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<BodyMetric>(entity =>
        {
            entity.ToTable("body_metrics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Weight).HasColumnName("weight");
            entity.Property(e => e.Height).HasColumnName("height");
            entity.Property(e => e.BodyFat).HasColumnName("body_fat");
            entity.Property(e => e.MuscleMass).HasColumnName("muscle_mass");
            entity.Property(e => e.Bmi).HasColumnName("bmi");
            entity.Property(e => e.RecordedAt).HasColumnName("recorded_at").HasDefaultValueSql("now()");

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

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
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
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

            entity.HasOne(d => d.Plan)
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
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

            entity.HasOne(d => d.Member)
                .WithMany()
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Plan)
                .WithMany()
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("reviews");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.MemberId).HasColumnName("member_id");
            entity.Property(e => e.CoachId).HasColumnName("coach_id");
            entity.Property(e => e.Rating).HasColumnName("rating").IsRequired();
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

            entity.HasOne(d => d.Member)
                .WithMany()
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
