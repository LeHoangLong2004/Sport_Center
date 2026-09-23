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
}
