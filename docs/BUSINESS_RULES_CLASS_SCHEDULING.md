# 🏋️ BẢN QUY TẮC NGHIỆP VỤ: ĐỀ XUẤT, XẾP LỊCH & ĐĂNG KÝ LỚP HỌC THEO CHU KỲ (SPORTCENTER CLASS SCHEDULING RULES)

> **Dự án:** SmartGym OS / Sport Center Management System  
> **Phân hệ:** Flow 2 – Class Booking & Schedule Management (Liên kết Flow 3 – Payment & Flow 4 – Attendance)  
> **Đối tượng áp dụng:** Center Manager (Quản lý), Coach (Huấn luyện viên), Member (Hội viên), Receptionist (Lễ tân)  
> **Cơ sở dữ liệu liên kết:** `classes` / `class_schedules` (Tầng 1), `class_sessions` (Tầng 2), `facilities`, `sports`, `coaches`, `class_bookings`, `subscriptions`, `appointments`, `class_attendance_records`  

---

## 1. PHÂN LOẠI HÌNH THỨC LỊCH LỚP HỌC (SCHEDULE TYPES)

Hệ thống SportCenter hỗ trợ 2 hình thức tổ chức lớp học trên cùng một biểu mẫu đề xuất:

1. **`ONE_TIME` (Lớp học đơn lẻ / Sự kiện / Chuyên đề):**
   * **Mục đích:** Buổi học thử (Trial Class), lớp dạy bù cho buổi bị nghỉ, Workshop chuyên đề (Dinh dưỡng, Kỹ thuật Deadlift/Squat), hoặc giải đấu giao hữu nội bộ (Boxing Sparring).
   * **Đặc điểm:** Diễn ra duy nhất **01 buổi** vào ngày và khung giờ xác định.

2. **`RECURRING` (Lớp học / Khóa học theo chu kỳ tuần linh hoạt):**
   * **Mục đích:** Các lớp học nhóm theo lộ trình/khóa của trung tâm (vd: Yoga cơ bản 4 tuần × 3 buổi/tuần = 12 buổi; Boxing nền tảng 8 tuần × 2 buổi/tuần = 16 buổi; Khóa chuyên sâu 10 tuần × 2 buổi/tuần = 20 buổi...).
   * **Đặc điểm:** Không cố định cứng số tuần hay số buổi; mọi tham số (số tuần, các thứ trong tuần, thời lượng mỗi buổi, tổng số buổi) đều được **tham số hóa linh hoạt** theo đặc thù từng bộ môn và kế hoạch đào tạo.

---

## 2. KIẾN TRÚC DỮ LIỆU 2 TẦNG & QUY TẮC SINH BUỔI TỰ ĐỘNG (DATA MODEL & SESSION GENERATION)

Để đảm bảo việc đăng ký/phê duyệt diễn ra gọn nhẹ ở cấp **Khóa học**, trong khi vận hành hàng ngày (điểm danh, đổi phòng, đổi HLV dạy thay, nghỉ lễ) vẫn xử lý linh hoạt ở cấp **Buổi lẻ**, dữ liệu lịch học được tách thành 2 tầng:

1. **Tầng 1 – Khóa học / Đề xuất mở lớp (`ClassProposal` / `ClassSchedule`):**
   * Lưu thông tin tổng thể của cả lộ trình: `id`, `title`, `sport_id`, `facility_id`, `coach_id`, `capacity`, `fee` (giá trọn khóa hoặc giá vé buổi), `schedule_type` (`ONE_TIME` | `RECURRING`), `start_date`, `end_date`, `weeks`, `days_of_week` (vd: `[1, 4]` cho T2 & T5), `total_sessions`, `start_time`, `duration_minutes`, `approval_status` (`pending` | `approved` | `rejected` | `cancelled`).
