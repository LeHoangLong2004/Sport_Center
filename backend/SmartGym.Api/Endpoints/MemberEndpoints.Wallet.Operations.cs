using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        public static void SetMemberWalletCache(Guid userGuid, decimal balance)
        {
            _memberWallets[userGuid.ToString()] = balance;
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
                    var cleanContentDigits = new string(content.Where(char.IsDigit).ToArray());
                    var users = await db.Users.AsNoTracking().Where(u => u.Status).ToListAsync();

                    // ƯU TIÊN 1: Trích xuất trực tiếp mã/số sau từ khóa "NAPVI"
                    var napviMatch = Regex.Match(content, @"NAPVI\s+([A-Za-z0-9_\-]+)", RegexOptions.IgnoreCase);
                    string? explicitTarget = napviMatch.Success ? napviMatch.Groups[1].Value.Trim() : null;

                    User? found = null;
                    if (!string.IsNullOrWhiteSpace(explicitTarget))
                    {
                        var cleanExplicitDigits = new string(explicitTarget.Where(char.IsDigit).ToArray());
                        found = users.FirstOrDefault(u =>
                            (!string.IsNullOrWhiteSpace(u.MemberCode) && string.Equals(u.MemberCode, explicitTarget, StringComparison.OrdinalIgnoreCase)) ||
                            (!string.IsNullOrWhiteSpace(u.PhoneNumber) && (
                                string.Equals(new string(u.PhoneNumber.Where(char.IsDigit).ToArray()), cleanExplicitDigits) ||
                                (cleanExplicitDigits.StartsWith("0") && string.Equals(new string(u.PhoneNumber.Where(char.IsDigit).ToArray()), cleanExplicitDigits.Substring(1))) ||
                                (u.PhoneNumber.StartsWith("0") && string.Equals(new string(u.PhoneNumber.Where(char.IsDigit).ToArray()).Substring(1), cleanExplicitDigits))
                            )) ||
                            (Guid.TryParse(explicitTarget, out var g) && u.Id == g)
                        );
                    }

                    // ƯU TIÊN 2: Nếu không khớp theo NAPVI <mã>, khớp theo số điện thoại (tối thiểu 9 chữ số) hoặc MemberCode chính xác
                    if (found == null)
                    {
                        found = users.FirstOrDefault(u => 
                        {
                            if (!string.IsNullOrWhiteSpace(u.MemberCode) && content.Contains(u.MemberCode, StringComparison.OrdinalIgnoreCase))
                                return true;

                            if (!string.IsNullOrWhiteSpace(u.PhoneNumber))
                            {
                                var cleanPhone = new string(u.PhoneNumber.Where(char.IsDigit).ToArray());
                                if (cleanPhone.Length >= 9)
                                {
                                    if (content.Contains(cleanPhone, StringComparison.OrdinalIgnoreCase) || cleanContentDigits.Contains(cleanPhone))
                                        return true;
                                }
                            }

                            // Chỉ khớp email nếu xuất hiện toàn bộ địa chỉ email (ví dụ: abc@gmail.com), tuyệt đối không khớp substring tiền tố
                            if (!string.IsNullOrWhiteSpace(u.Email) && content.Contains(u.Email, StringComparison.OrdinalIgnoreCase))
                                return true;

                            return false;
                        });
                    }

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

            if (string.IsNullOrWhiteSpace(matchedUserId) && !matchedUserGuid.HasValue)
            {
                // Tuyệt đối không tự ý gán vào user ngẫu nhiên trong bộ nhớ!
                // Trả về false để SePay ghi nhận log unmatched, phía frontend có thể poll sepay-check-memo để cộng đúng vào ví user đang đăng nhập.
                Console.WriteLine($"[SePay Webhook] ⚠️ Giao dịch nạp ví #{txId} {amount:N0}đ với nội dung \"{content}\" chưa khớp được User. Đưa vào log chờ đối soát.");
                return (false, 0, "", null);
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
                var effectiveUid = matchedUserId ?? matchedUserGuid?.ToString() ?? "m-default";
                newBalance = _memberWallets.AddOrUpdate(
                    effectiveUid,
                    amount,
                    (_, current) => current + amount
                );
            }

            if (!string.IsNullOrWhiteSpace(matchedUserId)) _memberWallets[matchedUserId] = newBalance;
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

