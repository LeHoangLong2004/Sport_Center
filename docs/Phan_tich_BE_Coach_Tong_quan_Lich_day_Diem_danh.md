# Phân tích Backend cho Coach: Tổng quan, Lịch dạy và Điểm danh

- **Dự án:** Sports Center Management System.
- **Repository:** https://github.com/LeHoangLong2004/Sport_Center.git
- **Commit đã đọc:** `ae05459594d22b88e4b06b09741b70016a36f671`, ngày 10/10/2026.
- **Ngày lập tài liệu:** 11/10/2026.
- **Mục đích:** Giải thích BE hiện tại và xác định các phần cần bổ sung để triển khai ba màn hình Coach đã thống nhất.
- **Phạm vi kiểm chứng:** Phân tích mã nguồn và SQL; chưa chạy BE với database thực tế. Bảng có trong SQL không đồng nghĩa database đang triển khai đã có bảng đó. Chưa sửa code.
- **Cách đọc:** “Hiện trạng” là những gì quan sát được trong Git tại commit trên; “đề xuất” là thiết kế cần triển khai, không phải chức năng đã hoàn thành.

## Kết luận về hiện trạng

BE đã có nền tảng để phát triển ba màn hình Tổng quan, Lịch dạy và Điểm danh, nhưng các API riêng của Coach hiện còn dùng nhiều dữ liệu giả. Một số chức năng thật nằm ở API khác và chưa được nối thống nhất với Coach.

Việc cần làm trước tiên là thống nhất các nhánh dữ liệu, thay API Coach giả bằng service thật, rồi nối quyền gói với booking và điểm danh.

## 1. BE hiện được tổ chức và hoạt động như thế nào?

### 1.1. Các tầng của BE

| Project | Trách nhiệm | Những phần liên quan Coach |
|---|---|---|
| `SmartGym.Api` | Nhận request, xác thực, trả response | `CoachEndpoints`, các API lớp học, lịch, đặt lớp |
| `SmartGym.Application` | Xử lý nghiệp vụ | `ClassService`, `BookingService`, DTO và interface repository |
| `SmartGym.Domain` | Các đối tượng và quy tắc nền tảng | User, Subscription, Package, WorkoutPlan… |
| `SmartGym.Infrastructure` | Truy cập database và dịch vụ bên ngoài | EF Core, PostgreSQL, Supabase, repository |

Luồng xử lý mong muốn: **FE → API → Service nghiệp vụ → Repository → Database.**

Trong Git hiện tại, cách này chưa đồng đều: có endpoint gọi service, có endpoint truy vấn database trực tiếp, có endpoint trả dữ liệu giả.

### 1.2. Ba vấn đề phải thống nhất trước khi nối FE

| Vấn đề | Hiện trạng trong Git | Ảnh hưởng |
|---|---|---|
| Hai nguồn lịch Coach | `/api/coach/schedule` trả dữ liệu giả; `/api/schedule/coach` đọc database | Hai màn hình có thể hiển thị lịch khác nhau |
| Hai hệ thống đặt lớp | Một nhánh dùng `classes`, `class_bookings`, `subscriptions`; nhánh khác dùng `class_schedules`, `bookings`, `member_packages` | Member đặt thành công ở một nhánh nhưng Coach có thể không thấy |
| Nhiều cách biểu diễn Coach | Có `users.id`, `coaches.id`, đồng thời có `coach_profiles` | Dễ lấy nhầm ID khi lọc lịch hoặc kiểm tra quyền |

**Đề xuất:** Với ba màn hình này, ưu tiên mở rộng nhánh `ClassService` đang đọc `classes`, `class_bookings`, `subscriptions`, kết hợp `pt_sessions`. Những API cũ còn được FE sử dụng phải chuyển về cùng service hoặc có lớp chuyển đổi rõ ràng.

Không nên tạo thêm một hệ thống lịch và booking thứ ba. Trước khi thay đổi bảng, cần kiểm tra dữ liệu đang dùng và API mà FE thực sự gọi để lập phương án chuyển đổi.

### 1.3. Các file mã nguồn chính được đối chiếu

Các đường dẫn sau tính từ thư mục gốc repository:

