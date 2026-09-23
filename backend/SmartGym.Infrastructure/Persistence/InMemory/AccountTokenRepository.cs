using System.Collections.Concurrent;
using System.Security.Cryptography;
using SmartGym.Application.Interfaces.Repositories;

namespace SmartGym.Infrastructure.Persistence.InMemory;

public sealed class AccountTokenRepository : IAccountTokenRepository
{
    private readonly ConcurrentDictionary<string, AccountToken> _tokens = new();

    public Task<string> CreatePasswordResetTokenAsync(string email)
    {
        return Task.FromResult(CreateToken("password-reset", email, TimeSpan.FromMinutes(15)));
    }

    public Task<string> CreateEmailVerificationTokenAsync(string email)
    {
        return Task.FromResult(CreateToken("email-verification", email, TimeSpan.FromHours(24)));
    }

    public Task<bool> TryConsumePasswordResetTokenAsync(string email, string token)
    {
        return Task.FromResult(TryConsumeToken("password-reset", email, token));
    }

    public Task<bool> TryConsumeEmailVerificationTokenAsync(string email, string token)
    {
        return Task.FromResult(TryConsumeToken("email-verification", email, token));
    }

    private string CreateToken(string purpose, string email, TimeSpan lifetime)
    {
        var normalizedEmail = NormalizeEmail(email);
        var token = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var key = BuildKey(purpose, normalizedEmail, token);
        _tokens[key] = new AccountToken(DateTimeOffset.UtcNow.Add(lifetime));
        return token;
    }

    private bool TryConsumeToken(string purpose, string email, string token)
    {
        var key = BuildKey(purpose, NormalizeEmail(email), token.Trim());
        if (!_tokens.TryRemove(key, out var accountToken))
        {
            return false;
        }

        return accountToken.ExpiresAt > DateTimeOffset.UtcNow;
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToUpperInvariant();
    }

    private static string BuildKey(string purpose, string email, string token)
    {
        return $"{purpose}:{email}:{token}";
    }

    private sealed record AccountToken(DateTimeOffset ExpiresAt);
}
