namespace SmartGym.Domain.Entities;

/// <summary>
/// Thực thể Gói tập (Package Entity).
/// Đại diện cho các gói dịch vụ thể thao (bơi lội, yoga, gym...) hoặc gói thẻ thành viên trung tâm.
/// </summary>
public class Package
{
    public string Id { get; set; } = null!; // e.g. 'swim', 'yoga', 'vip'
    public string Name { get; set; } = null!;
    public string? Tagline { get; set; }
    public string PackageType { get; set; } = "sport"; // 'sport' or 'membership'
    public decimal? MonthlyPrice { get; set; }
    public decimal? YearlyPrice { get; set; }
    public string? Description { get; set; }
    public bool Status { get; set; } = true;
    public string? CatalogJson { get; set; }

    // Navigation properties
    public ICollection<PackageFeature> Features { get; set; } = new List<PackageFeature>();
    public ICollection<MembershipBenefit> Benefits { get; set; } = new List<MembershipBenefit>();
}
