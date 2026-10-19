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
        }
    }
}
