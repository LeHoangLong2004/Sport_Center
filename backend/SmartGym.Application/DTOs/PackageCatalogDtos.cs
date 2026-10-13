namespace SmartGym.Application.DTOs;

public sealed class CatalogPackageDto
{
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = "sport";
    public string? Tier { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public Dictionary<int, decimal> Prices { get; set; } = new();
    public List<string> Benefits { get; set; } = [];
    public List<string> Terms { get; set; } = [];
    public decimal GroupDiscountPct { get; set; }
    public decimal CoachDiscountPct { get; set; }
    public int BookingAdvanceHours { get; set; }
    public string LockerTerms { get; set; } = string.Empty;
    public string? Sport { get; set; }
    public string? Area { get; set; }
    public string? Format { get; set; }
    public int? SessionsPerMonth { get; set; }
    public int? MinutesPerSession { get; set; }
    public int? MaxClassSize { get; set; }
    public string? AccessHours { get; set; }
}

public sealed class CreatePackageOrderRequest
{
    public string PackageId { get; set; } = string.Empty;
    public int DurationMonths { get; set; }
    public DateTime? StartDate { get; set; }
}

public sealed class CreatePackageCheckoutRequest
{
    public string PackageId { get; set; } = string.Empty;
    public int DurationMonths { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
}

public sealed class PackageOrderResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string PackageId { get; set; } = string.Empty;
    public CatalogPackageDto PackageSnapshot { get; set; } = new();
    public int DurationMonths { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountPct { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public sealed class PackageCheckoutResponse
{
    public PackageOrderResponse Order { get; set; } = new();
    public Guid InvoiceId { get; set; }
}
