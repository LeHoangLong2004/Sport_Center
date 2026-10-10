# SRS: Hệ thống Quản lý Trung tâm Thể thao (Sports Center Management System - SmartGym OS)

> **Mã đề tài:** SWP391_FA26_TOPIC_04  
> **Giảng viên phụ trách:** MinhTTH5  
> **Phiên bản:** 1.1.0 (Technical & Requirement Specification)  
> **Trạng thái:** APPROVED  
> **Tech Stack:** Frontend: React | Backend: C# (ASP.NET Core Web API) | Database: Supabase (Managed PostgreSQL)  
> **Kiến trúc cốt lõi:** Clean Architecture, Multi-Role RBAC, RESTful API, Supabase Storage & Relational DB, Integrated AI Fitness Assistant.

---

## 1. TỔNG QUAN DỰ ÁN & PHẠM VI (PROJECT SCOPE)

### 1.1. Mục tiêu hệ thống (Objective)
Xây dựng nền tảng phần mềm quản trị toàn diện cho trung tâm thể thao và thể hình (Fitness & Sports Center), kết nối liền mạch 4 đối tượng tác nhân: Quản lý trung tâm, Huấn luyện viên, Lễ tân và Hội viên. Hệ thống hướng đến:
1. **Số hóa quy trình vận hành:** Loại bỏ ghi chép thủ công, hợp nhất dữ liệu hội viên, lịch học, phòng tập, check-in và thanh toán trên một nền tảng duy nhất.
2. **Nâng cao tỷ lệ duy trì hội viên (Retention Rate):** Minh bạch lộ trình tập luyện, trực quan hóa tiến độ thể chất và áp dụng AI để cá nhân hóa giáo án.
3. **Quản trị thông minh theo thời gian thực:** Cung cấp bảng điều khiển (Dashboard) theo dõi doanh thu, tỷ lệ lấp đầy lớp học và hiệu suất nhân sự.

---

### 1.2. Phân loại vai trò người dùng (System Actors)

| Vai trò (Actor) | Trách nhiệm chính trong hệ thống |
|---|---|
| **Center Manager (Quản lý trung tâm)** | Quản lý danh mục hội viên, HLV, nhân viên; quản lý gói tập, học phí, bộ môn, phòng tập; phân công HLV; xem báo cáo doanh thu/vận hành; cấu hình RBAC và kiểm duyệt Audit Log. |
| **Coach (Huấn luyện viên)** | Xem lịch dạy và danh sách học viên; theo dõi mục tiêu, chỉ số thể chất của học viên; tạo giáo án cá nhân/lớp; điểm danh lớp học; ghi nhận kết quả tập luyện và nhận xét sau buổi tập; sử dụng AI gợi ý bài tập. |
| **Member (Học viên / Thành viên)** | Tự đăng ký tài khoản, xem và mua/gia hạn gói tập; tìm kiếm và đặt/hủy lớp học; theo dõi lịch cá nhân, lịch sử điểm danh, tiến độ tập luyện; nhận bài tập về nhà; tương tác với AI Chatbot hỏi đáp. |
| **Receptionist (Nhân viên Lễ tân)** | Tiếp đón hội viên, check-in vào cổng (QR Code/Mã hội viên); đăng ký hội viên mới tại quầy; thu học phí, xử lý thanh toán, xuất hóa đơn; đặt/hủy lịch học hộ hội viên; tiếp nhận yêu cầu hỗ trợ. |

---

### 1.3. Phạm vi triển khai (Scope Breakdown)

#### A. Tính năng cốt lõi bắt buộc (Flow 1, 2, 3 - Must Have / REQUIRED)
- [ ] **Flow 1: Quản lý Người dùng & Gói thành viên (User & Membership Management):**
  - Quản lý tài khoản, hồ sơ cá nhân và phân quyền RBAC cho 4 vai trò.
  - Quản lý danh mục gói tập (giá, thời hạn, số buổi, quyền lợi phòng tập).
  - Đăng ký hội viên nhanh tại quầy lễ tân và cổng tự đăng ký trực tuyến.
  - Quản lý trạng thái gói cước (Active, Inactive, Expired, Suspended) và batch job tự động quét hạn.
