# Nhật ký triển khai & kiểm thử luồng Lớp học

## Mục tiêu

Triển khai dần luồng tạo lớp theo `BUSINESS_RULES_CLASS_SCHEDULING.md`, ưu tiên tính đúng đắn của lịch, dữ liệu không mâu thuẫn và khả năng kiểm thử trước khi thay thế luồng `classes` cũ.

## Phase 1 — Nền tảng lịch học

### Quyết định triển khai

- Giữ nguyên bảng `classes` và API cũ để không làm gián đoạn chức năng đang chạy.
- Thêm schema song song cho mô hình doanh nghiệp: `class_courses`, `class_sessions`, `course_enrollments`, `class_session_enrollments`, `class_course_waitlist` và `class_audit_logs`.
- Dùng `ClassCourse` làm nguồn dữ liệu cho khóa/lớp tổng; mỗi `ClassSession` là một buổi; `CourseEnrollment` là nguồn duy nhất để tính chỗ đã dùng.
- Thời gian API được tính theo `Asia/Ho_Chi_Minh` (`UTC+07:00`) và trả về `DateTimeOffset`; dữ liệu lưu xuống DB phải là UTC.

### Thành phần đã thêm

| Thành phần | Vị trí | Trách nhiệm |
| --- | --- | --- |
| Schema idempotent | `backend/SmartGym.Api/Services/DatabaseInitializationExtensions.ClassScheduling.cs` | Tạo bảng, constraint và index cho luồng mới khi API khởi động. |
| Hợp đồng preview | `backend/SmartGym.Application/DTOs/ClassScheduling/SchedulePreviewRequest.cs` | Quy định input/output của lịch đơn lẻ và lịch định kỳ. |
| Rule engine | `backend/SmartGym.Application/Services/ClassSchedulePolicy.cs` | Validate và sinh danh sách buổi dự kiến, không ghi DB. |
| API preview | `backend/SmartGym.Api/Endpoints/ClassSchedulingEndpoints.cs` | `POST /api/class-courses/schedule-preview`, chỉ Coach/Manager/Admin được gọi. |

### Quy tắc đã được code hóa

1. `ONE_TIME` sinh đúng một buổi.
2. `RECURRING` bắt buộc có ngày học và dùng chính xác một `end_mode`:
   - `BY_WEEKS`: 1 đến 24 tuần.
   - `BY_END_DATE`: từ ngày bắt đầu đến tối đa 180 ngày.
   - `BY_SESSION_COUNT`: 2 đến 120 buổi.
3. Ngày bắt đầu là Buổi 1, bắt buộc thuộc danh sách ngày học.
4. Thời lượng phải từ 30 đến 180 phút; toàn bộ buổi phải trong 06:00–22:00.
5. Buổi 1 phải cách thời điểm tạo tối thiểu 24 giờ.
6. Client không gửi danh sách session cuối cùng; backend tự sinh và đánh số buổi liên tục.

## Kiểm thử đã chạy

Lệnh chạy tại thư mục `backend`:

```powershell
dotnet build SmartGym.Tests\SmartGym.Tests.csproj --no-restore --verbosity minimal
dotnet test SmartGym.Tests\SmartGym.Tests.csproj --no-build --filter "FullyQualifiedName~ClassSchedulePolicyTests|FullyQualifiedName~ClassSchedulingApiContractTests|FullyQualifiedName~Flow5CoreTests|FullyQualifiedName~Flow5ApiContractTests" --verbosity minimal
```

Kết quả ngày 21/11/2026:

- Build: thành công, 0 error.
- Tests: 20 passed, 0 failed, 0 skipped.
- `ClassSchedulePolicyTests` kiểm tra: lịch tuần, xung đột `end_mode`, ngày Buổi 1 không hợp lệ và khung giờ/thời lượng không hợp lệ.
- `ClassSchedulingApiContractTests` kiểm tra bốn route workflow, HTTP method và yêu cầu phân quyền.

## Hạng mục còn lại

Phase 2 phải triển khai trước khi đưa luồng mới vào production:

