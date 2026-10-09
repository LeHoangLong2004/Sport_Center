namespace SmartGym.Domain.Enums;

public enum PaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded,
    Expired
}

public static class PaymentStatusExtensions
{
    /// <summary>Nhãn hiển thị trên hóa đơn/email/báo cáo.</summary>
    public static string ToDisplayName(this PaymentStatus status) => status switch
    {
        PaymentStatus.Pending => "Chờ thanh toán",
        PaymentStatus.Completed => "Đã thanh toán",
        PaymentStatus.Failed => "Thất bại",
        PaymentStatus.Refunded => "Đã hoàn tiền",
        PaymentStatus.Expired => "Hết hạn",
        _ => status.ToString()
    };
}
