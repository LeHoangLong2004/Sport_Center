using SmartGym.Domain.Enums;

namespace SmartGym.Domain.Entities;

public sealed class PackagePlan
{
    public PackagePlan(
        Guid id,
        string planName,
        string description,
        decimal price,
        int durationDays,
        int? totalSessions,
        AccessHours accessHours,
        bool isAllAccess,
        bool isActive)
    {
        Id = id;
        PlanName = planName;
        Description = description;
        Price = price;
        DurationDays = durationDays;
        TotalSessions = totalSessions;
        AccessHours = accessHours;
        IsAllAccess = isAllAccess;
        IsActive = isActive;
    }

    public Guid Id { get; }
    public string PlanName { get; }
    public string Description { get; }
    public decimal Price { get; }
    public int DurationDays { get; }
    public int? TotalSessions { get; }
    public AccessHours AccessHours { get; }
    public bool IsAllAccess { get; }
    public bool IsActive { get; }
}
