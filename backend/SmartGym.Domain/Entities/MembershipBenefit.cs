using System;

namespace SmartGym.Domain.Entities;

public class MembershipBenefit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PackageId { get; set; } = null!;
    public string BenefitType { get; set; } = null!; // e.g. 'pt_discount', 'priority_booking'
    public string? BenefitValue { get; set; }
    public string Description { get; set; } = null!;

    // Navigation
    public Package? Package { get; set; }
}
