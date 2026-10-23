# 📋 TÀI LIỆU CÁC TRƯỜNG HỢP NGHIỆP VỤ & TEST CASES CHUẨN MÔN SWP391
## CHỨC NĂNG: QUẢN LÝ & THỰC HIỆN GIÁO ÁN (COACH & MEMBER)
> **Dành cho:** Báo cáo đồ án SWP391, Đặc tả yêu cầu phần mềm (SRS), Kịch bản kiểm thử (Test Cases) & Kịch bản bảo vệ trước Hội đồng chấm thi FPT University.

---

## 📌 BẢNG TỔNG HỢP CÁC TRƯỜNG HỢP (USE CASE SCENARIOS MATRIX)

Trong môn SWP391, giảng viên sẽ chấm điểm tính năng này dựa trên **8 trường hợp cụ thể** phân theo 4 nhóm: **Luồng chuẩn (Happy Path)**, **Kiểm tra dữ liệu (Validation)**, **Xử lý tiến độ (Progress & Deadline)**, và **Phân quyền bảo mật (Security & RBAC)**.

| Mã Case | Tên trường hợp | Phân loại | Tác nhân (Actor) | Kết quả mong đợi (Expected Result) |
| :---: | :--- | :---: | :---: | :--- |
| **TC-01** | Giao giáo án thành công đúng hạn | Happy Path | Coach | Tạo bản ghi mới, Member nhận bài, trạng thái `Assigned`. |
| **TC-02** | Member thực hiện và hoàn thành đúng hạn | Happy Path | Member | Tick 100% bài, `progress_pct = 100%`, trạng thái `Completed`. |
| **TC-03** | Chọn Deadline không hợp lệ (ngày quá khứ) | Validation | Coach | Chặn form, hiển thị lỗi validation: *"Hạn chót phải từ ngày mai"*. |
| **TC-04** | Giao giáo án rỗng không có bài tập | Validation | Coach | Chặn submit: *"Giáo án phải có ít nhất 1 bài tập"*. |
| **TC-05** | Quá hạn Deadline chưa hoàn thành | Overdue Flow | System / Member | Tự động chuyển `Overdue`, hiển thị badge đỏ cảnh báo trễ hạn. |
| **TC-06** | Member thực hiện một phần (Tập dở dang) | Partial Flow | Member | Tính toán realtime `progress_pct = (đã tick / tổng) * 100%`. |
| **TC-07** | Hoàn thành sau ngày Deadline | Late Flow | Member | Trạng thái chuyển thành `Completed Late` (Hoàn thành trễ). |
| **TC-08** | Chặn Member tự ý gọi API tạo giáo án | Security/RBAC | Member (Attacker)| Trả về mã lỗi `403 Forbidden` (Chỉ Coach mới có quyền). |

---

## 🔍 CHI TIẾT 8 TRƯỜNG HỢP ĐẶC TẢ THEO CHUẨN SRS SWP391

### 1. TC-01: Giao giáo án thành công (Happy Path - Coach)
* **Tiền điều kiện (Pre-conditions):**
  * Coach đã đăng nhập thành công vào Coach Portal.
  * Coach đã tạo sẵn ít nhất 1 mẫu giáo án có bài tập trong kho giáo án.
  * Học viên mục tiêu đang có hợp đồng hoạt động (Active).
* **Các bước thực hiện:**
  1. Coach mở tab **Giáo án (Curriculum)** ➔ Bấm nút **Giao giáo án**.
  2. Chọn Học viên: `Ho Xuan Anh Nam`.
  3. Chọn Ngày hạn chót (`Due Date`): Một ngày trong tương lai (ví dụ: sau 3 ngày).
  4. Nhập Ghi chú: *"Tập đều đặn, chú ý khởi động kỹ khớp gối"*.
  5. Bấm nút **Xác nhận giao**.
* **Hậu quả điều kiện (Post-conditions):**
  * Hệ thống lưu vào bảng `Workout_Plans` với `status = 'assigned'`, `progress_pct = 0`.
  * Hiển thị Toast thông báo: *"Giao giáo án thành công!"*.
  * Modal tự đóng, danh sách học viên của Coach cập nhật giáo án mới.

---

### 2. TC-02: Member hoàn thành bài tập đúng hạn (Happy Path - Member)
* **Tiền điều kiện:**
  * Member đã đăng nhập vào Member Portal.
  * Đang có một bài tập được giao có hạn chót trong tương lai.
