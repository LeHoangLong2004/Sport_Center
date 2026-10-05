# SmartGym - Báo Cáo Tiến Độ Dự Án (Project Progress Update)

**Ngày cập nhật:** 05/10/2026
**Người phụ trách:** Phương

---

## 1. Các Công Việc Đã Hoàn Thành
Đến thời điểm hiện tại, dự án đã thiết lập thành công nền tảng Backend vững chắc với các công nghệ .NET 10, Entity Framework Core và Supabase (PostgreSQL). Đã hoàn thành các luồng nghiệp vụ cơ bản:

### 1.1. Kiến Trúc & Cấu Hình Cơ Sở
- Khởi tạo kiến trúc **Clean Architecture** gồm các layer: `Domain`, `Application`, `Infrastructure`, và `Api`.
- Tích hợp và cấu hình thành công chuỗi kết nối **Supabase PostgreSQL**.

### 1.2. Tính Năng Xác Thực & Phân Quyền (Auth & RBAC) - **HOÀN THÀNH**
- Đã áp dụng chuẩn **JWT Bearer Authentication** của Microsoft (`Microsoft.AspNetCore.Authentication.JwtBearer`).
- Hoàn thiện tính năng Đăng nhập/Đăng ký và sinh mã Token hợp lệ.
- Áp dụng **Role-Based Access Control (RBAC)** cho các API, giới hạn quyền truy cập chặt chẽ (VD: API hệ thống chỉ dành cho `manager`).
- Khắc phục thành công các lỗi về cấu hình Swagger cho phép dán Token không cần tiếp đầu ngữ.

### 1.3. Luồng Quản Lý Tài Khoản (Task 2) - **HOÀN THÀNH**
- Đã xây dựng hoàn thiện các Endpoint CRUD cho Người dùng (Users).
- Triển khai chức năng khóa/mở khóa tài khoản (Status) và thay đổi chức vụ (Role).

### 1.4. Luồng Quản Lý Gói Tập & Mua Gói (Task 3 & 4) - **HOÀN THÀNH**
- Xây dựng Entity và API quản lý danh sách Gói tập (`Packages`) và các quyền lợi đi kèm (`Features`, `Benefits`).
- Triển khai luồng Mua Gói / Đăng ký Hội viên (`Subscriptions`), bao gồm tính toán giá tiền (tháng/năm) và ngày hết hạn.

### 1.5. Cập nhật Giao Diện Quản Trị (Admin Dashboard) - Frontend - **HOÀN THÀNH**
- Đã rà soát và loại bỏ toàn bộ dữ liệu cứng (mock data) và số liệu KPI tĩnh trên các trang quản trị (Overview, Members, Payment, Payroll, Budget, Expenses, Reports, Schedule).
- Thay thế các số liệu cố định bằng dấu `--` và làm sạch các mảng dữ liệu để chuẩn bị cho việc tích hợp gọi API từ Backend.

### 1.6. Tích hợp API Quản lý Người dùng & Gói tập (Flow 1 Frontend) - **HOÀN THÀNH**
- Bổ sung chức năng "Tạo gói mới" và "Xóa/Khóa gói" vào trang **PackagesPage**.
- Bổ sung nút Khóa / Mở khóa nhanh tài khoản trên trang **MembersPage**.
- Đấu nối trang **MemberEditPage** để tự động map thông tin chi tiết (Tên, Email, SĐT, Role) từ API thay vì dùng dữ liệu cứng giả định. (Các trường dữ liệu chưa có trong thiết kế DB hiện tại như chiều cao, cân nặng... đã được reset về rỗng).
- Tích hợp thêm trường Vai trò (`RoleName`) vào Component `Registration.tsx` để hỗ trợ tạo user có phân quyền.

### 1.7. Cập nhật Dữ liệu Động & Tối ưu UX các Portal - **HOÀN THÀNH**
- Gỡ bỏ hoàn toàn dữ liệu cứng (tên, chức vụ, avatar) trên thanh Sidebar và TopBar của tất cả các portal (Receptionist, Coach, Member, Admin).
- Đồng bộ thông tin người dùng được trích xuất trực tiếp từ phiên đăng nhập (dữ liệu lưu trong `localStorage`).
- Xây dựng component `UserAvatar` để tạo ảnh đại diện mặc định (có màu nền và chữ cái đầu của tên) khi tài khoản chưa có ảnh tải lên, tương tự giao diện Gmail.
- Cải thiện luồng thao tác (UX) ở **Coach Portal**: Tách biệt trang xem hồ sơ tĩnh và trang chỉnh sửa thông tin. Giờ đây, người dùng nhấp vào avatar ở sidebar để chuyển hướng mượt mà đến trang cài đặt hồ sơ.
- **Admin Dashboard (Center Manager)**: Điều chỉnh lại giao diện Sidebar theo đúng thiết kế, cập nhật màu chủ đạo (Rose), tinh gọn menu (xóa các tab không cần thiết như Lịch & phân công, Phân quyền, v.v.) và custom icon SVG cho mục "Bộ môn & phòng tập".

---

## 2. Các Công Việc Đang Thực Hiện (In Progress)
- Tiếp tục rà soát các thao tác API khác cho Flow 1 (Ví dụ: Chỉnh sửa thông tin, đổi ảnh đại diện...) hoặc chuẩn bị mở rộng sang Flow 2.

---

## 3. Các Bước Tiếp Theo (Next Steps)
Căn cứ theo PRD (Hồ sơ yêu cầu dự án), các bước tiếp theo sẽ tiến hành:
1. **Flow 2 - Class Booking & Schedule Management:** Bắt đầu xây dựng API Quản lý lớp học (`classes`), bộ môn (`sports`), và chức năng đặt chỗ/hủy chỗ (`class_bookings`).
2. **Thiết lập Middleware Xử Lý Lỗi (Global Exception Handling):** Bắt và trả về các lỗi JSON chuẩn thay vì log thô để Frontend dễ dàng bắt lỗi.
3. **Thanh toán trực tuyến:** Tích hợp với dịch vụ Payment Gateway (VNPay / PayOS) để hoàn tất trạng thái thanh toán (PaymentStatus) thay vì chỉ gán là `pending`.

---
*Ghi chú: File `Project_Tracking.md` cũng đã được cập nhật trạng thái "Done" cho Task 1, 2, 3 và 4.*
