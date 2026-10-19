using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;
using SmartGym.Api;
using SmartGym.Api.Extensions;
using SmartGym.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ── SmartGym Configuration & DI Services ──
builder.Services.AddSmartGymServices(builder.Configuration, builder.Environment);
builder.Services.AddSmartGymSecurity(builder.Configuration);
builder.Services.AddSmartGymSwagger();

var app = builder.Build();

// ── Database Initializer ──
DatabaseInitializationExtensions.InitializeDatabase(app, builder.Environment);

// ── Middleware Pipeline ──
app.UseCors(AuthenticationExtensions.CorsPolicyName);
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseSmartGymSwagger();

// ── API Endpoints ──
app.MapSmartGymEndpoints();

app.Run();
