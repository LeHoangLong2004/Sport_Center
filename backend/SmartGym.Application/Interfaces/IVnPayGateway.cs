using System;
using System.Collections.Generic;

namespace SmartGym.Application.Interfaces;

/// <summary>Cổng thanh toán trực tuyến (VNPay sandbox/production).</summary>
public interface IVnPayGateway
{
    bool IsConfigured { get; }

    /// <summary>Tạo URL thanh toán có chữ ký HMAC-SHA512 cho hóa đơn.</summary>
    string CreatePaymentUrl(Guid invoiceId, decimal amount, string orderInfo, string? clientIp, DateTime? createdAt = null);

    /// <summary>Kiểm tra chữ ký dữ liệu VNPay trả về (ReturnUrl hoặc IPN).</summary>
    VnPayCallbackResult ValidateCallback(IReadOnlyDictionary<string, string> query);
}

public record VnPayCallbackResult(
    bool IsValid,
    Guid? InvoiceId,
    string? ResponseCode,
    string? TransactionId,
    string Message)
{
    public bool IsSuccess => IsValid && ResponseCode == "00";
}