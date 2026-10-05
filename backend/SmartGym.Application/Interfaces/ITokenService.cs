using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user, string roleName);
}
