using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
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
    }
}