2. **Tầng 2 – Danh sách buổi học cụ thể (`ClassSession` / `ScheduleSlot`):**
   * Lưu từng buổi học con được sinh ra từ Tầng 1: `session_id`, `schedule_id` (FK), `session_number` (từ `1` đến `total_sessions`), `session_date`, `start_at`, `end_at`, `actual_facility_id`, `actual_coach_id`, `session_status` (`scheduled` | `completed` | `cancelled` | `rescheduled`).

### BR-01: Quy tắc Tự động Sinh chuỗi buổi học & Xem trước (Session Generation & Preview)
* **Thuật toán sinh buổi cho `RECURRING`:**
  1. Bắt đầu từ `start_date`, duyệt tuần tự từng ngày theo tiến trình thời gian.
  2. Nếu ngày đang xét rơi vào một trong các thứ thuộc `days_of_week` (và không trùng ngày nghỉ lễ của trung tâm nếu có cấu hình), hệ thống sinh 01 buổi học dự kiến với `end_at = start_at + duration_minutes` và đánh số thứ tự `session_number` tăng dần (`1, 2, ..., N`).
  3. Dừng lại khi đạt đến `end_date` (nếu cấu hình theo khoảng ngày/số tuần) **hoặc** khi sinh đủ `total_sessions` (nếu cấu hình theo tổng số buổi, hệ thống tự tính ngược lại `end_date` dự kiến).
* **Với `ONE_TIME`:** Sinh đúng **01 buổi** (`session_number = 1`) tương ứng ngày giờ đã chọn.
* **Xem trước trước khi gửi (Session Preview):** Trên form đề xuất, hệ thống bắt buộc hiển thị bản tóm tắt chu kỳ (vd: *"Khóa 12 buổi (4 tuần) • Thứ 2, 4, 6 • 60 phút/buổi • Từ 23/11 đến 18/12"*) kèm danh sách các buổi dự kiến và cảnh báo ngay nếu có buổi nào bị trùng lịch.

---

## 3. QUY TẮC DỮ LIỆU ĐẦU VÀO & RÀNG BUỘC (INPUT VALIDATION RULES)

### BR-02: Thời gian đề xuất trước tối thiểu (Lead Time)
* **Quy tắc:** Thời điểm bắt đầu của buổi học đầu tiên (`first_session.start_at`) phải cách thời điểm gửi đề xuất (`created_at`) **tối thiểu 24 giờ**.
* **Công thức kiểm tra:** `first_session.start_at >= current_time + 24 hours`.
* **Thông báo lỗi:** *"Lớp học phải được đề xuất/khởi tạo trước giờ bắt đầu buổi đầu tiên tối thiểu 24 giờ để ban quản lý duyệt và hội viên kịp đăng ký."*

### BR-03: Khung giờ hoạt động & Thời lượng mỗi buổi (Operating Hours & Duration)
* **Khung giờ hoạt động của trung tâm:** **06:00 đến 22:00** tất cả các ngày trong tuần.
* **Thời gian kết thúc tự động tính:** `end_time = start_time + duration_minutes`.
* **Ràng buộc giờ:**
  * Toàn bộ thời gian ca tập `[start_time, end_time]` bắt buộc nằm trọn trong khoảng `06:00 – 22:00`.
  * **Chặn lớp xuyên đêm:** Không hỗ trợ ca tập vắt qua 2 ngày (ca muộn nhất phải kết thúc trước hoặc đúng `22:00`).
* **Thời lượng hợp lệ (`duration_minutes`):** Linh hoạt tùy bộ môn, tối thiểu **30 phút** và tối đa **180 phút** (3 tiếng) cho mỗi buổi tập (vd: Yoga/Gym 60–90 phút; chuyên đề/huấn luyện cường độ dài 120–150 phút).