- [ ] **Flow 2: Đặt lịch & Quản lý Lịch biểu Lớp học (Class Booking & Schedule Management):**
  - Quản lý danh mục lớp học, bộ môn, phòng tập (Studio/Phòng gym) và sức chứa (Capacity).
  - Lập lịch lớp học định kỳ và phân công HLV phụ trách (kiểm tra xung đột lịch).
  - Hội viên tự đặt chỗ (Booking) và hủy đặt chỗ (Cancellation) theo chính sách hủy.
  - Lễ tân thao tác đặt chỗ/hủy chỗ hộ hội viên qua điện thoại hoặc tại quầy.
  - Lịch cá nhân hóa (Personal Calendar) hiển thị đồng bộ cho cả Member và Coach.
- [ ] **Flow 3: Thanh toán & Báo cáo Doanh thu (Payment & Report Management):**
  - Xử lý thanh toán tại quầy (Tiền mặt, Chuyển khoản, Thẻ qua POS).
  - Thanh toán trực tuyến và cơ chế tự động gia hạn gói cước định kỳ (Subscription Billing).
  - Tự động sinh và xuất hóa đơn điện tử / phiếu thu định dạng PDF gửi qua email.
  - Dashboard báo cáo trực quan cho Center Manager: Doanh thu theo thời gian, số lượng hội viên mới/tái tục, tỷ lệ lấp đầy lớp học.

#### B. Tính năng nâng cao / Tùy chọn (Flow 4, 5, 6 - Nice to Have / OPTIONAL)
- [ ] **Flow 4: Quản lý Tập luyện & Điểm danh (Training & Attendance Management):**
  - Check-in vào cổng tức thì tại quầy bằng mã QR hoặc mã định danh hội viên (kèm kiểm tra tính hợp lệ của thẻ).
  - HLV điểm danh học viên (Attendance Roll-call: Có mặt, Đi muộn, Vắng mặt) trong từng buổi học.
  - HLV soạn kế hoạch tập luyện (Workout Plan), giao bài tập về nhà (Homework) cho học viên.
  - Ghi nhận chỉ số thể chất (Cân nặng, Tỷ lệ mỡ, Chỉ số cơ) và nhận xét sau mỗi buổi tập.
  - Biểu đồ theo dõi tiến độ thể chất trực quan trên tài khoản Member.
- [ ] **Flow 5: Gợi ý bài tập bằng AI (AI Workout Recommendation):**
  - Động cơ AI phân tích mục tiêu (Giảm mỡ, Tăng cơ, Phục hồi), chỉ số BMI, lịch sử tập luyện và thể trạng để tự động sinh giáo án gợi ý cho HLV và Hội viên.
- [ ] **Flow 6: Trợ lý ảo AI tương tác (AI Assistant Chatbot):**
  - Chatbot tích hợp LLM hỗ trợ giải đáp 24/7 về kỹ thuật bài tập, chế độ dinh dưỡng cơ bản, lịch mở cửa lớp học và nội quy trung tâm.

---

### 1.4. Ngoài phạm vi (Out-of-Scope)
- **KHÔNG can thiệp trực tiếp phần cứng cổng xoay (Turnstile Gateway):** Hệ thống chỉ cung cấp giao diện/API quét mã QR check-in trên màn hình máy tính bảng/máy tính quầy lễ tân; không viết driver nhúng phần cứng cơ khí.
- **KHÔNG xây dựng sàn thương mại điện tử (E-commerce Marketplace):** Không làm tính năng bán lẻ đồ thể thao, thực phẩm bổ sung giao hàng tận nhà quy mô lớn.
- **KHÔNG chẩn đoán điều trị y khoa:** AI chỉ dừng ở mức khuyến nghị thể dục và dinh dưỡng đại chúng, có cảnh báo miễn trừ trách nhiệm y tế (Medical Disclaimer).

---

## 2. KIẾN TRÚC KỸ THUẬT & TECH STACK (SYSTEM ARCHITECTURE & TECH STACK)

### 2.1. Bảng phân công công nghệ (Technology Matrix)

