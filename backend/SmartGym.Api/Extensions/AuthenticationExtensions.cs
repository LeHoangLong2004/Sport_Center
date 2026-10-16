using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace SmartGym.Api.Extensions;

public static class AuthenticationExtensions
{
    public const string CorsPolicyName = "AllowAll";

    public static IServiceCollection AddSmartGymSecurity(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        // ── JWT Authentication ──
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            configuration["Jwt:Secret"] ?? "default_secret_key_needs_to_be_long_enough"
                        )
                    ),
                };
            });

        services.AddAuthorization();

        // ── CORS Policy ──
        services.AddCors(options =>
        {
            options.AddPolicy(
                CorsPolicyName,
                policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
            );
        });

        return services;
    }
}