- `backend/SmartGym.Api/Endpoints/CoachEndpoints.cs`
- `backend/SmartGym.Api/Program.cs`
- `backend/SmartGym.Api/Endpoints/BookingEndpoints.cs`
- `backend/SmartGym.Application/Services/ClassService.cs`
- `backend/SmartGym.Application/Services/BookingService.cs`
- `backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabaseGroupClassRepository.cs`
- `backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabasePtSessionRepository.cs`
- `backend/SmartGym.Infrastructure/Persistence/EF/SmartGymDbContext.cs`
- `backend/SmartGym.Api/Services/PackageCatalogService.cs`
- `supabase_schema.sql`

Bản mã nguồn cố định để đối chiếu: https://github.com/LeHoangLong2004/Sport_Center/tree/ae05459594d22b88e4b06b09741b70016a36f671

## 2. Tổng quan — BE đang có gì và cần thêm gì?

### 2.1. Hiện trạng

API `GET /api/coach/dashboard` đang trả các số cố định:

```json
{
  "totalSessions": 12,
  "completedSessions": 8,
  "totalMembers": 45,
  "upcomingClasses": 3
}
```

Những số này chưa được tính từ lịch của Coach đang đăng nhập.

Trong khi đó, dữ liệu lớp học, booking và Coach đã có nền tảng truy vấn thật. Có thể tận dụng để xây dựng Tổng quan.

### 2.2. Nghiệp vụ cần làm

Tổng quan là màn hình tổng hợp từ Lịch dạy và Điểm danh; không nên lưu riêng một bộ số liệu do FE tự cập nhật.

| Thành phần | BE cần tính như thế nào? |
|---|---|
| Buổi dạy hôm nay | Các buổi nhóm và PT thuộc Coach trong ngày, loại trừ buổi đã hủy |
| Buổi sắp tới | Buổi chưa kết thúc, sắp xếp theo giờ bắt đầu |
| Buổi chờ điểm danh | Các buổi đã đến thời điểm được điểm danh nhưng chưa chốt |
| Buổi đã chốt điểm danh | Các buổi có phiên điểm danh ở trạng thái `finalized` |
| Học viên trong ngày | Đếm học viên khác nhau trong các booking hợp lệ của những buổi đó |
| Yêu cầu đổi lịch | Các yêu cầu của Coach đang chờ xử lý |
| Lịch rảnh PT | Các khoảng rảnh còn khả dụng, không trùng lịch đã xác nhận |

Cần đặt tên chỉ số chính xác: **“đã qua giờ kết thúc” không tự động có nghĩa “đã hoàn thành buổi dạy”**. Nếu chưa xây dựng trạng thái hoàn thành buổi, nên hiển thị “Đã chốt điểm danh” thay vì suy diễn.

### 2.3. API đề xuất

Giữ đường dẫn hiện tại, thay phần xử lý giả:

```http
GET /api/coach/dashboard?date=2026-10-11
```

Response nên chia rõ:

```json
{
  "date": "2026-10-11",
  "timezone": "Asia/Ho_Chi_Minh",
  "summary": {
    "totalSessions": 4,
    "finalizedSessions": 1,
    "pendingAttendanceSessions": 1,
    "uniqueMembers": 18
  },
  "upcomingSessions": [],
  "pendingAttendance": [],
  "pendingScheduleRequests": []
}
```

Các con số chỉ minh họa cấu trúc. BE phải lấy Coach từ tài khoản đăng nhập. FE không được truyền một `coachId` bất kỳ để xem Tổng quan của người khác.

### 2.4. Liên kết với Lịch dạy và Điểm danh

- Nhấn một buổi sắp tới → mở đúng buổi trong Lịch dạy.
- Nhấn “Chờ điểm danh” → mở Điểm danh của đúng buổi.
- Chốt điểm danh → tải lại dữ liệu Tổng quan.
- Manager duyệt đổi lịch → Tổng quan dùng thời gian mới.
- Member đặt PT thành công → buổi PT xuất hiện trong lịch và Tổng quan.

**Phần cần bổ sung:** `CoachDashboardService`, DTO tổng quan và các truy vấn tổng hợp theo Coach/ngày. Chưa cần tạo bảng thống kê riêng.

