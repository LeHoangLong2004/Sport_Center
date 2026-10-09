using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Enums;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public class PaymentService : IPaymentService
{
    /// <summary>Cửa sổ coi là trùng lặp khi 2 giao dịch cùng số tiền được tạo/thanh toán quá gần nhau.</summary>
    private static readonly TimeSpan DuplicateWindow = TimeSpan.FromMinutes(10);

    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPackageRepository _packageRepository;
    private readonly IPdfService _pdfService;
    private readonly IEmailService _emailService;
    private readonly IVnPayGateway _vnPayGateway;

    public PaymentService(
        ISubscriptionRepository subscriptionRepository,
        IInvoiceRepository invoiceRepository,
        IUserRepository userRepository,
        IPackageRepository packageRepository,
        IPdfService pdfService,
        IEmailService emailService,
        IVnPayGateway vnPayGateway)
    {
        _subscriptionRepository = subscriptionRepository;
        _invoiceRepository = invoiceRepository;
        _userRepository = userRepository;
        _packageRepository = packageRepository;
        _pdfService = pdfService;
        _emailService = emailService;
        _vnPayGateway = vnPayGateway;
    }

    public async Task<PaymentCreationResult> CreatePaymentAsync(
        Guid userId,
        string packageId,
        decimal amount,
        PaymentMethod method,
        string? billingPeriod = null,
        bool autoRenew = false)
    {
        if (amount <= 0)
        {
            return new PaymentCreationResult(Guid.Empty, false, "Số tiền thanh toán phải lớn hơn 0.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return new PaymentCreationResult(Guid.Empty, false, "Không tìm thấy hội viên.");
        }

        if (!string.IsNullOrWhiteSpace(packageId) && await _packageRepository.GetByIdAsync(packageId) == null)
        {
            return new PaymentCreationResult(Guid.Empty, false, $"Không tìm thấy gói tập '{packageId}'.");
        }

        // Bấm thanh toán nhiều lần không tạo thêm hóa đơn chờ trùng.
        var existing = await _invoiceRepository.GetByUserIdAsync(userId);
        var pendingDuplicate = existing
            .Where(i => i.Status == PaymentStatus.Pending
                        && i.TotalAmount == amount
                        && DateTime.UtcNow - i.CreatedAt <= DuplicateWindow)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefault();

        if (pendingDuplicate != null)
        {
            return new PaymentCreationResult(
                pendingDuplicate.Id,
                true,
                "Giao dịch đang chờ thanh toán (dùng lại hóa đơn vừa tạo).",
                true);
        }

        var period = NormalizeBillingPeriod(billingPeriod);

        var subscription = new Subscription
        {
            UserId = userId,
            PackageId = packageId,
            TotalAmount = amount,
            PaymentMethod = method,
            PaymentStatus = PaymentStatus.Pending,
            BillingPeriod = period,
            AutoRenew = autoRenew,
            StartDate = DateTime.UtcNow,
            EndDate = AddPeriod(DateTime.UtcNow, period)
        };

        var invoice = new Invoice
        {
            UserId = userId,
            TotalAmount = amount,
            PaymentMethod = method,
            Status = PaymentStatus.Pending
        };

        await _subscriptionRepository.AddAsync(subscription);
        await _invoiceRepository.AddAsync(invoice);

        return new PaymentCreationResult(invoice.Id, true, "Giao dịch đang chờ thanh toán");
    }

    public async Task<bool> ProcessPaymentAsync(Guid invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != PaymentStatus.Pending) return false;

        invoice.Status = PaymentStatus.Completed;
        invoice.PaidAt = DateTime.UtcNow;

        var subscription = await FindPendingSubscriptionAsync(invoice);
        if (subscription != null)
        {
            subscription.PaymentStatus = PaymentStatus.Completed;

            var period = NormalizeBillingPeriod(subscription.BillingPeriod);

            // Gia hạn nối tiếp nếu gói cũ cùng loại còn hiệu lực, tránh chồng lấn thời gian.
            var activeEndDate = (await _subscriptionRepository.GetByUserIdAsync(invoice.UserId))
                .Where(s => s.Id != subscription.Id
                            && s.PaymentStatus == PaymentStatus.Completed
                            && s.PackageId == subscription.PackageId
                            && s.EndDate >= DateTime.UtcNow)
                .OrderByDescending(s => s.EndDate)
                .Select(s => (DateTime?)s.EndDate)
                .FirstOrDefault();

            subscription.StartDate = activeEndDate.HasValue && activeEndDate.Value > DateTime.UtcNow
                ? activeEndDate.Value
                : DateTime.UtcNow;
            subscription.EndDate = AddPeriod(subscription.StartDate, period);

            await _subscriptionRepository.UpdateAsync(subscription);
        }

        await _invoiceRepository.UpdateAsync(invoice);
        return true;
    }

    public async Task<bool> CancelPaymentAsync(Guid invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != PaymentStatus.Pending) return false;

        invoice.Status = PaymentStatus.Failed;

        var subscription = await FindPendingSubscriptionAsync(invoice);
        if (subscription != null)
        {
            subscription.PaymentStatus = PaymentStatus.Failed;
            await _subscriptionRepository.UpdateAsync(subscription);
        }

        await _invoiceRepository.UpdateAsync(invoice);
        return true;
    }

    public async Task<RefundResult> RefundPaymentAsync(Guid invoiceId, bool force = false, string? reason = null)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            return new RefundResult(false, "Không tìm thấy hóa đơn.");
        }

        if (invoice.Status != PaymentStatus.Completed)
        {
            return new RefundResult(false, "Chỉ hoàn tiền được cho hóa đơn đã thanh toán.");
        }

        if (!force && await HasDuplicatedTransactionAsync(invoice))
        {
            return new RefundResult(
                false,
                "Phát hiện giao dịch trùng lặp cùng số tiền. Cần xác nhận trước khi hoàn tiền.",
                true);
        }

        invoice.Status = PaymentStatus.Refunded;

        var subscriptions = await _subscriptionRepository.GetByUserIdAsync(invoice.UserId);
        var subscription = subscriptions.FirstOrDefault(s =>
            s.PaymentStatus == PaymentStatus.Completed && s.TotalAmount == invoice.TotalAmount);

        if (subscription != null)
        {
            subscription.PaymentStatus = PaymentStatus.Refunded;
            await _subscriptionRepository.UpdateAsync(subscription);
        }

        await _invoiceRepository.UpdateAsync(invoice);

        return new RefundResult(true, string.IsNullOrWhiteSpace(reason)
            ? "Đã hoàn tiền"
            : $"Đã hoàn tiền - lý do: {reason}");
    }

    public async Task<string> GenerateVnPayUrlAsync(Guid invoiceId, string? clientIp = null)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            throw new InvalidOperationException("Không tìm thấy hóa đơn.");
        }

        if (invoice.Status != PaymentStatus.Pending)
        {
            throw new InvalidOperationException("Hóa đơn không ở trạng thái chờ thanh toán.");
        }

        return _vnPayGateway.CreatePaymentUrl(
            invoice.Id,
            invoice.TotalAmount,
            $"Thanh toan hoa don {invoice.InvoiceNumber}",
            clientIp);
    }

    public async Task<VnPayCallbackHandling> HandleVnPayCallbackAsync(IReadOnlyDictionary<string, string> query)
    {
        var callback = _vnPayGateway.ValidateCallback(query);
        if (!callback.IsValid || callback.InvoiceId == null)
        {
            return new VnPayCallbackHandling(false, callback.Message, callback.InvoiceId);
        }

        var invoiceId = callback.InvoiceId.Value;

        if (callback.IsSuccess)
        {
            var processed = await ProcessPaymentAsync(invoiceId);
            return new VnPayCallbackHandling(
                processed,
                processed ? "Thanh toán VNPay thành công" : "Hóa đơn đã được xử lý trước đó",
                invoiceId);
        }

        await CancelPaymentAsync(invoiceId);
        return new VnPayCallbackHandling(false, $"VNPay trả về mã lỗi {callback.ResponseCode}", invoiceId);
    }

    public async Task<EmailSendResult> SendInvoiceEmailAsync(Guid invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            return new EmailSendResult(false, "Không tìm thấy hóa đơn.");
        }

        var user = await _userRepository.GetByIdAsync(invoice.UserId);
        if (user == null || string.IsNullOrWhiteSpace(user.Email))
        {
            return new EmailSendResult(false, "Hội viên chưa có địa chỉ email.");
        }

        if (!_emailService.IsConfigured)
        {
            return new EmailSendResult(false, "SMTP chưa được cấu hình (Smtp:Host, Smtp:From) nên không thể gửi email.");
        }

        byte[]? pdf = null;
        try
        {
            pdf = await _pdfService.GenerateInvoicePdfAsync(invoiceId);
        }
        catch (Exception)
        {
            // Vẫn gửi email tóm tắt hóa đơn nếu bước sinh PDF thất bại.
        }

        var body = $"""
            <h2>Xin chào {user.FullName},</h2>
            <p>Cảm ơn bạn đã thanh toán tại SmartGym Center.</p>
            <ul>
              <li>Mã hóa đơn: <strong>{invoice.InvoiceNumber}</strong></li>
              <li>Số tiền: <strong>{invoice.TotalAmount:N0} VNĐ</strong></li>
              <li>Hình thức: {invoice.PaymentMethod.ToDisplayName()}</li>
              <li>Trạng thái: {invoice.Status.ToDisplayName()}</li>
              <li>Ngày tạo: {invoice.CreatedAt:dd/MM/yyyy HH:mm}</li>
            </ul>
            <p>Hóa đơn PDF được đính kèm trong email này.</p>
            """;

        var sent = await _emailService.SendAsync(
            user.Email,
            $"Hóa đơn {invoice.InvoiceNumber} - SmartGym Center",
            body,
            pdf,
            $"{invoice.InvoiceNumber}.pdf");

        return sent
            ? new EmailSendResult(true, "Đã gửi email hóa đơn")
            : new EmailSendResult(false, "Gửi email thất bại, vui lòng kiểm tra cấu hình SMTP.");
    }

    public async Task<bool> RecordCashPaymentAsync(Guid invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != PaymentStatus.Pending) return false;

        invoice.PaymentMethod = PaymentMethod.CashAtCounter;
        await _invoiceRepository.UpdateAsync(invoice);

        return await ProcessPaymentAsync(invoiceId);
    }

    private async Task<Subscription?> FindPendingSubscriptionAsync(Invoice invoice)
    {
        var subscriptions = await _subscriptionRepository.GetByUserIdAsync(invoice.UserId);

        return subscriptions
            .Where(s => s.PaymentStatus == PaymentStatus.Pending)
            .OrderByDescending(s => s.TotalAmount == invoice.TotalAmount)
            .ThenByDescending(s => s.CreatedAt)
            .FirstOrDefault();
    }

    private async Task<bool> HasDuplicatedTransactionAsync(Invoice invoice)
    {
        var paidAt = invoice.PaidAt ?? invoice.CreatedAt;
        var invoices = await _invoiceRepository.GetByUserIdAsync(invoice.UserId);

        return invoices.Any(i =>
        {
            if (i.Id == invoice.Id) return false;
            if (i.Status != PaymentStatus.Completed) return false;
            if (i.TotalAmount != invoice.TotalAmount) return false;

            var otherPaidAt = i.PaidAt ?? i.CreatedAt;
            return Math.Abs((otherPaidAt - paidAt).TotalMinutes) <= DuplicateWindow.TotalMinutes;
        });
    }

    private static string NormalizeBillingPeriod(string? billingPeriod) =>
        string.Equals(billingPeriod, "yearly", StringComparison.OrdinalIgnoreCase) ? "yearly" : "monthly";

    private static DateTime AddPeriod(DateTime start, string period) =>
        period == "yearly" ? start.AddYears(1) : start.AddMonths(1);
}
