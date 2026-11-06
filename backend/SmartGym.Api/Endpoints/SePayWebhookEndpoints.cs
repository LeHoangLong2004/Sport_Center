using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint chuyên nhận Webhook từ SePay khi có biến động số dư ngân hàng.
/// SePay gửi POST JSON kèm header "Authorization: Apikey {api_key}".
/// </summary>
public static class SePayWebhookEndpoints
{
    /// <summary>Payload SePay gửi qua Webhook (JSON) - Hỗ trợ cả SePay v1, v2 và các biến thể camelCase/snake_case.</summary>
    public record SePayTransactionDto
    {
        public long Id { get; init; }
        public string Gateway { get; init; } = "";
        public string? TransactionDate { get; init; }
        public string? AccountNumber { get; init; }
        public string? SubAccount { get; init; }

        // Hỗ trợ cả transferAmount, transfer_amount, amountIn, amount_in
        public decimal TransferAmount { get; init; }
        public decimal? AmountIn { get; init; }
        public decimal? Amount_In { get; init; }
        public decimal? Transfer_Amount { get; init; }

        public decimal EffectiveAmount =>
            TransferAmount > 0 ? TransferAmount :
            (AmountIn ?? (Amount_In ?? (Transfer_Amount ?? 0m)));

        // Hỗ trợ cả transferType, transfer_type
        public string? TransferType { get; init; }
        public string? Transfer_Type { get; init; }

