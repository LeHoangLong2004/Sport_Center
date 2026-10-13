# ĐẶC TẢ LUỒNG COACH — TỔNG QUAN, LỊCH DẠY, ĐIỂM DANH

**Dự án:** Sports Center Management System — Hệ thống Quản lý Trung tâm Thể thao  
**Vai trò:** Coach — Huấn luyện viên  
**Ngày xuất tài liệu:** 11/10/2026  
**Phạm vi:** Giữ đầy đủ nội dung mô tả đã trao đổi, theo thứ tự Tổng quan → Lịch dạy → Điểm danh.

Trong role **Coach**, ba phần này tạo thành một luồng làm việc liên tục:

**Tổng quan giúp Coach biết cần làm gì → Lịch dạy giúp biết dạy buổi nào và chuẩn bị ra sao → Điểm danh xác nhận buổi thực tế và ghi nhận lượt tập.**

Nội dung dưới đây dùng làm đặc tả để xây dựng FE–BE; những quy tắc như thời hạn hủy, giờ mở cửa và giới hạn đặt trước cần được lưu thành cấu hình của trung tâm. Demo hiện vẫn dùng dữ liệu trình duyệt và ngày minh họa.

---

## PHẦN 1 — TỔNG QUAN

### 1.1. Mục đích của màn hình

Tổng quan là màn hình đầu tiên Coach nhìn thấy sau khi đăng nhập. Coach cần nhanh chóng trả lời được bốn câu hỏi:

- Hôm nay tôi có những buổi nào?
- Buổi nào còn chưa hoàn tất điểm danh?
- Có yêu cầu hoặc tin nhắn nào cần phản hồi?
- Tôi còn mở những khung giờ nào cho học viên đặt tập riêng?

Tổng quan lấy dữ liệu từ các chức năng khác để hiển thị và dẫn Coach đến nơi xử lý. **Không tạo một bộ lịch hoặc danh sách học viên riêng cho Tổng quan.**

### 1.2. Các thành phần trên giao diện

| Khu vực | Nội dung hiển thị | Thao tác |
|---|---|---|
| Lời chào | Tên Coach, ngày hiện tại, múi giờ trung tâm | Không cần thao tác |
| Thẻ thống kê | Buổi dạy hôm nay, học viên phụ trách, buổi chờ chốt điểm danh, khung 1–1 còn trống | Nhấn để mở chức năng tương ứng |
| Lịch trong ngày | Thanh chọn ngày T2–CN và danh sách buổi của ngày đang chọn | Chọn ngày, mở chi tiết buổi |
| Lịch nhận tập riêng | Giới thiệu ngắn và nút mở lịch nhận tập | Chuyển tới tab nhận tập 1–1 |
| Công việc cần xử lý | Yêu cầu dạy thay, đổi lịch, booking mới, điểm danh, tin nhắn | Mở đúng đối tượng cần xử lý |
| Truy cập nhanh | Giáo án, Tin nhắn, Hồ sơ | Chuyển trang |

### 1.3. Cách tính các thẻ thống kê

Các con số phải có định nghĩa rõ để FE và BE không tính khác nhau.

| Thẻ | Quy tắc tính |
|---|---|
| **Buổi dạy hôm nay** | Số buổi có ngày học là hôm nay, Coach hiện tại được phân công và buổi chưa bị hủy |
| **Học viên phụ trách** | Số học viên khác nhau thuộc phạm vi lớp/buổi Coach được phân công; một người học nhiều buổi chỉ tính một lần |
| **Chờ chốt điểm danh** | Các buổi đã đủ điều kiện chốt nhưng chưa chốt; buổi có sự cố cần được phân biệt với buổi đang chờ Coach thao tác |
| **Khung 1–1 còn trống** | Các khung đã mở, chưa được đặt, chưa đóng, chưa qua và không vướng lịch Coach hoặc tài nguyên |

**Lưu ý về thời gian:** demo đang kiểm tra chủ yếu theo ngày. Khi nối BE, cần kiểm tra cả giờ bắt đầu/kết thúc để không đưa một buổi tối chưa diễn ra vào danh sách cần hoàn tất từ buổi sáng.

### 1.4. Luồng Coach sử dụng Tổng quan

**Bước 1 — Coach đăng nhập**

Hệ thống xác định tài khoản Coach từ phiên đăng nhập, sau đó lấy:

