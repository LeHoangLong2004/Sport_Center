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

### 1.8. Luồng Quản Lý Lớp Học, Đặt Chỗ, Hủy Lớp & Lịch Tập (Flow 2 Backend) - **HOÀN THÀNH**
- **Tạo Buổi Học Nhóm (`POST /api/classes`)**: Kiểm tra quyền Manager, tự động rà soát trùng lịch dạy lớp học nhóm và lịch tập cá nhân PT của Huấn luyện viên, kiểm tra sức chứa `capacity > 0` và thời gian diễn ra trong tương lai.
- **Xem Danh Sách Lớp Khả Dụng (`GET /api/classes/available`)**: Truy vấn các lớp đang hoạt động (`status = true`), chưa diễn ra, tự động tính số chỗ còn trống (`capacity - current_enrolled`) và trả về chi tiết tên Bộ môn, Cơ sở, HLV.
- **Member Đặt Chỗ Lớp Học (`POST /api/classes/{id}/book`)**: Kiểm tra quyền Member, xác minh gói tập (`subscription`) hợp lệ (còn hạn tại thời điểm học, đúng bộ môn, đã thanh toán `completed`), kiểm tra trùng lịch cá nhân. Áp dụng **SQL Transaction nguyên tử** để cập nhật số chỗ, tạo bản ghi đặt chỗ và gửi thông báo hệ thống tự động.
- **Lễ Tân Đặt Hộ Lớp Học (`POST /api/classes/{id}/book-for-member`)**: Cho phép Lễ tân / Manager đăng ký lớp học hộ cho Hội viên theo mã `memberId` với đầy đủ quy trình kiểm tra điều kiện gói tập và trùng lịch.
- **Hủy Đăng Ký Lớp (`POST /api/classes/{id}/cancel-booking`)**: Kiểm tra điều kiện hủy chỗ (trước giờ học tối thiểu 2 tiếng), chạy SQL Transaction nguyên tử chuyển trạng thái booking sang `cancelled`, hoàn trả chỗ trống (`current_enrolled - 1`) và gửi thông báo xác nhận cho hội viên.
- **Cập Nhật Thông Tin Lớp Học (`PUT /api/classes/{id}`)**: Cho phép Manager/Admin chỉnh sửa chi tiết lớp học, tự động rà soát lại trùng lịch HLV nếu có thay đổi thời gian/HLV và gửi thông báo cập nhật tới toàn bộ hội viên đã đặt.
- **Hủy Buổi Học Nhóm (`POST /api/classes/{id}/cancel`)**: Cho phép Manager/Admin đóng lớp học (`status = false`), tự động chuyển toàn bộ booking của học viên sang `class_cancelled` và gửi thông báo đồng loạt cho tất cả Hội viên đã đặt chỗ + HLV phụ trách.
- **Điểm Danh Học Viên Theo Lớp (`POST /api/classes/{id}/attendance`)**: Cho phép HLV / Lễ tân cập nhật danh sách điểm danh cho từng học viên trong lớp thành `attended` (Có mặt) hoặc `no_show` (Vắng mặt).
- **Xem Lịch Theo Vai Trò Người Dùng (`GET /api/schedule/member`, `GET /api/schedule/coach`, `GET /api/schedule/manager`)**:
  - *Member*: Xem toàn bộ các buổi học nhóm đã đặt kèm các buổi tập cá nhân PT.
  - *HLV*: Xem danh sách các lớp dạy phụ trách kèm danh sách chi tiết học viên đăng ký trong từng lớp.
  - *Manager*: Xem toàn bộ lịch lớp học trên hệ thống kèm bộ lọc linh hoạt theo Cơ sở, HLV, Bộ môn, Ngày.

