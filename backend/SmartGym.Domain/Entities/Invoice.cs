using System;
using SmartGym.Domain.Enums;

namespace SmartGym.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? BranchId { get; set; }
    
    public decimal TotalAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    /// <summary>Mã tra cứu hóa đơn dùng để in/gửi cho khách hàng.</summary>
    public string InvoiceNumber => $"INV-{CreatedAt:yyyyMMdd}-{Id.ToString("N")[..8].ToUpperInvariant()}";

    // Navigation
    public User? User { get; set; }
    public Branch? Branch { get; set; }
}
