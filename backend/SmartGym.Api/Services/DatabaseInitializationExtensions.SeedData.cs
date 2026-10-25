using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api;

public static partial class DatabaseInitializationExtensions
{
    private static void EnsureCoachOperationalTables(SmartGymDbContext db, WebApplication app)
    {
        try
        {
            db.Database.ExecuteSqlRaw(
                @"
                CREATE TABLE IF NOT EXISTS class_attendance_sheets (
                    session_id UUID PRIMARY KEY REFERENCES classes(id) ON DELETE CASCADE,
                    state VARCHAR(20) NOT NULL DEFAULT 'unmarked',
                    version INT NOT NULL DEFAULT 1,
                    finalized_at TIMESTAMPTZ,
                    finalized_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                );

                CREATE TABLE IF NOT EXISTS class_attendance_records (
                    session_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(30),
                    note TEXT,
                    PRIMARY KEY (session_id, member_id)
                );

                CREATE TABLE IF NOT EXISTS coach_assessments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
                    session_id UUID REFERENCES classes(id) ON DELETE CASCADE,
                    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    completion INT NOT NULL DEFAULT 0 CHECK (completion >= 0 AND completion <= 100),
                    metrics_json JSONB NOT NULL DEFAULT '[]'::jsonb,
                    comment TEXT,
                    next_step TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                );
                CREATE INDEX IF NOT EXISTS idx_coach_assessments_coach_created
                    ON coach_assessments(coach_id, created_at DESC);

                CREATE TABLE IF NOT EXISTS coach_schedule_requests (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
                    session_id UUID REFERENCES classes(id) ON DELETE SET NULL,
                    request_type VARCHAR(30) NOT NULL,
                    substitute_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
                    new_date DATE,
                    new_time VARCHAR(50),
                    reason TEXT NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'pending',
                    manager_note TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                );
                CREATE INDEX IF NOT EXISTS idx_coach_schedule_requests_coach_created
                    ON coach_schedule_requests(coach_id, created_at DESC);

                ALTER TABLE users ADD COLUMN IF NOT EXISTS member_code VARCHAR(50);
                ALTER TABLE users ADD COLUMN IF NOT EXISTS training_goal TEXT;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS training_level VARCHAR(50);
                "
            );
            app.Logger.LogInformation("Coach attendance, assessment, and schedule request tables are ready.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Coach operational schema sync error: {ex.Message}");
        }
    }

    private static void SeedInitialData(SmartGymDbContext db, WebApplication app)
    {
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

                CREATE TABLE IF NOT EXISTS gate_checkins (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    member_id UUID NOT NULL,
                    branch_id UUID,
                    member_package_id UUID,
                    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    receptionist_id UUID
                );
                GRANT ALL ON public.gate_checkins TO anon, authenticated;

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
                ON CONFLICT (email) DO NOTHING;

                INSERT INTO coach_profiles (user_id, specialties, certifications, experience_years, bio)
                SELECT u.id, 'Gym Fitness, Yoga, BodyCombat', 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM)', 3, 'Huấn luyện viên thể hình chuyên sâu.'
                FROM users u
                WHERE u.email = 'hoxuananhnam1@gmail.com'
                ON CONFLICT (user_id) DO NOTHING;
            "
            );
            app.Logger.LogInformation(
                "Successfully granted permissions and seeded initial testing data."
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DB grant/seed error: {ex.Message}");
        }
    }
}