- Hồ sơ Coach.
- Lịch được phân công.
- Danh sách học viên thuộc phạm vi phụ trách.
- Lịch nhận tập 1–1.
- Yêu cầu điều phối và thông báo liên quan.

BE phải xác định Coach từ tài khoản đăng nhập, không tin một `coachId` bất kỳ do trình duyệt gửi lên.

**Bước 2 — Coach xem lịch trong ngày**

Mặc định chọn hôm nay.

Mỗi buổi nên hiển thị:

- Giờ bắt đầu và kết thúc.
- Tên buổi/lớp.
- Bộ môn.
- Lớp nhóm hay cá nhân 1–1.
- Khu/phòng tập.
- Số học viên.
- Trạng thái cần chú ý, nếu có.

Nếu hôm nay chưa có lịch, hiển thị trạng thái trống rõ ràng và gợi ý mở ngày có buổi tiếp theo.

**Bước 3 — Coach chọn việc cần làm**

Ví dụ:

| Coach nhấn vào | Hệ thống mở |
|---|---|
| Một buổi trong lịch ngày | Chi tiết buổi dạy |
| “Chờ chốt điểm danh” | Danh sách điểm danh |
| “Mở lịch nhận tập 1–1” | Lịch dạy → Lịch nhận tập 1–1 |
| Đề nghị dạy thay | Lịch dạy → Yêu cầu thay đổi |
| Tin nhắn chưa đọc | Đúng cuộc trò chuyện |
| Thông báo thay đổi lịch | Buổi hoặc yêu cầu vừa thay đổi |

**Bước 4 — Dữ liệu Tổng quan cập nhật sau thao tác**

Ví dụ Coach chốt một buổi:

- Số buổi chờ chốt giảm.
- Công việc tương ứng được xử lý.
- Buổi vẫn nằm trong lịch sử.
- Member thấy điểm danh và lượt tập được cập nhật.

Việc này nên diễn ra bằng cách cập nhật hoặc tải lại dữ liệu liên quan, không yêu cầu Coach tải lại toàn bộ website.

### 1.5. Mối liên hệ với các chức năng khác

- **Manager phân công lịch:** buổi xuất hiện trong lịch và Tổng quan của Coach.
- **Member đặt 1–1:** tạo một buổi chính thức, xuất hiện trong lịch và thông báo của Coach.
- **Coach nhận dạy thay:** sau khi hoàn tất các bước xác nhận, buổi xuất hiện trong lịch của người thay.
- **Điểm danh được chốt:** cập nhật số liệu và công việc cần làm.
- **Chat có tin mới:** tăng số tin chưa đọc và dẫn tới hội thoại.
- **Hồ sơ Coach thay đổi:** lời chào và tên hiển thị cập nhật theo cùng hồ sơ.

### 1.6. Cách tổ chức để xây dựng

Có thể chia giao diện thành các component:

```text
CoachOverviewPage
├── WelcomeHeader
├── OverviewStats
├── DailyAgenda
│   ├── WeekDaySelector
│   └── SessionCard
├── PersonalTrainingShortcut
├── WorkItemList
└── QuickLinks
```

Dữ liệu trả về cho trang nên gồm các nhóm riêng: `statistics`, `sessions`, `workItems`. Các nút chuyển trang dùng mã buổi hoặc mã yêu cầu đã có, không tạo bản sao dữ liệu.

**Kết quả cần đạt:** Coach mở Tổng quan là biết lịch gần nhất, việc đang chờ và có thể đi tới đúng thao tác trong một lần nhấn.

---

## PHẦN 2 — LỊCH DẠY

### 2.1. Mục đích của màn hình

Lịch dạy quản lý ba vấn đề:

1. Những buổi Coach đã có trách nhiệm giảng dạy.
2. Những khoảng thời gian Coach mở để nhận tập riêng.
3. Những thay đổi cần phối hợp với Manager và Member.

Vì vậy, màn hình chia thành ba tab:

| Tab | Nội dung |
|---|---|
| **Lịch tuần** | Buổi dạy chính thức |
| **Lịch nhận tập 1–1** | Khung Coach mở cho Member đặt |
| **Yêu cầu thay đổi** | Đổi lịch, dạy thay, đề nghị hủy và phản hồi |

