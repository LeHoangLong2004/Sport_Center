using System.Collections.Generic;

namespace SmartGym.Application.DTOs;

public class PackageResponse
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Tagline { get; set; }
    public string PackageType { get; set; } = null!;
    public decimal? MonthlyPrice { get; set; }
    public decimal? YearlyPrice { get; set; }
    public string? Description { get; set; }
    public bool Status { get; set; }
    public IEnumerable<string> Features { get; set; } = new List<string>();
    public IEnumerable<string> Benefits { get; set; } = new List<string>();
}

public class CreatePackageRequest
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Tagline { get; set; }
    public string PackageType { get; set; } = "sport";
    public decimal? MonthlyPrice { get; set; }
    public decimal? YearlyPrice { get; set; }
    public string? Description { get; set; }
    public List<string> Features { get; set; } = new List<string>();
    public List<string> Benefits { get; set; } = new List<string>();
}