### BR-04: Ràng buộc tham số cho Lịch định kỳ (`RECURRING`)
Khi chọn hình thức lịch lặp định kỳ, bắt buộc thỏa mãn 4 điều kiện:
* **BR-04.1 (Thứ trong tuần):** Mảng `days_of_week` (từ Thứ 2 đến Chủ Nhật) không được rỗng (chọn tối thiểu 1 ngày/tuần; linh hoạt 1, 2, 3... ngày/tuần tùy khóa).
* **BR-04.2 (Khoảng thời gian / Số buổi):**
  * Nếu cấu hình theo ngày: `end_date >= start_date`.
  * Nếu cấu hình theo số tuần hoặc tổng số buổi: `weeks >= 1` hoặc `total_sessions >= 2`.
* **BR-04.3 (Giới hạn chu kỳ tối đa):** Một lần đề xuất không vượt quá **180 ngày** (~24 tuần) nhằm đảm bảo trung tâm kiểm soát tốt tài nguyên phòng tập và lịch HLV theo từng giai đoạn.
* **BR-04.4 (Tính hợp lệ của chuỗi buổi):** Trong khoảng thời gian đã chọn, bắt buộc phải sinh ra được ít nhất **01 buổi học** khớp với `days_of_week`.

### BR-05: Sĩ số lớp học & Cấu hình Phân loại Phòng tập (Capacity & Facility Classification)
* **BR-05.1:** Sĩ số tối đa (`capacity`) phải là số nguyên dương (`> 0`).
* **BR-05.2 (Phân loại phòng & Chế độ chia sẻ phòng - Shared Facility):**
  * Để hỗ trợ linh hoạt cả phòng tập kín (Studio) lẫn các khu vực thể thao rộng lớn (Sân bãi, hồ bơi), bảng Phòng tập (`facilities`/`rooms`) hỗ trợ các thuộc tính cấu hình:
    * `allow_concurrent_classes` (Boolean, mặc định `false`):
      * `false` (Phòng tiêu chuẩn / Studio Yoga / Boxing Ring / Phòng học kín): Chế độ 1:1 nghiêm ngặt. Chỉ cho phép duy nhất 01 lớp hoạt động tại 01 thời điểm. Chặn tuyệt đối nếu đã có lớp khác chiếm dụng.
      * `true` (Khu tập diện tích lớn: Sân bóng, Hồ bơi nhiều làn, Sân cầu lông đa năng, Gym Area): Cho phép nhiều lớp hoạt động song song trong cùng khung giờ.
    * `max_concurrent_classes` (Số lớp song song tối đa, ví dụ: 2 hoặc 3 lớp) và `total_capacity` (Tổng sức chứa tối đa của cả khu vực):
      * Khi xếp thêm lớp vào phòng `allow_concurrent_classes = true`, hệ thống bắt buộc kiểm tra 2 điều kiện đồng thời:
        1. Số lớp đang chạy cùng giờ `<= max_concurrent_classes`.
        2. Tổng sĩ số cộng dồn của các lớp chạy cùng giờ: `(capacity_A + capacity_B + ...) <= total_capacity`.
* **BR-05.3 (Phù hợp bộ môn):** Phòng tập phải đúng công năng bộ môn (vd: Boxing tại phòng có sàn Ring/bao cát; Bơi tại Bể bơi AquaFit; Gym tại Gym Area).
* **BR-05.4 (Chuyên môn HLV):** HLV chỉ được phép đề xuất các bộ môn mà mình được phân công trong bảng `coach_sports`.

---

## 4. QUY TẮC KIỂM TRA XUNG ĐỘT TÀI NGUYÊN (CONFLICT DETECTION RULES)

Trước khi **Gửi đề xuất (Submit)**, **Tạo mới trực tiếp (Create)** hoặc **Phê duyệt (Approve)**, hệ thống bắt buộc quét xung đột trên **toàn bộ danh sách buổi dự kiến** theo công thức giao thoa thời gian:

