-- ==============================================================
-- ĐỒ ÁN SWP391 — SPORT CENTER DATABASE SCHEMA
-- MÔ HÌNH 3: GÓI MÔN ĐỘC LẬP + THÀNH VIÊN NÂNG CẤP TÙY CHỌN
-- Database: PostgreSQL / Supabase
-- Tổng số bảng: 29
-- ==============================================================
--
-- LUỒNG NGHIỆP VỤ CHÍNH:
--   1. User đăng ký tài khoản → chọn bộ môn muốn tập
--   2. User mua gói môn độc lập (swim, yoga, boxing…)
--      → tạo subscription với package_type = 'sport'
--   3. User tùy chọn mua thêm gói nâng cấp (Plus / VIP)
--      → tạo subscription với package_type = 'membership'
--      → được hưởng membership_benefits (giảm giá PT, ưu tiên đặt lớp…)
--   4. Khi book lớp học / check-in → hệ thống validate
--      subscription còn hạn và đúng bộ môn
-- ==============================================================


-- ==============================================================
-- PHẦN 1: PHÂN QUYỀN & TÀI KHOẢN
-- ==============================================================

CREATE TABLE roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    -- Các giá trị: 'admin' | 'manager' | 'coach' | 'receptionist' | 'member'
    description TEXT
);

CREATE TABLE users (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id           UUID         REFERENCES roles(id) ON DELETE SET NULL,
    member_code       VARCHAR(50)  UNIQUE, -- Mã hội viên (Coach Portal)
    full_name         TEXT         NOT NULL,
    phone_number      VARCHAR(20)  UNIQUE NOT NULL,
    email             VARCHAR(100) UNIQUE NOT NULL,
    password_hash     TEXT         NOT NULL,
    avatar_url        TEXT,
    date_of_birth     DATE,
    gender            VARCHAR(20),
    emergency_contact TEXT,
    training_goal     TEXT,                -- Mục tiêu tập luyện (Coach Portal)
    training_level    VARCHAR(50),         -- Trình độ tập luyện (Coach Portal)
    status            BOOLEAN      DEFAULT true,
    created_at        TIMESTAMPTZ  DEFAULT now()
);


-- ==============================================================
-- PHẦN 2: CƠ SỞ VẬT CHẤT (CHI NHÁNH)
-- ==============================================================

CREATE TABLE facilities (
    id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name    TEXT        NOT NULL,
    address TEXT        NOT NULL,
    hotline VARCHAR(20),
    status  BOOLEAN     DEFAULT true
);


-- ==============================================================
-- PHẦN 3: BỘ MÔN
-- ==============================================================

CREATE TABLE sports (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT    NOT NULL,   -- Vd: 'Bơi lội', 'Yoga', 'Boxing', 'Fitness'
    description TEXT,
    image_url   TEXT,
    status      BOOLEAN DEFAULT true
);


-- ==============================================================
-- PHẦN 4: GÓI TẬP — TRUNG TÂM CỦA MÔ HÌNH 3
-- ==============================================================

CREATE TABLE packages (
    id            VARCHAR(50)   PRIMARY KEY, -- Vd: 'swim', 'yoga', 'boxing', 'plus', 'vip'
    name          TEXT          NOT NULL,    -- Vd: 'Gói Bơi Lội', 'Thành viên Plus'
    tagline       TEXT,                      -- Slogan ngắn hiển thị UI
    package_type  VARCHAR(20)   NOT NULL DEFAULT 'sport',
    -- package_type:
    --   'sport'      → Gói môn độc lập (user mua để tập 1 môn cụ thể)
    --   'membership' → Gói nâng cấp tùy chọn (Plus/VIP, mang lại ưu đãi thêm)
    monthly_price DECIMAL(18,2),
    yearly_price  DECIMAL(18,2),
    description   TEXT,
    status        BOOLEAN       DEFAULT true
);

-- Các tính năng bullet-point của từng gói (hiển thị trang pricing)
CREATE TABLE package_features (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id     VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    feature_text   TEXT        NOT NULL,
    is_highlighted BOOLEAN     DEFAULT false -- Đánh dấu tính năng nổi bật (icon khác màu)
);

