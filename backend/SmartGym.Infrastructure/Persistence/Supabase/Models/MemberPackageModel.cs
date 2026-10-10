using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("member_packages")]
public class MemberPackageModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("member_id")]
    public Guid MemberId { get; set; }

    [Column("plan_id")]
    public Guid PlanId { get; set; }

    [Column("assigned_branch_id")]
    public Guid AssignedBranchId { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("remaining_sessions")]
    public int? RemainingSessions { get; set; }

    [Column("status")]
    public string Status { get; set; } = "";

    [Column("freeze_count")]
    public int FreezeCount { get; set; }

    [Column("freeze_days_used")]
    public int FreezeDaysUsed { get; set; }

    [Column("frozen_at")]
    public DateTime? FrozenAt { get; set; }

    [Column("auto_renew")]
    public bool AutoRenew { get; set; }

    public MemberPackage ToDomain()
    {
        return new MemberPackage(
            Id,
            MemberId,
            PlanId,
            AssignedBranchId,
            StartDate,
            EndDate,
            RemainingSessions,
            Enum.Parse<PackageStatus>(Status, true),
            FreezeCount,
            FreezeDaysUsed,
            FrozenAt,
            AutoRenew
        );
    }

    public static MemberPackageModel FromDomain(MemberPackage package)
    {
        return new MemberPackageModel
        {
            Id = package.Id,
            MemberId = package.MemberId,
            PlanId = package.PlanId,
            AssignedBranchId = package.AssignedBranchId,
            StartDate = package.StartDate,
            EndDate = package.EndDate,
            RemainingSessions = package.RemainingSessions,
            Status = package.Status.ToString().ToUpper(),
            FreezeCount = package.FreezeCount,
            FreezeDaysUsed = package.FreezeDaysUsed,
            FrozenAt = package.FrozenAt,
            AutoRenew = package.AutoRenew
        };
    }
}
