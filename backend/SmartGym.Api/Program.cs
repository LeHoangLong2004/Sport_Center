using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.OpenApi;
using SmartGym.Api.Endpoints;
using SmartGym.Application.DTOs.Auth;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Interfaces.Services;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Authentication;
using SmartGym.Infrastructure.Persistence.InMemory;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ──
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// ── Supabase Configuration ──
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];
if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
{
    var options = new Supabase.SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = true,
    };
    // Need to await initialization for client
    var supabaseClient = new Supabase.Client(supabaseUrl, supabaseKey, options);
    supabaseClient.InitializeAsync().GetAwaiter().GetResult();
    builder.Services.AddSingleton(supabaseClient);
}

// ── Services: Infrastructure ──
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddSingleton<IAccountTokenRepository, AccountTokenRepository>();

// Supabase Repositories
builder.Services.AddScoped<IUserRepository, SupabaseUserRepository>();
builder.Services.AddScoped<IClassScheduleRepository, SupabaseClassScheduleRepository>();
builder.Services.AddScoped<IBookingRepository, SupabaseBookingRepository>();
builder.Services.AddScoped<IMemberPackageRepository, SupabaseMemberPackageRepository>();
builder.Services.AddScoped<ICheckInRepository, SupabaseCheckInRepository>();

// ── Services: Application ──
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<CheckInService>();

// ── Swagger ──
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartGym API",
        Version = "v1",
        Description = "API for SmartGym OS — Sports Center Management System.\n\n" +
                      "**Demo accounts** (password: `123456`):\n" +
                      "- manager@smartgym.vn (CenterManager)\n" +
                      "- reception.mai@smartgym.vn (Receptionist)\n" +
                      "- coach.nam@smartgym.vn (Coach)\n" +
                      "- member.an@gmail.com (Member)"
    });
});

// ── NFR-018: Rate Limiting (100 requests/minute/IP) ──
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("fixed", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5
            }));
});

var app = builder.Build();

// ── Middleware pipeline ──
app.UseRateLimiter();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.DocumentTitle = "SmartGym API";
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartGym API v1");
});

// JWT authentication middleware
app.Use(async (context, next) =>
{
    var authorization = context.Request.Headers.Authorization.ToString();
    if (authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        var token = authorization["Bearer ".Length..].Trim();
        var jwtGenerator = context.RequestServices.GetRequiredService<IJwtTokenGenerator>();
        var principal = jwtGenerator.ValidateToken(token);
        if (principal is not null)
        {
            context.User = principal;
        }
    }

    await next();
});

// ── Map endpoint groups ──

// Auth endpoints
var auth = app.MapGroup("/api/auth").WithTags("Authentication").RequireRateLimiting("fixed");

auth.MapPost("/login", async (LoginRequest request, AuthService authService) =>
{
    var (response, error, isForbid) = await authService.LoginAsync(request);
    if (isForbid) return Results.Forbid();
    if (error is not null) return Results.BadRequest(new { message = error });
    return Results.Ok(response);
});

auth.MapGet("/me", async (HttpContext context, IUserRepository users) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Unauthorized();
    }

    var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userId, out var id))
    {
        return Results.Unauthorized();
    }

    var user = await users.FindByIdAsync(id);
    if (user is null) return Results.Unauthorized();
    
    return Results.Ok(new UserProfile(user.Id, user.FullName, user.Email, user.Role.ToString(), user.EmailVerified));
});

auth.MapPost("/logout", () =>
{
    return Results.Ok(new { message = "Logged out. Please remove the token on the client." });
});

auth.MapPost("/forgot-password", async (
    ForgotPasswordRequest request,
    IUserRepository users,
    IAccountTokenRepository tokens) =>
{
    if (string.IsNullOrWhiteSpace(request.Email))
    {
        return Results.BadRequest(new { message = "Email is required." });
    }

    var user = await users.FindByEmailAsync(request.Email);
    if (user is null || !user.IsActive)
    {
        return Results.Ok(new { message = "If the email exists, a password reset code has been sent." });
    }

    var resetToken = await tokens.CreatePasswordResetTokenAsync(user.Email);
    return Results.Ok(new { message = "If the email exists, a password reset code has been sent.", resetToken });
});

auth.MapPost("/reset-password", async (
    ResetPasswordRequest request,
    IUserRepository users,
    IPasswordHasher passwordHasher,
    IAccountTokenRepository tokens) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Token) ||
        string.IsNullOrWhiteSpace(request.NewPassword))
    {
        return Results.BadRequest(new { message = "Email, token and new password are required." });
    }

    if (request.NewPassword.Length < 8)
    {
        return Results.BadRequest(new { message = "Password must be at least 8 characters." });
    }

    var user = await users.FindByEmailAsync(request.Email);
    if (user is null || !await tokens.TryConsumePasswordResetTokenAsync(request.Email, request.Token))
    {
        return Results.BadRequest(new { message = "Invalid or expired reset token." });
    }

    user.ChangePassword(passwordHasher.Hash(request.NewPassword));
    await users.UpdateAsync(user);
    return Results.Ok(new { message = "Password has been reset successfully." });
});

auth.MapPost("/request-email-verification", async (
    RequestEmailVerificationRequest request,
    IUserRepository users,
    IAccountTokenRepository tokens) =>
{
    if (string.IsNullOrWhiteSpace(request.Email))
    {
        return Results.BadRequest(new { message = "Email is required." });
    }

    var user = await users.FindByEmailAsync(request.Email);
    if (user is null || !user.IsActive)
    {
        return Results.Ok(new { message = "If the email exists, a verification code has been sent." });
    }

    if (user.EmailVerified)
    {
        return Results.Ok(new { message = "Email is already verified." });
    }

    var verificationToken = await tokens.CreateEmailVerificationTokenAsync(user.Email);
    return Results.Ok(new { message = "If the email exists, a verification code has been sent.", verificationToken });
});

auth.MapPost("/verify-email", async (
    VerifyEmailRequest request,
    IUserRepository users,
    IAccountTokenRepository tokens) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token))
    {
        return Results.BadRequest(new { message = "Email and token are required." });
    }

    var user = await users.FindByEmailAsync(request.Email);
    if (user is null || !await tokens.TryConsumeEmailVerificationTokenAsync(request.Email, request.Token))
    {
        return Results.BadRequest(new { message = "Invalid or expired verification token." });
    }

    user.MarkEmailVerified();
    await users.UpdateAsync(user);
    return Results.Ok(new { message = "Email has been verified successfully." });
});

// New endpoint groups
app.MapBookingEndpoints();   // FR-008, BR-004, BR-005, BR-006
app.MapCheckInEndpoints();   // FR-016, BR-007

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
