using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("package_plans")]
public class PackagePlanModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("plan_name")]
    public string PlanName { get; set; } = "";

    [Column("description")]
    public string Description { get; set; } = "";

    [Column("price")]
    public decimal Price { get; set; }

    [Column("duration_days")]
    public int DurationDays { get; set; }

    [Column("total_sessions")]
    public int? TotalSessions { get; set; }

    [Column("access_hours")]
    public string AccessHours { get; set; } = "";

    [Column("is_all_access")]
    public bool IsAllAccess { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }

    public PackagePlan ToDomain()
    {
        var accessHoursEnum = (AccessHours ?? "").ToUpper() == "ALL" ? Domain.Enums.AccessHours.All : Domain.Enums.AccessHours.OffPeak;

        return new PackagePlan(
            Id,
            PlanName,
            Description,
            Price,
            DurationDays,
            TotalSessions,
            accessHoursEnum,
            IsAllAccess,
            IsActive
        );
    }
}
