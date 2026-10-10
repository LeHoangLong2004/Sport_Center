# SPORT CENTER — LUỒNG GÓI THÀNH VIÊN VÀ GÓI MÔN TẬP

**Ngày lập:** 09/10/2026  
**Phạm vi:** Mô tả nghiệp vụ và cách xây dựng cho Member, sau đó đến Center Manager.  
**Tham chiếu demo:** https://sportcenter-coach-nam.namhxase184057.chatgpt.site/

> Tài liệu mô tả nghiệp vụ hướng tới khi xây dựng đầy đủ. Website hiện là demo lưu dữ liệu trong trình duyệt; thanh toán, đặt tủ và lịch Coach 1–1 chưa phải dịch vụ vận hành thật. Không coi mọi yêu cầu trong tài liệu là chức năng đã triển khai.

## Nguyên tắc chung

- **Gói thành viên:** Cơ bản / Plus / Premium — cấp ưu đãi, không cấp quyền vào tập.
- **Gói môn tập:** cấp quyền tập đúng bộ môn, theo hình thức Tự tập / Lớp nhóm / Coach 1–1.
- Không bắt buộc mua Plus hoặc Premium trước khi mua gói môn.
- Gói có Coach đã bao gồm quyền sử dụng khu môn theo điều kiện gói; không yêu cầu mua thêm gói tự tập cùng môn để vào học.
- Mỗi môn có khu tập riêng. Mua môn nào thì sử dụng phạm vi của môn đó.
- Giá, tỷ lệ giảm, thời gian đặt sớm và hạn mức mẫu là cấu hình của dự án; không phải bảng giá thị trường được xác nhận.
- Manager sửa danh mục thì Member thấy nội dung mới khi mua. Đơn đã chốt giá và gói đã mua giữ thông tin của lần mua đó theo điều kiện hiệu lực.

---

# PHẦN A — ROLE MEMBER

## A.1. Mục tiêu của Member

Member cần biết:

- Mình đang có hạng thành viên nào?
- Hạng đó mang lại quyền lợi gì?
- Mình được tập những môn nào?
- Gói nào còn hạn, còn bao nhiêu buổi?
- Muốn mua hoặc gia hạn thì phải trả bao nhiêu?

Trong menu **Gói tập của tôi**, giao diện mở đầu bằng hai lựa chọn:

| Lựa chọn | Nội dung mô tả |
|---|---|
| Gói thành viên | Xem và nâng cấp Cơ bản, Plus, Premium để nhận ưu đãi |
| Gói môn tập | Mua quyền tập theo bộ môn, thời hạn và hình thức hướng dẫn |

Member chọn một loại thì mới hiển thị danh mục bên trong. Mỗi danh mục có nút quay lại bước chọn loại gói.

## A.2. Luồng Gói thành viên

### A.2.1. Mở trang Gói thành viên

Trang nên có hai phần.

**Phần thứ nhất — Hạng hiện tại**

Hiển thị:

- Tên hạng đang sử dụng.
- Trạng thái.
- Ngày bắt đầu và hết hạn nếu là Plus/Premium.
- Quyền lợi đã được cấp khi mua.
- Gói gia hạn hoặc hạng tiếp theo đã thanh toán, nếu có.

Ví dụ:

> Hạng hiện tại: Plus  
> Hiệu lực: 10/10/2026 – 09/11/2026  
> Giảm 5% gói tự tập/lớp nhóm, giảm 2% gói Coach 1–1.  
> Đặt lớp trước 72 giờ.

Nếu chưa nâng cấp:

> Hạng hiện tại: Cơ bản  
> Miễn phí, không giới hạn thời hạn.

**Phần thứ hai — Các hạng có thể chọn**

| Thẻ | Thao tác |
|---|---|
| Cơ bản | Hiển thị “Hạng mặc định”, không có nút thanh toán |
| Plus | Chọn kỳ hạn, xem quyền lợi, đăng ký |
| Premium | Chọn kỳ hạn, xem quyền lợi, đăng ký |

Mỗi thẻ Plus/Premium cần có:

- Tên và mô tả.
- Lựa chọn 1 / 3 / 6 / 12 tháng.
- Tổng giá cho kỳ hạn đã chọn.
- Giá bình quân mỗi tháng để tham khảo.
- Danh sách quyền lợi.
- Điều kiện sử dụng.
- Nút **Chọn hạng này**.

