# Cẩm nang review và giải thích backend SmartGym

Tài liệu này tổng hợp các nghiệp vụ backend có khả năng được Hội đồng hỏi sâu, câu hỏi/đáp án mẫu, đường dẫn file cần mở và cách đọc từng dòng ở các đoạn code cốt lõi. Phạm vi tập trung vào các luồng đã review: thanh toán, booking, check-in, lịch lớp, Flow 5, xác thực/phân quyền, POS và background service.

> Cách dùng: học luồng nghiệp vụ trước, sau đó mở file và lần theo số dòng/khối code. Khi thuyết trình, phân biệt **code hiện tại đang làm gì** với **điều nên bổ sung khi triển khai production**. Một số ghi chú trong tài liệu nêu rủi ro hoặc khoảng trống đã thấy trong code; không nên che giấu nếu Hội đồng hỏi trực tiếp.

## 1. Bản đồ backend và cách một request đi qua hệ thống

### Cấu trúc

- `SmartGym.Api`: Minimal API endpoints, middleware, cấu hình DI và mapping route.
- `SmartGym.Application`: service nghiệp vụ, interface, DTO và validation.
- `SmartGym.Domain`: entity, enum và quy tắc miền.
- `SmartGym.Infrastructure`: repository, EF Core/Supabase, JWT/password hashing và tích hợp ngoài.
- `SmartGym.Tests`: test service, gateway, policy và hợp đồng API.

### File khởi động và đăng ký route

- [Program.cs](backend/SmartGym.Api/Program.cs)
- [ServiceCollectionExtensions.cs](backend/SmartGym.Api/Extensions/ServiceCollectionExtensions.cs)
- [EndpointRouteExtensions.cs](backend/SmartGym.Api/Extensions/EndpointRouteExtensions.cs)
- [LegacyCatalogEndpoints.cs](backend/SmartGym.Api/Endpoints/LegacyCatalogEndpoints.cs)

`Program.cs` tạo builder, đăng ký service và security, build app, khởi tạo database, cài middleware, map health endpoint và gọi `MapSmartGymEndpoints()`. `EndpointRouteExtensions` gọi các nhóm route; `MapLegacyCatalogEndpoints()` lại map Auth, Payment, Coach, Member, Booking, Check-in, Workout Plans và nhiều nhóm khác. Vì vậy muốn biết route có chạy hay không phải lần theo cả chuỗi mapping, không chỉ thấy một file endpoint tồn tại.

### Đáp án mẫu: request qua backend

“Request vào endpoint trong `SmartGym.Api`; middleware xử lý CORS, authentication và authorization. Endpoint nhận DTO, kiểm tra quyền/đầu vào rồi gọi service ở `Application`. Service chạy quy tắc nghiệp vụ qua interface repository. Implementation ở `Infrastructure` truy cập PostgreSQL qua EF Core hoặc Supabase. Kết quả được endpoint chuyển thành HTTP response/DTO.”

### Câu hỏi kiến trúc thường gặp

| Câu hỏi | Đáp án gợi ý |
|---|---|
| Vì sao chia layer? | Để tách HTTP, nghiệp vụ, miền dữ liệu và chi tiết lưu trữ/tích hợp. Có thể thay implementation repository/gateway mà ít ảnh hưởng service. |
| DTO khác entity thế nào? | Entity mô hình hóa dữ liệu miền/persistence; DTO là hợp đồng trao đổi API. Trả DTO giúp tránh lộ trường nội bộ và tránh gắn API trực tiếp với schema. |
| DI có ích gì? | Giảm phụ thuộc implementation cụ thể, giúp thay service và test bằng fake/mock. |
| Vì sao vừa EF Core vừa Supabase? | Code đăng ký hai nhóm repository. Cần nói theo từng module/bảng thay vì khẳng định một cơ chế duy nhất. Đây cũng là điểm cần giải thích về ranh giới dữ liệu và transaction. |

## 2. Ưu tiên cao nhất: thanh toán, hóa đơn và đối soát

### File cần mở

- [PaymentService.cs](backend/SmartGym.Application/Services/PaymentService.cs)
- [PaymentEndpoints.cs](backend/SmartGym.Api/Endpoints/PaymentEndpoints.cs)
- [PaymentEndpoints.Invoices.cs](backend/SmartGym.Api/Endpoints/PaymentEndpoints.Invoices.cs)
- [SePayWebhookEndpoints.cs](backend/SmartGym.Api/Endpoints/SePayWebhookEndpoints.cs)
- [VnPayGateway.cs](backend/SmartGym.Infrastructure/Services/VnPayGateway.cs)
- [ProductOrderPaymentService.cs](backend/SmartGym.Infrastructure/Services/ProductOrderPaymentService.cs)
- [InvoiceRepository.cs](backend/SmartGym.Infrastructure/Persistence/EF/InvoiceRepository.cs)
- [SubscriptionRepository.cs](backend/SmartGym.Infrastructure/Persistence/EF/SubscriptionRepository.cs)
- Test: [Flow3PaymentServiceTests.cs](backend/SmartGym.Tests/Flow3PaymentServiceTests.cs), [Flow3VNPayGatewayTests.cs](backend/SmartGym.Tests/Flow3VNPayGatewayTests.cs), [Flow3SePayWebhookTests.cs](backend/SmartGym.Tests/Flow3SePayWebhookTests.cs), [Flow3InvoicesAndBillingTests.cs](backend/SmartGym.Tests/Flow3InvoicesAndBillingTests.cs), [Flow3AuditReconciliationTests.cs](backend/SmartGym.Tests/Flow3AuditReconciliationTests.cs).

### Luồng nghiệp vụ

