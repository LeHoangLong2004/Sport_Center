# SPORT CENTER — ĐẶC TẢ UI/UX COACH FLOW CHO ANTIGRAVITY

## 3. Điều hướng Coach Portal

| Menu đề xuất       | Chức năng                            |
| ------------------ | ------------------------------------ |
| Tổng quan          | Công việc hôm nay và việc cần xử lý  |
| Lịch dạy           | Lịch được phân công và chi tiết buổi |
| Học viên           | Người học thuộc phạm vi phụ trách    |
| Giáo án            | Chuẩn bị và giao kế hoạch tập        |
| Điểm danh          | Chọn buổi, ghi nhận tham gia         |
| Tiến độ & đánh giá | Kết quả và nhận xét theo thời gian   |
| Thông báo          | Thông báo lớp và bài tập về nhà      |
| AI gợi ý           | Bản nháp bài tập để Coach duyệt      |

Hồ sơ/cài đặt cá nhân mở từ avatar. Có thể nhóm lại menu để phù hợp layout hiện có, nhưng không làm mất chức năng. Điểm danh từ Dashboard, Lịch hoặc menu Điểm danh phải mở cùng một luồng và cùng nguồn dữ liệu.

## 4. CO-01 — Tổng quan

**Mục đích:** Coach biết hôm nay dạy gì và còn việc nào chưa hoàn thành.

### Nội dung

- Lời chào, ngày hiện tại.
- Số buổi được phân công hôm nay.
- Số lượt học viên đăng ký trong các buổi hôm nay.
- Số buổi còn học viên chưa điểm danh.
- Số buổi cần cập nhật kết quả nếu chức năng này được triển khai.
- Buổi sắp bắt đầu: tên, môn, giờ, khu, số người đăng ký.
- Danh sách việc cần xử lý.

### Quy tắc

- Dùng nhãn “lượt học viên” nếu một người được tính ở nhiều buổi.
- Không đưa lương, doanh thu hoặc KPI quản trị vào dashboard Coach.
- Tính số liệu từ cùng dữ liệu lịch, booking và điểm danh.
- Không có lịch thì hiển thị trạng thái rỗng, không chèn số liệu giả không liên quan.

### Tương tác

- Bấm buổi → mở chi tiết đúng buổi.
- Bấm Điểm danh → mở đúng buổi trong màn điểm danh.
- Bấm Xem lịch → mở lịch dạy.

## 5. CO-02 — Lịch dạy

**Mục đích:** Xem các buổi Manager đã phân công.

### Chức năng

- Chế độ tuần và danh sách.
- Nút Hôm nay, tuần trước, tuần sau.
- Bộ lọc môn và trạng thái buổi.
- Giờ hiển thị thống nhất theo Việt Nam.

### Thông tin mỗi buổi

- Tên lớp/buổi và bộ môn.
- Ngày, giờ bắt đầu–kết thúc.
- Khu/phòng.
- Số người đăng ký/sức chứa.
- Trạng thái: sắp diễn ra, đang diễn ra, hoàn thành, đã hủy.

### Quy tắc và tương tác

- Bấm sự kiện để mở chi tiết.
- Không cho Coach kéo thả đổi giờ hoặc tạo lịch chính thức.
- Chưa có chức năng yêu cầu đổi lịch thì không thêm nút hoạt động giả.
- Trạng thái buổi không suy ra từ điểm danh: điểm danh đủ không có nghĩa buổi đã kết thúc.
- Nếu backend chưa trả đủ trạng thái, định nghĩa cách hiển thị rõ ràng, không ghi ngược trạng thái tự suy ra về server.
- Trên màn hình nhỏ ưu tiên danh sách thay vì ép lịch tuần quá chật.

## 6. CO-03 — Chi tiết buổi học

Đây là màn kết nối lịch, học viên, giáo án, điểm danh và kết quả.

### Thông tin chung

- Tên lớp, môn, trình độ nếu có.
- Ngày giờ, thời lượng, khu/phòng.
- Coach phụ trách.
- Số người đăng ký/sức chứa.
- Trạng thái buổi.

### Nội dung

| Phần      | Dữ liệu                      |
| --------- | ---------------------------- |
| Học viên  | Danh sách đăng ký hợp lệ     |
| Giáo án   | Kế hoạch áp dụng cho buổi    |
| Điểm danh | Kết quả tham gia             |
| Kết quả   | Chỉ số tập luyện và nhận xét |

### Thao tác