* **Các bước thực hiện:**
  1. Member vào tab **Bài tập được giao (Workouts / Homework)**.
  2. Xem danh sách bài tập (Ví dụ gồm 4 động tác: Squat, Lunge, Plank, Jumping Jack).
  3. Lần lượt bấm tick vào Checkbox của từng động tác sau khi tập xong.
* **Kết quả hệ thống:**
  * Mỗi lần tick, thanh tiến độ tăng dần: `25%` ➔ `50%` ➔ `75%` ➔ `100%`.
  * Khi đạt 100%, trạng thái chuyển sang **`Hoàn thành (Completed)`** với huy hiệu màu xanh lá (`badge-emerald`).
  * Hệ thống lưu thời gian `completed_at = now()`.

---

### 3. TC-03: Chọn Deadline không hợp lệ (Form Validation Error)
* **Mục đích:** Chứng minh với giảng viên hệ thống có validate dữ liệu chặt chẽ ở cả Frontend và Backend, không để lọt rác vào CSDL.
* **Các bước thực hiện:**
  1. Coach chọn giao giáo án.
  2. Tại ô chọn Ngày hạn chót, Coach cố tình chọn **ngày hôm qua** hoặc ngày trong quá khứ.
  3. Bấm nút **Giao giáo án**.
* **Kết quả hệ thống:**
  * Form không được gửi đi.
  * Ô nhập ngày viền đỏ, hiển thị câu cảnh báo:  
    `❌ Hạn hoàn thành không được nhỏ hơn thời điểm hiện tại.`
  * Backend API kiểm tra: `if (dueDate < DateTime.UtcNow) return BadRequest("Invalid due date");`.

---

### 4. TC-04: Giao giáo án rỗng (Zero Exercises Validation)
* **Tình huống:** Coach tạo một giáo án mới nhưng chưa kịp thêm bài tập nào (danh sách bài tập rỗng = 0) rồi bấm giao ngay cho học viên.
* **Kết quả hệ thống:**
  * Hệ thống kiểm tra: `if (exercises.length === 0)`.
  * Nút "Giao bài" bị vô hiệu hóa (disabled) hoặc bật cảnh báo:  
    `❌ Giáo án này chưa có bài tập nào. Vui lòng thêm bài tập trước khi giao.`
  * Tránh lỗi chia cho 0 (`Division by Zero`) khi tính toán `% Progress` ở phía Member.

---

### 5. TC-05: Quá hạn Deadline chưa hoàn thành (Overdue Logic)
* **Tình huống:** HLV giao bài tập hạn chót là `2026-10-20`. Hôm nay là `2026-10-21`, học viên mới hoàn thành 50% hoặc 0%.
* **Logic tính toán trên hệ thống:**
  ```javascript
  const isOverdue = new Date(plan.dueDate) < new Date() && plan.progressPct < 100;
  const statusDisplay = isOverdue ? "Quá hạn (Overdue)" : "Đang thực hiện";
  ```
* **Kết quả hệ thống:**
  * Phía **Member Portal**: Thẻ bài tập đổi sang viền đỏ, hiện nhãn cảnh báo **`Quá hạn`** màu đỏ cam để thúc giục.
  * Phía **Coach Portal**: Trong danh sách học viên, học viên này bị gắn tag đỏ **`Trễ hạn bài tập`** để HLV dễ dàng lọc và phát hiện.

---

### 6. TC-06: Member thực hiện một phần (Partial Progress Calculation)
* **Tình huống:** Giáo án có 5 bài tập. Học viên bận việc, chỉ kịp hoàn thành 2 bài rồi thoát app.
* **Logic xử lý:**
  * Mỗi khi tick 1 bài:  
    $$\text{Tiến độ (\%)} = \frac{\text{Số bài đã tick}}{\text{Tổng số bài}} \times 100 = \frac{2}{5} \times 100 = 40\%$$
  * Hệ thống tự động gửi API cập nhật `progressPct = 40` và lưu trạng thái `in_progress`.
* **Kết quả:** Học viên tắt app mở lại thì 2 bài đã tick vẫn giữ nguyên trạng thái, tiến độ vẫn là `40%`, không bị mất dữ liệu.

---

### 7. TC-07: Member hoàn thành bài tập sau ngày Deadline (Late Submission)
* **Tình huống:** Bài tập bị quá hạn ở TC-05, nhưng sang ngày hôm sau học viên vẫn cố gắng mở app và tick nốt các bài còn lại cho đủ 100%.
* **Kết quả hệ thống:**
  * Tiến độ vẫn đạt `100%`.
  * Tuy nhiên, hệ thống không ghi nhận là `Completed` thông thường mà ghi nhận trạng thái: **`Completed Late (Hoàn thành trễ hạn)`**.
  * Hiển thị màu vàng/cam thay vì màu xanh lá, ghi chú: *"Hoàn thành trễ 1 ngày"*.
  * HLV xem được lịch sử để biết học viên vẫn có ý thức tập luyện nhưng bị trễ deadline.

