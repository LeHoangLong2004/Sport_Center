# SPORT CENTER — TÀI LIỆU PHỐI HỢP FRONT-END VÀ BACK-END

- **Ngày biên soạn:** 06/10/2026, giờ Việt Nam.
- **Dự án:** Sports Center Management System — Hệ thống Quản lý Trung tâm Thể thao.
- **Repository:** https://github.com/LeHoangLong2004/Sport_Center
- **Mã nguồn tham chiếu:** Nhánh `main`, commit `01acae3`; nhánh `Long` tại `d63aa97` có cùng nội dung file trong lần kiểm tra gần nhất.
- **Mục đích:** Phân tích những tài liệu và quy ước cần thống nhất để FE–BE phối hợp đúng nghiệp vụ, bảo đảm tiến độ và chất lượng giao diện.
- **Phạm vi:** Xuất lại nội dung phân tích đã trao đổi. Đây chưa phải tài liệu API đầy đủ hoặc xác nhận mọi API đã chạy thành công.

> Các mục “hiện trạng” dựa trên mã nguồn đã đọc. Các lựa chọn thư viện, màu sắc và quy trình ghi “đề xuất” cần được nhóm thống nhất trước khi triển khai. Tài liệu này bổ sung cho `Sport_Center_Project_Specification.md`.

## 1. Định hướng phối hợp

Bốn nhóm tài liệu cần có:

1. API Documentation — hợp đồng dữ liệu giữa FE và BE.
2. UI/UX và hệ thống thiết kế — quy tắc hiển thị, tương tác và responsive.
3. Database Schema — mô hình dữ liệu và quan hệ nghiệp vụ.
4. Tech-stack và quy ước FE — thư viện, cấu trúc và cách xử lý dữ liệu.

Không cần chờ toàn bộ tài liệu hoàn chỉnh mới bắt đầu code. Nên hoàn thiện từng luồng có thể chạy xuyên suốt, ưu tiên **lịch dạy → danh sách học viên → điểm danh Coach**.

Phân biệt ba nguồn thông tin:

| Nguồn | Trả lời câu hỏi |
| --- | --- |
| Đặc tả nghiệp vụ | Hệ thống cần làm gì và ai được làm? |
| Hợp đồng API | FE gửi gì, BE trả gì và xử lý lỗi thế nào? |
| Mã nguồn/database hiện tại | Hệ thống đã triển khai đến đâu? |

Khi ba nguồn không khớp, cần ghi rõ khác biệt. Không tự coi dữ liệu demo hoặc một endpoint có sẵn là bằng chứng nghiệp vụ đã hoàn thành.

## 2. API Documentation — ưu tiên đầu tiên

### 2.1. Hiện trạng repo

Backend dùng ASP.NET Core và đã cấu hình các đường dẫn Swagger:

```text
/swagger
/swagger/v1/swagger.json
```

Đây là đường dẫn tương đối trên server backend đang chạy, không phải URL public đã được xác nhận.

FE hiện chuyển request `/api` qua Vite development proxy tới `VITE_API_URL`; mặc định là `http://localhost:5000`. Nhóm cần xác nhận backend thực tế chạy ở host/port nào. Cấu hình proxy phát triển không tự thay thế cấu hình kết nối API khi deploy.

Swagger mô tả endpoint và kiểu dữ liệu. Nhóm vẫn cần tài liệu nghiệp vụ để giải thích những điều như: Coach chỉ được điểm danh lớp nào, booking đã hủy có được sửa không và khi nào được mở điểm danh.

### 2.2. Thông tin cần có cho mỗi API

| Nội dung | Cần ghi rõ |
| --- | --- |
| Tên nghiệp vụ | Ví dụ: Lưu điểm danh một buổi học |
| Method và URL | GET/POST/PUT/DELETE và đường dẫn |
| Xác thực | Có cần Bearer token không? |
| Quyền | Role nào và quyền trên đối tượng cụ thể nào? |
| Path/query | Kiểu dữ liệu, bắt buộc/tùy chọn, giá trị mặc định |
| Request body | Tên trường, kiểu, nullable, enum, validation |
| Response thành công | HTTP status và cấu trúc JSON thực tế |
| Response lỗi | Sai dữ liệu, hết phiên, thiếu quyền, không tồn tại, xung đột |
| Quy tắc nghiệp vụ | Điều kiện hợp lệ và cách xử lý gửi lặp |
| Ví dụ | Request/response mẫu với ID nhất quán |
| Trạng thái triển khai | Đề xuất / đã code / đã kiểm thử |