-- Ánh xạ nhiều-nhiều: Gói 'sport' cho phép truy cập bộ môn nào
-- Vd: package 'swim'  → sport 'Bơi lội'
-- Vd: package 'combo' → sport 'Yoga' + sport 'Fitness'
-- Gói 'membership' (Plus/VIP) KHÔNG cần dòng ở đây;
-- ưu đãi được quản lý riêng qua membership_benefits
CREATE TABLE package_sports (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id VARCHAR(50) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    sport_id   UUID        NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE (package_id, sport_id)
);

-- Ưu đãi cụ thể của gói Membership (Plus / VIP)
-- Mỗi dòng = 1 ưu đãi; backend đọc benefit_type để áp dụng logic tương ứng
CREATE TABLE membership_benefits (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id    VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    benefit_type  VARCHAR(50) NOT NULL,
    -- benefit_type:
    --   'pt_discount'       → Giảm % phí PT
    --   'priority_booking'  → Ưu tiên đặt lớp trước N giờ
    --   'free_locker'       → Tủ đồ miễn phí
    --   'guest_pass'        → Mang khách vào N lần/tháng
    --   'sport_discount'    → Giảm % khi mua thêm gói môn
    benefit_value TEXT,       -- Giá trị cụ thể: '20', '2', '1'... (backend parse)
    description   TEXT NOT NULL -- Mô tả đầy đủ để hiển thị UI
);


-- ==============================================================
-- PHẦN 5: VOUCHER & ĐĂNG KÝ GÓI (SUBSCRIPTION)
-- ==============================================================

CREATE TABLE vouchers (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    max_discount     DECIMAL(18,2),
    valid_from       TIMESTAMPTZ,
    valid_to         TIMESTAMPTZ,
    usage_limit      INT,
    used_count       INT         DEFAULT 0,
    status           BOOLEAN     DEFAULT true
);

-- Mỗi lần user mua 1 gói = 1 dòng subscription
-- User CÓ THỂ có nhiều subscription song song (đặc trưng của mô hình 3):
--   Vd: subscription 1 → package 'swim'  (sport_id = <id bơi lội>)
--       subscription 2 → package 'yoga'  (sport_id = <id yoga>)
--       subscription 3 → package 'vip'   (sport_id = NULL — gói membership)
CREATE TABLE subscriptions (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        REFERENCES users(id) ON DELETE CASCADE,
    package_id     VARCHAR(50) REFERENCES packages(id),
    sport_id       UUID        REFERENCES sports(id) ON DELETE SET NULL,
    -- sport_id = UUID cụ thể → gói môn (package_type = 'sport')
    -- sport_id = NULL         → gói nâng cấp (package_type = 'membership')
    facility_id    UUID        REFERENCES facilities(id),
    voucher_id     UUID        REFERENCES vouchers(id),

    billing_period VARCHAR(20),           -- 'monthly' | 'yearly'
    total_amount   DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50),           -- 'qr' | 'card' | 'wallet' | 'counter'
    payment_status VARCHAR(50)  DEFAULT 'pending',
    -- payment_status: 'pending' | 'completed' | 'failed' | 'refunded'

    start_date     DATE        NOT NULL,
    end_date       DATE        NOT NULL,
    auto_renew     BOOLEAN     DEFAULT false,
    created_at     TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN 6: THÔNG BÁO & ĐIỂM DANH
-- ==============================================================

CREATE TABLE notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id   UUID        REFERENCES coaches(id) ON DELETE SET NULL, -- Người gửi (Coach)
    user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) DEFAULT 'member',    -- 'class' | 'member' (Coach Portal)
    target_id   UUID,                            -- Chứa class_id hoặc user_id (Coach Portal)
    type        VARCHAR(50) DEFAULT 'Thông báo', -- 'Thông báo' | 'Bài tập về nhà' (Coach Portal)
    state       VARCHAR(20) DEFAULT 'published', -- 'draft' | 'published' (Coach Portal)
    title       TEXT        NOT NULL,
    message     TEXT,
    deadline    TIMESTAMPTZ,                     -- Hạn nộp bài (Coach Portal)
    is_read     BOOLEAN     DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE check_in_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
    facility_id     UUID        REFERENCES facilities(id) ON DELETE CASCADE,
    subscription_id UUID        REFERENCES subscriptions(id) ON DELETE SET NULL,
    -- subscription_id: Subscription nào cho phép check-in lần này (audit)
    check_in_time   TIMESTAMPTZ DEFAULT now(),
    check_out_time  TIMESTAMPTZ,
    method          VARCHAR(50) DEFAULT 'qr'
    -- method: 'qr' | 'manual' | 'card'
);


