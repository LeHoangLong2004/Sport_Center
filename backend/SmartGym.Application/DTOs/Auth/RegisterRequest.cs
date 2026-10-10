namespace SmartGym.Application.DTOs.Auth;

public sealed record RegisterRequest(
    string FullName,
    string Email,
    string Phone,
    string Password
);