Luôn hiển thị rõ: **Gói thành viên không bao gồm quyền vào khu tập.**

### A.2.2. Chọn kỳ hạn

Ví dụ chọn Plus:

1. Mặc định hiển thị kỳ một tháng.
2. Member đổi sang ba tháng.
3. Giao diện cập nhật tổng tiền kỳ ba tháng.
4. Hiển thị quyền lợi và điều kiện trước khi đăng ký.

Giá bình quân tháng chỉ để so sánh. Nếu tổng giá ba tháng là 140.000đ thì số tiền phải thanh toán là **140.000đ**, không phải trả khoảng 46.667đ lúc đó.

### A.2.3. Xác nhận mua

Khi bấm **Chọn hạng này**, mở màn hình hoặc hộp xác nhận:

| Thông tin | Ý nghĩa |
|---|---|
| Hạng | Plus hoặc Premium |
| Kỳ hạn | Số tháng đã chọn |
| Quyền lợi | Nội dung áp dụng cho lần mua này |
| Ngày bắt đầu dự kiến | Bắt đầu mới hoặc nối tiếp hạng đang có |
| Ngày hết hạn dự kiến | Tính từ ngày bắt đầu |
| Tổng tiền | Giá của kỳ hạn |
| Điều kiện | Gia hạn, hiệu lực và phạm vi ưu đãi |

Member xác nhận đã đọc điều kiện, rồi bấm **Tạo đơn chờ thanh toán**.

Lúc này:

- Đơn được tạo.
- Quyền lợi chưa được kích hoạt.
- Member có thể mở mục Thanh toán để xem đơn.

### A.2.4. Thanh toán và kích hoạt hạng

1. Member tạo đơn.
2. Hệ thống ghi nhận đơn chờ thanh toán.
3. Thanh toán được xác nhận hợp lệ.
4. Hệ thống cập nhật đơn đã thanh toán.
5. Hạng được kích hoạt hoặc xếp lịch kích hoạt trong tương lai.
6. Member nhìn thấy trạng thái mới.

Trong demo hiện tại, nhân viên xác nhận thu tiền bằng thao tác mô phỏng.

**Không kích hoạt hạng chỉ vì Member bấm “Tôi đã thanh toán”.** Đơn thất bại hoặc hết hạn chưa được xác nhận không cấp quyền lợi. Một giao dịch xác nhận nhiều lần không được cấp trùng gói.

### A.2.5. Gia hạn và chuyển hạng

Quy tắc nối tiếp đang dùng trong demo:

- Chưa có hạng trả phí còn hiệu lực: gói mới bắt đầu theo ngày kích hoạt.
- Đang có Plus, mua thêm Plus: nối tiếp sau ngày kết thúc Plus hiện tại.
- Đang có Plus, mua Premium: Premium bắt đầu sau khi Plus kết thúc.
- Chưa xử lý nâng cấp giữa kỳ hoặc bù chênh lệch.

Ví dụ:

> Plus hiện tại hết hạn ngày 31/10. Member mua Premium một tháng. Sau khi thanh toán, Premium ở trạng thái **Chờ hiệu lực**, bắt đầu ngày 01/11.

Phải phân biệt:

- **Chờ thanh toán:** chưa xác nhận nhận tiền.
- **Đã thanh toán, chờ hiệu lực:** đã nhận tiền nhưng chưa đến ngày sử dụng.
- **Đang hiệu lực:** đang được áp dụng quyền lợi.
- **Hết hạn:** đã kết thúc thời gian sử dụng.

### A.2.6. Sử dụng quyền lợi

| Quyền lợi | Cách hoạt động |
|---|---|
| Giảm giá | Khi mua gói môn, kiểm tra hạng còn hiệu lực và tính giá |
| Đặt lớp sớm | Mở đăng ký sớm hơn; vẫn cần gói môn phù hợp và lớp còn chỗ |
| Tủ đồ | Áp dụng khi đến tập hợp lệ, theo loại tủ và điều kiện đã mua |
| Quyền lợi bổ sung | Hiển thị mô tả và cách sử dụng do Manager quy định |

Ví dụ: Premium được đặt lớp sớm nhưng không có gói Yoga thì vẫn không được đặt lớp Yoga.