-- ==============================================================
-- PHẦN 7: HUẤN LUYỆN VIÊN (COACH)
-- ==============================================================

CREATE TABLE coaches (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty        TEXT,
    bio              TEXT,
    experience_years INT,
    rating           DECIMAL(3,2) DEFAULT 0.00,
    status           BOOLEAN      DEFAULT true
);

-- HLV có thể dạy nhiều bộ môn (nhiều-nhiều)
CREATE TABLE coach_sports (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE (coach_id, sport_id)
);


-- ==============================================================
-- PHẦN 8: PERSONAL TRAINING (PT)
-- ==============================================================

-- Các gói PT bán sẵn (theo số buổi)
CREATE TABLE pt_packages (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,       -- Vd: 'Gói 5 buổi', 'Gói 10 buổi'
    session_count INT         NOT NULL,
    price         DECIMAL(18,2) NOT NULL,
    validity_days INT         NOT NULL,       -- Thời hạn sử dụng (ngày)
    status        BOOLEAN     DEFAULT true
);

-- User mua gói PT → tạo pt_enrollment (1 lần mua = 1 enrollment)
-- Nếu user có gói VIP → discount_amount được áp dụng từ membership_benefits
CREATE TABLE pt_enrollments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
    coach_id        UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    pt_package_id   UUID        REFERENCES pt_packages(id),
    voucher_id      UUID        REFERENCES vouchers(id),

    total_sessions  INT         NOT NULL,
    used_sessions   INT         DEFAULT 0,
    payment_method  VARCHAR(50),
    payment_status  VARCHAR(50) DEFAULT 'pending',
    total_amount    DECIMAL(18,2) NOT NULL,
    discount_amount DECIMAL(18,2) DEFAULT 0,  -- Giảm giá từ gói membership

    start_date      DATE        NOT NULL,
    end_date        DATE        NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Từng buổi PT cụ thể được lên lịch từ enrollment
CREATE TABLE pt_sessions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id    UUID        REFERENCES pt_enrollments(id) ON DELETE CASCADE,
    schedule_time    TIMESTAMPTZ NOT NULL,
    duration_minutes INT         DEFAULT 60,
    status           VARCHAR(50) DEFAULT 'scheduled',
    -- status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- Đánh giá HLV sau buổi PT (1 user chỉ review 1 lần / HLV)
CREATE TABLE reviews (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id   UUID REFERENCES coaches(id) ON DELETE CASCADE,
    rating     INT  CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, coach_id)
);


-- ==============================================================
-- PHẦN 9: LỚP HỌC GROUP-X
-- ==============================================================

CREATE TABLE classes (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id         UUID        REFERENCES sports(id) ON DELETE CASCADE,
    coach_id         UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    facility_id      UUID        REFERENCES facilities(id) ON DELETE CASCADE,
    class_name       TEXT        NOT NULL,
    level            VARCHAR(50),                 -- Trình độ lớp (Coach Portal)
    room             VARCHAR(100),                -- Phòng tập (Coach Portal)
    schedule_time    TIMESTAMPTZ NOT NULL,
    duration_minutes INT         DEFAULT 60,
    capacity         INT         NOT NULL,
    current_enrolled INT         DEFAULT 0,
    status           BOOLEAN     DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- User đặt lớp Group-X
-- ĐIỀU KIỆN ĐẶT LỚP (validate ở backend):
--   Có subscription còn hạn (end_date >= NOW, payment_status = 'completed')
--   VÀ subscription.sport_id = class.sport_id
--   HOẶC user có subscription gói 'membership' cho phép all-sports
CREATE TABLE class_bookings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
    class_id        UUID        REFERENCES classes(id) ON DELETE CASCADE,
    subscription_id UUID        REFERENCES subscriptions(id) ON DELETE SET NULL,
    -- subscription_id: Subscription nào cấp quyền cho booking này (audit trail)
    status          VARCHAR(50) DEFAULT 'confirmed',
    -- status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, class_id)
);


