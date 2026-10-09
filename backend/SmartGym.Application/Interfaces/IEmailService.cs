using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

/// <summary>
/// Gửi email giao dịch (hóa đơn, nhắc gia hạn...).
/// </summary>
public interface IEmailService
{
    /// <summary>True khi cấu hình SMTP đã đầy đủ và có thể gửi mail thật.</summary>
    bool IsConfigured { get; }

    Task<bool> SendAsync(
        string to,
        string subject,
        string htmlBody,
        byte[]? attachmentBytes = null,
        string? attachmentName = null);
}