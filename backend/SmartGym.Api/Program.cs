using System;
using System.IO;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using SmartGym.Api;
using SmartGym.Api.Endpoints;
using SmartGym.Api.Serialization;
using SmartGym.Api.Services;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Authentication;
using SmartGym.Infrastructure.Persistence.EF;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ΓöÇΓöÇ Database Configuration ΓöÇΓöÇ
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<SmartGymDbContext>(options => options.UseNpgsql(connectionString));

// ΓöÇΓöÇ Services: Infrastructure ΓöÇΓöÇ
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];
var options = new Supabase.SupabaseOptions { AutoConnectRealtime = true };
builder.Services.AddSingleton(new Supabase.Client(supabaseUrl, supabaseKey, options));

builder.Services.AddScoped<SmartGym.Application.Interfaces.IUserRepository, UserRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.IPackageRepository, PackageRepository>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.ISubscriptionRepository,
    SubscriptionRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.IGroupClassRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseGroupClassRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.IPtSessionRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabasePtSessionRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.IUserRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseUserRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.IClassScheduleRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseClassScheduleRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.IBookingRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseBookingRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.ICheckInRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseCheckInRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.Repositories.IMemberPackageRepository,
    SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseMemberPackageRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.IInvoiceRepository,
    SmartGym.Infrastructure.Persistence.EF.InvoiceRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.IBodyMetricRepository,
    SmartGym.Infrastructure.Persistence.EF.Repositories.BodyMetricRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.IWorkoutPlanRepository,
    SmartGym.Infrastructure.Persistence.EF.Repositories.WorkoutPlanRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.IHomeworkProgressRepository,
    SmartGym.Infrastructure.Persistence.EF.Repositories.HomeworkProgressRepository
>();
builder.Services.AddScoped<
    SmartGym.Application.Interfaces.IReviewRepository,
    SmartGym.Infrastructure.Persistence.EF.Repositories.ReviewRepository
>();

builder.Services.AddSingleton<ITokenService, TokenService>();

// Note: Keeping IJwtTokenGenerator for the custom middleware backward compatibility
builder.Services.AddSingleton<
    SmartGym.Application.Interfaces.Services.IJwtTokenGenerator,
    JwtTokenGenerator
>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// ΓöÇΓöÇ Services: Application ΓöÇΓöÇ
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPackageService, PackageService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IReportService, SmartGym.Infrastructure.Services.ReportService>();
builder.Services.AddScoped<IPdfService, SmartGym.Infrastructure.Services.InvoicePdfService>();
builder.Services.AddScoped<ClassService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<CheckInService>();
builder.Services.AddScoped<IBodyMetricService, BodyMetricService>();
builder.Services.AddScoped<IWorkoutPlanService, WorkoutPlanService>();
builder.Services.AddScoped<IHomeworkProgressService, HomeworkProgressService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<PackageCatalogService>();

// ΓöÇΓöÇ Services: Flow 3 (thanh to├ín trß╗▒c tuyß║┐n, h├│a ─æ╞ín ─æiß╗çn tß╗¡, b├ío c├ío) ΓöÇΓöÇ
builder.Services.Configure<SmartGym.Infrastructure.Services.VnPayOptions>(
    builder.Configuration.GetSection(SmartGym.Infrastructure.Services.VnPayOptions.SectionName)
);
builder.Services.Configure<SmartGym.Infrastructure.Services.SmtpOptions>(
    builder.Configuration.GetSection(SmartGym.Infrastructure.Services.SmtpOptions.SectionName)
);
builder.Services.AddScoped<IVnPayGateway, SmartGym.Infrastructure.Services.VnPayGateway>();
builder.Services.AddScoped<IEmailService, SmartGym.Infrastructure.Services.SmtpEmailService>();
builder.Services.AddHostedService<SubscriptionExpiryBackgroundService>();

// Chß║Ñp nhß║¡n h├¼nh thß╗⌐c thanh to├ín dß║íng sß╗æ (0..4) hoß║╖c m├ú ngß║»n ('qr', 'card', 'wallet', 'counter').
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new PaymentMethodJsonConverter());
});

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

// ΓöÇΓöÇ Authentication & Authorization ΓöÇΓöÇ
builder
    .Services.AddAuthentication(
        Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(
                        builder.Configuration["Jwt:Secret"]
                            ?? "default_secret_key_needs_to_be_long_enough"
                    )
                ),
            };
    });
builder.Services.AddAuthorization();

// ΓöÇΓöÇ CORS ΓöÇΓöÇ
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

// ΓöÇΓöÇ Swagger ΓöÇΓöÇ
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SchemaFilter<PaymentEnumSchemaFilter>();

    c.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "SmartGym API",
            Version = "v1",
            Description =
                "REST API for the SmartGym Center management system (ASP.NET Core, PostgreSQL/Supabase).",
        }
    );

    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Description = "Paste the JWT token here. Do not prefix it with 'Bearer'.",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
        }
    );

    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                Array.Empty<string>()
            },
        }
    );
});

// ΓöÇΓöÇ CORS ΓöÇΓöÇ
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

var app = builder.Build();

DatabaseInitializationExtensions.InitializeDatabase(app, builder.Environment);

// ΓöÇΓöÇ Middleware pipeline ΓöÇΓöÇ

app.UseCors("AllowAll");
app.UseAuthentication();

app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.DocumentTitle = "SmartGym API";
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartGym API v1");
});

// ΓöÇΓöÇ Map endpoint groups ΓöÇΓöÇ
app.MapLegacyCatalogEndpoints();
app.MapLegacyClassEndpoints();
app.MapLegacyScheduleEndpoints();
app.MapProductEndpoints();
app.MapAppointmentEndpoints();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
