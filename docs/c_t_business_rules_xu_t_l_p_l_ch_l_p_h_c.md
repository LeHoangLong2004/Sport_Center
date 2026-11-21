# Business Rules: Nghiệp vụ Đề xuất & Lập lịch Lớp học (Class Scheduling)

Tài liệu này định nghĩa các quy tắc nghiệp vụ (Business Rules), ràng buộc dữ liệu (Validation Rules), và luồng xử lý trạng thái cho tính năng **Đề xuất lớp học (Buổi đơn lẻ & Lịch định kỳ)** áp dụng cho mô hình trường học / trung tâm đào tạo.

---

## 1. Phân loại Lịch học (Schedule Types)

Hệ thống hỗ trợ 2 hình thức đề xuất lịch học:
1. **`ONE_TIME` (Buổi đơn lẻ):** Áp dụng cho lớp học thử, buổi dạy bù, sự kiện, hoặc lớp chuyên đề ngắn hạn diễn ra duy nhất 1 lần.
2. **`RECURRING` (Lịch định kỳ):** Áp dụng cho các lớp học theo khóa, theo tuần hoặc theo học kỳ, lặp lại theo quy tắc cố định trong một khoảng thời gian.

---

## 2. Quy tắc Dữ liệu Đầu vào & Ràng buộc (Input & Validation Rules)

### BR-01: Thời gian đặt trước tối thiểu (Lead Time)
* **Quy tắc:** Thời điểm bắt đầu của buổi học đầu tiên (`start_datetime`) phải cách thời điểm gửi đề xuất (`created_at`) tối thiểu **24 giờ**.
* **Điều kiện kiểm tra:** `first_session.start_datetime >= request.created_at + 24 hours`.
* **Thông báo lỗi:** *"Lớp học phải được đề xuất trước giờ bắt đầu ít nhất 24 giờ."*

### BR-02: Tính toán Thời gian Kết thúc (End Time Calculation)
* **Quy tắc:** Hệ thống tự động tính thời gian kết thúc của mỗi buổi học dựa trên giờ bắt đầu và thời lượng.
* **Công thức:** `end_time = start_time + duration_minutes`.
* **Ràng buộc:**
  * `duration_minutes` phải lớn hơn `0` và nằm trong khung giờ hoạt động của cơ sở (ví dụ: từ `06:00` đến `22:00`).
  * `end_time` không được vượt quá giờ đóng cửa trong ngày (không hỗ trợ buổi học vắt qua 2 ngày).

### BR-03: Quy tắc cho Lịch định kỳ (`RECURRING`)
Khi người dùng chọn loại lịch `RECURRING`, các ràng buộc sau bắt buộc phải thỏa mãn:
* **BR-03.1 (Ngày trong tuần):** Mảng `days_of_week` (giá trị từ `MON` đến `SUN`) không được rỗng (chọn ít nhất 1 ngày/tuần).
* **BR-03.2 (Khoảng thời gian):** `end_date` phải lớn hơn hoặc bằng `start_date`.
* **BR-03.3 (Giới hạn chu kỳ):** Khoảng thời gian từ `start_date` đến `end_date` không được vượt quá **180 ngày** (tương đương 1 học kỳ) cho một lần đề xuất.
* **BR-03.4 (Tính hợp lệ của chuỗi buổi học):** Trong khoảng `[start_date, end_date]`, phải tồn tại ít nhất **01 ngày** khớp với `days_of_week` đã chọn. Nếu không có ngày nào khớp, hệ thống từ chối lưu.

### BR-04: Sức chứa & Đối tượng học viên (Capacity & Cohort)
* **BR-04.1:** `max_capacity` (Sĩ số tối đa) phải là số nguyên dương (`> 0`).
* **BR-04.2:** `max_capacity <= facility.max_capacity` (Không được vượt quá sức chứa vật lý tối đa của phòng tập/lớp học được chọn).
* **BR-04.3:** Nếu áp dụng cho trường học, trường `target_group` (Khối/Lớp/Đối tượng) là bắt buộc để phục vụ kiểm tra trùng lịch học viên.

---

## 3. Quy tắc Kiểm tra Xung đột Lịch (Conflict Detection Rules)

Trước khi cho phép **Gửi đề xuất (Submit)** hoặc **Phê duyệt (Approve)**, hệ thống phải sinh danh sách các buổi học dự kiến (`Projected Sessions`) và kiểm tra xung đột theo công thức giao thoa thời gian:
> **Công thức trùng giờ (Time Overlap):** Hai khoảng thời gian `[Start_A, End_A]` và `[Start_B, End_B]` được coi là trùng nhau nếu:  
> `(Start_A < End_B) AND (End_A > Start_B)`  
> *(Lưu ý: `End_A == Start_B` được coi là hợp lệ, tức là ca sau bắt đầu ngay khi ca trước kết thúc).*