Nên ghi thêm người phụ trách và ngày cập nhật khi hợp đồng dữ liệu thay đổi. FE và BE cần thống nhất cách biểu diễn ngày giờ, tiền, phân trang và lỗi; không tự áp một cấu trúc mới lên API cũ.

### 2.3. Hai API ưu tiên cho Coach

**Xem lịch dạy:**

```http
GET /api/schedule/coach?date=2026-10-07
Authorization: Bearer <token>
```

Mã hiện tại lấy danh tính từ token và tìm Coach tương ứng. DTO trả về danh sách lớp/buổi với các thông tin:

- `classId`, `className`.
- `sportName`, `facilityName`.
- `scheduleTime`, `durationMinutes`.
- `capacity`, `currentEnrolled`.
- `enrolledMembers`: mã học viên, họ tên, điện thoại và trạng thái booking.

Cần xác nhận quy ước múi giờ của tham số `date` và thời gian trả về bằng Swagger/response thực tế. Danh sách trên mô tả DTO đã đọc, chưa thay thế một mẫu response đã chạy thật.

**Lưu điểm danh:**

```http
POST /api/classes/{id}/attendance
Authorization: Bearer <token>
Content-Type: application/json
```

Payload theo DTO hiện tại, với UUID minh họa:

```json
{
  "attendanceList": [
    {
      "memberId": "11111111-1111-1111-1111-111111111111",
      "status": "attended"
    },
    {
      "memberId": "22222222-2222-2222-2222-222222222222",
      "status": "no_show"
    }
  ]
}
```

### 2.4. Sai khác cần thống nhất trước khi nối điểm danh

| FE hiện dùng | BE hiện nhận | Việc cần làm |
| --- | --- | --- |
| `present` | `attended` | Ánh xạ rõ ràng |
| `absent` | `no_show` | Ánh xạ rõ ràng |
| `late` | Chưa hỗ trợ | Bổ sung API hoặc tạm chưa cho chọn |
| Ghi chú | DTO chưa có trường | Bổ sung DTO nếu giữ chức năng nhập |

Không gửi thẳng `absent` vào API hiện tại: đoạn xử lý đã đọc chuyển giá trị khác `no_show` thành `attended`. Đây là nguy cơ ghi vắng thành có mặt.

Ngoài payload, cần kiểm tra:

- Coach có thực sự phụ trách buổi được sửa không?
- Học viên có booking hợp lệ trong buổi không?
- Lớp hoặc booking đã hủy có bị chặn không?
- Điểm danh được mở/khóa vào thời điểm nào?
- Có được sửa sau khi đã lưu không, ai được sửa và có lịch sử không?

### 2.5. Làm mock khi API chưa sẵn sàng

Mock phải theo hợp đồng dữ liệu đã thống nhất, không chỉ theo nhu cầu trang trí giao diện:

1. Giữ đúng kiểu dữ liệu và tên trường response.
2. Dùng chung ID giữa lịch, buổi, học viên và điểm danh.
3. Có dữ liệu thành công, rỗng, lỗi và không có quyền.
4. Không giả định `late` hoặc `note` đã được BE hỗ trợ.
5. Đặt mock sau lớp service để chuyển sang API thật mà không viết lại component.

Ví dụ component gọi `getCoachSchedule()`. Lớp service quyết định dùng dữ liệu mock hay gọi HTTP; JSX không cần biết dữ liệu đến từ đâu.

**Tài liệu tiếp theo nên tạo:** `docs/api-contract.md`, ưu tiên Auth, Coach Schedule và Attendance.

## 3. UI/UX — thống nhất hệ thống thiết kế

### 3.1. Hướng đi phù hợp repo

Repo đã có trang công khai và nhiều màn hình của bốn role. Nên dùng giao diện hiện có làm nền, chọn một số màn chuẩn và đồng bộ phần còn lại.

Một giao diện hiện đại cần nhất quán về bố cục, thứ bậc thông tin và phản hồi thao tác. Hiệu ứng đẹp không thay thế trạng thái tải, lỗi hoặc xác nhận lưu rõ ràng.

### 3.2. Những quyết định cần ghi vào tài liệu UI

