using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return users.Select(u => new UserResponse
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            RoleName = u.Role?.Name,
            AvatarUrl = u.AvatarUrl,
            DateOfBirth = u.DateOfBirth,
            Gender = u.Gender,
            EmergencyContact = u.EmergencyContact,
            Status = u.Status,
            CreatedAt = u.CreatedAt,
            Specialties = u.CoachProfile?.Specialties,
            Certifications = u.CoachProfile?.Certifications,
            ExperienceYears = u.CoachProfile?.ExperienceYears,
            Bio = u.CoachProfile?.Bio
        });
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            RoleName = user.Role?.Name,
            AvatarUrl = user.AvatarUrl,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            EmergencyContact = user.EmergencyContact,
            Status = user.Status,
            CreatedAt = user.CreatedAt,
            Specialties = user.CoachProfile?.Specialties,
            Certifications = user.CoachProfile?.Certifications,
            ExperienceYears = user.CoachProfile?.ExperienceYears,
            Bio = user.CoachProfile?.Bio
        };
    }

    public async Task<bool> UpdateUserRoleAsync(Guid userId, Guid roleId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        var role = await _userRepository.GetRoleByIdAsync(roleId);
        if (role == null) throw new Exception("Role does not exist");

        user.RoleId = role.Id;
        user.Role = role;
        
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> UpdateUserStatusAsync(Guid userId, bool status)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.Status = status;
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
        if (request.Email != null) user.Email = request.Email;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        if (request.DateOfBirth != null) user.DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc);
        if (request.Gender != null) user.Gender = request.Gender;
        if (request.EmergencyContact != null) user.EmergencyContact = request.EmergencyContact;

        if (user.Role?.Name == "coach")
        {
            if (user.CoachProfile == null)
            {
                user.CoachProfile = new Domain.Entities.CoachProfile { UserId = userId };
            }
            if (request.Specialties != null) user.CoachProfile.Specialties = request.Specialties;
            if (request.Certifications != null) user.CoachProfile.Certifications = request.Certifications;
            if (request.ExperienceYears.HasValue) user.CoachProfile.ExperienceYears = request.ExperienceYears.Value;
            if (request.Bio != null) user.CoachProfile.Bio = request.Bio;
        }

        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<IEnumerable<RoleResponse>> GetAllRolesAsync()
    {
        var roles = await _userRepository.GetAllRolesAsync();
        return roles.Select(r => new RoleResponse
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description
        });
    }
}