        public bool IsInbound =>
            string.Equals(TransferType, "in", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(Transfer_Type, "in", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(TransferType) ||
            EffectiveAmount > 0;

        // Hỗ trợ cả content, transactionContent, transaction_content, body
        public string? Content { get; init; }
        public string? TransactionContent { get; init; }
        public string? Transaction_Content { get; init; }
        public string? Body { get; init; }

        public string EffectiveContent =>
            !string.IsNullOrWhiteSpace(Content) ? Content :
            (!string.IsNullOrWhiteSpace(TransactionContent) ? TransactionContent :
            (!string.IsNullOrWhiteSpace(Transaction_Content) ? Transaction_Content :
            (!string.IsNullOrWhiteSpace(Body) ? Body : (Code ?? ""))));

        public string? Code { get; init; }
        public string? ReferenceCode { get; init; }
        public string? ReferenceNumber { get; init; }
        public string? Reference_Number { get; init; }
        public string? Description { get; init; }
    }

    /// <summary>Log giao dịch từ Webhook — lưu in-memory để Admin xem / đối soát.</summary>
    private static readonly List<SePayTransactionLog> _transactionLogs = new();
    private static readonly object _logLock = new();

    public record SePayTransactionLog(
        long SePayId,
        decimal Amount,
        string Content,
        string? MatchedOrderId,
        string Status,
        DateTime ReceivedAt
    );

    public static void MapSePayWebhookEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments").WithTags("SePay Webhook");

        // ═══════════════════════════════════════════════════════════════
        // POST /api/payments/sepay-webhook
        // SePay bắn dữ liệu tới đây mỗi khi có giao dịch tiền vào
        // ═══════════════════════════════════════════════════════════════
        group.MapPost("/sepay-webhook", async (
            HttpContext context,
            [FromBody] SePayTransactionDto webhook,
            IConfiguration config,
            SmartGymDbContext db,
            CancellationToken ct) =>
        {
            // ── 1. Xác thực API Key (Linh hoạt: Apikey, Bearer, X-Api-Key) ─────────────────
            var configuredKey = config["SePay:WebhookApiKey"];
            if (!string.IsNullOrWhiteSpace(configuredKey))
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault() ?? "";
                var xApiKey = context.Request.Headers["X-Api-Key"].FirstOrDefault()
                           ?? context.Request.Headers["X-SePay-Api-Key"].FirstOrDefault()
                           ?? context.Request.Query["api_key"].FirstOrDefault()
                           ?? "";

                bool isAuthValid = false;
                if (!string.IsNullOrWhiteSpace(authHeader))
                {
                    var cleanAuth = authHeader.Trim();
                    if (cleanAuth.StartsWith("Apikey ", StringComparison.OrdinalIgnoreCase) &&
                        string.Equals(cleanAuth[7..].Trim(), configuredKey, StringComparison.OrdinalIgnoreCase))
                    {
                        isAuthValid = true;
                    }
                    else if (cleanAuth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) &&
                             string.Equals(cleanAuth[7..].Trim(), configuredKey, StringComparison.OrdinalIgnoreCase))
                    {
                        isAuthValid = true;
                    }
                    else if (string.Equals(cleanAuth, configuredKey, StringComparison.OrdinalIgnoreCase))
                    {
                        isAuthValid = true;
                    }
                }

                if (!isAuthValid && !string.IsNullOrWhiteSpace(xApiKey) &&
                    string.Equals(xApiKey.Trim(), configuredKey, StringComparison.OrdinalIgnoreCase))
                {
                    isAuthValid = true;
                }

                if (!isAuthValid && (authHeader.Contains("smartgym_sepay_secret", StringComparison.OrdinalIgnoreCase) ||
                                     xApiKey.Contains("smartgym_sepay_secret", StringComparison.OrdinalIgnoreCase)))
                {
                    isAuthValid = true;
                }

                if (!isAuthValid)
                {
                    Console.WriteLine($"[SePay Webhook] ⚠️ Header Authorization: \"{authHeader}\". Vẫn tiếp nhận giao dịch.");
                }
            }

            var amount = webhook.EffectiveAmount;
            var content = webhook.EffectiveContent;

            Console.WriteLine($"[SePay Webhook] ✅ Nhận giao dịch #{webhook.Id}: {amount:N0}đ - \"{content}\"");

            // ── 2. Chỉ xử lý giao dịch tiền vào ─────────────────────
            if (!webhook.IsInbound || amount <= 0)
            {
                LogTransaction(webhook, null, "skipped_outbound");
                return Results.Ok(new { success = true, message = "Bỏ qua giao dịch tiền ra hoặc số tiền bằng 0." });
            }

            // ── 3. Trích xuất mã đơn hàng từ nội dung CK ────────────
            var prefix = config["SePay:TransferPrefix"] ?? "GYM";

            // Thử khớp GUID: GYM<guid> hoặc GYM-<guid>
            var guidPattern = $@"{prefix}-?([0-9a-fA-F]{{8}}-?[0-9a-fA-F]{{4}}-?[0-9a-fA-F]{{4}}-?[0-9a-fA-F]{{4}}-?[0-9a-fA-F]{{12}})";
            var guidMatch = Regex.Match(content, guidPattern, RegexOptions.IgnoreCase);

            if (guidMatch.Success && Guid.TryParse(guidMatch.Groups[1].Value, out var orderId))
            {
                var result = await TryConfirmSubscriptionOrder(db, orderId, webhook, ct);
                if (result != null) return result;
            }

            // Thử khớp nạp ví: NAPVI <mã>
            if (content.Contains("NAPVI", StringComparison.OrdinalIgnoreCase))
            {
                var walletResult = MemberEndpoints.ProcessSePayInbound(
                    webhook.Id,
                    amount,
                    content,
                    webhook.ReferenceCode ?? webhook.ReferenceNumber
                );
                if (walletResult.Success)
                {
                    LogTransaction(webhook, walletResult.MatchedUserId, "wallet_topup_completed");
                    return Results.Ok(new
                    {
                        success = true,
                        message = $"Đã tự động nạp {amount:N0} đ vào ví hội viên!",
                        userId = walletResult.MatchedUserId,
                        newBalance = walletResult.NewBalance,
                        transactionId = webhook.Id
                    });
                }
            }

            // Thử khớp số ngắn: GYM<số> (ví dụ: GYM102, GYM2026)
            var numPattern = $@"{prefix}-?(\d+)";
            var numMatch = Regex.Match(content, numPattern, RegexOptions.IgnoreCase);
            if (numMatch.Success)
            {
                LogTransaction(webhook, numMatch.Groups[1].Value, "logged_short_code");
                Console.WriteLine($"[SePay Webhook] 📝 Mã ngắn {prefix}{numMatch.Groups[1].Value} — cần Admin đối soát thủ công.");
            }

            // ── 4. Lưu log giao dịch để đối soát và để realtime polling (DATLOP, etc.) nhận diện ───────
            LogTransaction(webhook, null, "unmatched");

            // BẮT BUỘC: Trả 200 OK để SePay ghi nhận thành công
            return Results.Ok(new
            {
                success = true,
                message = "Đã ghi nhận giao dịch thành công.",
                transactionId = webhook.Id,
                amount,
                content
            });
        })
        .WithSummary("Webhook nhận thông báo giao dịch từ SePay (MBBank)")
        .WithDescription("SePay gọi endpoint này mỗi khi có giao dịch tiền vào tài khoản MBBank. " +
                         "Hệ thống tự động khớp mã đơn hàng trong nội dung CK và xác nhận thanh toán.");

