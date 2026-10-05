using SmartGym.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetUserByIdAsync(Guid id);
    Task<bool> UpdateUserRoleAsync(Guid userId, Guid roleId);
    Task<bool> UpdateUserStatusAsync(Guid userId, bool status);
    Task<bool> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request);
    
    Task<IEnumerable<RoleResponse>> GetAllRolesAsync();
}