## 3. Lịch dạy — BE đang có gì và cần thêm gì?

### 3.1. Hiện trạng

| API | Hiện trạng |
|---|---|
| `/api/coach/schedule` | Hai buổi mẫu, chưa sử dụng thực sự bộ lọc ngày |
| `/api/schedule/coach?date=...` | Đọc lịch thật qua `ClassService`, ánh xạ tài khoản sang Coach |

Nhánh lịch thật hiện lấy các bản ghi trong `classes`, có thông tin môn, khu/phòng và học viên đăng ký.

Tuy nhiên:

- Chưa trả lịch nhóm và PT thành một danh sách thống nhất.
- Chưa có truy vấn khoảng ngày phù hợp lịch tuần.
- Trong phần BE đã kiểm tra, chưa thấy luồng hoàn chỉnh để đăng ký lịch rảnh, Member đặt PT và gửi yêu cầu đổi lịch.
- `classes` hiện chứa thời gian cụ thể; về mặt dữ liệu, mỗi bản ghi đang gần với **một buổi học** hơn là một lớp kéo dài nhiều tháng.

### 3.2. Trả dữ liệu cho lịch tuần T2–CN

FE chịu trách nhiệm vẽ bảy cột ngày và các hàng giờ. BE chịu trách nhiệm trả đúng những buổi nằm trong khoảng thời gian đó.

```http
GET /api/coach/schedule?startDate=2026-10-05&endDate=2026-10-11
```

BE chuyển khoảng ngày theo múi giờ trung tâm sang khoảng truy vấn thời gian. Nên dùng mốc đầu bao gồm, mốc cuối không bao gồm để tránh sót dữ liệu cuối ngày. Với ví dụ trên, mốc cuối truy vấn là đầu ngày 12/10 theo múi giờ trung tâm.

Một buổi cần có:

| Trường | Ý nghĩa |
|---|---|
| `sessionId` | ID buổi học |
| `sessionType` | `group` hoặc `pt` |
| `title` | Tên lớp/buổi |
| `sportId`, `sportName` | Bộ môn |
| `facilityId`, `roomName` | Khu/phòng |
| `startAt`, `endAt` | Thời gian bắt đầu và kết thúc |
| `bookingCount`, `capacity` | Số đăng ký và sức chứa |
| `sessionStatus` | Trạng thái buổi học |
| `attendanceState` | Chưa điểm danh/nháp/đã chốt |
| `version` | Phát hiện dữ liệu đã bị người khác thay đổi |

Nếu tiếp tục lưu nhóm và PT ở hai bảng, phải định danh bằng **loại buổi + ID**, tránh nhầm nguồn dữ liệu. Cơ chế định danh này phải thống nhất cả API đọc, lưu và URL điều hướng FE.

BE không cần lưu màu ô lịch hay chiều cao ô; đó là phần trình bày của FE.

### 3.3. Xem chi tiết một buổi

Hiện `/api/coach/sessions/{sessionId}` trả dữ liệu mẫu. Cần thay bằng dữ liệu thật:

- Thông tin buổi và Coach phụ trách.
- Khu, phòng, môn.
- Danh sách booking hợp lệ.
- Trạng thái điểm danh.
- Giáo án được giao nếu đã có.
- Yêu cầu đổi lịch đang xử lý.
- Những hành động Coach được phép thực hiện.

API danh sách học viên hiện lấy hai Member đầu tiên trong database, chưa lấy theo booking. Đây là phần phải sửa trước khi làm điểm danh thật.

### 3.4. Coach đăng ký lịch rảnh để Member đặt PT

Cần phân biệt:

- **Khoảng rảnh:** Coach cho phép nhận lịch.
- **Buổi PT:** lịch hẹn cụ thể đã được đặt/xác nhận.

Luồng đề xuất:

1. Coach tạo khoảng rảnh, chọn môn, địa điểm và thời lượng nhận PT.
2. BE kiểm tra lịch dạy và lịch rảnh trùng nhau.
3. Member xem các suất còn đặt được.
4. Member chọn suất.
5. BE kiểm tra quyền PT trong gói môn và số buổi còn lại.
6. BE giữ suất và giữ lượt tập trong cùng giao dịch.
7. Tạo buổi PT, cập nhật lịch hai bên và gửi thông báo.

