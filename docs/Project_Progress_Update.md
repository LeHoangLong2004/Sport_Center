# SmartGym - Báo Cáo Tiến Độ Dự Án (Project Progress Update)

**Ngày cập nhật:** 15/10/2026
**Người phụ trách:** Phương, Long, Nam, Thuận

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

### 1.12. Quản Lý Bộ Môn & Phòng Tập & Tích Hợp Cloudinary CDN (Task 55) - **HOÀN THÀNH**
- **CRUD Danh mục Thể thao & Cơ sở tập luyện**: Xây dựng toàn diện các API và giao diện quản lý Bộ môn (`SportModel`) và Phòng tập (`FacilityModel`), kiểm tra toàn vẹn dữ liệu (không cho phép xóa môn/phòng khi đang có lớp học gắn kết).
- **Lưu trữ ảnh Cloudinary & Fallback Cục bộ**: Xây dựng dịch vụ `IPhotoService` và `CloudinaryPhotoService`, tự động upload lên CDN đám mây của Cloudinary, đồng thời có cơ chế fallback lưu trữ an toàn vào thư mục tĩnh `wwwroot/uploads` khi ngoại tuyến.
- **Tách module giao diện Facilities**: Phân chia `FacilitiesPage.tsx` thành `FacilitiesCards.tsx` và `FacilitiesModals.tsx` để bảo đảm chuẩn code dưới 200 dòng.

### 1.13. Hoàn Thiện Luồng Mua Gói Tập & Thanh Toán Sản Phẩm (Task 57, Task 9, Task 31) - **HOÀN THÀNH**
- **Chuẩn hóa 4 bước Checkout mua gói tập**: Loại bỏ màn hình OTP giả định; đồng bộ thông tin hội viên thực tế từ `localStorage` và tổng tiền thanh toán theo chu kỳ thời gian.
- **Khôi phục Giỏ hàng & Thanh toán Đơn hàng (`ProductPaymentFlow.tsx`)**: Đấu nối luồng mua sản phẩm tại Member Portal với quy trình thanh toán trực tiếp hoặc qua cổng VNPay Sandbox, tự động cập nhật trạng thái đơn sang `paid`/`pending` và hiển thị chi tiết hóa đơn.

### 1.14. Tái Cấu Trúc Backend & Rút Gọn Program.cs (<50 Dòng) (Task 56, Task 58) - **HOÀN THÀNH**
- **Rút gọn triệt để `Program.cs`**: Đưa file khởi động hệ thống từ **282 dòng xuống chỉ còn 33 dòng** (giảm 88%), loại bỏ triệt để đoạn khai báo CORS trùng lặp 2 lần.
- **Module hóa các Extension Methods**:
  - `ServiceCollectionExtensions.cs`: Quản lý DbContext, Supabase Client, toàn bộ Repositories, Services, In-memory Stores, VnPay/SMTP options và QuestPDF.
  - `AuthenticationExtensions.cs`: Quản lý cấu hình JWT Bearer và chính sách CORS `AllowAll`.
  - `SwaggerExtensions.cs`: Quản lý cấu hình tài liệu API và tích hợp Bearer Token UI.
  - `EndpointRouteExtensions.cs`: Gom các nhóm route API tập trung (`MapSmartGymEndpoints`).

### 1.15. Khắc Phục Lỗi Tải Ảnh & Chuẩn Hóa FormData / Static Files (Task 59) - **HOÀN THÀNH**
- **Sửa lỗi gửi SyntheticEvent `e` thay vì `File`**: Khắc phục lỗi truyền tham số `file: File` trong `FacilitiesPage.tsx` khiến FormData gửi payload rỗng 150 bytes (`[object Object]`), gây lỗi HTTP 400 Bad Request.
- **Gia cố Minimal API `/api/upload/image`**: Đọc file an toàn qua `HttpRequest request`, bổ sung validation MIME type ảnh (`image/*`) và giới hạn kích thước 10MB.
- **Tự động khởi tạo thư mục tĩnh**: Tự động kiểm tra và tạo thư mục `wwwroot/uploads/sports` và `wwwroot/uploads/avatars` ngay khi ứng dụng khởi động để middleware `app.UseStaticFiles()` luôn phục vụ được ảnh tĩnh.

