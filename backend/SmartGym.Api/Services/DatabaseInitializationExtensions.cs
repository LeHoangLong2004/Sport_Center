using System;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api;

public static class DatabaseInitializationExtensions
{
    public static void InitializeDatabase(WebApplication app, IWebHostEnvironment environment)
    {

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SmartGymDbContext>();
    try
    {
        var sqlPath = Path.Combine(
            environment.ContentRootPath,
            "..",
            "..",
            "supabase_schema.sql"
        );
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
        db.Database.ExecuteSqlRaw(
            @"
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL;
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
            CREATE INDEX IF NOT EXISTS idx_invoices_payment_status_created_at ON invoices(payment_status, created_at);
            CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
        "
        );
        app.Logger.LogInformation("Flow 3: invoices schema is in sync with the EF Core model.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("Flow 3 schema sync error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            ALTER TABLE packages ADD COLUMN IF NOT EXISTS catalog_json JSONB;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS duration_months INTEGER;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(8, 3) NOT NULL DEFAULT 0;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS package_snapshot_json JSONB;
            ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
        "
        );
        app.Logger.LogInformation("Package catalog and order schema is in sync.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("Package catalog schema sync error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            CREATE TABLE IF NOT EXISTS coach_profiles (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                specialties TEXT,
                certifications TEXT,
                experience_years INT,
                bio TEXT
            );
        "
        );
        app.Logger.LogInformation("coach_profiles table ensured.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("coach_profiles create error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id VARCHAR(100) PRIMARY KEY,
                type VARCHAR(50) NOT NULL DEFAULT 'direct',
                coach_title VARCHAR(255),
                coach_subtitle VARCHAR(255),
                member_title VARCHAR(255),
                member_subtitle VARCHAR(255),
                avatar TEXT,
                coach_avatar TEXT,
                last_message TEXT,
                last_time VARCHAR(50),
                unread_count INT DEFAULT 0,
                online BOOLEAN DEFAULT true,
                coach_id VARCHAR(100),
                coach_name VARCHAR(255),
                member_id VARCHAR(100),
                member_name VARCHAR(255),
                updated_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
                id VARCHAR(100) PRIMARY KEY,
                conversation_id VARCHAR(100) REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender VARCHAR(50) NOT NULL,
                sender_name VARCHAR(255),
                text TEXT NOT NULL,
                timestamp VARCHAR(50) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now()
            );

            GRANT ALL ON public.chat_conversations TO anon, authenticated;
            GRANT ALL ON public.chat_messages TO anon, authenticated;
        "
        );
        app.Logger.LogInformation("chat_conversations and chat_messages tables ensured.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("chat tables ensure error: {Message}", ex.Message);
    }

    try
    {
        db.Database.ExecuteSqlRaw(
            "GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;"
        );
        db.Database.ExecuteSqlRaw(
            "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;"
        );

        db.Database.ExecuteSqlRaw(
            @"
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

            INSERT INTO users (id, role_id, full_name, email, phone_number, password_hash, status)
            VALUES 
                ('25f50fba-506a-4edf-9db7-43f77f6741a4', (SELECT id FROM roles WHERE LOWER(name) = 'coach' LIMIT 1), 'Ho Xuan Anh Nam', 'hoxuananhnam1@gmail.com', '0989123789', '$2a$11$e/r08VbM70tWp6Z97lC4wO9Fh0Zz7XhO3aW8u8/r08VbM70tWp6Z9', true),
                ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM roles WHERE LOWER(name) = 'member' LIMIT 1), 'Ho Xuan Anh Nam', 'hoxuananhnam@gmail.com', '0989123788', '$2a$11$e/r08VbM70tWp6Z97lC4wO9Fh0Zz7XhO3aW8u8/r08VbM70tWp6Z9', true)
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO coach_profiles (user_id, specialties, certifications, experience_years, bio)
            VALUES ('25f50fba-506a-4edf-9db7-43f77f6741a4', 'Gym Fitness, Yoga, BodyCombat', 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM)', 3, 'Huấn luyện viên thể hình chuyên sâu.')
            ON CONFLICT (user_id) DO NOTHING;
        "
        );
        app.Logger.LogInformation(
            "Successfully granted permissions and seeded initial testing data."
        );
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("DB grant/seed error: {Message}", ex.Message);
    }
}


    }
}
