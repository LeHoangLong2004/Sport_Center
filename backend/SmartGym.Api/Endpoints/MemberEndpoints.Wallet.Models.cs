using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace SmartGym.Api.Endpoints
{
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