-- ==============================================================
-- PHẦN 10: THEO DÕI SỨC KHOẺ HỘI VIÊN
-- ==============================================================

CREATE TABLE body_metrics (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
    weight      DECIMAL(5,2),        -- kg
    height      DECIMAL(5,2),        -- cm
    body_fat    DECIMAL(5,2),        -- %
    muscle_mass DECIMAL(5,2),        -- kg
    bmi         DECIMAL(5,2),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_plans (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id         UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    sport_id         UUID        REFERENCES sports(id) ON DELETE SET NULL,
    plan_name        TEXT        NOT NULL,
    description      TEXT,
    goal             TEXT,                -- Mục tiêu giáo án (Coach Portal)
    level            VARCHAR(50),         -- Trình độ (Coach Portal)
    duration_minutes INT,                 -- Thời lượng phút (Coach Portal)
    status           VARCHAR(50) DEFAULT 'Nháp', -- Nháp | Đã giao | Lưu trữ
    version          INT         DEFAULT 1,      -- Version lưu vết (Coach Portal)
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Chi tiết các bài tập trong giáo án (Coach Portal)
CREATE TABLE workout_plan_exercises (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id    UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    reps       TEXT, -- VD: "3 set x 12 reps"
    rest       TEXT, -- VD: "60s"
    note       TEXT
);

-- Phân công giáo án cho lớp hoặc hội viên (Coach Portal)
CREATE TABLE workout_plan_assignments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID        REFERENCES workout_plans(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- 'class' | 'member'
    target_id   UUID        NOT NULL, -- class_id hoặc user_id
    assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE diet_plans (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        REFERENCES users(id) ON DELETE CASCADE,
    coach_id          UUID        REFERENCES coaches(id) ON DELETE SET NULL,
    calories_target   INT,
    meals_description TEXT,
    created_at        TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN 11: BÁN LẺ & POS (RECEPTIONIST)
-- ==============================================================

CREATE TABLE products (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT        NOT NULL,
    category       VARCHAR(100),
    price          DECIMAL(18,2) NOT NULL,
    stock_quantity INT         DEFAULT 0,
    image_url      TEXT,
    status         BOOLEAN     DEFAULT true
);

CREATE TABLE invoices (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
    facility_id    UUID        REFERENCES facilities(id) ON DELETE SET NULL, -- Chi nhánh thu tiền
    total_amount   DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50),
    -- payment_method: 'qr' | 'card' | 'wallet' | 'counter' | 'bank_transfer'
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'expired'
    created_at     TIMESTAMPTZ DEFAULT now(),
    paid_at        TIMESTAMPTZ -- Thời điểm xác nhận thanh toán thành công
);

CREATE TABLE invoice_items (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID        REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID        REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT         NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL
);


-- ==============================================================
-- PHẦN 12: WEBSITE — TIN TỨC & LIÊN HỆ
-- ==============================================================

CREATE TABLE article_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT
);

CREATE TABLE articles (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id   UUID        REFERENCES article_categories(id) ON DELETE SET NULL,
    author_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    title         TEXT        NOT NULL,
    thumbnail_url TEXT,
    content       TEXT        NOT NULL,
    status        VARCHAR(50) DEFAULT 'published',
    -- status: 'draft' | 'published'
    published_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contact_messages (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name  TEXT        NOT NULL,
    sender_email VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20),
    message      TEXT        NOT NULL,
    is_resolved  BOOLEAN     DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================
-- PHẦN BỔ SUNG CHO COACH PORTAL (ĐIỂM DANH, KẾT QUẢ, BÀI TẬP VỀ NHÀ)
-- ==============================================================

-- Bảng lưu trạng thái của 1 phiên điểm danh (Nháp / Đã chốt)
CREATE TABLE class_attendance_sheets (
    session_id   UUID PRIMARY KEY REFERENCES classes(id) ON DELETE CASCADE,
    state        VARCHAR(20) DEFAULT 'unmarked', -- 'unmarked', 'draft', 'finalized'
    version      INT DEFAULT 1,
    finalized_at TIMESTAMPTZ,
    finalized_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Bảng chi tiết trạng thái từng học viên trong 1 buổi học
CREATE TABLE class_attendance_records (
    session_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    member_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    status     VARCHAR(20), -- 'present', 'late', 'absent', 'excused', null
    note       TEXT,
    PRIMARY KEY (session_id, member_id)
);

-- Bảng lưu lịch sử chỉnh sửa điểm danh sau khi đã chốt (Audit log)
CREATE TABLE class_attendance_audits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID REFERENCES classes(id) ON DELETE CASCADE,
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(50) NOT NULL, -- Vd: 'UPDATE_AFTER_FINALIZED'
    reason      TEXT NOT NULL,        -- Lý do sửa bắt buộc
    changes     JSONB NOT NULL,       -- Lưu vết thay đổi: { member_id, old_status, new_status }
    occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng lưu kết quả tập luyện thực tế của học viên trong 1 buổi
CREATE TABLE training_results (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID REFERENCES classes(id) ON DELETE CASCADE,
    member_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id    UUID REFERENCES coaches(id) ON DELETE SET NULL,
    metric_name TEXT NOT NULL,       -- Vd: 'Thời gian giữ thăng bằng'
    value       DECIMAL(10,2) NOT NULL,
    unit        VARCHAR(20),         -- Vd: 'giây', 'lần'
    effort      INT CHECK (effort >= 1 AND effort <= 10), -- Mức gắng sức
    comment     TEXT,
    visibility  VARCHAR(20) DEFAULT 'coach_internal', -- 'member' hoặc 'coach_internal'
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng theo dõi tiến độ hoàn thành bài tập về nhà
CREATE TABLE homework_progress (
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    member_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed'
    completed_at    TIMESTAMPTZ,
    PRIMARY KEY (notification_id, member_id)
);

-- ==============================================================
-- INDEXES — TỐI ƯU HIỆU NĂNG
-- ==============================================================

-- Subscriptions: truy vấn nhanh các gói còn hạn của user
CREATE INDEX idx_subscriptions_user_active
    ON subscriptions(user_id, payment_status, end_date);

-- Subscriptions: tìm theo bộ môn (kiểm tra quyền booking)
CREATE INDEX idx_subscriptions_sport
    ON subscriptions(user_id, sport_id, end_date);

-- Subscriptions: tìm theo loại gói
CREATE INDEX idx_subscriptions_package
    ON subscriptions(package_id);

-- Class bookings: danh sách booking của user
CREATE INDEX idx_class_bookings_user
    ON class_bookings(user_id);

-- Class bookings: danh sách user đặt 1 lớp cụ thể
CREATE INDEX idx_class_bookings_class
    ON class_bookings(class_id);

-- PT enrollments: theo user
CREATE INDEX idx_pt_enrollments_user
    ON pt_enrollments(user_id);

-- PT sessions: theo enrollment
CREATE INDEX idx_pt_sessions_enrollment
    ON pt_sessions(enrollment_id);

-- Check-in logs: lịch sử check-in của user
CREATE INDEX idx_check_in_user
    ON check_in_logs(user_id, check_in_time DESC);

-- Notifications: thông báo chưa đọc
CREATE INDEX idx_notifications_unread
    ON notifications(user_id, is_read);


-- ==============================================================
-- BẢNG TỔNG KẾT (29 BẢNG)
-- ==============================================================
-- PHẦN 1  — Tài khoản  : roles, users
-- ...
-- ==============================================================

-- ==============================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ==============================================================
INSERT INTO roles (name, description) VALUES
    ('manager', 'Quản lý trung tâm'),
    ('coach', 'Huấn luyện viên / PT'),
    ('receptionist', 'Lễ tân / Thu ngân'),
    ('member', 'Hội viên')
ON CONFLICT (name) DO NOTHING;
