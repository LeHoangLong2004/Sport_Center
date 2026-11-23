namespace SmartGym.Domain.Entities;

public sealed record FacilitySchedulingSettings(
    bool AllowConcurrentClasses,
    int MaxConcurrentClasses,
    int? TotalCapacity
);