1. API nhận yêu cầu tạo giao dịch.
2. `PaymentService.CreatePaymentAsync` kiểm tra amount, user, package và invoice pending có thể là trùng.
3. Tạo `Subscription` và `Invoice` ở trạng thái `Pending`.
4. Nếu là VNPay, gateway dựng URL có chữ ký; callback được xác minh trước khi service xử lý.
5. Nếu là SePay, webhook xác thực API key, lấy mã giao dịch/nội dung/số tiền rồi đối soát với order.
6. Khi thanh toán thành công, invoice và subscription được chuyển trạng thái, ngày hiệu lực được tính.

### Giải thích từng dòng: `PaymentService.CreatePaymentAsync`

Tham chiếu: [PaymentService.cs, dòng 28](backend/SmartGym.Application/Services/PaymentService.cs:28).

| Dòng | Ý nghĩa |
|---|---|
| 28–30 | Khai báo hàm bất đồng bộ nhận user, package, amount, payment method và các lựa chọn kỳ hạn/gia hạn. Kết quả là `PaymentCreationResult`. |
| 32–33 | Chặn amount bằng hoặc nhỏ hơn 0; trả lỗi ngay, không gọi repository ghi dữ liệu. |
| 35–36 | Tìm user. Nếu không tồn tại thì không tạo thanh toán. |
| 38–46 | Nếu có package ID thì tìm package; từ chối package không tồn tại, inactive hoặc không phải loại membership. |
| 49 | Lấy invoice của user để dò giao dịch chờ gần đây. |
| 50–55 | Lọc invoice pending cùng tổng tiền, mới tạo trong `DuplicateWindow`, xếp invoice mới nhất lên trước. |
| 57–59 | Nếu thấy giao dịch tương tự thì trả lại invoice cũ thay vì tạo invoice thứ hai. Đây là heuristic, không phải khóa idempotency tuyệt đối. |
| 61–62 | Chuẩn hóa chu kỳ thanh toán và chọn ngày bắt đầu; mặc định dùng UTC hiện tại. |
| 64–75 | Tạo Subscription pending, gắn user/package/amount/payment method/kỳ hạn và ngày kết thúc dự kiến. Chưa có nghĩa là đã thanh toán. |
| 77–83 | Tạo Invoice pending riêng. Invoice ghi nhận khoản phải thu/giao dịch; subscription mô tả quyền sử dụng gói. |
| 85–86 | Gọi hai repository để ghi Subscription rồi Invoice. Đây là hai lời gọi riêng; cần kiểm tra transaction của implementation để biết có nguyên tử không. |
| 88 | Trả invoice ID để frontend tiếp tục thanh toán. |

### Giải thích từng dòng: `ProcessPaymentAsync`

Tham chiếu: [PaymentService.cs, dòng 91](backend/SmartGym.Application/Services/PaymentService.cs:91).

| Dòng | Ý nghĩa |
|---|---|
| 93–94 | Đọc invoice; chỉ tiếp tục nếu tồn tại và trạng thái đúng là Pending. Đây là lớp idempotency cơ bản. |
| 96–97 | Yêu cầu `ProductOrderPaymentService` finalize đơn POS liên quan; nếu không thành công thì dừng. |
| 99–100 | Đánh dấu invoice Completed và ghi thời điểm thanh toán UTC. |
| 102–103 | Tìm subscription pending liên quan invoice; nếu tìm được mới tiếp tục kích hoạt gói. |
| 105–106 | Đánh dấu subscription Completed và chuẩn hóa billing period. |
| 109–116 | Tìm subscription completed cùng user/package còn hiệu lực và lấy ngày kết thúc xa nhất để nối tiếp hạn. |
| 118–123 | Nếu ngày bắt đầu dự kiến không nằm trong tương lai thì bắt đầu tại ngày kết thúc package đang hiệu lực, hoặc hiện tại nếu không có; tính lại EndDate. |
| 125 | Lưu subscription đã cập nhật. |
| 128 | Lưu invoice đã cập nhật. Lưu ý thứ tự hai lần lưu; nếu không chung transaction, lỗi giữa chừng có thể gây lệch trạng thái. |
| 129 | Báo xử lý thành công. |

### Giải thích VNPay theo từng khối dòng

Tham chiếu: [VnPayGateway.cs](backend/SmartGym.Infrastructure/Services/VnPayGateway.cs).

| Dòng | Ý nghĩa |
|---|---|
| 17–24 | Gateway implement `IVnPayGateway`; nhận `IOptions<VnPayOptions>` qua DI và giữ cấu hình đã bind. |
| 26–29 | `IsConfigured` yêu cầu URL, TmnCode và HashSecret không rỗng. |
| 31–44 | Hàm dựng payment URL; nếu cấu hình thiếu thì ném lỗi có thông báo rõ. |
| 46 | Lấy giờ hiện tại UTC cộng 7 giờ theo yêu cầu ngày giờ VNPay; nếu test truyền `createdAt` thì dùng giá trị đó. |
| 48–66 | Tạo SortedDictionary để thứ tự key ổn định. `TxnRef` là invoice ID dạng Guid không dấu gạch; amount nhân 100 và làm tròn theo đơn vị VNPay; URL có ngày tạo/hết hạn 15 phút. |
| 68–71 | Dựng query đã encode, ký HMAC-SHA512 bằng HashSecret và thêm secure hash vào URL. |
| 74–87 | Xử lý callback: từ chối nếu chưa cấu hình hoặc thiếu secure hash. |
| 89–97 | Tạo lại dictionary tham số theo thứ tự, bỏ `vnp_SecureHash` và `vnp_SecureHashType` vì chúng không được dùng để tự ký lại. |
| 99–103 | Tính chữ ký kỳ vọng và so sánh không phân biệt hoa thường; mismatch thì callback không hợp lệ. |
| 105–115 | Đọc response code, transaction number và parse `vnp_TxnRef` thành invoice Guid. |
| 117–123 | Trả kết quả chữ ký hợp lệ cùng thông tin callback; service phía trên mới quyết định success/failure. |
| 126–130 | `BuildQuery` URL-encode key/value và nối bằng `&`. |
| 132–137 | Tạo HMACSHA512 bằng key bytes, ký data bytes, trả hex chữ thường. |

