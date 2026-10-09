# SmartGym OS / Sport Center Management System 🏋️‍♂️

![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![.NET Core](https://img.shields.io/badge/.NET-Core_8.0-purple?logo=dotnet)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

<a name="english"></a>
## 🇬🇧 English

### Introduction
**SmartGym OS** (Sport Center) is a comprehensive web-based management system designed specifically for gyms and fitness centers. It provides a full suite of tools to manage operations, from member subscriptions, class scheduling, and payment processing, to coaching curriculums and financial reporting. 

The system implements a Role-Based Access Control (RBAC) architecture, providing distinct, tailored experiences for Admins, Members, Coaches, and Receptionists.

### Key Features
#### 1. Admin Dashboard 👑
- **System Overview & KPI Tracking:** Real-time metrics for revenue, new members, retention rate, etc.
- **Member & Staff Management:** Full CRUD operations for users, coaches, HR, and their permissions.
- **Packages & Facilities:** Configure membership packages, gym facilities, and equipment.
- **Financial & Payroll:** Track budgets, operational expenses, process payroll, and view Profit & Loss (P&L) reports.
- **Class Scheduling:** Manage group classes and coach assignments.

#### 2. Member Portal 👤
- **Workout & Curriculum:** View assigned workout plans, exercises, and daily routines.
- **Body Metrics & Assessment:** Track progress via charts (weight, body fat, muscle mass, etc.) and view coach assessments.
- **Membership & Payments:** Browse available packages, checkout securely with OTP, and view invoice history.
- **Profile Management:** Update personal information, avatar, and settings.

#### 3. Coach Portal 🏋️
- **Member Assessment:** Record training results, log attendance, and assess member performance after sessions.
- **Curriculum Management:** Assign and adjust workout plans for specific members.
- **Members Profile:** View detailed profiles and health metrics of assigned members.

#### 4. Receptionist Portal 🛎️
- **Check-ins:** Process member check-ins quickly (QR/Barcode or manual search).
- **Sales & Support:** Assist with membership renewals, walk-in inquiries, and basic support.

### Usage Guide & Business Workflows
**1. Member Registration & Purchasing:**
- A user signs up via the Member Portal or Reception.
- They navigate to the **Packages** page to browse available options.
- The user proceeds to checkout and enters an OTP to confirm the payment securely.
- Upon successful payment, an invoice is generated and the membership becomes active.

**2. Class Enrollment & Training:**
- The **Admin** schedules classes and assigns a **Coach**.
- **Members** can view their assigned workout plans and classes through the Member Portal.
- The **Coach** manages the curriculum and views member progress via the Coach Portal.

**3. Check-ins & Daily Operations:**
- When a member arrives, the **Receptionist** checks them in via the Receptionist Portal.
- The **Coach** can evaluate the member post-workout and record the assessment.
- The member can view these assessments and update their body metrics directly on their dashboard.

**4. Administration & Finance:**
- The **Admin** oversees daily check-ins, staff activities, and overall health of the gym via KPIs.
- The Admin manages expenses, payroll, and generates Profit & Loss reports to track business performance.

### Tech Stack
**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router DOM v6
- React Hook Form + Zod
- React Query (@tanstack/react-query)
- Framer Motion & Lucide React (UI/Animations)

**Backend:**
- C# .NET Core API
- Entity Framework (EF) Core (Code First)
- Clean Architecture (Api, Application, Domain, Infrastructure layers)
- JWT Authentication & Role-Based Access Control

### Project Structure
```text
Sport_Center/
├── Frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/ # Shared UI components
│   │   ├── pages/      # Portal specific views (Admin, Member, Coach, etc.)
│   │   ├── hooks/      # Custom React hooks
│   │   └── ...
│   └── docs/           # Frontend documentation and tracking
├── backend/            # .NET Core Clean Architecture
│   ├── SmartGym.Api/
│   ├── SmartGym.Application/
│   ├── SmartGym.Domain/
│   └── SmartGym.Infrastructure/
└── database_schema.sql # Database scripts
```

### Setup Instructions
1. **Clone the repository.**
2. **Backend Setup:**
   - Navigate to `backend/SmartGym.Api`.
   - Update connection strings in `appsettings.json`.
   - Run EF Migrations or execute the `.sql` schema files to set up the database.
   - Run the API: `dotnet run` or use Visual Studio / Rider.
3. **Frontend Setup:**
   - Navigate to `Frontend`.
   - Install dependencies: `npm install`
   - Start dev server: `npm run dev`

---

<a name="tiếng-việt"></a>
## 🇻🇳 Tiếng Việt

### Giới thiệu
**SmartGym OS** (Sport Center) là một hệ thống quản lý nền web toàn diện được thiết kế dành riêng cho các phòng gym và trung tâm thể hình. Dự án cung cấp bộ công cụ đầy đủ để quản lý vận hành, từ các gói hội viên, xếp lịch lớp học, thanh toán, cho đến giáo trình huấn luyện và báo cáo tài chính.

Hệ thống triển khai kiến trúc Phân quyền (Role-Based Access Control - RBAC), cung cấp các giao diện và chức năng riêng biệt được tối ưu cho Quản trị viên (Admin), Hội viên (Member), Huấn luyện viên (Coach), và Lễ tân (Receptionist).

### Các Tính Năng Chính
#### 1. Admin Dashboard (Trang Quản trị) 👑
- **Tổng quan Hệ thống & KPI:** Xem các chỉ số thời gian thực về doanh thu, hội viên mới, tỷ lệ giữ chân, v.v.
- **Quản lý Hội viên & Nhân sự:** Quản lý toàn diện người dùng, huấn luyện viên, nhân viên và phân quyền truy cập.
- **Gói Hội viên & Cơ sở vật chất:** Thiết lập các gói tập, quản lý bộ môn và thiết bị phòng tập.
- **Tài chính & Bảng lương:** Theo dõi ngân sách, chi phí vận hành, xử lý lương nhân viên và xem báo cáo Lãi/Lỗ (P&L).
- **Lịch trình & Lớp học:** Quản lý lịch học các nhóm và phân công HLV.

#### 2. Member Portal (Trang Hội viên) 👤
- **Lịch tập & Giáo trình:** Xem kế hoạch tập luyện được giao, các bài tập và thói quen hàng ngày.
- **Chỉ số Cơ thể & Đánh giá:** Theo dõi tiến độ qua biểu đồ (cân nặng, tỷ lệ mỡ, cơ, v.v.) và xem nhận xét từ HLV.
- **Gói tập & Thanh toán:** Xem các gói tập, thanh toán an toàn (tích hợp OTP), và xem lịch sử hóa đơn.
- **Quản lý Hồ sơ:** Cập nhật thông tin cá nhân, ảnh đại diện và cài đặt.

#### 3. Coach Portal (Trang Huấn luyện viên) 🏋️
- **Đánh giá Hội viên:** Ghi nhận kết quả tập luyện, điểm danh và đánh giá hiệu suất của hội viên sau buổi tập.
- **Quản lý Giáo trình:** Giao và điều chỉnh kế hoạch tập luyện cho từng hội viên.
- **Hồ sơ Hội viên:** Xem thông tin chi tiết và các chỉ số sức khỏe của hội viên mà mình quản lý.

#### 4. Receptionist Portal (Trang Lễ tân) 🛎️
- **Check-in:** Xử lý điểm danh cho hội viên một cách nhanh chóng (qua mã QR/Barcode hoặc tìm kiếm thủ công).
- **Bán hàng & Hỗ trợ:** Hỗ trợ gia hạn gói tập, tư vấn khách hàng mới và hỗ trợ các vấn đề cơ bản.

### Hướng Dẫn Sử Dụng & Luồng Nghiệp Vụ
**1. Đăng ký & Mua gói tập (Member Registration & Purchasing):**
- Người dùng đăng ký tài khoản qua Trang Hội viên hoặc tại quầy Lễ tân.
- Khách hàng truy cập trang **Gói tập (Packages)** để xem và chọn gói phù hợp.
- Khi thanh toán, khách hàng nhập mã OTP để xác nhận giao dịch an toàn.
- Sau khi thanh toán thành công, hệ thống tự động xuất hóa đơn và kích hoạt gói tập.

**2. Đăng ký Lớp học & Tập luyện (Class Enrollment & Training):**
- **Quản trị viên (Admin)** lên lịch các lớp học và phân công **Huấn luyện viên (Coach)**.
- **Hội viên** có thể xem lịch tập, giáo trình và lớp học của mình qua Trang Hội viên.
- **Huấn luyện viên** quản lý giáo trình và theo dõi tiến độ của hội viên thông qua Trang Huấn luyện viên.

**3. Điểm danh & Hoạt động Hàng ngày (Check-ins & Daily Operations):**
- Khi hội viên đến phòng tập, **Lễ tân (Receptionist)** sẽ thực hiện check-in nhanh chóng.
- Sau buổi tập, **Huấn luyện viên** sẽ đánh giá và ghi nhận kết quả tập luyện của hội viên.
- Hội viên có thể xem các đánh giá này và chủ động cập nhật các chỉ số cơ thể của mình (cân nặng, lượng mỡ, v.v.).

**4. Quản trị & Tài chính (Administration & Finance):**
- **Quản trị viên** theo dõi toàn bộ hoạt động hàng ngày, tình hình kinh doanh thông qua bảng điều khiển KPI.
- Admin quản lý các khoản chi phí, bảng lương nhân sự và xem các báo cáo Lãi/Lỗ (P&L) để nắm bắt hiệu quả kinh doanh.

### Công Nghệ Sử Dụng
**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router DOM v6
- React Hook Form + Zod
- React Query (@tanstack/react-query)
- Framer Motion & Lucide React (UI & Hiệu ứng)

**Backend:**
- C# .NET Core API
- Entity Framework (EF) Core (Code First)
- Clean Architecture (Gồm các tầng Api, Application, Domain, Infrastructure)
- JWT Authentication & Role-Based Access Control (RBAC)

### Cấu Trúc Dự Án
```text
Sport_Center/
├── Frontend/           # Ứng dụng React + Vite
│   ├── src/
│   │   ├── components/ # Component giao diện dùng chung
│   │   ├── pages/      # Giao diện riêng cho từng đối tượng (Admin, Member, Coach...)
│   │   ├── hooks/      # Các React hook tự định nghĩa
│   │   └── ...
│   └── docs/           # Tài liệu dự án frontend
├── backend/            # .NET Core Clean Architecture
│   ├── SmartGym.Api/
│   ├── SmartGym.Application/
│   ├── SmartGym.Domain/
│   └── SmartGym.Infrastructure/
└── database_schema.sql # Các script cơ sở dữ liệu
```

### Hướng Dẫn Cài Đặt
1. **Clone repository về máy.**
2. **Cài đặt Backend:**
   - Di chuyển vào thư mục `backend/SmartGym.Api`.
   - Cập nhật chuỗi kết nối cơ sở dữ liệu trong file `appsettings.json`.
   - Chạy EF Migrations hoặc thực thi các file script `.sql` để khởi tạo database.
   - Khởi chạy API bằng lệnh `dotnet run` hoặc qua Visual Studio / Rider.
3. **Cài đặt Frontend:**
   - Di chuyển vào thư mục `Frontend`.
   - Cài đặt thư viện: `npm install`
   - Khởi chạy server phát triển: `npm run dev`
