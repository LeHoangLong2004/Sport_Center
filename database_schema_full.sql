-- ==========================================================
-- ĐỒ ÁN SWP391 - SPORT CENTER DATABASE SCHEMA (25 BẢNG)
-- HỆ QUẢN TRỊ: SQL SERVER (T-SQL)
-- ==========================================================

-- ==========================================================
-- PHẦN 1: HỆ THỐNG PHÂN QUYỀN VÀ TÀI KHOẢN
-- ==========================================================
CREATE TABLE Roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Admin, Receptionist, Coach, Member
    description NVARCHAR(255)
);

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT FOREIGN KEY REFERENCES Roles(id),
    full_name NVARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    gender NVARCHAR(10),
    emergency_contact NVARCHAR(255),
    status BIT DEFAULT 1, -- 1: Active, 0: Banned/Inactive
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 2: QUẢN LÝ CƠ SỞ VẬT CHẤT & ĐIỂM DANH
-- ==========================================================
CREATE TABLE Facilities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL, 
    address NVARCHAR(255) NOT NULL,
    hotline VARCHAR(20),
    status BIT DEFAULT 1
);

CREATE TABLE CheckIn_Logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    facility_id INT FOREIGN KEY REFERENCES Facilities(id),
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) -- 'Success', 'Failed'
);

-- ==========================================================
-- PHẦN 3: GÓI TẬP & THANH TOÁN (PAYMENT FLOW)
-- ==========================================================
CREATE TABLE Packages (
    id VARCHAR(50) PRIMARY KEY, -- 'swim', 'fitness', 'premium'
    name NVARCHAR(100) NOT NULL,
    tagline NVARCHAR(255),
    monthly_price DECIMAL(18,2) NOT NULL,
    yearly_price DECIMAL(18,2) NOT NULL,
    status BIT DEFAULT 1
);

CREATE TABLE Package_Features (
    id INT IDENTITY(1,1) PRIMARY KEY,
    package_id VARCHAR(50) FOREIGN KEY REFERENCES Packages(id),
    feature_text NVARCHAR(255) NOT NULL
);

CREATE TABLE Vouchers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    max_discount DECIMAL(18,2),
    valid_from DATETIME,
    valid_to DATETIME,
    usage_limit INT,
    used_count INT DEFAULT 0,
    status BIT DEFAULT 1
);

CREATE TABLE Subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    package_id VARCHAR(50) FOREIGN KEY REFERENCES Packages(id),
    facility_id INT FOREIGN KEY REFERENCES Facilities(id),
    voucher_id INT NULL FOREIGN KEY REFERENCES Vouchers(id),
    
    billing_period VARCHAR(20), -- 'monthly', 'yearly'
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50), 
    payment_status VARCHAR(50) DEFAULT 'pending', 
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 4: HUẤN LUYỆN VIÊN & LỊCH TẬP PT (COACH PORTAL)
-- ==========================================================
CREATE TABLE Coaches (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE FOREIGN KEY REFERENCES Users(id), -- Map với bảng Users
    specialty NVARCHAR(255),
    bio NVARCHAR(MAX),
    experience_years INT,
    rating DECIMAL(3,2) DEFAULT 0
);

CREATE TABLE PT_Sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id), -- Hội viên
    coach_id INT FOREIGN KEY REFERENCES Coaches(id), -- HLV
    schedule_time DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    notes NVARCHAR(MAX)
);

CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    coach_id INT FOREIGN KEY REFERENCES Coaches(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 5: BỘ MÔN & LỚP HỌC GROUP-X
-- ==========================================================
CREATE TABLE Sports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    image_url VARCHAR(255),
    status BIT DEFAULT 1
);

CREATE TABLE Classes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sport_id INT FOREIGN KEY REFERENCES Sports(id),
    coach_id INT FOREIGN KEY REFERENCES Coaches(id),
    facility_id INT FOREIGN KEY REFERENCES Facilities(id),
    
    class_name NVARCHAR(100) NOT NULL,
    schedule_time DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    capacity INT NOT NULL,
    current_enrolled INT DEFAULT 0,
    status BIT DEFAULT 1
);

CREATE TABLE Class_Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    class_id INT FOREIGN KEY REFERENCES Classes(id),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UC_ClassBooking UNIQUE (user_id, class_id)
);

-- ==========================================================
-- PHẦN 6: THEO DÕI SỨC KHOẺ HỘI VIÊN (MEMBER PORTAL)
-- ==========================================================
CREATE TABLE Body_Metrics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    weight DECIMAL(5,2), -- kg
    height DECIMAL(5,2), -- cm
    body_fat DECIMAL(5,2), -- %
    muscle_mass DECIMAL(5,2), -- kg
    bmi DECIMAL(5,2),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workout_Plans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    coach_id INT FOREIGN KEY REFERENCES Coaches(id),
    plan_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    start_date DATE,
    end_date DATE
);

CREATE TABLE Diet_Plans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id),
    coach_id INT FOREIGN KEY REFERENCES Coaches(id),
    calories_target INT,
    meals_description NVARCHAR(MAX),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PHẦN 7: BÁN LẺ & POS (RECEPTIONIST PORTAL)
-- ==========================================================
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    category NVARCHAR(100), -- Nước uống, Khăn, Thực phẩm bổ sung
    price DECIMAL(18,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    status BIT DEFAULT 1
);

CREATE TABLE Invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES Users(id), -- Khách vãng lai thì NULL
    created_by INT FOREIGN KEY REFERENCES Users(id), -- Lễ tân tạo HĐ
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Invoice_Items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT FOREIGN KEY REFERENCES Invoices(id),
    product_id INT FOREIGN KEY REFERENCES Products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL
);

-- ==========================================================
-- PHẦN 8: WEBSITE TIN TỨC & LIÊN HỆ
-- ==========================================================
CREATE TABLE Article_Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);

CREATE TABLE Articles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_id INT FOREIGN KEY REFERENCES Article_Categories(id),
    author_id INT FOREIGN KEY REFERENCES Users(id),
    title NVARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    content NVARCHAR(MAX) NOT NULL,
    status VARCHAR(50) DEFAULT 'published', -- 'draft', 'published'
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Contact_Messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sender_name NVARCHAR(100) NOT NULL,
    sender_email VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20),
    message NVARCHAR(MAX) NOT NULL,
    is_resolved BIT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