- Điểm danh.
- Xem/giao giáo án.
- Ghi kết quả.
- Gửi thông báo cho học viên của buổi.

Buổi đã hủy phải có thông báo nổi bật, khóa các thao tác không còn hợp lệ và giữ thông tin lịch sử để tra cứu.

## 7. CO-04 — Điểm danh: ưu tiên cao nhất

**Mục đích:** Ghi nhận từng học viên tham gia một buổi cụ thể.

### 7.1. Đầu trang

- Bộ chọn buổi hoặc thông tin buổi đang mở.
- Tên lớp, môn, ngày giờ, khu.
- Tổng học viên hợp lệ.
- Số có mặt, đi trễ, vắng và chưa điểm danh nếu các trạng thái được hỗ trợ.

### 7.2. Bảng học viên

| Cột        | Nội dung                                     |
| ---------- | -------------------------------------------- |
| Học viên   | Avatar, họ tên, mã                           |
| Trạng thái | Chưa điểm danh / Có mặt / Đi trễ / Vắng      |
| Ghi chú    | Ghi chú buổi nếu API hoặc chế độ demo hỗ trợ |

### 7.3. Quy tắc dữ liệu

1. Chưa có kết quả thì hiển thị Chưa điểm danh; không mặc định tất cả có mặt hoặc vắng.
2. Mỗi cặp buổi–học viên có một kết quả hiện hành.
3. Đổi buổi phải tải đúng danh sách và kết quả của buổi mới.
4. Không dùng chung trạng thái học viên giữa nhiều buổi.
5. Không cho điểm danh booking đã hủy hoặc lớp đã hủy.
6. Không tự thêm người ngoài danh sách đăng ký.
7. Tìm kiếm/lọc không làm mất thay đổi đang nhập.
8. Thống kê tính trên toàn danh sách hợp lệ, không chỉ các hàng đang lọc.
9. Chưa điểm danh là trạng thái UI riêng, không tự gửi thành `no_show`.

### 7.4. Luồng thao tác

1. Coach chọn buổi.
2. Tải danh sách và kết quả đã lưu.
3. Coach đổi trạng thái, nhập ghi chú nếu hỗ trợ.
4. Hiển thị số thay đổi chưa lưu.
5. Bấm lưu.
6. Trong khi request chạy, chặn gửi lặp và hiển thị Đang lưu.
7. Thành công: cập nhật dữ liệu đã lưu và trạng thái giao diện.
8. Thất bại: giữ thay đổi, hiện lỗi, cho thử lại.

Khi đổi buổi hoặc rời trang có thay đổi chưa lưu, cho chọn tiếp tục chỉnh sửa hoặc bỏ thay đổi.

Có thể thêm Đánh dấu tất cả có mặt, nhưng phải ghi rõ phạm vi toàn danh sách hay kết quả lọc. Không âm thầm ghi đè các trạng thái đã nhập. Đây là thao tác tiện ích UI, không thay thế xác nhận lưu.

### 7.5. Hợp đồng API hiện đã đọc

| Giao diện | API hiện tại       |
| --------- | ------------------ |
| Có mặt    | `attended`         |
| Vắng      | `no_show`          |
| Đi trễ    | Chưa hỗ trợ        |
| Ghi chú   | DTO chưa có trường |

Không gửi trực tiếp `present`, `absent` hoặc `late` vào API này. Phải ánh xạ đúng; đặc biệt đoạn backend đã đọc coi giá trị khác `no_show` là `attended`.

- Chế độ API thật: khóa/ẩn tùy chọn chưa được hỗ trợ, có giải thích phù hợp.
- Chế độ demo: được mô phỏng Đi trễ và Ghi chú nhưng phải ghi rõ khả năng đề xuất, chưa nối BE.
- Thời điểm mở/khóa điểm danh và quyền sửa sau buổi chưa chốt: không tự tạo quy tắc cố định như “chỉ sửa trong 15 phút”.
- Việc ẩn nút FE không thay thế kiểm tra Coach phụ trách lớp ở backend. Nếu BE chưa kiểm tra, ghi rõ phần còn thiếu.

## 8. CO-05 — Học viên và hồ sơ học viên

### Danh sách

Chỉ hiển thị học viên trong phạm vi phụ trách:

- Avatar, mã, họ tên.
- Môn/lớp liên quan.
- Mục tiêu, trình độ nếu có.
- Buổi gần nhất hoặc tình trạng tập luyện khi có dữ liệu.

