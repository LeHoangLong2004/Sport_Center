-- ==============================================================
-- SWP391 SPORT CENTER DATABASE SCHEMA (EXACT SUPABASE LIVE)
-- Hệ Quản Trị CSDL: PostgreSQL / Supabase
-- Tổng cộng: 38 BẢNG HOÀN CHỈNH ĐANG CHẠY TRÊN HỆ THỐNG LIVE
-- Ngày trích xuất: 2026-11-09
-- ==============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- Table: roles
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                       VARCHAR(50) NOT NULL,
    description                TEXT
);

-- -------------------------------------------------------------
-- Table: sports
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sports (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                       TEXT NOT NULL,
    description                TEXT,
    image_url                  TEXT,
    status                     BOOLEAN DEFAULT true
);

-- -------------------------------------------------------------
-- Table: facilities
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facilities (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                       TEXT NOT NULL,
    address                    TEXT NOT NULL,
    hotline                    VARCHAR(20),
    status                     BOOLEAN DEFAULT true,
    image_url                  TEXT
);

-- -------------------------------------------------------------
-- Table: products
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                       TEXT NOT NULL,
    category                   VARCHAR(100),
    price                      NUMERIC NOT NULL,
    stock_quantity             INTEGER DEFAULT 0,
    image_url                  TEXT,
    status                     BOOLEAN DEFAULT true
);

-- -------------------------------------------------------------
-- Table: packages
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
    id                         VARCHAR(50) PRIMARY KEY,
    name                       TEXT NOT NULL,
    tagline                    TEXT,
    package_type               VARCHAR(20) NOT NULL DEFAULT 'sport'::character varying,
    monthly_price              NUMERIC,
    yearly_price               NUMERIC,
    description                TEXT,
    status                     BOOLEAN DEFAULT true,
    catalog_json               JSONB
);