**Phải tách dữ liệu “khung có thể nhận đặt” khỏi “buổi đã được xác nhận”.** Mở lịch 14:00–17:00 chưa có nghĩa Coach đã có ba buổi dạy.

### 2.2. Tab Lịch tuần

Giao diện giữ đúng bố cục bạn đã chọn:

- Hàng ngang: **T2 → CN**, đúng bảy ngày.
- Hàng dọc: các mốc giờ.
- Chiều cao thẻ buổi tương ứng với thời lượng.
- Ngày hiện tại được đánh dấu nhẹ.
- Có tuần trước, tuần sau và chọn ngày để chuyển tuần.
- Có bộ lọc bộ môn và lớp nhóm/cá nhân.

Mỗi thẻ buổi hiển thị thông tin quan trọng trước:

1. Giờ bắt đầu–kết thúc.
2. Tên buổi.
3. Khu/phòng.
4. Số học viên.

Màu có thể phân biệt nhóm bộ môn, nhưng vẫn phải có tên hoặc nhãn để người dùng không cần đoán ý nghĩa của màu.

### 2.3. Luồng mở chi tiết buổi dạy

Coach nhấn một thẻ trên lịch hoặc từ Tổng quan.

Trang chi tiết hiển thị:

| Nhóm | Nội dung |
|---|---|
| Thông tin buổi | Tên, môn, ngày giờ, hình thức, địa điểm, Coach |
| Học viên | Danh sách người đã đăng ký |
| Giáo án buổi | Bài tập được chọn cho chính buổi đó |
| Chuẩn bị | Dụng cụ, hướng dẫn cần thiết |
| Bàn giao | Ghi chú nội bộ phục vụ người dạy thay |
| Thao tác | Mở điểm danh, chuẩn bị giáo án, yêu cầu thay đổi |

Từ đây Coach có thể:

- Mở hồ sơ học viên.
- Nhắn tin với học viên thuộc phạm vi phụ trách.
- Chọn giáo án.
- Điểm danh khi đủ điều kiện.
- Gửi yêu cầu đổi lịch.

### 2.4. Gắn giáo án vào từng buổi

Luồng:

1. Coach mở chi tiết buổi.
2. Nhấn **“Chọn / sửa giáo án buổi”**.
3. Chọn một giáo án trong thư viện.
4. Nhập dụng cụ cần chuẩn bị.
5. Nhập ghi chú bàn giao.
6. Lưu.

Nội dung giáo án nên được lưu thành **bản nội dung dành riêng cho buổi học**. Nếu sau này Coach chỉnh giáo án mẫu, giáo án của buổi đã chuẩn bị hoặc đã diễn ra không tự thay đổi.

Quyền xem:

- Member thấy bài tập và dụng cụ cần chuẩn bị.
- Coach phụ trách thấy cả ghi chú nội bộ.
- Coach được mời dạy thay được xem nội dung bàn giao cần thiết; quyền truy cập buổi chính thức mở sau khi phân công được xác nhận.

### 2.5. Tab Lịch nhận tập 1–1

Coach dùng tab này để chủ động mở thời gian nhận học viên.

Form mở lịch gồm:

| Trường | Quy tắc |
|---|---|
| Dịch vụ/bộ môn | Chỉ chọn dịch vụ Coach có chuyên môn được phân công |
| Khu tập | Phù hợp bộ môn và điều kiện trung tâm |
| Ngày bắt đầu | Không ở quá khứ |
| Kiểu lặp | Một ngày hoặc hằng tuần |
| Ngày kết thúc lặp | Bắt buộc với lịch lặp |
| Giờ bắt đầu–kết thúc | Trong giờ hoạt động |
| Thời lượng buổi | Lấy từ dịch vụ Manager cấu hình |

Coach không tự sửa giá hoặc tự tạo quyền lợi mới cho gói.

**Ví dụ:**

Coach mở Yoga 14:00–17:00, dịch vụ 60 phút/buổi, không có khoảng nghỉ:

- 14:00–15:00.
- 15:00–16:00.
- 16:00–17:00.

Nếu trung tâm cấu hình khoảng nghỉ, hệ thống phải tính lại cách chia khung.

Trước khi lưu, kiểm tra:

- Không trùng lịch dạy của Coach.
- Không trùng khung nhận tập đã mở.
- Khu/phòng đủ điều kiện.
- Khoảng giờ đủ chứa một buổi.
- Ngày và giờ hợp lệ.