> **Thuật toán Giao thoa Thời gian (Time Overlap Formula):**  
> Hai ca tập `A` và `B` bị coi là trùng giờ khi và chỉ khi:  
> `(Start_A < End_B) VÀ (End_A > Start_B)`  
> *(Nếu `End_A == Start_B`, tức ca sau bắt đầu đúng lúc ca trước kết thúc thì coi là **HỢP LỆ**, không tính trùng).*

### BR-06: Xung đột Phòng tập & Chống Tranh chấp Đồng thời (Facility Conflict & Concurrency Control)
* **BR-06.1 (Kiểm tra xung đột phòng đơn):**
  * Với phòng `allow_concurrent_classes = false`: Chặn cứng (Hard Block) nếu phát hiện phòng tập đã có buổi học ở trạng thái `approved` (hoặc `scheduled`) trùng khung giờ.
* **BR-06.2 (Chống Race Condition tại Tầng Cơ sở dữ liệu & Backend):**
  * Xử lý triệt để tình huống 2 HLV cùng gửi đề xuất hoặc 2 Quản lý cùng bấm `[Phê duyệt]` cho 2 lớp vào cùng một phòng tại cùng một mili-giây:
  * Sử dụng **Database Transaction** kết hợp khóa bi quan (**Pessimistic Locking**: `SELECT ... FOR UPDATE`) hoặc PostgreSQL GiST Range Exclusion (`EXCLUDE USING gist`) trên khoảng thời gian `[start_at, end_at)` theo `room_id`.
  * Đảm bảo giao dịch thực thi tuần tự (Atomic & Isolated): Lớp nào được duyệt trước mili-giây sẽ thành công; lớp duyệt ngay sau đó lập tức bị chặn lại kèm thông báo lỗi phòng đã bị cấp cho lớp khác.
* **BR-06.3 (Quy trình 2 chốt chặn kiểm soát trên UI/UX):**
  * **Chốt chặn 1 (Lúc HLV tạo đề xuất):** Khi HLV chọn ngày bắt đầu, thứ trong tuần và khung giờ, dropdown chọn phòng sẽ tự động kiểm tra trước và đánh dấu trạng thái *(Đang trống)* hoặc *(Bận 2/20 buổi - Trùng Thứ 5)* để HLV né phòng trùng ngay từ đầu.
  * **Chốt chặn 2 (Cổng phê duyệt của Quản lý - Approval Gate):** Nếu 2 HLV cùng gửi đề xuất `pending` cho cùng 1 phòng trống, khi Quản lý duyệt đề xuất của HLV 1 thì phòng chuyển sang `approved`. Ngay sau đó, nếu Quản lý bấm duyệt đề xuất của HLV 2, hệ thống lập tức khóa nút duyệt và thông báo: *"Không thể duyệt: Phòng này vừa được cấp cho [Tên lớp HLV 1] trong cùng khung giờ. Vui lòng từ chối hoặc yêu cầu đổi phòng"*..

### BR-07: Xung đột Huấn luyện viên (Coach Conflict)
* Một HLV (`coach_id`) không thể dạy 2 lớp học cùng giờ, và không thể dạy lớp nhóm khi đang có lịch hẹn kèm riêng 1-1 (`appointments`).
* Quét đồng thời bảng buổi học (`class_sessions`/`classes`) và bảng lịch hẹn PT (`appointments`).

### BR-08: Báo cáo Xung đột chi tiết theo từng buổi (Per-Session Conflict Reporting)
* **Với `ONE_TIME`:** Trùng buổi duy nhất ➔ Chặn ngay và báo rõ nguyên nhân (trùng phòng hay trùng HLV).
* **Với `RECURRING`:** Kiểm tra lần lượt từng buổi từ `1` đến `N`. Nếu có bất kỳ buổi nào bị trùng ➔ Trả về danh sách chi tiết từng buổi lỗi (vd: *"Buổi 4 ngày 03/12/2026 trùng phòng Studio 1"*, *"Buổi 7 ngày 14/12/2026 trùng lịch PT của HLV"*) để người tạo đổi ngày bắt đầu, đổi thứ trong tuần, đổi phòng hoặc điều chỉnh trước khi gửi.