### SePay: phải giải thích đúng giới hạn hiện tại

Tham chiếu: [SePayWebhookEndpoints.cs](backend/SmartGym.Api/Endpoints/SePayWebhookEndpoints.cs).

- DTO hỗ trợ nhiều tên field khác nhau của SePay v1/v2; các property `EffectiveAmount` và `EffectiveContent` chọn giá trị phù hợp.
- `IsMemoMatched` kiểm tra số tiền trong ngưỡng sai số, thử khớp memo nguyên chuỗi rồi kiểm tra các phần định danh không phải từ chung.
- Webhook kiểm tra API key theo cấu hình, loại trừ giao dịch outbound/không hợp lệ, rồi thử khớp đơn.
- `TryConfirmSubscriptionOrder` và `TryConfirmInvoiceOrder` có kiểm tra trạng thái đã thanh toán và số tiền trước khi ghi nhận.
- Một phần `_transactionLogs` là `static List` trong bộ nhớ, được bảo vệ bằng `lock`, giữ tối đa 500 dòng. Nó không bền khi restart và không chia sẻ nhiều instance.
- Thanh toán đặt lớp được ghi vào bảng `class_booking_payment_holds` bằng SQL update có điều kiện cho phép nhận cùng transaction ID hoặc chưa có ID.
- Không được khẳng định “đã chống replay tuyệt đối” chỉ từ log in-memory. Muốn đảm bảo bền vững cần lưu mã transaction ngân hàng có unique constraint và xử lý trong transaction.

### Câu hỏi – đáp án mẫu về thanh toán

| Hội đồng hỏi | Trả lời |
|---|---|
| Vì sao tạo Invoice và Subscription riêng? | Invoice là chứng từ giao dịch/thu tiền; Subscription là quyền sử dụng membership theo một khoảng thời gian. Một là khoản thanh toán, một là entitlement. |
| Callback VNPay giả mạo bị chặn thế nào? | Gateway dựng lại chuỗi tham số đã sắp xếp, tính HMAC với secret và so sánh với chữ ký nhận được; chỉ callback hợp lệ mới được đưa tiếp vào xử lý nghiệp vụ. |
| Callback lặp thì sao? | `ProcessPaymentAsync` chỉ nhận invoice Pending. Callback sau khi Completed sẽ không xử lý thành công lần nữa. Với request đồng thời vẫn cần transaction/conditional update ở DB. |
| Gia hạn nối tiếp ra sao? | Tìm package cùng loại đã Completed còn hạn; nếu có thì dùng EndDate cũ làm StartDate mới, nếu không thì dùng thời điểm hiện tại; cộng kỳ hạn để ra EndDate. |
| Rủi ro duplicate heuristic? | Cùng user và số tiền trong 10 phút có thể là lần mua khác hợp lệ. Payment attempt ID duy nhất sẽ phân biệt ý định tốt hơn. |
| Nếu invoice xong, subscription lỗi? | Đây là lỗi nhất quán cần transaction bao quanh hai thay đổi. Hiện cần xác minh repository transaction; không nên mặc định hai lệnh Add/Update nguyên tử. |
| Hoàn tiền tìm subscription bằng gì? | Đoạn code hiện tìm subscription Completed cùng user và cùng số tiền; nếu có nhiều cái như vậy có thể không duy nhất. Nên có liên kết invoice-subscription rõ ràng. |

## 3. Booking lớp học, sức chứa và waitlist

### File cần mở

- [BookingService.cs](backend/SmartGym.Application/Services/BookingService.cs)
- [BookingEndpoints.cs](backend/SmartGym.Api/Endpoints/BookingEndpoints.cs)
- [ClassEndpoints.Bookings.cs](backend/SmartGym.Api/Endpoints/ClassEndpoints.Bookings.cs)
- [SupabaseBookingRepository.cs](backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabaseBookingRepository.cs)
- [SupabaseClassScheduleRepository.cs](backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabaseClassScheduleRepository.cs)
- [SupabaseGroupClassRepository.Bookings.cs](backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabaseGroupClassRepository.Bookings.cs)

### Giải thích từng dòng: `CreateBookingAsync`

Tham chiếu: [BookingService.cs, dòng 30](backend/SmartGym.Application/Services/BookingService.cs:30).

| Dòng | Ý nghĩa |
|---|---|
| 30–33 | Hàm nhận member ID và schedule ID; trả booking hoặc thông báo lỗi. |
| 35–39 | Tìm schedule. Không có thì dừng. |
| 41–44 | Từ chối lịch đã bị hủy. |
| 46–47 | Lấy UTC hiện tại và tính còn bao lâu đến lớp. |
| 49–55 | Từ chối nếu lớp đã bắt đầu/đã diễn ra. |
| 57–60 | Chặn đặt lịch xa hơn 7 ngày. |
| 62–66 | Chặn member đặt cùng schedule lần nữa nếu đã có booking bất kỳ được trả về bởi repository. |
| 68–85 | Duyệt các booking confirmed/swapped của member; tải lịch tương ứng và kiểm tra giao nhau bằng `A.Start < B.End && B.Start < A.End`. |
| 87–91 | Yêu cầu member có package hoạt động. |
| 93–99 | Nếu số booking hiện tại đạt sức chứa, đếm waitlist và từ chối khi đã có 5 người. |
| 101–114 | Tạo booking Waitlist, vị trí bằng `waitlistCount + 1`, rồi lưu. |
| 117–129 | Nếu còn chỗ, tạo booking Confirmed và lưu. |
| 131–134 | Tăng số booking trên object schedule rồi trả kết quả. **Dòng 132 có comment rằng chưa gọi repository update schedule**; cần xác minh repository có side effect nào khác không. Đừng nói số chỗ chắc chắn đã persist nếu chưa kiểm tra. |

