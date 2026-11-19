# SmartGym OS / Sport Center Management System 🏋️‍♂️

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![.NET Core](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![VietQR](https://img.shields.io/badge/Payment-VietQR%20%7C%20SePay-008080?logo=cashapp&logoColor=white)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

<a name="english"></a>
## 🇬🇧 English

### Introduction
**SmartGym OS** (Sport Center) is an enterprise-grade, full-stack management platform engineered for fitness centers, athletic clubs, and multi-sport complexes. Built with modern web technologies and a scalable Clean Architecture backend, it streamlines day-to-day operations—from automated VietQR payment verification and member wallet management to class scheduling, proxy bookings by front desk staff, coaching assessments, and real-time financial reporting.

The system implements Role-Based Access Control (RBAC) with dedicated portals for **Administrators**, **Receptionists**, **Members**, and **Coaches**.

---

### Key Portals & Capabilities

#### 1. 👑 Admin Dashboard
- **Operational & Financial KPIs:** Real-time metrics for total revenue, active members, renewal retention, and capacity utilization.
- **Member & Personnel Management:** Comprehensive CRUD operations, role assignment, and access control for members, trainers, and reception staff.
- **Membership Catalog & Tiers:** Configure multi-tier memberships (Standard, Plus, VIP, Premium) with dynamic discount rules (5%–15% off class bookings and PT sessions).
- **Facility & Equipment Tracking:** Manage studio rooms, sports courts, and equipment maintenance schedules.
- **Financial Accounting & Payroll:** Track operational expenditures, automate trainer commission/salary payouts, and generate Profit & Loss (P&L) summaries.

#### 2. 🛎️ Receptionist Portal (Front Desk Operations)
- **Fast Check-in / Check-out:** Instant member attendance via QR code scanner, barcode, or real-time phone/code lookup.
- **Proxy Class Booking & Cancellation (Đặt hộ & Hủy lịch hộ):**
  - Search and enroll members into group classes or sports sessions directly from the front desk.
  - View real-time attendee rosters for each class session.
  - Cancel bookings on behalf of members with automatic seat release and refund handling.
- **Over-the-Counter Renewals:** Renew or upgrade membership cards using Cash, Internal Member Wallet, or dynamic VietQR.
- **POS Retail & Walk-in Sales:** Sell beverages, nutritional supplements, and sportswear at the counter with instant invoice generation.
- **Member Inquiries & Member Lookup:** Complete customer profile view, check-in history, active packages, and remaining days.

#### 3. 👤 Member Portal
- **Interactive Class & Court Booking:** Browse schedules for Gym, Yoga, Pilates, Swimming, Badminton, Boxing, and Dance with real-time seat counters.
- **Membership Management & Renewal:**
  - View current tier perks, active duration, and countdown timer.
  - Seamless 1-month, 3-month, or annual renewals with continuous date accumulation.
- **Internal Member Wallet (Ví hội viên):**
  - Top up via bank transfer (VietQR / SePay) with instant balance synchronization.
  - One-click payments for classes, memberships, and PT sessions without needing bank apps every time.
- **PT 1-on-1 Sessions:** Browse certified coaches, view specialties and ratings, and schedule personal training sessions.
- **Fitness Curriculum & Body Metrics:** Track weight, body fat %, and muscle mass over time with graphical progress reports and trainer feedback.

#### 4. 🏋️ Coach Portal
- **Teaching Schedule & Class Rosters:** View assigned class schedules, time slots, and real-time registered student lists.
- **Attendance & Post-Workout Evaluations:** Mark attendance and record post-session fitness feedback for each student.
- **Curriculum & Exercise Planning:** Design customized workout routines and track student progress over time.

---

### 💳 VietQR & SePay Automated Payment Architecture

SmartGym OS features an automated banking reconciliation pipeline via **VietQR Napas 247** and **SePay Webhooks**:
- **Real-time Webhook Receiver:** Inbound bank transaction webhooks are captured and processed within seconds.
- **3-Layer Anti-Duplicate Security:**
  1. **Dynamic Attempt Code:** Every checkout modal generates a unique 4-digit session code (e.g., `SC 9174 MEMBER 4821` or `DATLOP 04419F05 3912`).
  2. **Strict Token Verification:** System ignores generic keywords (`SC`, `MEMBER`, `DATLOP`, `GYM`) and mandates an exact match for both the transaction amount and specific unique identifiers.
  3. **Consumed Transaction Lifecycle:** Once a bank transaction matches an order, it is permanently flagged as `consumed` with an associated `MatchedOrderId`, preventing replay attacks or false-positive confirmations for subsequent sessions.

---

### Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5.7, Vite 8, Tailwind CSS 4, React Router DOM v6, Lucide React, Sonner Toast |
| **Backend** | .NET 10 Web API, ASP.NET Core, Entity Framework Core 8, C# |
| **Architecture** | Clean Architecture (Domain, Application, Infrastructure, Api layers) |
| **Database** | PostgreSQL / SQL Server (EF Core Code-First Migrations) |
| **Security** | JWT Authentication, BCrypt Password Hashing, RBAC Middleware |
| **Integrations** | VietQR (Napas 247), SePay Banking Webhook & Open API |
| **Deployment** | Docker, Render (Backend API), Vercel (Frontend Web) |

---

### Project Structure
```text
Sport_Center/
├── Frontend/                           # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/                 # Reusable UI widgets & modals
│   │   ├── pages/
│   │   │   ├── AdminPortal/            # Admin management pages & reports
│   │   │   ├── ReceptionistPortal/     # Front desk, check-in, proxy booking & POS
│   │   │   ├── MemberPortal/           # Member portal, wallet, booking & tiers
│   │   │   └── CoachPortal/            # Coach schedules, attendance & reviews
│   │   ├── services/                   # API clients (packageApi, walletService, etc.)
│   │   └── utils/                      # Formatting helpers & image resolvers
│   └── package.json
├── backend/                            # .NET 10 Clean Architecture
│   ├── SmartGym.Api/                   # Minimal API Endpoints, Webhooks & Program.cs
│   ├── SmartGym.Application/           # DTOs, interfaces, business logic
│   ├── SmartGym.Domain/                # Entities, Enums, Aggregate roots
│   └── SmartGym.Infrastructure/         # EF Core DbContext, Migrations, Repositories
└── database_schema.sql                 # SQL reference schemas & seed data
```

---

### Getting Started

#### Prerequisites
- Node.js (v18 or higher) & npm
- .NET 10 SDK (or .NET 8 SDK)
- PostgreSQL database instance

#### 1. Backend Setup
```bash
# Navigate to the API directory
cd backend/SmartGym.Api

# Configure connection string in appsettings.json
# Run database migrations
dotnet ef database update --project ../SmartGym.Infrastructure

# Start the Backend API
dotnet run
# Server starts at http://localhost:5000 (Swagger: http://localhost:5000/swagger)
```

#### 2. Frontend Setup
```bash
# Navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
# Application available at http://localhost:5173
```

#### 3. SePay Webhook Local Testing (Optional)
To test bank transfers locally:
```bash
# Expose backend port 5000 via ngrok
ngrok http 5000

# Configure the Webhook URL in your my.sepay.vn dashboard:
# https://<your-ngrok-subdomain>.ngrok-free.app/api/payments/sepay-webhook
```

---

<a name="tiếng-việt"></a>
## 🇻🇳 Tiếng Việt

### Giới thiệu
**SmartGym OS** (Sport Center) là hệ thống quản lý trung tâm thể hình và tổ hợp thể thao chuyên nghiệp, hiện đại, vận hành trên nền tảng web. Được xây dựng theo mô hình Clean Architecture mở rộng, hệ thống tự động hóa toàn bộ quy trình vận hành phòng tập: từ tự động khớp lệnh thanh toán VietQR / SePay, ví điện tử hội viên, đặt lịch lớp học, lễ tân đặt hộ/hủy lịch hộ, quản lý ca dạy HLV, cho đến báo cáo tài chính doanh thu thời gian thực.

Hệ thống phân quyền RBAC chặt chẽ với 4 phân hệ chính: **Quản trị viên (Admin)**, **Lễ tân (Receptionist)**, **Hội viên (Member)**, và **Huấn luyện viên (Coach)**.

---

### Các Phân Hệ & Tính Năng Chi Tiết

#### 1. 👑 Admin Dashboard (Quản Trị Viên)
- **Báo cáo KPI & Doanh thu:** Thống kê doanh thu theo ngày/tháng/năm, số lượng hội viên mới, tỷ lệ gia hạn và công suất phòng tập.
- **Quản lý Hội viên & Nhân sự:** Quản trị toàn bộ danh sách hội viên, huấn luyện viên, nhân viên lễ tân cùng phân quyền chi tiết.
- **Gói tập & Phân hạng Hội viên:** Cấu hình các gói thành viên (Cơ bản, Plus, VIP, Premium) với ưu đãi tự động giảm 5% – 15% khi đặt lớp và thuê PT.
- **Cơ sở vật chất & Thiết bị:** Quản lý danh mục phòng studio (Yoga, Pilates, Bơi, Gym, Boxing), thiết bị tập luyện và lịch bảo trì định kỳ.
- **Tài chính & Lương thưởng:** Quản lý chi phí vận hành, tính hoa hồng/lương cho HLV và kết xuất báo cáo Lãi/Lỗ (P&L).

#### 2. 🛎️ Receptionist Portal (Bàn Tiếp Đón & Lễ Tân)
- **Check-in / Check-out Nhanh:** Điểm danh hội viên ra/vào phòng tập qua quét mã QR, Barcode thẻ hoặc tìm kiếm theo SĐT/Tên.
- **Đặt lịch học hộ & Hủy lịch hộ học viên (Độc quyền):**
  - Lễ tân trực tiếp tra cứu lớp học và đặt chỗ hộ cho học viên tại quầy.
  - Xem danh sách học viên đã ghi danh trong từng lớp học.
  - **Hủy lịch hộ học viên:** Hỗ trợ hủy lịch lớp theo yêu cầu của học viên, tự động khôi phục vị trí trống trên lớp và hoàn tiền/lượt học.
- **Gia hạn gói tập tại quầy:** Gia hạn hoặc nâng cấp thẻ tập cho khách hàng bằng Tiền mặt, Ví hội viên, hoặc mã VietQR động.
- **Bán lẻ POS:** Bán đồ uống, thực phẩm bổ sung dinh dưỡng (Whey, BCAA), phụ kiện tập luyện tại quầy với hóa đơn tức thì.
- **Tra cứu hồ sơ:** Xem nhanh lịch sử tập luyện, hạn sử dụng gói tập và thông tin liên hệ của học viên.

#### 3. 👤 Member Portal (Cổng Dành Cho Hội Viên)
- **Đặt lịch Lớp học & Sân tập:** Đặt chỗ các lớp Gym, Yoga, Pilates, Cầu lông, Bơi lội, Zumba theo thời gian thực kèm thông tin HLV phụ trách.
- **Gói thành viên & Gia hạn trực tuyến:**
  - Hiển thị quyền lợi hạng thẻ (Plus, VIP, Premium), thời hạn còn lại và đếm ngược số ngày.
  - Gia hạn 1 tháng, 3 tháng, 6 tháng, 1 năm với thuật toán cộng dồn hạn sử dụng liên tục (không bị mất ngày cũ).
- **Ví điện tử Hội viên (Member Wallet):**
  - Nạp tiền tự động qua quét mã VietQR ngân hàng (Sacombank, MBBank, VCB,...).
  - Thanh toán dịch vụ, gói tập, lớp học 1-chạm không cần mở app ngân hàng mỗi lần.
- **Lịch hẹn PT 1-kèm-1:** Tra cứu danh sách HLV cá nhân, đánh giá sao, chuyên môn và đặt lịch tập riêng.
- **Theo dõi Thể hình & Sức khỏe:** Lưu trữ và trực quan hóa chỉ số cân nặng, lượng mỡ, cơ bắp qua biểu đồ tiến độ; nhận xét từ HLV.

#### 4. 🏋️ Coach Portal (Cổng Huấn Luyện Viên)
- **Lịch giảng dạy & Danh sách lớp:** Theo dõi các ca dạy trong tuần, số lượng học viên đăng ký của từng lớp.
- **Điểm danh & Nhận xét buổi tập:** Đánh giá mức độ hoàn thành bài tập, thể lực và ghi chú cho từng học viên sau mỗi buổi tập.
- **Xây dựng giáo trình tập luyện:** Thiết kế các bài tập mẫu và phân bổ kế hoạch rèn luyện cho học viên phụ trách.

---

### 💳 Hệ Thống Thanh Toán VietQR & SePay Tự Động

SmartGym OS tích hợp giải pháp thanh toán thông minh theo chuẩn **VietQR Napas 247** và **Webhook SePay**:
- **Bắt biến động số dư tự động:** Khi khách hàng chuyển khoản thành công từ bất kỳ ứng dụng ngân hàng nào (Sacombank, Vietcombank, MBBank, Techcombank,...), hệ thống tự động ghi nhận trong vòng 1-3 giây.
- **Cơ chế bảo vệ 3 lớp chống thanh toán sai / khớp trùng:**
  1. **Mã phiên ngẫu nhiên (`attemptCode`):** Mỗi lần mở popup thanh toán, hệ thống tạo mã 4 số duy nhất (ví dụ: `SC 9174 MEMBER 4921`, `DATLOP 04419F05 8123`).
  2. **So khớp định danh nghiêm ngặt:** Loại bỏ các từ khóa chung (`SC`, `MEMBER`, `DATLOP`, `GYM`), bắt buộc phải khớp đúng số tiền và toàn bộ mã định danh cụ thể của phiên.
  3. **Vòng đời giao dịch `consumed`:** Giao dịch ngân hàng khi đã khớp với một đơn hàng sẽ được đánh dấu `consumed` ngay lập tức, ngăn chặn hoàn toàn việc tái sử dụng giao dịch cũ.

---

### Công Nghệ Sử Dụng

| Tầng kiến trúc | Công nghệ chính |
|---|---|
| **Frontend** | React 19, TypeScript 5.7, Vite 8, Tailwind CSS 4, React Router DOM v6, Lucide React, Sonner |
| **Backend** | .NET 10 Web API, ASP.NET Core, Entity Framework Core 8, C# |
| **Kiến trúc** | Clean Architecture (Domain, Application, Infrastructure, Api) |
| **Cơ sở dữ liệu** | PostgreSQL / SQL Server (Code-First Migrations) |
| **Bảo mật** | JWT Bearer, BCrypt, RBAC Middleware, CORS Configuration |
| **Tích hợp** | VietQR Napas 247, SePay Inbound Webhook & Transaction API |
| **Triển khai** | Docker, Render (Backend API), Vercel (Frontend Web) |

---

### Cấu Trúc Thư Mục
```text
Sport_Center/
├── Frontend/                           # Ứng dụng Frontend React 19 Vite
│   ├── src/
│   │   ├── components/                 # Component UI & Modal dùng chung
│   │   ├── pages/
│   │   │   ├── AdminPortal/            # Trang quản trị, KPI & tài chính
│   │   │   ├── ReceptionistPortal/     # Trang lễ tân: Check-in, Đặt hộ/Hủy hộ, Bán hàng
│   │   │   ├── MemberPortal/           # Cổng hội viên: Đặt lịch, Ví, Gia hạn thẻ
│   │   │   └── CoachPortal/            # Cổng HLV: Lịch dạy, Điểm danh, Đánh giá
│   │   ├── services/                   # Dịch vụ gọi API (PackageAPI, WalletService...)
│   │   └── utils/                      # Helper định dạng tiền tệ, ngày tháng, ảnh
│   └── package.json
├── backend/                            # Mã nguồn Backend .NET 10 Clean Architecture
│   ├── SmartGym.Api/                   # Endpoints Minimal API, Webhooks, Program.cs
│   ├── SmartGym.Application/           # DTOs, Business interfaces, Command/Query
│   ├── SmartGym.Domain/                # Entities, Enums, Logic nghiệp vụ lõi
│   └── SmartGym.Infrastructure/         # EF Core DbContext, Migrations, Repositories
└── database_schema.sql                 # Script SQL cấu trúc bảng & dữ liệu mẫu
```

---

### Hướng Dẫn Cài Đặt & Chạy Dự Án

#### Yêu Cầu Môi Trường
- Node.js (phiên bản 18 trở lên) & npm
- .NET 10 SDK (hoặc .NET 8 SDK)
- Cơ sở dữ liệu PostgreSQL (hoặc SQL Server)

#### 1. Khởi Chạy Backend API
```bash
# Di chuyển vào thư mục SmartGym.Api
cd backend/SmartGym.Api

# Cập nhật ConnectionString trong appsettings.json nếu cần
# Cập nhật cơ sở dữ liệu
dotnet ef database update --project ../SmartGym.Infrastructure

# Chạy Backend API
dotnet run
# API hoạt động tại: http://localhost:5000 (Tài liệu Swagger: http://localhost:5000/swagger)
```

#### 2. Khởi Chạy Frontend
```bash
# Di chuyển vào thư mục Frontend
cd Frontend

# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ phát triển
npm run dev
# Website hoạt động tại: http://localhost:5173
```

#### 3. Cấu Hình Webhook SePay Cho Môi Trường Local (Tùy Chọn)
Để kiểm tra quét biến động số dư ngân hàng thực tế ở máy local:
```bash
# Mở cổng 5000 ra Internet bằng ngrok
ngrok http 5000

# Copy URL ngrok và dán vào Webhook tại trang quản lý my.sepay.vn:
# https://<dia-chi-ngrok>.ngrok-free.app/api/payments/sepay-webhook
```