### BR-05: Xung đột Phòng học / Địa điểm (Facility Conflict)
* **Quy tắc:** Một phòng học (`facility_id`) không thể phục vụ 2 lớp học cùng lúc.
* **Phạm vi kiểm tra:** So sánh với tất cả các buổi học (`Class_Sessions`) có trạng thái `APPROVED` và các đề xuất đang `PENDING` (tùy chọn cảnh báo mềm cho `PENDING` và chặn cứng cho `APPROVED`).

### BR-06: Xung đột Giảng viên / Huấn luyện viên (Instructor Conflict)
* **Quy tắc:** Một giảng viên/HLV (`instructor_id`) không thể dạy 2 lớp có thời gian giao nhau.
* **Xử lý:** Chặn cứng (Hard Block) nếu phát hiện trùng lịch đã được duyệt (`APPROVED`).

### BR-07: Xung đột Nhóm học sinh / Khối lớp (Cohort/Class Conflict - Dành cho trường học)
* **Quy tắc:** Nếu đề xuất gắn với một lớp/nhóm học sinh cố định (`target_group_id`), nhóm này không thể có 2 lịch học trùng giờ nhau.

### BR-08: Xử lý Xung đột theo Loại Lịch
* Với `ONE_TIME`: Trùng buổi duy nhất $\rightarrow$ Chặn và báo lỗi chi tiết (trùng phòng hay trùng GV).
* Với `RECURRING`: Nếu có **bất kỳ buổi nào** trong chuỗi từ `start_date` đến `end_date` bị xung đột $\rightarrow$ Hệ thống trả về danh sách các ngày bị trùng (`conflict_dates[]`) để người dùng điều chỉnh (đổi phòng, đổi giờ, hoặc loại trừ ngày đó).

---

## 4. Kiến trúc Dữ liệu & Sinh Lịch Tự động (Data Model & Session Generation)

Để đảm bảo tính toàn vẹn dữ liệu và dễ dàng chỉnh sửa từng buổi lẻ về sau (ví dụ: nghỉ lễ, đổi giáo viên dạy thay), dữ liệu được tách thành 2 thực thể:

1. **`Class_Proposal` / `Class_Schedule` (Bảng cha - Thông tin chung & Quy tắc lặp):**
   * Lưu trữ: `id`, `title`, `subject_id`, `instructor_id`, `facility_id`, `schedule_type`, `start_date`, `end_date`, `days_of_week`, `start_time`, `duration_minutes`, `max_capacity`, `target_group`, `status`.
2. **`Class_Sessions` (Bảng con - Các buổi học cụ thể):**
   * Lưu trữ: `session_id`, `schedule_id` (FK), `session_date`, `start_datetime`, `end_datetime`, `actual_instructor_id`, `actual_facility_id`, `session_status`.

### BR-09: Quy tắc Sinh Buổi học (Session Generation Rule)
* Khi một đề xuất ở trạng thái `APPROVED`, hệ thống tự động thực hiện tác vụ sinh dữ liệu vào bảng `Class_Sessions`:
  * Nếu `schedule_type == ONE_TIME`: Sinh đúng **1 record** tương ứng với ngày và giờ đã chọn.
  * Nếu `schedule_type == RECURRING`: Duyệt qua từng ngày $D$ từ `start_date` đến `end_date`. Nếu thứ trong tuần của ngày $D$ nằm trong `days_of_week`, sinh **1 record** cho ngày $D$.
* **Ngoại lệ ngày lễ (Holiday Exception - Khuyến nghị):** Nếu ngày $D$ trùng với danh sách ngày nghỉ lễ của trường (`School_Holidays`), hệ thống có thể tự động bỏ qua hoặc đánh dấu buổi đó là `CANCELLED_HOLIDAY`.

---

## 5. Vòng đời Trạng thái (State Machine / Workflow)

Một đề xuất lớp học đi qua các trạng thái sau:

* **`PENDING` (Chờ duyệt):** Trạng thái mặc định ngay sau khi Giảng viên/HLV gửi form thành công. Tài nguyên (phòng, GV) được đánh dấu tạm giữ (Soft-lock).
* **`APPROVED` (Đã duyệt):** Quản lý/Giáo vụ phê duyệt. Hệ thống thực hiện kiểm tra xung đột lần cuối (BR-05, BR-06, BR-07), khóa cứng tài nguyên (Hard-lock) và kích hoạt quy tắc sinh buổi học (BR-09).
* **`REJECTED` (Từ chối):** Quản lý/Giáo vụ từ chối. Bắt buộc nhập `rejection_reason`. Giải phóng tài nguyên tạm giữ.
* **`CANCELLED` (Đã hủy):** Người tạo tự hủy khi đề xuất còn ở trạng thái `PENDING`.

### BR-10: Quy tắc Chỉnh sửa sau khi Gửi
* Chỉ cho phép chỉnh sửa thông tin đề xuất khi trạng thái là `PENDING`.
* Khi đã `APPROVED`, mọi thay đổi về giờ học, phòng học, hoặc giáo viên phải được thực hiện trên từng buổi cụ thể (`Class_Sessions`) hoặc hủy lịch cũ để tạo đề xuất mới.