### Hủy và nâng người từ waitlist

| Dòng | Ý nghĩa |
|---|---|
| 142–148 | Nhận booking ID và member ID; lỗi nếu booking không tồn tại. |
| 150–153 | Chỉ chủ booking mới được hủy. |
| 155–158 | Không cho hủy lần nữa booking đã Cancelled. |
| 160–164 | Tải schedule; lỗi nếu schedule không còn. |
| 166–168 | Tính còn bao lâu; hủy trước giờ dưới 2 tiếng được đánh dấu late cancellation. |
| 170–172 | Ghi nhận booking trước đó có confirmed hay không; gọi domain method Cancel và lưu. |
| 176–178 | Nếu booking confirmed thì giảm số chỗ đã đặt trong object schedule. |
| 180–188 | Lấy người đầu waitlist; nếu có thì chuyển Confirmed, lưu và tăng lại số booking. |
| 191 | Trả thành công, cờ late cancellation và booking được promote. |

### Điểm phản biện phải nắm

Trong `CreateBookingAsync`, code có comment rõ rằng schedule chưa được gọi update repository sau `IncrementBookings()`. Trong cancel cũng thấy tăng/giảm trên object; cần kiểm tra entity/repository có lưu side effect hay không. Đặt câu hỏi “làm sao chống hai request cùng lấy chỗ cuối?” là hợp lý: service hiện đọc số chỗ rồi mới ghi, nên muốn bảo đảm concurrency phải dùng transaction/atomic update/constraint ở DB. Test capacity hiện là unit test cho validator, không tự chứng minh concurrency thật ở database.

### Câu hỏi – đáp án mẫu

| Câu hỏi | Trả lời |
|---|---|
| Điều kiện booking? | Schedule tồn tại/chưa hủy/chưa bắt đầu/trong cửa sổ 7 ngày, chưa booking trùng, không đụng lịch khác, member có package active, còn chỗ hoặc waitlist chưa đầy. |
| Quy tắc trùng giờ? | Hai khoảng giao nhau nếu khoảng đầu bắt đầu trước khi khoảng kia kết thúc và khoảng kia bắt đầu trước khi khoảng đầu kết thúc. |
| Vì sao waitlist tối đa 5? | Đây là giới hạn nghiệp vụ được hard-code trong service; nếu chính sách thay đổi nên đưa thành cấu hình. |
| Hai người cùng tranh chỗ cuối? | Kiểm tra ở application có race condition. Giải pháp là transaction và cập nhật atomic/khóa ở database, cộng unique constraint chống booking trùng. |
| Hủy booking thì sao? | Booking chuyển Cancelled; nếu đang confirmed thì lấy người đầu waitlist promote sang confirmed. Cờ late cancellation trả về nếu còn dưới 2 giờ. |

## 4. Check-in/check-out và kiểm soát package

### File cần mở

- [CheckInService.cs](backend/SmartGym.Application/Services/CheckInService.cs)
- [CheckInEndpoints.cs](backend/SmartGym.Api/Endpoints/CheckInEndpoints.cs)
- [SupabaseCheckInRepository.cs](backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabaseCheckInRepository.cs)
- [SupabaseMemberPackageRepository.cs](backend/SmartGym.Infrastructure/Persistence/Supabase/Repositories/SupabaseMemberPackageRepository.cs)
- Test: [Flow4CheckInServiceTests.cs](backend/SmartGym.Tests/Flow4CheckInServiceTests.cs), [Flow4AttendanceCalculationTests.cs](backend/SmartGym.Tests/Flow4AttendanceCalculationTests.cs).

### Walkthrough dòng code

Tham chiếu: [CheckInService.cs](backend/SmartGym.Application/Services/CheckInService.cs).

| Dòng | Ý nghĩa |
|---|---|
| 25–30 | Hàm check-in nhận member, timestamp, facility tùy chọn và phương thức check-in. |
| 32–36 | Tìm phiên chưa checkout; nếu có thì không cho mở phiên thứ hai. |
| 38–43 | Tìm package active; nếu không có, vẫn ghi lại một record bị từ chối để audit rồi trả lý do. |
| 45–49 | So ngày check-in với ngày EndDate; nếu vượt hạn thì ghi Denied. Cần chú ý đây là so sánh `.Date` với `EndDate`, nên cần thống nhất kiểu ngày và timezone. |
| 51–56 | Tải thông tin plan; không có plan thì ghi Denied. |
| 58–78 | Với plan OffPeak, từ 16:00 trở đi bị từ chối và có ghi log. |
| 80–88 | Nếu package có giới hạn buổi và còn 0 hoặc thấp hơn thì từ chối, ghi log. |
| 90–92 | Chọn facility truyền vào nếu hợp lệ; nếu không thì fallback sang branch của package. |
| 94–103 | Ghi record Approved rồi trả thông báo thành công và tên plan. |
| 106–112 | Checkout yêu cầu có phiên mở. |
| 114–118 | Chuẩn hóa timestamp vào UTC và từ chối checkout sớm hơn check-in. |
| 120–124 | Repository cập nhật phiên; trả thành công hoặc lỗi nếu không cập nhật được. |
| 126–132 | `ToUtc` giữ UTC, chuyển Local sang UTC; với Unspecified thì gán Local rồi chuyển. Điều này phụ thuộc timezone máy chủ, nên dữ liệu đầu vào cần được xác định timezone rõ. |

