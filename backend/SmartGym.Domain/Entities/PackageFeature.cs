using System;

namespace SmartGym.Domain.Entities;

public class PackageFeature
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PackageId { get; set; } = null!;
    public string FeatureText { get; set; } = null!;
    public bool IsHighlighted { get; set; } = false;

    // Navigation
    public Package? Package { get; set; }
}
