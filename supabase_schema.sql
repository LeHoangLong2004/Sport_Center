-- ==========================================================
-- ĐỒ ÁN SWP391 - SPORT CENTER DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- 25 BẢNG (TABLES)
-- ==========================================================

-- Lưu ý: Supabase khuyến nghị dùng UUID cho Khóa chính (Primary Key).
-- Nếu bạn dùng Supabase Auth, cột id trong bảng users có thể thiết lập
-- REFERENCES auth.users(id) thay vì tự tạo UUID mới.

-- ==========================================================
-- PHẦN 1: HỆ THỐNG PHÂN QUYỀN VÀ TÀI KHOẢN
-- ==========================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Nếu dùng Supabase Auth thì không cần cột này
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    emergency_contact TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- PHẦN 2: QUẢN LÝ CƠ SỞ VẬT CHẤT & ĐIỂM DANH
-- ==========================================================
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, 
    address TEXT NOT NULL,
    hotline VARCHAR(20),
    status BOOLEAN DEFAULT true
);

CREATE TABLE check_in_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ DEFAULT now(),
    status VARCHAR(50)
);

-- ==========================================================
-- PHẦN 3: GÓI TẬP & THANH TOÁN (PAYMENT FLOW)
-- ==========================================================
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY, -- 'swim', 'fitness', 'premium'
    name TEXT NOT NULL,
    tagline TEXT,
    monthly_price DECIMAL(18,2) NOT NULL,
    yearly_price DECIMAL(18,2) NOT NULL,
    status BOOLEAN DEFAULT true
);

CREATE TABLE package_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL,
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL -- Tính năng gắn với bộ môn cụ thể (tuỳ chọn)
);

CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    max_discount DECIMAL(18,2),
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    usage_limit INT,
    used_count INT DEFAULT 0,
    status BOOLEAN DEFAULT true
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id VARCHAR(50) REFERENCES packages(id),
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL, -- Bộ môn hội viên đăng ký (tuỳ chọn)
    facility_id UUID REFERENCES facilities(id),
    voucher_id UUID REFERENCES vouchers(id),
    
    billing_period VARCHAR(20), -- 'monthly', 'yearly'
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50), 
    payment_status VARCHAR(50) DEFAULT 'pending', 
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- PHẦN 4: HUẤN LUYỆN VIÊN & LỊCH TẬP PT (COACH PORTAL)
-- ==========================================================
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty TEXT,
    bio TEXT,
    experience_years INT,
    rating DECIMAL(3,2) DEFAULT 0.00
);

CREATE TABLE pt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    schedule_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- PHẦN 5: BỘ MÔN & LỚP HỌC GROUP-X
-- ==========================================================
CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status BOOLEAN DEFAULT true
);

-- Bảng trung gian: Package được phép truy cập bộ môn nào (nhiều-nhiều)
CREATE TABLE package_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id VARCHAR(50) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE (package_id, sport_id) -- Mỗi cặp package-sport chỉ tồn tại 1 lần
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    
    class_name TEXT NOT NULL,
    schedule_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    capacity INT NOT NULL,
    current_enrolled INT DEFAULT 0,
    status BOOLEAN DEFAULT true
);

CREATE TABLE class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, class_id)
);

-- ==========================================================
-- PHẦN 6: THEO DÕI SỨC KHOẺ HỘI VIÊN (MEMBER PORTAL)
-- ==========================================================
CREATE TABLE body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    body_fat DECIMAL(5,2),
    muscle_mass DECIMAL(5,2),
    bmi DECIMAL(5,2),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE
);

CREATE TABLE diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    calories_target INT,
    meals_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- PHẦN 7: BÁN LẺ & POS (RECEPTIONIST PORTAL)
-- ==========================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category VARCHAR(100),
    price DECIMAL(18,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url TEXT,
    status BOOLEAN DEFAULT true
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL
);

-- ==========================================================
-- PHẦN 8: WEBSITE TIN TỨC & LIÊN HỆ
-- ==========================================================
CREATE TABLE article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    sender_email VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
