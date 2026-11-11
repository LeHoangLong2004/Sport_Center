using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
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
        // Bộ nhớ đệm thread-safe (RAM cache) hỗ trợ xử lý tức thời và fallback khi CSDL gặp sự cố
        private static readonly ConcurrentDictionary<string, decimal> _memberWallets = new();
        private static readonly ConcurrentDictionary<string, List<WalletTransactionDto>> _memberWalletTransactions = new();

        /// <summary>
        /// DTO trả về thông tin giao dịch ví hội viên cho giao diện Frontend.
        /// </summary>
        public record WalletTransactionDto(
            string Id,
            string Type,
            decimal Amount,
            string Method,
            string Note,
            DateTime CreatedAt,
            string Status
        );

        /// <summary>
        /// DTO yêu cầu nạp tiền hoặc thanh toán từ ví.
        /// </summary>
        public record TopUpRequest(
            decimal Amount,
            string? Method,
            string? Note,
            string? Status = "completed",
            string? Id = null
        );

        /// <summary>
        /// Model ánh xạ trực tiếp từ câu truy vấn SQL thô tới bảng wallet_transactions.
        /// </summary>
        private sealed class WalletTxDbRow
        {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public string Type { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public decimal BalanceAfter { get; set; }
            public string Method { get; set; } = "VietQR";
            public string Status { get; set; } = "completed";
            public string? ReferenceCode { get; set; }
            public string? Note { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        /// <summary>
        /// Tra cứu và giải quyết GUID hợp lệ của người dùng trong CSDL từ JWT Claim, Query String hoặc Header.
        /// </summary>
        private static async Task<Guid?> ResolveMemberGuidAsync(HttpContext context, SmartGymDbContext db, string? fallbackUserId = null)
        {
            var raw = GetUserId(context);
            if (string.IsNullOrWhiteSpace(raw))
            {
                raw = context.Request.Query["userId"].FirstOrDefault()
                   ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                   ?? fallbackUserId;
            }

            if (string.IsNullOrWhiteSpace(raw)) return null;

            if (Guid.TryParse(raw, out var parsedGuid))
            {
                return parsedGuid;
            }

            try
            {
                if (raw.Contains('@'))
                {
                    var u = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email == raw);
                    if (u != null) return u.Id;
                }
                else
                {
                    var u = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.PhoneNumber == raw || x.MemberCode == raw);
                    if (u != null) return u.Id;
                }

                // Fallback nếu là tài khoản demo như m-default, lấy hội viên hợp lệ đầu tiên trong CSDL
                var defaultUser = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Status);
                return defaultUser?.Id;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Truy vấn số dư ví thực tế từ CSDL PostgreSQL (ưu tiên đọc trực tiếp từ bảng member_wallet_balances, fallback tính SUM từ wallet_transactions).
        /// </summary>
        private static async Task<decimal> GetMemberBalanceFromDbAsync(Guid userGuid, SmartGymDbContext db)
        {
            try
            {
                var balFromTable = await db.Database.SqlQueryRaw<decimal>(
                    @"SELECT COALESCE(balance, 0.00) AS ""Value"" 
                      FROM member_wallet_balances 
                      WHERE user_id = {0}",
                    userGuid
                ).ToListAsync();

                if (balFromTable.Count > 0)
                {
                    return balFromTable.First();
                }

                // Nếu user chưa có trong bảng member_wallet_balances, tính số dư ban đầu và khởi tạo
                var balanceList = await db.Database.SqlQueryRaw<decimal>(
                    @"SELECT COALESCE(
                        SUM(
                            CASE 
                                WHEN status = 'completed' AND type IN ('topup', 'refund') THEN amount
                                WHEN status = 'completed' AND type = 'payment' THEN -amount
                                ELSE 0.00
                            END
                        ), 0.00
                    ) AS ""Value""
                    FROM wallet_transactions
                    WHERE user_id = {0}",
                    userGuid
                ).ToListAsync();

                var initialBal = balanceList.FirstOrDefault();

                try
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                        VALUES ({userGuid}, {initialBal}, now())
                        ON CONFLICT (user_id) DO NOTHING;
                    ");
                }
                catch { }

                return initialBal;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Wallet DB Error] Failed to query balance: {ex.Message}");
                return _memberWallets.GetOrAdd(userGuid.ToString(), _ => 0m);
            }
        }

        /// <summary>
        /// Truy vấn danh sách lịch sử giao dịch ví của hội viên từ bảng wallet_transactions.
        /// </summary>
        private static async Task<List<WalletTransactionDto>> GetMemberTransactionsFromDbAsync(Guid userGuid, SmartGymDbContext db)
        {
            try
            {
                var rows = await db.Database.SqlQueryRaw<WalletTxDbRow>(
                    @"SELECT id AS ""Id"",
                             user_id AS ""UserId"",
                             type AS ""Type"",
                             amount AS ""Amount"",
                             balance_after AS ""BalanceAfter"",
                             COALESCE(method, 'VietQR') AS ""Method"",
                             COALESCE(status, 'completed') AS ""Status"",
                             COALESCE(reference_code, '') AS ""ReferenceCode"",
                             COALESCE(note, '') AS ""Note"",
                             created_at AS ""CreatedAt""
                      FROM wallet_transactions
                      WHERE user_id = {0}
                      ORDER BY created_at DESC
                      LIMIT 50",
                    userGuid
                ).ToListAsync();

                return rows.Select(r => new WalletTransactionDto(
                    string.IsNullOrWhiteSpace(r.ReferenceCode) ? r.Id.ToString() : r.ReferenceCode,
                    r.Type,
                    r.Amount,
                    r.Method,
                    r.Note ?? "",
                    r.CreatedAt,
                    r.Status
                )).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Wallet DB Error] Failed to query transactions: {ex.Message}");
                return _memberWalletTransactions.GetOrAdd(userGuid.ToString(), _ => new List<WalletTransactionDto>());
            }
        }

        /// <summary>
        /// Lưu giao dịch ví mới vào bảng wallet_transactions trong CSDL PostgreSQL.
        /// </summary>
        private static async Task<bool> RecordWalletTransactionInDbAsync(
            SmartGymDbContext db,
            Guid userGuid,
            string txId,
            string type,
            decimal amount,
            decimal balanceAfter,
            string method,
            string note,
            string status,
            DateTime createdAt)
        {
            try
            {
                var txGuid = Guid.TryParse(txId, out var g) ? g : Guid.NewGuid();
                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO wallet_transactions (
                        id, user_id, type, amount, balance_after, method, status, reference_code, note, created_at
                    ) VALUES (
                        {txGuid}, {userGuid}, {type}, {amount}, {balanceAfter}, {method}, {status}, {txId}, {note}, {createdAt}
                    )
                    ON CONFLICT (reference_code) DO NOTHING;
                ");

                try
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                        VALUES ({userGuid}, {balanceAfter}, now())
                        ON CONFLICT (user_id) 
                        DO UPDATE SET balance = {balanceAfter}, last_updated_at = now();
                    ");
                }
                catch { }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Wallet DB Error] Failed to record transaction: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Xác nhận hoàn thành phiếu nạp tiền tại quầy trong CSDL.
        /// </summary>
        private static async Task<bool> ConfirmPendingTransactionInDbAsync(
            SmartGymDbContext db,
            Guid userGuid,
            string txId,
            decimal amount)
        {
            try
            {
                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    UPDATE wallet_transactions
                    SET status = 'completed',
                        balance_after = balance_after + {amount}
                    WHERE user_id = {userGuid} 
                      AND (reference_code = {txId} OR id::text = {txId}) 
                      AND status = 'pending';
                ");

                try
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                        VALUES ({userGuid}, {amount}, now())
                        ON CONFLICT (user_id) 
                        DO UPDATE SET balance = member_wallet_balances.balance + {amount}, last_updated_at = now();
                    ");
                }
                catch { }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Wallet DB Error] Failed to confirm pending: {ex.Message}");
                return false;
            }
        }

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
                    // Fallback RAM nếu không có kết nối CSDL
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

                // Ghi vào bảng wallet_transactions trong Database
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

                // Cập nhật bộ nhớ đệm
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
                                    bool memoMatches = string.IsNullOrWhiteSpace(cleanMemo) 
                                        || content.Contains(cleanMemo, StringComparison.OrdinalIgnoreCase)
                                        || (amount.HasValue && amount.Value > 0 && Math.Abs(txAmount - amount.Value) < 1m);

                                    if (amountMatches && memoMatches)
                                    {
                                        // Kiểm tra xem giao dịch này đã được ghi nhận chưa
                                        bool alreadyProcessed = false;
                                        lock (txList)
                                        {
                                            alreadyProcessed = txList.Any(t => t.Id == $"SEPAY-{txId}" || (!string.IsNullOrEmpty(refNo) && t.Note.Contains(refNo)));
                                        }

                                        if (!alreadyProcessed)
                                        {
                                            // An toàn: Không cộng tiền vào ví nếu đây là đơn thanh toán đặt lớp học (DATLOP)
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

                                            var topupAmount = txAmount > 0 ? txAmount : (amount ?? 100000m);
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
                var amount = request.Amount > 0 ? request.Amount : 100000m;
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
        }

        /// <summary>
        /// Hoàn tiền hủy đặt lớp học hoặc dịch vụ vào Ví hội viên (ghi vào CSDL PostgreSQL & cập nhật RAM cache).
        /// </summary>
        public static async Task<(bool Success, decimal NewBalance, WalletTransactionDto? Tx)> RefundToWalletAsync(
            SmartGymDbContext db,
            Guid userGuid,
            decimal amount,
            string note)
        {
            if (amount <= 0) return (false, 0m, null);

            var cur = await GetMemberBalanceFromDbAsync(userGuid, db);
            var newBal = cur + amount;
            var txId = $"REFUND-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}";
            var cleanNote = string.IsNullOrWhiteSpace(note) ? "Hoàn tiền dịch vụ vào ví hội viên" : note;

            await RecordWalletTransactionInDbAsync(
                db,
                userGuid,
                txId,
                "refund",
                amount,
                newBal,
                "Ví hoàn tiền",
                cleanNote,
                "completed",
                DateTime.UtcNow
            );

            _memberWallets[userGuid.ToString()] = newBal;

            var tx = new WalletTransactionDto(
                txId,
                "refund",
                amount,
                "Ví hoàn tiền",
                cleanNote,
                DateTime.UtcNow,
                "completed"
            );

            var txList = _memberWalletTransactions.GetOrAdd(userGuid.ToString(), _ => new List<WalletTransactionDto>());
            lock (txList)
            {
                txList.Insert(0, tx);
            }

            return (true, newBal, tx);
        }

        /// <summary>
        /// Lấy số dư ví hiện tại của hội viên từ CSDL.
        /// </summary>
        public static async Task<decimal> GetMemberBalanceAsync(SmartGymDbContext db, Guid userGuid)
        {
            return await GetMemberBalanceFromDbAsync(userGuid, db);
        }

        /// <summary>
        /// Trừ tiền ví hội viên khi đặt lớp học hoặc thanh toán dịch vụ.
        /// </summary>
        public static async Task<(bool Success, decimal NewBalance, string? ErrorMessage)> DeductFromWalletAsync(
            SmartGymDbContext db,
            Guid userGuid,
            decimal amount,
            string note)
        {
            if (amount <= 0) return (false, 0m, "Số tiền trừ phải lớn hơn 0.");

            var cur = await GetMemberBalanceFromDbAsync(userGuid, db);
            if (cur < amount)
            {
                return (false, cur, $"Số dư ví không đủ (hiện có {cur:N0} đ). Vui lòng nạp thêm tiền vào ví!");
            }

            var newBal = cur - amount;
            var txId = $"PAY-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}";
            var cleanNote = string.IsNullOrWhiteSpace(note) ? "Thanh toán dịch vụ từ ví hội viên" : note;

            await RecordWalletTransactionInDbAsync(
                db,
                userGuid,
                txId,
                "payment",
                amount,
                newBal,
                "Ví hội viên",
                cleanNote,
                "completed",
                DateTime.UtcNow
            );

            _memberWallets[userGuid.ToString()] = newBal;

            var tx = new WalletTransactionDto(
                txId,
                "payment",
                amount,
                "Ví hội viên",
                cleanNote,
                DateTime.UtcNow,
                "completed"
            );

            var txList = _memberWalletTransactions.GetOrAdd(userGuid.ToString(), _ => new List<WalletTransactionDto>());
            lock (txList)
            {
                txList.Insert(0, tx);
            }

            return (true, newBal, null);
        }

        /// <summary>
        /// Xử lý giao dịch SePay/Casso nạp tiền tự động kèm hỗ trợ ghi trực tiếp vào Database.
        /// </summary>
        public static async Task<(bool Success, decimal NewBalance, string MatchedUserId, WalletTransactionDto? Tx)> ProcessSePayInboundAsync(
            long txId,
            decimal amount,
            string content,
            string? referenceNumber = null,
            SmartGymDbContext? db = null)
        {
            if (amount <= 0) return (false, 0, "", null);

            string? matchedUserId = null;
            Guid? matchedUserGuid = null;

            // 1. Thử tìm trong danh sách User của Database nếu có db
            if (db != null)
            {
                try
                {
                    var users = await db.Users.AsNoTracking().Where(u => u.Status).ToListAsync();
                    var found = users.FirstOrDefault(u => 
                        (!string.IsNullOrWhiteSpace(u.MemberCode) && content.Contains(u.MemberCode, StringComparison.OrdinalIgnoreCase)) ||
                        (!string.IsNullOrWhiteSpace(u.PhoneNumber) && content.Contains(u.PhoneNumber, StringComparison.OrdinalIgnoreCase)) ||
                        (!string.IsNullOrWhiteSpace(u.Email) && content.Contains(u.Email.Split('@')[0], StringComparison.OrdinalIgnoreCase)));

                    if (found != null)
                    {
                        matchedUserId = found.Id.ToString();
                        matchedUserGuid = found.Id;
                    }
                }
                catch { }
            }

            // 2. Nếu chưa thấy, tìm qua giao dịch bộ nhớ
            if (string.IsNullOrWhiteSpace(matchedUserId))
            {
                foreach (var (uId, txs) in _memberWalletTransactions)
                {
                    lock (txs)
                    {
                        if (txs.Any(t => (!string.IsNullOrEmpty(t.Note) && t.Note.Contains(content, StringComparison.OrdinalIgnoreCase)) ||
                                         (!string.IsNullOrEmpty(t.Id) && content.Contains(t.Id, StringComparison.OrdinalIgnoreCase))))
                        {
                            matchedUserId = uId;
                            if (Guid.TryParse(uId, out var g)) matchedUserGuid = g;
                            break;
                        }
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(matchedUserId))
            {
                matchedUserId = _memberWallets.Keys.FirstOrDefault(k => k != "m-default" && Guid.TryParse(k, out _)) 
                             ?? _memberWallets.Keys.FirstOrDefault(k => k != "m-default") 
                             ?? "m-default";

                if (Guid.TryParse(matchedUserId, out var g)) matchedUserGuid = g;
            }

            decimal newBalance;
            var note = $"Hệ thống báo có: {content} (Ref: {referenceNumber ?? "Napas 247"})";
            var refCode = $"SEPAY-{txId}";

            if (db != null && matchedUserGuid.HasValue)
            {
                var cur = await GetMemberBalanceFromDbAsync(matchedUserGuid.Value, db);
                newBalance = cur + amount;
                await RecordWalletTransactionInDbAsync(
                    db,
                    matchedUserGuid.Value,
                    refCode,
                    "topup",
                    amount,
                    newBalance,
                    "SePay Webhook",
                    note,
                    "completed",
                    DateTime.UtcNow
                );
            }
            else
            {
                newBalance = _memberWallets.AddOrUpdate(
                    matchedUserId,
                    amount,
                    (_, current) => current + amount
                );
            }

            _memberWallets[matchedUserId] = newBalance;
            if (matchedUserGuid.HasValue) _memberWallets[matchedUserGuid.Value.ToString()] = newBalance;

            var tx = new WalletTransactionDto(
                refCode,
                "topup",
                amount,
                "SePay Webhook",
                note,
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

        /// <summary>
        /// Phiên bản đồng bộ để đảm bảo tương thích ngược cho các lời gọi cũ.
        /// </summary>
        public static (bool Success, decimal NewBalance, string MatchedUserId, WalletTransactionDto? Tx) ProcessSePayInbound(
            long txId,
            decimal amount,
            string content,
            string? referenceNumber = null)
        {
            return ProcessSePayInboundAsync(txId, amount, content, referenceNumber, null).GetAwaiter().GetResult();
        }

        /// <summary>
        /// DTO nhận thông báo webhook từ cổng SePay / Casso.
        /// </summary>
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
