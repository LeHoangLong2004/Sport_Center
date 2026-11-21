# 🏋️ BẢN QUY TẮC NGHIỆP VỤ: ĐỀ XUẤT & XẾP LỊCH LỚP HỌC (SPORTCENTER CLASS SCHEDULING RULES)

> **Hệ thống:** SmartGym OS / Sport Center Management System  
> **Phân hệ:** Flow 2 – Class Booking & Schedule Management  
> **Đối tượng áp dụng:** Center Manager (Quản lý), Coach (Huấn luyện viên), Member (Hội viên), Receptionist (Lễ tân)  
> **Cơ sở dữ liệu liên kết:** `classes`, `facilities`, `sports`, `coaches`, `class_bookings`, `subscriptions`  

---

## 1. PHÂN LOẠI HÌNH THỨC LỊCH LỚP HỌC (SCHEDULE TYPES)

Trung tâm thể thao hỗ trợ 2 hình thức tổ chức lớp học:

1. **`ONE_TIME` (Lớp học đơn lẻ / Chuyên đề / Sự kiện):**
   * Áp dụng cho: Buổi tập thử (Trial Class), Workshop dinh dưỡng/thể lực, buổi dạy bù cho lớp nghỉ trước đó, hoặc sự kiện giao lưu đặc biệt (vd: Master Class Yoga cuối tuần, Giải đấu giao hữu Boxing nội bộ).
   * Đặc điểm: Diễn ra duy nhất 01 buổi vào ngày và khung giờ xác định.
2. **`RECURRING` (Lớp học nhóm định kỳ theo khóa):**
   * Áp dụng cho: Lớp nhóm thường niên của trung tâm (vd: Yoga sáng Thứ 2 - 4 - 6 lúc 06:30, Boxing tối Thứ 3 - 5 - 7 lúc 18:30, Zumba cuối tuần).
   * Đặc điểm: Lặp lại cố định theo các thứ trong tuần trong một khoảng thời gian (theo tháng, quý hoặc mùa giải).

---

## 2. QUY TẮC DỮ LIỆU ĐẦU VÀO & RÀNG BUỘC (INPUT VALIDATION RULES)

### BR-01: Thời gian đề xuất trước tối thiểu (Lead Time)
* **Quy tắc:** Để đảm bảo khâu kiểm duyệt cơ sở vật chất và thông báo mở đăng ký cho hội viên, thời điểm bắt đầu của buổi học đầu tiên (`schedule_time`) phải cách thời điểm gửi đề xuất (`created_at`) **tối thiểu 24 giờ**.
* **Công thức kiểm tra:** `first_session.schedule_time >= current_time + 24 hours`.
* **Thông báo lỗi:** *"Lớp học phải được đề xuất/khởi tạo trước giờ bắt đầu tối thiểu 24 giờ để hoàn tất thủ tục mở lớp."*

### BR-02: Khung giờ hoạt động & Thời lượng lớp học (Operating Hours & Duration)
* **Quy tắc:**
  * Giờ kết thúc của lớp học được tính tự động: `end_time = schedule_time + duration_minutes`.
  * Khung giờ hoạt động của trung tâm: **06:00 đến 22:00** tất cả các ngày trong tuần.
  * Toàn bộ thời gian diễn ra lớp học `[schedule_time, end_time]` bắt buộc phải nằm trọn vẹn trong khung giờ `06:00 - 22:00`.
  * **Chặn lớp xuyên đêm:** Không hỗ trợ các ca tập vắt qua 2 ngày (giờ kết thúc trễ nhất là `22:00`).
* **Thời lượng hợp lệ (`duration_minutes`):** Số nguyên dương, tối thiểu **30 phút** và tối đa **180 phút** (3 tiếng) cho mỗi ca tập.

### BR-03: Ràng buộc đối với Lịch định kỳ (`RECURRING`)
Khi đề xuất lịch lặp lại định kỳ, bắt buộc phải thỏa mãn 4 điều kiện:
* **BR-03.1 (Thứ trong tuần):** Mảng `days_of_week` (chọn từ Thứ 2 đến Chủ Nhật) không được rỗng (chọn ít nhất 1 ngày/tuần).
* **BR-03.2 (Khoảng thời gian hiệu lực):** `end_date >= start_date`.
* **BR-03.3 (Chu kỳ tối đa):** Khoảng thời gian từ `start_date` đến `end_date` không vượt quá **90 ngày** (tương đương 3 tháng / 1 quý hoạt động) cho một lần đề xuất, nhằm đảm bảo trung tâm có thể đánh giá lại hiệu quả lớp học trước khi gia hạn.
* **BR-03.4 (Tính hợp lệ của lịch lặp):** Trong khoảng `[start_date, end_date]`, phải tồn tại ít nhất **01 ngày** khớp với thứ trong tuần đã chọn.