Cần bổ sung dữ liệu lịch rảnh, ngoại lệ ngày nghỉ và liên kết buổi PT với nguồn quyền lợi đã mua.

**Hai Member cùng đặt một suất phải chỉ có một người thành công.** Kiểm tra trên FE không đủ; BE cần cơ chế khóa hoặc ràng buộc chống trùng phù hợp.

### 3.5. Coach bận và muốn đổi lịch

Đề xuất giữ nguyên nguyên tắc đã trao đổi: **Coach gửi yêu cầu; không tự ý đổi một buổi đã có học viên.**

Yêu cầu gồm:

- Buổi cần đổi.
- Thời gian hiện tại và thời gian đề xuất.
- Lý do.
- Phương án đổi giờ hoặc đổi Coach.
- Người tạo, thời gian tạo.
- Trạng thái xử lý.
- Người duyệt và lý do từ chối nếu có.

Trong lúc chờ duyệt, lịch cũ vẫn có hiệu lực.

Khi duyệt, BE phải kiểm tra lại:

- Coach có trùng lịch không.
- Khu/phòng còn khả dụng không.
- Buổi có bị thay đổi kể từ lúc gửi yêu cầu không.
- Gói của học viên có bị ảnh hưởng bởi ngày mới không.
- Với PT, Member đã đồng ý thời gian mới chưa.
- Với dạy thay, Coach thay thế có phù hợp và đã nhận lịch chưa.

Chỉ khi đáp ứng các điều kiện mới cập nhật lịch chính thức và thông báo.

Git đã có kiểm tra trùng lịch trong một phần nghiệp vụ sửa lớp; có thể tách thành service dùng chung để tái sử dụng.

**Không được từ chối học viên âm thầm nếu trung tâm dời buổi sang sau ngày hết hạn gói.** Cần chính sách bảo lưu quyền của booking cũ, hoàn lượt hoặc cấp buổi bù.

## 4. Điểm danh — BE đang có gì và cần thêm gì?

### 4.1. Hiện trạng có ba phần chưa nối với nhau

| Phần | Đang hoạt động thế nào? |
|---|---|
| API Coach lưu nháp/chốt | Lưu trong `ConcurrentDictionary`, mất khi ứng dụng khởi động lại |
| API điểm danh lớp thật | Ghi trực tiếp trạng thái vào `class_bookings` |
| File SQL | Đã định nghĩa bảng phiên điểm danh, chi tiết và lịch sử sửa |

Ba bảng đã có trong `supabase_schema.sql`:

- `class_attendance_sheets`: trạng thái, phiên bản, người và thời điểm chốt.
- `class_attendance_records`: trạng thái từng học viên, ghi chú.
- `class_attendance_audits`: người sửa, lý do, thay đổi trước/sau.

**Nên tận dụng ba bảng này**, bổ sung entity/repository/service và migration cần thiết; không tạo bộ bảng trùng chức năng.

Một lỗi đáng chú ý trong API điểm danh thật: mọi giá trị khác `"no_show"` hiện đều chuyển thành `"attended"`. Nếu gửi `"late"` hoặc `"excused"` thì ý nghĩa sẽ bị mất.

### 4.2. Chọn ngày → chọn buổi → tải danh sách

Luồng BE:

1. Lấy ngày Coach chọn.
2. Truy vấn các buổi thuộc Coach trong ngày.
3. Trả trạng thái điểm danh cho từng buổi.
4. Khi mở buổi, kiểm tra quyền phụ trách.
5. Lấy học viên từ booking hợp lệ.
6. Ghép với dữ liệu điểm danh đã lưu.

Học viên đã hủy hoặc chỉ đang chờ chỗ không được mặc định đưa vào danh sách chính thức. Nhánh đặt lớp hiện có tạo trạng thái `pending`, vì vậy nhóm phải định nghĩa rõ **pending có được tham gia hay cần bước xác nhận**.

### 4.3. Tách ba loại trạng thái

