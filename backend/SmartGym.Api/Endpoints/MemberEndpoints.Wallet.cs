using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        // In-memory persistent thread-safe wallet store per user
        private static readonly ConcurrentDictionary<string, decimal> _memberWallets = new();
        private static readonly ConcurrentDictionary<string, List<WalletTransactionDto>> _memberWalletTransactions = new();

        public record WalletTransactionDto(
            string Id,
            string Type,
            decimal Amount,
            string Method,
            string Note,
            DateTime CreatedAt,
            string Status
        );

        public record TopUpRequest(
            decimal Amount,
            string? Method,
            string? Note,
            string? Status = "completed",
            string? Id = null
        );

        private static void MapMemberWalletEndpoints(RouteGroupBuilder group)
        {
            var wallet = group.MapGroup("/wallet");

            // 1. GET /api/member/wallet - Lấy số dư và lịch sử giao dịch ví
            wallet.MapGet("/", (HttpContext context) =>
            {
                var userId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                // Mặc định tài khoản mới tạo luôn là 0 đ và chưa có giao dịch
                var transactions = _memberWalletTransactions.GetOrAdd(userId, _ => new List<WalletTransactionDto>());
                lock (transactions)
                {
                    // Loại bỏ triệt để bất kỳ giao dịch mẫu 500k trước đây
                    transactions.RemoveAll(t => t.Id == "WTX-INIT-01" 
                                             || t.Id.EndsWith("-001") 
                                             || t.Note.Contains("ban đầu") 
                                             || (t.Amount == 500000m && t.Note == "Nạp tiền ví hội viên SportCenter"));
                }

                // Nếu không có giao dịch nạp thành công thực tế, số dư bắt buộc là 0 đ
                var balance = _memberWallets.GetOrAdd(userId, _ => 0m);
                var hasCompleted = transactions.Any(t => t.Status == "completed" && (t.Type == "topup" || t.Type == "refund"));
                if (!hasCompleted && transactions.All(t => t.Type != "refund"))
                {
                    balance = 0m;
                    _memberWallets[userId] = 0m;
                }

                return Results.Ok(new
                {
                    memberId = userId,
                    balance,
                    currency = "VND",
                    transactions = transactions.OrderByDescending(t => t.CreatedAt)
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Lấy thông tin số dư tài khoản và lịch sử biến động số dư ví của hội viên");

            // 2. POST /api/member/wallet/topup - Nạp tiền vào tài khoản hội viên
            wallet.MapPost("/topup", (HttpContext context, [FromBody] TopUpRequest request) =>
            {
                if (request.Amount <= 0)
                {
                    return Results.BadRequest(new { message = "Số tiền nạp phải lớn hơn 0." });
                }

                if (request.Amount > 100000000m)
                {
                    return Results.BadRequest(new { message = "Số tiền nạp một lần không được vượt quá 100.000.000 đ." });
                }

                var userId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var method = string.IsNullOrWhiteSpace(request.Method) ? "VietQR" : request.Method;
                var note = string.IsNullOrWhiteSpace(request.Note) ? "Nạp tiền vào tài khoản SportCenter" : request.Note;
                var isPending = string.Equals(request.Status, "pending", StringComparison.OrdinalIgnoreCase);

                var txId = !string.IsNullOrWhiteSpace(request.Id)
                    ? request.Id
                    : (isPending
                        ? $"TOPUP-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}"
                        : $"WTX-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}");

                decimal currentBalance = _memberWallets.GetOrAdd(userId, _ => 0m);
                decimal newBalance = currentBalance;

                // CHỈ cộng vào số dư ví nếu không phải là pending (chờ thanh toán tại quầy)
                if (!isPending)
                {
                    newBalance = _memberWallets.AddOrUpdate(
                        userId,
                        request.Amount,
                        (_, current) => current + request.Amount
                    );
                }

                var tx = new WalletTransactionDto(
                    txId,
                    "topup",
                    request.Amount,
                    method,
                    note,
                    DateTime.UtcNow,
                    isPending ? "pending" : "completed"
                );

                var txList = _memberWalletTransactions.GetOrAdd(userId, _ => new List<WalletTransactionDto>());
                lock (txList)
                {
                    txList.Insert(0, tx);
                }

                return Results.Ok(new
                {
                    success = true,
                    message = isPending
                        ? $"Đã tạo phiếu nạp tại quầy {request.Amount:N0} đ. Vui lòng thanh toán tại quầy lễ tân."
                        : $"Nạp thành công {request.Amount:N0} đ vào tài khoản.",
                    balance = newBalance,
                    transaction = tx
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Nạp tiền vào tài khoản/ví của hội viên");

            // 2.1 POST /api/member/wallet/confirm-pending/{txId} - Xác nhận đã thu tiền phiếu nạp tại quầy
            wallet.MapPost("/confirm-pending/{txId}", (HttpContext context, string txId) =>
            {
                var userId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var txList = _memberWalletTransactions.GetOrAdd(userId, _ => new List<WalletTransactionDto>());
                WalletTransactionDto? targetTx = null;
                lock (txList)
                {
                    var idx = txList.FindIndex(t => t.Id == txId && t.Status == "pending");
                    if (idx >= 0)
                    {
                        var old = txList[idx];
                        targetTx = old with { Status = "completed" };
                        txList[idx] = targetTx;
                    }
                }

                if (targetTx == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy giao dịch chờ xử lý phù hợp." });
                }

                var newBalance = _memberWallets.AddOrUpdate(
                    userId,
                    targetTx.Amount,
                    (_, current) => current + targetTx.Amount
                );

                return Results.Ok(new
                {
                    success = true,
                    message = $"Xác nhận nạp thành công {targetTx.Amount:N0} đ vào tài khoản.",
                    balance = newBalance,
                    transaction = targetTx
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Xác nhận phiếu nạp tiền tại quầy của hội viên");

            // 3. POST /api/member/wallet/pay - Trừ tiền từ ví hội viên khi mua dịch vụ
            wallet.MapPost("/pay", (HttpContext context, [FromBody] TopUpRequest request) =>
            {
                if (request.Amount <= 0)
                {
                    return Results.BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0." });
                }

                var userId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var currentBalance = _memberWallets.GetOrAdd(userId, _ => 0m);
                if (currentBalance < request.Amount)
                {
                    return Results.BadRequest(new { message = "Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền." });
                }

                var newBalance = _memberWallets.AddOrUpdate(
                    userId,
                    0m,
                    (_, current) => current - request.Amount
                );

                var tx = new WalletTransactionDto(
                    $"WTX-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
                    "payment",
                    request.Amount,
                    request.Method ?? "Ví điện tử",
                    request.Note ?? "Thanh toán dịch vụ SportCenter",
                    DateTime.UtcNow,
                    "completed"
                );

                var txList = _memberWalletTransactions.GetOrAdd(userId, _ => new List<WalletTransactionDto>());
                lock (txList)
                {
                    txList.Insert(0, tx);
                }

                return Results.Ok(new
                {
                    success = true,
                    message = $"Thanh toán thành công {request.Amount:N0} đ từ ví.",
                    balance = newBalance,
                    transaction = tx
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Trừ tiền ví khi thanh toán dịch vụ");

            // 4. GET /api/member/wallet/check-transfer - Kiểm tra tự động hoặc xác nhận chuyển khoản VietQR
            wallet.MapGet("/check-transfer", async (HttpContext context, IConfiguration config, [FromQuery] string? memo, [FromQuery] decimal? amount, [FromQuery] string? sepayToken, [FromQuery] bool? confirm) =>
            {
                var userId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var cleanMemo = (memo ?? "").Trim();
                var txList = _memberWalletTransactions.GetOrAdd(userId, _ => new List<WalletTransactionDto>());

                // Chỉ kiểm tra giao dịch thật từ Webhook hoặc từ API Ngân hàng/SePay


                // 4.1. Kiểm tra trong bộ nhớ (nếu đã nhận được qua Webhook hoặc mô phỏng)
                lock (txList)
                {
                    var recentCutoff = DateTime.UtcNow.AddMinutes(-2);
                    var matched = txList.FirstOrDefault(t =>
                        t.Status == "completed" &&
                        t.Type == "topup" &&
                        t.CreatedAt >= recentCutoff &&
                        !string.IsNullOrWhiteSpace(cleanMemo) &&
                        t.Note.Contains(cleanMemo, StringComparison.OrdinalIgnoreCase) &&
                        (!amount.HasValue || amount.Value <= 0 || t.Amount == amount.Value)
                    );

                    if (matched != null)
                    {
                        var bal = _memberWallets.GetOrAdd(userId, _ => 0m);
                        return Results.Ok(new
                        {
                            received = true,
                            message = "Đã nhận được tiền chuyển khoản thành công từ ngân hàng!",
                            balance = bal,
                            transaction = matched
                        });
                    }
                }

                // 4.2. GỌI TRỰC TIẾP SEPAY API ĐỂ TRUY VẤN BIẾN ĐỘNG SỐ DƯ VIETCOMBANK THỰC TẾ
                var token = !string.IsNullOrWhiteSpace(sepayToken)
                    ? sepayToken
                    : (context.Request.Headers["X-SePay-Token"].FirstOrDefault()
                       ?? config["SePay:ApiToken"]);

                if (!string.IsNullOrWhiteSpace(token))
                {
                    try
                    {
                        using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

                        var response = await httpClient.GetAsync("https://userapi.sepay.vn/v2/transactions?transfer_type=in&limit=20");
                        if (!response.IsSuccessStatusCode)
                        {
                            // Fallback thử endpoint v1 với Apikey
                            using var clientV1 = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
                            clientV1.DefaultRequestHeaders.Add("Authorization", $"Apikey {token}");
                            response = await clientV1.GetAsync("https://my.sepay.vn/userapi/transactions/list?limit=20");
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
                                    var txAmountStr = txObj.TryGetProperty("amount_in", out var aIn)
                                        ? (aIn.GetString() ?? aIn.GetRawText())
                                        : (txObj.TryGetProperty("amountIn", out var aIn2) ? (aIn2.GetString() ?? aIn2.GetRawText()) : "0");
                                    decimal.TryParse(txAmountStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var txAmount);
                                    
                                    var content = txObj.TryGetProperty("transaction_content", out var cVal)
                                        ? (cVal.GetString() ?? "")
                                        : (txObj.TryGetProperty("transactionContent", out var cVal2) ? (cVal2.GetString() ?? "") : "");
                                    var refNo = txObj.TryGetProperty("reference_number", out var rVal)
                                        ? (rVal.GetString() ?? "")
                                        : (txObj.TryGetProperty("referenceNumber", out var rVal2) ? (rVal2.GetString() ?? "") : "");
                                    var txId = txObj.TryGetProperty("id", out var idVal) ? idVal.GetRawText() : "";

                                    bool amountMatches = !amount.HasValue || amount.Value <= 0 || Math.Abs(txAmount - amount.Value) < 1m || txAmount >= amount.Value;
                                    // Khớp nếu nội dung chứa memo, HOẶC nếu số tiền khớp chính xác (phòng trường hợp người chuyển quên sửa nội dung mặc định của ngân hàng/MoMo)
                                    bool memoMatches = string.IsNullOrWhiteSpace(cleanMemo) 
                                        || content.Contains(cleanMemo, StringComparison.OrdinalIgnoreCase)
                                        || (amount.HasValue && amount.Value > 0 && Math.Abs(txAmount - amount.Value) < 1m);

                                    if (amountMatches && memoMatches)
                                    {
                                        // Kiểm tra xem giao dịch này đã được ghi nhận trước đó chưa (tránh nạp trùng)
                                        bool alreadyProcessed = false;
                                        lock (txList)
                                        {
                                            alreadyProcessed = txList.Any(t => t.Id == $"SEPAY-{txId}" || (!string.IsNullOrEmpty(refNo) && t.Note.Contains(refNo)));
                                        }

                                        if (!alreadyProcessed)
                                        {
                                            var newBalance = _memberWallets.AddOrUpdate(
                                                userId,
                                                txAmount > 0 ? txAmount : (amount ?? 100000m),
                                                (_, current) => current + (txAmount > 0 ? txAmount : (amount ?? 100000m))
                                            );

                                            var newTx = new WalletTransactionDto(
                                                $"SEPAY-{txId}",
                                                "topup",
                                                txAmount > 0 ? txAmount : (amount ?? 100000m),
                                                "SePay Live API",
                                                $"Hệ thống báo có: {content} (Mã GD: {refNo})",
                                                DateTime.UtcNow,
                                                "completed"
                                            );

                                            lock (txList)
                                            {
                                                txList.Insert(0, newTx);
                                            }

                                            return Results.Ok(new
                                            {
                                                received = true,
                                                message = $"Đã phát hiện giao dịch thật {(txAmount > 0 ? txAmount : (amount ?? 0)):N0} đ! Số dư ví đã được cộng thành công.",
                                                balance = newBalance,
                                                transaction = newTx,
                                                isLiveBank = true
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[SePay API Error]: {ex.Message}");
                    }
                }

                return Results.Ok(new
                {
                    received = false,
                    hasToken = !string.IsNullOrWhiteSpace(token),
                    message = !string.IsNullOrWhiteSpace(token)
                        ? "Đã kết nối SePay nhưng chưa tìm thấy giao dịch tiền vào khớp với số tiền và nội dung. Vui lòng chuyển khoản và thử lại sau ít giây!"
                        : "Chưa cấu hình SePay API Token để đọc biến động số dư thực tế. Vui lòng nhập SePay Token từ my.sepay.vn để kích hoạt kiểm tra tiền thật."
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Kiểm tra biến động số dư chuyển khoản tự động hoặc qua SePay Live API");

            // 5. POST /api/member/wallet/sepay-webhook - Cổng Webhook nhận dữ liệu tự động từ SePay/Casso
            wallet.MapPost("/sepay-webhook", ([FromBody] SepayWebhookRequest payload) =>
            {
                var amount = (payload.amountIn ?? 0m) > 0 ? (payload.amountIn ?? 0m) : (payload.transferAmount ?? 0m);
                var content = !string.IsNullOrWhiteSpace(payload.transactionContent)
                    ? payload.transactionContent
                    : (!string.IsNullOrWhiteSpace(payload.content) ? payload.content : (payload.body ?? ""));

                var (success, newBalance, matchedUserId, tx) = ProcessSePayInbound(
                    payload.id ?? DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    amount,
                    content,
                    payload.referenceNumber
                );

                if (!success)
                {
                    return Results.Ok(new { success = false, message = "Không phải giao dịch tiền vào hoặc số tiền bằng 0." });
                }

                return Results.Ok(new
                {
                    success = true,
                    message = "Webhook đã ghi nhận biến động số dư và tự động nạp tiền vào ví!",
                    userId = matchedUserId,
                    newBalance,
                    transaction = tx
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Webhook nhận thông báo biến động số dư tự động từ SePay/Casso");

            // 6. POST /api/member/wallet/simulate-webhook - Mô phỏng Webhook tiền về tức thì (Dành cho Test / Demo)
            wallet.MapPost("/simulate-webhook", (HttpContext context, [FromBody] TopUpRequest request) =>
            {
                var userId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var amount = request.Amount > 0 ? request.Amount : 100000m;
                var note = string.IsNullOrWhiteSpace(request.Note) ? "NAPVI 5667" : request.Note;

                var newBalance = _memberWallets.AddOrUpdate(
                    userId,
                    amount,
                    (_, current) => current + amount
                );

                var tx = new WalletTransactionDto(
                    $"SEPAY-SIM-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                    "topup",
                    amount,
                    "SePay Webhook",
                    $"[Mô phỏng Webhook] Hệ thống báo có: {note}",
                    DateTime.UtcNow,
                    "completed"
                );

                var txList = _memberWalletTransactions.GetOrAdd(userId, _ => new List<WalletTransactionDto>());
                lock (txList)
                {
                    txList.Insert(0, tx);
                }

                return Results.Ok(new
                {
                    success = true,
                    message = $"Mô phỏng Webhook thành công! Đã nhận {amount:N0} đ",
                    balance = newBalance,
                    transaction = tx
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Mô phỏng Webhook báo có tiền dành cho demo");
        }

        public static (bool Success, decimal NewBalance, string MatchedUserId, WalletTransactionDto? Tx) ProcessSePayInbound(
            long txId,
            decimal amount,
            string content,
            string? referenceNumber = null)
        {
            if (amount <= 0) return (false, 0, "", null);

            string? matchedUserId = null;
            foreach (var (uId, txs) in _memberWalletTransactions)
            {
                lock (txs)
                {
                    if (txs.Any(t => (!string.IsNullOrEmpty(t.Note) && t.Note.Contains(content, StringComparison.OrdinalIgnoreCase)) ||
                                     (!string.IsNullOrEmpty(t.Id) && content.Contains(t.Id, StringComparison.OrdinalIgnoreCase))))
                    {
                        matchedUserId = uId;
                        break;
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(matchedUserId))
            {
                matchedUserId = _memberWallets.Keys.FirstOrDefault(k => k != "m-default") ?? "m-default";
            }

            var newBalance = _memberWallets.AddOrUpdate(
                matchedUserId,
                amount,
                (_, current) => current + amount
            );

            var tx = new WalletTransactionDto(
                $"SEPAY-{txId}",
                "topup",
                amount,
                "SePay Webhook",
                $"Hệ thống báo có: {content} (Ref: {referenceNumber ?? "Napas 247"})",
                DateTime.UtcNow,
                "completed"
            );

            var txList = _memberWalletTransactions.GetOrAdd(matchedUserId, _ => new List<WalletTransactionDto>());
            lock (txList)
            {
                txList.Insert(0, tx);
            }

            return (true, newBalance, matchedUserId, tx);
        }

        public record SepayWebhookRequest(
            long? id,
            string? gateway,
            string? transactionDate,
            string? accountNumber,
            decimal? amountIn,
            decimal? amountOut,
            decimal? accumulated,
            string? code,
            string? transactionContent,
            string? referenceNumber,
            string? body,
            decimal? transferAmount = null,
            string? content = null
        );
    }
}