Tìm theo tên/mã; lọc môn hoặc lớp. Bấm hàng mở đúng học viên, không mở một hồ sơ mẫu cố định.

### Hồ sơ chi tiết

- Thông tin cơ bản phục vụ huấn luyện.
- Mục tiêu, trình độ.
- Các lớp/buổi liên quan đến Coach.
- Giáo án đã giao.
- Lịch sử điểm danh.
- Kết quả và nhận xét.

Không hiển thị toàn bộ thanh toán hoặc dữ liệu lớp ngoài quyền truy cập. Không mặc định mọi Coach được xem toàn bộ Member của trung tâm.

## 9. CO-06 — Giáo án

**Mục đích:** Chuẩn bị kế hoạch và giao đúng đối tượng.

### Danh sách giáo án

- Tên, môn, mục tiêu, trình độ.
- Thời lượng dự kiến.
- Trạng thái Nháp / Đã giao / Lưu trữ.
- Ngày cập nhật.

### Form tạo/sửa

- Tên giáo án, môn, mục tiêu, trình độ.
- Mô tả và lưu ý.
- Danh sách bài có thể thêm/xóa/sắp xếp.
- Mỗi bài: tên, hướng dẫn, thời lượng hoặc số hiệp/lần, thời gian nghỉ nếu phù hợp.

Không bắt mọi môn dùng cấu trúc Gym. Bơi có thể dùng quãng đường/thời gian; Yoga dùng động tác/thời lượng. MVP có thể dùng trường cơ bản và ghi chú thay vì tạo quá nhiều form chuyên môn.

### Thao tác và quy tắc

- Tạo nháp, sửa nháp, sao chép, xem chi tiết, lưu trữ.
- Giao cho lớp, buổi hoặc học viên thuộc quyền.
- Khi giao, chọn rõ người nhận và xác nhận.
- Không tự công khai toàn bộ kho giáo án cho mọi Member.
- Đề xuất lưu phiên bản đã giao, tránh sửa giáo án mẫu làm đổi lịch sử buổi cũ.
- Chưa có API thì thao tác ở chế độ demo được gắn nhãn, không báo đã lưu vào hệ thống thật.

## 10. CO-07 — Kết quả, tiến độ và đánh giá

### Kết quả từng buổi

- Chọn buổi và học viên hợp lệ.
- Ghi mức hoàn thành bài.
- Nhập chỉ số phù hợp môn nếu có.
- Ghi nhận xét, điểm cần cải thiện và hướng tập tiếp.

Không tạo kết quả tập cho học viên vắng như thể người đó đã hoàn thành bài.

### Tiến độ theo thời gian

- Chọn học viên và khoảng thời gian.
- Xem lịch sử buổi, điểm danh, chỉ số và nhận xét.
- So sánh cùng loại chỉ số, cùng đơn vị.
- Ghi đánh giá và đề xuất điều chỉnh mục tiêu/giáo án theo quyền.

Biểu đồ phải dựa trên dữ liệu. Khi chưa có dữ liệu, hiển thị hướng dẫn bắt đầu ghi nhận. Không tự tạo điểm tiến bộ, phần trăm hoặc mức đánh giá không có quy tắc tính.

## 11. CO-08 — Thông báo và bài tập về nhà

Cho phép:

- Chọn lớp/buổi hoặc học viên có quyền.
- Nhập tiêu đề, nội dung.
- Chọn loại Thông báo hoặc Bài tập về nhà.
- Thêm hạn thực hiện cho bài tập nếu cần.
- Xem trước danh sách người nhận.
- Gửi và xem lịch sử.

Không cho gửi toàn trung tâm theo mặc định. Demo chỉ lưu mô phỏng, không gửi email/tin nhắn thật và không ghi “đã gửi thật” khi chưa tích hợp.

## 12. CO-09 — AI gợi ý

Làm sau các luồng chính. AI tạo bản nháp, Coach duyệt.

1. Chọn học viên/lớp thuộc phạm vi.
2. Chọn môn, mục tiêu, trình độ và thiết bị.
3. Yêu cầu gợi ý.
4. Hiển thị bản nháp.
5. Coach chỉnh sửa.
6. Lưu thành giáo án hoặc giao sau xác nhận.

Không tự giao khi AI vừa trả kết quả. Chưa có AI backend thì dùng dữ liệu mẫu với nhãn **Gợi ý minh họa**, không giả làm phản hồi AI thật. Không tự tạo chẩn đoán hoặc cam kết điều trị.