### 1.9. Lọc Huấn Luyện Viên Theo Chuyên Môn & Seed Data HLV (Backend & Frontend) - **HOÀN THÀNH**
- **API Lọc HLV Theo Bộ Môn (`GET /api/coaches?sportId=...`)**: Xây dựng endpoint hỗ trợ lọc danh sách HLV thông qua truy vấn SQL JOIN bảng `coaches`, `users` và bảng trung gian `coach_sports`, chỉ trả về những HLV có chuyên môn về bộ môn được chọn.
- **Seed Data Supabase (`coach_sports`)**: Bổ sung các bản ghi liên kết giữa danh sách HLV hiện có (Coach Nguyễn Văn A, Coach Trần Thị B, Phạm Văn C...) với các bộ môn chuyên môn (Bóng đá, Cầu lông, Yoga, Gym, Bơi lội...) trên hệ thống cơ sở dữ liệu Supabase.
- **Dynamic Dropdown Modal Tạo Lớp (`CreateClassModal.tsx`)**: Đấu nối sự kiện thay đổi bộ môn (`sportId`), tự động gọi API lọc danh sách HLV tương ứng và tự động reset lựa chọn HLV khi bộ môn thay đổi để tránh gán nhầm HLV không có chuyên môn.

### 1.10. Tối Ưu Giao Diện Lịch Trình Lớp Học (Schedule Timetable UI) - **HOÀN THÀNH**
- **Khắc Phục Đè / Dính Card Lớp Học (`SchedulePage.tsx`)**: Tối ưu lại công thức tính toán tọa độ `top` và chiều cao `height` của các card lớp học dựa trên khung giờ học thực tế (tỉ lệ chuẩn 6rem/giờ).
- **Giao Diện Gọn Gàng & Đường Lằn Ranh Khung Giờ**: Điều chỉnh chiều cao mỗi hàng ô lịch (`h-24`), bổ sung các đường kẻ nét đứt (dashed border) đánh dấu mốc 30 phút, giúp các card lớp học hiển thị gọn gàng, chuẩn xác vị trí theo thời gian mà không bị kéo dài trang gây mất thẩm mỹ.

---

### 1.11. Nâng cấp Hồ Sơ Năng Lực HLV (Coach Profile) & Cập nhật Cài Đặt Tài Khoản Đa Nền Tảng - **HOÀN THÀNH**
- **Mở rộng Cơ sở dữ liệu (Backend)**: Tự động khởi tạo bảng `coach_profiles` thông qua EF Core Raw SQL tại `Program.cs` để lưu trữ chuyên biệt các thông tin của Huấn luyện viên như `specialties` (Chuyên môn), `certifications` (Bằng cấp), `experience_years` (Năm kinh nghiệm) và `bio` (Giới thiệu bản thân).
- **Cập nhật DTO & UserService**: Ánh xạ (mapping) thành công các trường dữ liệu mới của HLV vào `UserResponse` và xử lý logic lưu trữ trực tiếp trong `UpdateUserProfileAsync`.
- **Tái cấu trúc UI & Cập nhật API (Frontend)**:
  - Nâng cấp Component dùng chung `ProfileSettings.tsx`, tự động hiển thị thêm khu vực "Hồ sơ năng lực" nếu tài khoản đang đăng nhập là HLV. Đảm bảo form hiển thị mượt mà và trực quan.
  - Phủ sóng tính năng cập nhật hồ sơ cá nhân (`PUT /api/users/{id}/profile`) lên **tất cả** các Portal: `MemberProfile`, `CoachSettings`, `AdminDashboard` và `ReceptionistPortal`. Tất cả các vai trò hiện đã có thể tự thay đổi thông tin cá nhân và lưu thẳng vào hệ thống theo thời gian thực (real-time).

---

## 2. Các Công Việc Đang Thực Hiện (In Progress)

## 3. Các Bước Tiếp Theo (Next Steps)
Căn cứ theo PRD (Hồ sơ yêu cầu dự án), các bước tiếp theo sẽ tiến hành:
1. **Flow 3 & Flow 4 - Quản Lý Tập PT & Điểm Danh Cổng / Check-in:** Xây dựng API Đăng ký tập với HLV cá nhân (PT) và tích hợp luồng điểm danh cổng.
2. **Thiết lập Middleware Xử Lý Lỗi (Global Exception Handling):** Bắt và trả về các lỗi JSON chuẩn thay vì log thô để Frontend dễ dàng bắt lỗi.
3. **Thanh toán trực tuyến:** Tích hợp với dịch vụ Payment Gateway (VNPay / PayOS) để hoàn tất trạng thái thanh toán (PaymentStatus) thay vì chỉ gán là `pending`.

---
*Ghi chú: File `Project_Tracking.md` cũng đã được cập nhật trạng thái "Done" cho các tính năng thuộc Flow 2.*