### BR-04: Sĩ số lớp học & Giới hạn Phòng tập (Capacity & Facility Limits)
* **BR-04.1:** Sĩ số tối đa của lớp (`capacity`) phải là số nguyên dương (`> 0`).
* **BR-04.2 (Giới hạn sức chứa phòng tập):** `capacity <= facility.max_capacity`.
  * *Ví dụ: Studio Yoga 1 chỉ có sức chứa tối đa 20 thảm tập, thì lớp Yoga đề xuất không được vượt quá 20 học viên.*
* **BR-04.3 (Phù hợp bộ môn):** Phòng tập được chọn phải hỗ trợ đúng bộ môn của lớp học (vd: Lớp Boxing bắt buộc tổ chức tại Studio có sàn Boxing Ring hoặc khu vực bao cát; lớp Bơi bắt buộc tại Bể bơi AquaFit).

---

## 3. QUY TẮC KIỂM TRA XUNG ĐỘT TÀI NGUYÊN (CONFLICT DETECTION RULES)

Hệ thống bắt buộc phải chạy thuật toán phát hiện xung đột lịch trước khi **Gửi đề xuất (Submit)**, **Tạo mới trực tiếp (Create)** hoặc **Phê duyệt (Approve)**.

> **Thuật toán Giao thoa Thời gian (Time Overlap Formula):**  
> Hai ca tập $A$ và $B$ bị coi là trùng giờ khi và chỉ khi:  
> $$(Start_A < End_B) \quad \text{VÀ} \quad (End_A > Start_B)$$  
> *(Lưu ý: Nếu $End_A = Start_B$, tức ca sau bắt đầu đúng thời điểm ca trước kết thúc thì coi là **HỢP LỆ**, không bị trùng).*

### BR-05: Xung đột Cơ sở vật chất / Phòng tập (Facility Conflict)
* **Quy tắc:** Một phòng tập (`facility_id`) tại một thời điểm chỉ phục vụ duy nhất 01 lớp học.
* **Xử lý:** Chặn cứng (Hard Block) nếu phát hiện phòng tập đã có lớp học khác ở trạng thái `approved` trùng giờ.
* **Thông báo lỗi:** *"Phòng tập '[Tên phòng]' đã có lịch hoạt động của lớp '[Tên lớp trùng]' trong khung giờ này."*

### BR-06: Xung đột Huấn luyện viên (Coach Conflict)
* **Quy tắc:** Một Huấn luyện viên (`coach_id`) không thể đứng 2 lớp học khác nhau cùng giờ, và không thể dạy lớp nhóm khi đang có lịch hẹn dạy kèm riêng (1-on-1 PT Session).
* **Xử lý:** Quét đồng thời cả bảng `classes` và bảng `appointments`. Nếu phát hiện trùng giờ với lịch dạy đã được xác nhận ➔ Chặn và báo lỗi.
* **Thông báo lỗi:** *"Huấn luyện viên [Tên HLV] đã có lịch giảng dạy/kèm PT trùng vào khung giờ này."*

### BR-07: Xử lý Xung đột theo Hình thức Lịch
* **Đối với `ONE_TIME`:** Phát hiện trùng ➔ Chặn ngay, chỉ rõ nguyên nhân trùng HLV hay trùng Phòng.
* **Đối với `RECURRING`:** Nếu trong chuỗi lặp có 1 hoặc nhiều ngày bị trùng lịch ➔ Hệ thống không hủy bỏ toàn bộ mà trả về danh sách chi tiết các ngày bị trùng (`conflict_dates[]`) để HLV/Quản lý chủ động đổi giờ, đổi phòng hoặc loại trừ các ngày đó ra khỏi chuỗi.

---

## 4. QUY TẮC DÀNH CHO HỘI VIÊN ĐẶT LỚP (MEMBER BOOKING RULES)

Sau khi lớp học được công bố mở (`approval_status = 'approved'`), hội viên đặt chỗ (`POST /api/classes/{id}/book`) phải tuân thủ các quy tắc sau:

### BR-08: Kiểm tra Sĩ số chỗ trống (Class Availability)
* Lớp học chỉ cho phép đặt khi số lượng đã đăng ký chưa đạt trần: `current_bookings < capacity`.
* Khi lớp đạt sĩ số tối đa: Hệ thống tự động khóa đặt chỗ và chuyển trạng thái hiển thị sang **"Hết chỗ" (Full)**.

### BR-09: Phân tầng Thời gian Đặt trước theo Hạng Thẻ (Tier Booking Window)
Để khuyến khích hội viên nâng cấp gói thẻ cao cấp, thời gian được phép đặt chỗ trước giờ học được phân tầng nghiêm ngặt theo hạng hội viên:
* **Hạng Cơ bản (Basic Member):** Được đặt trước tối đa **24 giờ** (1 ngày).
* **Hạng Plus (Plus Member):** Được đặt trước tối đa **72 giờ** (3 ngày).
* **Hạng Premium VIP (VIP Member):** Được đặt trước tối đa **120 giờ** (5 ngày).
* *Quy tắc chặn:* Nếu hội viên đặt lịch trước thời hạn cho phép của hạng thẻ ➔ Hệ thống từ chối và hiển thị thông báo gợi ý nâng cấp gói thẻ.

