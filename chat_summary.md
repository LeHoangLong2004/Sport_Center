# Tóm Tắt Cuộc Trò Chuyện & Báo Cáo Nghiệp Vụ - Kỹ Thuật (SmartGym OS)

**Dự án:** Sport Center / SmartGym OS (SWP391)  
**Thời gian:** 09/11/2026  
**Chủ đề thảo luận:**  
1. Chính sách hủy gói thành viên, hủy lớp, hủy gói môn & cơ chế hoàn tiền.  
2. So sánh hoàn tiền qua Ngân hàng vs Hoàn tiền vào Ví nội bộ trên Web.  
3. Khai thác bảng `Body_Metrics` kết hợp AI (Flow 5) tạo giáo án cá nhân hóa theo thể trạng học viên.  

---

## PHẦN 1: CHÍNH SÁCH HỦY DỊCH VỤ & HOÀN TIỀN

### 1.1. Quy định theo điều khoản hệ thống (`TermsPage.tsx`)
* **Hoàn tiền 100%:** Áp dụng trong vòng **72 giờ (3 ngày)** kể từ lúc đăng ký nếu hội viên **chưa kích hoạt và chưa từng check-in vào tập buổi nào** *(Điều 3.1)*.
* **Không hoàn tiền:** Không hỗ trợ hoàn tiền đối với gói tập đã kích hoạt sử dụng hoặc các gói khuyến mãi đặc biệt *(Điều 3.2)*.
* **Ngoại lệ bất khả kháng:** Trường hợp có bệnh lý nghiêm trọng không thể tiếp tục tập luyện lâu dài (phải có giấy xác nhận từ bệnh viện chuyên khoa) *(Điều 3.2)*.
* **Chấm dứt hợp đồng sớm hơn kỳ hạn:** Hội viên đơn phương chấm dứt hợp đồng sớm sẽ chịu **phí chấm dứt tương đương 20%** giá trị hợp đồng còn lại *(Điều 5.2)*.
* **Vi phạm nội quy:** Bị ban quản trị hủy tư cách hội viên không bồi hoàn *(Điều 1.5, Điều 5.3)*.
* **Thời gian xử lý & Phương thức hoàn:** Từ **7 đến 14 ngày làm việc**, chuyển khoản trực tiếp vào **tài khoản ngân hàng chính chủ** ký hợp đồng ban đầu *(Điều 3.3)*.

### 1.2. Giải pháp thay thế "cứu cánh" thay vì hủy gói
1. **Bảo lưu gói tập (Freeze):** Miễn phí khi gặp sự cố sức khỏe/công tác đột xuất, tối đa **60 ngày** mỗi chu kỳ gói *(Điều 5.1)*.
2. **Chuyển nhượng (Transfer):** Cho phép sang tên hợp đồng 01 lần duy nhất cho người khác với mức phí xử lý hồ sơ là **200.000 VNĐ** *(Quy định tại FAQ phòng tập)*.

### 1.3. Thực tế chuẩn ngành thể thao trên toàn quốc
* Khoảng **95%+ các chuỗi phòng gym lớn** tại Việt Nam *(California Fitness, CityGym, The New Gym, Elite Fitness, Fit24...)* đều áp dụng nguyên tắc cốt lõi: **"Không hoàn tiền" (Non-refundable)** sau khi hợp đồng đã ký và kích hoạt.
* **Nguyên nhân:**
  * Mô hình chi phí mặt bằng, thiết bị, nhân sự cố định rất cao.
  * Tránh tình trạng khách hàng trục lợi giá (mua gói 12 tháng giá rẻ rồi hủy sau 1 tháng).
  * Vướng mắc hoa hồng đã trả cho Sales và thủ tục hủy hóa đơn đỏ (VAT 10%) với cơ quan Thuế.

---

## PHẦN 2: TÍNH KHẢ THI CỦA VIỆC HOÀN TIỀN (HỦY LỚP VS HỦY GÓI TẬP VS GÓI MÔN)

| Đối tượng | Có nên hoàn tiền không? | Tính khả thi & Hướng giải quyết |
| :--- | :---: | :--- |
| **Hủy Lớp học (Class Booking)** | **CÓ** | **Cực kỳ khả thi & bắt buộc nên có:**<br>• Giải phóng slot trống cho người khác.<br>• Hoàn lại +1 lượt tập (`RestoreSession()`) hoặc cộng tiền vào ví nếu hủy trước giờ học 2 tiếng.<br>• Hủy muộn/No-show: Mất buổi hoặc phạt phí. |
| **Hủy Gói tập thành viên** | **HẠN CHẾ** | **Khả thi về code nhưng rủi ro cao về tài chính:**<br>• Dễ bị trục lợi chênh lệch giá kỳ hạn.<br>• Không nên hoàn tiền mặt ra ngân hàng.<br>• Tối ưu: Đổi sang Bảo lưu / Chuyển nhượng, hoặc trừ 20% phí hủy và hoàn dưới dạng **Điểm ví nội bộ**. |
| **Gói môn (Thời hạn)** | **KHÔNG** | Bản chất giống gói thành viên, không hỗ trợ hoàn tiền mặt. |
| **Gói môn (Số buổi / Kèm PT)** | **LINH HOẠT** | Không hoàn tiền mặt, nhưng có thể:<br>• Đổi sang bộ môn khác (Bơi sang Yoga/Gym).<br>• Đổi Huấn luyện viên (PT) khác.<br>• Quy đổi số buổi chưa tập thành số dư ví sau khi trừ phí quản lý. |

---

## PHẦN 3: SO SÁNH HOÀN TIỀN NGÂN HÀNG VS VÍ NỘI BỘ TRÊN WEB