### 1.16. Chuẩn Hóa Luồng Thanh Toán Tại Quầy & Hợp Nhất 3 Loại Đơn (Task 65 - 68) - **HOÀN THÀNH**
- **Sửa triệt để logic thanh toán tại quầy của Hội viên (Task 65)**: Khi chọn "Thanh toán tại quầy lễ tân", hệ thống chuyển thành trạng thái giữ chỗ (`⏳ Giữ chỗ · Chờ thanh toán tại quầy` / `pending`) thay vì báo thanh toán thành công ngay lập tức.
- **Hợp nhất đầy đủ 3 loại đơn cho Lễ tân (Task 65)**: Gói thành viên (`membership`), Gói tập thể thao (`sport`), và Vé đặt lớp học (`class`).
- **Tối ưu Backend API `GetOrdersAsync`, `ConfirmPaymentAsync` & `CancelOrderAsync` (Task 65)**: Hợp nhất dữ liệu giữa `subscriptions` và `class_bookings`, loại bỏ bộ lọc sai `subscription_id IS NULL`, bổ sung `COALESCE` chống lỗi ánh xạ NULL trong EF Core.
- **Màn hình Lễ tân thời gian thực (Task 65)**: Tách `CounterPaymentsPage.tsx` có bộ lọc 3 loại đơn, nhãn vé lớp học, nút "Thu tiền & Vào lớp" và đồng bộ `BroadcastChannel` tức thì.
- **Đồng hồ số và ca trực thời gian thực Lễ tân (Task 66)**: Lập trình đồng hồ số đếm giây và logic tự động phân bổ ca trực (Ca Sáng: 06:00 - 14:00, Ca Chiều: 14:00 - 22:00) hiển thị trực tiếp trên TopBar Lễ tân.
- **Khắc phục sạch 100% lỗi đỏ TypeScript Frontend (Task 67)**: Rà soát và sửa sạch toàn bộ cảnh báo và lỗi đỏ TypeScript (`tsc --noEmit` đạt 0 lỗi), xử lý các điểm null-check `profile.id`, kiểu dữ liệu `PackageCategory`, `durationMonths`.
- **Chuẩn hóa tệp cấu hình `.gitignore` (Task 68)**: Chuẩn hóa file `.gitignore`, loại trừ thư mục cache của .NET CLI (`.dotnet*`, `.dotnet_temp/`) và các file tạm của IDE.

### 1.17. Tự Động Khởi Tạo Hội Thoại Với HLV Khi Đăng Ký Lớp (Task 69) - **HOÀN THÀNH**
- **Loại bỏ trạng thái trống (Empty State) & Tìm kiếm thủ công**: Tự động tạo phòng trò chuyện trực tiếp 1-1 giữa Hội viên và Huấn luyện viên phụ trách lớp học ngay thời điểm hội viên hoàn tất đăng ký lớp nhóm hoặc đặt lịch PT 1-1.
- **Tự động gửi tin nhắn chào mừng & xác nhận buổi học**: Khởi tạo ngay tin nhắn mở đầu từ HLV thông báo thông tin lớp, ca học, lời chào mừng và sẵn sàng giải đáp thắc mắc về trang phục, dụng cụ, thể lực.
- **Backend `ChatStoreService.cs` đồng bộ thông minh**: Bổ sung cơ chế `EnsureMemberBookedCoachConversations` tự động quét các lớp học đã đặt của hội viên và bảo đảm tất cả HLV phụ trách đều có sẵn trong danh sách hội thoại của hội viên mà không cần thao tác thêm thủ công.

---

## 2. Các Công Việc Đang Thực Hiện (In Progress)
1. **Hoàn thiện đồng bộ sĩ số điểm danh lớp học (Task 18)**: Chuẩn hóa mapping sĩ số giữa API danh sách lớp và danh sách học viên điểm danh thực tế của Coach.
2. **Tối ưu hiển thị lưới lịch tuần (Task 23)**: Hoàn thiện tính năng phát hiện ca học trùng giờ và điều chỉnh độ cao khung giờ linh hoạt.
3. **Chuyển đổi hoàn toàn Coach Endpoints sang Database Supabase (Task 28)**: Thay thế hoàn toàn dữ liệu in-memory sang các bảng quan hệ trên PostgreSQL.

## 3. Các Bước Tiếp Theo (Next Steps)
1. **Kiểm thử tích hợp chéo (End-to-End Testing)**: Thực hiện kiểm thử toàn bộ luồng từ Lễ tân bán gói -> Hội viên đặt lớp -> HLV điểm danh -> Xuất hóa đơn PDF.
2. **Rà soát & tối ưu hóa các trang Frontend lớn**: Tiếp tục phân tách các view lớn (>400 dòng) ở Member Portal thành các sub-components gọn gàng.
3. **Chuẩn bị kịch bản Demo & Báo cáo đồ án SWP391**: Lắp ráp dữ liệu mẫu phong phú cho 10 bộ môn thể thao và các gói thành viên VIP.

---
*Ghi chú: Toàn bộ bảng phân công nhân sự và tiến độ chi tiết từng màn hình/tính năng đã được cập nhật đồng bộ trong file `docs/Project_Tracking.md`.*