Với mô hình hiện tại, quyền tủ đồ là sử dụng trong buổi theo điều kiện gói, không tự hiểu là tủ riêng cố định hoặc được giữ đồ qua đêm.

### A.2.7. Khi hạng hết hạn

- Nếu có hạng tiếp theo đã thanh toán: chuyển sang hạng đó khi đến ngày.
- Nếu không có: trở về Cơ bản.
- Gói môn còn hiệu lực vẫn tiếp tục sử dụng.
- Không thu lại khoản giảm giá đã áp dụng hợp lệ cho đơn trước đó.

## A.3. Luồng Gói môn tập

### A.3.1. Mở trang Gói môn tập

Trang gồm:

- Bộ lọc theo môn.
- Bộ lọc theo hình thức.
- Danh sách gói đang bán.
- Danh sách gói Member đã đăng ký.

| Hình thức | Member nhận được |
|---|---|
| Tự tập | Sử dụng khu và thiết bị theo điều kiện gói |
| Lớp nhóm | Quyền khu tập và số buổi học cùng nhóm có Coach |
| Coach 1–1 | Quyền khu tập và số buổi hướng dẫn riêng |

Chỉ hiển thị hình thức mà trung tâm thực sự cung cấp cho môn đó. Nếu bộ lọc không có kết quả, hiển thị trạng thái trống và cách đổi bộ lọc.

### A.3.2. Nội dung thẻ gói môn

Ví dụ **Yoga — Lớp nhóm**:

- Bộ môn: Yoga.
- Khu tập: Studio Yoga.
- Hình thức: Lớp nhóm.
- Thời hạn: 1 / 3 / 6 / 12 tháng.
- Hạn mức: 12 buổi/tháng.
- Thời lượng: 60 phút/buổi.
- Sĩ số tối đa.
- Giá gói.
- Quyền lợi.
- Điều kiện đặt/hủy, học bù và hết hạn.
- Nút **Đăng ký gói**.

Gói có Coach cần ghi rõ đã bao gồm quyền sử dụng khu môn. Member không phải mua thêm gói tự tập cùng môn để được vào học.

### A.3.3. Chọn và xác nhận mua gói môn

1. Chọn bộ môn.
2. Chọn hình thức.
3. Chọn kỳ hạn.
4. Đọc quyền lợi và điều kiện.
5. Bấm đăng ký.
6. Hệ thống tính giá theo hạng hiện tại.
7. Member xác nhận tạo đơn.

Màn xác nhận phải trình bày giá rõ ràng:

| Khoản | Ví dụ minh họa |
|---|---:|
| Yoga nhóm một tháng | 700.000đ |
| Ưu đãi Plus 5% | −35.000đ |
| **Cần thanh toán** | **665.000đ** |

Hiển thị loại ưu đãi đang áp dụng. Gói Coach 1–1 sử dụng tỷ lệ giảm riêng nếu hạng có cấu hình khác.

Nếu chưa có hạng trả phí thì mua theo giá áp dụng cho Cơ bản. Không ép Member nâng cấp hạng để được mua gói môn.

### A.3.4. Sau khi thanh toán thành công

Hệ thống cấp quyền theo đúng:

- Member.
- Bộ môn.
- Khu/phạm vi.
- Hình thức hướng dẫn.
- Thời hạn.
- Số buổi nếu có.

Gói xuất hiện trong **Gói môn đã đăng ký**.

| Trường | Ví dụ |
|---|---|
| Tên gói | Yoga — Lớp nhóm |
| Trạng thái | Đang hiệu lực |
| Thời hạn | 10/10 – 09/11 |
| Kỳ sử dụng hiện tại | Tháng thứ nhất |
| Buổi đã dùng | 3 |
| Buổi đang giữ chỗ | 2 |
| Buổi còn có thể đặt | 7 |
| Quyền lợi lúc mua | Danh sách đã lưu khi tạo đơn |

Tách **đã dùng** và **đang giữ chỗ** giúp Member hiểu hạn mức. Đây là yêu cầu cho bản đầy đủ; không suy ra demo hiện đã có đầy đủ bộ đếm và cơ chế trừ lượt.

### A.3.5. Sử dụng gói

