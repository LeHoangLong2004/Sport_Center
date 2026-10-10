using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace SmartGym.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new Exception("Email already exists");
        }

        var existingPhone = await _userRepository.GetByPhoneNumberAsync(request.PhoneNumber);
        if (existingPhone != null)
        {
            throw new Exception("Phone number already exists");
        }

        // Hash password
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Lấy Role từ Database
        var role = await _userRepository.GetRoleByNameAsync(request.RoleName);
        if (role == null)
        {
            throw new Exception($"Role '{request.RoleName}' does not exist in the system.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            RoleId = role.Id,
            Role = role,
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = passwordHash,
            Status = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        string token = _tokenService.GenerateJwtToken(user, role.Name);

        return new AuthResponse
        {
            Id = user.Id,
            Token = token,
            FullName = user.FullName,
            Email = user.Email,
            Role = role.Name
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid email or password");
        }

        if (!user.Status)
        {
            throw new Exception("Account is inactive");
        }

        string roleName = user.Role?.Name ?? "Member";
        string token = _tokenService.GenerateJwtToken(user, roleName);

        return new AuthResponse
        {
            Id = user.Id,
            Token = token,
            FullName = user.FullName,
            Email = user.Email,
            Role = roleName
        };
    }
}