| Tầng kiến trúc | Công nghệ chính | Thư viện & Công cụ hỗ trợ | Mục đích sử dụng |
|---|---|---|---|
| **Frontend (FE)** | **React.js** (Vite / TypeScript) | • **UI Component:** Tailwind CSS + Shadcn UI (hoặc Ant Design)<br>• **State & Data Fetching:** TanStack Query (React Query) + Axios / Zustand<br>• **Lịch & Biểu đồ:** FullCalendar (xếp lịch tập/dạy) + Recharts / Chart.js (báo cáo doanh thu, chỉ số thể chất)<br>• **Form & Validation:** React Hook Form + Zod<br>• **Icons:** Lucide React | Xây dựng Single Page Application (SPA) tốc độ cao, giao diện Dashboard quản trị và cổng tự phục vụ cho hội viên. |
| **Backend (BE)** | **C# (.NET 8 / ASP.NET Core Web API)** | • **Kiến trúc:** Clean Architecture (Domain, Application, Infrastructure, API)<br>• **ORM:** Entity Framework Core (Npgsql.EntityFrameworkCore.PostgreSQL)<br>• **Bảo mật:** Microsoft.AspNetCore.Authentication.JwtBearer (JWT RBAC)<br>• **Background Job:** Hangfire / Quartz.NET (hoặc IHostedService BackgroundService)<br>• **Validation & Mapping:** FluentValidation, AutoMapper / Mapster<br>• **API Docs:** Swashbuckle (Swagger UI) | Xử lý toàn bộ logic nghiệp vụ, quản lý phân quyền, xử lý tranh chấp đặt lịch (concurrency), background job quét hạn và cung cấp RESTful API cho React Client. |
| **Database & Cloud (DB)** | **Supabase** (Managed PostgreSQL) | • **RDBMS:** PostgreSQL (trên nền tảng đám mây Supabase)<br>• **Storage:** Supabase Storage (lưu ảnh đại diện, ảnh phòng tập, PDF hóa đơn)<br>• **Connection:** Chuỗi kết nối PostgreSQL (Direct/Transaction Pooler qua cổng 5432/6543) | Lưu trữ quan hệ ACID, hỗ trợ tính năng Transaction khóa bản ghi khi booking, lưu trữ file tĩnh trên Cloud S3-compatible của Supabase. |
| **AI Integration** | **OpenAI API / Google Gemini API** | • **SDK:** Semantic Kernel hoặc HttpClient tiêu chuẩn<br>• **Format:** Structured JSON Output | Phục vụ Flow 5 (Gợi ý giáo án tập luyện theo mục tiêu/BMI) và Flow 6 (Chatbot hỏi đáp lịch học, dinh dưỡng, nội quy trung tâm). |
| **Thanh toán (Payment)** | **Cổng thanh toán trực tuyến** | • **Payment Gateway:** PayOS / VNPay / MoMo Sandbox SDK | Xử lý thanh toán tại quầy qua mã VietQR động hoặc thanh toán trực tuyến cho hội viên tự mua gói cước. |

---

### 2.2. Sơ đồ luồng kết nối kiến trúc (Architectural Diagram)

```text
       [ Web Browser / Client Devices ]
         (React.js + Tailwind + FullCalendar)
                      │
                      │ HTTPS (RESTful API, JSON, JWT Bearer)
                      ▼
    ┌────────────────────────────────────────────────────────┐
    │          C# ASP.NET Core Web API (Backend)             │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │ 1. API Layer (Controllers, Middlewares, Filters) │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ 2. Application Layer (Services, DTOs, CQRS)      │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ 3. Domain Layer (Entities, Enums, Exceptions)    │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ 4. Infrastructure Layer                          │  │
    │  │    • EF Core (Npgsql Driver)                     │  │
    │  │    • Hangfire / BackgroundService (Cron Jobs)    │  │
    │  │    • PayOS / VNPay Service                       │  │
    │  │    • AI Service (Gemini / OpenAI Client)         │  │
    │  └──────────────────────────────────────────────────┘  │
    └──────────────┬──────────────────┬──────────────┬───────┘
                   │                  │              │
       PostgreSQL  │     S3 API /     │   REST API   │   HTTPS
       Connection  │     REST         │              │
                   ▼                  ▼              ▼
           ┌──────────────┐    ┌──────────────┐ ┌──────────────┐
           │   SUPABASE   │    │   SUPABASE   │ │  PAYMENT &   │
           │  PostgreSQL  │    │ Cloud Storage│ │  AI SERVICES │
           │   Database   │    │(Avatars/PDFs)│ │(PayOS/Gemini)│
           └──────────────┘    └──────────────┘ └──────────────┘