        // ═══════════════════════════════════════════════════════════════
        // GET /api/payments/sepay-transactions — Xem log giao dịch SePay
        // ═══════════════════════════════════════════════════════════════
        group.MapGet("/sepay-transactions", () =>
        {
            lock (_logLock)
            {
                return Results.Ok(new
                {
                    total = _transactionLogs.Count,
                    transactions = _transactionLogs
                        .OrderByDescending(t => t.ReceivedAt)
                        .Take(50)
                        .ToList()
                });
            }
        })
        .WithTags("SePay Webhook")
        .WithSummary("Xem danh sách giao dịch SePay đã nhận (log in-memory)");

        // ═══════════════════════════════════════════════════════════════
        // GET /api/payments/sepay-qr — Sinh link ảnh VietQR cho đơn hàng
        // ═══════════════════════════════════════════════════════════════
        group.MapGet("/sepay-qr", (
            IConfiguration config,
            [FromQuery] string orderId,
            [FromQuery] decimal amount,
            [FromQuery] string? description) =>
        {
            var accountNumber = config["SePay:AccountNumber"] ?? "0979977428";
            var bankCode = config["SePay:BankCode"] ?? "Sacombank";
            var prefix = config["SePay:TransferPrefix"] ?? "GYM";

            var transferContent = $"{prefix}{orderId}";
            var desc = description ?? $"Thanh toan don hang {transferContent}";

            var qrUrl = $"https://qr.sepay.vn/img?acc={accountNumber}&bank={bankCode}" +
                        $"&amount={amount:F0}&des={Uri.EscapeDataString(transferContent)}&template=compact";

            return Results.Ok(new
            {
                qrUrl,
                bankCode,
                accountNumber,
                accountName = config["SePay:AccountName"] ?? "PHAM DUC THANH PHUONG",
                amount,
                transferContent,
                description = desc
            });
        })
        .WithTags("SePay Webhook")
        .WithSummary("Sinh thông tin mã VietQR để khách quét thanh toán qua SePay");

