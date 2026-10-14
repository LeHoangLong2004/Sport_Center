using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
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
        var isCoach = (user != null && string.Equals(user.Role?.Name, "coach", StringComparison.OrdinalIgnoreCase))
            || (user != null && user.CoachProfile != null)
            || request.Specialties != null
            || request.Certifications != null
            || request.Bio != null
            || request.ExperienceYears.HasValue;

        if (user == null)
        {
            var roleName = isCoach ? "coach" : "member";
            var role = await _userRepository.GetRoleByNameAsync(roleName);
            user = new User
            {
                Id = userId,
                RoleId = role?.Id,
                Role = role,
                FullName = request.FullName ?? (isCoach ? "Huấn luyện viên" : "Hội viên"),
                Email = request.Email ?? (isCoach ? "hoxuananhnam1@gmail.com" : "hoxuananhnam@gmail.com"),
                PhoneNumber = request.PhoneNumber ?? "0900000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                Status = true,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddAsync(user);
        }

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
        if (request.Email != null) user.Email = request.Email;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        if (request.DateOfBirth != null) user.DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc);
        if (request.Gender != null) user.Gender = request.Gender;
        if (request.EmergencyContact != null) user.EmergencyContact = request.EmergencyContact;

        if (isCoach)
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

    public async Task<UserResponse> CreateMemberAsync(CreateMemberRequest request)
    {
        var fullName = request.FullName?.Trim();
        var email = request.Email?.Trim().ToLowerInvariant();
        var phoneNumber = request.PhoneNumber?.Trim();
        var password = request.Password?.Trim();

        if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(email)
            || string.IsNullOrWhiteSpace(phoneNumber) || string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Họ tên, email, số điện thoại và mật khẩu là bắt buộc.");

        if (password.Length < 6)
            throw new ArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");

        if (await _userRepository.GetByEmailAsync(email) != null)
            throw new InvalidOperationException("Email đã được sử dụng.");

        if (await _userRepository.GetByPhoneNumberAsync(phoneNumber) != null)
            throw new InvalidOperationException("Số điện thoại đã được sử dụng.");

        var memberRole = await _userRepository.GetRoleByNameAsync("member");
        if (memberRole == null)
            throw new InvalidOperationException("Không tìm thấy role member trong hệ thống.");

        var user = new Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            RoleId = memberRole.Id,
            Role = memberRole,
            FullName = fullName,
            Email = email,
            PhoneNumber = phoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            DateOfBirth = request.DateOfBirth.HasValue
                ? DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc)
                : null,
            Gender = string.IsNullOrWhiteSpace(request.Gender) ? null : request.Gender.Trim(),
            EmergencyContact = string.IsNullOrWhiteSpace(request.EmergencyContact)
                ? null
                : request.EmergencyContact.Trim(),
            Status = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            RoleName = memberRole.Name,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            EmergencyContact = user.EmergencyContact,
            Status = user.Status,
            CreatedAt = user.CreatedAt
        };
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
