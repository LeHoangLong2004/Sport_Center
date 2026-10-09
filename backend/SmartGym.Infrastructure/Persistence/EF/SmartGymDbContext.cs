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
    public DbSet<Package> Packages { get; set; } = null!;
    public DbSet<PackageFeature> PackageFeatures { get; set; } = null!;
    public DbSet<MembershipBenefit> MembershipBenefits { get; set; } = null!;
    public DbSet<Subscription> Subscriptions { get; set; } = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;

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
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").IsRequired();
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
            entity.Property(e => e.StartDate).HasColumnName("start_date").IsRequired();
            entity.Property(e => e.EndDate).HasColumnName("end_date").IsRequired();
            entity.Property(e => e.AutoRenew).HasColumnName("auto_renew").HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

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
    }
}
