namespace SmartGym.Domain.Enums;

/// <summary>
/// Trạng thái gói tập của hội viên.
/// </summary>
public enum PackageStatus
{
    /// <summary>Đang còn hạn và hoạt động bình thường</summary>
    Active,
    /// <summary>Không hoạt động</summary>
    Inactive,
    /// <summary>Đang bảo lưu / đóng băng gói</summary>
    Frozen,
    /// <summary>Đã hết hạn sử dụng</summary>
    Expired,
    /// <summary>Bị tạm dừng do vi phạm nội quy</summary>
    Suspended
}

/// <summary>
/// Khung giờ được phép vào phòng tập theo gói.
/// </summary>
public enum AccessHours
{
    /// <summary>Tất cả các khung giờ mở cửa</summary>
    All,
    /// <summary>Chỉ khung giờ thấp điểm (Off-peak)</summary>
    OffPeak
}

/// <summary>
/// Kết quả xác thực lượt điểm danh check-in.
/// </summary>
public enum CheckInResult
{
    /// <summary>Cho phép vào phòng tập</summary>
    Approved,
    /// <summary>Từ chối vào phòng tập</summary>
    Denied
}
