namespace SmartGym.Application.DTOs.Payments;

/// <summary>Thông tin hóa đơn trả về cho FE (không lộ entity và navigation của EF Core).</summary>
public record InvoiceResponse(
    Guid Id,
    string InvoiceNumber,
    Guid UserId,
    string? MemberName,
    decimal TotalAmount,
    string PaymentMethod,
    string PaymentMethodName,
    string Status,
    string StatusName,
    DateTime CreatedAt,
    DateTime? PaidAt);