using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(AppUser user);
    System.Security.Claims.ClaimsPrincipal? ValidateToken(string token);
}
