using SmartGym.Application.DTOs.Auth;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Interfaces.Services;
using SmartGym.Domain.Enums;

namespace SmartGym.Application.Services;

public sealed class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<(AuthResponse? Response, string? Error, bool IsForbid)> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return (null, "Email and password are required.", false);
        }

        var user = await _userRepository.FindByEmailAsync(request.Email);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return (null, "Invalid credentials.", false);
        }

        if (!user.IsActive)
        {
            return (null, "Account is not active.", true);
        }

        if (!user.EmailVerified)
        {
            return (null, "Email has not been verified.", false);
        }

        var profile = new UserProfile(user.Id, user.FullName, user.Email, user.Role.ToString(), user.EmailVerified);
        var token = _jwtTokenGenerator.GenerateToken(user);

        return (new AuthResponse(token, profile), null, false);
    }

    public async Task<(AuthResponse? Response, string? Error)> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return (null, "Email, password, and full name are required.");
        }

        var existingUser = await _userRepository.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return (null, "Email is already registered.");
        }

        var user = new SmartGym.Domain.Entities.AppUser(
            id: Guid.NewGuid(),
            branchId: null,
            email: request.Email,
            passwordHash: _passwordHasher.Hash(request.Password),
            fullName: request.FullName,
            phoneNumber: request.Phone ?? "",
            role: UserRole.Member,
            memberCode: null,
            qrSecretToken: null,
            referralCode: Guid.NewGuid().ToString("N")[..8].ToUpper(),
            avatarUrl: null,
            isMfaEnabled: false,
            isActive: true // Default to active/verified for simplicity unless verification is strictly enforced
        );

        await _userRepository.AddAsync(user);

        var profile = new UserProfile(user.Id, user.FullName, user.Email, user.Role.ToString(), user.EmailVerified);
        var token = _jwtTokenGenerator.GenerateToken(user);

        return (new AuthResponse(token, profile), null);
    }
}
