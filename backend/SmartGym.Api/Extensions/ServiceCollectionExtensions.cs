using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartGym.Api.Serialization;
using SmartGym.Api.Services;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Interfaces.Services;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Authentication;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.EF.Repositories;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;
using SmartGym.Infrastructure.Services;

namespace SmartGym.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSmartGymServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment
    )
    {
        // ── Static WebRoot Config ──
        var webRoot = Path.Combine(environment.ContentRootPath, "wwwroot");
        if (!Directory.Exists(webRoot)) Directory.CreateDirectory(webRoot);
        Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "sports"));
        Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "facilities"));
        Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "avatars"));
        environment.WebRootPath = webRoot;
        configuration["WebRootPath"] = webRoot;

        // ── Database Configuration ──
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<SmartGymDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null
                )
            )
        );

        // ── Supabase Client ──
        var supabaseUrl = configuration["Supabase:Url"];
        var supabaseKey = configuration["Supabase:Key"];
        var supaOptions = new Supabase.SupabaseOptions { AutoConnectRealtime = true };
        services.AddSingleton(new Supabase.Client(supabaseUrl ?? "", supabaseKey, supaOptions));

        // ── Repositories ──
        services.AddScoped<SmartGym.Application.Interfaces.IUserRepository, UserRepository>();
        services.AddScoped<IPackageRepository, PackageRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IGroupClassRepository, SupabaseGroupClassRepository>();
        services.AddScoped<IPtSessionRepository, SupabasePtSessionRepository>();
        services.AddScoped<SmartGym.Application.Interfaces.Repositories.IUserRepository, SupabaseUserRepository>();
        services.AddScoped<IClassScheduleRepository, SupabaseClassScheduleRepository>();
        services.AddScoped<IBookingRepository, SupabaseBookingRepository>();
        services.AddScoped<ICheckInRepository, SupabaseCheckInRepository>();
        services.AddScoped<IMemberPackageRepository, SupabaseMemberPackageRepository>();
        services.AddScoped<IInvoiceRepository, SmartGym.Infrastructure.Persistence.EF.InvoiceRepository>();
        services.AddScoped<IWorkoutPlanRepository, WorkoutPlanRepository>();
        services.AddScoped<IHomeworkProgressRepository, HomeworkProgressRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();

        // ── Auth & Tokens ──
        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));

        // ── Application Services ──
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IPackageService, PackageService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IProductOrderPaymentService, ProductOrderPaymentService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IPdfService, InvoicePdfService>();
        services.AddScoped<ClassService>();
        services.AddScoped<BookingService>();
        services.AddScoped<CheckInService>();
        services.AddScoped<IWorkoutPlanService, WorkoutPlanService>();
        services.AddScoped<IHomeworkProgressService, HomeworkProgressService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<PackageCatalogService>();

        // ── In-Memory Store Singletons ──
        // Chat data is stored in PostgreSQL and must share the request DbContext.
        services.AddScoped<ChatStoreService>();
        services.AddSingleton<ScheduleStoreService>();
        services.AddSingleton<ReviewStoreService>();

        // ── External Integration Services (VnPay, SMTP, Cloudinary) ──
        services.Configure<VnPayOptions>(configuration.GetSection(VnPayOptions.SectionName));
        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));
        services.AddScoped<IVnPayGateway, VnPayGateway>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddScoped<IPhotoService, CloudinaryPhotoService>();
        services.AddHostedService<SubscriptionExpiryBackgroundService>();

        // ── HttpJson & Licenses ──
        services.ConfigureHttpJsonOptions(opt =>
        {
            opt.SerializerOptions.Converters.Add(new PaymentMethodJsonConverter());
        });
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

        return services;
    }
}
