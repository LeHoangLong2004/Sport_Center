using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using SmartGym.Application.Interfaces;

namespace SmartGym.Infrastructure.Services;

/// <summary>
/// Sinh URL thanh toán và kiểm tra chữ ký theo đặc tả VNPay 2.1.0
/// (query string sắp xếp theo key, ký HMAC-SHA512 bằng HashSecret).
/// </summary>
public class VnPayGateway : IVnPayGateway
{
    private readonly VnPayOptions _options;

    public VnPayGateway(IOptions<VnPayOptions> options)
    {
        _options = options.Value;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_options.Url) &&
        !string.IsNullOrWhiteSpace(_options.TmnCode) &&
        !string.IsNullOrWhiteSpace(_options.HashSecret);

    public string CreatePaymentUrl(Guid invoiceId, decimal amount, string orderInfo, string? clientIp, DateTime? createdAt = null)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("VNPay chưa được cấu hình (VnPay:TmnCode, VnPay:HashSecret, VnPay:Url).");
        }

        var now = createdAt ?? DateTime.UtcNow.AddHours(7); // VNPay dùng giờ Việt Nam

        var parameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = _options.Version,
            ["vnp_Command"] = _options.Command,
            ["vnp_TmnCode"] = _options.TmnCode,
            ["vnp_Locale"] = _options.Locale,
            ["vnp_CurrCode"] = _options.CurrCode,
            ["vnp_TxnRef"] = invoiceId.ToString("N"),
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_OrderType"] = _options.OrderType,
            ["vnp_Amount"] = ((long)Math.Round(amount * 100m, MidpointRounding.AwayFromZero)).ToString(CultureInfo.InvariantCulture),
            ["vnp_ReturnUrl"] = _options.ReturnUrl,
            ["vnp_IpAddr"] = string.IsNullOrWhiteSpace(clientIp) ? "127.0.0.1" : clientIp,
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture),
            ["vnp_ExpireDate"] = now.AddMinutes(15).ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture)
        };

        var query = BuildQuery(parameters);
        var secureHash = HmacSha512(_options.HashSecret, query);

        return $"{_options.Url}?{query}&vnp_SecureHash={secureHash}";
    }

    public VnPayCallbackResult ValidateCallback(IReadOnlyDictionary<string, string> query)
    {
        if (!IsConfigured)
        {
            return new VnPayCallbackResult(false, null, null, null, "VNPay chưa được cấu hình.");
        }

        if (!query.TryGetValue("vnp_SecureHash", out var receivedHash) || string.IsNullOrWhiteSpace(receivedHash))
        {
            return new VnPayCallbackResult(false, null, null, null, "Thiếu chữ ký vnp_SecureHash.");
        }

        var parameters = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var pair in query)
        {
            if (string.IsNullOrEmpty(pair.Value)) continue;
            if (pair.Key is "vnp_SecureHash" or "vnp_SecureHashType") continue;
            parameters[pair.Key] = pair.Value;
        }

        var expectedHash = HmacSha512(_options.HashSecret, BuildQuery(parameters));
        if (!string.Equals(expectedHash, receivedHash, StringComparison.OrdinalIgnoreCase))
        {
            return new VnPayCallbackResult(false, null, null, null, "Chữ ký không hợp lệ.");
        }

        query.TryGetValue("vnp_ResponseCode", out var responseCode);
        query.TryGetValue("vnp_TransactionNo", out var transactionId);

        Guid? invoiceId = null;
        if (query.TryGetValue("vnp_TxnRef", out var txnRef) && Guid.TryParseExact(txnRef, "N", out var parsed))
        {
            invoiceId = parsed;
        }

        return new VnPayCallbackResult(true, invoiceId, responseCode, transactionId, "Chữ ký hợp lệ.");
    }

    private static string BuildQuery(IEnumerable<KeyValuePair<string, string>> parameters) =>
        string.Join("&", parameters.Select(p =>
            $"{Uri.EscapeDataString(p.Key)}={Uri.EscapeDataString(p.Value)}"));

    private static string HmacSha512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}