---

## 5. QUY TẮC HIỂN THỊ, ĐẶT LỚP & THANH TOÁN CHO HỘI VIÊN (MEMBER BOOKING & PAYMENT RULES)

### BR-09: Hiển thị Thẻ lớp (Class Card) & Xem chi tiết Lộ trình
* **Trên trang Khám phá & Đặt lịch:** Giữ nguyên bố cục thẻ (Card) quen thuộc, trong đó mỗi thẻ đại diện cho 01 lớp/khóa học:
  * Với `ONE_TIME`: Hiển thị khung giờ và ngày cụ thể (vd: `07:30 - 08:30 (21/11/2026)`).
  * Với `RECURRING`: Hiển thị rõ thông tin chu kỳ ngay trên thẻ (vd: `08:00 - 10:00 • T2 & T5 • Bắt đầu 23/11/2026 (16 buổi / 8 tuần)`), kèm giá trọn khóa và số chỗ trống (`Còn 18/20 chỗ`).
* **Nút `[Xem chi tiết]`:** Hiển thị đầy đủ danh sách toàn bộ các buổi học con (từ Buổi 1 đến Buổi N: ngày, thứ, khung giờ, phòng tập, HLV) để hội viên kiểm tra kỹ trước khi xác nhận thanh toán.

### BR-10: Cơ chế Thanh toán & Giữ chỗ (Single vs. Full-Course Enrollment)
* **Với `ONE_TIME`:** Hội viên đăng ký và thanh toán cho 01 buổi duy nhất (hoặc trừ 01 buổi từ gói hội viên hợp lệ).
* **Với `RECURRING` (Thanh toán trọn khóa – Mặc định):**
  * Hội viên sử dụng cùng luồng thanh toán quen thuộc (Ví nội bộ / SePay VietQR / VNPay / Tại quầy) để thanh toán **01 lần duy nhất cho trọn chu kỳ khóa học** (hoặc dùng gói thành viên có áp dụng quyền lợi giảm giá theo hạng Plus 8% / Premium 15%).
  * Sau khi thanh toán thành công: Hệ thống ghi nhận hội viên vào khóa học, giảm 01 chỗ trống của cả khóa (`current_bookings + 1`), đồng thời **tự động đồng bộ toàn bộ N buổi học con vào mục `Lịch của tôi` và `Điểm danh`** của hội viên.

### BR-11: Kiểm tra Sĩ số & Hạn đăng ký Khai giảng (Capacity & Enrollment Cutoff)
* **Sĩ số:** Chỉ cho phép đăng ký khi `current_bookings < capacity`. Khi đủ chỗ, khóa nút đăng ký và hiển thị **"Hết chỗ" (Full)**.
* **Hạn đăng ký đối với lớp chu kỳ (`RECURRING`):**
  * **Mặc định (Chặn vào giữa khóa):** Chỉ cho phép hội viên đăng ký **trước thời điểm bắt đầu Buổi 1 (ngày khai giảng)**. Khi lớp đã khai giảng, hệ thống tự động đóng đăng ký để đảm bảo đồng bộ giáo trình và học phí trọn khóa.
  * *(Tùy chọn mở rộng cho Manager):* Nếu trung tâm cho phép ghi danh muộn ở một số lớp đặc biệt, chỉ mở tối đa trước khi bắt đầu Buổi 2 và vẫn thu đủ/tính rõ phí theo quy định trung tâm.

### BR-12: Phân tầng Thời gian Đặt trước theo Hạng Thẻ (Tier Booking Window)
* **Với `ONE_TIME` (Đặt buổi lẻ Drop-in):** Áp dụng giới hạn đặt trước theo hạng thẻ hội viên:
  * **Hạng Cơ bản (Basic):** Đặt trước tối đa **24 giờ** (1 ngày).
  * **Hạng Plus:** Đặt trước tối đa **72 giờ** (3 ngày).
  * **Hạng Premium VIP:** Đặt trước tối đa **120 giờ** (5 ngày).