## 13. CO-10 — Hồ sơ Coach

### Thông tin xem

- Họ tên, avatar, liên hệ.
- Môn chuyên môn.
- Giới thiệu/chứng chỉ khi có dữ liệu.
- Thông tin phân công/trạng thái cần thiết.

### Chỉnh sửa

Chỉ sửa trường cá nhân được phép. Role, quyền, phân công hoặc chứng chỉ cần xác nhận phải theo quy trình Manager.

Không báo lưu thành công khi chưa có API hoặc cơ chế lưu demo rõ ràng. Nếu thêm tải avatar, phải có xử lý chọn tệp, xem trước, kiểm tra và thông báo giới hạn thực tế của chức năng.

## 14. Yêu cầu UI/UX chung

- Dùng chung font, khoảng cách, kiểu nút, bảng, modal và trạng thái với hệ thống.
- Teal có thể làm điểm nhấn Coach; không tự thay toàn bộ nhận diện thương hiệu.
- Ưu tiên thứ bậc thông tin và khoảng trắng; không lạm dụng gradient/animation.
- Mỗi màn có một hành động chính nổi bật.
- Form có nhãn và lỗi tại đúng trường.
- Trạng thái có chữ/icon, không chỉ màu.
- Có focus và thao tác bàn phím hợp lý.
- Bảng dài có tìm kiếm và cuộn/phân trang phù hợp.
- Sidebar thu gọn trên màn hình nhỏ; lịch chuyển sang danh sách khi cần.
- Khi tải dữ liệu mới không để tiêu đề buổi mới đi cùng danh sách học viên của buổi cũ.

### Trạng thái cần thiết

| Trạng thái       | Yêu cầu                                             |
| ---------------- | --------------------------------------------------- |
| Đang tải         | Skeleton hoặc chỉ báo rõ, tránh dữ liệu cũ gây nhầm |
| Có dữ liệu       | Hiển thị đúng bộ lọc và đối tượng                   |
| Không có dữ liệu | Giải thích ngắn, hành động phù hợp nếu có           |
| Tải thất bại     | Thông báo dễ hiểu và thử lại                        |
| Không có quyền   | Không hiển thị dữ liệu không được phép              |
| Đang lưu         | Chặn gửi lặp, có chỉ báo                            |
| Lưu thất bại     | Giữ dữ liệu nhập, cho thử lại                       |
| Lưu thành công   | Chỉ sau xác nhận từ API hoặc ghi rõ lưu demo        |

## 15. Dữ liệu demo và khả năng nối backend

### 15.1. Yêu cầu mock

- Một nguồn mock dùng chung cho toàn Coach Portal.
- ID thống nhất giữa lịch, học viên, giáo án, booking và điểm danh.
- Có ít nhất hai buổi của cùng một lớp để kiểm tra không lẫn kết quả.
- Có buổi chưa có học viên, buổi đã hủy và tình huống lưu thất bại.
- Dashboard tính từ cùng dữ liệu với màn chi tiết.
- Nếu lưu localStorage, ghi **Demo — lưu trên trình duyệt** và có chức năng đặt lại dữ liệu demo.
- Không ghi dữ liệu demo vào database thật.
- Không xóa các khóa localStorage không thuộc chức năng demo khi reset.

### 15.2. Lớp service

Tách HTTP/mock và ánh xạ DTO khỏi JSX. Component gọi hàm nghiệp vụ; service chọn nguồn dữ liệu. Tái sử dụng cấu trúc repo hiện có trước khi tạo một hệ thống song song.

Hai endpoint đã biết:

```http
GET /api/schedule/coach
POST /api/classes/{id}/attendance
```

Ví dụ payload điểm danh theo DTO đã đọc, UUID chỉ minh họa:

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

Phải kiểm tra DTO/response phiên bản đang làm trước khi tích hợp. Không giả định API giáo án, đánh giá, thông báo hoặc AI đã tồn tại chỉ vì có màn hình tương ứng.

### 15.3. Thư viện và điều hướng

- Giữ stack hiện có: React, TypeScript, Vite, Tailwind và các thư viện đã dùng.
- Không tự cài nhiều thư viện chồng chức năng. Đọc `package.json` và quy ước nhóm trước khi bổ sung.
- Không điều hướng dựa trên chữ của nút. Dùng route hoặc callback rõ ràng, giữ ID đối tượng khi chuyển màn.
- Phân quyền thật do backend thực thi; UI chỉ hỗ trợ hiển thị phù hợp.