### BR-10: Kiểm tra Trùng lịch Cá nhân của Hội viên (Member Schedule Clash)
* Một hội viên không thể đặt 2 lớp nhóm trùng giờ nhau, và không thể đặt lớp nhóm nếu đã có lịch hẹn tập riêng với PT 1-1 cùng giờ.

### BR-11: Ràng buộc Hủy lịch & Chống bùng buổi (Cancellation & No-Show Policy)
* **Hủy hợp lệ:** Hội viên được phép tự bấm hủy chỗ trước giờ học bắt đầu **tối thiểu 02 tiếng** mà không bị trừ buổi/tiền.
* **Hủy muộn / Bùng lịch (Late Cancel & No-Show):** Nếu hủy sát giờ (< 2 tiếng) hoặc vắng mặt không báo trước:
  * Trừ 01 buổi tập trong gói hội viên.
  * Không hoàn trả tiền vé đối với đơn mua vé lẻ.

---

## 5. VÒNG ĐỜI TRẠNG THÁI & PHÂN QUYỀN DUYỆT (LIFECYCLE & WORKFLOW)

```
[ Coach Propose ] ──> PENDING ──┬──(Manager Approve)──> APPROVED (Mở cho Hội viên book)
                                ├──(Manager Reject) ──> REJECTED (Giải phóng phòng)
                                └──(Coach Cancel)   ──> CANCELLED
```

### BR-12: Máy trạng thái của Lớp học (State Machine)
* **`PENDING` (Chờ duyệt):**
  * Sinh ra khi Huấn luyện viên gửi đề xuất mở lớp (`POST /api/classes/proposals`).
  * Trạng thái này kích hoạt cơ chế **Giữ chỗ mềm (Soft-lock)**: Cảnh báo cho các đề xuất khác biết phòng và HLV đang được nhắm tới.
  * Chỉ duy nhất khi ở trạng thái này, HLV mới được phép tự chỉnh sửa hoặc tự hủy đề xuất (`DELETE /api/classes/proposals/{id}`).
* **`APPROVED` (Đã duyệt - Chính thức mở lớp):**
  * Do **Center Manager** hoặc **Admin** bấm duyệt (`PUT /api/classes/{id}/approve`).
  * Khi duyệt: Hệ thống kiểm tra xung đột lần cuối, thực hiện **Khóa cứng (Hard-lock)** phòng tập và HLV, cập nhật `approval_status = 'approved'`, `status = true`. Lớp học chính thức xuất hiện trên ứng dụng Member Portal để học viên đặt chỗ.
* **`REJECTED` (Từ chối):**
  * Quản lý từ chối đề xuất của HLV (`PUT /api/classes/{id}/reject`).
  * Bắt buộc phải có lý do từ chối (`rejection_reason`) để HLV nhận phản hồi và sửa đổi. Hệ thống giải phóng ngay phòng tập đã giữ.
* **`CANCELLED` (Lớp học bị hủy):**
  * Áp dụng khi Manager buộc phải hủy một lớp đã duyệt (do sự cố phòng tập hoặc HLV đột xuất nghỉ ốm).
  * Hệ thống tự động: Đổi trạng thái lớp sang hủy, giải phóng chỗ, tự động hoàn trả số buổi/tiền cho toàn bộ học viên đã đặt, và gửi thông báo khẩn cấp đến ứng dụng của các học viên bị ảnh hưởng.

---

## 6. MA TRẬN PHÂN QUYỀN NGHIỆP VỤ (RBAC MATRIX)

| Hành động nghiệp vụ | Center Manager | Coach | Member | Receptionist |
| :--- | :---: | :---: | :---: | :---: |
| **Tạo lớp và duyệt mở trực tiếp** | ✅ Có quyền | ❌ Không | ❌ Không | ❌ Không |
| **Gửi đề xuất mở lớp mới** | ✅ Có quyền | ✅ Có quyền | ❌ Không | ❌ Không |
| **Phê duyệt / Từ chối đề xuất** | ✅ Có quyền | ❌ Không | ❌ Không | ❌ Không |
| **Thu hồi đề xuất khi đang Pending** | ✅ Có quyền | ✅ (Của chính mình)| ❌ Không | ❌ Không |
| **Hủy buổi học đã được duyệt** | ✅ Có quyền | ❌ Không | ❌ Không | ❌ Không |
| **Đặt chỗ lớp học** | ❌ (Chỉ đặt hộ) | ❌ Không | ✅ Đặt cho bản thân | ✅ Đặt hộ tại quầy |
| **Hủy chỗ đã đặt** | ❌ (Hủy hộ) | ❌ Không | ✅ Hủy cho bản thân | ✅ Hủy hộ tại quầy |
| **Điểm danh học viên trong lớp** | ✅ Giám sát | ✅ Điểm danh lớp mình | ❌ Không | ❌ Không |

