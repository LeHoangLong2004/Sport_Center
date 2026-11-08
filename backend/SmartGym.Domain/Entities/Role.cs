using System;
using System.Collections.Generic;

namespace SmartGym.Domain.Entities;

/// <summary>
/// Thực thể Vai trò phân quyền (Role Entity) trong mô hình RBAC.
/// Bao gồm các quyền: admin, manager, coach, receptionist, member.
/// </summary>
public class Role
{
    /// <summary>Mã vai trò (Primary Key)</summary>
    public Guid Id { get; set; } = Guid.NewGuid();
    /// <summary>Tên mã định danh của vai trò (VD: admin, manager, coach, receptionist, member)</summary>
    public string Name { get; set; } = null!;
    /// <summary>Mô tả chi tiết quyền hạn của vai trò</summary>
    public string? Description { get; set; }

    // Navigation property
    /// <summary>Danh sách người dùng thuộc vai trò này</summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}
