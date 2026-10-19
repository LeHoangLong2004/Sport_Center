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
        var baseSchemaExists = db.Database
            .SqlQueryRaw<bool>(@"SELECT to_regclass('public.roles') IS NOT NULL AND to_regclass('public.users') IS NOT NULL AS ""Value""")
            .FirstOrDefault();

        if (baseSchemaExists)
        {
            app.Logger.LogInformation("Base Supabase schema already exists; skipped non-idempotent schema script.");
        }
        else if (File.Exists(sqlPath))
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
        Console.WriteLine($"DB init error: {ex.Message}");
    }

    // Coach-created classes stay hidden from members until a Manager approves them.
    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            ALTER TABLE classes
                ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved';
            UPDATE classes
                SET approval_status = 'approved'
                WHERE approval_status IS NULL OR approval_status = '';
            CREATE INDEX IF NOT EXISTS idx_classes_approval_status
                ON classes(approval_status);
            "
        );
        app.Logger.LogInformation("classes approval workflow schema is ready.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Class approval schema sync error: {ex.Message}");
    }

    // Sync the homework table with the database-backed workout-plan flow.
    // Older databases used communication_id only; keep it nullable for
    // backwards compatibility while adding the fields used by HomeworkProgress.
    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'homework_progress'
                      AND column_name = 'communication_id'
                ) THEN
                    ALTER TABLE homework_progress
                        ALTER COLUMN communication_id DROP NOT NULL;
                END IF;
            END $$;
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS plan_id UUID;
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS assigned_by UUID;
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS progress_pct NUMERIC DEFAULT 0;
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMPTZ NOT NULL DEFAULT now();
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS notes TEXT;
            ALTER TABLE homework_progress
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
            ALTER TABLE homework_progress
                ALTER COLUMN status SET DEFAULT 'assigned';

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'homework_progress_plan_id_fkey'
                      AND conrelid = 'homework_progress'::regclass
                ) THEN
                    ALTER TABLE homework_progress
                        ADD CONSTRAINT homework_progress_plan_id_fkey
                        FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE;
                END IF;
            END $$;

            CREATE INDEX IF NOT EXISTS idx_homework_progress_member_id
                ON homework_progress(member_id);
            CREATE INDEX IF NOT EXISTS idx_homework_progress_plan_id
                ON homework_progress(plan_id);
            "
        );
        app.Logger.LogInformation("homework_progress schema is in sync with workout plans.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Homework schema sync error: {ex.Message}");
    }

    // ── Flow 3: đồng bộ cột bảng invoices với EF Core (an toàn khi chạy lại) ──
    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL;
            ALTER TABLE facilities ADD COLUMN IF NOT EXISTS image_url TEXT;
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS fulfillment_method VARCHAR(50) NOT NULL DEFAULT 'counter_pickup';
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'pending';
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS delivery_location TEXT;
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ;
            CREATE TABLE IF NOT EXISTS product_order_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
                sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_product_order_messages_invoice
                ON product_order_messages(invoice_id, created_at);
            CREATE INDEX IF NOT EXISTS idx_invoices_payment_status_created_at ON invoices(payment_status, created_at);
            CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
        "
        );
        app.Logger.LogInformation("Flow 3: invoices schema is in sync with the EF Core model.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Flow 3 schema sync error: {ex.Message}");
    }

    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                sender_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                target_type VARCHAR(20) DEFAULT 'member',
                target_id UUID,
                type VARCHAR(50) DEFAULT 'Thông báo',
                state VARCHAR(20) DEFAULT 'published',
                title TEXT NOT NULL,
                message TEXT,
                deadline TIMESTAMPTZ,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT now()
            );
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_type VARCHAR(20);
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_id UUID;
            CREATE INDEX IF NOT EXISTS idx_notifications_unread
                ON notifications(user_id, is_read);

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
        Console.WriteLine($"Package catalog schema sync error: {ex.Message}");
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
        Console.WriteLine($"coach_profiles create error: {ex.Message}");
    }

    // Persist coach-published 1-on-1 availability slots. These slots are
    // separate from pt_sessions because they are still open for a member to
    // claim; once claimed, the row is marked as booked and remains part of
    // the coach's schedule history.
    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            CREATE TABLE IF NOT EXISTS coach_availability_slots (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
                start_time TIMESTAMPTZ NOT NULL,
                end_time TIMESTAMPTZ NOT NULL,
                sport TEXT NOT NULL,
                room TEXT NOT NULL,
                note TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                booked_member_id UUID REFERENCES users(id) ON DELETE SET NULL,
                booked_member_name TEXT,
                booked_member_phone VARCHAR(30),
                goal TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT coach_availability_slots_valid_range CHECK (end_time > start_time),
                CONSTRAINT coach_availability_slots_valid_status CHECK (status IN ('open', 'booked', 'closed', 'cancelled'))
            );

            CREATE INDEX IF NOT EXISTS idx_coach_availability_slots_coach_time
                ON coach_availability_slots(coach_id, start_time, end_time);
            CREATE INDEX IF NOT EXISTS idx_coach_availability_slots_open_time
                ON coach_availability_slots(status, start_time);

            -- Demo tokens can represent a member before that account is
            -- materialized in users. Keep the booking identity on the slot
            -- without making the availability flow fail on that FK.
            ALTER TABLE coach_availability_slots
                DROP CONSTRAINT IF EXISTS coach_availability_slots_booked_member_id_fkey;
            "
        );
        app.Logger.LogInformation("coach_availability_slots table is ready.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"coach availability schema sync error: {ex.Message}");
    }

    // Persist Coach operational data that used to live in static in-memory
    // collections. These tables are idempotent so existing databases can be
    // upgraded simply by restarting the API.
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
            "
        );
        app.Logger.LogInformation("Coach attendance, assessment, and schedule request tables are ready.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Coach operational schema sync error: {ex.Message}");
    }

    // Keep the review table compatible with both the original EF migration
    // (member_id) and the running Supabase schema (user_id). Review data is
    // always stored in PostgreSQL; this block only aligns legacy column names
    // and adds the optional context fields used by the review form.
    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            CREATE TABLE IF NOT EXISTS reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                coach_id UUID,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                session_id TEXT,
                session_name TEXT,
                tags_json TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'member_id'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'user_id'
                ) THEN
                    ALTER TABLE reviews RENAME COLUMN member_id TO user_id;
                END IF;
            END $$;

            ALTER TABLE reviews ADD COLUMN IF NOT EXISTS session_id TEXT;
            ALTER TABLE reviews ADD COLUMN IF NOT EXISTS session_name TEXT;
            ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tags_json TEXT;
            CREATE INDEX IF NOT EXISTS idx_reviews_coach_id ON reviews(coach_id);
            CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
        "
        );
        app.Logger.LogInformation("reviews schema is in sync with the database-backed review flow.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"reviews schema sync error: {ex.Message}");
    }

    try
    {
        db.Database.ExecuteSqlRaw(
            @"
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id VARCHAR(100) PRIMARY KEY,
                type VARCHAR(50) NOT NULL DEFAULT 'direct',
                category VARCHAR(50) NOT NULL DEFAULT 'coach',
                role_tag VARCHAR(50) NOT NULL DEFAULT 'HLV',
                badge_color VARCHAR(50) NOT NULL DEFAULT 'orange',
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

            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'coach';
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS role_tag VARCHAR(50) NOT NULL DEFAULT 'HLV';
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50) NOT NULL DEFAULT 'orange';

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
            CREATE INDEX IF NOT EXISTS idx_chat_conversations_coach ON chat_conversations(coach_id);
            CREATE INDEX IF NOT EXISTS idx_chat_conversations_member ON chat_conversations(member_id);
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
}