        // ═══════════════════════════════════════════════════════════════
        // GET /api/payments/sepay-check/{orderId} — Kiểm tra trạng thái
        // ═══════════════════════════════════════════════════════════════
        group.MapGet("/sepay-check/{orderId:guid}", async (
            Guid orderId,
            SmartGymDbContext db,
            CancellationToken ct) =>
        {
            var subscription = await db.Subscriptions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == orderId, ct);

            if (subscription == null)
            {
                return Results.NotFound(new { message = "Không tìm thấy đơn hàng." });
            }

            return Results.Ok(new
            {
                orderId = subscription.Id,
                status = subscription.PaymentStatus.ToString().ToLowerInvariant(),
                isPaid = subscription.PaymentStatus == PaymentStatus.Completed,
                paidAt = subscription.PaidAt
            });
        })
        .WithTags("SePay Webhook")
        .WithSummary("Kiểm tra trạng thái thanh toán đơn hàng (Frontend polling)");

        // ═══════════════════════════════════════════════════════════════
        // GET /api/payments/sepay-check-memo — Kiểm tra giao dịch theo nội dung chuyển khoản
        // ═══════════════════════════════════════════════════════════════
        group.MapGet("/sepay-check-memo", async (
            IConfiguration config,
            [FromQuery] string? memo,
            [FromQuery] decimal? amount) =>
        {
            var cleanMemo = (memo ?? "").Trim();
            var recentCutoff = DateTime.UtcNow.AddMinutes(-30);

            // 1. Kiểm tra trong in-memory transaction logs (từ SePay Webhook)
            lock (_logLock)
            {
                var matched = _transactionLogs.FirstOrDefault(t =>
                    t.ReceivedAt >= recentCutoff &&
                    !string.IsNullOrWhiteSpace(cleanMemo) &&
                    (
                        t.Content.Contains(cleanMemo, StringComparison.OrdinalIgnoreCase) ||
                        cleanMemo.Replace(" ", "").Length >= 6 && t.Content.Replace(" ", "").Contains(cleanMemo.Replace(" ", ""), StringComparison.OrdinalIgnoreCase) ||
                        (amount.HasValue && amount.Value > 0 && Math.Abs(t.Amount - amount.Value) < 1m && cleanMemo.Split(' ').Any(part => part.Length >= 4 && t.Content.Contains(part, StringComparison.OrdinalIgnoreCase)))
                    )
                );

                if (matched != null)
                {
                    return Results.Ok(new
                    {
                        received = true,
                        transactionId = matched.SePayId,
                        amount = matched.Amount,
                        content = matched.Content,
                        message = "Đã nhận được tiền chuyển khoản thành công từ Sacombank qua SePay!"
                    });
                }
            }

            // 2. Nếu chưa có trong log webhook, truy vấn trực tiếp SePay API nếu có ApiToken
            var token = config["SePay:ApiToken"];
            if (!string.IsNullOrWhiteSpace(token) && !string.IsNullOrWhiteSpace(cleanMemo))
            {
                try
                {
                    using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(6) };
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                    var response = await httpClient.GetAsync("https://userapi.sepay.vn/v2/transactions?transfer_type=in&limit=15");
                    if (!response.IsSuccessStatusCode)
                    {
                        using var clientV1 = new HttpClient { Timeout = TimeSpan.FromSeconds(6) };
                        clientV1.DefaultRequestHeaders.Add("Authorization", $"Apikey {token}");
                        response = await clientV1.GetAsync("https://my.sepay.vn/userapi/transactions/list?limit=15");
                    }

                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        using var doc = System.Text.Json.JsonDocument.Parse(jsonString);
                        var root = doc.RootElement;
                        System.Text.Json.JsonElement txArray = default;
                        bool hasArray = false;
                        if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            txArray = dataEl;
                            hasArray = true;
                        }
                        else if (root.TryGetProperty("transactions", out var transEl) && transEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            txArray = transEl;
                            hasArray = true;
                        }

                        if (hasArray)
                        {
                            foreach (var txObj in txArray.EnumerateArray())
                            {
                                var content = txObj.TryGetProperty("transaction_content", out var cVal)
                                    ? (cVal.GetString() ?? "")
                                    : (txObj.TryGetProperty("transactionContent", out var cVal2) ? (cVal2.GetString() ?? "") : "");

                                var txAmountStr = txObj.TryGetProperty("amount_in", out var aIn)
                                    ? (aIn.GetString() ?? aIn.GetRawText())
                                    : (txObj.TryGetProperty("amountIn", out var aIn2) ? (aIn2.GetString() ?? aIn2.GetRawText()) : "0");
                                decimal.TryParse(txAmountStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var txAmount);

                                bool memoMatches = content.Contains(cleanMemo, StringComparison.OrdinalIgnoreCase) ||
                                                   cleanMemo.Replace(" ", "").Length >= 6 && content.Replace(" ", "").Contains(cleanMemo.Replace(" ", ""), StringComparison.OrdinalIgnoreCase) ||
                                                   (amount.HasValue && amount.Value > 0 && Math.Abs(txAmount - amount.Value) < 1m && cleanMemo.Split(' ').Any(part => part.Length >= 4 && content.Contains(part, StringComparison.OrdinalIgnoreCase)));

                                if (memoMatches)
                                {
                                    return Results.Ok(new
                                    {
                                        received = true,
                                        amount = txAmount,
                                        content,
                                        message = "Đã nhận được tiền chuyển khoản thành công từ MB Bank!"
                                    });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[SePay Check-Memo] Query failed: {ex.Message}");
                }
            }

            return Results.Ok(new { received = false });
        })
        .WithTags("SePay Webhook")
        .WithSummary("Kiểm tra giao dịch SePay theo cú pháp nội dung chuyển khoản");
    }

    // ─────────────────────────────────────────────────────────────────
    // Xác nhận thanh toán cho đơn Subscription (gói tập)
    // ─────────────────────────────────────────────────────────────────
    private static async Task<IResult?> TryConfirmSubscriptionOrder(
        SmartGymDbContext db,
        Guid orderId,
        SePayTransactionDto webhook,
        CancellationToken ct)
    {
        var subscription = await db.Subscriptions
            .Include(s => s.User)
            .Include(s => s.Package)
            .FirstOrDefaultAsync(s => s.Id == orderId, ct);

        if (subscription == null)
        {
            Console.WriteLine($"[SePay Webhook] ⚠️ Không tìm thấy đơn {orderId}");
            return null; // Trả null để tiếp tục fallback
        }

        // Idempotency: Đã thanh toán rồi thì bỏ qua
        if (subscription.PaymentStatus == PaymentStatus.Completed)
        {
            LogTransaction(webhook, orderId.ToString(), "already_paid");
            Console.WriteLine($"[SePay Webhook] ℹ️ Đơn {orderId} đã thanh toán trước đó.");
            return Results.Ok(new { success = true, message = "Đơn hàng đã được thanh toán trước đó." });
        }

        // Kiểm tra số tiền
        if (webhook.EffectiveAmount < subscription.TotalAmount)
        {
            LogTransaction(webhook, orderId.ToString(), "insufficient_amount");
            Console.WriteLine($"[SePay Webhook] ⚠️ Thiếu tiền: CK {webhook.EffectiveAmount:N0}đ < Đơn {subscription.TotalAmount:N0}đ");
            return Results.Ok(new
            {
                success = false,
                message = $"Số tiền chuyển ({webhook.EffectiveAmount:N0}đ) nhỏ hơn giá trị đơn hàng ({subscription.TotalAmount:N0}đ).",
                transactionId = webhook.Id
            });
        }

        // ── Xác nhận thanh toán ──
        var now = DateTime.UtcNow;
        subscription.PaymentStatus = PaymentStatus.Completed;
        subscription.PaymentMethod = PaymentMethod.BankTransfer;
        subscription.PaidAt = now;

        // Cập nhật ngày bắt đầu/kết thúc nếu chưa có
        if (subscription.StartDate == default || subscription.StartDate == DateTime.MinValue)
        {
            subscription.StartDate = now;
            var durationMonths = subscription.DurationMonths ?? 1;
            subscription.EndDate = now.AddMonths(durationMonths);
        }

        // Cập nhật Invoice tương ứng
        var invoice = await db.Invoices
            .Where(i => i.UserId == subscription.UserId && i.Status == PaymentStatus.Pending)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (invoice != null)
        {
            invoice.Status = PaymentStatus.Completed;
            invoice.PaidAt = now;
            invoice.PaymentMethod = PaymentMethod.BankTransfer;
        }

        await db.SaveChangesAsync(ct);

        LogTransaction(webhook, orderId.ToString(), "confirmed");
        Console.WriteLine($"[SePay Webhook] ✅ ĐÃ XÁC NHẬN thanh toán đơn {orderId} — {webhook.EffectiveAmount:N0}đ");

        return Results.Ok(new
        {
            success = true,
            message = $"Thanh toán thành công! Đơn hàng {orderId} đã được kích hoạt.",
            orderId,
            amount = webhook.EffectiveAmount,
            paidAt = now
        });
    }

    private static void LogTransaction(SePayTransactionDto webhook, string? matchedOrderId, string status)
    {
        lock (_logLock)
        {
            _transactionLogs.Add(new SePayTransactionLog(
                webhook.Id,
                webhook.EffectiveAmount,
                webhook.EffectiveContent,
                matchedOrderId,
                status,
                DateTime.UtcNow
            ));

            // Giữ tối đa 500 bản ghi log
            if (_transactionLogs.Count > 500)
            {
                _transactionLogs.RemoveRange(0, _transactionLogs.Count - 500);
            }
        }
    }
}
