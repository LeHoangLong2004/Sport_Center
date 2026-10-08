using System;

namespace SmartGym.Domain.Entities;

public class Subscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string? PackageId { get; set; }
    public Guid? SportId { get; set; }
    public Guid? FacilityId { get; set; }
    public Guid? VoucherId { get; set; }

    public string? BillingPeriod { get; set; } // 'monthly' | 'yearly'
    public decimal TotalAmount { get; set; }
    public SmartGym.Domain.Enums.PaymentMethod? PaymentMethod { get; set; }
    public SmartGym.Domain.Enums.PaymentStatus PaymentStatus { get; set; } = SmartGym.Domain.Enums.PaymentStatus.Pending;
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AutoRenew { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public Package? Package { get; set; }
}
