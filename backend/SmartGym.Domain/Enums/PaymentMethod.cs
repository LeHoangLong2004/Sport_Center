namespace SmartGym.Domain.Enums;

public enum PaymentMethod
{
    QRCode,
    CreditCard,
    EWallet,
    CashAtCounter,
    BankTransfer
}

public static class PaymentMethodExtensions
{
    /// <summary>
    /// Mã lưu trong cột <c>payment_method</c> (qr | card | wallet | counter | bank_transfer).
    /// </summary>
    public static string ToDbValue(this PaymentMethod method) => method switch
    {
        PaymentMethod.QRCode => "qr",
        PaymentMethod.CreditCard => "card",
        PaymentMethod.EWallet => "wallet",
        PaymentMethod.CashAtCounter => "counter",
        PaymentMethod.BankTransfer => "bank_transfer",
        _ => method.ToString().ToLowerInvariant()
    };

    /// <summary>
    /// Đọc mã <c>payment_method</c> từ database, chấp nhận cả mã ngắn và tên enum.
    /// </summary>
    public static PaymentMethod ParseDbValue(string value) => value.Trim().ToLowerInvariant() switch
    {
        "qr" or "qrcode" => PaymentMethod.QRCode,
        "card" or "creditcard" => PaymentMethod.CreditCard,
        "wallet" or "ewallet" => PaymentMethod.EWallet,
        "counter" or "cashatcounter" => PaymentMethod.CashAtCounter,
        "bank_transfer" or "banktransfer" => PaymentMethod.BankTransfer,
        _ => Enum.Parse<PaymentMethod>(value, true)
    };

    /// <summary>Nhãn hiển thị trên hóa đơn/email.</summary>
    public static string ToDisplayName(this PaymentMethod method) => method switch
    {
        PaymentMethod.QRCode => "QR Code",
        PaymentMethod.CreditCard => "Thẻ qua POS",
        PaymentMethod.EWallet => "Ví điện tử",
        PaymentMethod.CashAtCounter => "Tiền mặt tại quầy",
        PaymentMethod.BankTransfer => "Chuyển khoản",
        _ => method.ToString()
    };
}