## 16. Thứ tự triển khai

| Ưu tiên | Phạm vi                                                   |
| ------- | --------------------------------------------------------- |
| P1      | Layout, điều hướng, lịch dạy, chi tiết buổi, điểm danh    |
| P2      | Dashboard dùng chung dữ liệu, danh sách và hồ sơ học viên |
| P3      | Giáo án, kết quả buổi, tiến độ và đánh giá                |
| P4      | Thông báo, bài tập về nhà, AI gợi ý                       |

Hoàn thiện tương tác P1 trước khi trang trí các màn mở rộng. Ghi rõ màn nào dùng API thật, màn nào demo. Mã CO trong tài liệu này là mã màn của đặc tả triển khai, không dùng thay thế mã định danh database hoặc API.

## 17. Tiêu chí nghiệm thu

- [ ] Mở đúng thông tin và học viên của buổi được chọn.
- [ ] Cùng học viên ở hai buổi có kết quả điểm danh độc lập.
- [ ] Bộ lọc/tìm kiếm không làm mất thay đổi chưa lưu.
- [ ] Thống kê điểm danh đúng trên toàn danh sách hợp lệ.
- [ ] Buổi/booking đã hủy không thao tác như đang hoạt động.
- [ ] Có cảnh báo rời trang hoặc chuyển buổi khi chưa lưu.
- [ ] Lỗi lưu giữ nguyên dữ liệu nhập và cho thử lại.
- [ ] Chưa điểm danh không bị tự chuyển thành vắng/có mặt.
- [ ] Không gửi enum chưa được backend hỗ trợ.
- [ ] Dashboard và chi tiết thống nhất số liệu.
- [ ] Bấm học viên mở đúng hồ sơ, không mở hồ sơ mẫu cố định.
- [ ] Giáo án được giao đúng người/lớp trong demo hoặc API tương ứng.
- [ ] Không có nút trông hoạt động nhưng không làm gì; chức năng chưa hỗ trợ được ghi rõ.
- [ ] Demo và API thật được phân biệt.
- [ ] Responsive, form, focus và trạng thái tải/lỗi được kiểm tra.
- [ ] Không làm hỏng portal khác hoặc dữ liệu dùng chung.
- [ ] Chạy build và kiểm tra TypeScript; báo riêng lỗi có sẵn/lỗi phát sinh.
- [ ] Không tự commit/push/deploy, gửi thông báo thật hoặc sửa backend/schema ngoài phạm vi.

### Các kịch bản kiểm tra tối thiểu

1. Mở buổi A, đổi trạng thái một học viên, lưu; mở buổi B của cùng lớp và xác nhận không bị thay đổi theo.
2. Sửa điểm danh rồi tìm kiếm học viên khác; quay lại và xác nhận thay đổi chưa mất.
3. Giả lập lưu lỗi; dữ liệu nhập còn nguyên và thử lại được.
4. Đang có thay đổi thì chuyển buổi; hệ thống hỏi trước khi bỏ.
5. Mở buổi đã hủy hoặc không có học viên; UI không cho thao tác sai.
6. Nếu có API thật, tải lại trang để kiểm tra dữ liệu được lưu và xử lý phản hồi không có quyền.

## 18. Báo cáo bàn giao bắt buộc

Sau khi triển khai, báo:

1. Những màn và tương tác đã hoàn thành theo P1–P4.
2. Các file quan trọng đã thay đổi và lý do.
3. Cách chạy và đường dẫn mở Coach Portal.
4. Nguồn dữ liệu mỗi màn: API thật hay demo.
5. Các bước kiểm tra, kết quả build/TypeScript và lỗi còn tồn tại.
6. Những trường, endpoint hoặc quy tắc cần backend bổ sung.
7. Những quyết định nghiệp vụ còn chờ nhóm chốt.

Không dùng câu “đã hoàn thành toàn bộ” nếu vẫn còn nút chưa xử lý hoặc thao tác demo chưa được ghi rõ.

---

**Yêu cầu bắt đầu:** Đọc repo, xác định component có thể tái sử dụng, sau đó triển khai P1 trước. Giữ đúng mô hình gói môn độc lập, quyền Coach theo phân công và dữ liệu theo từng buổi. Tài liệu này hướng dẫn xây UI/UX; không trao quyền tự thay đổi phạm vi hệ thống hoặc chính sách nghiệp vụ.
