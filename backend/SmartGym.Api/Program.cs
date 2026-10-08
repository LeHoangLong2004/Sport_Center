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
using SmartGym.Api.Serialization;
using SmartGym.Api.Services;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
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
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];
var options = new Supabase.SupabaseOptions { AutoConnectRealtime = true };
builder.Services.AddSingleton(new Supabase.Client(supabaseUrl, supabaseKey, options));

builder.Services.AddScoped<SmartGym.Application.Interfaces.IUserRepository, UserRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.IPackageRepository, PackageRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IGroupClassRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseGroupClassRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IPtSessionRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabasePtSessionRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IUserRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseUserRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IClassScheduleRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseClassScheduleRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IBookingRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseBookingRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.ICheckInRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseCheckInRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IMemberPackageRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseMemberPackageRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.IInvoiceRepository, SmartGym.Infrastructure.Persistence.EF.InvoiceRepository>();
builder.Services.AddSingleton<ITokenService, TokenService>();
// Note: Keeping IJwtTokenGenerator for the custom middleware backward compatibility
builder.Services.AddSingleton<SmartGym.Application.Interfaces.Services.IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// ── Services: Application ──
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

// ── Services: Flow 3 (thanh toán trực tuyến, hóa đơn điện tử, báo cáo) ──
builder.Services.Configure<SmartGym.Infrastructure.Services.VnPayOptions>(
    builder.Configuration.GetSection(SmartGym.Infrastructure.Services.VnPayOptions.SectionName));
builder.Services.Configure<SmartGym.Infrastructure.Services.SmtpOptions>(
    builder.Configuration.GetSection(SmartGym.Infrastructure.Services.SmtpOptions.SectionName));
builder.Services.AddScoped<IVnPayGateway, SmartGym.Infrastructure.Services.VnPayGateway>();
builder.Services.AddScoped<IEmailService, SmartGym.Infrastructure.Services.SmtpEmailService>();
builder.Services.AddHostedService<SubscriptionExpiryBackgroundService>();

// Chấp nhận hình thức thanh toán dạng số (0..4) hoặc mã ngắn ('qr', 'card', 'wallet', 'counter').
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new PaymentMethodJsonConverter());
});

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
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

// ── CORS ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── Swagger ──
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SchemaFilter<PaymentEnumSchemaFilter>();

    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartGym API",
        Version = "v1",
        Description = "REST API for the SmartGym Center management system (ASP.NET Core, PostgreSQL/Supabase)."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Paste the JWT token here. Do not prefix it with 'Bearer'.",
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
            using (var command = db.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = sql;
                db.Database.OpenConnection();
                command.ExecuteNonQuery();
            }
            app.Logger.LogInformation("Successfully executed supabase_schema.sql on startup.");
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("DB init error: {Message}", ex.Message);
    }

    // ── Flow 3: đồng bộ cột bảng invoices với EF Core (an toàn khi chạy lại) ──
    try
    {
        db.Database.ExecuteSqlRaw(@"
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL;
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
            CREATE INDEX IF NOT EXISTS idx_invoices_payment_status_created_at ON invoices(payment_status, created_at);
            CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
        ");
        app.Logger.LogInformation("Flow 3: invoices schema is in sync with the EF Core model.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("Flow 3 schema sync error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw("GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;");
        db.Database.ExecuteSqlRaw("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;");
        
        db.Database.ExecuteSqlRaw(@"
            INSERT INTO sports (id, name, description) VALUES 
            ('11111111-1111-1111-1111-111111111111', 'Yoga', 'Lớp học Yoga thư giãn'),
            ('22222222-2222-2222-2222-222222222222', 'Bơi lội', 'Lớp học bơi căn bản')
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO facilities (id, name, address) VALUES 
            ('33333333-3333-3333-3333-333333333333', 'SmartGym Quận 1', '123 Nguyễn Huệ, Q1, TP.HCM')
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO packages (id, name, package_type, monthly_price) VALUES 
            ('yoga_pack', 'Gói Tập Yoga', 'sport', 500000)
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO subscriptions (id, user_id, package_id, sport_id, total_amount, payment_status, start_date, end_date)
            SELECT gen_random_uuid(), u.id, 'yoga_pack', '11111111-1111-1111-1111-111111111111', 500000, 'completed', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '30 days'
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'member'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.payment_status = 'completed');
        ");
        app.Logger.LogInformation("Successfully granted permissions and seeded initial testing data.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("DB grant/seed error: {Message}", ex.Message);
    }
}

// ── Middleware pipeline ──

app.UseCors("AllowAll");
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
app.MapPaymentEndpoints();
app.MapCoachEndpoints();

app.MapClassEndpoints();
app.MapBookingEndpoints();
app.MapCheckInEndpoints();

app.MapGet("/api/sports", async (Supabase.Client client) =>
{
    var response = await client.From<SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel>().Get();
    return Results.Ok(response.Models.Select(s => new { id = s.Id, name = s.Name }));
});

app.MapGet("/api/facilities", async (Supabase.Client client) =>
{
    var response = await client.From<SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel>().Get();
    return Results.Ok(response.Models.Select(f => new { id = f.Id, name = f.Name }));
});

app.MapGet("/api/coaches", async (Guid? sportId, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
{
    var coaches = new List<object>();
    using var command = db.Database.GetDbConnection().CreateCommand();
    string sql = @"
        SELECT c.id, u.full_name, u.email 
        FROM coaches c
        JOIN users u ON c.user_id = u.id";

    if (sportId.HasValue)
    {
        sql += @"
        JOIN coach_sports cs ON c.id = cs.coach_id
        WHERE cs.sport_id = @sportId";

        var param = command.CreateParameter();
        param.ParameterName = "@sportId";
        param.Value = sportId.Value;
        command.Parameters.Add(param);
    }

    command.CommandText = sql;
    await db.Database.OpenConnectionAsync();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        coaches.Add(new {
            id = reader.GetGuid(0),
            fullName = reader.IsDBNull(1) ? null : reader.GetString(1),
            email = reader.IsDBNull(2) ? null : reader.GetString(2)
        });
    }

    return Results.Ok(coaches);
});

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();