| Tiêu chí | 🏦 Hoàn về Ngân hàng (Bank Refund) | 💳 Hoàn vào Ví trên Web (Internal Wallet) |
| :--- | :--- | :--- |
| **Bản chất dòng tiền** | **Dòng tiền rời khỏi trung tâm** (mất doanh thu thật). | **Giữ trọn dòng tiền trong hệ thống** (Cash Retention). |
| **Thời gian xử lý** | Chậm (7 – 14 ngày làm việc qua kế toán). | **Tức thì (0 giây)**, cộng số dư ngay lập tức. |
| **Kỹ thuật phần mềm** | Phức tạp (cần Refund API hoặc chuyển tay). | Cực kỳ đơn giản: dùng `WalletService.topUp()`. |
| **Hóa đơn & Thuế** | Rất phức tạp (hủy hóa đơn đỏ VAT). | Dễ dàng (chuyển thành nghĩa vụ Store Credit). |
| **Giữ chân khách** | Mất khách vĩnh viễn. | Khách dùng ví mua nước, phụ kiện, thuê PT. |
| **Đề xuất (Best Practice)** | Chỉ dùng cho ngoại lệ bắt buộc (72h chưa tập). | **Khuyên dùng làm phương thức hoàn mặc định.** |

---

## PHẦN 4: KHAI THÁC BẢNG `BODY_METRICS` KẾT HỢP AI (FLOW 5)

### 4.1. Bảng `Body_Metrics` là gì?
Lưu trữ các chỉ số đo thể trạng InBody của học viên:
* `weight` (Cân nặng - kg), `height` (Chiều cao - cm), `bmi` (Chỉ số BMI).
* `body_fat_pct` (Tỷ lệ mỡ - %), `muscle_mass_kg` (Khối lượng cơ - kg).
* `visceral_fat_level` (Mỡ nội tạng), `bmr_calories` (Calo trao đổi chất cơ bản), `recorded_at`.

### 4.2. Bốn cách AI tận dụng bảng `Body_Metrics`
1. **May đo bài tập & Phòng chống chấn thương:**
   * Học viên thừa cân ($BMI > 28, Fat > 28\%$): AI tự động loại bỏ các bài nhảy cao (Burpee, Jump Squat) để bảo vệ sụn khớp gối; ưu tiên đạp xe, bơi lội, máy đẩy tạ cố định và Cardio Zone 2.
   * Học viên Skinny-fat / gầy: AI hạn chế Cardio, tập trung 80% vào tập tạ đa khớp (Squat, Deadlift, Bench Press) để xây dựng cơ bắp.
2. **Tự động tính dinh dưỡng & Calo:** AI tính $BMR$ theo công thức Katch-McArdle, tính $TDEE$ và đưa ra lượng Calo thâm hụt cùng tỷ lệ đạm (Protein/Carb/Fat) tối ưu.
3. **Phát hiện "Điểm chững" (Plateau Detection):** AI so sánh chuỗi dữ liệu theo thời gian (`recorded_at`). Nếu 3-4 tuần không đổi, AI cảnh báo cơ thể đã thích nghi và tự động đổi giáo án tăng mức tạ +5%.
4. **Trợ lý cho Huấn luyện viên (PT Copilot):** AI tự động xuất bản tóm tắt phân tích thể trạng chỉ sau vài giây, giúp HLV tiết kiệm 80% thời gian soạn giáo trình.

### 4.3. "Bên nào nhận chỉ số cơ thể để AI tạo giáo án?"
* **Google Gemini AI (ở Backend):** Là bên **trực tiếp tiếp nhận** các chỉ số cơ thể (`weight`, `height`, `bmi`, `bodyFat`, `muscleMass`) thông qua System Prompt của Backend (`Flow5PromptBuilder.cs`) để suy luận và xuất ra danh sách bài tập.
* **Huấn luyện viên (ở Frontend):** Nhận bản giáo án nháp do AI vừa tạo, kiểm tra lại chuyên môn trên giao diện `CoachAI.tsx` và bấm **"Duyệt & Giao bài"** cho học viên (*mô hình Coach-in-the-Loop an toàn*).

### 4.4. Hiện trạng mã nguồn dự án
* **Backend đã hoàn thiện 100%:** Trong `Flow5ContextService.cs` (dòng 82–106), hệ thống đã code sẵn logic truy vấn bản ghi mới nhất từ `db.BodyMetrics` và đưa vào `context.Member.LatestBodyMetrics` gửi cho Gemini AI.
* **Việc cần làm tiếp theo:**
  1. Thêm định nghĩa bảng `Body_Metrics` vào file `database_schema.sql`.
  2. Tạo một vài bản ghi chỉ số mẫu (Cân nặng, % Mỡ, Cơ) cho học viên để kiểm thử tính năng AI.

---

### 4.5. Phân nhóm học viên phổ biến trong phòng tập thực tế
1. **Nhóm Skinny-Fat (Gầy nhưng nhiều mỡ bụng - Chiếm ~50%):** BMI bình thường, thiếu cơ nghiêm trọng, mỡ cao $\rightarrow$ Cần tập tạ tăng cơ, không cardio giảm cân quá mức.
2. **Nhóm Thừa cân / Béo phì (Chiếm ~35%):** BMI $> 25$, mỡ nội tạng cao $\rightarrow$ Cần bài tập an toàn cho khớp gối.
3. **Nhóm Gầy / Thiếu cân (Chiếm ~15%):** BMI $< 18.5$, cơ và mỡ đều thấp $\rightarrow$ Cần tập nặng đa khớp và ăn dư thừa calo.
* **Quy trình đo InBody:** Đo 1 lần lúc đăng ký làm mốc xuất phát, sau đó định kỳ mỗi **30 ngày (1 tháng/lần)** đo lại để đánh giá tiến độ.

