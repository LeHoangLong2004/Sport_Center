using System;

namespace SmartGym.Application.DTOs;

public class SubscriptionResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? PackageId { get; set; }
    public string? PackageName { get; set; }
    public string? BillingPeriod { get; set; }
    public decimal TotalAmount { get; set; }
    public SmartGym.Domain.Enums.PaymentMethod? PaymentMethod { get; set; }
    public SmartGym.Domain.Enums.PaymentStatus PaymentStatus { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AutoRenew { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSubscriptionRequest
{
    public string PackageId { get; set; } = null!;
    public string BillingPeriod { get; set; } = "monthly"; // monthly, yearly
    public SmartGym.Domain.Enums.PaymentMethod PaymentMethod { get; set; } = SmartGym.Domain.Enums.PaymentMethod.CreditCard;
}
