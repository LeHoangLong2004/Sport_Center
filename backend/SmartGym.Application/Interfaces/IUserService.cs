using SmartGym.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

/// <summary>
/// Giao diện dịch vụ Quản lý người dùng & Phân quyền (User Service).
/// Quản lý hồ sơ, cập nhật vai trò, kích hoạt/vô hiệu hóa tài khoản và tạo hội viên mới.
/// </summary>
public interface IUserService
{
    /// <summary>Lấy danh sách tất cả người dùng trong hệ thống</summary>
    Task<IEnumerable<UserResponse>> GetAllUsersAsync();
    /// <summary>Lấy thông tin chi tiết một người dùng theo ID</summary>
    Task<UserResponse?> GetUserByIdAsync(Guid id);
    /// <summary>Cập nhật vai trò / quyền hạn người dùng</summary>
    Task<bool> UpdateUserRoleAsync(Guid userId, Guid roleId);
    /// <summary>Cập nhật trạng thái kích hoạt tài khoản</summary>
    Task<bool> UpdateUserStatusAsync(Guid userId, bool status);
    /// <summary>Cập nhật thông tin hồ sơ cá nhân</summary>
    Task<bool> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request);
    /// <summary>Tạo mới hồ sơ hội viên tại quầy</summary>
    Task<UserResponse> CreateMemberAsync(CreateMemberRequest request);
    
    /// <summary>Lấy danh sách tất cả các vai trò trong hệ thống</summary>
    Task<IEnumerable<RoleResponse>> GetAllRolesAsync();
}
