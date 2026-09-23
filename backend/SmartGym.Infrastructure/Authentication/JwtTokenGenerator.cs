using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SmartGym.Application.Interfaces.Services;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Authentication;

public sealed class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _options;

    public JwtTokenGenerator(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string GenerateToken(AppUser user)
    {
        var now = DateTimeOffset.UtcNow;
        var header = new Dictionary<string, object>
        {
            ["alg"] = "HS256",
            ["typ"] = "JWT"
        };
        var payload = new Dictionary<string, object>
        {
            ["sub"] = user.Id.ToString(),
            ["email"] = user.Email,
            ["name"] = user.FullName,
            ["role"] = user.Role.ToString(),
            ["iss"] = _options.Issuer,
            ["aud"] = _options.Audience,
            ["iat"] = now.ToUnixTimeSeconds(),
            ["exp"] = now.AddMinutes(_options.ExpiresInMinutes).ToUnixTimeSeconds()
        };

        var encodedHeader = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(header));
        var encodedPayload = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(payload));
        var signature = Sign($"{encodedHeader}.{encodedPayload}");

        return $"{encodedHeader}.{encodedPayload}.{signature}";
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var parts = token.Split('.');
        if (parts.Length != 3)
        {
            return null;
        }

        var unsignedToken = $"{parts[0]}.{parts[1]}";
        var expectedSignature = Sign(unsignedToken);
        if (!FixedTimeEquals(parts[2], expectedSignature))
        {
            return null;
        }

        using var payloadJson = JsonDocument.Parse(Base64UrlDecode(parts[1]));
        var payload = payloadJson.RootElement;

        if (!StringEquals(payload, "iss", _options.Issuer) ||
            !StringEquals(payload, "aud", _options.Audience))
        {
            return null;
        }

        if (!payload.TryGetProperty("exp", out var expElement) ||
            DateTimeOffset.FromUnixTimeSeconds(expElement.GetInt64()) <= DateTimeOffset.UtcNow)
        {
            return null;
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, payload.GetProperty("sub").GetString() ?? ""),
            new(ClaimTypes.Email, payload.GetProperty("email").GetString() ?? ""),
            new(ClaimTypes.Name, payload.GetProperty("name").GetString() ?? ""),
            new(ClaimTypes.Role, payload.GetProperty("role").GetString() ?? "")
        };

        var identity = new ClaimsIdentity(claims, "Bearer");
        return new ClaimsPrincipal(identity);
    }

    private string Sign(string value)
    {
        var key = Encoding.UTF8.GetBytes(_options.Secret);
        using var hmac = new HMACSHA256(key);
        return Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(value)));
    }

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string value)
    {
        var padded = value.Replace('-', '+').Replace('_', '/');
        padded = padded.PadRight(padded.Length + ((4 - padded.Length % 4) % 4), '=');
        return Convert.FromBase64String(padded);
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(left),
            Encoding.UTF8.GetBytes(right));
    }

    private static bool StringEquals(JsonElement payload, string propertyName, string expected)
    {
        return payload.TryGetProperty(propertyName, out var value) &&
            string.Equals(value.GetString(), expected, StringComparison.Ordinal);
    }
}
