using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Xunit;

namespace SmartGym.Tests;

public class Flow3SePayWebhookTests
{
    public record SePayWebhookPayload(
        long id,
        string gateway,
        string transactionDate,
        string accountNumber,
        string subAccount,
        decimal amountIn,
        decimal amountOut,
        decimal accumulated,
        string code,
        string transactionContent,
        string referenceNumber,
        string body
    );

    public class SePayWebhookProcessor
    {
        private static readonly Regex GymOrderRegex = new(@"\b(GYM|SC)[-_]?([A-Za-z0-9\-]+)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private readonly string _configuredAccountNumber;
        private readonly string _configuredApiKey;

        public SePayWebhookProcessor(string configuredAccountNumber = "980979977428", string configuredApiKey = "smartgym_sepay_secret_2026")
        {
            _configuredAccountNumber = configuredAccountNumber;
            _configuredApiKey = configuredApiKey;
        }

        public bool ValidateApiKey(string? authHeader)
        {
            if (string.IsNullOrWhiteSpace(authHeader)) return false;
            var token = authHeader.Replace("Apikey ", "", StringComparison.OrdinalIgnoreCase).Trim();
            return string.Equals(token, _configuredApiKey, StringComparison.Ordinal);
        }

        public bool ValidateAccountNumber(string? accountNumber)
        {
            if (string.IsNullOrWhiteSpace(accountNumber)) return false;
            var clean = accountNumber.Replace(" ", "").Trim();
            return string.Equals(clean, _configuredAccountNumber, StringComparison.OrdinalIgnoreCase);
        }

        public string? ExtractOrderCode(string? transactionContent)
        {
            if (string.IsNullOrWhiteSpace(transactionContent)) return null;
            var match = GymOrderRegex.Match(transactionContent);
            return match.Success ? match.Value.ToUpperInvariant() : null;
        }

        public (bool IsSuccess, string Message, string? MatchedOrderCode) ProcessTransaction(SePayWebhookPayload payload, string? authHeader)
        {
            if (!ValidateApiKey(authHeader))
                return (false, "Lỗi xác thực: Webhook API Key không hợp lệ", null);

            if (!ValidateAccountNumber(payload.accountNumber))
                return (false, $"Tài khoản nhận tiền không khớp: {payload.accountNumber}", null);

            if (payload.amountIn <= 0)
                return (false, "Giao dịch không hợp lệ: Số tiền nhận vào phải lớn hơn 0", null);

            var orderCode = ExtractOrderCode(payload.transactionContent);
            if (string.IsNullOrWhiteSpace(orderCode))
                return (false, "Không tìm thấy mã đơn hàng GYM/SC trong nội dung chuyển khoản", null);

            return (true, $"Đối soát thành công cho đơn hàng {orderCode}", orderCode);
        }
    }

    [Fact]
    public void ValidateApiKey_ShouldReturnTrue_WhenHeaderMatchesConfiguredSecret()
    {
        var processor = new SePayWebhookProcessor("980979977428", "secret_key_123");
        Assert.True(processor.ValidateApiKey("Apikey secret_key_123"));
        Assert.True(processor.ValidateApiKey("apikey secret_key_123"));
        Assert.False(processor.ValidateApiKey("Apikey wrong_secret"));
        Assert.False(processor.ValidateApiKey(null));
        Assert.False(processor.ValidateApiKey(""));
    }

    [Fact]
    public void ValidateAccountNumber_ShouldMatchMBBankAccount()
    {
        var processor = new SePayWebhookProcessor("980979977428");
        Assert.True(processor.ValidateAccountNumber("980979977428"));
        Assert.True(processor.ValidateAccountNumber("9809 7997 7428"));
        Assert.False(processor.ValidateAccountNumber("123456789"));
        Assert.False(processor.ValidateAccountNumber(null));
    }

    [Theory]
    [InlineData("GYM1024 thanh toan goi tap", "GYM1024")]
    [InlineData("Chuyen khoan GYM-ORDER-8889 nap tien", "GYM-ORDER-8889")]
    [InlineData("SC20261028 thanh toan goi yoga", "SC20261028")]
    [InlineData("Noi dung khong co ma", null)]
    [InlineData("", null)]
    public void ExtractOrderCode_ShouldParseGymAndScMemos(string content, string? expectedCode)
    {
        var processor = new SePayWebhookProcessor();
        var extracted = processor.ExtractOrderCode(content);
        Assert.Equal(expectedCode, extracted);
    }

    [Fact]
    public void ProcessTransaction_ShouldSucceed_WhenPayloadAndHeadersAreValid()
    {
        var processor = new SePayWebhookProcessor("980979977428", "smartgym_sepay_secret_2026");
        var payload = new SePayWebhookPayload(
            id: 999888,
            gateway: "MBBank",
            transactionDate: "2026-10-28 09:30:00",
            accountNumber: "980979977428",
            subAccount: "",
            amountIn: 500000,
            amountOut: 0,
            accumulated: 15500000,
            code: "MB_TXN_001",
            transactionContent: "THANH TOAN GYM-INV-00129",
            referenceNumber: "FT2629100001",
            body: ""
        );

        var (isSuccess, message, matchedCode) = processor.ProcessTransaction(payload, "Apikey smartgym_sepay_secret_2026");

        Assert.True(isSuccess);
        Assert.Equal("GYM-INV-00129", matchedCode);
        Assert.Contains("Đối soát thành công", message);
    }

    [Fact]
    public void ProcessTransaction_ShouldReject_WhenAmountInIsZero()
    {
        var processor = new SePayWebhookProcessor("980979977428", "smartgym_sepay_secret_2026");
        var payload = new SePayWebhookPayload(
            id: 999889,
            gateway: "MBBank",
            transactionDate: "2026-10-28 09:35:00",
            accountNumber: "980979977428",
            subAccount: "",
            amountIn: 0,
            amountOut: 100000,
            accumulated: 15400000,
            code: "MB_TXN_002",
            transactionContent: "GYM-INV-00130 rut tien",
            referenceNumber: "FT2629100002",
            body: ""
        );

        var (isSuccess, message, _) = processor.ProcessTransaction(payload, "Apikey smartgym_sepay_secret_2026");

        Assert.False(isSuccess);
        Assert.Contains("Số tiền nhận vào phải lớn hơn 0", message);
    }
}