Trong demo hiện tại, phòng/khu được giữ độc quyền theo buổi để tránh trùng tài nguyên. Nếu thực tế một khu cho phép nhiều Coach cùng dạy, BE cần quản lý sức chứa hoặc tài nguyên cụ thể thay cho quy tắc độc quyền.

### 2.6. Member đặt vào khung Coach đã mở

Luồng liên kết:

1. Member chọn bộ môn và Coach.
2. Hệ thống hiển thị khung thực sự còn đặt được.
3. Member chọn ngày giờ.
4. Hệ thống kiểm tra gói môn 1–1.
5. Member xác nhận.
6. Hệ thống giữ một lượt và tạo buổi dạy chính thức.
7. Lịch Coach, lịch Member và thông báo cùng cập nhật.

Điều kiện cần kiểm tra lại ở bước xác nhận:

- Khung chưa bị người khác đặt.
- Coach và khu tập vẫn khả dụng.
- Member không trùng lịch.
- Gói đúng môn, đúng hình thức và thời lượng.
- Gói có hiệu lực vào ngày học.
- Còn lượt trong chu kỳ sử dụng.
- Đáp ứng giới hạn đặt trước.

**Hạng Plus/Premium chỉ ảnh hưởng ưu đãi hoặc thời điểm được đặt sớm; không thay thế gói môn 1–1.**

Khi xây BE, kiểm tra khung và tạo booking phải xử lý nhất quán để hai người không cùng đặt thành công một chỗ.

### 2.7. Quyền sửa lịch của Coach

| Trường hợp | Coach được làm |
|---|---|
| Khung nhận tập chưa có booking | Sửa hoặc đóng |
| Khung đã có booking | Gửi yêu cầu thay đổi |
| Buổi lớp nhóm đã công bố | Gửi yêu cầu thay đổi |
| Lịch của Coach khác | Không tự sửa |
| Buổi đã chốt | Không dời lịch như một buổi tương lai |
| Lịch lặp có các buổi đã được đặt | Thay đổi lịch mở không tự sửa booking đã xác nhận |

### 2.8. Luồng xin dời lịch

1. Coach mở buổi → **Yêu cầu thay đổi**.
2. Chọn **Dời lịch**.
3. Nhập ngày giờ đề xuất, lý do và mức độ khẩn.
4. Hệ thống kiểm tra xung đột ban đầu.
5. Yêu cầu chuyển sang **Chờ Manager**.
6. Lịch chính thức vẫn giữ nguyên.
7. Manager duyệt hoặc từ chối.
8. Trước khi áp dụng, hệ thống kiểm tra lại xung đột và tình trạng buổi.

Đối với lớp nhóm, phương án được duyệt sẽ cập nhật lịch và thông báo cho học viên. Người không tham gia được lịch mới có thể gửi phản hồi để được xử lý học bù.

Đối với 1–1, sau bước Manager duyệt:

- Member nhận đề nghị.
- Member đồng ý → kiểm tra lại và chốt lịch mới.
- Member từ chối → giữ lịch hiện tại, tiếp tục thống nhất phương án khác.

Nhắn “đồng ý” trong Chat không tự thay đổi lịch. Cần thao tác xác nhận trên yêu cầu để có trạng thái và lịch sử rõ ràng.

### 2.9. Luồng nhờ dạy thay

1. Coach A đề nghị người thay và nhập nội dung bàn giao.
2. Manager kiểm tra phương án.
3. Coach B nhận lời mời.
4. Coach B xem thời gian, môn, địa điểm và nội dung bàn giao.
5. Coach B chấp nhận hoặc từ chối.
6. Nếu chấp nhận, hệ thống kiểm tra lại điều kiện.
7. Lớp nhóm được cập nhật người dạy; buổi 1–1 tiếp tục chờ Member xác nhận khi đổi Coach.
8. Lịch và quyền truy cập buổi chuyển theo phân công mới.

Không coi việc Coach A chọn tên Coach B là Coach B đã đồng ý.

### 2.10. Hủy buổi và học bù

Nếu trung tâm không tổ chức được buổi:

- Buổi chuyển trạng thái hủy.
- Không ghi học viên vắng vì lỗi trung tâm.
- Giải phóng lượt 1–1 đã giữ.
- Ghi nhận nhu cầu học bù.
- Manager đề xuất buổi bù.
- Member xác nhận.
- Tạo buổi bù trong lịch Coach.
- Buổi bù tiếp tục đi qua Điểm danh.

