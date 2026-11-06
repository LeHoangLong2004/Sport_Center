# SWP391 - CẨM NANG VẤN ĐÁP BẢO VỆ ĐỒ ÁN & BẢN ĐỒ LUỒNG CODE CHI TIẾT
> **Dự án:** Hệ thống Quản trị Trung tâm Thể thao Sport Center (SmartGym OS)  
> **Mục đích tài liệu:** Hướng dẫn chi tiết từng thành viên trong nhóm trả lời phỏng vấn của Giảng viên (Oral Defense), phân định rõ ràng **Luồng nào làm chung / Luồng nào làm riêng**, **Bảng Database nào ai làm**, nắm vững luồng chạy từ **Giao diện (UI) ➔ API Backend ➔ Database Tables** và các câu hỏi kỹ thuật hay bị "bắt bẻ".

---

## 🏛️ PHẦN 1: BỨC TRANH KIẾN TRÚC TỔNG THỂ (CẢ NHÓM PHẢI NẮM RÕ)

Khi Giảng viên hỏi: *"Hệ thống của các em kiến trúc như thế nào? Chạy bằng công nghệ gì?"* -> Bất kỳ ai cũng trả lời theo cấu trúc:
* **Kiến trúc:** **Clean Architecture** phân tầng độc lập (Domain ➔ Application ➔ Infrastructure ➔ Api) kết hợp **Minimal API** trên nền .NET 10 (C#) tối ưu hiệu năng.
* **Database:** **Supabase PostgreSQL** gồm **29 bảng quan hệ** với khóa ngoại (FK), Indexing và Atomic SQL Transactions.
* **Frontend:** **React 19 + TypeScript + Tailwind CSS** chạy trên nền **Vite 8.3**. Sử dụng SPA với cơ chế **Two-Way URL Hash Routing** (`#dashboard/*`, `#receptionist/*`, `#coach/*`, `#member/*`) giúp đồng bộ thanh địa chỉ mà không reload trang.
* **4 Cổng phân quyền (4 Roles):**
  1. **Manager (Admin Portal):** Quản trị vận hành, nhân sự, gói tập, cơ sở vật chất, doanh thu & báo cáo tài chính.
  2. **Receptionist (Lễ tân):** Bán gói tại quầy, check-in mã QR thẻ hội viên, đặt lịch hẹn PT 1-1, thu tiền vé lớp học.
  3. **Coach (Huấn luyện viên):** Quản lý ca dạy, điểm danh lớp học, duyệt học viên, mở slot PT, dùng AI tạo giáo án.
  4. **Member (Hội viên):** Đặt lớp học nhóm, đăng ký slot PT, nạp tiền ví, thanh toán VietQR/VNPay, tập luyện theo bài tập.
* **Bảo mật & Trí tuệ nhân tạo:**
  - Xác thực qua **JWT Bearer Token** kết hợp mã hóa mật khẩu **BCrypt**.
  - **AI Workout Recommendation (Flow 5):** Tích hợp **Google Gemini 1.5 Flash** thông qua Backend Proxy bảo mật, không lộ API Key ở Frontend.

---

## 🤝 PHẦN 2: BẢN ĐỒ TỔNG HỢP TẤT CẢ CÁC LUỒNG NGHIỆP VỤ (LÀM CHUNG vs LÀM RIÊNG CHI TIẾT)

> 💡 **KỊCH BẢN TRẢ LỜI KHI GIẢNG VIÊN HỎI VỀ LUỒNG CỦA DỰ ÁN:**  
> Giảng viên hỏi: *"Luồng này ai làm? Các em làm chung cái gì và làm riêng cái gì?"*  
> 👉 **Kịch bản trả lời chung:**  
> *"Dạ thưa Thầy/Cô, toàn bộ quy trình nghiệp vụ và thiết kế kiến trúc/CSDL của hệ thống là do **cả nhóm cùng ngồi họp thảo luận và thống nhất làm chung**. Sau khi chốt luồng, nhóm phân công tách bạch phần **Backend** (xây dựng Entity, Service, bảo mật JWT, Transaction) và phần **Frontend** (giao diện, hooks, validate form, responsive) cho từng bạn phụ trách để đảm bảo tiến độ và chuyên môn hóa."*

Dưới đây là bảng đối soát chi tiết **9 Luồng nghiệp vụ chính** trong toàn bộ hệ thống SmartGym OS:

| # | Tên luồng nghiệp vụ | Điểm CẢ NHÓM LÀM CHUNG | Điểm LÀM RIÊNG TỪNG THÀNH VIÊN (Ai làm file nào?) |
| :-: | :--- | :--- | :--- |
| **1** | **Xác thực & Quản lý Tài khoản (Auth & RBAC)** | • Thiết kế bảng `users`, `roles`.<br>• Quy ước 5 vai trò hệ thống.<br>• Quy chuẩn lưu JWT token & user info trong `localStorage`. | • **Phương (Backend):** Viết API Đăng ký, Đăng nhập, hash mật khẩu BCrypt, sinh JWT Bearer Token, middleware RBAC Policy `[Authorize(Roles = "...")]`, CRUD Users (`UserEndpoints.cs`).<br>• **Nam (Frontend):** Thiết kế Form Đăng ký/Đăng nhập, component `UserAvatar` tự sinh avatar theo chữ cái đầu, hook `useUserProfile`.<br>• **Long (Frontend):** Tích hợp bảng danh sách nhân viên/hội viên trên Admin (`MembersPage`, `StaffPage`), nút khóa/mở khóa tài khoản nhanh. |
| **2** | **Quản lý Gói tập & Đăng ký Hội viên (Packages & Subscriptions)** | • Thống nhất Mô hình 3: Gói môn độc lập (`sport`) + Gói nâng cấp hội viên (`membership` Plus/VIP).<br>• Thiết kế bảng `packages`, `package_sports`, `membership_benefits`, `subscriptions`. | • **Phương (Backend):** Viết Minimal API CRUD cho `packages`, tính toán hạn dùng và chiết khấu chu kỳ 1/6/12 tháng, API Subscriptions (`PackageEndpoints.cs`).<br>• **Long (Frontend):** Xây dựng giao diện `PackagesPage` trên Admin (Thêm/Sửa/Khóa gói, kiểm tra ràng buộc FK không xóa gói đang có người dùng).<br>• **Nam (Frontend):** Thiết kế gian hàng gói tập trên Member Portal (`MemberPackages.tsx`), thẻ quyền lợi VIP.<br>• **Thuận (Fullstack):** Xử lý kích hoạt `Subscription` khi hóa đơn thanh toán thành công. |
| **3** | **Quản lý Lớp học nhóm & Đặt chỗ (Group Classes & Booking)** | • Thống nhất quy trình đặt chỗ: Kiểm tra gói tập hợp lệ, kiểm tra sĩ số lớp (`capacity`), không cho đặt lớp quá khứ. | • **Long (Fullstack phụ trách chính):** Thiết kế bảng `classes`, `class_bookings`; viết `ClassService` áp dụng **Atomic SQL Transaction** trừ slot & tạo booking; thuật toán chống trùng giờ dạy của HLV; API đặt chỗ hộ cho Lễ tân (`book-for-member`).<br>• **Nam (Frontend):** Giao diện lưới lịch học tuần 7 ngày, bộ lọc môn thể thao trên `MemberBooking.tsx`, modal xem chi tiết lớp.<br>• **Phương (Backend):** Bổ sung SQL raw mapper các cột profile Coach (`specialty`, `bio`, `rating`) trong repository Supabase, bọc try-catch chống crash khi đặt lại lớp. |
| **4** | **Thanh toán Cổng Online & Chuyển khoản (VNPay & SePay VietQR Auto-Checkout)** | • Thiết kế bảng `invoices`, `invoice_items`.<br>• Thống nhất 3 trạng thái thanh toán (`pending`, `completed`, `failed`) và 3 phương thức (VietQR, VNPay, Cash). | • **Thuận (Fullstack phụ trách chính):** Tích hợp cổng VNPay Sandbox (thuật toán băm HMAC-SHA512), giao diện `OnePageCheckout.tsx`, `InvoiceScreen.tsx`, modal `SePayQrModal.tsx` sinh mã VietQR Napas 247, viết cơ chế polling 2s/lần tự động đối soát tiền về tài khoản.<br>• **Phương (Backend):** Triển khai endpoint nhận Webhook từ SePay (`POST /api/payments/sepay-webhook`), cấu hình ngrok tunnel port 5000, API đối soát `/api/payments/sepay-check-memo`.<br>• **Long (Frontend):** Giao diện thu tiền tại quầy `CounterPaymentsPage.tsx`. |
| **5** | **Gợi ý Giáo án bằng Trí tuệ nhân tạo (Flow 5 AI Coach Copilot)** | • Thống nhất giải pháp: **Dùng Google Gemini 1.5 Flash qua API Key**, không train model local.<br>• Thống nhất mô hình Backend Proxy bảo vệ an toàn API Key, không để lộ ở client.<br>• Thiết kế cấu trúc bài tập: Sets, Reps, Rest, Dinh dưỡng. | • **Phương (Backend phụ trách chính):** Xây dựng `Flow5WorkoutPlanEndpoints.cs`, `GeminiRecommendationProvider.cs`, `Flow5PromptBuilder.cs`, bộ bóc tách JSON bằng Regex (`Flow5RecommendationJsonParser.cs`), bộ giới hạn quota an toàn, unit tests `SmartGym.Tests`.<br>• **Nam (Frontend phụ trách chính):** Thiết kế toàn bộ giao diện làm việc `CoachAI.tsx` (tách 6 subcomponent: chọn học viên, form mục tiêu, bản nháp, review modal), hook `useCoachAi.ts`, `AbortController` timeout guard 20s chống đơ màn hình.<br>• **Long (Support):** Ánh xạ bảng `workout_plans` vào lịch dạy của Coach. |
| **6** | **Nghiệp vụ Quầy Lễ tân & Điểm danh tại cổng (Receptionist & Gate Check-in)** | • Thống nhất mã thẻ hội viên QR động (GMT+7) dùng để quét check-in ra vào cổng và liên kết với lịch sử điểm danh. | • **Long (Fullstack phụ trách chính):** Màn hình quét thẻ hội viên `CheckInPage.tsx`, kiểm tra hạn dùng gói tập; màn hình quản lý lịch hẹn PT 1-1 `SchedulePage.tsx` (và thư mục `schedule/`); tính toán ca trực Lễ tân thời gian thực trên TopBar.<br>• **Thuận (Frontend/Backend):** Xây dựng giao diện Điểm danh hội viên `MemberAttendance.tsx`, tạo mã QR động cá nhân, hiển thị lịch sử check-in và thống kê KPI buổi tập. |
| **7** | **Nghiệp vụ Huấn luyện viên (Coach Portal Operations)** | • Thống nhất bảng `coaches`, `pt_sessions`, `reviews`, `shift_requests`.<br>• Quy định quyền HLV: Xem lịch dạy, điểm danh lớp, tạo slot PT, đổi ca dạy. | • **Nam (Frontend phụ trách chính):** Toàn bộ giao diện `CoachDashboard`, `CoachMembers` (danh bạ học viên kèm thanh tiến độ lấp đầy sĩ số), `CoachReviews` (đánh giá sao và nhận xét), modal đổi ca dạy/báo vắng.<br>• **Phương (Backend):** Xây dựng `CoachEndpoints.DashboardSchedule.cs`, `CoachEndpoints.Members.cs`, query role và ánh xạ học viên theo `coach_id`.<br>• **Long (Fullstack):** Chuẩn hóa mapping sĩ số điểm danh thực tế (`sessionMembers.length`) giữa lịch dạy và danh sách học viên check-in. |
| **8** | **Trò chuyện & Đồng bộ thời gian thực (Real-time Chat & Sync)** | • Quy định kiến trúc giao tiếp thời gian thực giữa Hội viên ➔ Huấn luyện viên ➔ Lễ tân/BQL. | • **Nam (Frontend phụ trách chính):** Giao diện `MemberChat.tsx` (chia 4 subcomponent: Sidebar, ActiveArea, NewChatModal, chatDefaults), cơ chế tự động mở đoạn chat với HLV khi vừa đặt lớp thành công (`chat_target_coach`).<br>• **Phương (Backend):** Xây dựng `ChatStoreService.cs` thread-safe I/O, tự động tạo phòng chat và chèn tin nhắn hệ thống chào mừng ngay khi hội viên đăng ký lớp. |
| **9** | **Tái cấu trúc Codebase, Quản trị chất lượng & DevOps** | • Đặt ra quy chuẩn nghiêm ngặt toàn dự án: **Mọi file view, modal và endpoint không được vượt quá 200–250 dòng**.<br>• Cả nhóm đồng lòng kiểm thử hồi quy toàn diện hệ thống sau khi chia nhỏ file. | • **Phương (Backend & DevOps):** Rút gọn `Program.cs` từ 282 xuống 33 dòng, tách Extension methods, sửa xung đột Swagger, chuẩn hóa `.gitignore` loại bỏ file rác.<br>• **Nam (Frontend Lead):** Phân tách `MemberBooking` (2,044 -> 380 dòng), `MemberChat` (943 -> 226 dòng), `CoachMembers` (423 -> 139 dòng), `MemberPackages`, `MemberSchedule`.<br>• **Long (Frontend):** Phân tách `FacilitiesPage`, `SchedulePage` Lễ tân thành thư mục `schedule/` và `appointmentModal/`.<br>• **Phương & Nam (Chung sức):** Cùng truy vết và sửa dứt điểm lỗi build Vite (UNRESOLVED_IMPORT `apiClient` lùi sai 4 cấp thư mục trong `PaymentFormFields.tsx`), đưa `npx tsc --noEmit` về 0 lỗi. |

---

## 🗄️ PHẦN 3: BẢN ĐỒ PHÂN CHIA BẢNG DATABASE (AI LÀM GÌ & BẢNG NÀO LÀM CHUNG)

> 💡 **LỜI KHUYÊN KHI GIẢNG VIÊN HỎI VỀ DATABASE:**  
> Giảng viên hỏi: *"Mấy cái bảng này ai làm? Bảng nào làm chung?"*  
> 👉 **Kịch bản trả lời chung:**  
> *"Dạ thưa Thầy/Cô, ở giai đoạn đầu, **toàn bộ nhóm em cùng ngồi lại làm chung phần thiết kế ERD tổng thể**, thống nhất các thực thể cốt lõi (`roles`, `users`, `facilities`, `sports`) và chuẩn hóa quan hệ 3NF. Sau đó, nhóm chia ra từng phân hệ nghiệp vụ cụ thể để mỗi thành viên phụ trách chính việc tạo bảng, viết Migration, Entity C# và các Endpoint CRUD tương ứng."*

### 📊 Bảng tổng hợp phân công 29 bảng Database:

| Nhóm bảng | Tên bảng (Table Name) | Người phụ trách chính | Trách nhiệm & Mô tả chi tiết |
| :--- | :--- | :---: | :--- |
| **LÀM CHUNG (Core)** | `roles` | **Cả nhóm làm chung** | 5 vai trò hệ thống: `admin`, `manager`, `coach`, `receptionist`, `member`. |
| **LÀM CHUNG (Core)** | `users` | **Cả nhóm làm chung** | Bảng người dùng dùng chung cho cả 4 cổng. Phương làm backend hash BCrypt & JWT, Nam làm Avatar & Profile UI, Long & Thuận dùng để liên kết check-in/hóa đơn. |
| **LÀM CHUNG (Core)** | `facilities` | **Cả nhóm làm chung** | Danh sách chi nhánh/cơ sở tập luyện (Long làm CRUD Admin, các bạn khác map vào lịch/gói). |
| **LÀM CHUNG (Core)** | `sports` | **Cả nhóm làm chung** | Danh mục bộ môn (Bơi lội, Yoga, Boxing, Fitness...). |
| **LÀM CHUNG (Core)** | `notifications` | **Cả nhóm làm chung** | Bảng thông báo hệ thống và tin nhắn chuông báo cho các portal. |
| **LÀM CHUNG (Core)** | `vouchers` | **Cả nhóm làm chung** | Mã giảm giá dùng khi mua gói hoặc thuê PT. |
| **PHƯƠNG** | `packages` | **Phương** | Danh mục gói cước chính (phân loại `sport` và `membership`). |
| **PHƯƠNG** | `package_features` | **Phương** | Các gạch đầu dòng tính năng hiển thị trang định giá. |
| **PHƯƠNG** | `package_sports` | **Phương** | Bảng trung gian nhiều-nhiều: gói môn cho phép tập những môn nào. |
| **PHƯƠNG** | `membership_benefits`| **Phương** | Quyền lợi gói nâng cấp VIP/Plus (giảm % PT, ưu tiên đặt lớp, tủ đồ). |
| **PHƯƠNG** | `subscriptions` | **Phương** | Bản ghi hợp đồng hội viên, tính hạn dùng (`start_date`, `end_date`), trạng thái kích hoạt. |
| **THUẬN** | `invoices` | **Thuận** | Hóa đơn trung tâm lưu trữ toàn bộ giao dịch thanh toán. |
| **THUẬN** | `invoice_items` | **Thuận** | Chi tiết các mặt hàng trong hóa đơn. |
| **THUẬN** | `products` | **Thuận** | Danh mục sản phẩm bán lẻ (nước uống, phụ kiện, thực phẩm chức năng). |
| **THUẬN** | `pt_packages` | **Thuận** | Các gói tập PT theo số buổi (5 buổi, 10 buổi...). |
| **THUẬN** | `pt_enrollments` | **Thuận** | Hợp đồng mua gói PT của hội viên, tính số buổi đã dùng (`used_sessions`). |
| **LONG** | `classes` | **Long** | Lịch các lớp học nhóm Group-X (giờ học, phòng tập, HLV, `capacity`, `current_enrolled`). |
| **LONG** | `class_bookings` | **Long** | Bản ghi đặt chỗ lớp học của hội viên, quản lý cờ trạng thái (`confirmed`, `cancelled`, `attended`). |
| **LONG** | `check_in_logs` | **Long** | Nhật ký quẹt thẻ / quét mã QR ra vào cổng trung tâm. |
| **LONG** | `coach_sports` | **Long** | Bảng liên kết nhiều-nhiều giữa HLV và các bộ môn có thể đứng lớp. |
| **LONG** | `shift_requests` | **Long** | Đơn xin đổi ca dạy hoặc báo vắng của HLV gửi Quản lý duyệt. |
| **NAM** | `coaches` | **Nam** | Hồ sơ năng lực HLV (tiểu sử, số năm kinh nghiệm, đánh giá sao, `rating`). |
| **NAM** | `pt_sessions` | **Nam** | Từng ca dạy 1-on-1 cụ thể giữa Coach và Member. |
| **NAM** | `reviews` | **Nam** | Đánh giá sao (1-5) và nhận xét của hội viên sau ca tập. |
| **NAM** | `workout_plans` | **Nam** | Kế hoạch tập luyện / giáo án (gồm giáo án tự tạo và giáo án do AI gợi ý). |
| **NAM** | `workout_plan_exercises` | **Nam** | Chi tiết bài tập: tên động tác, số sets, reps, thời gian nghỉ (rest). |
| **NAM** | `workout_plan_assignments`| **Nam** | Bảng phân công giáo án cho từng học viên cụ thể hoặc cho cả lớp. |
| **NAM** | `body_metrics` | **Nam** | Chỉ số thể hình hội viên (chiều cao, cân nặng, % mỡ, cơ bắp, BMI). |
| **NAM** | `diet_plans` | **Nam** | Thực đơn dinh dưỡng bổ trợ do Coach thiết lập cho hội viên. |

---

## 🔄 PHẦN 4: BẢN ĐỒ LUỒNG CHẠY THỰC TẾ (UI ➔ ENDPOINT ➔ DATABASE TABLES)

Khi Giảng viên chỉ vào màn hình và hỏi: *"Bấm vào nút này thì code chạy vào đâu và lưu vào bảng nào?"* -> Tra cứu ngay 4 luồng cốt lõi dưới đây:

### 1. Luồng Mua Gói Tập & Kích Hoạt Tự Động (Thanh toán VietQR / VNPay)
* **Thao tác UI:** Hội viên vào tab Gói tập ➔ Chọn gói (ví dụ: Gói Bơi 1 tháng) ➔ Chọn hình thức "Chuyển khoản VietQR" ➔ Bấm "Thanh toán ngay".
* **File Frontend gọi:** `OnePageCheckout.tsx` hoặc `MemberPackages.tsx` gọi hàm `apiPost("/api/package-orders/checkout")`.
* **Backend tiếp nhận:** `PackageEndpoints.cs` chuyển vào `PackageCatalogService.Orders.cs`.
* **Tác động Database:**
  1. `INSERT INTO subscriptions`: Tạo dòng đăng ký với `payment_status = 'pending'`, `package_id = 'swim'`, tính `start_date` = hôm nay, `end_date` = +1 tháng.
  2. `INSERT INTO invoices`: Tạo hóa đơn kèm mã đơn hàng `SC123456`, `total_amount = 500,000`, `payment_method = 'qr'`.
* **Khi tiền về tài khoản:** SePay gửi webhook tới `PaymentEndpoints.Sepay.cs` ➔ Backend `UPDATE invoices SET payment_status = 'completed'` và `UPDATE subscriptions SET payment_status = 'completed'`.
* **Kết quả trả về UI:** Modal VietQR tự đóng, hiển thị tick xanh hoàn tất và gói tập chuyển sang trạng thái "Đang hoạt động".

---

### 2. Luồng Đặt Lớp Học Nhóm (Pay & Book - Chống Overbooking)
* **Thao tác UI:** Hội viên vào `MemberBooking.tsx` ➔ Chọn lớp "Yoga Sáng 08:00" ➔ Bấm nút "Đăng ký tham gia".
* **File Frontend gọi:** `MemberBooking.tsx` gọi `apiPost("/api/classes/{id}/pay-and-book")`.
* **Backend tiếp nhận:** `ClassEndpoints.Bookings.cs` chuyển vào `ClassService.Bookings.cs`.
* **Tác động Database (Atomic Transaction):**
  1. `SELECT capacity, current_enrolled FROM classes WHERE id = ... FOR UPDATE` (Khóa dòng chống xung đột đồng thời).
  2. Kiểm tra nếu `current_enrolled < capacity`:
     - `UPDATE classes SET current_enrolled = current_enrolled + 1`.
     - `INSERT INTO class_bookings (user_id, class_id, status)` VALUES (`current_user`, `class_id`, `'confirmed'`).
     - `INSERT INTO notifications`: Bắn thông báo về chuông báo cho Hội viên và HLV.
  3. `COMMIT TRANSACTION`.
* **Kết quả trả về UI:** Nút bấm đổi thành "Đã đăng ký", slot còn lại giảm đi 1, tự động mở tin nhắn chat chào mừng với HLV phụ trách lớp đó.

---

### 3. Luồng Quẹt Thẻ / Quét QR Điểm Danh Ra Vào Cổng (Check-in)
* **Thao tác UI:** Lễ tân tại màn hình `CheckInPage.tsx` quét camera mã QR trên điện thoại của Hội viên.
* **File Frontend gọi:** `CheckInPage.tsx` gửi mã hội viên qua API `POST /api/receptionist/check-in`.
* **Backend tiếp nhận:** `AttendanceEndpoints.cs`.
* **Tác động Database:**
  1. `SELECT * FROM subscriptions WHERE user_id = ... AND payment_status = 'completed' AND end_date >= CURRENT_DATE`.
  2. Nếu tìm thấy gói hợp lệ: `INSERT INTO check_in_logs (user_id, facility_id, subscription_id, check_in_time, method)` VALUES (`...`, `'qr'`).
* **Kết quả trả về UI:** Màn hình Lễ tân bật viền xanh lá "Check-in thành công", hiển thị tên hội viên, ảnh đại diện và thời hạn gói tập.

---

### 4. Luồng Sinh Giáo Án Tập Luyện Bằng AI (Flow 5 - Coach Copilot)
* **Thao tác UI:** HLV vào `CoachAI.tsx` ➔ Chọn học viên ➔ Nhập mục tiêu "Tăng cơ ngực, cấp độ trung bình" ➔ Bấm "✨ Tạo gợi ý bài tập".
* **File Frontend gọi:** `useCoachAi.ts` gọi `apiPost("/api/coach/workout-plans/ai-recommendation")` có gắn `AbortController` (timeout 20s).
* **Backend tiếp nhận:** `Flow5WorkoutPlanEndpoints.cs` ➔ `Flow5WorkoutPlanService.cs` ➔ `GeminiRecommendationProvider.cs`.
* **Tác động Database:**
  1. `INSERT INTO workout_plans`: Tạo giáo án bản nháp (`status = 'Nháp'`, `plan_name = 'Giáo án Tăng cơ ngực (AI Suggestion)'`).
  2. `INSERT INTO workout_plan_exercises`: Lưu từng động tác do Gemini sinh ra (VD: Đẩy ngực ngang Barbell Bench Press, 4 sets x 10 reps, nghỉ 60s).
* **Khi HLV duyệt bài:** HLV chỉnh sửa và bấm "Giao bài tập" ➔ `INSERT INTO workout_plan_assignments (plan_id, target_type, target_id)` ➔ Học viên mở app lên là thấy bài tập trong tab `MemberWorkouts.tsx`.

---

## 👤 PHẦN 5: HƯỚNG DẪN TRẢ LỜI VẤN ĐÁP CHO TỪNG THÀNH VIÊN

---

### 1. PHẠM ĐỨC THANH PHƯƠNG (LEADER - BACKEND ARCHITECTURE & CORE SERVICES)

#### 🎯 Câu giới thiệu bản thân 1 phút:
> *"Thưa Thầy/Cô, em là Thanh Phương, đảm nhiệm vai trò Trưởng nhóm và Kiến trúc sư Backend của dự án. Em phụ trách: Thiết lập kiến trúc Clean Architecture .NET 10 tối giản Program.cs còn 33 dòng; Cấu hình Supabase EF Core; Triển khai hệ thống Xác thực JWT Bearer & Phân quyền RBAC; Xây dựng API Quản lý Gói tập (Package Catalog) và Subscription; Tích hợp Backend Proxy kết nối Google Gemini 1.5 Flash cho Flow 5 (AI Workout Plan) và tiếp nhận SePay Webhook tự động đối soát giao dịch."*

#### 📂 Bảng Database phụ trách chính:
* `packages`, `package_features`, `package_sports`, `membership_benefits`, `subscriptions`.
* Làm chung: `roles`, `users`, `facilities`, `sports`.

#### 💻 File code trọng tâm cần mở khi phỏng vấn:
* `backend/SmartGym.Api/Program.cs` & thư mục `Extensions/`
* `backend/SmartGym.Api/Endpoints/AuthEndpoints.cs`, `PackageEndpoints.cs`
* `backend/SmartGym.Api/Endpoints/Flow5WorkoutPlanEndpoints.cs` & `GeminiRecommendationProvider.cs`

#### ❓ Câu hỏi kỹ thuật GV hay hỏi Phương:
* **GV:** *"Tại sao em không gọi Gemini API trực tiếp từ React Frontend cho nhanh mà phải qua Backend?"*
  - **Trả lời:** *"Dạ thưa Thầy/Cô, nếu gọi trực tiếp từ Frontend thì API Key sẽ bị lộ khi người dùng F12/Inspect Network. Việc đi qua Backend Proxy giúp bảo mật tuyệt đối API Key, đồng thời Backend kiểm soát phân quyền JWT, giới hạn quota tránh spam và validate cấu trúc dữ liệu JSON trước khi lưu vào CSDL."*
* **GV:** *"Tại sao em lại tách Program.cs thành các Extension methods?"*
  - **Trả lời:** *"Dạ để tuân thủ nguyên tắc Clean Code và quy chuẩn dự án dưới 50 dòng. Việc chia thành `ServiceCollectionExtensions`, `AuthenticationExtensions`, `SwaggerExtensions` giúp pipeline khởi động tường minh, dễ viết Unit Test và bảo trì độc lập."*

---

### 2. BÙI NAM THUẬN (FULLSTACK - THANH TOÁN, VNPAY, SEPAY, HÓA ĐƠN & TÀI CHÍNH)

#### 🎯 Câu giới thiệu bản thân 1 phút:
> *"Thưa Thầy/Cô, em là Nam Thuận, phụ trách phân hệ Thanh toán, Hóa đơn và Tài chính. Công việc chính của em gồm: Tích hợp cổng thanh toán VNPay Sandbox với thuật toán băm chữ ký bảo mật HMAC-SHA512; Tích hợp SePay Webhook tự động tạo mã VietQR Napas 247 cho tài khoản ngân hàng và xây dựng Polling thời gian thực để kích hoạt đơn tự động; Xây dựng giao diện One-Page Checkout; Thiết kế các tab Báo cáo doanh thu, Thu chi và Bảng lương nhân viên trên Admin Portal; Xây dựng giao diện Điểm danh hội viên tại cổng kèm mã vé QR động."*

#### 📂 Bảng Database phụ trách chính:
* `invoices`, `invoice_items`, `products`, `pt_packages`, `pt_enrollments`.

#### 💻 File code trọng tâm cần mở khi phỏng vấn:
* `Frontend/src/pages/PaymentFlow/OnePageCheckout.tsx`, `InvoiceScreen.tsx`
* `Frontend/src/components/SePayQrModal.tsx`
* `backend/SmartGym.Api/Endpoints/PaymentEndpoints.cs` & `VNPayService.cs`
* `Frontend/src/pages/AdminDashboard/views/ReportsTabRevenue.tsx`, `PayrollPage.tsx`

#### ❓ Câu hỏi kỹ thuật GV hay hỏi Thuận:
* **GV:** *"Thuật toán tạo chữ ký kiểm tra của VNPay hoạt động như thế nào?"*
  - **Trả lời:** *"Dạ thưa Thầy/Cô, VNPay yêu cầu lấy toàn bộ tham số gửi đi (bỏ qua `vnp_SecureHash`), sắp xếp theo thứ tự bảng chữ cái alphabet (A-Z) của tên tham số, nối thành chuỗi URL encoded rồi dùng thuật toán HMAC-SHA512 băm với `vnp_HashSecret`. Khi VNPay trả về kết quả qua IPN, Backend băm lại chuỗi tham số nhận được và so sánh với mã Hash của VNPay để chống giả mạo dữ liệu."*
* **GV:** *"Nếu khách chuyển tiền nhưng quên ghi nội dung mã đơn (Memo) thì sao?"*
  - **Trả lời:** *"Dạ hệ thống có 2 cơ chế: 1 là mã QR đã nhúng sẵn nội dung chuyển khoản nên 99% khách hàng quét mã là có sẵn cú pháp; 2 là trên Dashboard Lễ tân/Admin có danh sách các giao dịch SePay chưa khớp mã, Lễ tân có thể đối chiếu số tiền và giờ chuyển để bấm nút 'Xác nhận kích hoạt thủ công'."*

---

### 3. LÊ HOÀNG LONG (FULLSTACK - LỄ TÂN, LỚP HỌC NHÓM, ĐẶT CHỖ & CƠ SỞ VẬT CHẤT)

#### 🎯 Câu giới thiệu bản thân 1 phút:
> *"Thưa Thầy/Cô, em là Hoàng Long, phụ trách toàn bộ phân hệ Lễ tân (Receptionist Operations), Quản lý Lớp học nhóm (Group Classes) và Cơ sở vật chất. Trọng tâm công việc của em gồm: Thiết kế và lập trình các API Quản lý lớp học, phát hiện và ngăn chặn xung đột trùng lịch giữa lớp nhóm và ca dạy PT 1-1; Áp dụng Atomic SQL Transaction cho luồng Hội viên đặt lớp (`pay-and-book`) chống overbooking; Xây dựng trang Counter Payments giúp Lễ tân thu tiền tại quầy cho cả gói tập và vé học; Lập trình giao diện Lịch hẹn huấn luyện viên (`SchedulePage`) và quản lý danh mục Bộ môn & Phòng tập trên Admin Portal."*

#### 📂 Bảng Database phụ trách chính:
* `classes`, `class_bookings`, `check_in_logs`, `coach_sports`, `shift_requests`.

#### 💻 File code trọng tâm cần mở khi phỏng vấn:
* `Frontend/src/pages/ReceptionistPortal/views/CheckInPage.tsx`, `CounterPaymentsPage.tsx`
* `Frontend/src/pages/ReceptionistPortal/views/SchedulePage.tsx` & thư mục `schedule/`
* `backend/SmartGym.Application/Services/ClassService.cs` (`Bookings.cs`)
* `backend/SmartGym.Infrastructure/Repositories/SupabaseGroupClassRepository.cs`

#### ❓ Câu hỏi kỹ thuật GV hay hỏi Long:
* **GV:** *"Tại sao em phải dùng Database Transaction khi đặt lớp?"*
  - **Trả lời:** *"Dạ thưa Thầy/Cô, nếu không dùng Transaction, giả sử lớp chỉ còn 1 chỗ trống duy nhất và có 2 hội viên cùng bấm đăng ký ở cùng một thời điểm (Race Condition), cả hai luồng kiểm tra đều thấy còn chỗ và cùng ghi nhận thành công, dẫn đến lớp bị vượt sĩ số (Overbooking). Khi bọc vào Transaction với `BeginTransactionAsync`, hệ thống đảm bảo thao tác trừ slot và ghi booking là nguyên tử (All or Nothing)."*
* **GV:** *"Lễ tân kiểm tra gói tập của khách khi check-in tại quầy như thế nào?"*
  - **Trả lời:** *"Dạ khi quét mã QR trên `CheckInPage.tsx`, hệ thống truy vấn bảng `subscriptions`, kiểm tra 3 điều kiện: Trạng thái gói là `active`, ngày hiện tại nằm trong khoảng `[start_date, end_date]`, và hóa đơn liên quan đã thanh toán `completed`. Nếu thỏa mãn, hệ thống ghi nhận một dòng vào `check_in_logs` và báo thành công."*

---

### 4. HỒ XUÂN ANH NAM (FRONTEND LEAD - COACH PORTAL, MEMBER PORTAL, AI COPILOT & MODULARIZATION)

#### 🎯 Câu giới thiệu bản thân 1 phút:
> *"Thưa Thầy/Cô, em là Anh Nam, phụ trách vị trí Frontend Lead và kiến trúc giao diện cho Coach Portal và Member Portal. Đóng góp nổi bật của em gồm: Thiết kế kiến trúc giao diện tương thích responsive, dark/light theme trên `MemberShellModern`; Xây dựng không gian làm việc Coach AI Copilot (`CoachAI.tsx`) tích hợp xử lý bất đồng bộ và AbortController hủy request quá 20s chống đơ màn hình; Xây dựng hệ thống Chat thời gian thực đa kênh (`MemberChat`, `CoachChat`); Thực hiện tái cấu trúc mã nguồn toàn diện (Modularization), phân tách hơn 15 file màn hình lớn vượt chuẩn từ 1,000–2,000 dòng về dưới 200–250 dòng; Thiết lập hệ thống định tuyến hai chiều Two-Way URL Hash Routing."*

#### 📂 Bảng Database phụ trách chính:
* `coaches`, `pt_sessions`, `reviews`, `body_metrics`, `workout_plans`, `workout_plan_exercises`, `workout_plan_assignments`, `diet_plans`.

#### 💻 File code trọng tâm cần mở khi phỏng vấn:
* `Frontend/src/pages/CoachPortal/views/CoachAI.tsx` & thư mục `coach-ai/`
* `Frontend/src/pages/MemberPortal/views/MemberBooking.tsx` & thư mục `booking/`
* `Frontend/src/pages/MemberPortal/views/MemberChat.tsx`
* `Frontend/src/hooks/useCoachAi.ts`, `Frontend/src/components/UserAvatar.tsx`

#### ❓ Câu hỏi kỹ thuật GV hay hỏi Nam:
* **GV:** *"Tại sao các em lại phải chia nhỏ các file như MemberBooking.tsx từ 2,000 dòng xuống nhiều file con?"*
  - **Trả lời:** *"Dạ thưa Thầy/Cô, việc để một file React dài 2,000 dòng vi phạm nguyên tắc Đơn nhiệm (Single Responsibility Principle), khiến code cực kỳ khó bảo trì, khi một state nhỏ thay đổi sẽ gây re-render lại toàn bộ cây DOM lớn làm giảm hiệu năng, và gây xung đột git nghiêm trọng khi làm việc nhóm. Nhóm đã phân tách thành thư mục `booking/` gồm 11 module con độc lập (<200 dòng): Header, Filters, GroupClassesTab, PtSlotsTab, Modals... giúp code mạch lạc, tái sử dụng tốt và tối ưu hóa hiệu năng render."*
* **GV:** *"Two-Way URL Hash Routing em làm hoạt động như thế nào?"*
  - **Trả lời:** *"Dạ khi người dùng click đổi tab trên Sidebar, em không dùng state cục bộ mà cập nhật hash trên URL (ví dụ `#coach/schedule` hoặc `#dashboard/members`). Hệ thống lắng nghe sự kiện `window.addEventListener('hashchange')` để render tab tương ứng. Nhờ vậy, người dùng có thể F5 tải lại trang, copy đường dẫn chia sẻ cho đồng nghiệp hoặc bấm nút Back/Forward trên trình duyệt mà vẫn giữ đúng màn hình đang xem."*

---

## 🛠️ PHẦN 6: LỖI KỸ THUẬT VỪA SỬA & BÀI HỌC THỰC TẾ (RẤT DỄ BỊ HỎI)

Giảng viên rất thích hỏi: *"Trong quá trình làm đồ án, các em gặp lỗi gì khó nhất và sửa nó như thế nào?"* -> Cả nhóm có thể lấy ngay ví dụ lỗi vừa sửa hôm nay:

### ⚠️ Lỗi Build Vite: `UNRESOLVED_IMPORT apiClient`
* **Vấn đề:** Khi chạy lệnh đóng gói dự án `npm run build`, Rollup/Vite báo lỗi nghiêm trọng dừng toàn bộ quá trình build:
  ```text
  [UNRESOLVED_IMPORT] Could not resolve '../../../hooks/apiClient' in 
  src/pages/AdminDashboard/components/createPayment/PaymentFormFields.tsx
  ```
* **Nguyên nhân:** Khi nhóm thực hiện tái cấu trúc chia nhỏ file `CreatePaymentModal.tsx` và tạo thư mục con `components/createPayment/PaymentFormFields.tsx`, vị trí file mới nằm sâu 4 cấp thư mục so với `src/`. Đoạn code import cũ chỉ lùi 3 cấp (`../../../hooks/apiClient`) nên trỏ nhầm vào `src/pages/hooks/apiClient` không tồn tại.
* **Cách khắc phục:**
  - Sửa lại đường dẫn import đúng cấp độ: `import { formatVnd } from "../../../../hooks/apiClient";`.
  - Dọn dẹp các import không sử dụng (`React`).
  - Kiểm tra toàn diện bằng lệnh `npx tsc --noEmit` và xác nhận đạt **0 errors** trên toàn bộ dự án.

---

## 🏆 PHẦN 7: 5 NGUYÊN TẮC VÀNG KHI ĐI VẤN ĐÁP BẢO VỆ ĐỒ ÁN

1. **Bình tĩnh, lắng nghe hết câu hỏi:** Không ngắt lời Thầy/Cô. Dành 2 giây xác định câu hỏi thuộc phạm vi của ai thì người đó chủ động nhận trả lời.
2. **Dẫn chứng bằng code thực tế:** Khi trả lời bất kỳ tính năng nào, vừa nói vừa mở đúng file code trên VS Code / IDE và chỉ vào đoạn logic xử lý (ví dụ: mở `ClassService.Bookings.cs` chỉ vào dòng `BeginTransactionAsync`).
3. **Thành thật và nhấn mạnh vai trò kiểm duyệt:** Khi được hỏi về việc dùng AI, hãy tự tin trả lời: *"Tụi em có sử dụng AI (ChatGPT, Copilot, Gemini) để hỗ trợ sinh code mẫu và gợi ý giải pháp, nhưng 100% logic nghiệp vụ, ràng buộc bảo mật, sửa lỗi cú pháp và kiểm thử đều do sinh viên trực tiếp rà soát và viết lại"*. (Trưng ra file `SWP391_Project_AI_Usage_Report.md`).
4. **Tinh thần đồng đội (Teamwork):** Nếu đồng đội bị vấp hoặc căng thẳng, thành viên khác có thể xin phép: *"Dạ em xin phép bổ sung thêm ý của bạn về phần này..."*.
5. **Trình bày luồng dữ liệu trôi chảy:** Luôn đi theo trình tự chuẩn: **Thao tác người dùng (UI) ➔ Gọi API (HTTP Request/DTO) ➔ Middleware xác thực (JWT) ➔ Xử lý nghiệp vụ (Service) ➔ Cập nhật CSDL (PostgreSQL) ➔ Phản hồi kết quả (HTTP 200/400 DTO)**.
