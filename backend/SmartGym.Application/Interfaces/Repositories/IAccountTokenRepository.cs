namespace SmartGym.Application.Interfaces.Repositories;

public interface IAccountTokenRepository
{
    Task<string> CreatePasswordResetTokenAsync(string email);
    Task<string> CreateEmailVerificationTokenAsync(string email);
    Task<bool> TryConsumePasswordResetTokenAsync(string email, string token);
    Task<bool> TryConsumeEmailVerificationTokenAsync(string email, string token);
}