1. Persist `ClassCourse` và toàn bộ `ClassSession` trong một transaction.
2. Preview xung đột phòng/HLV/PT theo từng buổi; duyệt proposal phải re-check trong transaction.
3. Proposal, approve, reject, cancel, audit log và RBAC ở cấp khóa.
4. `CourseEnrollment` atomic (`seats_taken < capacity`), hold 30 phút, webhook idempotent và waitlist FIFO.
5. UI wizard tạo lớp, lịch preview, approval queue và test tích hợp/E2E gồm concurrency.

## Phase 2 — API tạo, đề xuất và duyệt khóa

### Đã triển khai

- `POST /api/class-courses`: Manager/Admin tạo và kích hoạt trực tiếp một khóa học.
- `POST /api/class-courses/proposals`: Coach gửi đề xuất; hệ thống tự lấy Coach profile từ token, không tin `coachId` từ client.
- `PUT /api/class-courses/{courseId}/approve`: Manager/Admin duyệt cả khóa.
- Khi tạo trực tiếp hoặc duyệt proposal, backend chạy lại kiểm tra xung đột theo từng session với các khóa đã duyệt (phòng hoặc HLV), rồi ghi `ClassCourse`, tất cả `ClassSession` và audit log trong một transaction.
- Backend kiểm tra Coach được gán đúng môn trong `coach_sports`; validate tên lớp, sức chứa 1–500 và học phí không âm.

### File chính

| File | Nội dung |
| --- | --- |
| `backend/SmartGym.Api/Services/ClassCourseWorkflowService.cs` | Transaction create/proposal/approve và kiểm tra xung đột. |
| `backend/SmartGym.Api/Endpoints/ClassSchedulingEndpoints.cs` | Endpoint của phase 2 và RBAC. |
| `backend/SmartGym.Application/DTOs/ClassScheduling/SchedulePreviewRequest.cs` | Contract create course dùng chung rule engine. |

### Runtime smoke test ngày 21/11/2026

- Frontend Vite chạy thành công tại `http://127.0.0.1:5173`, HTTP `200`.
- Frontend production build: `npm run build` thành công (2,381 modules transformed).
- Backend không khởi động xong vì runner hiện tại không kết nối được PostgreSQL Supabase (`aws-0-ap-southeast-1.pooler.supabase.com:5432`); log EF Core cho thấy retry connection. Vì DatabaseInitializer cần DB ngay lúc startup, health endpoint chưa mở.
- Đây là lỗi hạ tầng kết nối từ môi trường chạy test. Cần chạy lại smoke test khi máy có thể truy cập Supabase/PostgreSQL.

## Lưu ý chất lượng

- Các cảnh báo package bảo mật hiện có (`Npgsql`, JWT packages) cần được cập nhật ở một task dependency riêng.
- API cũ vẫn chưa được thay thế; không được trộn ghi dữ liệu giữa `classes` cũ và các bảng mới trước khi hoàn tất Phase 2.
- Chưa xác nhận E2E với DB thật: booking atomic, payment hold/webhook, waitlist FIFO, cancel/reschedule và UI wizard vẫn cần triển khai/kiểm thử ở phase tiếp theo.

## Phase 3 — Đăng ký khóa học và hàng chờ

### Đã triển khai

- `POST /api/class-courses/{courseId}/enroll`: chỉ role `member` được gọi; bắt buộc `idempotencyKey` để client retry không tạo nhiều lần đăng ký.
- Một transaction khóa course, hết hạn các hold quá 30 phút, trả ghế, rồi tạo enrollment `held` hoặc đưa vào waitlist khi lớp đầy.
- `seats_taken` chỉ tăng khi còn chỗ; enrollment được gắn với tất cả session đang scheduled/rescheduled.
- Schema chuyển unique enrollment/waitlist theo trạng thái active, do đó vẫn lưu lịch sử expired/cancelled và cho phép một người đăng ký lại hợp lệ.

### Kiểm thử đã chạy