-- -------------------------------------------------------------
-- Table: users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id                    UUID,
    full_name                  TEXT NOT NULL,
    phone_number               VARCHAR(20) NOT NULL,
    email                      VARCHAR(100) NOT NULL,
    password_hash              TEXT NOT NULL,
    avatar_url                 TEXT,
    date_of_birth              DATE,
    gender                     VARCHAR(20),
    emergency_contact          TEXT,
    status                     BOOLEAN DEFAULT true,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    member_code                VARCHAR(50),
    training_goal              TEXT,
    training_level             VARCHAR(50),
    address                    TEXT,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- Table: body_metrics
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_metrics (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    weight                     NUMERIC,
    height                     NUMERIC,
    body_fat                   NUMERIC,
    muscle_mass                NUMERIC,
    bmi                        NUMERIC,
    recorded_at                TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: member_wallet_balances
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_wallet_balances (
    user_id                    UUID PRIMARY KEY,
    balance                    NUMERIC NOT NULL DEFAULT 0.00,
    last_updated_at            TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: wallet_transactions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID NOT NULL,
    type                       VARCHAR(20) NOT NULL,
    amount                     NUMERIC NOT NULL,
    balance_after              NUMERIC NOT NULL DEFAULT 0.00,
    method                     VARCHAR(50) DEFAULT 'VietQR'::character varying,
    status                     VARCHAR(20) NOT NULL DEFAULT 'completed'::character varying,
    reference_code             VARCHAR(100),
    note                       TEXT,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: package_features
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_features (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id                 VARCHAR(50),
    feature_text               TEXT NOT NULL,
    is_highlighted             BOOLEAN DEFAULT false,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: package_sports
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_sports (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id                 VARCHAR(50) NOT NULL,
    sport_id                   UUID NOT NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: membership_benefits
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_benefits (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id                 VARCHAR(50),
    benefit_type               VARCHAR(50) NOT NULL,
    benefit_value              TEXT,
    description                TEXT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: coaches
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coaches (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    specialty                  TEXT,
    bio                        TEXT,
    experience_years           INTEGER,
    rating                     NUMERIC DEFAULT 0.00,
    status                     BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: coach_profiles
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_profiles (
    user_id                    UUID PRIMARY KEY,
    specialties                TEXT,
    certifications             TEXT,
    experience_years           INTEGER,
    bio                        TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: coach_sports
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_sports (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id                   UUID NOT NULL,
    sport_id                   UUID NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: coach_availability_slots
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_availability_slots (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id                   UUID NOT NULL,
    start_time                 TIMESTAMPTZ NOT NULL,
    end_time                   TIMESTAMPTZ NOT NULL,
    sport                      TEXT NOT NULL,
    room                       TEXT NOT NULL,
    note                       TEXT,
    status                     VARCHAR(20) NOT NULL DEFAULT 'open'::character varying,
    booked_member_id           UUID,
    booked_member_name         TEXT,
    booked_member_phone        VARCHAR(30),
    goal                       TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: invoices
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    created_by                 UUID,
    total_amount               NUMERIC NOT NULL,
    payment_method             VARCHAR(50),
    created_at                 TIMESTAMPTZ DEFAULT now(),
    payment_status             VARCHAR(50) DEFAULT 'pending'::character varying,
    facility_id                UUID,
    paid_at                    TIMESTAMPTZ,
    fulfillment_method         VARCHAR(50) NOT NULL DEFAULT 'counter_pickup'::character varying,
    fulfillment_status         VARCHAR(50) NOT NULL DEFAULT 'pending'::character varying,
    delivery_location          TEXT,
    assigned_to                UUID,
    fulfilled_at               TIMESTAMPTZ,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- Table: invoice_items
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_items (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id                 UUID,
    product_id                 UUID,
    quantity                   INTEGER NOT NULL,
    unit_price                 NUMERIC NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: product_order_messages
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_order_messages (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id                 UUID NOT NULL,
    sender_id                  UUID NOT NULL,
    message                    TEXT NOT NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: subscriptions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    package_id                 VARCHAR(50),
    sport_id                   UUID,
    facility_id                UUID,
    billing_period             VARCHAR(20),
    total_amount               NUMERIC NOT NULL,
    payment_method             VARCHAR(50),
    payment_status             VARCHAR(50) DEFAULT 'pending'::character varying,
    start_date                 DATE NOT NULL,
    end_date                   DATE NOT NULL,
    auto_renew                 BOOLEAN DEFAULT false,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    duration_months            INTEGER,
    discount_pct               NUMERIC NOT NULL DEFAULT 0,
    discount_amount            NUMERIC NOT NULL DEFAULT 0,
    package_snapshot_json      JSONB,
    paid_at                    TIMESTAMPTZ,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: subscription_sports
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_sports (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id            UUID NOT NULL,
    sport_id                   UUID NOT NULL,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: check_in_logs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS check_in_logs (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    facility_id                UUID,
    subscription_id            UUID,
    check_in_time              TIMESTAMPTZ DEFAULT now(),
    check_out_time             TIMESTAMPTZ,
    method                     VARCHAR(50) DEFAULT 'qr'::character varying,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: gate_checkins
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gate_checkins (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id                  UUID NOT NULL,
    branch_id                  UUID,
    member_package_id          UUID,
    check_in_time              TIMESTAMPTZ NOT NULL DEFAULT now(),
    receptionist_id            UUID
);

-- -------------------------------------------------------------
-- Table: classes
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id                   UUID,
    coach_id                   UUID,
    facility_id                UUID,
    class_name                 TEXT NOT NULL,
    schedule_time              TIMESTAMPTZ NOT NULL,
    duration_minutes           INTEGER DEFAULT 60,
    capacity                   INTEGER NOT NULL,
    current_enrolled           INTEGER DEFAULT 0,
    status                     BOOLEAN DEFAULT true,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    level                      VARCHAR(50),
    room                       VARCHAR(100),
    approval_status            VARCHAR(20) NOT NULL DEFAULT 'approved'::character varying,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: class_bookings
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_bookings (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    class_id                   UUID,
    subscription_id            UUID,
    status                     VARCHAR(50) DEFAULT 'pending'::character varying,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: class_attendance_sheets
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_attendance_sheets (
    session_id                 UUID PRIMARY KEY,
    state                      VARCHAR(50) DEFAULT 'unmarked'::character varying,
    version                    INTEGER DEFAULT 1,
    finalized_by               UUID,
    finalized_at               TIMESTAMPTZ,
    updated_at                 TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (finalized_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: class_attendance_records
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_attendance_records (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id                 UUID NOT NULL,
    member_id                  UUID NOT NULL,
    status                     VARCHAR(50),
    note                       TEXT,
    updated_at                 TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: coach_assessments
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_assessments (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id                   UUID NOT NULL,
    session_id                 UUID,
    member_id                  UUID NOT NULL,
    completion                 INTEGER NOT NULL DEFAULT 0,
    metrics_json               JSONB NOT NULL DEFAULT '[]'::jsonb,
    comment                    TEXT,
    next_step                  TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: coach_schedule_requests
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_schedule_requests (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id                   UUID NOT NULL,
    session_id                 UUID,
    request_type               VARCHAR(30) NOT NULL,
    substitute_coach_id        UUID,
    new_date                   DATE,
    new_time                   VARCHAR(50),
    reason                     TEXT NOT NULL,
    status                     VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
    manager_note               TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    class_name                 VARCHAR(255),
    session_time               VARCHAR(100),
    sport_name                 VARCHAR(100),
    room_name                  VARCHAR(100),
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (substitute_coach_id) REFERENCES coaches(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- Table: appointments
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time                       VARCHAR(10) NOT NULL,
    title                      TEXT NOT NULL,
    customer_name              TEXT NOT NULL,
    coach_name                 TEXT,
    status                     VARCHAR(50) DEFAULT 'Đang chờ khách'::character varying,
    date                       VARCHAR(20)
);

-- -------------------------------------------------------------
-- Table: workout_plans
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_plans (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    coach_id                   UUID,
    plan_name                  TEXT NOT NULL,
    description                TEXT,
    start_date                 DATE,
    end_date                   DATE,
    sport_id                   UUID,
    goal                       TEXT,
    level                      VARCHAR(50),
    duration_minutes           INTEGER,
    status                     VARCHAR(50) DEFAULT 'draft'::character varying,
    updated_at                 TIMESTAMPTZ DEFAULT now(),
    version                    INTEGER DEFAULT 1,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    source                     TEXT NOT NULL DEFAULT 'manual'::text,
    parent_plan_id             UUID,
    recommendation_target_type TEXT,
    recommendation_target_id   UUID,
    ai_metadata_json           TEXT,
    approved_at                TIMESTAMPTZ,
    approved_by                UUID,
    approval_note              TEXT,
    archived_at                TIMESTAMPTZ,
    archived_by                UUID,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: workout_plan_exercises
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                    UUID,
    name                       TEXT NOT NULL,
    reps                       TEXT,
    rest                       TEXT,
    note                       TEXT,
    sets                       TEXT,
    duration                   TEXT,
    exercise_order             INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: communications
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communications (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    title                      TEXT NOT NULL,
    message                    TEXT,
    is_read                    BOOLEAN DEFAULT false,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    type                       VARCHAR(50) DEFAULT 'Thông báo'::character varying,
    target_type                VARCHAR(20) DEFAULT 'member'::character varying,
    target_id                  UUID,
    deadline                   TIMESTAMPTZ,
    coach_id                   UUID,
    state                      VARCHAR(50) DEFAULT 'draft'::character varying,
    published_at               TIMESTAMPTZ,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: homework_progress
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS homework_progress (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    communication_id           UUID,
    member_id                  UUID NOT NULL,
    status                     VARCHAR(50) DEFAULT 'assigned'::character varying,
    completed_at               TIMESTAMPTZ,
    plan_id                    UUID,
    assigned_by                UUID,
    progress_pct               NUMERIC DEFAULT 0,
    assigned_date              TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date                   TIMESTAMPTZ,
    notes                      TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (communication_id) REFERENCES communications(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: notifications
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id                  UUID,
    user_id                    UUID,
    target_type                VARCHAR(20) DEFAULT 'member'::character varying,
    target_id                  UUID,
    type                       VARCHAR(50) DEFAULT 'Thông báo'::character varying,
    state                      VARCHAR(20) DEFAULT 'published'::character varying,
    title                      TEXT NOT NULL,
    message                    TEXT,
    deadline                   TIMESTAMPTZ,
    is_read                    BOOLEAN DEFAULT false,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (sender_id) REFERENCES coaches(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: reviews
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID,
    coach_id                   UUID,
    rating                     INTEGER,
    comment                    TEXT,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    session_id                 TEXT,
    session_name               TEXT,
    tags_json                  TEXT,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: chat_conversations
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_conversations (
    id                         VARCHAR(100) PRIMARY KEY,
    type                       VARCHAR(50) NOT NULL DEFAULT 'direct'::character varying,
    coach_title                VARCHAR(255),
    coach_subtitle             VARCHAR(255),
    member_title               VARCHAR(255),
    member_subtitle            VARCHAR(255),
    avatar                     TEXT,
    coach_avatar               TEXT,
    last_message               TEXT,
    last_time                  VARCHAR(50),
    unread_count               INTEGER DEFAULT 0,
    online                     BOOLEAN DEFAULT true,
    coach_id                   VARCHAR(100),
    coach_name                 VARCHAR(255),
    member_id                  VARCHAR(100),
    member_name                VARCHAR(255),
    updated_at                 TIMESTAMPTZ DEFAULT now(),
    category                   VARCHAR(50) NOT NULL DEFAULT 'coach'::character varying,
    role_tag                   VARCHAR(50) NOT NULL DEFAULT 'HLV'::character varying,
    badge_color                VARCHAR(50) NOT NULL DEFAULT 'orange'::character varying
);

-- -------------------------------------------------------------
-- Table: chat_messages
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id                         VARCHAR(100) PRIMARY KEY,
    conversation_id            VARCHAR(100),
    sender                     VARCHAR(50) NOT NULL,
    sender_name                VARCHAR(255),
    text                       TEXT NOT NULL,
    timestamp                  VARCHAR(50) NOT NULL,
    created_at                 TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);
