using SmartGym.Domain.Enums;

namespace SmartGym.Domain.Entities;

public sealed class MemberPackage
{
    public MemberPackage(
        Guid id,
        Guid memberId,
        Guid planId,
        Guid assignedBranchId,
        DateTime startDate,
        DateTime endDate,
        int? remainingSessions,
        PackageStatus status,
        int freezeCount,
        int freezeDaysUsed,
        DateTime? frozenAt,
        bool autoRenew)
    {
        Id = id;
        MemberId = memberId;
        PlanId = planId;
        AssignedBranchId = assignedBranchId;
        StartDate = startDate;
        EndDate = endDate;
        RemainingSessions = remainingSessions;
        Status = status;
        FreezeCount = freezeCount;
        FreezeDaysUsed = freezeDaysUsed;
        FrozenAt = frozenAt;
        AutoRenew = autoRenew;
    }

    public Guid Id { get; }
    public Guid MemberId { get; }
    public Guid PlanId { get; }
    public Guid AssignedBranchId { get; }
    public DateTime StartDate { get; }
    public DateTime EndDate { get; }
    public int? RemainingSessions { get; private set; }
    public PackageStatus Status { get; private set; }
    public int FreezeCount { get; }
    public int FreezeDaysUsed { get; }
    public DateTime? FrozenAt { get; }
    public bool AutoRenew { get; }

    public void DeductSession()
    {
        if (RemainingSessions.HasValue && RemainingSessions > 0)
        {
            RemainingSessions--;
        }
    }

    public void RestoreSession()
    {
        if (RemainingSessions.HasValue)
        {
            RemainingSessions++;
        }
    }

    public void Expire() => Status = PackageStatus.Expired;
    public void Suspend() => Status = PackageStatus.Suspended;
}