| Loại gói | Luồng sử dụng |
|---|---|
| Tự tập | Đến trung tâm → kiểm tra quyền vào khu → sử dụng đúng khu môn |
| Lớp nhóm | Xem lịch → chọn lớp → kiểm tra quyền và hạn mức → đặt chỗ → Coach điểm danh |
| Coach 1–1 | Xem lịch Coach phù hợp → chọn giờ → xác nhận hẹn → tham gia → ghi nhận buổi |

Quyền tự tập không tự cấp chỗ lớp nhóm. Gói 1–1 không tự cấp lớp nhóm nếu quyền đó không được ghi trong sản phẩm.

Quyền môn cũng không mặc nhiên cho giữ một sân riêng ở bất kỳ khung giờ nào. Nếu cung cấp môn sử dụng sân, cần quy định đặt tài nguyên riêng.

### A.3.6. Hạn mức, hủy và học bù

Theo phương án đã trao đổi:

- Lớp nhóm mẫu: 12 buổi/tháng.
- Cá nhân mẫu: 8 buổi/tháng.
- Các thông số được Manager cấu hình theo sản phẩm.
- Hạn mức cấp theo tháng sử dụng, tính từ ngày kích hoạt; không tự hiểu là tháng dương lịch.
- Gói 12 tháng không cho dùng toàn bộ hạn mức năm ngay tháng đầu.
- Hủy đúng hạn trả lại lượt đặt.
- Hủy muộn hoặc không đến xử lý theo chính sách đã công bố.
- Trung tâm hủy không trừ lượt; bố trí học bù hoặc gia hạn quyền tương ứng.
- Không tự chuyển buổi chưa dùng sang kỳ sau nếu gói không có quyền đó.

### A.3.7. Gia hạn gói môn

- Gói cùng môn nối tiếp sau gói còn hiệu lực.
- Nếu chọn hình thức mới, phải thông báo ngày hình thức mới bắt đầu.
- Mua môn khác tạo quyền độc lập, không chờ môn đang có hết hạn.

Ví dụ:

> Gym tự tập còn đến 31/10. Mua Gym có Coach theo quy tắc nối tiếp bắt đầu từ 01/11. Mua thêm Bơi có thể bắt đầu theo ngày kích hoạt riêng.

Nếu sau này muốn thêm Coach ngay trong gói Gym đang chạy, xây dựng nghiệp vụ **mua thêm dịch vụ hướng dẫn**, không xử lý ngầm như gia hạn.

### A.3.8. Khi Manager sửa hoặc ngừng bán gói

- Danh mục Member hiển thị nội dung mới.
- Đơn đã chốt giá giữ thông tin trong thời hạn hiệu lực của đơn.
- Gói đã mua giữ giá và quyền lợi lúc mua.
- Gói ngừng bán không cho mua mới.
- Người đã mua vẫn sử dụng đến hết hạn theo quyền đã cấp.

## A.4. Tiêu chí nghiệm thu Member

- Mở Gói tập của tôi thấy hai lựa chọn trước khi thấy thẻ gói.
- Cơ bản miễn phí, không tạo giao dịch mua Cơ bản.
- Chọn kỳ hạn cập nhật đúng tổng tiền.
- Quyền lợi và điều kiện được đọc trước xác nhận.
- Có Plus/Premium nhưng không có gói môn không được vào tập hoặc đặt lớp sai quyền.
- Đơn chưa xác nhận thanh toán không cấp quyền.
- Hạng hết hạn không làm mất gói môn còn hiệu lực.
- Gói ngừng bán không cho tạo đơn mới.
- Quyền lợi của lần mua cũ không bị thay đổi khi Manager sửa danh mục.

---

# PHẦN B — ROLE CENTER MANAGER

## B.1. Mục tiêu và điểm vào

Manager quản lý:

- Nội dung gói.
- Giá theo kỳ hạn.
- Quyền lợi.
- Phạm vi sử dụng.
- Hình thức hướng dẫn.
- Trạng thái mở bán.
- Quy tắc hệ thống phải áp dụng.

Menu đổi thành **Quản lí gói**. Khi mở hiển thị:

| Lựa chọn | Phạm vi quản lý |
|---|---|
| Gói thành viên | Cơ bản, Plus, Premium và các ưu đãi |
| Gói môn tập | Môn, khu tập, hình thức, số buổi và giá |

