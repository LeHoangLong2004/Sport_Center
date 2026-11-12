using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    /// <summary>
    /// Partial class quản lý toàn bộ các tính năng Ví điện tử & Số dư tài khoản của Hội viên (Member Wallet Endpoints).
    /// Hỗ trợ: Tra cứu số dư, nạp tiền VietQR/Thẻ/Quầy, xác nhận nạp tiền, trừ tiền ví khi mua dịch vụ,
    /// đồng bộ giao dịch ngân hàng thực tế qua SePay Live API và Webhook tự động.
    /// Dữ liệu biến động số dư được ghi nhận và đối soát trực tiếp trong CSDL PostgreSQL (bảng wallet_transactions).
    /// </summary>
    public static partial class MemberEndpoints
    {
        private static void MapMemberWalletEndpoints(RouteGroupBuilder group)
        {
            var wallet = group.MapGroup("/wallet");

            // 1. GET /api/member/wallet - Lấy số dư và lịch sử giao dịch ví (kết nối trực tiếp Database)
            wallet.MapGet("/", async (HttpContext context, SmartGymDbContext db) =>
            {
                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);
                decimal balance;
                List<WalletTransactionDto> transactions;

                if (memberGuid.HasValue)
                {
                    balance = await GetMemberBalanceFromDbAsync(memberGuid.Value, db);
                    transactions = await GetMemberTransactionsFromDbAsync(memberGuid.Value, db);

                    // Đồng bộ cache RAM
                    _memberWallets[rawUserId] = balance;
                    _memberWallets[memberGuid.Value.ToString()] = balance;
                    _memberWalletTransactions[rawUserId] = transactions;
                    _memberWalletTransactions[memberGuid.Value.ToString()] = transactions;
                }
                else
                {
                    transactions = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());
                    lock (transactions)
                    {
                        transactions.RemoveAll(t => t.Id == "WTX-INIT-01" 
                                                 || t.Id.EndsWith("-001") 
                                                 || t.Note.Contains("ban đầu") 
                                                 || (t.Amount == 500000m && t.Note == "Nạp tiền ví hội viên SportCenter"));
                    }

                    balance = _memberWallets.GetOrAdd(rawUserId, _ => 0m);
                    var hasCompleted = transactions.Any(t => t.Status == "completed" && (t.Type == "topup" || t.Type == "refund"));
                    if (!hasCompleted && transactions.All(t => t.Type != "refund"))
                    {
                        balance = 0m;
                        _memberWallets[rawUserId] = 0m;
                    }
                }

                return Results.Ok(new
                {
                    memberId = memberGuid?.ToString() ?? rawUserId,
                    balance,
                    currency = "VND",
                    transactions = transactions.OrderByDescending(t => t.CreatedAt)
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Lấy thông tin số dư tài khoản và lịch sử biến động số dư ví của hội viên từ Database");

            // 2. POST /api/member/wallet/topup - Nạp tiền vào tài khoản hội viên và lưu vào Database
            wallet.MapPost("/topup", async (HttpContext context, [FromBody] TopUpRequest request, SmartGymDbContext db) =>
            {
                if (request.Amount <= 0)
                {
                    return Results.BadRequest(new { message = "Số tiền nạp phải lớn hơn 0." });
                }

                if (request.Amount > 100000000m)
                {
                    return Results.BadRequest(new { message = "Số tiền nạp một lần không được vượt quá 100.000.000 đ." });
                }

                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);
                var method = string.IsNullOrWhiteSpace(request.Method) ? "VietQR" : request.Method;
                var note = string.IsNullOrWhiteSpace(request.Note) ? "Nạp tiền vào tài khoản SportCenter" : request.Note;
                var isPending = string.Equals(request.Status, "pending", StringComparison.OrdinalIgnoreCase);

                var txId = !string.IsNullOrWhiteSpace(request.Id)
                    ? request.Id
                    : (isPending
                        ? $"TOPUP-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}"
                        : $"WTX-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}");

                decimal currentBalance = memberGuid.HasValue
                    ? await GetMemberBalanceFromDbAsync(memberGuid.Value, db)
                    : _memberWallets.GetOrAdd(rawUserId, _ => 0m);

                // Idempotency: cùng một mã giao dịch (vd SEPAY-{id}) chỉ được cộng ví đúng 1 lần
                if (!isPending && !string.IsNullOrWhiteSpace(request.Id))
                {
                    var alreadyRecorded = false;
                    if (memberGuid.HasValue)
                    {
                        try
                        {
                            var cnt = await db.Database.SqlQueryRaw<int>(
                                "SELECT COUNT(*)::int AS \"Value\" FROM wallet_transactions WHERE reference_code = {0}",
                                request.Id
                            ).ToListAsync();
                            alreadyRecorded = cnt.FirstOrDefault() > 0;
                        }
                        catch { }
                    }
                    else
                    {
                        var memList = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());
                        lock (memList) { alreadyRecorded = memList.Any(t => t.Id == request.Id); }
                    }

                    if (alreadyRecorded)
                    {
                        return Results.Ok(new
                        {
                            success = true,
                            duplicate = true,
                            message = "Giao dịch này đã được ghi nhận trước đó, không cộng tiền lần nữa.",
                            balance = currentBalance,
                            transaction = new WalletTransactionDto(
                                request.Id,
                                "topup",
                                request.Amount,
                                method,
                                note,
                                DateTime.UtcNow,
                                "completed"
                            )
                        });
                    }
                }

                decimal newBalance = isPending ? currentBalance : currentBalance + request.Amount;

                var tx = new WalletTransactionDto(
                    txId,
                    "topup",
                    request.Amount,
                    method,
                    note,
                    DateTime.UtcNow,
                    isPending ? "pending" : "completed"
                );

                if (memberGuid.HasValue)
                {
                    await RecordWalletTransactionInDbAsync(
                        db,
                        memberGuid.Value,
                        txId,
                        "topup",
                        request.Amount,
                        newBalance,
                        method,
                        note,
                        isPending ? "pending" : "completed",
                        tx.CreatedAt
                    );
                }

                if (!isPending)
                {
                    _memberWallets[rawUserId] = newBalance;
                    if (memberGuid.HasValue) _memberWallets[memberGuid.Value.ToString()] = newBalance;
                }

                var txList = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());
                lock (txList)
                {
                    txList.Insert(0, tx);
                }
                if (memberGuid.HasValue && memberGuid.Value.ToString() != rawUserId)
                {
                    var guidTxList = _memberWalletTransactions.GetOrAdd(memberGuid.Value.ToString(), _ => new List<WalletTransactionDto>());
                    lock (guidTxList)
                    {
                        guidTxList.Insert(0, tx);
                    }
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
            .WithSummary("Nạp tiền vào tài khoản/ví của hội viên và lưu vết vào Database");

            // 2.1 POST /api/member/wallet/confirm-pending/{txId} - Xác nhận đã thu tiền phiếu nạp tại quầy
            wallet.MapPost("/confirm-pending/{txId}", async (HttpContext context, string txId, SmartGymDbContext db) =>
            {
                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);

                var txList = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());
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

                decimal amount = targetTx?.Amount ?? 0m;
                if (targetTx == null && memberGuid.HasValue)
                {
                    var dbTxs = await GetMemberTransactionsFromDbAsync(memberGuid.Value, db);
                    var dbPending = dbTxs.FirstOrDefault(t => (t.Id == txId) && t.Status == "pending");
                    if (dbPending != null)
                    {
                        targetTx = dbPending with { Status = "completed" };
                        amount = targetTx.Amount;
                    }
                }

                if (targetTx == null)
                {
                    return Results.NotFound(new { message = $"Không tìm thấy giao dịch chờ '{txId}'." });
                }

                if (memberGuid.HasValue)
                {
                    await ConfirmPendingTransactionInDbAsync(db, memberGuid.Value, txId, amount);
                }

                decimal newBalance = memberGuid.HasValue
                    ? await GetMemberBalanceFromDbAsync(memberGuid.Value, db)
                    : _memberWallets.AddOrUpdate(rawUserId, amount, (_, current) => current + amount);

                _memberWallets[rawUserId] = newBalance;
                if (memberGuid.HasValue) _memberWallets[memberGuid.Value.ToString()] = newBalance;

                return Results.Ok(new
                {
                    success = true,
                    message = $"Đã xác nhận thu tiền thành công {amount:N0} đ tại quầy.",
                    balance = newBalance,
                    transaction = targetTx
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Xác nhận thu tiền tại quầy cho phiếu nạp tiền đang ở trạng thái pending");

            // 3. POST /api/member/wallet/pay - Trừ tiền từ ví hội viên khi mua dịch vụ và lưu vào Database
            wallet.MapPost("/pay", async (HttpContext context, [FromBody] TopUpRequest request, SmartGymDbContext db) =>
            {
                if (request.Amount <= 0)
                {
                    return Results.BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0." });
                }

                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);
                var currentBalance = memberGuid.HasValue
                    ? await GetMemberBalanceFromDbAsync(memberGuid.Value, db)
                    : _memberWallets.GetOrAdd(rawUserId, _ => 0m);

                if (currentBalance < request.Amount)
                {
                    return Results.BadRequest(new { message = "Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền." });
                }

                var newBalance = currentBalance - request.Amount;
                var txId = $"WTX-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}";
                var method = request.Method ?? "Ví điện tử";
                var note = request.Note ?? "Thanh toán dịch vụ SportCenter";

                var tx = new WalletTransactionDto(
                    txId,
                    "payment",
                    request.Amount,
                    method,
                    note,
                    DateTime.UtcNow,
                    "completed"
                );

                if (memberGuid.HasValue)
                {
                    await RecordWalletTransactionInDbAsync(
                        db,
                        memberGuid.Value,
                        txId,
                        "payment",
                        request.Amount,
                        newBalance,
                        method,
                        note,
                        "completed",
                        tx.CreatedAt
                    );
                }

                _memberWallets[rawUserId] = newBalance;
                if (memberGuid.HasValue) _memberWallets[memberGuid.Value.ToString()] = newBalance;

                var txList = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());
                lock (txList)
                {
                    txList.Insert(0, tx);
                }
                if (memberGuid.HasValue && memberGuid.Value.ToString() != rawUserId)
                {
                    var guidTxList = _memberWalletTransactions.GetOrAdd(memberGuid.Value.ToString(), _ => new List<WalletTransactionDto>());
                    lock (guidTxList)
                    {
                        guidTxList.Insert(0, tx);
                    }
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
            .WithSummary("Trừ tiền ví khi thanh toán dịch vụ và lưu vết biến động số dư vào Database");

            // 4. GET /api/member/wallet/check-transfer - Kiểm tra tự động hoặc xác nhận chuyển khoản VietQR
            wallet.MapGet("/check-transfer", async (HttpContext context, IConfiguration config, SmartGymDbContext db, [FromQuery] string? memo, [FromQuery] decimal? amount, [FromQuery] string? sepayToken, [FromQuery] bool? confirm) =>
            {
                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);
                var cleanMemo = (memo ?? "").Trim();
                var txList = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());

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
                        var bal = memberGuid.HasValue 
                            ? GetMemberBalanceFromDbAsync(memberGuid.Value, db).GetAwaiter().GetResult()
                            : _memberWallets.GetOrAdd(rawUserId, _ => 0m);

                        return Results.Ok(new
                        {
                            received = true,
                            message = "Đã nhận được tiền chuyển khoản thành công từ ngân hàng!",
                            balance = bal,
                            transaction = matched
                        });
                    }
                }

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

                                    var memoNoSpace = cleanMemo.Replace(" ", "");
                                    bool amountMatches = !amount.HasValue || amount.Value <= 0 || Math.Abs(txAmount - amount.Value) < 1m;
                                    bool memoMatches = !string.IsNullOrWhiteSpace(memoNoSpace)
                                        && (content.Contains(cleanMemo, StringComparison.OrdinalIgnoreCase)
                                            || content.Replace(" ", "").Contains(memoNoSpace, StringComparison.OrdinalIgnoreCase));

                                    if (amountMatches && memoMatches)
                                    {
                                        bool alreadyProcessed = false;
                                        lock (txList)
                                        {
                                            alreadyProcessed = txList.Any(t => t.Id == $"SEPAY-{txId}" || (!string.IsNullOrEmpty(refNo) && t.Note.Contains(refNo)));
                                        }
                                        if (!alreadyProcessed)
                                        {
                                            try
                                            {
                                                var dbCnt = await db.Database.SqlQueryRaw<int>(
                                                    "SELECT COUNT(*)::int AS \"Value\" FROM wallet_transactions WHERE reference_code = {0}",
                                                    $"SEPAY-{txId}"
                                                ).ToListAsync();
                                                alreadyProcessed = dbCnt.FirstOrDefault() > 0;
                                            }
                                            catch { }
                                        }

                                        if (!alreadyProcessed)
                                        {
                                            bool isClassBooking = cleanMemo.Contains("DATLOP", StringComparison.OrdinalIgnoreCase) || content.Contains("DATLOP", StringComparison.OrdinalIgnoreCase);
                                            if (isClassBooking)
                                            {
                                                return Results.Ok(new
                                                {
                                                    received = true,
                                                    message = "Đã nhận được tiền chuyển khoản đặt lớp học từ ngân hàng!",
                                                    isLiveBank = true
                                                });
                                            }

                                            var topupAmount = txAmount > 0 ? txAmount : (amount ?? 0m);
                                            if (topupAmount <= 0)
                                            {
                                                return Results.Ok(new { received = false, message = "Không xác định được số tiền giao dịch." });
                                            }
                                            decimal newBalance;

                                            if (memberGuid.HasValue)
                                            {
                                                var currentDbBal = await GetMemberBalanceFromDbAsync(memberGuid.Value, db);
                                                newBalance = currentDbBal + topupAmount;
                                                await RecordWalletTransactionInDbAsync(
                                                    db,
                                                    memberGuid.Value,
                                                    $"SEPAY-{txId}",
                                                    "topup",
                                                    topupAmount,
                                                    newBalance,
                                                    "SePay Live API",
                                                    $"Hệ thống báo có: {content} (Mã GD: {refNo})",
                                                    "completed",
                                                    DateTime.UtcNow
                                                );
                                            }
                                            else
                                            {
                                                newBalance = _memberWallets.AddOrUpdate(
                                                    rawUserId,
                                                    topupAmount,
                                                    (_, current) => current + topupAmount
                                                );
                                            }

                                            _memberWallets[rawUserId] = newBalance;
                                            if (memberGuid.HasValue) _memberWallets[memberGuid.Value.ToString()] = newBalance;

                                            var newTx = new WalletTransactionDto(
                                                $"SEPAY-{txId}",
                                                "topup",
                                                topupAmount,
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
                                                message = $"Đã phát hiện giao dịch thật {topupAmount:N0} đ! Số dư ví đã được cộng thành công.",
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
            wallet.MapPost("/sepay-webhook", async ([FromBody] SepayWebhookRequest payload, SmartGymDbContext db) =>
            {
                var amount = (payload.amountIn ?? 0m) > 0 ? (payload.amountIn ?? 0m) : (payload.transferAmount ?? 0m);
                var content = !string.IsNullOrWhiteSpace(payload.transactionContent)
                    ? payload.transactionContent
                    : (!string.IsNullOrWhiteSpace(payload.content) ? payload.content : (payload.body ?? ""));

                var (success, newBalance, matchedUserId, tx) = await ProcessSePayInboundAsync(
                    payload.id ?? DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    amount,
                    content,
                    payload.referenceNumber,
                    db
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
            wallet.MapPost("/simulate-webhook", async (HttpContext context, [FromBody] TopUpRequest request, SmartGymDbContext db) =>
            {
                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);
                if (request.Amount <= 0)
                {
                    return Results.BadRequest(new { message = "Số tiền mô phỏng phải lớn hơn 0." });
                }
                if (request.Amount > 100000000m)
                {
                    return Results.BadRequest(new { message = "Số tiền mô phỏng không được vượt quá 100.000.000 đ." });
                }
                var amount = request.Amount;
                var note = string.IsNullOrWhiteSpace(request.Note) ? "NAPVI 5667" : request.Note;
                var txId = $"SEPAY-SIM-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

                decimal newBalance;
                if (memberGuid.HasValue)
                {
                    var currentDbBal = await GetMemberBalanceFromDbAsync(memberGuid.Value, db);
                    newBalance = currentDbBal + amount;
                    await RecordWalletTransactionInDbAsync(
                        db,
                        memberGuid.Value,
                        txId,
                        "topup",
                        amount,
                        newBalance,
                        "SePay Webhook",
                        $"[Mô phỏng Webhook] Hệ thống báo có: {note}",
                        "completed",
                        DateTime.UtcNow
                    );
                }
                else
                {
                    newBalance = _memberWallets.AddOrUpdate(
                        rawUserId,
                        amount,
                        (_, current) => current + amount
                    );
                }

                _memberWallets[rawUserId] = newBalance;
                if (memberGuid.HasValue) _memberWallets[memberGuid.Value.ToString()] = newBalance;

                var tx = new WalletTransactionDto(
                    txId,
                    "topup",
                    amount,
                    "SePay Webhook",
                    $"[Mô phỏng Webhook] Hệ thống báo có: {note}",
                    DateTime.UtcNow,
                    "completed"
                );

                var txList = _memberWalletTransactions.GetOrAdd(rawUserId, _ => new List<WalletTransactionDto>());
                lock (txList)
                {
                    txList.Insert(0, tx);
                }
                if (memberGuid.HasValue && memberGuid.Value.ToString() != rawUserId)
                {
                    var guidTxList = _memberWalletTransactions.GetOrAdd(memberGuid.Value.ToString(), _ => new List<WalletTransactionDto>());
                    lock (guidTxList)
                    {
                        guidTxList.Insert(0, tx);
                    }
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

            // 7. POST /api/member/wallet/reset - Đặt lại hoặc cân chỉnh số dư ví (Dành cho kiểm thử/đối soát)
            wallet.MapPost("/reset", async (HttpContext context, [FromQuery] decimal? newBalance, SmartGymDbContext db) =>
            {
                var rawUserId = GetUserId(context);
                if (string.IsNullOrWhiteSpace(rawUserId))
                {
                    rawUserId = context.Request.Query["userId"].FirstOrDefault()
                          ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                          ?? "m-default";
                }

                var memberGuid = await ResolveMemberGuidAsync(context, db, rawUserId);
                var targetBal = Math.Max(0m, newBalance ?? 0m);

                if (memberGuid.HasValue)
                {
                    try
                    {
                        await db.Database.ExecuteSqlInterpolatedAsync($@"
                            INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                            VALUES ({memberGuid.Value}, {targetBal}, now())
                            ON CONFLICT (user_id) 
                            DO UPDATE SET balance = {targetBal}, last_updated_at = now();
                        ");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Wallet DB Reset Warning] {ex.Message}");
                    }
                }

                _memberWallets[rawUserId] = targetBal;
                if (memberGuid.HasValue) _memberWallets[memberGuid.Value.ToString()] = targetBal;

                return Results.Ok(new
                {
                    success = true,
                    balance = targetBal,
                    message = $"Đã cập nhật lại số dư ví về {targetBal:N0} đ."
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Đặt lại hoặc cân chỉnh số dư ví hội viên");
        }
    }
}