Nếu ngày bù nằm ngoài hạn gói, quyền được cấp riêng cho buổi bù. Không tự gia hạn toàn bộ quyền vào khu tập.

### 2.11. Cách tổ chức để xây dựng

```text
CoachSchedulePage
├── ScheduleTabs
├── WeeklyCalendar
│   ├── WeekNavigation
│   ├── ScheduleFilters
│   └── SessionEvent
├── AvailabilityList
│   └── AvailabilityForm
└── ChangeRequestList
    ├── ChangeRequestForm
    └── SubstituteInvitation
```

Các dữ liệu cần tách:

| Dữ liệu | Mục đích |
|---|---|
| Buổi học | Lịch chính thức, Coach, địa điểm và trạng thái |
| Khung nhận tập | Khả năng nhận booking |
| Booking | Member đặt vào buổi nào, dùng gói nào |
| Yêu cầu thay đổi | Phương án cũ/mới, người đề nghị, người duyệt |
| Giáo án buổi | Nội dung giảng dạy của một buổi cụ thể |
| Yêu cầu học bù | Quyền lợi cần xử lý và buổi thay thế |
| Nhật ký | Ai thay đổi gì, vào lúc nào |

**Kết quả cần đạt:** mọi buổi dạy có nguồn gốc và trạng thái rõ ràng; đổi lịch phải đồng bộ với booking, người dạy, phòng tập và quyền lợi học viên.

---

## PHẦN 3 — ĐIỂM DANH

### 3.1. Mục đích của màn hình

Điểm danh xác nhận thực tế diễn ra trong từng buổi:

- Buổi có được tổ chức không?
- Ai có mặt, đi muộn, vắng hoặc nghỉ có phép?
- Dữ liệu đang là bản nháp hay đã chốt?
- Lượt tập 1–1 được sử dụng hay giải phóng?

**Check-in của Receptionist và điểm danh của Coach là hai nghiệp vụ khác nhau.**

Member đến trung tâm chưa đồng nghĩa đã tham dự một lớp cụ thể. Vì vậy, check-in có thể là thông tin hỗ trợ, không tự động thay thế điểm danh lớp.

### 3.2. Cấu trúc màn hình

Màn hình chia thành hai cấp:

| Cấp | Nội dung |
|---|---|
| **Chọn buổi** | Ngày nổi bật → thống kê ngày → danh sách khung giờ |
| **Điểm danh buổi** | Thông tin buổi → xác nhận tổ chức → danh sách học viên → lưu/chốt → lịch sử sửa |

Ở trang chọn buổi:

- Ngày/tháng/năm đặt trên cùng.
- Có ngày trước, ngày sau, hôm nay và lịch chọn ngày.
- Hiển thị số buổi, số lượt học viên và số buổi đã chốt.
- Lọc **Tất cả / Chưa chốt / Đã chốt**.
- Mỗi khung giờ là một thẻ riêng.

“Lượt học viên” trong thống kê ngày là tổng số đăng ký theo các buổi. Nếu một Member học hai buổi trong ngày thì tính hai lượt; không nhầm với số người khác nhau.

### 3.3. Luồng Coach mở điểm danh

Coach có thể vào bằng ba cách:

1. Tổng quan → công việc chờ điểm danh.
2. Lịch dạy → chi tiết buổi → mở điểm danh.
3. Điểm danh → chọn ngày → chọn khung giờ.

Cả ba cách phải mở **cùng một bản ghi điểm danh của buổi đó**.

Trước khi cho phép thao tác, BE kiểm tra:

- Coach có đang được phân công buổi không?
- Buổi có bị hủy không?
- Đã đến thời điểm được điểm danh chưa?
- Có sự cố đang chờ giải quyết không?
- Buổi đã chốt hay đang được mở để chỉnh sửa?

### 3.4. Danh sách học viên

Danh sách lấy từ các booking hợp lệ của chính buổi học.

Không lấy toàn bộ thành viên thuộc bộ môn, vì có người mua gói nhưng chưa đăng ký buổi này.

Mỗi dòng gồm:

- Tên và mã học viên.
- Trạng thái điểm danh.
- Ghi chú.
- Có thể mở hồ sơ khi cần.