---

### 8. TC-08: Phân quyền & Bảo mật dữ liệu (Security & Data Isolation - RBAC)
* **Mục đích:** Giảng viên SWP391 cực kỳ chú trọng tính bảo mật Role-based Access Control.
* **Trường hợp 8.1 - Chặn Member gọi API của Coach:**
  * Nếu Member dùng Postman hoặc chỉnh sửa code để gửi request `POST /api/coach/assign-curriculum`.
  * **Kết quả:** Backend kiểm tra Token JWT có `Role != 'Coach'` ➔ Lập tức trả về mã lỗi **`403 Forbidden`**.
* **Trường hợp 8.2 - Cách ly dữ liệu (Data Isolation):**
  * Member A chỉ được xem các bài tập có `user_id = Member_A.id`.
  * Member A tuyệt đối không thể xem hoặc tick bài tập của Member B dù thay đổi tham số ID trên URL/API.

---

## 💻 CODE LOGIC MẪU (DÙNG ĐỂ CHỨNG MINH KHI BẢO VỆ ĐỒ ÁN)

### 1. Code Frontend tính trạng thái & tiến độ tự động (TypeScript):
```typescript
export function getWorkoutStatus(dueDateStr: string, progressPct: number): {
  status: "completed" | "completed_late" | "in_progress" | "overdue";
  label: string;
  badgeClass: string;
} {
  const isExpired = new Date(dueDateStr).getTime() < Date.now();

  if (progressPct >= 100) {
    if (isExpired) {
      return { status: "completed_late", label: "Hoàn thành trễ", badgeClass: "bg-amber-100 text-amber-700" };
    }
    return { status: "completed", label: "Đã hoàn thành", badgeClass: "bg-emerald-100 text-emerald-700" };
  }

  if (isExpired) {
    return { status: "overdue", label: "Quá hạn", badgeClass: "bg-red-100 text-red-700" };
  }

  return { status: "in_progress", label: `Đang tập (${progressPct}%)`, badgeClass: "bg-blue-100 text-blue-700" };
}
```

### 2. Code Backend C# .NET / Express kiểm tra hợp lệ khi giao giáo án:
```csharp
[HttpPost("assign")]
[Authorize(Roles = "Coach")]
public async Task<IActionResult> AssignWorkout([FromBody] AssignWorkoutDto dto)
{
    // Case TC-03: Validate ngày hạn chót
    if (dto.DueDate <= DateTime.UtcNow)
    {
        return BadRequest(new { message = "Hạn chót phải lớn hơn thời điểm hiện tại!" });
    }

    // Case TC-04: Validate danh sách bài tập rỗng
    var curriculum = await _context.Curricula.Include(c => c.Exercises).FirstOrDefaultAsync(c => c.Id == dto.CurriculumId);
    if (curriculum == null || !curriculum.Exercises.Any())
    {
        return BadRequest(new { message = "Giáo án không tồn tại hoặc chưa có bài tập nào!" });
    }

    // Lưu giáo án với trạng thái khởi tạo
    var assignment = new WorkoutPlan
    {
        UserId = dto.MemberId,
        CoachId = GetCurrentCoachId(),
        PlanName = curriculum.Name,
        DueDate = dto.DueDate,
        ProgressPct = 0,
        Status = "assigned",
        CreatedAt = DateTime.UtcNow
    };

    _context.WorkoutPlans.Add(assignment);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Giao giáo án thành công!", assignmentId = assignment.Id });
}
```

---

## 🎯 GỢI Ý ĐƯA VÀO BÁO CÁO & SLIDE THUYẾT TRÌNH SWP391

Khi viết báo cáo Chapter 3 (System Design / Testing) hoặc làm slide demo, bạn chỉ cần chia thành **3 slide ngắn gọn**:
1. **Slide 1: Use Case Diagram & Actor Matrix** (Coach giao bài ➔ Member nhận & tick ➔ System tính % và phân loại trạng thái).
2. **Slide 2: 8 Kịch bản kiểm thử (Test Cases TC-01 đến TC-08)** (Bảng tổng hợp ở Mục 1).
3. **Slide 3: Minh chứng xử lý ngoại lệ (Validation & Overdue Handling)** (Ảnh chụp màn hình báo lỗi khi chọn ngày quá khứ + Ảnh chụp thẻ bài tập quá hạn màu đỏ).
