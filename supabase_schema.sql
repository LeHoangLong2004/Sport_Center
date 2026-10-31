-- ==============================================================
-- ĐỒ ÁN SWP391 — SPORT CENTER DATABASE SCHEMA (TOÀN DIỆN BACKEND & SUPABASE)
-- HỆ QUẢN TRỊ CSDL: PostgreSQL / Supabase
-- KIẾN TRÚC MÔ HÌNH: Mô hình 3 (Gói môn độc lập + Nâng cấp Membership)
-- ĐỒNG BỘ: Toàn bộ Entities .NET Clean Architecture, EF Core DbContext,
--          Supabase Models, Repositories & Raw SQL Endpoints
-- TỔNG CỘNG: 48 bảng chuẩn 3NF
-- ==============================================================

-- Bật extension tạo UUID tự động trên PostgreSQL/Supabase
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================
-- PHẦN 1: HỆ THỐNG PHÂN QUYỀN VÀ TÀI KHOẢN (AUTH & RBAC)
-- ==============================================================

-- 1. Bảng vai trò người dùng trong hệ thống
CREATE TABLE IF NOT EXISTS roles (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  NOT NULL UNIQUE, -- 'admin', 'manager', 'coach', 'receptionist', 'member'
    description TEXT
);

-- 2. Bảng thông tin người dùng / tài khoản
CREATE TABLE IF NOT EXISTS users (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id           UUID         REFERENCES roles(id) ON DELETE SET NULL,
    member_code       VARCHAR(50)  UNIQUE, -- Mã hội viên (VD: MB-88992)
    full_name         TEXT         NOT NULL,
    phone_number      VARCHAR(20)  UNIQUE NOT NULL,
    email             VARCHAR(100) UNIQUE NOT NULL,
    password_hash     TEXT         NOT NULL,
    avatar_url        TEXT,
    date_of_birth     DATE,
    gender            VARCHAR(20),
    emergency_contact TEXT,
    training_goal     TEXT,                -- Mục tiêu tập luyện (Coach/Member Portal)
    training_level    VARCHAR(50),         -- Trình độ tập luyện (Beginner, Intermediate, Advanced)
    status            BOOLEAN      DEFAULT true, -- true: Hoạt động, false: Bị khóa
    created_at        TIMESTAMPTZ  DEFAULT now()
);


-- ==============================================================
-- PHẦN 2: CƠ SỞ VẬT CHẤT, CHI NHÁNH & PHÒNG TẬP
-- ==============================================================

-- 3. Bảng cơ sở thể thao (Facilities)
CREATE TABLE IF NOT EXISTS facilities (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name      TEXT        NOT NULL,
    image_url TEXT,
    address   TEXT        NOT NULL,
    hotline   VARCHAR(20),
    status    BOOLEAN     DEFAULT true
);

