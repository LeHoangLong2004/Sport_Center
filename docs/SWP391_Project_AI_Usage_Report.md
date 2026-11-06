# SWP391 - PROJECT AI USAGE REPORT
> **Môn học:** SWP391 - Software Development Project  
> **Dự án:** SmartGym OS / Sport Center Management System  
> **Tài liệu tham chiếu:** Biểu mẫu báo cáo sử dụng công cụ AI (Template0_AI Usage Report)  
> **Chu kỳ báo cáo:** 8 Tuần thực hiện đồ án (Week 1 – Week 8)

---

## 📋 SHEET 0: OVERVIEW (THÔNG TIN CHUNG DỰ ÁN)

### 1. Project Information (Thông tin học phần & Đề tài)

| Field | Information | Ghi chú |
| :--- | :--- | :--- |
| **Subject Code** | **SWP391** | Software Development Project |
| **Subject Name** | **Software Development Project** | Dự án Phát triển Phần mềm |
| **Class Code** | `SE18xx` *(Điền mã lớp thực tế, ví dụ: SE1801)* | Lớp học phần |
| **Semester** | `Fall 2026` *(hoặc Fall 2024 / Spring 2025 tùy kỳ học)* | Học kỳ thực hiện |
| **Lecturer Name** | `[Tên Giảng Viên Hướng Dẫn]` | Giảng viên bộ môn SE |
| **Group Code** | `Group 0X` *(Điền số nhóm thực tế, ví dụ: Group 02)* | Nhóm dự án |
| **Project Title** | **Sport Center Management System (SmartGym OS)** | Hệ thống quản trị trung tâm thể thao đa bộ môn |

---

### 2. List of Students (Danh sách thành viên nhóm & Công cụ AI sử dụng)

| No | StudentCode | StudentName | Role In Group | AI Tool Used |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `SE18xxxx` *(Điền MSSV)* | **Phạm Đức Thanh Phương** | **Leader / Backend Architecture** (System Architecture, Auth & RBAC, Package Catalog, Supabase EF Core, Gemini AI API) | ChatGPT-4o, GitHub Copilot, Gemini 1.5 Flash |
| **2** | `SE18xxxx` *(Điền MSSV)* | **Bùi Nam Thuận** | **Fullstack Developer** (Payment, VietQR / SePay Auto-Checkout, VNPay Gateway, Invoices, Financial & Payroll) | GitHub Copilot, ChatGPT-4o, Antigravity |
| **3** | `SE18xxxx` *(Điền MSSV)* | **Lê Hoàng Long** | **Fullstack Developer** (Receptionist Operations, Group Classes, Attendance, Schedule Grid & Facilities CRUD) | ChatGPT-4o, GitHub Copilot, Claude 3.5 Sonnet |
| **4** | `SE18xxxx` *(Điền MSSV)* | **Hồ Xuân Anh Nam** | **Frontend Lead & UI/UX** (Coach Portal, Member Portal, AI Copilot Workspace, Real-time Sync & Modularization) | ChatGPT-4o, GitHub Copilot, Antigravity |

---

