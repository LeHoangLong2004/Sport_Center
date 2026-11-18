using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using SmartGym.Application.Interfaces.Repositories;

namespace SmartGym.Infrastructure.Persistence.InMemory;

public sealed class AccountTokenRepository : IAccountTokenRepository
{
    private static readonly string TokenFilePath = Path.Combine(AppContext.BaseDirectory, "account_tokens.json");
    private static readonly ConcurrentDictionary<string, AccountToken> _tokens = LoadTokens();

    private static ConcurrentDictionary<string, AccountToken> LoadTokens()
    {
        try
        {
            if (File.Exists(TokenFilePath))
            {
                var json = File.ReadAllText(TokenFilePath);
                var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, AccountToken>>(json);
                if (data != null)
                {
                    var dict = new ConcurrentDictionary<string, AccountToken>();
                    foreach (var kvp in data)
                    {
                        if (kvp.Value.ExpiresAt > DateTimeOffset.UtcNow)
                            dict[kvp.Key] = kvp.Value;
                    }
                    return dict;
                }
            }
        }
        catch { }
        return new ConcurrentDictionary<string, AccountToken>();
    }

    private static void SaveTokens()
    {
        try
        {
            var active = _tokens.Where(x => x.Value.ExpiresAt > DateTimeOffset.UtcNow).ToDictionary(x => x.Key, x => x.Value);
            var json = System.Text.Json.JsonSerializer.Serialize(active);
            File.WriteAllText(TokenFilePath, json);
        }
        catch { }
    }

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

    public Task<bool> ValidatePasswordResetTokenAsync(string email, string token)
    {
        return Task.FromResult(ValidateToken("password-reset", email, token));
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
        SaveTokens();
        return token;
    }

    private bool TryConsumeToken(string purpose, string email, string token)
    {
        var key = BuildKey(purpose, NormalizeEmail(email), token.Trim());
        if (!_tokens.TryRemove(key, out var accountToken))
        {
            return false;
        }

        SaveTokens();
        return accountToken.ExpiresAt > DateTimeOffset.UtcNow;
    }

    private bool ValidateToken(string purpose, string email, string token)
    {
        var key = BuildKey(purpose, NormalizeEmail(email), token.Trim());
        return _tokens.TryGetValue(key, out var accountToken)
            && accountToken.ExpiresAt > DateTimeOffset.UtcNow;
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