| Thành phần | Nội dung cần thống nhất |
| --- | --- |
| Bố cục | Sidebar, topbar, vùng nội dung, chiều rộng và khoảng cách |
| Typography | Font, kích thước, độ đậm và thứ bậc tiêu đề |
| Màu | Thương hiệu, nền, chữ, viền và trạng thái |
| Component | Button, input, select, table, modal, badge, thông báo |
| Trạng thái màn hình | Loading, rỗng, lỗi, đang lưu và thành công |
| Responsive | Cách bảng, lịch và sidebar hoạt động trên màn hình nhỏ |
| Tương tác | Xác nhận hủy, thay đổi chưa lưu, chống bấm lặp |
| Khả năng sử dụng | Nhãn form, điều hướng bàn phím, focus, độ tương phản |

### 3.3. Bảng màu đề xuất

Các màu dưới đây tiếp nối hướng UI hiện tại, chưa phải bảng màu đã được nhóm chốt:

| Mục đích | Mã màu |
| --- | --- |
| Thương hiệu và nút chính | Rose `#E11D48` |
| Điểm nhấn khu Coach | Teal `#0F766E` |
| Sidebar tối | Slate `#0F172A` |
| Nền trang | `#F8FAFC` |
| Bề mặt card | `#FFFFFF` |
| Chữ chính | `#0F172A` |
| Chữ phụ | `#475569` |
| Viền | `#E2E8F0` |

Bốn role dùng chung nền tảng component và bố cục. Có thể thay đổi màu nhận diện nhẹ theo role. Trạng thái Có mặt, Vắng, Thành công hoặc Thất bại phải có ý nghĩa nhất quán và kèm chữ/icon, không chỉ phân biệt bằng màu.

### 3.4. Ba màn Coach cần chuẩn hóa trước

1. **Lịch dạy:** Ngày, giờ, môn, khu tập, số người đăng ký và thao tác mở buổi.
2. **Chi tiết buổi:** Thông tin buổi, trạng thái, danh sách học viên và giáo án liên quan.
3. **Điểm danh:** Thao tác nhanh, ít nhầm, biết rõ thay đổi nào đã được lưu.

Màn điểm danh nên có:

- Đầu trang: tên lớp, ngày giờ, khu tập.
- Thống kê: tổng học viên, có mặt, vắng, chưa ghi nhận.
- Bảng: học viên, trạng thái, ghi chú nếu API hỗ trợ.
- Nút lưu có trạng thái “Đang lưu…”.
- Cảnh báo khi rời trang còn thay đổi chưa lưu.
- Khi request lỗi, giữ dữ liệu nhập để thử lại.
- Chỉ báo lưu thành công sau khi backend xác nhận.

**Tài liệu tiếp theo nên tạo:** `docs/ui-design-system.md`. Figma hoặc ảnh mẫu được dùng làm tham chiếu; cần kèm quy tắc tương tác và trạng thái màn hình.

## 4. Database Schema — cần đối chiếu trước khi chốt

### 4.1. Các bản schema trong repo chưa đồng nhất

| File | Nhận xét từ lần đọc mã |
| --- | --- |
| `Frontend/database_schema_full.dbml` | Khai báo `SmartGym_OS_Legacy`; nhiều khóa dùng `int` |
| `database_schema_full.sql` | Nhiều khóa dùng `SERIAL`; mô tả đầu file và cú pháp chưa thống nhất |
| `supabase_schema.sql` | Dùng UUID ở nhiều bảng; có phân loại gói môn và gói nâng cấp |

Không nên nhìn DBML rồi mặc định ID gửi API là số. Backend có nhiều tham số `Guid`; FE biểu diễn các giá trị này bằng chuỗi UUID.

Đề xuất dùng schema Supabase làm cơ sở đối chiếu, kiểm tra tiếp với database đang chạy và mapping backend trước khi xác định nguồn chuẩn cuối cùng. Tài liệu này chưa xác nhận cấu trúc database live.

### 4.2. Trung tâm, khu tập và phòng/sân

Trong schema đã đọc, `facilities` có địa chỉ và hotline, khá giống cơ sở/chi nhánh. Yêu cầu dự án còn có khu riêng cho từng môn.

Cần định nghĩa rõ quan hệ:

```text
Trung tâm → Khu bộ môn → Phòng/sân cụ thể nếu có
```

Không dùng cùng một trường `facilityId` để vừa chỉ chi nhánh vừa chỉ phòng tập mà không có định nghĩa thống nhất. Phạm vi MVP vẫn có thể là một trung tâm với nhiều khu.

### 4.3. Hạng thành viên và quyền tập

- Thường/Plus/Pro quyết định tủ đồ, giảm giá gói tập và đặt lớp sớm.
- Subscription gói môn quyết định quyền tập môn, khu, thời hạn và hình thức hướng dẫn.
- Có Pro không tự cấp gói Gym, Bơi hoặc Yoga.
- Một Member có thể sở hữu nhiều gói môn độc lập.