## 📅 NHẬT KÝ SỬ DỤNG AI THEO TỪNG TUẦN (WEEK 1 – WEEK 8)
*(Cấu trúc 10 cột theo quy định biểu mẫu: **No. \| SDLC Phase \| Task / Activity \| AI Tool Used \| AI Output \| Student's Validation / Modification \| Evidence / Link \| Quantitative Measure \| Value Added (1-5) \| Risks / Limitations Observed**)*

---

### 🗓️ TUẦN 1 (WEEK 1): KHỞI ĐỘNG DỰ ÁN, KHẢO SÁT NGHIỆP VỤ & LẬP PRODUCT BACKLOG

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **1** | Requirement | Brainstorming & System Scope Definition | ChatGPT-4o | Đề xuất danh sách phân hệ chức năng tổng quan cho 4 Actor: Manager, Receptionist, Coach, Member. | Tinh gọn phạm vi hệ thống: tập trung vào vận hành phòng tập đa môn (Gym, Yoga, Boxing, Bơi, Cầu lông), loại bỏ các tính năng bán lẻ e-commerce cồng kềnh. | `GroupX_Week1_ScopeDefinition.png` | 4 Portal tác nhân, 12 module cốt lõi được chốt. | 4 | AI đề xuất nhiều tính năng không phù hợp với trung tâm thể thao thực tế (bán vé theo ghế rạp, tích điểm sàn TMĐT). |
| **2** | Requirement | User Story & Acceptance Criteria Development | ChatGPT-4o | 28 User Stories mẫu kèm tiêu chí chấp nhận cho luồng mua gói tập, đặt lớp học và điểm danh. | Chọn lọc giữ lại 20 stories phù hợp với thời lượng SWP391; bổ sung nghiệp vụ bán gói tại quầy (counter payment) và giữ chỗ trước. | `GroupX_Week1_UserStories.png` | 20 user stories được duyệt, 8 stories bị lược bỏ. | 4 | Tiêu chí chấp nhận do AI sinh ra ban đầu còn chung chung, chưa gắn với các mã lỗi HTTP cụ thể. |
| **3** | Requirement | Technical Stack & Architecture Feasibility | ChatGPT-4o | Đánh giá so sánh tech stack: .NET 10 Minimal API + PostgreSQL Supabase vs Node.js Express. | Phân tích năng lực nhóm, quyết định chọn .NET 10 (C#) cho Backend và React 19 + TypeScript + TailwindCSS cho Frontend. | `GroupX_Week1_TechStackFeasibility.png` | 1 tài liệu phân tích kỹ thuật (Technical Decision Record). | 5 | AI đánh giá mức độ tương thích của một số thư viện React cũ với React 19 chưa chính xác. |

---

### 🗓️ TUẦN 2 (WEEK 2): THIẾT KẾ CƠ SỞ DỮ LIỆU, KIẾN TRÚC HỆ THỐNG & UI WIREFRAMES

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **4** | Design | ERD Conceptual & Relational Schema | GitHub Copilot | Đề xuất cấu trúc bảng dữ liệu: `users`, `roles`, `packages`, `subscriptions`, `invoices`. | Bổ sung các bảng nghiệp vụ quan trọng: `group_classes`, `class_bookings`, `coach_profiles`, ràng buộc Unique kép chống trùng giờ dạy của Coach. | `GroupX_Week2_ERD_Database.png` | 16 thực thể, 24 quan hệ khóa ngoại (FK), 8 ràng buộc Check. | 5 | Copilot ban đầu quên tạo bảng nối trung gian giữa HLV và chuyên môn (Specialties), dẫn đến quan hệ 1-N sai. |
| **5** | Design | Clean Architecture Layering Design | ChatGPT-4o | Sơ đồ kiến trúc 4 tầng: Domain (Entities), Application (Services/DTOs), Infrastructure (EF Core/Supabase), Api (Endpoints). | Áp dụng Dependency Injection tối giản, chuẩn hóa cấu trúc thư mục dự án và nguyên tắc phân tách trách nhiệm (Separation of Concerns). | `GroupX_Week2_CleanArchitecture.png` | 4 tầng kiến trúc, 15 core interfaces được định nghĩa. | 5 | AI gợi ý thiết kế mô hình CQRS MediatR khá phức tạp so với quy mô dự án, nhóm đã đơn giản hóa sang Service Pattern. |
| **6** | Design | UI/UX Design System Tokens & Color Palettes | Claude 3.5 Sonnet | Bộ token màu sắc phân quyền theo 4 Portal: Rose (Manager), Emerald (Lễ tân), Amber/Orange (Coach), Teal (Member). | Nhúng vào CSS Variables và cấu hình Tailwind theme, chuẩn hóa typography font Inter và Google Font Outfit cao cấp. | `GroupX_Week2_DesignTokens.png` | 4 theme bảng màu độc lập, 35 design tokens. | 4 | Một số class màu của Tailwind v4 bị xung đột cú pháp với cú pháp v3.4 cũ. |

---

### 🗓️ TUẦN 3 (WEEK 3): KHỞI TẠO DỰ ÁN, XÁC THỰC BẢO MẬT (AUTH & RBAC) & QUẢN LÝ TÀI KHOẢN

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **7** | Implementation | .NET 10 Boilerplate & Supabase EF Core Setup | GitHub Copilot | Thiết lập `Program.cs`, chuỗi kết nối PostgreSQL Npgsql và ánh xạ `DbContext`. | Tách nhỏ `Program.cs` từ 282 dòng xuống còn 33 dòng thông qua Extension Methods (`ServiceCollectionExtensions`, `AuthenticationExtensions`). | `GroupX_Week3_ProgramCsSetup.png` | File `Program.cs` chỉ còn 33 dòng, tách 4 extension classes. | 5 | Copilot sinh cấu hình DbContext có lỗi tương thích với kiểu dữ liệu `timestamp with time zone` trên Supabase. |
| **8** | Implementation | JWT Authentication & RBAC Middleware | GitHub Copilot | Endpoint Đăng ký/Đăng nhập, băm mật khẩu và sinh mã JWT Bearer Token. | Bọc xác thực phân quyền nghiêm ngặt với các Policy: `manager`, `receptionist`, `coach`, `member`; cấu hình Swagger hỗ trợ Authorize trực tiếp. | `GroupX_Week3_JwtAuthRBAC.png` | 4 endpoints Auth, 180 LOC, xử lý claims an toàn. | 5 | Copilot dùng thuật toán hash đơn giản cũ; sinh viên đã chuyển sang thư viện `BCrypt.Net-Next` với salt an toàn. |
| **9** | Implementation | User Management CRUD Endpoints | ChatGPT-4o | Cụm Endpoint CRUD tài khoản người dùng, chức năng khóa/mở khóa (`toggle status`). | Kiểm tra phân quyền Manager khi chỉnh sửa tài khoản nhân viên, ngăn chặn tự khóa chính tài khoản Admin đang đăng nhập. | `GroupX_Week3_UserEndpoints.png` | 5 endpoints quản lý User, 240 LOC. | 4 | AI thiếu logic kiểm tra ràng buộc toàn vẹn khi xóa người dùng đã có lịch sử hóa đơn thanh toán. |

---

### 🗓️ TUẦN 4 (WEEK 4): QUẢN LÝ GÓI TẬP, ĐĂNG KÝ HỘI VIÊN & GIAO DIỆN ADMIN TỔNG QUAN

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **10** | Implementation | Package Catalog & Multi-period Pricing | ChatGPT-4o | Entity `Package` và logic tính giá theo chu kỳ (1 tháng, 6 tháng, 12 tháng) có chiết khấu. | Bổ sung ràng buộc giá tiền không âm, hỗ trợ phân loại gói tập theo bộ môn hoặc gói tập toàn diện (`all-access`), tạo DTO tách biệt. | `GroupX_Week4_PackageCatalog.png` | 6 endpoints gói cước, 300 LOC, hỗ trợ 3 chu kỳ thanh toán. | 4 | AI tính toán sai phần trăm giảm giá cho chu kỳ năm dẫn đến sai lệch số tiền cuối cùng. |
| **11** | Implementation | Member Subscriptions Management Flow | GitHub Copilot | Luồng đăng ký gói tập, tính toán ngày bắt đầu (`start_date`) và ngày hết hạn (`end_date`). | Thêm logic tự động gia hạn ngày nếu hội viên mua thêm gói trong khi gói cũ vẫn còn hạn sử dụng (không bị đè mất ngày cũ). | `GroupX_Week4_SubscriptionFlow.png` | 4 endpoints đăng ký gói, xử lý cập nhật trạng thái gói. | 5 | Copilot tính toán ngày hết hạn theo `DateTime.Now.AddDays(30)` thay vì `AddMonths(1)` gây lệch ngày ở các tháng 28 hoặc 31 ngày. |
| **12** | Implementation | Remove Mock Data & Bind Live State (Admin) | Antigravity / ChatGPT-4o | Rà soát các component trên Admin Dashboard và chuyển từ dữ liệu tĩnh sang state API. | Loại bỏ toàn bộ số liệu KPI cứng trên Overview, Reports, Finance, Members; hiển thị trạng thái tải `--` và empty state chuẩn UX. | `GroupX_Week4_AdminRemoveMock.png` | 8 trang quản trị được làm sạch 100% dữ liệu cứng. | 5 | Một số biểu đồ bị vỡ giao diện (NaN) khi nhận mảng dữ liệu rỗng từ backend; sinh viên đã bổ sung giá trị fallback mặc định. |

---

### 🗓️ TUẦN 5 (WEEK 5): LỚP HỌC NHÓM, ĐẶT CHỖ ATOMIC & ĐỒNG BỘ LỊCH DẠY HUẤN LUYỆN VIÊN

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **13** | Implementation | Group Class Scheduling & Conflict Detection | GitHub Copilot | Hàm kiểm tra trùng lịch dạy của Huấn luyện viên và sức chứa phòng tập (`capacity`). | Mở rộng kiểm tra xung đột kép: rà soát cả ca dạy lớp nhóm lẫn ca dạy kèm 1-on-1 PT của HLV trên toàn bộ khung giờ đăng ký. | `GroupX_Week5_ClassConflictDetection.png` | 6 endpoints quản lý lớp, 380 LOC, thuật toán kiểm tra xung đột. | 5 | AI chỉ kiểm tra trùng theo giờ bắt đầu (`start_time`), bỏ qua trường hợp các ca học có thời lượng khác nhau đè lên nhau. |
| **14** | Implementation | Atomic Booking & Cancellation Transaction | GitHub Copilot | Logic đặt chỗ lớp học và tăng biến đếm `current_enrolled`. | Áp dụng SQL Transaction nguyên tử: kiểm tra slot trống -> trừ slot -> tạo booking -> tạo hóa đơn; rollback toàn bộ nếu có lỗi. | `GroupX_Week5_AtomicBooking.png` | 2 endpoints `pay-and-book` và `cancel-booking`, 250 LOC. | 5 | Copilot ban đầu sinh code không có transaction, dẫn đến nguy cơ overbooking khi 2 user bấm đặt cùng 1 mili-giây. |
| **15** | Implementation | Coach & Member Weekly Interactive Calendar | Antigravity / Claude | Khung giao diện lưới lịch 7 ngày trong tuần với phân loại màu sắc theo bộ môn và trạng thái lớp. | Tích hợp bộ lọc đa năng (theo môn, theo ca sáng/chiều/tối), căn chỉnh CSS không bị giật lag khi chuyển tuần, đồng bộ dữ liệu thời gian thực. | `GroupX_Week5_WeeklyScheduleView.png` | 1 component Lịch tuần tương tác, hiển thị trực quan >50 ca học. | 4 | Hiển thị chồng chéo ca học trên cùng một ô giờ; nhóm đã lập trình thuật toán tính vị trí cột phụ (`overlap offset`). |

---

### 🗓️ TUẦN 6 (WEEK 6): CỔNG THANH TOÁN (VNPAY & VNPAY QR), SEPAY WEBHOOK & QUẦY LỄ TÂN

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **16** | Implementation | VNPay Sandbox Gateway & Checksum Validator | ChatGPT-4o | Hàm tạo URL thanh toán VNPay và thuật toán băm chuỗi tham số với khóa bí mật HMAC-SHA512. | Chuẩn hóa sắp xếp tham số query string theo thứ tự từ điển (A-Z) trước khi băm chữ ký, xử lý IPN xác nhận đơn hàng bất đồng bộ. | `GroupX_Week6_VNPayGateway.png` | 2 endpoints VNPay (Create URL & IPN Callback), 220 LOC. | 4 | AI không tuân thủ đúng định dạng thời gian `yyyyMMddHHmmss` mà VNPay yêu cầu, gây lỗi mã 07 (Transaction timeout). |
| **17** | Implementation | SePay Real-Time Webhook & VietQR Auto-Polling | ChatGPT-4o / Copilot | Endpoint nhận Webhook từ SePay thông báo biến động số dư tài khoản Sacombank / MB Bank. | Tạo mã VietQR chuẩn Napas 247 theo mã đơn `SC...`, xây dựng polling nền 2 giây/lần tự động kích hoạt gói ngay khi nhận tiền vào tài khoản. | `GroupX_Week6_SePayAutoCheckout.png` | 1 Webhook receiver, 1 modal VietQR động, tự động hóa thanh toán. | 5 | Xử lý trường hợp người chuyển tiền quên ghi nội dung mã đơn hàng; nhóm đã bổ sung kiểm tra số tiền khớp và thời gian gần nhất. |
| **18** | Implementation | Receptionist Counter Payments & QR Check-in | GitHub Copilot | Giao diện thu tiền tại quầy và quét mã QR thẻ hội viên ra/vào cổng. | Thống nhất 3 loại đơn (gói hội viên, gói môn, vé học theo buổi) vào trang `CounterPaymentsPage`, bổ sung cờ `pending` giữ chỗ trước khi thu tiền. | `GroupX_Week6_CounterPayments.png` | 3 màn hình thao tác quầy Lễ tân, xử lý đơn tức thì. | 4 | AI để đơn đặt quầy tự động thành công ngay khi bấm; sinh viên đã sửa lại luồng: phải có bước Lễ tân bấm "Xác nhận thu tiền". |

---

### 🗓️ TUẦN 7 (WEEK 7): TÍCH HỢP TRÍ TUỆ NHÂN TẠO (FLOW 5 AI COACH) & TÁI CẤU TRÚC CODEBASE

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **19** | Implementation | Flow 5 Backend: Gemini 1.5 Flash Provider | Gemini 1.5 Flash / Copilot | Lớp tích hợp Google Gemini API nhận ngữ cảnh học viên và sinh cấu trúc giáo án tập luyện. | Bảo mật API Key qua Backend Proxy, thiết lập prompt kỹ thuật yêu cầu phản hồi JSON nghiêm ngặt, giới hạn quota tránh phát sinh phí. | `GroupX_Week7_GeminiWorkoutPlan.png` | 4 file kiến trúc AI Backend, tích hợp Gemini 1.5 Flash. | 5 | Mô hình AI có xu hướng bọc phản hồi trong khối ````json ... ````; nhóm đã viết hàm Regex parser bóc tách JSON chuẩn xác. |
| **20** | Implementation | Flow 5 Frontend: Coach AI Copilot Workspace | Antigravity / ChatGPT-4o | Giao diện tạo bài tập thông minh với bộ chọn mục tiêu, sinh động tác theo set/rep và thực đơn dinh dưỡng. | Tách nhỏ view thành 6 subcomponent độc lập (<200 dòng), thêm AbortController hủy request nếu AI phản hồi quá 20s chống đơ màn hình. | `GroupX_Week7_CoachAIWorkspace.png` | 6 subcomponents, 1 hook `useCoachAi.ts`, <200 LOC/file. | 5 | Thời gian sinh bài tập từ AI có thể dao động từ 2-5s; sinh viên đã bổ sung loading skeleton mượt mà. |
| **21** | Code Quality | Monolithic Codebase Refactoring (<250 lines) | Antigravity AI Assistant | Phương án phân tách các file mã nguồn quá dài vượt tiêu chuẩn dự án (>300 dòng). | Phân tách `MemberBooking.tsx` (2,044 -> 380 dòng), `MemberChat.tsx` (943 -> 226 dòng), `CoachMembers.tsx` (423 -> 139 dòng), `CreatePaymentModal.tsx` và tạo `createPayment/PaymentFormFields.tsx`. | `GroupX_Week7_CodeRefactoring.png` | Hơn 15 component lớn được phân rã, 100% files mới dưới 250 LOC. | 5 | Việc di chuyển file vào các thư mục con sâu hơn làm phát sinh lỗi sai lệch đường dẫn import tương đối (`relative import`). |

---

### 🗓️ TUẦN 8 (WEEK 8): SỬA LỖI BIÊN DỊCH VITE, KIỂM THỬ TOÀN DIỆN, BẢO MẬT & ĐÓNG GÓI DỰ ÁN

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **22** | Bugfix & Build | Vite Build Fix (UNRESOLVED_IMPORT apiClient) | Antigravity AI Assistant | Phân tích log lỗi `vite build` và chỉ ra file `PaymentFormFields.tsx` bị thiếu 1 cấp thư mục import (`../../../` thay vì `../../../../`). | Đổi đường dẫn thành `../../../../hooks/apiClient`, xóa import thừa `React`, kiểm tra lệnh `npx tsc --noEmit` đạt 0 lỗi biên dịch. | `GroupX_Week8_ViteBuildFix.png` | 1 lỗi build blocker được sửa dứt điểm, đưa TypeScript về 0 lỗi. | 5 | Lỗi xảy ra do quá trình phân tách thư mục ở Tuần 7; công cụ đã định vị chính xác vị trí lỗi chỉ sau vài giây. |
| **23** | Testing | Unit & Contract Testing for Services & Flow 5 | GitHub Copilot | Sinh các kịch bản kiểm thử tự động giả lập (Mocking) cho DbContext, GeminiProvider, và Validator. | Bổ sung các ca kiểm thử biên (Edge cases): học viên chưa có lịch sử thể lực, lỗi mất mạng khi gọi AI, trường hợp trả lời quá giới hạn token. | `GroupX_Week8_AutomatedTesting.png` | 28 automated test cases trong dự án `SmartGym.Tests`. | 4 | Copilot sinh một số test case kiểm tra qua loa (assert true); sinh viên đã tự viết lại các câu assert kiểm tra trường dữ liệu cụ thể. |
| **24** | DevOps & Hygiene | Gitignore & Environment Secrets Hardening | ChatGPT-4o | Đề xuất danh sách quy tắc loại trừ trong `.gitignore` cho môi trường .NET 10, Vite, AI tooling và test dumps. | Rà soát và thêm các thư mục nhạy cảm (`.dotnet_temp/`, `scratch/`, `cracked_accounts.json`, `users_dump.json`, file sao lưu SQL), bảo đảm repository Git an toàn sạch sẽ. | `GroupX_Week8_GitHygiene.png` | 1 file `.gitignore` tiêu chuẩn, loại bỏ hơn 10 loại file rác. | 4 | AI gợi ý loại bỏ một số file tài liệu markdown cần nộp; nhóm đã kiểm tra và giữ lại toàn bộ thư mục `docs/`. |

---

## 📈 TỔNG KẾT ĐỊNH LƯỢNG & ĐÁNH GIÁ GIÁ TRỊ (8 WEEKS SUMMARY)

### 1. Phân bố công cụ AI trong suốt 8 tuần
* **ChatGPT-4o (OpenAI):** 36% – Khảo sát nghiệp vụ, kiến trúc Clean Architecture, quy trình thanh toán VNPay/SePay, tài liệu đặc tả.
* **GitHub Copilot (Microsoft):** 32% – Hỗ trợ viết mã nhanh (Autocompletion), sinh DTO, Entity, Repository, Transaction và Unit Tests.
* **Antigravity AI Assistant:** 18% – Tái cấu trúc phân tách file lớn (<250 dòng), phát hiện và sửa lỗi biên dịch (Vite build, TypeScript errors).
* **Google Gemini 1.5 Flash:** 14% – Trực tiếp làm engine thông minh phục vụ tính năng Flow 5 (Gợi ý giáo án tập luyện cho Huấn luyện viên).

### 2. Định lượng kết quả đạt được (Quantitative Results)
* **Tổng số nhật ký hoạt động AI:** 24 hoạt động tiêu biểu xuyên suốt 8 tuần (Trung bình 3 hoạt động/tuần).
* **Số tính năng / Tasks hoàn thành:** 92/92 Tasks (Được ghi nhận tại `Project_Tracking.md`).
* **Thời gian tiết kiệm ước tính:** ~45% tổng thời gian phát triển so với viết mã thủ công truyền thống.
* **Mức độ kiểm duyệt của sinh viên:** 100% mã nguồn và tài liệu do AI đề xuất đều được sinh viên thẩm định, kiểm thử và chỉnh sửa trước khi tích hợp vào nhánh chính.

### 3. Bài học kinh nghiệm & Biện pháp kiểm soát rủi ro
1. **Kiểm soát ảo giác về cấu trúc thư mục (Path Hallucination):** Sau khi phân tách file thành các subcomponent nhỏ gọn, luôn chạy `npx tsc --noEmit` hoặc `npm run build` để phát hiện ngay các đường dẫn import bị lệch cấp.
2. **Bảo mật tuyệt đối thông tin nhạy cảm:** Không bao giờ đưa API Key của bên thứ ba (Google Gemini, SePay, VNPay Hash Secret) lên Frontend. Mọi giao tiếp nhạy cảm đều đi qua Backend Proxy bảo mật.
3. **Thẩm định nghiệp vụ đặc thù:** AI không nắm được trọn vẹn văn hóa và quy trình vận hành thực tế của phòng tập thể thao tại Việt Nam (thanh toán quầy, giữ chỗ trước, bù buổi tập). Sinh viên luôn là người quyết định cuối cùng về logic nghiệp vụ.

---

## 🔗 QUY CHUẨN ĐẶT TÊN MINH CHỨNG (EVIDENCE CONVENTION)
Theo quy định của bộ môn SWP391:
* Thư mục lưu trữ: `Google Drive / SWP391_GroupX_AI_Evidence`
* Quy ước đặt tên file minh chứng: `GroupX_WeekN_Activity.png` (Ví dụ: `Group02_Week8_ViteBuildFix.png`)
* Nội dung mỗi minh chứng: Chụp màn hình rõ ràng gồm **Prompt của sinh viên ➔ Phản hồi của công cụ AI ➔ Đoạn mã/nội dung sinh viên chỉnh sửa và áp dụng thực tế**.
