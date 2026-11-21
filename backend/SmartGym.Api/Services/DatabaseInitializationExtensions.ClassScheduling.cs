using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api;

public static partial class DatabaseInitializationExtensions
{
    private static void EnsureClassSchedulingSchema(SmartGymDbContext db, ILogger logger)
    {
        try
        {
            db.Database.ExecuteSqlRaw(
                """
                CREATE TABLE IF NOT EXISTS class_courses (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    sport_id UUID NOT NULL REFERENCES sports(id),
                    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
                    facility_id UUID NOT NULL REFERENCES facilities(id),
                    class_name VARCHAR(255) NOT NULL,
                    schedule_type VARCHAR(20) NOT NULL,
                    start_date DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_mode VARCHAR(30) NOT NULL,
                    end_date DATE,
                    weeks INTEGER,
                    total_sessions INTEGER NOT NULL,
                    duration_minutes INTEGER NOT NULL,
                    capacity INTEGER NOT NULL,
                    seats_taken INTEGER NOT NULL DEFAULT 0,
                    fee NUMERIC(12,2) NOT NULL DEFAULT 0,
                    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
                    time_zone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
                    approval_status VARCHAR(20) NOT NULL DEFAULT 'draft',
                    schedule_version INTEGER NOT NULL DEFAULT 1,
                    rejection_reason TEXT,
                    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    CONSTRAINT class_courses_type_check CHECK (schedule_type IN ('ONE_TIME', 'RECURRING')),
                    CONSTRAINT class_courses_status_check CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'closed')),
                    CONSTRAINT class_courses_duration_check CHECK (duration_minutes BETWEEN 30 AND 180),
                    CONSTRAINT class_courses_capacity_check CHECK (capacity > 0 AND seats_taken BETWEEN 0 AND capacity)
                );

                CREATE TABLE IF NOT EXISTS sport_class_pricing (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
                    price_per_session NUMERIC(12,2) NOT NULL CHECK (price_per_session >= 0),
                    effective_from DATE NOT NULL,
                    effective_to DATE,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    CONSTRAINT sport_class_pricing_effective_range CHECK (effective_to IS NULL OR effective_to >= effective_from)
                );

                CREATE TABLE IF NOT EXISTS class_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    course_id UUID NOT NULL REFERENCES class_courses(id) ON DELETE CASCADE,
                    session_number INTEGER NOT NULL,
                    start_at TIMESTAMPTZ NOT NULL,
                    end_at TIMESTAMPTZ NOT NULL,
                    actual_facility_id UUID NOT NULL REFERENCES facilities(id),
                    actual_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'planned',
                    change_reason TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    CONSTRAINT class_sessions_time_check CHECK (end_at > start_at),
                    CONSTRAINT class_sessions_status_check CHECK (status IN ('planned', 'scheduled', 'rescheduled', 'cancelled', 'completed')),
                    CONSTRAINT class_sessions_course_number_unique UNIQUE (course_id, session_number)
                );

                CREATE TABLE IF NOT EXISTS course_enrollments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    course_id UUID NOT NULL REFERENCES class_courses(id) ON DELETE CASCADE,
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(20) NOT NULL DEFAULT 'held',
                    quoted_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
                    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
                    idempotency_key VARCHAR(128) NOT NULL,
                    held_until TIMESTAMPTZ,
                    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    CONSTRAINT course_enrollments_status_check CHECK (status IN ('held', 'confirmed', 'cancelled', 'refunded', 'expired')),
                    CONSTRAINT course_enrollments_user_course_unique UNIQUE (course_id, user_id),
                    CONSTRAINT course_enrollments_idempotency_unique UNIQUE (user_id, idempotency_key)
                );

                CREATE TABLE IF NOT EXISTS class_session_enrollments (
                    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
                    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
                    attendance_status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
                    PRIMARY KEY (session_id, enrollment_id),
                    CONSTRAINT class_session_enrollments_status_check CHECK (attendance_status IN ('scheduled', 'present', 'absent', 'late', 'cancelled'))
                );

                CREATE TABLE IF NOT EXISTS class_course_waitlist (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    course_id UUID NOT NULL REFERENCES class_courses(id) ON DELETE CASCADE,
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
                    offer_expires_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    CONSTRAINT class_course_waitlist_status_check CHECK (status IN ('waiting', 'offered', 'accepted', 'expired', 'cancelled')),
                    CONSTRAINT class_course_waitlist_user_course_unique UNIQUE (course_id, user_id)
                );

                CREATE TABLE IF NOT EXISTS class_audit_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    course_id UUID REFERENCES class_courses(id) ON DELETE CASCADE,
                    session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
                    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    actor_role VARCHAR(50),
                    action VARCHAR(80) NOT NULL,
                    reason TEXT,
                    before_data JSONB,
                    after_data JSONB,
                    correlation_id VARCHAR(128),
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                );

                CREATE INDEX IF NOT EXISTS idx_class_courses_status_start
                    ON class_courses(approval_status, start_date);
                CREATE INDEX IF NOT EXISTS idx_sport_class_pricing_lookup
                    ON sport_class_pricing(sport_id, is_active, effective_from DESC);
                CREATE UNIQUE INDEX IF NOT EXISTS ux_sport_class_pricing_version
                    ON sport_class_pricing(sport_id, effective_from);
                CREATE INDEX IF NOT EXISTS idx_class_sessions_course_start
                    ON class_sessions(course_id, start_at);
                CREATE INDEX IF NOT EXISTS idx_class_sessions_facility_time
                    ON class_sessions(actual_facility_id, start_at, end_at);
                CREATE INDEX IF NOT EXISTS idx_class_sessions_coach_time
                    ON class_sessions(actual_coach_id, start_at, end_at);
                CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_status
                    ON course_enrollments(course_id, status);
                CREATE INDEX IF NOT EXISTS idx_class_course_waitlist_queue
                    ON class_course_waitlist(course_id, status, created_at);

                ALTER TABLE course_enrollments
                    DROP CONSTRAINT IF EXISTS course_enrollments_user_course_unique;
                CREATE UNIQUE INDEX IF NOT EXISTS ux_course_enrollments_active_user_course
                    ON course_enrollments(course_id, user_id)
                    WHERE status IN ('held', 'confirmed');
                ALTER TABLE class_course_waitlist
                    DROP CONSTRAINT IF EXISTS class_course_waitlist_user_course_unique;
                CREATE UNIQUE INDEX IF NOT EXISTS ux_class_course_waitlist_active_user_course
                    ON class_course_waitlist(course_id, user_id)
                    WHERE status IN ('waiting', 'offered');

                INSERT INTO sport_class_pricing (sport_id, price_per_session, effective_from, is_active)
                SELECT id,
                       CASE LOWER(name)
                           WHEN 'yoga' THEN 120000
                           WHEN 'bơi lội' THEN 180000
                           WHEN 'boxing' THEN 200000
                           WHEN 'bóng đá' THEN 150000
                           WHEN 'futsal' THEN 150000
                           WHEN 'cầu lông' THEN 120000
                           WHEN 'gym' THEN 100000
                           WHEN 'pilates' THEN 130000
                           WHEN 'zumba' THEN 100000
                           ELSE 150000
                       END,
                       CURRENT_DATE,
                       TRUE
                FROM sports s
                WHERE NOT EXISTS (
                    SELECT 1 FROM sport_class_pricing p
                    WHERE p.sport_id = s.id AND p.is_active AND p.effective_to IS NULL
                );
                """);

            logger.LogInformation("Enterprise class scheduling schema is ready.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Enterprise class scheduling schema could not be initialized.");
        }
    }
}