Chọn một loại thì mới hiển thị các thẻ đã tạo thuộc loại đó.

## B.2. Quản lý Gói thành viên

### B.2.1. Danh sách

Hiển thị ba hạng Cơ bản, Plus, Premium. Mỗi thẻ gồm:

- Tên và mô tả.
- Trạng thái.
- Giá theo kỳ hạn.
- Quyền lợi.
- Chỉnh sửa.
- Ngừng bán/mở bán đối với hạng trả phí.

**Cơ bản luôn là hạng mặc định miễn phí.** Không cho ngừng hạng này.

### B.2.2. Tạo gói trong danh mục thành viên

Dự án chỉ có ba hạng. “Tạo gói” tại đây được hiểu là chọn hạng để thiết lập sản phẩm hoặc cập nhật cấu hình, không tạo hạng thứ tư.

- Nếu hạng đã có cấu hình: mở form chỉnh sửa.
- Nếu hạng chưa có cấu hình: tạo cấu hình cho hạng đó.
- Không tạo nhiều bản Plus có quy tắc xung đột.
- Mã hạng ổn định; tên hiển thị không phải khóa để kiểm tra quyền.

### B.2.3. Form — Thông tin chung

| Trường | Quy định |
|---|---|
| Hạng hệ thống | Cơ bản / Plus / Premium |
| Tên hiển thị | Tên xuất hiện bên Member |
| Mô tả | Giới thiệu ngắn |
| Trạng thái | Đang bán / Ngừng bán |

Tên hiển thị có thể chỉnh, nhưng mã hạng cần ổn định.

### B.2.4. Form — Giá theo kỳ hạn

Nhập tổng giá riêng cho 1, 3, 6, 12 tháng.

- Cơ bản có giá 0.
- Hạng trả phí có giá hợp lệ, không âm.
- Không suy ra giá ba tháng bằng giá một tháng nhân ba nếu Manager đã cấu hình mức khác.
- Phân biệt tổng giá kỳ hạn với giá bình quân tháng để hiển thị.

### B.2.5. Form — Quy tắc ưu đãi

| Trường | Cách hệ thống sử dụng |
|---|---|
| Giảm tự tập/lớp nhóm (%) | Tính giá mua các gói tương ứng |
| Giảm Coach 1–1 (%) | Tính giá huấn luyện cá nhân |
| Mở đặt lớp trước | Kiểm tra thời điểm Member được đăng ký |
| Điều kiện tủ đồ | Hiển thị và phục vụ xác nhận quyền tủ |

Các trường điều khiển nghiệp vụ phải lưu có cấu trúc. Không chỉ ghi “giảm 10%” trong mô tả rồi kỳ vọng checkout tự hiểu.

### B.2.6. Form — Quyền lợi bổ sung

Manager có thể:

1. Bấm **Thêm quyền lợi**.
2. Nhập nội dung.
3. Thêm nhiều dòng.
4. Sửa hoặc xóa từng dòng.
5. Lưu để Member thấy nội dung tương ứng.

Ví dụ:

- Một buổi workshop mỗi tháng.
- Khăn tập trong buổi.
- Ưu đãi mua nước tại quầy.
- Sự kiện dành cho hội viên.

Quyền lợi tự thêm không bị giới hạn ở ba nhóm ban đầu. Tuy nhiên, chúng không được tự biến gói thành viên thành quyền tập mọi môn.

| Loại quyền lợi | Cách thực hiện |
|---|---|
| Hệ thống hỗ trợ tự động | Ví dụ giảm giá, thời điểm đặt lớp |
| Nhân viên cung cấp | Ví dụ tặng khăn hoặc quà |
| Cần chức năng bổ sung | Ví dụ tự cấp một vé workshop mỗi tháng |

Viết “giảm 20% đồ uống” làm nội dung xuất hiện. Muốn POS tự giảm tiền phải có cấu hình và xử lý tương ứng. Giao diện quản trị cần giải thích điều này, tránh làm Manager hiểu rằng mọi dòng mô tả đều tự thực thi.

### B.2.7. Form — Điều kiện sử dụng

Nhập rõ:

- Thời điểm kích hoạt.
- Gia hạn.
- Chuyển hạng.
- Sử dụng tủ.
- Cộng dồn ưu đãi.
- Giới hạn quyền lợi bổ sung.

