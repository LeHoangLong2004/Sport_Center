namespace SmartGym.Infrastructure.Authentication;

public sealed class JwtOptions
{
    public string Issuer { get; init; } = "";
    public string Audience { get; init; } = "";
    public string Secret { get; init; } = "";
    public int ExpiresInMinutes { get; init; } = 60;
}