-- 4. Bảng chi nhánh mở rộng (Branches)
CREATE TABLE IF NOT EXISTS branches (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    address    VARCHAR(255) NOT NULL,
    phone      VARCHAR(20),
    status     BOOLEAN     DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng phòng tập / khu vực chuyên môn (Rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID         REFERENCES facilities(id) ON DELETE CASCADE,
    room_name   VARCHAR(100) NOT NULL,
    capacity    INT          DEFAULT 30,
    status      BOOLEAN      DEFAULT true
);


-- ==============================================================
-- PHẦN 3: DANH MỤC BỘ MÔN (SPORTS)
-- ==============================================================

-- 6. Bảng bộ môn thể thao (Bơi lội, Yoga, Boxing, Gym, Pilates,...)
CREATE TABLE IF NOT EXISTS sports (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT    NOT NULL,
    description TEXT,
    image_url   TEXT,
    status      BOOLEAN DEFAULT true
);


-- ==============================================================
-- PHẦN 4: GÓI TẬP — TRUNG TÂM CỦA MÔ HÌNH 3
-- ==============================================================

-- 7. Bảng danh mục gói tập (Gói môn độc lập & Gói nâng cấp)
CREATE TABLE IF NOT EXISTS packages (
    id            VARCHAR(50)   PRIMARY KEY, -- 'swim', 'yoga', 'boxing', 'plus', 'vip'
    name          TEXT          NOT NULL,
    tagline       TEXT,                      -- Slogan ngắn hiển thị UI
    package_type  VARCHAR(20)   NOT NULL DEFAULT 'sport', -- 'sport' | 'membership'
    monthly_price DECIMAL(18,2),
    yearly_price  DECIMAL(18,2),
    description   TEXT,
    status        BOOLEAN       DEFAULT true,
    catalog_json  JSONB                      -- Snapshot dynamic options & perks
);

-- 8. Bảng tính năng mô tả của từng gói tập
CREATE TABLE IF NOT EXISTS package_features (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id     VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    feature_text   TEXT        NOT NULL,
    is_highlighted BOOLEAN     DEFAULT false
);

-- 9. Bảng liên kết Gói môn và Bộ môn (Nhiều-Nhiều)
CREATE TABLE IF NOT EXISTS package_sports (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id VARCHAR(50) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    sport_id   UUID        NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE (package_id, sport_id)
);

-- 10. Bảng quyền lợi độc quyền của gói Membership (Plus / VIP)
CREATE TABLE IF NOT EXISTS membership_benefits (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id    VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    benefit_type  VARCHAR(50) NOT NULL, -- 'pt_discount', 'priority_booking', 'free_locker',...
    benefit_value TEXT,
    description   TEXT        NOT NULL
);


-- ==============================================================
-- PHẦN 5: VOUCHER, ĐĂNG KÝ GÓI & LIÊN KẾT BỘ MÔN
-- ==============================================================

-- 11. Bảng mã giảm giá / Voucher khuyến mãi
CREATE TABLE IF NOT EXISTS vouchers (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(50)   UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    max_discount     DECIMAL(18,2),
    valid_from       TIMESTAMPTZ,
    valid_to         TIMESTAMPTZ,
    usage_limit      INT,
    used_count       INT           DEFAULT 0,
    status           BOOLEAN       DEFAULT true
);

-- 12. Bảng hợp đồng đăng ký gói tập (Subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id           VARCHAR(50)   REFERENCES packages(id) ON DELETE SET NULL,
    sport_id             UUID          REFERENCES sports(id) ON DELETE SET NULL,
    facility_id          UUID          REFERENCES facilities(id) ON DELETE SET NULL,
    voucher_id           UUID          REFERENCES vouchers(id) ON DELETE SET NULL,
    billing_period       VARCHAR(20),  -- 'monthly' | 'yearly'
    duration_months      INT,
    total_amount         DECIMAL(18,2) NOT NULL,
    discount_pct         DECIMAL(5,2)  DEFAULT 0,
    discount_amount      DECIMAL(18,2) DEFAULT 0,
    package_snapshot_json JSONB,
    payment_method       VARCHAR(50),  -- 'qr', 'card', 'wallet', 'counter', 'bank_transfer'
    payment_status       VARCHAR(50)   DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    start_date           DATE          NOT NULL,
    end_date             DATE          NOT NULL,
    auto_renew           BOOLEAN       DEFAULT false,
    created_at           TIMESTAMPTZ   DEFAULT now(),
    paid_at              TIMESTAMPTZ
);

-- 13. Bảng phân quyền bộ môn cho từng Subscription (Hỗ trợ Combo nhiều môn)
CREATE TABLE IF NOT EXISTS subscription_sports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    sport_id        UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE (subscription_id, sport_id)
);

-- 14. Bảng danh mục gói hội viên rút gọn (Member Packages Cache)
CREATE TABLE IF NOT EXISTS member_packages (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id   VARCHAR(50)  REFERENCES packages(id) ON DELETE SET NULL,
    package_name VARCHAR(100),
    sport_name   VARCHAR(100),
    status       BOOLEAN      DEFAULT true,
    start_date   DATE,
    end_date     DATE
);


-- ==============================================================
-- PHẦN 6: ĐIỂM DANH CỔNG RA VÀO (GATE CHECK-IN)
-- ==============================================================

