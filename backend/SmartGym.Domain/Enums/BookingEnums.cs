namespace SmartGym.Domain.Enums;

/// <summary>
/// Trạng thái của một lượt đặt chỗ lớp học.
/// </summary>
public enum BookingStatus
{
    /// <summary>Đã xác nhận thành công</summary>
    Confirmed,
    /// <summary>Đã hủy đặt chỗ</summary>
    Cancelled,
    /// <summary>Nằm trong danh sách chờ (lớp đã đầy)</summary>
    Waitlist,
    /// <summary>Đã đổi sang lịch học khác</summary>
    Swapped,
    /// <summary>Vắng mặt không báo trước</summary>
    NoShow
}