### Đáp án mẫu

“Check-in kiểm tra trước đó có phiên đang mở không, sau đó xác minh package active, hạn gói, plan, quyền giờ OffPeak và số buổi còn lại. Kết quả bị từ chối cũng được ghi lại để có lịch sử. Check-out tìm phiên mở, chuẩn hóa thời gian và kiểm tra không checkout trước check-in.”

## 5. Lịch lớp định kỳ và sức chứa phòng

### File cần mở

- [ClassSchedulingEndpoints.cs](backend/SmartGym.Api/Endpoints/ClassSchedulingEndpoints.cs)
- [ClassSchedulePolicy.cs](backend/SmartGym.Application/Services/ClassSchedulePolicy.cs)
- [ClassCourseWorkflowService.cs](backend/SmartGym.Api/Services/ClassCourseWorkflowService.cs)
- [ClassService.Schedule.cs](backend/SmartGym.Application/Services/ClassService.Schedule.cs)
- [ClassService.Management.cs](backend/SmartGym.Application/Services/ClassService.Management.cs)
- [ClassService.Lifecycle.cs](backend/SmartGym.Application/Services/ClassService.Lifecycle.cs)
- [FacilityConflictValidator.cs](backend/SmartGym.Application/Common/FacilityConflictValidator.cs)
- Test: [ClassSchedulePolicyTests.cs](backend/SmartGym.Tests/ClassSchedulePolicyTests.cs), [ClassSchedulingApiContractTests.cs](backend/SmartGym.Tests/ClassSchedulingApiContractTests.cs), [Flow2FacilityCapacityTests.cs](backend/SmartGym.Tests/Flow2FacilityCapacityTests.cs).

### `ClassSchedulePolicy.Preview` — từng khối

Tham chiếu: [ClassSchedulePolicy.cs, dòng 11](backend/SmartGym.Application/Services/ClassSchedulePolicy.cs:11).

| Dòng | Ý nghĩa |
|---|---|
| 11–15 | Chạy validation chung trước; có lỗi thì trả preview invalid ngay. |
| 17 | Chuẩn hóa schedule type: bỏ khoảng trắng và viết hoa. |
| 18–22 | Với `ONE_TIME`, tạo đúng một session và trả kết quả hợp lệ. |
| 24–26 | Với lịch recurring, chạy validation bổ sung và dừng nếu có lỗi. |
| 28–33 | Chuyển days of week thành set và yêu cầu start date phải là ngày học đầu tiên đã chọn. |
| 35–37 | Sinh các session; nếu rỗng thì trả lỗi. |
| 39–45 | Trả preview kèm danh sách buổi, ngày cuối và số lượng. |
| 47–71 | Validation nền: schedule type hợp lệ, thời lượng 30–180 phút, toàn buổi nằm trong 06:00–22:00, ngày/giờ bắt buộc và buổi đầu cách hiện tại ít nhất 24 giờ. |
| 73–95 | Validation recurring yêu cầu ngày trong tuần, số tuần 1–24 và hiện chỉ hỗ trợ `BY_WEEKS`. |
| 97–111 | Tính ngày cuối bằng `start + weeks*7 - 1`, đi từng ngày và thêm buổi nếu weekday thuộc set đã chọn. |
| 113–118 | Ghép ngày/giờ thành `DateTime` không timezone, sau đó gán offset Việt Nam +07:00 và cộng duration. |
| 120–121 | Chuẩn hóa kết quả invalid: không có sessions, không có ngày cuối, số buổi 0. |

### Sức chứa và lớp xung đột

Trong [FacilityConflictValidator.cs](backend/SmartGym.Application/Common/FacilityConflictValidator.cs):

- `IsBlockingClass` loại lớp inactive, pending và rejected; lớp active thiếu approval status vẫn được xem là đang chiếm phòng để tương thích dữ liệu cũ.
- `Validate` kiểm tra sĩ số lớp yêu cầu không vượt sức chứa phòng.
- Nếu cho phép nhiều lớp cùng lúc, kiểm tra số lớp chồng giờ và tổng sức chứa của các lớp cộng lớp mới.
- Nếu không cho phép đồng thời, chỉ cần có lớp chồng giờ là trả lỗi.

### Endpoint workflow và phân quyền

Trong [ClassSchedulingEndpoints.cs](backend/SmartGym.Api/Endpoints/ClassSchedulingEndpoints.cs):

- `POST /schedule-preview`: admin/manager/coach được xem preview.
- `POST /`: manager/admin tạo course và approve ngay.
- `POST /proposals`: coach tạo đề xuất, chưa approve.
- `PUT /{courseId}/approve`: manager/admin duyệt.
- `POST /{courseId}/enroll`: member đăng ký.
- `TryGetUserId` đọc NameIdentifier hoặc `sub` claim.

### Câu hỏi – đáp án

“Preview chỉ sinh lịch và kiểm tra chính sách; nó không đồng nghĩa đã lưu course. Lịch recurring lặp qua các ngày trong khoảng số tuần và tạo session ở weekday được chọn. Xung đột phòng kiểm tra cả số lớp đồng thời lẫn tổng capacity. Việc tạo proposal, tạo đã duyệt, approve và enroll là endpoint riêng với role khác nhau.”