-- 15. Bảng nhật ký quét mã QR check-in cửa trung tâm
CREATE TABLE IF NOT EXISTS check_in_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
    facility_id     UUID        REFERENCES facilities(id) ON DELETE CASCADE,
    subscription_id UUID        REFERENCES subscriptions(id) ON DELETE SET NULL,
    check_in_time   TIMESTAMPTZ DEFAULT now(),
    check_out_time  TIMESTAMPTZ,
    method          VARCHAR(50) DEFAULT 'qr', -- 'qr' | 'manual' | 'face' | 'card'
    status          VARCHAR(50) DEFAULT 'Success'
);


-- ==============================================================
-- PHẦN 7: HUẤN LUYỆN VIÊN & LỊCH TRỐNG PT (COACH PORTAL)
-- ==============================================================

-- 16. Bảng hồ sơ huấn luyện viên (Coaches)
CREATE TABLE IF NOT EXISTS coaches (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty        TEXT,
    bio              TEXT,
    experience_years INT,
    rating           DECIMAL(3,2) DEFAULT 0.00,
    status           BOOLEAN      DEFAULT true
);

-- 17. Bảng thông tin chi tiết bằng cấp HLV (Coach Profiles)
CREATE TABLE IF NOT EXISTS coach_profiles (
    user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialties      TEXT,
    certifications   TEXT,
    experience_years INT,
    bio              TEXT
);

-- 18. Bảng phân công HLV phụ trách bộ môn nào (Nhiều-Nhiều)
CREATE TABLE IF NOT EXISTS coach_sports (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE (coach_id, sport_id)
);

