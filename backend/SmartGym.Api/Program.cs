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
builder.Services.AddScoped<SmartGym.Application.Interfaces.IBodyMetricRepository, SmartGym.Infrastructure.Persistence.EF.Repositories.BodyMetricRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.IWorkoutPlanRepository, SmartGym.Infrastructure.Persistence.EF.Repositories.WorkoutPlanRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.IHomeworkProgressRepository, SmartGym.Infrastructure.Persistence.EF.Repositories.HomeworkProgressRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.IReviewRepository, SmartGym.Infrastructure.Persistence.EF.Repositories.ReviewRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IProductRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseProductRepository>();
builder.Services.AddScoped<SmartGym.Application.Interfaces.Repositories.IAppointmentRepository, SmartGym.Infrastructure.Persistence.Supabase.Repositories.SupabaseAppointmentRepository>();
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
builder.Services.AddScoped<IBodyMetricService, BodyMetricService>();
builder.Services.AddScoped<IWorkoutPlanService, WorkoutPlanService>();
builder.Services.AddScoped<IHomeworkProgressService, HomeworkProgressService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<PackageCatalogService>();

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
        db.Database.ExecuteSqlRaw(@"
            ALTER TABLE packages ADD COLUMN IF NOT EXISTS catalog_json JSONB;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS duration_months INTEGER;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(8, 3) NOT NULL DEFAULT 0;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS package_snapshot_json JSONB;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
        ");
        app.Logger.LogInformation("Package catalog and order schema is in sync.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("Package catalog schema sync error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS coach_profiles (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                specialties TEXT,
                certifications TEXT,
                experience_years INT,
                bio TEXT
            );
        ");
        app.Logger.LogInformation("coach_profiles table ensured.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("coach_profiles create error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw("GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;");
        db.Database.ExecuteSqlRaw("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;");
        
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS appointments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                time VARCHAR(10) NOT NULL,
                title TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                coach_name TEXT,
                status VARCHAR(50) DEFAULT 'Đang chờ khách'
            );
            GRANT ALL ON public.appointments TO anon, authenticated;

            INSERT INTO sports (id, name, description) VALUES 
            ('11111111-1111-1111-1111-111111111111', 'Yoga', 'Lớp học Yoga thư giãn'),
            ('22222222-2222-2222-2222-222222222222', 'Bơi lội', 'Lớp học bơi căn bản')
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO facilities (id, name, address) VALUES 
            ('33333333-3333-3333-3333-333333333333', 'SmartGym Quận 1', '123 Nguyễn Huệ, Q1, TP.HCM')
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO packages (id, name, package_type, monthly_price, yearly_price, tagline) VALUES 
            ('yoga_pack', 'Gói Tập Yoga', 'sport', 500000, 5000000, 'Thư giãn tâm trí, rèn luyện cơ thể'),
            ('swim_pack', 'Gói Tập Bơi Lội', 'sport', 600000, 6000000, 'Tăng cường sức khỏe tim mạch'),
            ('premium_fit', 'Premium Fitness', 'membership', 800000, 8000000, 'Truy cập toàn bộ thiết bị phòng gym'),
            ('vip_combo', 'Thẻ VIP Toàn Diện', 'membership', 1200000, 12000000, 'Đặc quyền VIP, tủ đồ, khăn tắm riêng')
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name, 
                monthly_price = EXCLUDED.monthly_price,
                yearly_price = EXCLUDED.yearly_price,
                tagline = EXCLUDED.tagline;

            INSERT INTO subscriptions (id, user_id, package_id, sport_id, total_amount, payment_status, start_date, end_date)
            SELECT gen_random_uuid(), u.id, 'yoga_pack', '11111111-1111-1111-1111-111111111111', 500000, 'completed', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '30 days'
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'member'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.payment_status = 'completed');

            INSERT INTO products (id, name, category, price, stock_quantity, image_url, status)
            VALUES 
                ('44444444-4444-4444-4444-444444444444', 'Nước khoáng Dasani 500ml', 'Đồ uống', 15000, 100, '/assets/cf835.png', true),
                ('55555555-5555-5555-5555-555555555555', 'Nước tăng lực Redbull', 'Đồ uống', 25000, 50, '/assets/c5e97.png', true),
                ('66666666-6666-6666-6666-666666666666', 'Bánh bông lan ức gà', 'Thực phẩm', 45000, 20, '/assets/28ab4.png', true),
                ('77777777-7777-7777-7777-777777777777', 'Găng tay tập gym', 'Phụ kiện', 150000, 15, '/assets/235a3.png', true)
            ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;

            INSERT INTO appointments (id, time, title, customer_name, coach_name, status)
            VALUES
                ('88888888-8888-8888-8888-888888888888', '08:00', 'Lớp Yoga mở màn (Tư vấn hội viên)', 'Đặng Hồng Liên', 'Minh Tuyết', 'Đã hoàn tất'),
                ('99999999-9999-9999-9999-999999999999', '10:00', 'Tập thử buổi 1 - PT kèm riêng 1:1', 'Trần Trung Kiên', 'Trần Khoa', 'Đang chờ khách'),
                ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '14:00', 'Tư vấn gia hạn gói tập vàng', 'Vũ Phương Thảo', 'Lễ tân', 'Đã hủy')
            ON CONFLICT (id) DO NOTHING;
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
app.MapPackageCatalogEndpoints();
app.MapPaymentEndpoints();
app.MapCoachEndpoints();