## 6. Flow 5: AI giáo án, lifecycle và assignment

### File cần mở

- [Flow5WorkoutPlanEndpoints.cs](backend/SmartGym.Api/Endpoints/Flow5WorkoutPlanEndpoints.cs)
- [Flow5EndpointHelpers.cs](backend/SmartGym.Api/Endpoints/Flow5EndpointHelpers.cs)
- [Flow5RecommendationService.cs](backend/SmartGym.Application/Services/Flow5RecommendationService.cs)
- [Flow5PromptBuilder.cs](backend/SmartGym.Application/Services/Flow5PromptBuilder.cs)
- [Flow5RecommendationJsonParser.cs](backend/SmartGym.Application/Services/Flow5RecommendationJsonParser.cs)
- [Flow5WorkoutPlanValidator.cs](backend/SmartGym.Application/Services/Flow5WorkoutPlanValidator.cs)
- [Flow5WorkoutPlanService.cs](backend/SmartGym.Application/Services/Flow5WorkoutPlanService.cs)
- [Flow5AssignmentService.cs](backend/SmartGym.Application/Services/Flow5AssignmentService.cs)
- [Flow5ContextService.cs](backend/SmartGym.Infrastructure/Context/Flow5ContextService.cs)
- [GeminiRecommendationProvider.cs](backend/SmartGym.Infrastructure/AI/GeminiRecommendationProvider.cs)
- Test: [Flow5RecommendationServiceTests.cs](backend/SmartGym.Tests/Flow5RecommendationServiceTests.cs), [Flow5AssignmentServiceTests.cs](backend/SmartGym.Tests/Flow5AssignmentServiceTests.cs), [Flow5ApiContractTests.cs](backend/SmartGym.Tests/Flow5ApiContractTests.cs), [Flow5MovementBiomechanicalValidationTests.cs](backend/SmartGym.Tests/Flow5MovementBiomechanicalValidationTests.cs).

### Pipeline tạo gợi ý

1. Endpoint yêu cầu đăng nhập, resolve coach.
2. Authorization service kiểm tra coach được làm việc với target member/class.
3. Context service dựng thông tin target/sport cần cho prompt.
4. Recommendation service validate request.
5. Prompt builder dựng prompt; provider gọi Gemini.
6. Parser giải mã JSON; validator kiểm tra output.
7. Nếu provider/output lỗi, tạo recommendation fallback theo quy tắc.
8. Trả preview, chưa lưu tự động.
9. Coach lưu draft/approve; sau khi approved mới được assign.

### Ý nghĩa các service

- `Flow5RecommendationService`: điều phối provider, parser, validator, fallback và dựng response preview.
- `Flow5WorkoutPlanValidator`: giới hạn trường, thứ tự exercise, sets/reps/duration/rest và ràng buộc nội dung.
- `Flow5WorkoutPlanService`: create/update draft, approve, clone, archive; kiểm tra owner, status và version.
- `Flow5AssignmentService`: yêu cầu plan thuộc coach, đã approved, target hợp lệ; lấy member của lớp hoặc một member; repository chỉ tạo assignment còn thiếu.
- `AiMetadata`: ghi provider/model/prompt version/thời gian/tokens để truy xuất nguồn gợi ý.

### Giải thích từng dòng: assignment

Tham chiếu: [Flow5AssignmentService.cs, dòng 27](backend/SmartGym.Application/Services/Flow5AssignmentService.cs:27).

| Dòng | Ý nghĩa |
|---|---|
| 27–31 | Hàm assign nhận coach, plan, request và cancellation token. |
| 33–35 | Tải plan; không có thì trả not_found. |
| 36–37 | Chỉ coach sở hữu plan mới được phân công. |
| 38–39 | Chỉ plan approved mới assign được. |
| 40–41 | Nếu client gửi ExpectedVersion và version hiện tại khác thì trả conflict vì client đang dùng bản cũ. |
| 42–43 | Bắt buộc target tồn tại và có ID khác empty. |
| 45–46 | Chuẩn hóa target type, chuẩn bị danh sách member IDs. |
| 47–53 | Target là member: tải user, yêu cầu user tồn tại và active, tạo danh sách một member. |
| 54–61 | Target là class: lấy danh sách member đủ điều kiện; lớp không có member phù hợp thì trả lỗi. |
| 62–65 | Loại target khác member/class bị từ chối. |
| 67–72 | Nếu plan chưa thuộc loại homework thì chuyển loại và persist cập nhật. |
| 74–80 | Gọi repository tạo các progress rows còn thiếu; gửi hạn bài tập/notes/cancellation token. |
| 82–100 | Tạo response: số tạo, số bỏ qua (đã tồn tại), map từng assignment và timestamp. |
| 102 | Trả kết quả thành công. |
| 105–108 | Helper đóng gói lỗi thành kết quả service thống nhất. |

### Câu hỏi – đáp án

| Câu hỏi | Trả lời |
|---|---|
| Vì sao validate output AI? | AI không đảm bảo đúng schema, độ dài hoặc giới hạn nghiệp vụ. Parse và validate trước khi dùng để tránh dữ liệu hỏng. |
| AI lỗi thì sao? | Recommendation service tạo fallback theo luật, nên endpoint vẫn có thể trả bản xem trước. |
| Vì sao không tự lưu gợi ý? | AI chỉ cung cấp draft; coach cần xem xét và chịu trách nhiệm duyệt trước khi lưu/assign. |
| ExpectedVersion làm gì? | Phát hiện client gửi bản plan cũ; tránh ghi đè thay đổi mới hơn. |
| Chống assignment trùng? | `AssignMissingBatchAsync` trả các assignment mới; rows đã có được bỏ qua. Nên kết hợp unique constraint DB để bảo vệ khi chạy đồng thời. |
| Quota in-memory có hạn chế? | Mỗi instance có quota riêng; restart làm mất bộ đếm. Production nhiều instance cần quota store chia sẻ. |