Các trạng thái:

| Trạng thái | Ý nghĩa |
|---|---|
| **Chưa chọn** | Coach chưa xác nhận |
| **Có mặt** | Học viên tham gia |
| **Đi muộn** | Có tham gia nhưng đến muộn |
| **Vắng** | Không tham gia, không được ghi nhận nghỉ có phép |
| **Có phép** | Nghỉ đã được chấp nhận theo chính sách |

Không tự chuyển “Chưa chọn” thành “Vắng”.

Nút **“Có mặt cho người chưa chọn”** chỉ cập nhật những người chưa có trạng thái, không ghi đè người đã được đánh dấu vắng hoặc có phép.

### 3.5. Lưu nháp

Trong khi buổi đang diễn ra, Coach có thể:

1. Chọn trạng thái cho một phần học viên.
2. Thêm ghi chú.
3. Nhấn **Lưu nháp**.
4. Quay lại bổ sung sau.

Quy tắc:

- Cho phép còn người chưa chọn.
- Buổi vẫn chưa hoàn tất.
- Lượt 1–1 vẫn ở trạng thái giữ chỗ.
- Tổng quan vẫn hiển thị công việc cần chốt.

Khi có thay đổi chưa lưu mà Coach rời trang, giao diện cần cảnh báo để tránh mất dữ liệu.

### 3.6. Chốt điểm danh và hoàn tất buổi

Trước khi chốt, Coach:

1. Kiểm tra mọi học viên đã có trạng thái.
2. Xác nhận buổi đã được tổ chức.
3. Nhấn **Chốt điểm danh**.

Hệ thống kiểm tra lại:

- Quyền của Coach.
- Trạng thái buổi.
- Điều kiện thời gian.
- Không có học viên chưa chọn.
- Không có sự cố chưa xử lý.
- Dữ liệu chưa bị người khác cập nhật trái với bản đang mở.

Sau khi thành công:

- Lưu điểm danh.
- Chuyển buổi sang trạng thái đã chốt.
- Ghi người chốt và thời điểm.
- Cập nhật trạng thái lượt tập.
- Cập nhật lịch sử của Member.
- Cập nhật Tổng quan và thông báo.
- Nếu là buổi bù, cập nhật hồ sơ học bù tương ứng.

**Không chỉ đổi màu nút trên FE.** Trạng thái hoàn tất phải được lưu và sử dụng thống nhất ở tất cả role.

### 3.7. Cách liên kết với lượt tập 1–1

Quy tắc đang dùng trong demo:

| Tình huống | Trạng thái lượt |
|---|---|
| Booking được xác nhận, buổi chưa chốt | Đang giữ chỗ |
| Chốt có mặt hoặc đi muộn | Đã sử dụng |
| Chốt vắng không phép | Đã sử dụng theo chính sách demo |
| Chốt có phép | Giải phóng lượt |
| Trung tâm hủy buổi | Giải phóng lượt |
| Sự cố chưa xác minh | Giữ lượt trong lúc xử lý |
| Chỉ dời lịch buổi đã đặt | Không tạo thêm lượt sử dụng |

Ví dụ gói có 8 buổi:

- Chưa đặt gì: **0 đã dùng / 0 giữ chỗ / 8 có thể đặt**.
- Đặt một buổi: **0 đã dùng / 1 giữ chỗ / 7 có thể đặt**.
- Học xong và chốt có mặt: **1 đã dùng / 0 giữ chỗ / 7 có thể đặt**.

Nếu sửa lại điểm danh của cùng buổi, chỉ điều chỉnh kết quả của lượt đó. **Không trừ thêm một lượt vì Coach bấm lưu lần thứ hai.**

Khi xây BE, nên có bản ghi sử dụng lượt gắn duy nhất với booking để bảo đảm tính chất này.

### 3.8. Nếu Coach hoặc trung tâm không tổ chức được buổi

Coach không được chọn toàn bộ học viên là “Vắng” để kết thúc.

Luồng đúng:

1. Nhấn **Báo buổi không thể tổ chức**.
2. Chọn loại sự cố: Coach không thể đến, khu tập/thiết bị gặp vấn đề hoặc lý do khác.
3. Nhập mô tả.
4. Buổi chuyển sang chờ xử lý sự cố.
5. Manager xác minh.

Manager có hai hướng:

| Kết quả xác minh | Xử lý |
|---|---|
| Buổi thực sự không được tổ chức | Hủy buổi, trả lượt, tạo yêu cầu học bù |
| Buổi vẫn diễn ra | Mở lại để Coach cập nhật và chốt điểm danh |

Trong lúc chờ xác minh, không tự kết luận học viên vắng hoặc buổi đã hoàn tất.

### 3.9. Sửa điểm danh sau khi đã chốt

Cần giữ chức năng sửa sai, nhưng phải có lịch sử.

Luồng:

1. Coach mở buổi đã chốt.
2. Nhấn **Chỉnh sửa**.
3. Thay đổi trạng thái hoặc ghi chú.
4. Nhập lý do bắt buộc.
5. Lưu điều chỉnh.

Hệ thống ghi:

- Giá trị cũ.
- Giá trị mới.
- Người chỉnh.
- Thời điểm.
- Lý do.
- Ảnh hưởng tới lượt tập, nếu có.

Ví dụ “Có mặt” sửa thành “Có phép” có thể làm thay đổi lượt đã sử dụng. Đây không còn là sửa chữ đơn thuần.

Với bản thực tế, nên quy định khoảng thời gian Coach được tự sửa. Khi đã qua hạn hoặc kỳ quyền lợi đã được đối soát, chuyển thành yêu cầu Manager xử lý. Demo hiện chưa áp dụng đầy đủ giới hạn theo thời gian này.

### 3.10. Trạng thái và quyền của các role

| Role | Quyền liên quan |
|---|---|
| **Coach** | Điểm danh buổi được phân công, lưu nháp, chốt, sửa theo quyền, báo sự cố |
| **Member** | Xem điểm danh và lượt tập của mình, gửi phản hồi khi thấy sai |
| **Manager** | Theo dõi, xử lý sự cố và các điều chỉnh cần quản lý |
| **Receptionist** | Xem thông tin phục vụ hỗ trợ; check-in tại quầy không tự chốt điểm danh lớp |

Coach dạy thay được điểm danh sau khi phân công chính thức. Coach cũ không tiếp tục có quyền chốt chỉ vì trước đây từng phụ trách buổi đó.

### 3.11. Cách tổ chức để xây dựng

```text
CoachAttendancePage
├── AttendanceDateSelector
├── DailyAttendanceSummary
├── AttendanceStatusFilter
└── AttendanceSessionCard

CoachAttendanceDetailPage
├── SessionHeader
├── DeliveryConfirmation
├── AttendanceSummary
├── MemberAttendanceRow
├── SaveAndFinalizeActions
└── AttendanceAuditHistory
```

Các bản ghi cần có:

| Dữ liệu | Nội dung chính |
|---|---|
| Điểm danh | Buổi, Member, trạng thái, ghi chú |
| Hoàn tất buổi | Trạng thái tổ chức, người chốt, thời điểm |
| Sử dụng lượt | Booking, gói, chu kỳ, trạng thái giữ/đã dùng/giải phóng |
| Sự cố | Loại, mô tả, người báo, kết quả xử lý |
| Nhật ký điều chỉnh | Dữ liệu cũ/mới và lý do |

## Một ví dụ nối đủ cả ba màn hình

Coach Nam mở **Tổng quan**, thấy Member Lan Anh vừa đặt một buổi Yoga 1–1.

Nam nhấn vào thông báo và chuyển đến **chi tiết buổi trong Lịch dạy**. Tại đây Nam kiểm tra giờ, phòng, học viên, chọn giáo án và ghi dụng cụ cần chuẩn bị.

Đến buổi học, Nam mở **Điểm danh**, ghi Lan Anh có mặt, xác nhận buổi được tổ chức rồi chốt.

Sau đó:

- Buổi không còn nằm trong danh sách chờ chốt của Tổng quan.
- Lịch dạy lưu trạng thái buổi đã hoàn tất.
- Member thấy mình đã tham dự.
- Một lượt từ “đang giữ chỗ” chuyển sang “đã sử dụng”.
- Manager có dữ liệu để theo dõi hoạt động.
- Nếu đó là buổi học bù, yêu cầu học bù được cập nhật đã kết thúc.

Đó là cách ba chức năng dùng chung dữ liệu để tạo thành một quy trình làm việc hoàn chỉnh cho Coach.