| Loại | Ví dụ |
|---|---|
| Booking | Chờ xác nhận, đã xác nhận, đã hủy |
| Phiên điểm danh | `unmarked`, `draft`, `finalized` |
| Điểm danh học viên | `present`, `late`, `absent`, `excused`, chưa đánh dấu |

Không dùng một trường `class_bookings.status` thay cho cả ba.

Đến giờ kết thúc không tự biến tất cả người chưa đánh dấu thành vắng.

### 4.4. Lưu nháp

API có thể giữ đường dẫn hiện tại:

```http
POST /api/coach/sessions/{sessionId}/attendance/draft
```

Ví dụ payload đề xuất:

```json
{
  "sessionType": "group",
  "expectedVersion": 3,
  "records": [
    {
      "memberId": "uuid-hoc-vien",
      "status": "present",
      "note": ""
    }
  ]
}
```

`uuid-hoc-vien` là placeholder; khi gọi API phải thay bằng UUID thật.

BE kiểm tra:

- Người gọi có quyền điểm danh buổi này.
- Buổi không bị hủy.
- Member thực sự thuộc danh sách.
- Trạng thái nằm trong danh sách hợp lệ.
- Phiên chưa chốt.
- Phiên bản gửi lên còn đúng.

Sau đó lưu database và tăng phiên bản.

**Lưu nháp chưa trừ lượt tập.**

### 4.5. Chốt điểm danh

```http
POST /api/coach/sessions/{sessionId}/attendance/finalize
```

BE cần:

1. Kiểm tra quyền, thời điểm và trạng thái buổi.
2. Kiểm tra dữ liệu bắt buộc đã đủ.
3. Kiểm tra phiên bản.
4. Chốt bản ghi điểm danh.
5. Ghi người chốt, thời điểm chốt.
6. Xử lý lượt tập theo chính sách.
7. Lưu lịch sử và tạo sự kiện thông báo.

Các thay đổi nghiệp vụ phải được xử lý nhất quán trong giao dịch. Gửi thông báo nên thực hiện sau khi giao dịch thành công; có thể dùng outbox khi triển khai.

**Bấm chốt hai lần hoặc gửi lại request do mạng chậm không được trừ hai lượt.**

### 4.6. Sửa sau khi chốt

Cần thao tác riêng, không dùng lưu nháp để ghi đè:

```http
POST /api/coach/sessions/{sessionId}/attendance/amend
```

Yêu cầu:

- Có lý do sửa.
- Kiểm tra quyền và thời hạn cho phép sửa.
- Lưu trạng thái trước/sau.
- Ghi người sửa và thời gian.
- Nếu ảnh hưởng lượt tập, tạo giao dịch điều chỉnh thay vì xóa lịch sử cũ.

Có thể quy định Coach được sửa trong một khoảng thời gian; sau đó Manager xử lý. Đây là **chính sách đề xuất cần nhóm chốt**, chưa phải quy tắc đã có trong Git.

### 4.7. Điểm danh PT

Ba bảng SQL hiện liên kết với `classes`, nên chưa trực tiếp phục vụ `pt_sessions`.

Cần chọn một thiết kế thống nhất, chẳng hạn:

- Phiên điểm danh có `class_id` hoặc `pt_session_id`.
- Ràng buộc đúng một trong hai trường được có giá trị.
- Mỗi buổi chỉ có một phiên điểm danh.
- Chi tiết và audit tham chiếu phiên điểm danh.

Không chỉ thêm `sessionType` vào request rồi bỏ qua liên kết thật trong database.

### 4.8. Điểm danh Coach và check-in lễ tân

Hai nghiệp vụ cần tách biệt:

- Lễ tân: thành viên đã đến trung tâm/khu tập.
- Coach: thành viên có tham gia buổi học cụ thể.

Check-in có thể cung cấp thông tin hỗ trợ; không tự động xác nhận đã học.

## 5. Nối với Gói thành viên và Gói môn như thế nào?

### 5.1. Những phần đã có

Đây là phần cần làm đúng ngay vì ảnh hưởng cả booking và điểm danh.

Git đã có phần hữu ích:

- Phân loại `membership` và `sport`.
- Hình thức `self`, `group`, `coach`.
- Kỳ hạn 1, 3, 6, 12 tháng.
- Số buổi/tháng và thời lượng buổi.
- Lưu `PackageSnapshotJson` khi tạo đơn.
- Có kiểm tra quyền môn dựa trên subscription đã thanh toán.

Tuy nhiên, kiểm tra quyền môn hiện có chưa đủ thay cho kiểm tra quyền **đặt một buổi cụ thể**. `ClassService.BookClassAsync` đang chọn subscription đã thanh toán và còn hạn, chưa kiểm tra đầy đủ loại gói, môn và hình thức tập.

Đáng chú ý, comment trong SQL còn đề cập membership cho phép tập tất cả môn. **Nội dung này trái với mô hình đã chốt và cần sửa để tránh nhóm triển khai nhầm.** Đây là comment trong SQL, không nên coi là bằng chứng rằng quyền này đã được triển khai đầy đủ.

### 5.2. Quy tắc cần thống nhất

| Gói | Quyền liên quan Coach |
|---|---|
| Cơ bản/Plus/Premium | Ưu đãi, thời điểm mở đặt sớm; không tự cấp quyền học |
| Môn `self` | Vào đúng khu, sử dụng thiết bị theo điều kiện; không mặc định được học nhóm/PT |
| Môn `group` | Đặt lớp nhóm đúng môn theo quyền và hạn mức |
| Môn `coach` | Cần định nghĩa rõ là PT 1–1 trong hợp đồng dữ liệu, nếu dùng theo mô hình đã trao đổi |

Hạng thành viên có thể cung cấp tủ đồ, giảm giá và đặt lớp sớm theo cấu hình; quyền vào tập vẫn phải đến từ gói môn tương ứng.

Nên thêm service dùng chung, ví dụ `TrainingEntitlementService`, để trả lời:

> Member này có quyền đặt buổi này, tại thời điểm này, từ subscription nào?

Service kiểm tra:

- Thanh toán hoàn tất.
- Gói có hiệu lực tại thời gian diễn ra buổi.
- Đúng môn và khu được phép.
- Đúng hình thức nhóm/PT.
- Đúng hạn mức của kỳ.
- Đúng cửa sổ đặt sớm.
- Không trùng lịch cá nhân.

**Mỗi booking phải lưu nguồn quyền lợi cụ thể.** Không đến lúc trừ lượt mới tìm một “gói đang hoạt động” bất kỳ.

Khi tính quyền lợi đã mua, dùng bản chụp của subscription theo chính sách đã công bố, tránh việc Manager sửa danh mục làm thay đổi âm thầm quyền của các đơn cũ.

### 5.3. Quản lý lượt tập

Với gói giới hạn số buổi, cần sổ giao dịch lượt tập:

| Sự kiện | Xử lý đề xuất |
|---|---|
| Đặt buổi thành công | Giữ một lượt |
| Hủy đúng hạn | Hoàn lượt đang giữ |
| Có mặt/đến muộn và chốt | Chuyển lượt giữ thành đã dùng |
| Vắng/hủy muộn | Áp dụng chính sách đã công bố |
| Trung tâm hủy buổi | Hoàn lượt hoặc cấp quyền học bù |
| Sửa điểm danh | Ghi giao dịch điều chỉnh, không sửa mất dấu |

Gói 12 tháng có 8 buổi/tháng không mặc định cho dùng cả 96 buổi ngay. BE cần quản lý kỳ sử dụng và quy tắc cộng dồn nếu có.

Quy tắc vắng có phép, vắng không phép, hủy muộn, học bù và cộng dồn cần được nhóm thống nhất; tài liệu này không coi các đề xuất đó là chính sách đã có sẵn trong code.

## 6. Danh sách phần BE cần bổ sung

