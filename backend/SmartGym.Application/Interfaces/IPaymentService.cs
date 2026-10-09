using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Domain.Enums;

namespace SmartGym.Application.Interfaces;

public interface IPaymentService
{
    /// <summary>
    /// Creates a payment transaction for a subscription/package.
    /// Returns the invoice/transaction ID.
    /// </summary>
    Task<PaymentCreationResult> CreatePaymentAsync(
        Guid userId,
        string packageId,
        decimal amount,
        PaymentMethod method,
        string? billingPeriod = null,
        bool autoRenew = false,
        DateTime? startDate = null);

    /// <summary>
    /// Processes and confirms the payment logic.
    /// </summary>
    Task<bool> ProcessPaymentAsync(Guid invoiceId);

    /// <summary>
    /// Cancels a pending payment.
    /// </summary>
    Task<bool> CancelPaymentAsync(Guid invoiceId);

    /// <summary>
    /// Hoàn tiền cho hóa đơn đã thanh toán. Nếu phát hiện giao dịch trùng lặp,
    /// trả về <c>RequiresConfirmation = true</c> và chỉ hoàn tiền khi <paramref name="force"/> = true.
    /// </summary>
    Task<RefundResult> RefundPaymentAsync(Guid invoiceId, bool force = false, string? reason = null);

    /// <summary>Tạo URL thanh toán VNPay cho hóa đơn đang chờ.</summary>
    Task<string> GenerateVnPayUrlAsync(Guid invoiceId, string? clientIp = null);

    /// <summary>Xử lý dữ liệu VNPay gửi về ReturnUrl/IPN, cập nhật trạng thái hóa đơn.</summary>
    Task<VnPayCallbackHandling> HandleVnPayCallbackAsync(IReadOnlyDictionary<string, string> query);

    /// <summary>Xuất PDF hóa đơn và gửi qua email của hội viên.</summary>
    Task<EmailSendResult> SendInvoiceEmailAsync(Guid invoiceId);

    /// <summary>Ghi nhận thanh toán tiền mặt tại quầy và hoàn tất hóa đơn.</summary>
    Task<bool> RecordCashPaymentAsync(Guid invoiceId);
}

public record PaymentCreationResult(
    Guid InvoiceId,
    bool Success,
    string Message,
    bool IsDuplicateSuspected = false);

public record RefundResult(
    bool Success,
    string Message,
    bool RequiresConfirmation = false);

public record VnPayCallbackHandling(
    bool Success,
    string Message,
    Guid? InvoiceId = null);

public record EmailSendResult(bool Success, string Message);