Schema cần thể hiện được sự khác nhau giữa sản phẩm đang bán và quyền sử dụng mà Member đã mua.

### 4.4. Lớp và buổi học

Một lớp Yoga có thể có nhiều buổi. Điểm danh phải gắn với một buổi cụ thể.

Repo hiện dùng bản ghi `classes` có thời gian bắt đầu và thời lượng, nên về vận hành đang gần với một buổi. Khi nối FE cần dùng đúng ID và ghi rõ cách hiểu này; không giả định backend đã tách riêng lớp và buổi.

### 4.5. Booking và điểm danh

Đề xuất phân biệt:

| Nhóm trạng thái | Ví dụ |
| --- | --- |
| Booking | Đã đặt, học viên hủy, lớp bị hủy |
| Attendance | Chưa điểm danh, có mặt, đi trễ, vắng |

Việc phân biệt giúp giữ lịch sử đăng ký khi ghi nhận tham gia. Backend hiện dùng chung `class_bookings.status`; nếu chưa refactor, phải định nghĩa rõ các chuyển trạng thái và cách FE hiển thị.

### 4.6. Database không phải response API

Backend có thể ghép nhiều bảng để trả về một response lịch Coach có đủ tên môn, phòng và danh sách học viên. FE nên phụ thuộc DTO công khai, không phụ thuộc trực tiếp tên cột hoặc cấu trúc bảng database.

**Tài liệu tiếp theo nên tạo:** `docs/data-model.md`, gồm định nghĩa thực thể, kiểu ID, quan hệ, trạng thái và quy tắc chuyển trạng thái.

## 5. Tech-stack phụ trợ — đề xuất cho dự án

### 5.1. Hiện trạng

Repo đang sử dụng React, TypeScript, Vite, Tailwind, Framer Motion và `fetch`. Các thư viện quản lý form hoặc dữ liệu server trong bảng đề xuất dưới đây chưa có trong `package.json` đã đọc.

### 5.2. Bộ lựa chọn đề xuất

| Nhu cầu | Đề xuất | Lý do |
| --- | --- | --- |
| Gọi HTTP | Giữ `fetch`, tạo API client chung | Tận dụng code hiện có, thống nhất token và lỗi |
| Điều hướng | React Router | Route rõ theo role, trang chi tiết và URL trực tiếp |
| Phiên người dùng/theme | React Context | State dùng chung còn gọn |
| Dữ liệu từ backend | TanStack Query | Quản lý tải dữ liệu, cache và cập nhật sau thao tác |
| Form | React Hook Form + Zod | Thống nhất form và validation |
| Ngày giờ | Day.js, UTC/timezone khi cần | Phục vụ lịch dạy, thời hạn và giờ Việt Nam |
| Tiền tệ | `Intl.NumberFormat` | Không cần thêm thư viện riêng |
| Giao diện | Giữ Tailwind | Tiếp tục hệ thống đã có |
| Animation | Giữ Framer Motion, dùng vừa đủ | Đã cài; ưu tiên phản hồi thao tác và chuyển cảnh ngắn |

Không cần cài mọi thư viện cùng lúc. Nhóm nên thống nhất lựa chọn, phiên bản tương thích và phạm vi áp dụng trước. Sau khi cài cần commit lockfile để các thành viên dùng cùng bộ dependency.

### 5.3. Phân biệt các loại state

**State giao diện:** Modal đang mở, tab đang chọn, bộ lọc đang nhập, dữ liệu form chưa lưu. Thường dùng state của component hoặc Context khi thực sự cần chia sẻ.

**State từ server:** Lớp học, booking, hồ sơ, gói tập, kết quả điểm danh. Cần quản lý tải lại, cache, lỗi và đồng bộ sau thao tác.

React Context phù hợp để chia sẻ phiên người dùng hoặc theme; có thể kết hợp reducer khi logic chung tăng lên. TanStack Query phục vụ dữ liệu server, không thay thế database và không tự khiến người dùng ở máy khác thấy thay đổi tức thì.

Ví dụ sau khi Coach lưu điểm danh:

1. Gửi request lưu.
2. Backend kiểm tra và xác nhận.
3. Làm mới dữ liệu buổi/lịch liên quan trong cache.
4. UI hiển thị kết quả đã lưu.

Người dùng khác nhận thay đổi khi tải lại dữ liệu hoặc qua cơ chế realtime riêng nếu nhóm triển khai.

