namespace SmartGym.Application.DTOs.Auth;

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(string AccessToken, UserProfile User);

public sealed record ForgotPasswordRequest(string Email);

public sealed record ResetPasswordRequest(string Email, string Token, string NewPassword);

public sealed record RequestEmailVerificationRequest(string Email);

public sealed record VerifyEmailRequest(string Email, string Token);

public sealed record UserProfile(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool EmailVerified);