### B.2.8. Lưu và mở bán

1. Kiểm tra trường bắt buộc.
2. Kiểm tra giá và giá trị ưu đãi.
3. Lưu cấu hình.
4. Ghi nhật ký thao tác.
5. Cập nhật danh mục Member.

Nếu ngừng bán, Member không được tạo đơn mới.

### B.2.9. Sửa hạng đã bán

Manager sửa danh mục cho các lần mua tiếp theo. Gói đã mua giữ:

- Giá.
- Hạng.
- Tỷ lệ ưu đãi.
- Quyền lợi.
- Điều kiện.
- Thời hạn.

Thay đổi quyền lợi của người đã mua là nghiệp vụ riêng có thông báo và chính sách áp dụng; không thực hiện âm thầm khi sửa thẻ gói.

## B.3. Quản lý Gói môn tập

### B.3.1. Danh sách

Lọc theo bộ môn, hình thức và trạng thái mở bán.

Mỗi thẻ thể hiện:

- Tên gói.
- Môn và khu.
- Hình thức.
- Giá theo kỳ hạn.
- Số buổi và thời lượng nếu có Coach.
- Quyền lợi.
- Trạng thái.
- Chỉnh sửa, mở bán hoặc ngừng bán.

### B.3.2. Tạo gói — Thông tin sản phẩm

| Trường | Ví dụ |
|---|---|
| Tên gói | Yoga cơ bản — Lớp nhóm |
| Bộ môn | Yoga |
| Khu sử dụng | Studio Yoga |
| Mô tả | Dành cho người mới bắt đầu |
| Hình thức | Tự tập / Lớp nhóm / Coach 1–1 |
| Trạng thái | Đang bán / Ngừng bán |

Trong hệ thống hoàn chỉnh, khu được chọn từ danh sách khu thuộc bộ môn, tránh nhập khu không phù hợp. Demo có thể dùng mô tả phạm vi nhưng không thay thế quan hệ dữ liệu này khi nối backend.

### B.3.3. Tạo gói — Giá theo kỳ hạn

Nhập tổng giá 1 / 3 / 6 / 12 tháng.

Các kỳ hạn thuộc cùng một sản phẩm. Member chọn kỳ nào dùng giá tương ứng. Giá cuối cùng sau ưu đãi được tính khi tạo báo giá/đơn, không thay đổi giá niêm yết cho toàn danh mục.

### B.3.4. Tạo gói — Cấu hình hình thức

| Hình thức | Trường cấu hình |
|---|---|
| Tự tập | Khu, khung giờ, giới hạn lượt nếu có |
| Lớp nhóm | Số buổi mỗi tháng, phút mỗi buổi, sĩ số, phạm vi lớp được đăng ký |
| Coach 1–1 | Số buổi mỗi tháng, phút mỗi buổi, phạm vi Coach phù hợp; sĩ số một người |

Form nên ẩn hoặc vô hiệu hóa trường không liên quan:

- Tự tập: không yêu cầu số buổi Coach.
- Lớp nhóm: cho nhập sĩ số.
- 1–1: cố định sĩ số bằng một.

### B.3.5. Tạo gói — Quyền lợi

Manager được thêm quyền lợi tùy ý:

- Sử dụng thiết bị của khu.
- Giáo án theo chương trình.
- Theo dõi tiến độ.
- Đánh giá đầu kỳ.
- Bài tập về nhà.
- Workshop chuyên môn.

Số buổi, thời lượng và hình thức phải lấy từ cấu hình, tránh mô tả 12 buổi trong khi hệ thống cấp tám buổi.

### B.3.6. Tạo gói — Điều kiện

Cần nêu:

- Có được sử dụng khu ngoài giờ học không.
- Buổi cấp theo tháng hay cho toàn kỳ.
- Có chuyển buổi chưa dùng sang kỳ sau không.
- Hủy trước bao lâu được trả lượt.
- Xử lý không đến tập.
- Trung tâm hủy thì xử lý thế nào.
- Gia hạn và chuyển hình thức.

### B.3.7. Lưu và hiển thị ở Member