### 5.4. Redux Toolkit và Zustand

Chưa cần thêm Redux Toolkit hoặc Zustand nếu Context và TanStack Query đáp ứng được yêu cầu. Nếu nhóm đã thống nhất Redux Toolkit/RTK Query, nên dùng nhất quán thay vì thêm một hệ thống cache dữ liệu server nữa.

Mục tiêu là giảm cách làm trùng nhau, không phải chọn thư viện có nhiều tính năng nhất.

### 5.5. Form và validation

React Hook Form hỗ trợ tích hợp Zod qua resolver. FE dùng validation để phản hồi sớm; backend vẫn phải kiểm tra dữ liệu và quy tắc nghiệp vụ.

Ví dụ: FE có thể kiểm tra thời lượng lớn hơn 0, nhưng kiểm tra trùng lịch Coach và quyền đặt lớp phải thực hiện ở backend.

### 5.6. Ngày giờ

Day.js có plugin timezone và phụ thuộc plugin UTC. Dù dùng thư viện nào, nhóm cần chốt:

- API truyền thời gian UTC hay thời gian có offset.
- Hiển thị lịch theo múi giờ Việt Nam.
- Tham số lọc ngày có nghĩa là ngày theo múi giờ nào.
- Ngày sinh chỉ là ngày, không tự xử lý giống timestamp của buổi học.
- Mốc hết hạn gói và hạn hủy lớp được tính ở backend, FE hiển thị nhất quán.

**Tài liệu tiếp theo nên tạo:** `docs/frontend-conventions.md`, gồm thư viện được chọn, route, API client, state, form, ngày giờ và cấu trúc module.

## 6. Thứ tự hoàn thiện tài liệu và triển khai

| Thứ tự | Tài liệu | Kết quả cần đạt |
| --- | --- | --- |
| 1 | `api-contract.md` | FE–BE thống nhất request/response cho lịch và điểm danh Coach |
| 2 | `ui-design-system.md` | Có component chung và ba màn Coach chuẩn |
| 3 | `data-model.md` | Chốt ID, gói, khu tập, buổi, booking và điểm danh |
| 4 | `frontend-conventions.md` | Chốt thư viện, route, API client, form và tổ chức module |

Bốn tên file trên là tài liệu đề xuất tiếp theo; file hiện tại là bản phân tích tổng hợp, không tuyên bố đã tạo đủ bốn tài liệu đó.

### 6.1. Thông tin cần leader xác nhận để bắt đầu phần Coach

- Địa chỉ Swagger/backend chạy được.
- Tài khoản Coach thử nghiệm đã có lớp được phân công; trao đổi thông tin đăng nhập qua kênh riêng, không ghi mật khẩu vào tài liệu chung.
- Buổi học và học viên mẫu dùng cho kiểm thử.
- Backend có bổ sung trạng thái đi trễ và trường ghi chú hay chưa.
- Backend có kiểm tra Coach phụ trách đúng buổi hay chưa.
- Quy tắc thời điểm mở/khóa điểm danh và sửa sau khi lưu.

Những phần còn lại có thể tiếp tục soạn từ repo và đặc tả dự án, không cần mô tả lại toàn bộ hệ thống.

### 6.2. Kết quả cần đạt ở luồng đầu tiên

Coach đăng nhập, thấy đúng lịch được phân công, mở đúng danh sách học viên, lưu điểm danh hợp lệ và tải lại vẫn thấy kết quả. Member xem được kết quả của chính mình. Các trường hợp không đủ quyền, booking đã hủy và lưu thất bại phải được xử lý rõ ràng.

## 7. Tài liệu tham khảo

Nguồn mã dự án và tài liệu chính thức đã được dùng trong phần phân tích:

- Repository: https://github.com/LeHoangLong2004/Sport_Center
- React — Scaling Up with Reducer and Context: https://react.dev/learn/scaling-up-with-reducer-and-context
- TanStack Query — Overview: https://tanstack.com/query/latest/docs/framework/react/overview
- React Router — Routing: https://reactrouter.com/start/declarative/routing
- React Hook Form — Resolvers: https://github.com/react-hook-form/resolvers
- Day.js — Timezone: https://day.js.org/docs/en/plugin/timezone

---

**Ghi chú:** Tài liệu được xuất từ phần phân tích đã trao đổi, không chỉnh sửa source code và không cài thêm thư viện. Khi repository hoặc hợp đồng API thay đổi, cần cập nhật những mục hiện trạng tương ứng trước khi triển khai.