## 7. JWT, authentication và authorization

### File cần mở

- [AuthenticationExtensions.cs](backend/SmartGym.Api/Extensions/AuthenticationExtensions.cs)
- [AuthEndpoints.cs](backend/SmartGym.Api/Endpoints/AuthEndpoints.cs)
- [AuthEndpoints.PasswordReset.cs](backend/SmartGym.Api/Endpoints/AuthEndpoints.PasswordReset.cs)
- [AuthService.cs](backend/SmartGym.Application/Services/AuthService.cs)
- [JwtTokenGenerator.cs](backend/SmartGym.Infrastructure/Authentication/JwtTokenGenerator.cs)
- [PasswordHasher.cs](backend/SmartGym.Infrastructure/Authentication/PasswordHasher.cs)
- [Flow5AuthorizationService.cs](backend/SmartGym.Infrastructure/Authorization/Flow5AuthorizationService.cs)
- [RoleAuthorizationFilter.cs](backend/SmartGym.Api/Filters/RoleAuthorizationFilter.cs)

### Giải thích cấu hình JWT từng dòng/khối

Tham chiếu: [AuthenticationExtensions.cs, dòng 13](backend/SmartGym.Api/Extensions/AuthenticationExtensions.cs:13).

| Dòng | Ý nghĩa |
|---|---|
| 13–17 | Extension method nhận `IServiceCollection` và config để đăng ký bảo mật. |
| 19–21 | Chọn JWT Bearer làm authentication scheme mặc định. |
| 23–37 | Cấu hình token validation: kiểm issuer, audience, lifetime, chữ ký; cho lệch đồng hồ 1 phút; lấy issuer/audience/secret từ config. |
| 32–35 | Dùng secret bytes tạo symmetric signing key. Có fallback secret mặc định nếu thiếu config; production phải bỏ fallback và fail startup khi thiếu secret. |
| 40 | Đăng ký authorization service của ASP.NET Core. |
| 43–49 | Đăng ký CORS policy tên AllowAll, hiện cho mọi origin/method/header. Production nên giới hạn domain frontend. |
| 51 | Trả collection để có thể nối các extension đăng ký khác. |

### Khái niệm để trả lời

- Authentication = xác định caller là ai.
- Authorization = xác định caller được làm gì/trên tài nguyên nào.
- JWT bearer middleware kiểm token; endpoint policy/role và authorization service kiểm quyền nghiệp vụ.
- Ẩn nút frontend không bảo vệ API; quyền phải được kiểm tra server-side.
- Secret, password, token provider và connection string không nên hard-code hoặc commit vào repo.

### Điểm cần rà trước khi trình diễn

1. Tìm endpoint phát token theo role trong `AuthEndpoints.cs` (ví dụ route dev token); xác nhận có bị khóa theo Development hay role admin không. Không để tiện ích demo phát token tùy ý trên production.
2. Rà từng route payment/log/admin để chắc có authorization phù hợp. Middleware JWT được đăng ký không tự bảo vệ mọi endpoint nếu endpoint không yêu cầu authorization.
3. Rà `AllowAll` CORS và fallback secret như rủi ro triển khai, không nói chúng là cấu hình production an toàn.

## 8. POS, hóa đơn sản phẩm và tồn kho

### File cần mở

- [ProductOrderEndpoints.cs](backend/SmartGym.Api/Endpoints/ProductOrderEndpoints.cs)
- [ProductOrderEndpoints.Member.cs](backend/SmartGym.Api/Endpoints/ProductOrderEndpoints.Member.cs)
- [ProductOrderEndpoints.Admin.cs](backend/SmartGym.Api/Endpoints/ProductOrderEndpoints.Admin.cs)
- [ProductOrderPaymentService.cs](backend/SmartGym.Infrastructure/Services/ProductOrderPaymentService.cs)
- [ProductModel.cs](backend/SmartGym.Infrastructure/Persistence/Supabase/Models/ProductModel.cs)

### Điều cần hiểu

POS có các bước tạo order/invoice, xác nhận thanh toán, cập nhật fulfillment và có thể hoàn tiền. File admin/member có các đoạn mở transaction; cần mở đúng handler và lần thứ tự ghi để trả lời chính xác. `ProductOrderPaymentService.FinalizeAsync` được gọi từ `PaymentService.ProcessPaymentAsync`, nên thanh toán invoice có thể kích hoạt hoàn tất order sản phẩm.

### Câu hỏi – đáp án

- **Khi xác nhận POS, tồn kho thay đổi ở đâu?** Chỉ ra chính xác handler/service thực hiện decrement; không suy đoán từ endpoint tên confirm.
- **Nếu một bước lưu thành công và bước sau lỗi?** Transaction bao các thay đổi liên quan để rollback cùng nhau; kiểm tra transaction scope thực tế.
- **Webhook đã nhận tiền nhưng chưa fulfillment?** Tách hai sự kiện: nhận tiền và hoàn tất giao/nhận sản phẩm; hệ thống có thể xác nhận invoice trước rồi POS cập nhật fulfillment sau.

## 9. Background service hết hạn subscription

### File cần mở

- [SubscriptionExpiryBackgroundService.cs](backend/SmartGym.Api/Services/SubscriptionExpiryBackgroundService.cs)
- [SubscriptionService.cs](backend/SmartGym.Application/Services/SubscriptionService.cs)
- [SubscriptionRepository.cs](backend/SmartGym.Infrastructure/Persistence/EF/SubscriptionRepository.cs)