app.MapClassEndpoints();
app.MapBookingEndpoints();
app.MapCheckInEndpoints();
app.MapBodyMetricEndpoints();
app.MapWorkoutPlanEndpoints();
app.MapHomeworkEndpoints();
app.MapReviewEndpoints();
app.MapProductEndpoints();
app.MapAppointmentEndpoints();

app.MapGet("/api/sports", async (Supabase.Client client) =>
{
    var response = await client.From<SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel>().Get();
    return Results.Ok(response.Models.Select(s => new { id = s.Id, name = s.Name }));
});

app.MapPost("/api/sports", async (SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel request, Supabase.Client client) =>
{
    request.Id = Guid.NewGuid();
    await client.From<SmartGym.Infrastructure.Persistence.Supabase.Models.SportModel>().Insert(request);
    return Results.Ok(new { id = request.Id, name = request.Name });
}).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapGet("/api/facilities", async (Supabase.Client client) =>
{
    var response = await client.From<SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel>().Get();
    return Results.Ok(response.Models.Select(f => new { id = f.Id, name = f.Name }));
});

app.MapPost("/api/facilities", async (SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel request, Supabase.Client client) =>
{
    request.Id = Guid.NewGuid();
    await client.From<SmartGym.Infrastructure.Persistence.Supabase.Models.FacilityModel>().Insert(request);
    return Results.Ok(new { id = request.Id, name = request.Name });
}).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

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


app.MapGet("/api/classes/all", async (ClassService service) =>
{
    var classes = await service.GetAllClassesAsync();
    return Results.Ok(classes);
});
app.MapGet("/api/bookings/all", async (ClassService service) =>
{
    var bookings = await service.GetAllBookingsForManagerAsync();
    return Results.Ok(bookings);
}).RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));

app.MapPut("/api/bookings/{id}/approve", async (Guid id, ClassService service) =>
{
    var (isSuccess, errorMessage) = await service.ApproveBookingAsync(id);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    return Results.Ok(new { message = "Đã duyệt đơn đặt lớp thành công" });
}).RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));

app.MapPut("/api/bookings/{id}/reject", async (Guid id, ClassService service) =>
{
    var (isSuccess, errorMessage) = await service.RejectBookingAsync(id);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    return Results.Ok(new { message = "Đã từ chối đơn đặt lớp" });
}).RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));

app.MapGet("/api/classes/{id}", async (Guid id, ClassService service) =>
{
    var classDetail = await service.GetClassDetailAsync(id);
    if (classDetail == null) return Results.NotFound(new { message = "Class not found" });
    return Results.Ok(classDetail);
});

app.MapPost("/api/classes/{id}/book", async (Guid id, HttpContext httpContext, ClassService service) =>
{
    var userIdClaim = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }

    var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    
    return Results.Ok(new { message = "Successfully booked the class!" });
}).RequireAuthorization(policy => policy.RequireRole("Member", "Admin", "Manager", "member", "admin", "manager"));