* **Với `RECURRING` (Khóa học theo chu kỳ):** Cho phép mở đăng ký sớm trước ngày khai giảng (vd: mở trước 14–30 ngày) để học viên chủ động sắp xếp lịch dài hạn; có thể áp dụng chiết khấu ưu đãi theo hạng thẻ Plus/Premium khi thanh toán trọn khóa.

### BR-13: Kiểm tra Trùng lịch Cá nhân của Hội viên & Xử lý Xung đột Lịch Cục bộ (Member Multi-Session Clash Check)
* **Với `ONE_TIME` (Lớp đơn lẻ):**
  * Kiểm tra buổi sắp đặt không giao thoa thời gian với bất kỳ buổi học nhóm nào khác hoặc lịch hẹn PT 1-1 (`appointments`) của học viên. Nếu trùng -> Chặn ngay.
* **Với `RECURRING` (Lớp học theo chu kỳ) & Bài toán Xung đột cục bộ (Partial Schedule Conflict):**
  * **Tình huống thực tế:** Học viên đã đăng ký Lớp A (học T2 - T5 - T7 lúc 17:00), sau đó muốn đăng ký thêm Lớp B (học T3 - T6 - T7 lúc 17:00) -> Hai lớp bị xung đột đúng ca **Thứ 7 lúc 17:00 hàng tuần** (kéo dài trong suốt số tuần của khóa).
  * **Thuật toán quét ma trận buổi học (Cross-Session Clash Detection):**
    * Khi học viên bấm `[Đăng ký]` hoặc chuyển sang bước xác nhận thanh toán, hệ thống lấy toàn bộ `N` buổi con dự kiến của Lớp B đối chiếu với toàn bộ các buổi học và lịch PT hiện có của học viên theo công thức:
      `(Start_New < End_Existing) VÀ (End_New > Start_Existing)`
  * **Cơ chế xử lý chuẩn (Mức Core MVP - Chặn cứng / Hard Block):**
    * Theo chuẩn đăng ký tín chỉ và giáo trình liền mạch: **Chỉ cần phát hiện `>= 1` buổi bị trùng**, hệ thống sẽ **khóa nút thanh toán (Hard Block)**.
    * **Cấu trúc thông báo lỗi trực quan trên UI:** Không chỉ báo lỗi chung chung, hệ thống trả về danh sách chi tiết các ca xung đột để học viên nắm rõ:
      * Tên lớp đang xung đột: ví dụ *"Lớp Yoga Thư Giãn (Lớp A)"*.
      * Chi tiết ca trùng: Thứ trong tuần, khung giờ và danh sách ngày cụ thể (ví dụ: *"Trùng vào Thứ 7 lúc 17:00 - 19:30 trong 10 tuần"*).
      * Hướng dẫn xử lý: Gợi ý học viên chọn lớp B ở khung giờ khác hoặc hủy lớp A nếu muốn đổi sang lớp B.
  * **Cơ chế mở rộng linh hoạt (Phase 2 - Soft Warning & Exception):**
    * Dành cho mô hình trung tâm thể thao nếu ban quản lý cho phép học viên linh hoạt:
      * *Tùy chọn A (Chấp nhận trùng & Học bù - Make-up Session):* Học viên bấm xác nhận tự nguyện bỏ buổi trùng của lớp B để đi lớp A, hệ thống gắn nhãn cảnh báo `[Trùng lịch]` trong `Lịch của tôi` và cấp quyền đăng ký 1 ca học bù tương đương trong tháng.
      * *Tùy chọn B (Đăng ký trừ buổi - Partial Enrollment):* Tự động loại bỏ các buổi Thứ 7 bị trùng ra khỏi lịch của học viên, tiền học phí trọn khóa tự động khấu trừ theo số buổi thực tế tham gia (ví dụ tính tiền 20 buổi thay vì 30 buổi).

