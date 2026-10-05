using System;
using System.IO;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartGym.Api.Endpoints;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Authentication;
using SmartGym.Infrastructure.Persistence.EF;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database Configuration ──
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<SmartGymDbContext>(options =>
    options.UseNpgsql(connectionString));

// ── Services: Infrastructure ──
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPackageRepository, PackageRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddSingleton<ITokenService, TokenService>();
// Note: Keeping IJwtTokenGenerator for the custom middleware backward compatibility
builder.Services.AddSingleton<SmartGym.Application.Interfaces.Services.IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// ── Services: Application ──
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPackageService, PackageService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();

// ── Authentication & Authorization ──
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "default_secret_key_needs_to_be_long_enough"))
        };
    });
builder.Services.AddAuthorization();

// ── Swagger ──
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Chỉ cần dán JWT Token của bạn vào đây (KHÔNG cần nhập chữ Bearer).",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Initialize Database Schema ──
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SmartGymDbContext>();
    try 
    {
        var sqlPath = Path.Combine(builder.Environment.ContentRootPath, "..", "..", "supabase_schema.sql");
        if (File.Exists(sqlPath))
        {
            var sql = File.ReadAllText(sqlPath);
            db.Database.ExecuteSqlRaw(sql);
            app.Logger.LogInformation("Successfully executed supabase_schema.sql on startup.");
        }
    }
    catch
    {
        // Ignore errors if tables already exist
    }
}

// ── Middleware pipeline ──

app.UseAuthentication();

app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.DocumentTitle = "SmartGym API";
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartGym API v1");
});

// ── Map endpoint groups ──
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapPackageEndpoints();
app.MapSubscriptionEndpoints();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