1. Manager hoàn thành form.
2. Hệ thống kiểm tra dữ liệu.
3. Lưu sản phẩm và các mức giá.
4. Lưu quyền lợi, điều kiện.
5. Ghi nhật ký.
6. Nếu đang bán, gói xuất hiện trong đúng môn và hình thức bên Member.

Ví dụ:

> Boxing — Coach 1–1  
> Tám buổi/tháng, 60 phút/buổi.  
> Thêm quyền lợi: “Đánh giá kỹ thuật vào cuối mỗi tháng”.

Member mở **Gói môn tập → Boxing → Coach 1–1** sẽ thấy cấu hình và quyền lợi vừa thêm.

### B.3.8. Tạo gói khác với tạo lớp và lịch Coach

- **Gói:** xác định Member mua quyền gì.
- **Lớp/buổi học:** xác định học lúc nào, ở đâu, ai dạy.
- **Booking:** xác định Member giữ chỗ ở buổi nào.

Tạo gói Yoga nhóm xong vẫn cần có lớp phù hợp để đăng ký. Gói 1–1 cần Coach phù hợp và lịch trống. Không nên bán vượt khả năng phục vụ số buổi đã cam kết.

### B.3.9. Ngừng bán

- Ẩn gói khỏi danh mục mua mới của Member.
- Không cho tạo thêm đơn.
- Không xóa các gói đã thanh toán.
- Giữ lịch sử giao dịch và quyền lợi đã cấp.

Ưu tiên ngừng bán thay vì xóa sản phẩm đã phát sinh giao dịch.

## B.4. Cách dữ liệu kết nối hai role

| Nhóm dữ liệu | Mục đích |
|---|---|
| Danh mục gói | Manager quản lý; Member xem và lựa chọn |
| Đơn mua | Ghi sản phẩm, kỳ hạn, giá và ưu đãi đã xác nhận |
| Gói cấp cho Member | Ghi quyền sử dụng, thời hạn và quyền lợi sau thanh toán |

**Manager sửa danh mục → Member thấy nội dung mới khi mua.**

**Member đã mua → giữ thông tin của lần mua đó.**

Khi triển khai backend:

- Hai role sử dụng chung dữ liệu danh mục, không có hai danh sách độc lập.
- Backend kiểm tra quyền Manager khi tạo/sửa/ngừng bán.
- Backend tính giá và kiểm tra hạng của Member.
- Member chỉ xem và thao tác đơn/gói của chính mình.
- Giá, quyền lợi và điều kiện trong đơn được lưu thành bản chụp tại thời điểm xác nhận.
- Xác nhận thanh toán và cấp quyền phải chống xử lý trùng.
- Ghi người thao tác và thời điểm cho các thay đổi quan trọng.

## B.5. Tiêu chí nghiệm thu Manager

- Menu hiển thị Quản lí gói.
- Chọn loại trước khi thấy danh sách thẻ.
- Hệ thống giữ đúng ba hạng thành viên.
- Cơ bản luôn miễn phí và luôn có sẵn.
- Tạo gói môn có đủ môn, khu, hình thức, giá và quyền lợi.
- Chỉnh kỳ hạn không làm mất giá các kỳ khác.
- Thêm/xóa quyền lợi cập nhật tương ứng bên Member.
- Nội dung người dùng nhập được hiển thị an toàn, không thực thi HTML/script.
- Ngừng bán ngăn mua mới nhưng không thu hồi gói đã mua.
- Sửa danh mục không làm thay đổi lịch sử giá hoặc quyền lợi.
- Phân biệt quyền lợi chỉ mô tả với quyền lợi được hệ thống tự thực thi.

---

## Ghi chú về bản demo và phạm vi triển khai

- Demo hiện dùng dữ liệu chung trong cùng trình duyệt; không phải đồng bộ database qua thiết bị khác.
- Chuyển role dùng để thử giao diện, không thay thế xác thực và phân quyền backend.
- Thanh toán là mô phỏng, không chuyển tiền thật.
- Các bộ đếm buổi, đặt tủ, phân lịch 1–1, học bù và kiểm tra tài nguyên cần được triển khai/kiểm thử đầy đủ trước khi coi là nghiệp vụ vận hành.
- Tài liệu này không yêu cầu chỉnh sửa Git hoặc website; đây là bản xuất Markdown của đặc tả đã trao đổi, bổ sung tiêu chí nghiệm thu để dễ bàn giao.
