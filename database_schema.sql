-- BẢNG CƠ SỞ / CHI NHÁNH TẬP LUYỆN
CREATE TABLE Facilities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL, -- Vd: Chi nhánh Quận 1 - Flagship Center
    address NVARCHAR(255) NOT NULL,
    hotline VARCHAR(20),
    status BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG NGƯỜI DÙNG / HỘI VIÊN
CREATE TABLE Members (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender NVARCHAR(10), -- Nam, Nữ, Khác
    emergency_contact NVARCHAR(255), -- Vd: Nguyễn Văn A - 0912 345 678
    password_hash VARCHAR(255) NOT NULL,
    status BIT DEFAULT 1, -- 1: Active, 0: Inactive
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG DANH MỤC GÓI TẬP (Packages)
CREATE TABLE Packages (
    id VARCHAR(50) PRIMARY KEY, -- Vd: 'swim', 'fitness', 'premium'
    name NVARCHAR(100) NOT NULL, -- Vd: 'Fitness Plus'
    tagline NVARCHAR(255),
    monthly_price DECIMAL(18,2) NOT NULL,
    yearly_price DECIMAL(18,2) NOT NULL,
    description NVARCHAR(MAX),
    status BIT DEFAULT 1
);

-- BẢNG TÍNH NĂNG GÓI TẬP (Package Features)
CREATE TABLE Package_Features (
    id INT IDENTITY(1,1) PRIMARY KEY,
    package_id VARCHAR(50) FOREIGN KEY REFERENCES Packages(id),
    feature_text NVARCHAR(255) NOT NULL -- Vd: 'Tham gia toàn bộ lớp Group-X không giới hạn'
);

-- BẢNG GIAO DỊCH / ĐĂNG KÝ GÓI TẬP (Subscriptions)
CREATE TABLE Subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT FOREIGN KEY REFERENCES Members(id),
    package_id VARCHAR(50) FOREIGN KEY REFERENCES Packages(id),
    facility_id INT FOREIGN KEY REFERENCES Facilities(id),
    
    billing_period VARCHAR(20), -- 'monthly' hoặc 'yearly'
    total_amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50), -- 'qr', 'card', 'wallet', 'counter'
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG HUẤN LUYỆN VIÊN (Coaches)
CREATE TABLE Coaches (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    specialty NVARCHAR(255), -- Vd: 'Cử tạ & Thể hình', 'Yoga'
    bio NVARCHAR(MAX),
    experience_years INT,
    status BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG BỘ MÔN (Sports / Categories)
CREATE TABLE Sports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL, -- Vd: 'Yoga', 'Boxing', 'Zumba'
    description NVARCHAR(MAX),
    image_url VARCHAR(255),
    status BIT DEFAULT 1
);

-- BẢNG LỚP HỌC (Classes)
CREATE TABLE Classes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sport_id INT FOREIGN KEY REFERENCES Sports(id),
    coach_id INT FOREIGN KEY REFERENCES Coaches(id),
    facility_id INT FOREIGN KEY REFERENCES Facilities(id),
    
    class_name NVARCHAR(100) NOT NULL,
    capacity INT NOT NULL, -- Sức chứa tối đa
    current_enrolled INT DEFAULT 0,
    
     schedule_time DATETIME NOT NULL,
     duration_minutes INT NOT NULL, -- Thời lượng (Vd: 60 phút)
     status BIT DEFAULT 1,
     approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'
);

-- BẢNG ĐĂNG KÝ LỚP HỌC (Class Bookings)
CREATE TABLE Class_Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT FOREIGN KEY REFERENCES Members(id),
    class_id INT FOREIGN KEY REFERENCES Classes(id),
    booking_status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UC_ClassBooking UNIQUE (member_id, class_id) -- Tránh book 1 lớp 2 lần
);

-- BẢNG CHỈ SỐ CƠ THỂ HỘI VIÊN (Body Metrics / InBody)
-- Dùng để theo dõi tiến độ thể trạng và làm đầu vào cho AI (Flow 5) may đo giáo án tập luyện
CREATE TABLE Body_Metrics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL FOREIGN KEY REFERENCES Members(id) ON DELETE CASCADE,
    
    weight DECIMAL(5,2) NOT NULL,       -- Cân nặng (kg) Vd: 72.50
    height DECIMAL(5,2) NOT NULL,       -- Chiều cao (cm) Vd: 175.00
    body_fat DECIMAL(4,2) NULL,         -- Tỷ lệ mỡ (%) Vd: 18.50
    muscle_mass DECIMAL(5,2) NULL,      -- Khối lượng cơ (kg) Vd: 32.40
    bmi DECIMAL(4,2) NULL,              -- Chỉ số BMI Vd: 23.67
    
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IX_BodyMetrics_MemberDate ON Body_Metrics(member_id, recorded_at DESC);

-- DỮ LIỆU MẪU CHỈ SỐ CƠ THỂ (Sample Body Metrics for Testing Flow 5 AI)
-- Ví dụ: Hội viên 1 có chỉ số thể trạng thừa cân nhẹ (BMI 24.2, mỡ 22.5%)
-- INSERT INTO Body_Metrics (member_id, weight, height, body_fat, muscle_mass, bmi) 
-- VALUES (1, 74.00, 175.00, 22.50, 31.80, 24.16);