```powershell
dotnet build SmartGym.Tests\SmartGym.Tests.csproj --no-restore --verbosity minimal
dotnet test SmartGym.Tests\SmartGym.Tests.csproj --no-build --filter "FullyQualifiedName~ClassSchedulePolicyTests|FullyQualifiedName~ClassSchedulingApiContractTests" --verbosity minimal
```

Kết quả ngày 21/11/2026: build thành công, 0 error; 11 test pass, 0 fail. Test contract xác nhận endpoint enroll được đăng ký cùng với các endpoint workflow trước đó.

### Phần tiếp theo

- Cần nối payment callback để chuyển `held` sang `confirmed`, hủy/hoàn tiền và promote waitlist FIFO bằng transaction.
- Cần chạy integration/concurrency test với PostgreSQL thật trước khi release.

## Kiểm thử bổ sung — Thanh toán (21/11/2026)

### Lệnh đã chạy

```powershell
dotnet test SmartGym.Tests\SmartGym.Tests.csproj --no-build --filter "FullyQualifiedName~Flow3PaymentServiceTests|FullyQualifiedName~Flow3VNPayGatewayTests|FullyQualifiedName~Flow3SePayWebhookTests|FullyQualifiedName~Flow3InvoicesAndBillingTests|FullyQualifiedName~Flow3AuditReconciliationTests" --verbosity minimal
```

Kết quả: 42 pass, 0 fail. Đây là test unit/mock; không xác nhận được callback thật với VNPay/SePay vì backend hiện chưa khởi động được đến DB Supabase trong môi trường runner.

### Kết luận release

**Không đạt điều kiện production**. Các lỗi cần sửa trước khi mở thanh toán thật:

1. `POST /api/payments/create`, `/process`, `/{invoiceId}/process` và `/{invoiceId}/cancel` hiện chưa bắt buộc authorization. Đặc biệt endpoint `process` có thể đánh dấu invoice pending là đã thanh toán mà không có callback cổng thanh toán.
2. SePay webhook nhận API key không hợp lệ nhưng chỉ log cảnh báo rồi vẫn tiếp tục xử lý giao dịch. Đây là lỗi P0: request giả có thể được dùng để xác nhận thanh toán.
3. VNPay callback mới kiểm tra chữ ký và mã response; chưa đối chiếu merchant code, amount/currency với invoice và chưa lưu transaction number để chống replay/đối soát.
4. `ProcessPaymentAsync` không dùng transaction/optimistic concurrency, do đó hai callback đồng thời có thể cùng thấy invoice pending và chạy các side effect hai lần.
5. Payment của class-course mới chỉ tạo hold; chưa có callback được nối để chuyển enrollment `held` sang `confirmed`.

Khuyến nghị: khóa các endpoint process/cancel bằng RBAC, từ chối webhook không xác thực, thêm bảng payment transaction có unique gateway transaction ID, rồi viết integration test PostgreSQL cho replay/concurrency trước khi release.

## Sửa lỗi runtime — Coach đề xuất lớp chu kỳ (21/11/2026)

- Log runtime cho thấy EF Core ném lỗi `The required column 'parent_id' was not present in the results of a 'FromSql' operation` khi backend đọc dữ liệu `classes`.
- Nguyên nhân: `ClassSqlRawModel` đã có `parent_id`, `session_number` và `total_sessions`, nhưng một số raw SQL cũ chỉ chọn các cột lớp đơn lẻ. Các query kiểm tra trùng HLV/phòng được gọi trước khi lưu đề xuất nên đề xuất lớp chu kỳ bị dừng ở lỗi này.
- Đã cập nhật toàn bộ raw SQL dùng `ClassSqlRawModel` để trả đủ ba cột, đồng thời giữ các giá trị chu kỳ khi map sang `GroupClass`.
- Xác nhận: `dotnet build SmartGym.Tests\SmartGym.Tests.csproj --no-restore` thành công; bộ 21 test workflow pass, 0 fail. Cần restart backend đang chạy rồi gửi lại một đề xuất chu kỳ để xác nhận E2E với dữ liệu thật.

## Sửa lỗi proposal chu kỳ — migration và hiển thị lỗi (21/11/2026)

