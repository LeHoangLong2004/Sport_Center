namespace SmartGym.Domain.Enums;

/// <summary>
/// Các vai trò người dùng trong hệ thống Sport Center (Role-Based Access Control).
/// </summary>
public enum UserRole
{
    /// <summary>Quản lý trung tâm thể thao</summary>
    CenterManager,
    /// <summary>Nhân viên lễ tân / quầy thu ngân</summary>
    Receptionist,
    /// <summary>Huấn luyện viên thể thao / PT</summary>
    Coach,
    /// <summary>Hội viên trung tâm</summary>
    Member
}

/// <summary>
/// Trạng thái hoạt động của tài khoản người dùng.
/// </summary>
public enum UserStatus
{
    /// <summary>Đang hoạt động bình thường</summary>
    Active,
    /// <summary>Tạm ngưng hoạt động</summary>
    Inactive,
    /// <summary>Bị đình chỉ / khóa tài khoản</summary>
    Suspended
}
