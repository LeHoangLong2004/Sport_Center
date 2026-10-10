using SmartGym.Application.Interfaces.Services;

namespace SmartGym.Infrastructure.Authentication;

public sealed class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string storedHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }
}