- Database initializer nay luôn bổ sung idempotent `parent_id`, `session_number` và `total_sessions` cho bảng `classes` cũ. Đây là metadata bắt buộc để đọc/lưu chuỗi lớp chu kỳ.
- Endpoint proposal ghi log exception bằng structured logging và trả `detail` an toàn hơn; frontend hiển thị `problem.detail` thay vì chỉ hiện thông báo 500 chung chung.
- Kiểm chứng: backend build thành công, 21 test workflow pass; frontend `npm run build` thành công.

## Chính sách dữ liệu payment booking

- Không xóa cứng invoice/payment đã hoàn thành: chúng còn dùng cho lịch sử hóa đơn, báo cáo doanh thu, hoàn tiền và đối soát.
- Khi hủy booking, phải cập nhật trạng thái booking/invoice theo transaction (`cancelled` hoặc `refunded`) thay vì xóa; chỉ nên purge dữ liệu demo pending chưa thanh toán sau backup và theo tiêu chí xác nhận rõ ràng.

## Bảng giá theo bộ môn, có hiệu lực theo thời gian (21/11/2026)

### Thiết kế đã áp dụng

- Thêm bảng `sport_class_pricing`: mỗi dòng là một phiên bản đơn giá/buổi của một bộ môn, có `effective_from`, `effective_to`, `is_active`, người tạo và thời điểm tạo/sửa.
- Khi backend khởi động, initializer tự tạo bảng, index và seed giá demo cho toàn bộ bộ môn hiện có nếu bộ môn đó chưa có giá mở. Giá demo ban đầu: Yoga/Cầu lông `120.000`, Bơi lội `180.000`, Boxing `200.000`, Bóng đá/Futsal `150.000`, Gym/Zumba `100.000`, Pilates `130.000` VND/buổi.
- Luồng `class-courses` không tin học phí do client gửi. Khi tạo/propose khóa, backend lấy giá đang hiệu lực theo bộ môn, tính `course_fee = price_per_session × total_sessions` và lưu snapshot vào `class_courses`. Vì vậy thay đổi bảng giá về sau không làm thay đổi học phí của khóa đã tạo.

### API quản lý

- `GET /api/class-pricing/` — Manager/Admin xem lịch sử giá theo môn.
- `GET /api/class-pricing/{sportId}/quote?totalSessions=20` — Coach/Manager/Admin xem báo giá theo số buổi.
- `PUT /api/class-pricing/{sportId}` — Manager/Admin tạo phiên bản giá mới, body:

```json
{
  "pricePerSession": 180000,
  "effectiveFrom": "2026-12-01"
}
```

- API đóng ngày hiệu lực của phiên bản cũ, không cập nhật đè giá cũ; do đó vẫn truy vết được giá đã áp dụng trong quá khứ. Không thể đặt ngày hiệu lực ở quá khứ.

### Kiểm thử đã chạy

```powershell
dotnet build backend\SmartGym.Tests\SmartGym.Tests.csproj --no-restore --verbosity minimal -p:BaseOutputPath=artifacts\pricing-bin\
dotnet vstest backend\SmartGym.Tests\artifacts\pricing-bin\Debug\net10.0\SmartGym.Tests.dll --TestCaseFilter:"FullyQualifiedName~ClassSchedulingApiContractTests"
```

Kết quả: build thành công (0 error); 8/8 test contract pass, gồm ba route bảng giá và năm route workflow khóa học.

### Giới hạn có chủ đích

- Form tạo lớp cũ hiện vẫn gọi `/api/classes` và `/api/classes/proposals`; nó chưa được chuyển sang `/api/class-courses`. Không hiển thị báo giá mới trong form cũ để tránh báo một giá nhưng lại ghi vào mô hình dữ liệu cũ không có snapshot giá.
- Để dùng hoàn toàn trên UI, bước tiếp theo là chuyển wizard này sang endpoint `class-courses`, hiển thị quote trước khi gửi và nối payment callback để xác nhận enrollment. Không nên ép giá vào client hoặc dùng lại giá hiện hành cho khóa đã tạo.