### BR-14: Chính sách Hủy đặt & Hoàn tiền (Cancellation & Refund Policy)
* **Đối với lớp đơn lẻ (`ONE_TIME`):**
  * Hủy trước giờ bắt đầu **tối thiểu 02 tiếng**: Hợp lệ, hoàn tiền vào Ví nội bộ (nếu mua vé lẻ) hoặc không trừ buổi (nếu dùng gói).
  * Hủy sát giờ (< 02 tiếng) hoặc vắng mặt không báo (No-show): Tính đã sử dụng 01 buổi / không hoàn tiền vé.
* **Đối với lớp theo chu kỳ (`RECURRING`):**
  * **Hủy trước ngày khai giảng (trước giờ bắt đầu Buổi 1 tối thiểu 24 giờ):** Hội viên được phép tự bấm `[Hủy đặt]`. Hệ thống hoàn **100% học phí về Ví nội bộ**, hủy toàn bộ lịch con trong `Lịch của tôi` và **giải phóng 01 chỗ trống trên toàn bộ N buổi** của lớp.
  * **Hủy sát giờ khai giảng (< 24 giờ trước Buổi 1) hoặc sau khi khóa đã khai giảng (đã diễn ra >= 1 buổi):** Khóa nút tự hủy trên app để tránh gian lận/vỡ lớp. Hội viên có nhu cầu bảo lưu hoặc hoàn phí tỷ lệ các buổi còn lại phải gửi yêu cầu hỗ trợ (`Support Ticket`) để Lễ tân / Manager thẩm định và xử lý.

---

## 6. VÒNG ĐỜI TRẠNG THÁI, PHÊ DUYỆT CHUỖI & ĐIỂM DANH (LIFECYCLE, APPROVAL & ATTENDANCE)

```
[ Coach Propose ] ──> PENDING ──┬──(Manager Approve cả chuỗi)──> APPROVED (Kích hoạt đủ N buổi & mở đăng ký)
                                ├──(Manager Reject cả chuỗi) ──> REJECTED (Không kích hoạt buổi nào, nhả phòng)
                                └──(Coach tự thu hồi)        ──> CANCELLED
```

### BR-15: Máy trạng thái & Phê duyệt Cả chuỗi (Batch Approval Workflow)
* **`PENDING` (Chờ duyệt):**
  * Sinh ra khi Coach gửi đề xuất (`ONE_TIME` hoặc `RECURRING`). Kích hoạt giữ chỗ mềm (Soft-lock) tài nguyên.
  * Chỉ khi ở trạng thái `PENDING`, Coach mới được phép chỉnh sửa hoặc thu hồi đề xuất.
* **`APPROVED` (Đã duyệt – Phê duyệt cả chuỗi):**
  * Manager phê duyệt **01 lần duy nhất cho toàn bộ khóa học** (không duyệt lắt nhắt từng buổi).
  * Hệ thống kiểm tra xung đột lần cuối trên cả N buổi (BR-06, BR-07), khóa cứng tài nguyên (Hard-lock), chính thức kích hoạt toàn bộ N bản ghi `ClassSession` và hiển thị Card lớp học lên Member Portal.
* **`REJECTED` (Từ chối):**
  * Manager từ chối toàn bộ đề xuất và **bắt buộc nhập lý do (`rejection_reason`)**. Toàn bộ N buổi dự kiến không được kích hoạt và giải phóng ngay tài nguyên tạm giữ.
* **`CANCELLED` (Hủy lớp / Hủy khóa):**
  * Áp dụng khi Coach tự thu hồi đề xuất `PENDING`, hoặc khi Manager buộc phải hủy lớp đã duyệt do sự cố bất khả kháng (hoàn tiền/buổi tự động cho học viên bị ảnh hưởng và gửi thông báo khẩn).

