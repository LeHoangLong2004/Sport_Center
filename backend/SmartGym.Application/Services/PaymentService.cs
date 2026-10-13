using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Enums;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public class PaymentService(
    ISubscriptionRepository subscriptionRepo,
    IInvoiceRepository invoiceRepo,
    IUserRepository userRepo,
    IPackageRepository packageRepo,
    IPdfService pdfService,
    IEmailService emailService,
    IVnPayGateway vnPayGateway,
    IProductOrderPaymentService productOrderPaymentService) : IPaymentService
{
    /// <summary>Cửa sổ coi là trùng lặp khi 2 giao dịch cùng số tiền được tạo quá gần nhau.</summary>
    private static readonly TimeSpan DuplicateWindow = TimeSpan.FromMinutes(10);

    public async Task<PaymentCreationResult> CreatePaymentAsync(
        Guid userId, string packageId, decimal amount, PaymentMethod method,
        string? billingPeriod = null, bool autoRenew = false, DateTime? startDate = null)
    {
        if (amount <= 0)
            return new PaymentCreationResult(Guid.Empty, false, "Số tiền thanh toán phải lớn hơn 0.");

        if (await userRepo.GetByIdAsync(userId) == null)
            return new PaymentCreationResult(Guid.Empty, false, "Không tìm thấy hội viên.");

        if (!string.IsNullOrWhiteSpace(packageId) && await packageRepo.GetByIdAsync(packageId) == null)
            return new PaymentCreationResult(Guid.Empty, false, $"Không tìm thấy gói tập '{packageId}'.");

        // Bấm thanh toán nhiều lần không tạo thêm hóa đơn chờ trùng.
        var existing = await invoiceRepo.GetByUserIdAsync(userId);
        var pendingDupe = existing
            .Where(i => i.Status == PaymentStatus.Pending
                     && i.TotalAmount == amount
                     && DateTime.UtcNow - i.CreatedAt <= DuplicateWindow)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefault();

        if (pendingDupe != null)
            return new PaymentCreationResult(pendingDupe.Id, true,
                "Giao dịch đang chờ thanh toán (dùng lại hóa đơn vừa tạo).", true);

        var period = NormalizeBillingPeriod(billingPeriod);
        var start  = startDate ?? DateTime.UtcNow;

        var subscription = new Subscription
        {
            UserId        = userId,
            PackageId     = packageId,
            TotalAmount   = amount,
            PaymentMethod = method,
            PaymentStatus = PaymentStatus.Pending,
            BillingPeriod = period,
            AutoRenew     = autoRenew,
            StartDate     = start,
            EndDate       = AddPeriod(start, period)
        };

        var invoice = new Invoice
        {
            UserId        = userId,
            TotalAmount   = amount,
            PaymentMethod = method,
            Status        = PaymentStatus.Pending
        };

        await subscriptionRepo.AddAsync(subscription);
        await invoiceRepo.AddAsync(invoice);

        return new PaymentCreationResult(invoice.Id, true, "Giao dịch đang chờ thanh toán");
    }

    public async Task<bool> ProcessPaymentAsync(Guid invoiceId)
    {
        var invoice = await invoiceRepo.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != PaymentStatus.Pending) return false;

        if (!await productOrderPaymentService.FinalizeAsync(invoiceId))
            return false;

        invoice.Status = PaymentStatus.Completed;
        invoice.PaidAt = DateTime.UtcNow;

        var sub = await FindPendingSubscriptionAsync(invoice);
        if (sub != null)
        {
            sub.PaymentStatus = PaymentStatus.Completed;
            var period = NormalizeBillingPeriod(sub.BillingPeriod);

            // Gia hạn nối tiếp nếu gói cũ cùng loại còn hiệu lực, tránh chồng lấn.
            var activeEnd = (await subscriptionRepo.GetByUserIdAsync(invoice.UserId))
                .Where(s => s.Id != sub.Id
                         && s.PaymentStatus == PaymentStatus.Completed
                         && s.PackageId == sub.PackageId
                         && s.EndDate >= DateTime.UtcNow)
                .OrderByDescending(s => s.EndDate)
                .Select(s => (DateTime?)s.EndDate)
                .FirstOrDefault();

            if (sub.StartDate <= DateTime.UtcNow)
            {
                sub.StartDate = activeEnd.HasValue && activeEnd.Value > DateTime.UtcNow
                    ? activeEnd.Value : DateTime.UtcNow;
                sub.EndDate = AddPeriod(sub.StartDate, period);
            }

            await subscriptionRepo.UpdateAsync(sub);
        }

        await invoiceRepo.UpdateAsync(invoice);
        return true;
    }

    public async Task<bool> CancelPaymentAsync(Guid invoiceId)
    {
        var invoice = await invoiceRepo.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != PaymentStatus.Pending) return false;

        invoice.Status = PaymentStatus.Failed;

        var sub = await FindPendingSubscriptionAsync(invoice);
        if (sub != null)
        {
            sub.PaymentStatus = PaymentStatus.Failed;
            await subscriptionRepo.UpdateAsync(sub);
        }

        await invoiceRepo.UpdateAsync(invoice);
        return true;
    }

    public async Task<RefundResult> RefundPaymentAsync(Guid invoiceId, bool force = false, string? reason = null)
    {
        var invoice = await invoiceRepo.GetByIdAsync(invoiceId);
        if (invoice == null)
            return new RefundResult(false, "Không tìm thấy hóa đơn.");

        if (invoice.Status != PaymentStatus.Completed)
            return new RefundResult(false, "Chỉ hoàn tiền được cho hóa đơn đã thanh toán.");

        if (!force && await HasDuplicatedTransactionAsync(invoice))
            return new RefundResult(false,
                "Phát hiện giao dịch trùng lặp cùng số tiền. Cần xác nhận trước khi hoàn tiền.", true);

        invoice.Status = PaymentStatus.Refunded;

        var sub = (await subscriptionRepo.GetByUserIdAsync(invoice.UserId))
            .FirstOrDefault(s => s.PaymentStatus == PaymentStatus.Completed
                              && s.TotalAmount == invoice.TotalAmount);

        if (sub != null)
        {
            sub.PaymentStatus = PaymentStatus.Refunded;
            await subscriptionRepo.UpdateAsync(sub);
        }

        await invoiceRepo.UpdateAsync(invoice);

        return new RefundResult(true, string.IsNullOrWhiteSpace(reason)
            ? "Đã hoàn tiền"
            : $"Đã hoàn tiền - lý do: {reason}");
    }

    public async Task<string> GenerateVnPayUrlAsync(Guid invoiceId, string? clientIp = null)
    {
        var invoice = await invoiceRepo.GetByIdAsync(invoiceId)
            ?? throw new InvalidOperationException("Không tìm thấy hóa đơn.");

        if (invoice.Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Hóa đơn không ở trạng thái chờ thanh toán.");

        return vnPayGateway.CreatePaymentUrl(
            invoice.Id, invoice.TotalAmount,
            $"Thanh toan hoa don {invoice.InvoiceNumber}", clientIp);
    }

    public async Task<VnPayCallbackHandling> HandleVnPayCallbackAsync(IReadOnlyDictionary<string, string> query)
    {
        var cb = vnPayGateway.ValidateCallback(query);
        if (!cb.IsValid || cb.InvoiceId == null)
            return new VnPayCallbackHandling(false, cb.Message, cb.InvoiceId);

        var invoiceId = cb.InvoiceId.Value;
        if (!cb.IsSuccess)
        {
            await CancelPaymentAsync(invoiceId);
            return new VnPayCallbackHandling(false, $"VNPay trả về mã lỗi {cb.ResponseCode}", invoiceId);
        }

        var processed = await ProcessPaymentAsync(invoiceId);
        return new VnPayCallbackHandling(
            processed,
            processed ? "Thanh toán VNPay thành công" : "Hóa đơn đã được xử lý trước đó",
            invoiceId);
    }

    public async Task<EmailSendResult> SendInvoiceEmailAsync(Guid invoiceId)
    {
        var invoice = await invoiceRepo.GetByIdAsync(invoiceId);
        if (invoice == null) return new EmailSendResult(false, "Không tìm thấy hóa đơn.");

        var user = await userRepo.GetByIdAsync(invoice.UserId);
        if (user == null || string.IsNullOrWhiteSpace(user.Email))
            return new EmailSendResult(false, "Hội viên chưa có địa chỉ email.");

        if (!emailService.IsConfigured)
            return new EmailSendResult(false, "SMTP chưa được cấu hình (Smtp:Host, Smtp:From) nên không thể gửi email.");

        byte[]? pdf = null;
        try { pdf = await pdfService.GenerateInvoicePdfAsync(invoiceId); }
        catch { /* Vẫn gửi email tóm tắt nếu sinh PDF thất bại. */ }

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

        var sent = await emailService.SendAsync(user.Email,
            $"Hóa đơn {invoice.InvoiceNumber} - SmartGym Center",
            body, pdf, $"{invoice.InvoiceNumber}.pdf");

        return sent
            ? new EmailSendResult(true, "Đã gửi email hóa đơn")
            : new EmailSendResult(false, "Gửi email thất bại, vui lòng kiểm tra cấu hình SMTP.");
    }

    public async Task<bool> RecordCashPaymentAsync(Guid invoiceId)
    {
        var invoice = await invoiceRepo.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != PaymentStatus.Pending) return false;

        invoice.PaymentMethod = PaymentMethod.CashAtCounter;
        await invoiceRepo.UpdateAsync(invoice);
        return await ProcessPaymentAsync(invoiceId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task<Subscription?> FindPendingSubscriptionAsync(Invoice invoice) =>
        (await subscriptionRepo.GetByUserIdAsync(invoice.UserId))
            .Where(s => s.PaymentStatus == PaymentStatus.Pending)
            .OrderByDescending(s => s.TotalAmount == invoice.TotalAmount)
            .ThenByDescending(s => s.CreatedAt)
            .FirstOrDefault();

    private async Task<bool> HasDuplicatedTransactionAsync(Invoice invoice)
    {
        var paidAt   = invoice.PaidAt ?? invoice.CreatedAt;
        var invoices = await invoiceRepo.GetByUserIdAsync(invoice.UserId);

        return invoices.Any(i =>
            i.Id != invoice.Id
            && i.Status == PaymentStatus.Completed
            && i.TotalAmount == invoice.TotalAmount
            && Math.Abs(((i.PaidAt ?? i.CreatedAt) - paidAt).TotalMinutes) <= DuplicateWindow.TotalMinutes);
    }

    private static string NormalizeBillingPeriod(string? p) =>
        string.Equals(p, "yearly", StringComparison.OrdinalIgnoreCase) ? "yearly" : "monthly";

    private static DateTime AddPeriod(DateTime start, string period) =>
        period == "yearly" ? start.AddYears(1) : start.AddMonths(1);
}
