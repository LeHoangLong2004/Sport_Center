-- ==========================================================
-- ĐỒ ÁN SWP391 - SPORT CENTER DATABASE SCHEMA (25 BẢNG)
-- HỆ QUẢN TRỊ: SQL SERVER (T-SQL)
-- ==========================================================

-- ==========================================================
-- PHẦN 1: HỆ THỐNG PHÂN QUYỀN VÀ TÀI KHOẢN
-- ==========================================================
CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Admin, Receptionist, Coach, Member
    description VARCHAR(255)
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES Roles(id),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10),
    emergency_contact VARCHAR(255),
    status BOOLEAN DEFAULT TRUE, -- 1: Active, 0: Banned/Inactive
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 2: QUẢN LÝ CƠ SỞ VẬT CHẤT & ĐIỂM DANH
-- ==========================================================
CREATE TABLE Facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    address VARCHAR(255) NOT NULL,
    hotline VARCHAR(20),
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE CheckIn_Logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    facility_id INT REFERENCES Facilities(id),
    check_in_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) -- 'Success', 'Failed'
);

-- ==========================================================
-- PHẦN 3: GÓI TẬP & THANH TOÁN (PAYMENT FLOW)
-- ==========================================================
CREATE TABLE Packages (
    id VARCHAR(50) PRIMARY KEY, -- 'swim', 'fitness', 'premium'
    name VARCHAR(100) NOT NULL,
    tagline VARCHAR(255),
    monthly_price DECIMAL(18,2) NOT NULL,
    yearly_price DECIMAL(18,2) NOT NULL,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE Package_Features (
    id SERIAL PRIMARY KEY,
    package_id VARCHAR(50) REFERENCES Packages(id),
    feature_text VARCHAR(255) NOT NULL
);

CREATE TABLE Vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    max_discount DECIMAL(18,2),
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    usage_limit INT,
    used_count INT DEFAULT 0,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    package_id VARCHAR(50) REFERENCES Packages(id),
    facility_id INT REFERENCES Facilities(id),
    voucher_id INT NULL REFERENCES Vouchers(id),
    
    billing_period VARCHAR(20), -- 'monthly', 'yearly'
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50), 
    payment_status VARCHAR(50) DEFAULT 'pending', 
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 4: HUẤN LUYỆN VIÊN & LỊCH TẬP PT (COACH PORTAL)
-- ==========================================================
CREATE TABLE Coaches (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES Users(id), -- Map với bảng Users
    specialty VARCHAR(255),
    bio TEXT,
    experience_years INT,
    rating DECIMAL(3,2) DEFAULT 0
);

CREATE TABLE PT_Sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id), -- Hội viên
    coach_id INT REFERENCES Coaches(id), -- HLV
    schedule_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    notes TEXT
);

CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    coach_id INT REFERENCES Coaches(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 5: BỘ MÔN & LỚP HỌC GROUP-X
-- ==========================================================
CREATE TABLE Sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE Classes (
    id SERIAL PRIMARY KEY,
    sport_id INT REFERENCES Sports(id),
    coach_id INT REFERENCES Coaches(id),
    facility_id INT REFERENCES Facilities(id),
    
    class_name VARCHAR(100) NOT NULL,
    schedule_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    capacity INT NOT NULL,
    current_enrolled INT DEFAULT 0,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE Class_Bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    class_id INT REFERENCES Classes(id),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UC_ClassBooking UNIQUE (user_id, class_id)
);

-- ==========================================================
-- PHẦN 6: THEO DÕI SỨC KHOẺ HỘI VIÊN (MEMBER PORTAL)
-- ==========================================================
CREATE TABLE Body_Metrics (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    weight DECIMAL(5,2), -- kg
    height DECIMAL(5,2), -- cm
    body_fat DECIMAL(5,2), -- %
    muscle_mass DECIMAL(5,2), -- kg
    bmi DECIMAL(5,2),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workout_Plans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    coach_id INT REFERENCES Coaches(id),
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE
);

CREATE TABLE Diet_Plans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    coach_id INT REFERENCES Coaches(id),
    calories_target INT,
    meals_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 7: BÁN LẺ & POS (RECEPTIONIST PORTAL)
-- ==========================================================
CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- Nước uống, Khăn, Thực phẩm bổ sung
    price DECIMAL(18,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    status BOOLEAN DEFAULT TRUE
);




CREATE TABLE Invoices (
    id SERIAL PRIMARY KEY,
    user_id INT NULL REFERENCES Users(id), -- Khách vãng lai thì NULL
    created_by INT REFERENCES Users(id), -- Lễ tân tạo HĐ
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Invoice_Items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES Invoices(id),
    product_id INT REFERENCES Products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL
);

-- ==========================================================
-- PHẦN 8: WEBSITE TIN TỨC & LIÊN HỆ
-- ==========================================================
CREATE TABLE Article_Categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE Articles (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES Article_Categories(id),
    author_id INT REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'published', -- 'draft', 'published'
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Contact_Messages (
    id SERIAL PRIMARY KEY,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 9: BỔ SUNG CHO ADMIN DASHBOARD & COACH PORTAL
-- Các bảng dưới đây được thêm mới để phục vụ các màn hình FE hiện tại.
-- Không thay đổi các bảng đã có ở phía trên.
-- ==========================================================

CREATE TABLE IF NOT EXISTS Audit_Logs (
    id SERIAL PRIMARY KEY,
    actor_id INT NULL REFERENCES Users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Budgets (
    id SERIAL PRIMARY KEY,
    facility_id INT NOT NULL REFERENCES Facilities(id),
    category VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    allocated_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_by INT NULL REFERENCES Users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK (period_end >= period_start)
);

CREATE TABLE IF NOT EXISTS Expenses (
    id SERIAL PRIMARY KEY,
    facility_id INT NOT NULL REFERENCES Facilities(id),
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(18,2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_by INT NULL REFERENCES Users(id),
    approved_by INT NULL REFERENCES Users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Payroll_Records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES Users(id),
    facility_id INT NULL REFERENCES Facilities(id),
    payroll_month DATE NOT NULL,
    base_salary DECIMAL(18,2) NOT NULL DEFAULT 0,
    bonus DECIMAL(18,2) NOT NULL DEFAULT 0,
    deduction DECIMAL(18,2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    paid_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, payroll_month)
);

CREATE TABLE IF NOT EXISTS Class_Attendance (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES Classes(id),
    booking_id INT NULL REFERENCES Class_Bookings(id),
    user_id INT NOT NULL REFERENCES Users(id),
    attendance_status VARCHAR(30) NOT NULL DEFAULT 'present',
    note VARCHAR(500),
    marked_by INT NULL REFERENCES Users(id),
    marked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, user_id)
);

-- Gộp bài tập, nhật ký, đánh giá và AI vào một bảng JSONB để giữ schema
-- dưới 30 bảng mà vẫn lưu được đầy đủ dữ liệu của Coach/Member Portal.
CREATE TABLE IF NOT EXISTS Training_Records (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id),
    coach_id INT NULL REFERENCES Coaches(id),
    workout_plan_id INT NULL REFERENCES Workout_Plans(id),
    record_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    goal VARCHAR(100),
    score DECIMAL(5,2),
    duration_minutes INT,
    calories_burned INT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_prompt TEXT,
    ai_recommendation TEXT,
    disclaimer VARCHAR(500),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
