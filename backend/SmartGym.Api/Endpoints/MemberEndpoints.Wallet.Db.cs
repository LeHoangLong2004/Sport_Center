using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
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
                var inserted = await db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO wallet_transactions (
                        id, user_id, type, amount, balance_after, method, status, reference_code, note, created_at
                    )
                    SELECT {txGuid}, {userGuid}, {type}, {amount}, {balanceAfter}, {method}, {status}, {txId}, {note}, {createdAt}
                    WHERE NOT EXISTS (
                        SELECT 1 FROM wallet_transactions WHERE reference_code = {txId} OR id = {txGuid}
                    );
                ");

                if (inserted == 0)
                {
                    return true;
                }

                try
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                        VALUES ({userGuid}, {balanceAfter}, now())
                        ON CONFLICT (user_id) 
                        DO UPDATE SET balance = {balanceAfter}, last_updated_at = now();
                    ");
                }
                catch (Exception balEx)
                {
                    Console.WriteLine($"[Wallet DB Error] Failed to update balance: {balEx.Message}");
                }

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
    }
}

