using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("subscriptions")]
public sealed class SubscriptionCheckInModel : BaseModel
{
    [PrimaryKey("id", false)] public Guid Id { get; set; }
    [Column("user_id")] public Guid UserId { get; set; }
    [Column("package_id")] public string? PackageId { get; set; }
    [Column("facility_id")] public Guid? FacilityId { get; set; }
    [Column("payment_status")] public string? PaymentStatus { get; set; }
    [Column("start_date")] public DateTime StartDate { get; set; }
    [Column("end_date")] public DateTime EndDate { get; set; }
}

[Table("packages")]
public sealed class CheckInPackageModel : BaseModel
{
    [PrimaryKey("id", false)] public string Id { get; set; } = "";
    [Column("name")] public string Name { get; set; } = "";
    [Column("monthly_price")] public decimal? MonthlyPrice { get; set; }
    [Column("status")] public bool Status { get; set; }
}
