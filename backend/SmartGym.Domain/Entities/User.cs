using System;

namespace SmartGym.Domain.Entities;

/// <summary>
/// Thực thể Người dùng trung tâm của hệ thống (User Entity).
/// Đại diện cho tài khoản thuộc các vai trò: Quản trị viên (Admin), Quản lý (Manager),
/// Huấn luyện viên (Coach), Nhân viên lễ tân (Receptionist) hoặc Hội viên (Member).
/// </summary>
public class User
{
    /// <summary>Mã định danh duy nhất (Primary Key)</summary>
    public Guid Id { get; set; } = Guid.NewGuid();
    /// <summary>Mã vai trò liên kết tới bảng Roles</summary>
    public Guid? RoleId { get; set; }
    /// <summary>Họ và tên đầy đủ</summary>
    public string FullName { get; set; } = null!;
    /// <summary>Số điện thoại liên hệ</summary>
    public string PhoneNumber { get; set; } = null!;
    /// <summary>Địa chỉ email đăng nhập</summary>
    public string Email { get; set; } = null!;
    /// <summary>Mật khẩu đã được băm (BCrypt Hash)</summary>
    public string PasswordHash { get; set; } = null!;
    /// <summary>Đường dẫn ảnh đại diện (URL)</summary>
    public string? AvatarUrl { get; set; }
    /// <summary>Ngày sinh</summary>
    public DateTime? DateOfBirth { get; set; }
    /// <summary>Giới tính (Nam, Nữ, Khác)</summary>
    public string? Gender { get; set; }
    /// <summary>Số điện thoại liên hệ khẩn cấp</summary>
    public string? EmergencyContact { get; set; }
    /// <summary>Mã thẻ hội viên (dành cho Member)</summary>
    public string? MemberCode { get; set; }
    /// <summary>Mục tiêu tập luyện (tăng cơ, giảm mỡ, duy trì sức khỏe...)</summary>
    public string? TrainingGoal { get; set; }
    /// <summary>Trình độ thể lực hiện tại (Mới bắt đầu, Trung cấp, Nâng cao)</summary>
    public string? TrainingLevel { get; set; }
    /// <summary>Trạng thái tài khoản (True: Đang hoạt động, False: Bị khóa)</summary>
    public bool Status { get; set; } = true;
    /// <summary>Thời điểm tạo tài khoản</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    /// <summary>Vai trò phân quyền liên kết</summary>
    public Role? Role { get; set; }
    /// <summary>Hồ sơ chuyên môn HLV (nếu là tài khoản Coach)</summary>
    public CoachProfile? CoachProfile { get; set; }
}