| Thành phần | Cách làm phù hợp Git hiện tại |
|---|---|
| Xác thực Coach | Thêm authorization cho nhóm `/api/coach`; hiện nhóm này chưa được bảo vệ ngay tại endpoint |
| Quyền theo buổi | Kiểm tra Coach phụ trách/dạy thay, không chỉ kiểm tra role |
| Chuẩn hóa ID Coach | Dùng một resolver từ tài khoản đăng nhập sang hồ sơ Coach |
| Tổng quan | Thêm service tổng hợp dữ liệu thật |
| Lịch tuần | Mở rộng truy vấn khoảng ngày, kết hợp nhóm và PT |
| Chi tiết/roster | Lấy từ buổi và booking thật |
| Lịch rảnh | Thêm dữ liệu, API và kiểm tra trùng |
| Yêu cầu đổi lịch | Thêm trạng thái phê duyệt, lịch sử và xử lý chấp thuận liên quan |
| Điểm danh | Kết nối ba bảng đã có trong SQL vào service thật |
| Điểm danh PT | Mở rộng quan hệ dữ liệu |
| Quyền sử dụng gói | Service dùng chung cho đặt lớp, PT và kiểm tra hạn mức |
| Lượt tập | Sổ giữ/dùng/hoàn/điều chỉnh theo đúng subscription |
| Thông báo | Lưu thật, phát sinh từ đổi lịch, đặt PT và các sự kiện cần thiết |

Trong `Application`, có thể chia service như sau để dễ làm việc:

```text
Services/
  CoachDashboardService.cs
  CoachScheduleService.cs
  CoachAvailabilityService.cs
  ScheduleChangeRequestService.cs
  AttendanceService.cs
  TrainingEntitlementService.cs
```

Đây là **cấu trúc đề xuất**, chưa phải các file đã có. Repository và DTO tương ứng tiếp tục đặt trong các tầng hiện tại của nhóm.

Phần xử lý quyền gói nên nằm trong `Application`, dùng chung cho mọi role; không để mỗi endpoint tự diễn giải JSON quyền lợi theo cách khác nhau.

## 7. Thứ tự triển khai để tránh làm lại

1. **Chốt nguồn dữ liệu chuẩn:** booking, buổi nhóm, PT, subscription và ID Coach.
2. **Bảo vệ API Coach:** đăng nhập, đúng role và đúng buổi phụ trách.
3. **Làm lịch và roster thật:** lịch tuần, chi tiết, danh sách học viên.
4. **Làm quyền gói và lượt tập:** trước khi cho đặt/chốt các buổi có hạn mức.
5. **Làm điểm danh:** tải → nháp → chốt → sửa có lịch sử.
6. **Làm Tổng quan:** tính từ dữ liệu lịch và điểm danh đã ổn định.
7. **Hoàn thiện lịch rảnh/PT/đổi lịch:** sau đó bổ sung các thẻ tương ứng lên Tổng quan.

Dù mô tả theo thứ tự **Tổng quan → Lịch dạy → Điểm danh**, khi code nên làm dữ liệu lịch và điểm danh trước vì Tổng quan phụ thuộc hai phần đó.

### Các tình huống bắt buộc kiểm tra

- Coach A không xem hoặc sửa điểm danh của Coach B.
- Member chỉ có Plus/Premium không được đặt lớp nếu thiếu gói môn.
- Gói Gym không cấp quyền đặt Yoga.
- Lưu nháp rồi khởi động lại BE vẫn còn dữ liệu.
- Hai người sửa cùng phiên nhận cảnh báo xung đột.
- Gửi chốt hai lần chỉ tiêu thụ một lượt.
- Hai Member tranh cùng suất PT không tạo hai lịch.
- Duyệt đổi lịch cập nhật đồng nhất Coach, Member và Manager.

## Ghi chú sử dụng tài liệu với nhóm hoặc Antigravity

Đây là bản phân tích và định hướng triển khai dựa trên commit nêu ở đầu tài liệu. Trước khi code trên một commit mới hơn, cần đối chiếu lại các endpoint, model và migration liên quan để tránh tạo trùng phần nhóm đã bổ sung.

Các API, DTO và service được ghi là đề xuất cần được chốt thành hợp đồng FE–BE trước khi nối giao diện. Không thay dữ liệu giả bằng một bộ mock khác rồi coi là hoàn tất nghiệp vụ.

BE có thể tiếp tục phát triển trên nền hiện tại. Trọng tâm là thống nhất dữ liệu, thực thi quyền trên server, lưu điểm danh bền vững và nối booking với đúng gói đã thanh toán.
