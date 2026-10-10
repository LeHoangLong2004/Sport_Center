using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGym.Application.Interfaces;

namespace SmartGym.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_options.Host) && !string.IsNullOrWhiteSpace(_options.From);

    public async Task<bool> SendAsync(
        string to,
        string subject,
        string htmlBody,
        byte[]? attachmentBytes = null,
        string? attachmentName = null)
    {
        if (string.IsNullOrWhiteSpace(to))
        {
            _logger.LogWarning("Bỏ qua gửi email '{Subject}': người nhận không có địa chỉ email.", subject);
            return false;
        }

        if (!IsConfigured)
        {
            _logger.LogWarning(
                "SMTP chưa được cấu hình (Smtp:Host/Smtp:From). Không gửi được email '{Subject}' tới {To}.",
                subject, to);
            return false;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_options.From, _options.FromName ?? _options.From),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(to);

            if (attachmentBytes is { Length: > 0 })
            {
                var stream = new System.IO.MemoryStream(attachmentBytes);
                message.Attachments.Add(new Attachment(stream, attachmentName ?? "invoice.pdf", "application/pdf"));
            }

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.EnableSsl,
                Credentials = string.IsNullOrWhiteSpace(_options.User)
                    ? CredentialCache.DefaultNetworkCredentials
                    : new NetworkCredential(_options.User, _options.Password)
            };

            await client.SendMailAsync(message);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gửi email '{Subject}' tới {To} thất bại.", subject, to);
            return false;
        }
    }
}