// Giai đoạn D: Receptionist đặt hộ
app.MapPost("/api/classes/{id}/book-for-member", async (Guid id, [Microsoft.AspNetCore.Mvc.FromBody] SmartGym.Application.DTOs.Classes.BookForMemberRequest request, ClassService service) =>
{
    var (isSuccess, errorMessage) = await service.BookClassAsync(request.MemberId, id);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    
    return Results.Ok(new { message = "Successfully booked the class for member!" });
}).RequireAuthorization(policy => policy.RequireRole("receptionist", "manager", "admin"));

// Giai đoạn E: Hủy đăng ký (Hội viên / Lễ tân)
app.MapPost("/api/classes/{id}/cancel-booking", async (Guid id, HttpContext httpContext, ClassService service) =>
{
    var userIdClaim = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }

    var (isSuccess, errorMessage) = await service.CancelBookingAsync(userId, id);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    
    return Results.Ok(new { message = "Successfully cancelled the booking!" });
}).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager", "receptionist"));

// Giai đoạn F: Thay đổi thông tin lớp học
app.MapPut("/api/classes/{id}", async (Guid id, [Microsoft.AspNetCore.Mvc.FromBody] SmartGym.Application.DTOs.Classes.CreateClassRequest request, ClassService service) =>
{
    var (isSuccess, errorMessage) = await service.UpdateClassAsync(id, request);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    return Results.Ok(new { message = "Class updated successfully" });
}).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

// Giai đoạn F: Hủy lớp học (Quản lý)
app.MapPost("/api/classes/{id}/cancel", async (Guid id, ClassService service) =>
{
    var (isSuccess, errorMessage) = await service.CancelClassAsync(id);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    return Results.Ok(new { message = "Class cancelled successfully" });
}).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

// ── GIAI ĐOẠN G: ĐIỂM DANH VÀ XEM LỊCH ──

// Điểm danh theo lớp (HLV / Receptionist / Manager / Admin)
app.MapPost("/api/classes/{id}/attendance", async (Guid id, [Microsoft.AspNetCore.Mvc.FromBody] SmartGym.Application.DTOs.Classes.UpdateAttendanceRequest request, ClassService service) =>
{
    var (isSuccess, errorMessage) = await service.UpdateAttendanceAsync(id, request);
    if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
    return Results.Ok(new { message = "Attendance updated successfully" });
}).RequireAuthorization(policy => policy.RequireRole("coach", "receptionist", "manager", "admin"));

// Xem lịch dành cho Member (Lớp + Buổi PT)
app.MapGet("/api/schedule/member", async (HttpContext httpContext, ClassService service) =>
{
    var userIdClaim = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }

    var schedule = await service.GetMemberScheduleAsync(userId);
    return Results.Ok(schedule);
}).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

// Endpoint lịch cá nhân dạng danh sách (MemberPortalV2)
app.MapGet("/api/schedule/my", async (HttpContext httpContext, ClassService service) =>
{
    var userIdClaim = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }

    var schedule = await service.GetMemberScheduleAsync(userId);
    var entries = schedule.ClassBookings.Select(b => new
    {
        id = b.ClassId,
        className = b.ClassName,
        sportType = b.SportName,
        roomName = b.FacilityName,
        coachName = b.CoachName,
        startTime = b.ScheduleTime,
        endTime = b.ScheduleTime.AddMinutes(b.DurationMinutes),
        role = "Member",
        bookingStatus = b.Status
    });

    return Results.Ok(entries);
}).RequireAuthorization();

// Xem lịch dành cho HLV (Các lớp phụ trách + danh sách học viên)
app.MapGet("/api/schedule/coach", async (DateTime? date, HttpContext httpContext, ClassService service) =>
{
    var userIdClaim = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }

    var schedule = await service.GetCoachScheduleAsync(userId, date);
    return Results.Ok(schedule);
}).RequireAuthorization(policy => policy.RequireRole("coach", "manager", "admin"));

// Xem lịch tổng quan dành cho Manager (Lọc theo cơ sở, HLV, bộ môn, ngày)
app.MapGet("/api/schedule/manager", async (Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date, ClassService service) =>
{
    var schedule = await service.GetManagerScheduleAsync(facilityId, coachId, sportId, date);
    return Results.Ok(schedule);
}).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