### BR-16: Quy tắc Chỉnh sửa Cục bộ trên Từng Buổi con sau khi đã Duyệt (Single-Session Exception)
* Khi khóa học đã ở trạng thái `APPROVED`, **không cho phép sửa trực tiếp quy tắc lặp của cả khóa** (để tránh đảo lộn lịch của các học viên đã đóng tiền).
* Mọi thay đổi phát sinh trong quá trình vận hành (vd: nghỉ lễ 1 buổi, sự cố phòng tập phải đổi phòng buổi 5, HLV ốm phải cử HLV dạy thay buổi 8, hoặc dời 1 buổi sang ngày dạy bù) chỉ được thao tác **trực tiếp trên bản ghi buổi con (`ClassSession`) tương ứng**, đảm bảo các buổi còn lại trong khóa không bị ảnh hưởng.

### BR-17: Liên kết Điểm danh & Theo dõi Tiến độ Khóa học (Flow 4 Integration)
* Hội viên đăng ký và giữ chỗ gắn với **Khóa học (Tầng 1)**, nhưng thao tác **Điểm danh diễn ra trên từng buổi học cụ thể (Tầng 2)** (`Buổi 1/N`, `Buổi 2/N`, ..., `Buổi N/N`).
* Sau mỗi buổi, HLV đánh dấu trạng thái `Present / Absent / Late` vào bảng `class_attendance_records`. Hệ thống tự động tổng hợp tiến độ hoàn thành khóa học (vd: *Đã tham gia 6/12 buổi – Tỷ lệ chuyên cần 100%*) hiển thị cho cả Coach, Member và cung cấp dữ liệu đầu vào cho Flow 5 AI.

---

## 7. MA TRẬN PHÂN QUYỀN NGHIỆP VỤ (RBAC MATRIX)

| Hành động nghiệp vụ | Center Manager | Coach | Member | Receptionist |
| :--- | :---: | :---: | :---: | :---: |
| **Tạo lớp (đơn lẻ / chu kỳ) và mở trực tiếp** | ✅ Có quyền | ❌ Không | ❌ Không | ❌ Không |
| **Gửi đề xuất mở lớp mới (đơn lẻ / chu kỳ)** | ✅ Có quyền | ✅ (Đúng môn phụ trách) | ❌ Không | ❌ Không |
| **Phê duyệt / Từ chối đề xuất cả chuỗi** | ✅ Có quyền | ❌ Không | ❌ Không | ❌ Không |
| **Chỉnh sửa / Thu hồi đề xuất khi đang `PENDING`** | ✅ Có quyền | ✅ (Của chính mình) | ❌ Không | ❌ Không |
| **Sửa lẻ 1 buổi con (đổi phòng / đổi HLV / dời lịch)** | ✅ Có quyền | 🟡 Gửi yêu cầu đổi ca | ❌ Không | ❌ Không |
| **Hủy buổi học hoặc hủy khóa đã duyệt** | ✅ Có quyền | ❌ Không | ❌ Không | ❌ Không |
| **Đăng ký & Thanh toán lớp (đơn lẻ / trọn khóa)** | ❌ (Đăng ký hộ) | ❌ Không | ✅ Tự đăng ký | ✅ Đăng ký hộ tại quầy |
| **Hủy đăng ký hợp lệ (trước 2h buổi lẻ / 24h khai giảng)** | ✅ Xử lý ngoại lệ | ❌ Không | ✅ Tự hủy đúng hạn | ✅ Hủy hộ / Hỗ trợ |
| **Điểm danh học viên theo từng buổi (`1/N .. N/N`)** | ✅ Giám sát | ✅ Điểm danh lớp mình | ❌ (Chỉ xem lịch sử) | ❌ (Chỉ check-in cổng) |