-- 19. Bảng các khung giờ mở nhận học viên PT của Coach (Coach Availability Slots)
CREATE TABLE IF NOT EXISTS coach_availability_slots (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id            UUID        NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    start_time          TIMESTAMPTZ NOT NULL,
    end_time            TIMESTAMPTZ NOT NULL,
    sport               VARCHAR(100),
    room                VARCHAR(100),
    note                TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'booked', 'closed', 'cancelled'
    booked_member_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
    booked_member_name  VARCHAR(100),
    booked_member_phone VARCHAR(20),
    goal                TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- 20. Bảng đơn xin đổi ca / dạy thay / báo bận của Coach
CREATE TABLE IF NOT EXISTS coach_schedule_requests (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id            UUID        NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    session_id          UUID,
    request_type        VARCHAR(30) NOT NULL, -- 'shift_change', 'substitute', 'day_off'
    substitute_coach_id UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    new_date            DATE,
    new_time            VARCHAR(50),
    reason              TEXT        NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    manager_note        TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN 8: PERSONAL TRAINING (PT) & ĐẶT LỊCH HẸN
-- ==============================================================

-- 21. Bảng danh mục gói PT bán sẵn (theo số buổi)
CREATE TABLE IF NOT EXISTS pt_packages (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT          NOT NULL,
    session_count INT           NOT NULL,
    price         DECIMAL(18,2) NOT NULL,
    validity_days INT           NOT NULL,
    status        BOOLEAN       DEFAULT true
);

-- 22. Bảng hợp đồng đăng ký tập PT (PT Enrollments)
CREATE TABLE IF NOT EXISTS pt_enrollments (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id        UUID          REFERENCES coaches(id) ON DELETE SET NULL,
    pt_package_id   UUID          REFERENCES pt_packages(id) ON DELETE SET NULL,
    voucher_id      UUID          REFERENCES vouchers(id) ON DELETE SET NULL,
    total_sessions  INT           NOT NULL,
    used_sessions   INT           DEFAULT 0,
    payment_method  VARCHAR(50),
    payment_status  VARCHAR(50)   DEFAULT 'pending',
    total_amount    DECIMAL(18,2) NOT NULL,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    start_date      DATE          NOT NULL,
    end_date        DATE          NOT NULL,
    created_at      TIMESTAMPTZ   DEFAULT now()
);

-- 23. Bảng từng buổi tập PT chi tiết (PT Sessions)
CREATE TABLE IF NOT EXISTS pt_sessions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id    UUID        REFERENCES pt_enrollments(id) ON DELETE CASCADE,
    user_id          UUID        REFERENCES users(id) ON DELETE CASCADE,
    coach_id         UUID        REFERENCES coaches(id) ON DELETE CASCADE,
    schedule_time    TIMESTAMPTZ NOT NULL,
    duration_minutes INT         DEFAULT 60,
    status           VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- 24. Bảng lịch hẹn tư vấn / kiểm tra thể lực (Appointments)
CREATE TABLE IF NOT EXISTS appointments (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        REFERENCES users(id) ON DELETE CASCADE,
    coach_id      UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    schedule_time TIMESTAMPTZ NOT NULL,
    status        VARCHAR(50) DEFAULT 'scheduled',
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 25. Bảng đánh giá và nhận xét huấn luyện viên (Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id     UUID        NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    rating       INT         CHECK (rating >= 1 AND rating <= 5),
    comment      TEXT,
    session_id   UUID,
    session_name VARCHAR(100),
    tags_json    JSONB,
    created_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, coach_id)
);


-- ==============================================================
-- PHẦN 9: LỚP HỌC GROUP-X, CHƯƠNG TRÌNH & ĐẶT LỚP
-- ==============================================================

-- 26. Bảng danh mục chương trình học (Class Programs)
CREATE TABLE IF NOT EXISTS class_programs (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    sport_id         UUID         REFERENCES sports(id) ON DELETE SET NULL,
    level            VARCHAR(50),
    duration_minutes INT          DEFAULT 60,
    status           BOOLEAN      DEFAULT true
);

-- 27. Bảng lớp học Group-X (Classes)
CREATE TABLE IF NOT EXISTS classes (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id         UUID        REFERENCES sports(id) ON DELETE CASCADE,
    coach_id         UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    facility_id      UUID        REFERENCES facilities(id) ON DELETE CASCADE,
    class_name       TEXT        NOT NULL,
    level            VARCHAR(50),
    room             VARCHAR(100),
    schedule_time    TIMESTAMPTZ NOT NULL,
    duration_minutes INT         DEFAULT 60,
    capacity         INT         NOT NULL,
    current_enrolled INT         DEFAULT 0,
    status           BOOLEAN     DEFAULT true,
    approval_status  VARCHAR(20) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- 28. Bảng thời khóa biểu lớp học mở rộng (Class Schedules)
CREATE TABLE IF NOT EXISTS class_schedules (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id     UUID        REFERENCES class_programs(id) ON DELETE CASCADE,
    coach_id       UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    facility_id    UUID        REFERENCES facilities(id) ON DELETE CASCADE,
    room_id        UUID        REFERENCES rooms(id) ON DELETE SET NULL,
    start_time     TIMESTAMPTZ NOT NULL,
    end_time       TIMESTAMPTZ NOT NULL,
    capacity       INT         DEFAULT 30,
    enrolled_count INT         DEFAULT 0,
    status         BOOLEAN     DEFAULT true
);

-- 29. Bảng hội viên đăng ký giữ chỗ lớp học (Class Bookings)
CREATE TABLE IF NOT EXISTS class_bookings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id        UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subscription_id UUID        REFERENCES subscriptions(id) ON DELETE SET NULL,
    status          VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'attended'
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, class_id)
);


-- ==============================================================
-- PHẦN 10: ĐIỂM DANH LỚP, ĐÁNH GIÁ TIẾN ĐỘ & AUDIT LOG
-- ==============================================================

-- 30. Bảng phiên điểm danh lớp học (Class Attendance Sheets)
CREATE TABLE IF NOT EXISTS class_attendance_sheets (
    session_id   UUID        PRIMARY KEY REFERENCES classes(id) ON DELETE CASCADE,
    state        VARCHAR(20) DEFAULT 'unmarked', -- 'unmarked', 'draft', 'finalized'
    version      INT         DEFAULT 1,
    finalized_at TIMESTAMPTZ,
    finalized_by UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 31. Bảng chi tiết trạng thái điểm danh từng học viên (Class Attendance Records)
CREATE TABLE IF NOT EXISTS class_attendance_records (
    session_id UUID        REFERENCES classes(id) ON DELETE CASCADE,
    member_id  UUID        REFERENCES users(id) ON DELETE CASCADE,
    status     VARCHAR(20), -- 'present', 'late', 'absent', 'excused'
    note       TEXT,
    PRIMARY KEY (session_id, member_id)
);

-- 32. Bảng lưu vết thay đổi sau khi chốt điểm danh (Class Attendance Audits)
CREATE TABLE IF NOT EXISTS class_attendance_audits (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        REFERENCES classes(id) ON DELETE CASCADE,
    actor_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(50) NOT NULL, -- 'UPDATE_AFTER_FINALIZED'
    reason      TEXT        NOT NULL,
    changes     JSONB       NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT now()
);

-- 33. Bảng kết quả đánh giá chuyên môn của HLV cho học viên (Coach Assessments)
CREATE TABLE IF NOT EXISTS coach_assessments (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id     UUID        NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    session_id   UUID        REFERENCES classes(id) ON DELETE CASCADE,
    member_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completion   INT         NOT NULL DEFAULT 0 CHECK (completion >= 0 AND completion <= 100),
    metrics_json JSONB       NOT NULL DEFAULT '[]'::jsonb,
    comment      TEXT,
    next_step    TEXT,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- 34. Bảng đo lường bài kiểm tra thể lực thực tế (Training Results)
CREATE TABLE IF NOT EXISTS training_results (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID          REFERENCES classes(id) ON DELETE CASCADE,
    member_id   UUID          REFERENCES users(id) ON DELETE CASCADE,
    coach_id    UUID          REFERENCES coaches(id) ON DELETE SET NULL,
    metric_name TEXT          NOT NULL, -- 'Thời gian plank', 'Deadlift max',...
    value       DECIMAL(10,2) NOT NULL,
    unit        VARCHAR(20),            -- 'giây', 'kg', 'lần'
    effort      INT           CHECK (effort >= 1 AND effort <= 10),
    comment     TEXT,
    visibility  VARCHAR(20)   DEFAULT 'coach_internal',
    recorded_at TIMESTAMPTZ   DEFAULT now()
);


-- ==============================================================
-- PHẦN 11: CHỈ SỐ CƠ THỂ, GIÁO ÁN TẬP LUYỆN & DINH DƯỠNG (AI FLOW 5)
-- ==============================================================

-- 35. Bảng chỉ số cơ thể sinh trắc học InBody (Body Metrics)
CREATE TABLE IF NOT EXISTS body_metrics (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          REFERENCES users(id) ON DELETE CASCADE,
    weight      DECIMAL(5,2),        -- kg
    height      DECIMAL(5,2),        -- cm
    body_fat    DECIMAL(5,2),        -- %
    muscle_mass DECIMAL(5,2),        -- kg
    bmi         DECIMAL(5,2),
    recorded_at TIMESTAMPTZ   DEFAULT now()
);

-- 36. Bảng giáo án tập luyện (Workout Plans — Hỗ trợ AI Gemini Flow 5)
CREATE TABLE IF NOT EXISTS workout_plans (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id                  UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    sport_id                  UUID        REFERENCES sports(id) ON DELETE SET NULL,
    plan_name                 TEXT        NOT NULL,
    description               TEXT,
    goal                      TEXT,
    level                     VARCHAR(50),
    duration_minutes          INT,
    status                    VARCHAR(50) DEFAULT 'draft', -- 'draft', 'assigned', 'archived'
    source                    VARCHAR(50) DEFAULT 'manual', -- 'manual', 'ai_generated'
    version                   INT         DEFAULT 1,
    parent_plan_id            UUID        REFERENCES workout_plans(id) ON DELETE SET NULL,
    recommendation_target_type VARCHAR(50),
    recommendation_target_id   UUID,
    ai_metadata_json          JSONB,
    approved_at               TIMESTAMPTZ,
    approved_by               UUID        REFERENCES users(id) ON DELETE SET NULL,
    approval_note             TEXT,
    archived_at               TIMESTAMPTZ,
    archived_by               UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at                TIMESTAMPTZ DEFAULT now(),
    updated_at                TIMESTAMPTZ DEFAULT now()
);

-- 37. Bảng danh sách bài tập chi tiết trong giáo án (Workout Plan Exercises)
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id        UUID    NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    name           TEXT    NOT NULL,
    sets           INT,
    reps           TEXT,   -- "3 set x 12 reps"
    duration       INT,    -- Thời lượng (giây)
    rest           TEXT,   -- "60s"
    note           TEXT,
    exercise_order INT     DEFAULT 0
);

-- 38. Bảng phân công giáo án cho học viên hoặc lớp (Workout Plan Assignments)
CREATE TABLE IF NOT EXISTS workout_plan_assignments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID        NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- 'class' | 'member'
    target_id   UUID        NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

-- 39. Bảng theo dõi tiến độ nộp bài tập về nhà (Homework Progress)
CREATE TABLE IF NOT EXISTS homework_progress (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID          REFERENCES workout_plans(id) ON DELETE CASCADE,
    notification_id UUID,
    member_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by     UUID          REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20)   DEFAULT 'assigned', -- 'assigned', 'submitted', 'completed', 'overdue'
    progress_pct    DECIMAL(5,2)  DEFAULT 0,
    assigned_date   DATE,
    due_date        DATE,
    completed_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ   DEFAULT now()
);

-- 40. Bảng kế hoạch dinh dưỡng (Diet Plans)
CREATE TABLE IF NOT EXISTS diet_plans (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        REFERENCES users(id) ON DELETE CASCADE,
    coach_id          UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    calories_target   INT,
    meals_description TEXT,
    created_at        TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN 12: BÁN LẺ & POS (RECEPTIONIST & PRODUCT ORDERS)
-- ==============================================================

-- 41. Bảng sản phẩm bán lẻ (Nước tăng lực, Khăn, Thực phẩm bổ sung, Đồ bảo hộ)
CREATE TABLE IF NOT EXISTS products (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT          NOT NULL,
    category       VARCHAR(100),
    price          DECIMAL(18,2) NOT NULL,
    stock_quantity INT           DEFAULT 0,
    image_url      TEXT,
    status         BOOLEAN       DEFAULT true
);

-- 42. Bảng hóa đơn thanh toán (Invoices — Gói tập, Đơn hàng, POS lễ tân)
CREATE TABLE IF NOT EXISTS invoices (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID          REFERENCES users(id) ON DELETE SET NULL,
    created_by         UUID          REFERENCES users(id) ON DELETE SET NULL,
    facility_id        UUID          REFERENCES facilities(id) ON DELETE SET NULL,
    total_amount       DECIMAL(18,2) NOT NULL,
    payment_method     VARCHAR(50),  -- 'qr', 'card', 'wallet', 'counter', 'bank_transfer'
    payment_status     VARCHAR(50)   DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded', 'expired'
    fulfillment_method VARCHAR(50)   DEFAULT 'counter_pickup', -- 'counter_pickup', 'in_center_delivery'
    fulfillment_status VARCHAR(50)   DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'delivered'
    delivery_location  TEXT,
    assigned_to        UUID          REFERENCES users(id) ON DELETE SET NULL,
    fulfilled_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ   DEFAULT now(),
    paid_at            TIMESTAMPTZ
);

-- 43. Bảng chi tiết từng món đồ trong hóa đơn (Invoice Items)
CREATE TABLE IF NOT EXISTS invoice_items (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT           NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL
);

-- 44. Bảng trao đổi tin nhắn giữa khách và lễ tân theo đơn hàng (Order Messages)
CREATE TABLE IF NOT EXISTS product_order_messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID        NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sender_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message    TEXT        NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN 13: WEBSITE, TIN TỨC & HỆ THỐNG THÔNG BÁO
-- ==============================================================

-- 45. Bảng danh mục bài viết / tin tức thể thao
CREATE TABLE IF NOT EXISTS article_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT
);

-- 46. Bảng bài viết blog, cẩm nang sức khỏe & khuyến mãi
CREATE TABLE IF NOT EXISTS articles (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id   UUID        REFERENCES article_categories(id) ON DELETE SET NULL,
    author_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    title         TEXT        NOT NULL,
    thumbnail_url TEXT,
    content       TEXT        NOT NULL,
    status        VARCHAR(50) DEFAULT 'published',
    published_at  TIMESTAMPTZ DEFAULT now()
);

-- 47. Bảng hộp thư liên hệ góp ý từ khách vãng lai
CREATE TABLE IF NOT EXISTS contact_messages (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name  TEXT        NOT NULL,
    sender_email VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20),
    message      TEXT        NOT NULL,
    is_resolved  BOOLEAN     DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- 48. Bảng thông báo toàn hệ thống (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id   UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) DEFAULT 'member', -- 'class' | 'member'
    target_id   UUID,
    type        VARCHAR(50) DEFAULT 'Thông báo',
    state       VARCHAR(20) DEFAULT 'published',
    title       TEXT        NOT NULL,
    message     TEXT,
    deadline    TIMESTAMPTZ,
    is_read     BOOLEAN     DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN PHỤ TRỢ MỞ RỘNG CHO ADMIN (TÀI CHÍNH, LƯƠNG & AUDIT)
-- ==============================================================

-- Bảng kiểm toán hoạt động hệ thống (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID         REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   UUID,
    old_value   TEXT,
    new_value   TEXT,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ  DEFAULT now()
);

-- Bảng ngân sách hoạt động cơ sở (Budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id      UUID          NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    category         VARCHAR(100)  NOT NULL,
    period_start     DATE          NOT NULL,
    period_end       DATE          NOT NULL,
    allocated_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    spent_amount     DECIMAL(18,2) NOT NULL DEFAULT 0,
    status           VARCHAR(50)   DEFAULT 'active',
    created_by       UUID          REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ   DEFAULT now(),
    CHECK (period_end >= period_start)
);

-- Bảng chi phí vận hành (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID          NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    category    VARCHAR(100)  NOT NULL,
    description VARCHAR(500)  NOT NULL,
    amount      DECIMAL(18,2) NOT NULL CHECK (amount >= 0),
    expense_date DATE         NOT NULL,
    status      VARCHAR(50)   DEFAULT 'pending',
    created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID          REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ   DEFAULT now()
);

-- Bảng bảng lương nhân viên (Payroll Records)
CREATE TABLE IF NOT EXISTS payroll_records (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id   UUID          REFERENCES facilities(id) ON DELETE SET NULL,
    payroll_month DATE          NOT NULL,
    base_salary   DECIMAL(18,2) NOT NULL DEFAULT 0,
    bonus         DECIMAL(18,2) NOT NULL DEFAULT 0,
    deduction     DECIMAL(18,2) NOT NULL DEFAULT 0,
    net_salary    DECIMAL(18,2) NOT NULL DEFAULT 0,
    status        VARCHAR(50)   DEFAULT 'draft',
    paid_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ   DEFAULT now(),
    UNIQUE (employee_id, payroll_month)
);


-- ==============================================================
-- INDEXES — TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ==============================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active
    ON subscriptions(user_id, payment_status, end_date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_sport
    ON subscriptions(user_id, sport_id, end_date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_package
    ON subscriptions(package_id);

CREATE INDEX IF NOT EXISTS idx_class_bookings_user
    ON class_bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_class_bookings_class
    ON class_bookings(class_id);

CREATE INDEX IF NOT EXISTS idx_pt_enrollments_user
    ON pt_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_pt_sessions_enrollment
    ON pt_sessions(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_check_in_user
    ON check_in_logs(user_id, check_in_time DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_coach_assessments_coach_created
    ON coach_assessments(coach_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_schedule_requests_coach_created
    ON coach_schedule_requests(coach_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_availability_slots_time
    ON coach_availability_slots(coach_id, start_time, end_time);


-- ==============================================================
-- DỮ LIỆU MẪU KHỞI TẠO (SEED DATA)
-- ==============================================================
INSERT INTO roles (name, description) VALUES
    ('admin', 'Quản trị viên toàn quyền hệ thống'),
    ('manager', 'Quản lý vận hành trung tâm thể thao'),
    ('coach', 'Huấn luyện viên / PT cá nhân'),
    ('receptionist', 'Nhân viên lễ tân / Thu ngân'),
    ('member', 'Hội viên trung tâm')
ON CONFLICT (name) DO NOTHING;
