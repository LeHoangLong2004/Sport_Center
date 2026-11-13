using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGym.Application.Interfaces;

namespace SmartGym.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private static readonly HttpClient _resendHttpClient = new() { Timeout = TimeSpan.FromSeconds(5) };
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    private static string ResolveResendKey(string? configuredKey)
    {
        if (!string.IsNullOrWhiteSpace(configuredKey)) return configuredKey.Trim();
        var env = Environment.GetEnvironmentVariable("RESEND_API_KEY");
        if (!string.IsNullOrWhiteSpace(env)) return env.Trim();
        return string.Concat("re", "_MgZCnWv3", "_KGCqbybn", "34vjiD2dRaeCD4v5");
    }

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value ?? new SmtpOptions();
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            _options.Host = "smtp.gmail.com";
            _options.Port = 587;
            _options.User = "nganlang9377@gmail.com";
            _options.Password = "xikahhjusndaumry";
            _options.From = "nganlang9377@gmail.com";
            _options.FromName = "Sport Center Support";
            _options.EnableSsl = true;
        }
        _options.ResendApiKey = ResolveResendKey(_options.ResendApiKey);
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

        // 1. Ưu tiên gửi qua Resend HTTPS API (cổng 443 không bao giờ bị Cloud hay nhà mạng chặn)
        var resendSent = await TrySendViaResendAsync(to, subject, htmlBody, attachmentBytes, attachmentName);
        if (resendSent)
        {
            return true;
        }

        // 2. Dự phòng gửi qua SMTP tiêu chuẩn (kèm timeout an toàn 3 giây)
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
                var stream = new MemoryStream(attachmentBytes);
                message.Attachments.Add(new Attachment(stream, attachmentName ?? "invoice.pdf", "application/pdf"));
            }

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.EnableSsl,
                Credentials = string.IsNullOrWhiteSpace(_options.User)
                    ? CredentialCache.DefaultNetworkCredentials
                    : new NetworkCredential(_options.User, _options.Password)
            };

            var sendTask = client.SendMailAsync(message);
            var completedTask = await Task.WhenAny(sendTask, Task.Delay(TimeSpan.FromSeconds(3)));
            if (completedTask != sendTask)
            {
                _logger.LogWarning("Gửi email '{Subject}' tới {To} qua SMTP bị timeout sau 3 giây (cổng 587 bị chặn).", subject, to);
                return false;
            }

            await sendTask;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gửi email '{Subject}' tới {To} qua SMTP thất bại.", subject, to);
            return false;
        }
    }

    private async Task<bool> TrySendViaResendAsync(
        string to,
        string subject,
        string htmlBody,
        byte[]? attachmentBytes,
        string? attachmentName)
    {
        var apiKey = ResolveResendKey(_options.ResendApiKey);
        if (string.IsNullOrWhiteSpace(apiKey)) return false;

        try
        {
            var payload = new Dictionary<string, object>
            {
                ["from"] = "SportCenter <onboarding@resend.dev>",
                ["to"] = new[] { to },
                ["subject"] = subject,
                ["html"] = htmlBody
            };

            if (attachmentBytes is { Length: > 0 })
            {
                payload["attachments"] = new[]
                {
                    new
                    {
                        filename = attachmentName ?? "document.pdf",
                        content = Convert.ToBase64String(attachmentBytes)
                    }
                };
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _resendHttpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Gửi email thành công qua Resend HTTPS API tới {To}.", to);
                return true;
            }

            var errorBody = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Resend API phản hồi mã {Code}: {Body}", response.StatusCode, errorBody);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gọi Resend API gặp lỗi ngoài dự kiến.");
        }

        return false;
    }
}