### Câu hỏi – đáp án

- **Hosted service để làm gì?** Chạy tác vụ định kỳ trong vòng đời ứng dụng mà không cần request người dùng.
- **Nhiều instance có thể chạy lặp không?** Có, nếu mỗi API instance khởi động cùng hosted service. Cần khóa/claim nguyên tử hoặc scheduler phân tán.
- **Lỗi giữa vòng?** Cần log, bắt lỗi theo từng chu kỳ, retry có giới hạn và không để một bản ghi lỗi dừng toàn tác vụ.
- **Check-in có kiểm expiry riêng không?** `CheckInService` cũng tự kiểm package, nên background service không nên là lớp bảo vệ duy nhất.

## 10. Route mapping và các rủi ro cần nhớ khi bảo vệ

- [Program.cs](backend/SmartGym.Api/Program.cs) gọi `app.MapSmartGymEndpoints()`.
- [EndpointRouteExtensions.cs](backend/SmartGym.Api/Extensions/EndpointRouteExtensions.cs) gọi `MapLegacyCatalogEndpoints()` cùng một số route khác.
- [LegacyCatalogEndpoints.cs](backend/SmartGym.Api/Endpoints/LegacyCatalogEndpoints.cs) map gián tiếp nhiều endpoint như Auth, User, Subscription, Payment, Coach, Member, Booking, Check-in, Workout Plan, Review và Sport Facility.
- Do tên “Legacy”, có thể có route cũ/route mới cùng tồn tại. Khi hỏi route nào chạy, đi từ Program đến map method rồi tìm URL cụ thể.

### Các điểm dễ bị hỏi xoáy

1. **Endpoint có quyền không?** Xem `.RequireAuthorization`, `.RequireRole` hoặc code kiểm claim; đừng mặc định toàn API đều bảo vệ.
2. **Dữ liệu được lưu bền vững không?** Log SePay/limiter in-memory không bền và không chia sẻ giữa instance.
3. **Nhiều lần gọi cùng lúc có an toàn không?** Các check ở service cần được củng cố bởi transaction, atomic update và unique constraint.
4. **Có phải mọi service đều dùng EF?** Không; code có Supabase repositories và EF repositories, một số endpoint còn dùng `DbContext` trực tiếp.
5. **Giờ lưu/đối chiếu là gì?** Phân biệt UTC, local và offset +07:00; `DateTimeKind.Unspecified` là điểm cần làm rõ.
6. **Test chứng minh gì?** Unit test với fake chứng minh logic service; không chứng minh race condition thật trên PostgreSQL. Contract test chứng minh hình dạng API; integration test mới kiểm tra tích hợp dữ liệu thật.

## 11. Bộ câu hỏi tổng hợp và câu trả lời ngắn

1. **Phần nào quan trọng nhất?** Thanh toán vì có tiền, callback bên thứ ba, idempotency và cập nhật nhiều bảng; sau đó là booking concurrency và phân quyền.
2. **Rủi ro kỹ thuật đáng ưu tiên?** Nhất quán dữ liệu khi nhiều bước ghi; race condition ở booking/payment; state in-memory trong môi trường nhiều instance; cấu hình quyền/secret.
3. **Scale gấp 10 lần thì làm gì?** Đo trước bằng metric/query plan; tối ưu truy vấn/index; chuyển tác vụ dài sang queue; chia sẻ cache/quota/log; scale API/database theo số liệu.
4. **Điều sẽ cải thiện đầu tiên?** Payment attempt có ID duy nhất, transaction cho invoice/subscription, unique transaction ID SePay ở DB, atomic booking capacity, config bắt buộc cho JWT/CORS.
5. **Làm sao trình bày code?** Nói input → xác thực/quyền → validation → nghiệp vụ → ghi dữ liệu → response/lỗi; sau đó mở test tương ứng.

## 12. Kế hoạch ôn tập gợi ý

1. Đọc `PaymentService.CreatePaymentAsync`, `ProcessPaymentAsync`, `VnPayGateway.ValidateCallback` và `SePayWebhookEndpoints`.
2. Đọc `BookingService.CreateBookingAsync` và `CancelBookingAsync`; đặc biệt xem cập nhật sức chứa có persist không.
3. Đọc `CheckInService.ValidateAndCheckInAsync` và `CheckOutAsync`.
4. Đọc `ClassSchedulePolicy.Preview` và `FacilityConflictValidator.Validate`.
5. Đọc pipeline Flow 5: endpoint → authorization/context → recommendation service → validator/parser/provider → draft/approve/assign.
6. Rà JWT secret, CORS, endpoint dev-token và quyền route.
7. Mở từng test tương ứng, biết test setup bằng fake hay database thật.

### Mẫu trả lời trung thực khi code chưa hoàn thiện

“Hiện tại code đã kiểm tra X ở service và trả kết quả Y. Tuy nhiên, kiểm tra ở application chưa đủ bảo đảm trong trường hợp hai request đồng thời; để production chặt chẽ hơn em sẽ bổ sung transaction/atomic constraint tại database.”

“Trong demo, log/limiter hiện lưu trong bộ nhớ nên đáp ứng chạy một instance. Khi chạy nhiều instance hoặc cần giữ dữ liệu qua restart, em sẽ chuyển trạng thái đó sang database hoặc cache dùng chung và đặt unique constraint cho transaction ID.”

“Em phân biệt callback đã xác thực với callback thành công: chữ ký hợp lệ chứng minh nguồn/nội dung callback, còn response code và trạng thái invoice quyết định có ghi nhận thanh toán hay không.”

