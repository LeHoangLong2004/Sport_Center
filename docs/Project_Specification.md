# SPORT CENTER — TÀI LIỆU MÔ TẢ DỰ ÁN, LUỒNG NGHIỆP VỤ VÀ VAI TRÒ

- **Tên tiếng Việt:** Hệ thống Quản lý Trung tâm Thể thao.
- **Tên tiếng Anh:** Sports Center Management System.
- **Phiên bản tài liệu:** 1.0 — ngày 06/10/2026, múi giờ Việt Nam.
- **Đối tượng sử dụng:** Nhóm phát triển, người phân tích nghiệp vụ, thiết kế UI/UX, kiểm thử và AI hỗ trợ lập trình.
- **Repository tham chiếu:** https://github.com/LeHoangLong2004/Sport_Center
- **Bản mã đã đối chiếu:** `main`, commit `01acae3`; nhánh `Long` tại `d63aa97` có cùng nội dung file tại lần kiểm tra gần nhất.
- **Phạm vi tài liệu:** Đặc tả mục tiêu cần xây dựng; không phải tuyên bố tất cả chức năng đã hoàn thành trong repo.

## Mục lục

1. Tổng quan và mục tiêu dự án
2. Phạm vi, thuật ngữ và mô hình vận hành
3. Gói môn độc lập và hạng thành viên tùy chọn
4. Các luồng nghiệp vụ chính
5. Trang công khai và xác thực
6. Center Manager — Quản lý trung tâm
7. Coach — Huấn luyện viên
8. Member — Học viên / Thành viên
9. Receptionist — Nhân viên lễ tân
10. Phân quyền và đồng bộ giữa các role
11. Dữ liệu nghiệp vụ và trạng thái
12. Yêu cầu chung cho FE, BE và UI
13. Tiêu chí nghiệm thu và lộ trình thực hiện
14. Đối chiếu repo và các quyết định cần chốt
15. Hướng dẫn dùng tài liệu khi giao việc cho AI

## 1. Tổng quan và mục tiêu dự án

### 1.1. Dự án làm về gì?

Sport Center là ứng dụng web quản lý hoạt động của một trung tâm thể thao đa bộ môn. Hệ thống kết nối việc giới thiệu dịch vụ, đăng ký tài khoản, bán gói tập, đặt lớp, tổ chức lịch dạy, tiếp nhận học viên, điểm danh, theo dõi tập luyện và báo cáo doanh thu.

Mỗi bộ môn có khu tập riêng với thiết bị phù hợp. Thành viên mua gói của môn nào thì được sử dụng khu và thiết bị của môn đó trong phạm vi gói đã mua. Một thành viên có thể sở hữu nhiều gói môn độc lập.

Hệ thống có bốn vai trò nghiệp vụ: Center Manager, Coach, Member và Receptionist. Khách chưa đăng nhập sử dụng phần website công khai, không được xem là vai trò vận hành thứ năm.

### 1.2. Vấn đề cần giải quyết

- Thông tin thành viên, gói tập, lịch và thanh toán dễ bị phân tán nếu quản lý bằng bảng tính hoặc ghi chép riêng.
- Trung tâm cần xác định chính xác ai được tập môn nào, tại khu nào và đến ngày nào.
- Lớp học cần kiểm soát sức chứa, lịch Coach, khu/phòng và lịch học viên.
- Lễ tân cần kiểm tra quyền vào tập nhanh, đồng thời hỗ trợ mua gói và đặt lớp.
- Coach cần danh sách học viên đúng với lớp phụ trách, lưu điểm danh và tiến độ tập luyện.
- Member cần xem thông tin của chính mình và chủ động đăng ký dịch vụ.
- Manager cần báo cáo dựa trên giao dịch và hoạt động thật của toàn hệ thống.

### 1.3. Kết quả mong muốn

Một quy trình thống nhất: **Manager cấu hình dịch vụ → Member mua gói hoặc Receptionist bán tại quầy → thanh toán được xác nhận → Member được cấp quyền tập → đặt lớp hợp lệ → Coach hướng dẫn và điểm danh → Member xem kết quả → Manager xem báo cáo.**

### 1.4. Phạm vi triển khai

| Mức độ | Phạm vi |
| --- | --- |
| Bắt buộc | Flow 1: tài khoản và gói; Flow 2: lớp và lịch; Flow 3: thanh toán và báo cáo |
| Mở rộng theo đề bài | Flow 4: tập luyện và điểm danh; Flow 5: AI gợi ý bài tập; Flow 6: AI trợ lý |
| Ưu tiên riêng của nhóm | Làm điểm danh cơ bản trong Flow 4 sớm vì liên quan trực tiếp phần Coach; điều này không đổi phân loại optional ban đầu |
| Đề xuất MVP | Một trung tâm, nhiều khu tập; chưa cần vận hành chuỗi nhiều chi nhánh |
| Chưa đưa vào MVP mặc định | Lương nhân viên, kế toán đầy đủ, bán hàng hóa POS, đặt sân tính tiền theo giờ, tích hợp cổng/tủ đồ phần cứng |

Các màn hình ngoài MVP có thể tồn tại trong demo, nhưng không tự động trở thành yêu cầu bắt buộc.

## 2. Phạm vi, thuật ngữ và mô hình vận hành

### 2.1. Quy ước đọc tài liệu

- **Đã thống nhất:** Nội dung người dùng đã xác định trong trao đổi, đặc biệt mô hình gói và bốn role.
- **Đề xuất triển khai:** Quy tắc chi tiết để nhóm có thể xây dựng; cần nhóm duyệt trước khi coi là chính sách chính thức.
- **Hiện trạng repo:** Chỉ mô tả mã nguồn đã kiểm tra, không thay thế yêu cầu mục tiêu.

### 2.2. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
| --- | --- |
| Bộ môn — Sport | Loại hoạt động: Bơi, Gym, Yoga… |
| Khu tập — Training Zone | Khu chuyên biệt của một bộ môn, chứa thiết bị phục vụ môn đó |
| Phòng/sân | Địa điểm cụ thể trong khu tập, dùng để xếp lịch khi cần |
| Gói môn — Sport Plan | Sản phẩm có thể mua: môn, thời hạn, hình thức hướng dẫn và giá |
| Quyền tập đã mua — Sport Subscription | Gói thực tế thuộc về một Member, có ngày hiệu lực và trạng thái |
| Hạng thành viên — Membership Tier | Thường / Plus / Pro; chỉ quyết định các ưu đãi đã thống nhất |
| Lớp học — Class | Nhóm học theo môn, trình độ và Coach phụ trách |
| Buổi học — Class Session | Một lần diễn ra cụ thể của lớp, có thời gian, địa điểm và danh sách đăng ký |
| Đặt chỗ — Booking | Một Member đăng ký một buổi học cụ thể |
| Check-in khu tập | Lễ tân ghi nhận thành viên đến sử dụng khu tập |
| Điểm danh buổi học | Coach ghi nhận sự tham gia của học viên trong một buổi |
| Giáo án | Kế hoạch và bài tập Coach giao cho lớp hoặc cá nhân |
| PT | Hướng dẫn cá nhân; không mặc định đồng nghĩa với mọi gói có HLV |

**Lưu ý:** Trong repo hiện tại, một bản ghi `classes` có thời gian bắt đầu và thời lượng nên đang gần với khái niệm “buổi học”. Khi FE gọi API cần map đúng mã này, không tự giả định backend đã tách bảng lớp và buổi.

### 2.3. Danh mục bộ môn tham khảo

Danh sách dưới đây là **đề xuất dữ liệu mẫu**, không phải kết quả xếp hạng thị trường hay danh mục đã được người dùng chốt:

| Bộ môn | Ví dụ khu tập |
| --- | --- |
| Gym / Fitness | Khu máy và tạ |
| Bơi lội | Khu hồ bơi |
| Yoga | Phòng Yoga |
| Pilates | Phòng Pilates |
| Boxing | Khu Boxing |
| Kickboxing | Khu Kickboxing |
| Muay Thai | Khu Muay Thai |
| Taekwondo | Võ đường Taekwondo |
| Karate | Võ đường Karate |
| Cầu lông | Khu sân cầu lông |
| Bóng bàn | Khu bóng bàn |
| Bóng rổ | Khu sân bóng rổ |

Manager có thể thêm, sửa hoặc ngừng cung cấp bộ môn qua dữ liệu cấu hình. Không viết cứng toàn bộ danh mục trong từng trang FE. Với môn dùng sân, MVP có thể quản lý lớp và khung sử dụng; thuê sân theo giờ là nghiệp vụ riêng cần đặc tả bổ sung nếu nhóm chọn làm.

## 3. Gói môn độc lập và hạng thành viên tùy chọn

### 3.1. Nguyên tắc đã thống nhất

1. Member được mua gói môn mà không bắt buộc mua Plus hoặc Pro.
2. Hạng thành viên gồm **Thường / Plus / Pro**.
3. Hạng thành viên chỉ cung cấp ba nhóm quyền lợi: **tủ đồ, giảm giá khi mua gói tập và đặt lớp sớm**.
4. Hạng thành viên không tự cấp quyền vào tất cả khu tập, không tự cấp Coach hoặc giáo án.
5. Gói môn quyết định môn được tập, thời hạn và hình thức hướng dẫn.
6. Gói môn thường: sử dụng khu và thiết bị phù hợp để tự tập.
7. Gói môn có HLV: quyền của gói thường, cộng hướng dẫn và bài tập của Coach theo phạm vi dịch vụ đã bán.
8. Mỗi môn có khu riêng; không hiểu “sử dụng thiết bị” là được dùng toàn bộ thiết bị của cả trung tâm.

### 3.2. Cấu hình hạng thành viên

| Thuộc tính | Cách quản lý |
| --- | --- |
| Tên hạng | Thường, Plus, Pro |
| Giá và thời hạn nâng cấp | Manager cấu hình; chưa chốt mức giá trong tài liệu này |
| Tủ đồ | Có/không, loại quyền sử dụng; không đồng nghĩa chắc chắn còn tủ trống |
| Giảm giá | Tỷ lệ hoặc số tiền, phạm vi gói được áp dụng |
| Đặt lớp sớm | Khoảng thời gian được mở đặt chỗ trước giờ học |
| Hết hạn nâng cấp | Đề xuất trở về Thường; các gói môn còn hạn giữ nguyên |

**Đề xuất:** Thường là hạng mặc định không mất phí; một người có một hạng có hiệu lực tại một thời điểm. Chưa tự đặt tỷ lệ giảm giá, thời hạn hoặc số giờ đặt sớm làm chính sách chính thức.

“Đặt lớp sớm” chỉ thay đổi thời điểm mở đặt chỗ. Member vẫn cần gói đúng môn, đúng hình thức, còn hạn và lớp còn chỗ.

### 3.3. Thông tin một gói môn

- Mã và tên gói.
- Bộ môn, khu tập được sử dụng.
- Thời hạn: đề xuất cấu hình 1 tháng, 3 tháng, 12 tháng; có thể bổ sung sau.
- Hình thức: `self_training` hoặc `coached`.
- Giá niêm yết và trạng thái đang bán/ngừng bán.
- Khung giờ, số lượt/buổi được dùng nếu trung tâm có giới hạn.
- Với gói có HLV: hướng dẫn nhóm hay cá nhân, số buổi và cách đặt lịch.
- Ngày bắt đầu/kết thúc được xác lập khi mua hoặc kích hoạt theo chính sách.

**Không tự suy ra gói có HLV là PT 1–1 không giới hạn.** Đề xuất MVP dùng hướng dẫn theo lớp; PT cá nhân là biến thể riêng khi nhóm đã thống nhất số buổi và lịch.

### 3.4. Ví dụ quyền sử dụng

| Member đang sở hữu | Được làm | Không tự được cấp |
| --- | --- | --- |
| Thường + Gym tự tập 1 tháng | Vào khu Gym, dùng thiết bị trong phạm vi gói | Học Yoga hoặc nhận PT riêng |
| Plus + Bơi có HLV 3 tháng | Vào khu Bơi, đăng ký buổi phù hợp, nhận bài tập được giao; hưởng ưu đãi Plus | Vào Gym vì có Plus |
| Pro, chưa có gói môn | Hưởng quyền lợi hạng theo điều kiện; mua gói với ưu đãi phù hợp | Vào tập bất kỳ môn nào chỉ nhờ Pro |
| Thường + Gym + Yoga còn hạn | Sử dụng hai khu theo từng gói | Sử dụng khu Boxing |

### 3.5. Giá và thanh toán

Mỗi đơn phải lưu các dòng sản phẩm, giá gốc, ưu đãi áp dụng và số tiền cuối cùng tại thời điểm xác nhận. Backend là nơi tính và kiểm tra giá; FE chỉ hiển thị kết quả.

Đề xuất công thức cơ bản: **Tổng thanh toán = tổng giá các dòng hàng − giảm giá hợp lệ + khoản phí/thuế được cấu hình (nếu có)**. Không cho tổng âm. Chính sách cộng dồn voucher, làm tròn và thuế cần được nhóm chốt riêng.

Nếu mua hạng và gói môn trong cùng đơn, phải xác định hạng mới có giảm giá ngay cho gói trong đơn đó hay chỉ áp dụng từ lần mua sau. Chưa mặc định một phương án khi nhóm chưa chốt.

## 4. Các luồng nghiệp vụ chính

Giữ nguyên số Flow của đề bài để tránh nhầm với cách đánh số trong tài liệu tiến độ của repo.

### 4.1. Flow 1 — User and Membership Management — Bắt buộc

**Mục tiêu:** Quản lý tài khoản, hồ sơ, danh mục gói và quyền lợi đã mua.

**Tác nhân:** Member, Receptionist, Manager.

**Trình tự:**

1. Member tự đăng ký hoặc Receptionist tạo hồ sơ tại quầy.
2. Hệ thống kiểm tra thông tin và xử lý tài khoản trùng theo định danh đã chọn.
3. Tài khoản tự đăng ký được cấp role Member; tài khoản nhân sự do Manager có quyền tạo/phân công.
4. Member xem danh mục môn và chọn gói; có thể mua thêm Plus/Pro nếu muốn.
5. Hệ thống kiểm tra gói đang bán, thời hạn và ưu đãi; tạo đơn chờ thanh toán.
6. Chuyển sang Flow 3 để thu tiền.
7. Sau khi thanh toán được xác nhận, hệ thống cấp quyền tập/hạng theo đơn.
8. Member xem gói đang dùng, ngày hết hạn và lịch sử mua; Receptionist hỗ trợ gia hạn.

**Ngoại lệ:** Tài khoản bị khóa, gói ngừng bán, thanh toán thất bại, đơn trùng, chọn ngày bắt đầu không hợp lệ.

**Đầu ra:** Hồ sơ tài khoản, hạng có hiệu lực, danh sách gói môn và lịch sử giao dịch.

**Đề xuất gia hạn:** Cùng sản phẩm và gói còn hạn thì nối tiếp sau thời điểm kết thúc hiện tại; gói hết hạn thì theo ngày bắt đầu được xác nhận. Quy ước tính tháng và thời điểm hết hạn phải thống nhất ở backend.

### 4.2. Flow 2 — Class Booking and Schedule Management — Bắt buộc

**Mục tiêu:** Tạo lịch hợp lệ, phân công Coach và quản lý chỗ học.

**Tác nhân:** Manager, Coach, Member, Receptionist.

**Trình tự:**

1. Manager cấu hình môn, khu/phòng và Coach đủ điều kiện phụ trách.
2. Manager tạo lớp/buổi: thời gian, thời lượng, sức chứa, trình độ và điều kiện gói.
3. Backend kiểm tra lịch Coach, khu/phòng, giờ hoạt động và dữ liệu bắt buộc.
4. Member xem các buổi có thể đăng ký; Receptionist có thể thao tác hộ đúng Member.
5. Backend kiểm tra gói tại thời điểm buổi diễn ra, đúng môn, hình thức hướng dẫn, cửa sổ đặt chỗ, sức chứa, trùng lịch và booking đã tồn tại.
6. Đặt thành công: tạo booking và cập nhật chỗ trong cùng giao dịch dữ liệu.
7. Lịch Member, danh sách Coach và màn Manager cùng phản ánh booking đó.
8. Member tự hủy hoặc Receptionist hủy hộ theo chính sách; hệ thống trả chỗ đúng một lần.
9. Manager đổi lịch/hủy buổi thì người liên quan nhận thông báo, lịch cập nhật nhất quán.

**Quy tắc đề xuất:** Hủy trước ít nhất 2 giờ, theo hướng backend hiện tại; cần nhóm duyệt thành chính sách chính thức. Đặt trùng cùng buổi phải được từ chối hoặc trả lại booking cũ, không tăng số chỗ.

**Đầu ra:** Lịch dạy, lịch học, danh sách học viên và trạng thái booking chung.

### 4.3. Flow 3 — Payment and Report Management — Bắt buộc

**Mục tiêu:** Ghi nhận tiền chính xác, cấp dịch vụ đúng và báo cáo được đối soát.

**Áp dụng cho:** Mua/gia hạn gói môn, mua/gia hạn Plus/Pro; gói PT hoặc dịch vụ thu phí khác chỉ khi được bổ sung vào phạm vi đã duyệt.

**Trình tự:**

1. Backend tạo đơn hàng với các dòng sản phẩm và số tiền đã tính.
2. Member chọn thanh toán online hoặc Receptionist thu tại quầy.
3. Online: chờ kết quả xác nhận hợp lệ từ dịch vụ thanh toán. Tại quầy: nhân viên có quyền xác nhận khoản thu và phương thức.
4. Backend ghi nhận giao dịch thành công; xử lý thông báo lặp mà không cấp gói hai lần.
5. Cấp/gia hạn quyền tập hoặc hạng đã mua.
6. Tạo chứng từ thu tiền/hóa đơn theo phạm vi tích hợp; Member xem được lịch sử của mình.
7. Manager xem báo cáo theo thời gian, môn, sản phẩm và kênh thanh toán.

**Ngoại lệ:** Chưa trả tiền, thất bại, hết hạn, người dùng đóng trang, callback lặp, thanh toán thành công nhưng bước cấp quyền gặp lỗi. Phải cho phép truy vết và xử lý lại có kiểm soát.

**Quy tắc:** Không dùng bộ đếm thời gian hoặc nút FE để kết luận đã thanh toán. Đơn thất bại/chờ thanh toán không được cộng vào doanh thu thu tiền thành công.

**Đề xuất báo cáo:** Tổng tiền thu thành công, hoàn tiền, thu ròng; số đơn và doanh thu theo môn/gói; số Member mới và gói sắp hết hạn. Phân biệt báo cáo vận hành này với nghiệp vụ ghi nhận doanh thu kế toán chuyên sâu.

### 4.4. Flow 4 — Training and Attendance Management — Optional, ưu tiên điểm danh cơ bản

**Mục tiêu:** Ghi nhận tham gia và kết quả tập luyện.

1. Receptionist tìm Member, chọn khu cần vào và kiểm tra gói hợp lệ.
2. Check-in thành công ghi người thực hiện, Member, khu và thời gian; hạng Plus/Pro không thay thế gói môn.
3. Coach mở buổi được phân công và lấy danh sách booking hợp lệ.
4. Coach ghi có mặt/vắng/đi trễ, ghi chú nếu chính sách hỗ trợ.
5. Backend kiểm tra Coach có quyền trên buổi, kiểm tra học viên và lưu điểm danh theo từng buổi.
6. Coach giao giáo án và ghi kết quả sau buổi, nhận xét tiến độ theo mục tiêu.
7. Member xem lịch sử của chính mình; Manager xem báo cáo tham gia.

**Phân biệt:** Check-in khu tập không tự động là có mặt tại lớp. Học viên tự tập có check-in nhưng không nhất thiết có booking hoặc điểm danh Coach.

**Đầu ra:** Nhật ký check-in, điểm danh, giáo án được giao, kết quả và nhận xét.

### 4.5. Flow 5 — AI Workout Recommendation — Optional

1. Coach chọn học viên/lớp thuộc phạm vi phụ trách.
2. Hệ thống lấy mục tiêu, trình độ, thiết bị và lịch sử tập được phép sử dụng.
3. AI tạo bản nháp bài tập: tên, thời lượng, số hiệp/lần, mức độ và lưu ý.
4. Coach xem, sửa và duyệt trước khi giao.
5. Member chỉ nhận giáo án đã được Coach duyệt; lưu nguồn và phiên bản phục vụ tra cứu.

AI không tự thay đổi quyền tập, không tự phân công Coach và không tự coi gợi ý là bài tập đã hoàn thành. Khi thiếu dữ liệu cần hiển thị rõ; không tạo chẩn đoán hoặc cam kết điều trị.

### 4.6. Flow 6 — AI Assistant — Optional

Member hỏi về dịch vụ, lịch cá nhân, gói đang có hoặc bài tập. Hệ thống chỉ cung cấp dữ liệu theo quyền của người hỏi và chuyển câu hỏi hỗ trợ khi không đủ thông tin.

Đề xuất MVP cho AI: trả lời, giải thích và dẫn đến màn hình phù hợp. Nếu sau này cho phép đặt/hủy lớp qua AI, người dùng phải xác nhận thao tác và backend vẫn kiểm tra toàn bộ quy tắc như luồng thông thường.

## 5. Trang công khai và xác thực

### 5.1. Khách chưa đăng nhập

Các trang chính: Trang chủ, danh sách/chi tiết bộ môn, danh sách/chi tiết lớp, Coach, gói tập, giới thiệu và liên hệ. Tin tức, FAQ, thư viện ảnh và khuyến mãi là phần bổ sung.

Trang chủ giới thiệu trung tâm, các khu tập, dịch vụ, lớp nổi bật và cách đăng ký. Giá, tình trạng lớp và danh mục môn phải lấy từ dữ liệu được quản lý chung khi chuyển sang bản thật.

Khách được xem thông tin công khai; cần đăng nhập để mua gói, đặt lớp và xem dữ liệu cá nhân. Sau đăng nhập nên quay lại thao tác đang thực hiện nếu còn hợp lệ.

### 5.2. Đăng nhập thật và chọn role để demo

- Bản thật: đăng nhập bằng tài khoản, backend trả role và FE mở đúng portal.
- Đăng ký công khai chỉ tạo Member; không tự cấp quyền Manager/Coach/Receptionist.
- Demo: có thể có hộp “Bạn muốn trải nghiệm role nào?” theo yêu cầu trước đó; sử dụng tài khoản/dữ liệu thử tách biệt và gắn nhãn demo.
- Chọn role ở demo không phải cơ chế phân quyền của bản thật.
- Đăng xuất phải xóa phiên phía client và áp dụng chính sách phiên phía server nếu hệ thống hỗ trợ.
- Khôi phục mật khẩu cần đủ bước: yêu cầu → xác minh → nhập mật khẩu mới → lưu → đăng nhập lại.

## 6. Center Manager — Quản lý trung tâm

### 6.1. Trách nhiệm

Quản lý danh mục dịch vụ, con người, cơ sở tập luyện, lịch và chính sách; theo dõi hoạt động và doanh thu toàn trung tâm.

### 6.2. Màn hình và chức năng

| Mã | Màn hình/chức năng | Dữ liệu và thao tác |
| --- | --- | --- |
| CM-01 | Tổng quan | Member hoạt động, lớp hôm nay, chỗ đã đặt, tiền thu, gói sắp hết hạn; lọc thời gian |
| CM-02 | Thành viên | Tìm/lọc, xem hồ sơ, gói đã mua, hạng, booking; khóa/mở tài khoản có lý do |
| CM-03 | Nhân sự | Tạo/cập nhật Coach và Receptionist; môn chuyên môn, trạng thái làm việc |
| CM-04 | Bộ môn và khu tập | Quản lý tên môn, khu/phòng, thiết bị mô tả, sức chứa, giờ hoạt động và bảo trì |
| CM-05 | Gói môn | Tạo/sửa/ngừng bán sản phẩm theo môn, thời hạn, tự tập/có HLV và giá |
| CM-06 | Hạng thành viên | Cấu hình Thường/Plus/Pro với tủ đồ, giảm giá, đặt sớm; không gộp quyền môn |
| CM-07 | Lớp và lịch | Tạo buổi, phân công Coach, xếp khu/phòng, sửa lịch, hủy buổi và thông báo |
| CM-08 | Thanh toán | Tra cứu đơn, khoản thu, chứng từ, trạng thái; xử lý ngoại lệ theo quyền |
| CM-09 | Báo cáo | Theo thời gian/môn/gói: đăng ký, sử dụng, tham gia, tiền thu và hoàn tiền |
| CM-10 | Phân quyền | Gán role/phạm vi; không để tài khoản tự nâng quyền |
| CM-11 | Nhật ký thao tác | Ai làm gì, khi nào, đối tượng nào, thay đổi và lý do |
| CM-12 | Hồ sơ cá nhân | Xem và sửa thông tin được phép của chính mình |

### 6.3. Giới hạn và quy tắc

- Thay đổi giá sản phẩm không sửa giá đã chốt của đơn cũ.
- Không xóa mất lịch sử gói, booking hoặc thanh toán đã phát sinh; ưu tiên ngừng hoạt động.
- Khi đổi lịch phải kiểm tra lại xung đột và thông báo đúng người bị ảnh hưởng.
- Báo cáo không dùng KPI viết cứng; khi chưa có dữ liệu hiển thị trạng thái rỗng.
- Chỉnh điểm danh thay Coach, hoàn tiền hoặc cấp quyền thủ công chỉ làm nếu được nhóm cho phép, có lý do và audit log.

### 6.4. Ví dụ sử dụng

Manager mở bộ môn Yoga, cấu hình khu Yoga, tạo gói Yoga có HLV 3 tháng, phân công Coach cho buổi tối thứ Ba. Member có gói phù hợp đặt chỗ; Manager thấy số người đăng ký và sau buổi thấy số người tham gia.

## 7. Coach — Huấn luyện viên

### 7.1. Trách nhiệm và phạm vi của người dùng

Đây là role người dùng phụ trách chính. Coach quản lý hoạt động chuyên môn trong lớp/học viên được phân công: xem lịch, xem mục tiêu, chuẩn bị giáo án, điểm danh, ghi kết quả và đánh giá tiến độ.

Coach không tự bán gói, sửa giá, ghi nhận doanh thu, nâng hạng hoặc thay đổi role của học viên.

### 7.2. Màn hình và chức năng chi tiết

| Mã | Màn hình | Nội dung và thao tác |
| --- | --- | --- |
| CO-01 | Dashboard | Buổi hôm nay, buổi sắp tới, số học viên đăng ký, buổi chưa điểm danh; dẫn đến chi tiết |
| CO-02 | Lịch dạy | Xem ngày/tuần/tháng theo khả năng UI, lọc môn/lớp; hiển thị thời gian, khu, sức chứa và trạng thái |
| CO-03 | Chi tiết buổi | Mã buổi, môn, giờ, phòng/khu, Coach, danh sách đăng ký, giáo án và điểm danh |
| CO-04 | Học viên phụ trách | Tìm theo tên/mã, xem thông tin cơ bản, mục tiêu, trình độ, lịch sử liên quan |
| CO-05 | Giáo án | Tạo nháp, sửa, sao chép, giao cho lớp/cá nhân; tên, mục tiêu, môn, bài tập, thời lượng, hiệp/lần và lưu ý |
| CO-06 | Điểm danh | Chọn buổi, xem đúng danh sách, chọn trạng thái từng người, ghi chú, lưu và xem lại |
| CO-07 | Kết quả buổi tập | Ghi hoàn thành bài, chỉ số phù hợp môn, khó khăn và nhận xét |
| CO-08 | Đánh giá tiến độ | Xem theo thời gian, so với mục tiêu, ghi nhận xét và đề xuất điều chỉnh |
| CO-09 | Thông báo/bài tập về nhà | Chọn lớp hoặc học viên có quyền; nội dung, hạn thực hiện nếu có, lịch sử gửi |
| CO-10 | AI gợi ý | Tạo bản nháp từ mục tiêu/lịch sử; chỉnh sửa và duyệt trước khi giao |
| CO-11 | Hồ sơ/cài đặt | Xem chuyên môn, cập nhật trường cá nhân được phép; không tự sửa role hoặc phân công |

CO-01 đến CO-04 hỗ trợ trực tiếp Flow 2. CO-05 đến CO-09 thuộc Flow 4; CO-10 thuộc Flow 5. Có thể hoàn thiện CO-06 trước các phần tập luyện nâng cao.

### 7.3. Đặc tả màn điểm danh

**Dữ liệu đầu vào:** Buổi học được phân công, danh sách booking hợp lệ và kết quả đã lưu của từng học viên.

**Trường hiển thị:** Họ tên, mã học viên, trạng thái, ghi chú; phần đầu có lớp, bộ môn, ngày giờ, khu tập và thống kê.

**Trạng thái mục tiêu đề xuất:** Chưa điểm danh, Có mặt, Đi trễ, Vắng. Đi trễ/ghi chú cần bổ sung hợp đồng API vì backend đang chỉ hỗ trợ `attended` và `no_show`.

**Thao tác:**

1. Chọn buổi từ lịch hoặc danh sách buổi.
2. Tải danh sách học viên đúng buổi; không tái sử dụng trạng thái của buổi khác.
3. Chọn kết quả từng người; có thể đề xuất “đánh dấu tất cả có mặt” nhưng vẫn cho chỉnh từng người.
4. Bấm lưu; khóa thao tác gửi trùng trong khi request đang xử lý.
5. Chỉ báo thành công khi backend xác nhận; nếu lỗi phải giữ dữ liệu đang sửa để người dùng thử lại.
6. Tải lại trang vẫn thấy kết quả đã lưu.

**Ràng buộc:** Mỗi cặp buổi học–học viên chỉ có một kết quả hiện hành; lưu người ghi và thời điểm. Không điểm danh booking đã hủy hoặc lớp đã hủy. Coach khác lớp không được sửa. Thời điểm mở/khóa điểm danh và quyền sửa sau buổi cần nhóm chốt.

### 7.4. Giáo án và đánh giá

Giáo án cần gắn môn và đối tượng nhận; học viên chỉ thấy giáo án được giao cho mình hoặc lớp mình có quyền truy cập. Không hiển thị mặc định toàn bộ kho bài tập của mọi Coach.

Các chỉ số nên phù hợp từng môn, ví dụ Gym có hiệp/lần/tải tập, Bơi có quãng đường/thời gian, Yoga có mức hoàn thành động tác. Đề xuất MVP dùng bộ trường cơ bản kèm ghi chú trước khi tạo nhiều biểu mẫu chuyên môn.

### 7.5. Tiêu chí hoàn thành riêng của Coach

- Đăng nhập Coach nào chỉ thấy lịch và học viên trong phạm vi được phân công.
- Chọn buổi nào có đúng mã, thời gian và danh sách của buổi đó.
- Booking mới/hủy từ Member hoặc Receptionist được phản ánh sau tải lại dữ liệu.
- Điểm danh lưu thật và Member xem được kết quả của chính mình.
- Các nút chưa có backend phải ghi rõ chưa hỗ trợ, không báo thành công giả.
- Giáo án/nhận xét lưu thật nếu được đưa vào phạm vi phiên bản đang nghiệm thu.

## 8. Member — Học viên / Thành viên

### 8.1. Trách nhiệm

Quản lý thông tin cá nhân, chọn dịch vụ phù hợp, thanh toán, đặt/hủy lớp, theo dõi việc tập luyện và nhận thông báo.

### 8.2. Màn hình và chức năng

| Mã | Màn hình/chức năng | Dữ liệu và thao tác |
| --- | --- | --- |
| ME-01 | Tổng quan | Hạng hiện tại, từng gói môn, buổi sắp tới, nhắc hết hạn và thông báo |
| ME-02 | Hồ sơ | Họ tên, liên hệ, mục tiêu/trình độ; chỉnh trường được phép |
| ME-03 | Mua/gia hạn gói | Chọn môn, thời hạn, tự tập/có HLV; xem giá và ưu đãi trước thanh toán |
| ME-04 | Nâng cấp hạng | So sánh Thường/Plus/Pro; xem ba nhóm quyền lợi và thời hạn riêng |
| ME-05 | Lớp học | Lọc môn/ngày/giờ/Coach, xem chi tiết, điều kiện và số chỗ |
| ME-06 | Đặt/hủy lớp | Xác nhận buổi và điều kiện; xem kết quả thật, lý do từ chối hoặc hạn hủy |
| ME-07 | Lịch cá nhân | Lớp đã đặt, trạng thái hủy, buổi PT nếu có |
| ME-08 | Gói của tôi | Môn/khu được tập, ngày hiệu lực, hình thức, số buổi còn lại nếu áp dụng |
| ME-09 | Thanh toán | Đơn hàng, khoản thu, trạng thái và chứng từ của chính mình |
| ME-10 | Lịch sử tập | Check-in, điểm danh buổi và kết quả cá nhân |
| ME-11 | Giáo án/nhận xét | Xem bài đã giao, ghi nhận hoàn thành nếu tính năng cho phép |
| ME-12 | Thông báo/hỗ trợ | Nhận đổi lịch, hạn gói, bài tập; gửi yêu cầu hỗ trợ |
| ME-13 | AI trợ lý | Hỏi về dịch vụ/lịch/bài tập trong phạm vi dữ liệu được phép |

### 8.3. Giới hạn

Member chỉ xem dữ liệu của mình; không tự sửa giá, trạng thái thanh toán, kết quả điểm danh hoặc vai trò. Được hủy booking theo chính sách, không được tự hủy cả lớp. Hạng cao hơn không vượt qua điều kiện đúng môn và còn hạn.

## 9. Receptionist — Nhân viên lễ tân

### 9.1. Trách nhiệm

Hỗ trợ vận hành tại quầy: tìm thành viên, tạo hồ sơ, tư vấn/bán/gia hạn gói, xác nhận khoản thu, kiểm tra quyền vào khu và hỗ trợ đặt/hủy lớp.

### 9.2. Màn hình và chức năng

| Mã | Màn hình/chức năng | Dữ liệu và thao tác |
| --- | --- | --- |
| RE-01 | Tổng quan ca làm | Lượt check-in, giao dịch tại quầy, lớp sắp diễn ra và yêu cầu chờ xử lý |
| RE-02 | Tra cứu Member | Tìm theo mã, tên, điện thoại/email; mở đúng người được chọn |
| RE-03 | Tạo Member | Nhập thông tin, kiểm tra trùng, tạo hồ sơ; không chọn role quản trị |
| RE-04 | Bán/gia hạn gói | Chọn Member, môn, thời hạn, hình thức; áp dụng ưu đãi qua backend |
| RE-05 | Nâng hạng | Bán/gia hạn Plus/Pro, giải thích rõ không thay thế gói môn |
| RE-06 | Thu tiền | Chọn đơn, phương thức, xác nhận theo quyền; xuất chứng từ và lưu người thu |
| RE-07 | Check-in | Quét/nhập mã, chọn khu, kiểm tra gói và ghi nhận vào tập |
| RE-08 | Đặt/hủy hộ | Chọn đúng Member và buổi; áp dụng cùng điều kiện như Member tự thao tác |
| RE-09 | Lịch trung tâm | Tra cứu lớp, khu, Coach và chỗ trống để hỗ trợ khách |
| RE-10 | Hỗ trợ | Ghi yêu cầu, nội dung, người phụ trách và trạng thái xử lý |
| RE-11 | Hồ sơ cá nhân | Cập nhật thông tin được phép của bản thân |

### 9.3. Giới hạn

- Không tự chỉnh giá niêm yết, danh mục quyền lợi, role hoặc lịch Coach.
- Không đánh dấu online đã thanh toán chỉ dựa vào ảnh giao dịch; phải theo quy trình đối soát được duyệt.
- Quyền hoàn tiền/hủy giao dịch cần Manager phê duyệt nếu nhóm chọn triển khai.
- Điểm danh lớp hộ Coach chỉ là quyền bổ sung theo phân công; không nhầm với check-in khu tập.
- Báo cáo mặc định giới hạn hoạt động/ca được giao; quyền xem toàn bộ doanh thu do Manager quản lý.

## 10. Phân quyền và đồng bộ giữa các role

### 10.1. Ma trận quyền mục tiêu

| Chức năng | Manager | Coach | Member | Receptionist |
| --- | --- | --- | --- | --- |
| Cấu hình môn/khu/gói/giá | Quản lý | Xem liên quan | Xem công khai | Xem để tư vấn |
| Tạo và phân quyền nhân sự | Có | Không | Không | Không |
| Xem hồ sơ Member | Theo công việc | Học viên phụ trách | Chính mình | Theo nghiệp vụ tại quầy |
| Mua/gia hạn gói | Quản lý/giám sát | Không thuộc nhiệm vụ | Chính mình | Thao tác hộ |
| Tạo/sửa/hủy buổi | Có | Xem; đề nghị đổi nếu mở rộng | Không | Xem |
| Đặt/hủy booking | Hỗ trợ có phân quyền | Xem lớp phụ trách | Chính mình | Thao tác hộ |
| Check-in khu | Giám sát | Không mặc định | Xem lịch sử bản thân | Thực hiện |
| Điểm danh buổi | Giám sát; sửa theo chính sách | Buổi phụ trách | Xem bản thân | Theo phân công bổ sung |
| Giáo án/nhận xét | Xem theo quyền | Tạo/giao trong phạm vi | Xem phần được giao | Không mặc định |
| Ghi nhận tiền tại quầy | Theo quyền | Không | Không | Theo quyền |
| Báo cáo trung tâm/audit | Có | Chuyên môn của mình | Dữ liệu cá nhân | Phạm vi ca/nghiệp vụ |

### 10.2. Quy tắc đồng bộ

- Một Member có một định danh dùng chung ở các portal.
- Môn, gói, hạng, lớp, buổi, đơn và giao dịch không khai báo thành các danh sách riêng cho mỗi role.
- Mua tại quầy phải hiện trong tài khoản Member; mua online phải tra cứu được tại quầy.
- Member đặt lớp thì Coach thấy người đó; hủy hợp lệ thì danh sách cập nhật.
- Coach lưu điểm danh thì Member thấy kết quả tương ứng; Member không tự sửa được.
- Manager đổi lịch thì lịch Coach, Member và Receptionist cùng phản ánh thay đổi.
- MVP có thể tải lại dữ liệu sau thao tác hoặc khi mở trang; không bắt buộc realtime bằng WebSocket.
- Backend kiểm tra cả role và quyền trên đối tượng cụ thể; ẩn nút ở FE không thay thế phân quyền backend.

## 11. Dữ liệu nghiệp vụ và trạng thái

### 11.1. Các nhóm dữ liệu mục tiêu

| Nhóm | Dữ liệu chính |
| --- | --- |
| Người dùng | User, Role, MemberProfile, CoachProfile |
| Cơ sở tập | Sport, TrainingZone, Room/Court, lịch hoạt động/bảo trì |
| Sản phẩm | SportPlan, MembershipTier, cấu hình quyền lợi và giá |
| Quyền đã mua | SportSubscription, MembershipUpgrade |
| Lịch | Class, ClassSession, CoachAssignment, Booking |
| Thanh toán | Order, OrderItem, Payment, Receipt/Invoice, Refund nếu làm |
| Tập luyện | ZoneCheckIn, Attendance, TrainingPlan, Exercise, TrainingResult, Assessment |
| Vận hành | Notification, SupportRequest, AuditLog |

Đây là mô hình khái niệm, không yêu cầu lập tức tạo đúng từng bảng hoặc đổi toàn bộ tên trong repo. Có thể dùng chung bảng sản phẩm/subscription nếu phân loại và quy tắc đủ rõ.

### 11.2. Trạng thái đề xuất

| Đối tượng | Trạng thái và lưu ý |
| --- | --- |
| Tài khoản | Hoạt động / bị khóa |
| Gói đang bán | Đang bán / ngừng bán; khác với quyền tập đã mua |
| Quyền tập | Chờ hiệu lực / có hiệu lực / hết hạn / thu hồi theo chính sách |
| Thanh toán | Chờ / thành công / thất bại / hủy / hết hạn; hoàn tiền quản lý riêng nếu triển khai |
| Booking | Đã xác nhận / Member hủy / lớp bị hủy |
| Điểm danh | Chưa ghi nhận / có mặt / đi trễ / vắng |
| Buổi học | Đã lên lịch / đang diễn ra / hoàn thành / đã hủy |
| Giáo án | Nháp / đã giao / lưu trữ |

Đề xuất tách trạng thái booking và điểm danh để “đã đặt” không mất ý nghĩa khi ghi “có mặt”. Backend hiện đang dùng chung `class_bookings.status`; nếu chưa refactor thì phải định nghĩa chuyển trạng thái và ánh xạ FE rõ ràng.

### 11.3. Thời gian và lịch sử

- Hiển thị giờ Việt Nam; quy ước lưu/truyền thời gian có múi giờ rõ ràng.
- Quyền tập phải hợp lệ tại thời điểm buổi học diễn ra, không chỉ lúc bấm đặt.
- Giao dịch và điểm danh lưu người thực hiện, thời điểm, đối tượng; chỉnh sửa quan trọng cần lịch sử.
- Giá/ưu đãi đơn cũ được giữ nguyên để đối soát khi bảng giá thay đổi.

## 12. Yêu cầu chung cho FE, BE và UI

### 12.1. FE

- Tách trang công khai, xác thực và bốn portal để dễ tìm theo role.
- Dùng component chung cho bảng, form, nút, trạng thái, thông báo và hồ sơ khi phù hợp.
- Tách lớp gọi API, kiểu dữ liệu và quy tắc ánh xạ khỏi phần JSX hiển thị.
- Dùng route rõ ràng; không xác định đường đi bằng nội dung chữ của nút.
- Có trạng thái loading, rỗng, lỗi và thử lại; không hiển thị số liệu giả như dữ liệu thật.
- Xác nhận thành công sau response thật; giữ form khi lưu thất bại.
- Chặn gửi trùng ở UI, đồng thời backend vẫn phải bảo vệ thao tác lặp.
- Theme, khoảng cách, typography, cách hiển thị ngày/tiền và trạng thái thống nhất giữa role; có thể đổi màu nhận diện nhẹ theo role.
- Giao diện dùng được trên laptop và màn hình nhỏ; bảng/lịch cần xử lý cuộn hoặc đổi cách trình bày.

### 12.2. Backend

- Xác thực, kiểm tra role và kiểm tra quyền trên từng tài nguyên.
- Validation dữ liệu, quy tắc gói, lịch, giá và trạng thái đặt ở backend.
- Giao dịch dữ liệu bảo đảm số chỗ và booking không lệch nhau.
- Thanh toán lặp, bấm đặt lặp và retry không gây thu/cấp quyền/trừ chỗ nhiều lần.
- Trả lỗi có mã/thông báo dễ xử lý ở FE; không cần hiển thị lỗi SQL thô cho người dùng.
- Tách dữ liệu seed/demo khỏi vận hành thật.
- Không coi API “có endpoint” là đã hoàn thành nếu chưa kiểm thử quyền, ngoại lệ và liên thông FE.

### 12.3. Thống nhất tên role

Đề xuất dùng `manager`, `coach`, `member`, `receptionist`. Repo có nơi dùng thêm `admin` và `staff`; nhóm cần định nghĩa ánh xạ hoặc bỏ tên dư. Không tự bổ sung một role nghiệp vụ Admin thứ năm nếu chưa có yêu cầu.

## 13. Tiêu chí nghiệm thu và lộ trình thực hiện

### 13.1. Các tình huống kiểm thử quan trọng

| Mã | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| AC-01 | Đăng ký công khai | Tạo Member, không tự tạo Manager |
| AC-02 | Thường mua Gym, thanh toán thành công | Có quyền Gym theo thời hạn; không cần Plus/Pro |
| AC-03 | Pro chưa có gói Bơi muốn vào Bơi | Bị từ chối do thiếu gói môn |
| AC-04 | Có gói Bơi muốn đặt Yoga | Bị từ chối đúng lý do |
| AC-05 | Gói hết hạn trước ngày buổi học | Không đặt được buổi đó |
| AC-06 | Gửi đặt cùng buổi hai lần | Một booking, số chỗ chỉ tăng một |
| AC-07 | Hai Member đặt chỗ cuối đồng thời | Chỉ một người được xác nhận |
| AC-08 | Hủy hợp lệ rồi gửi hủy lại | Chỉ trả chỗ một lần |
| AC-09 | Receptionist đặt/hủy hộ | Thao tác đúng Member được chọn, lưu người thao tác |
| AC-10 | Manager đổi/hủy buổi | Các portal cập nhật và gửi đúng thông báo |
| AC-11 | Coach A sửa điểm danh lớp Coach B | Backend từ chối |
| AC-12 | Điểm danh xong tải lại | Kết quả giữ nguyên, không lan sang buổi khác |
| AC-13 | Member xem điểm danh người khác | Bị từ chối |
| AC-14 | Thanh toán pending/thất bại | Chưa cấp quyền và chưa cộng tiền thu thành công |
| AC-15 | Xác nhận thanh toán gửi lặp | Không tạo hai giao dịch/cấp hai gói |
| AC-16 | Plus/Pro hết hạn, gói môn còn hạn | Giữ quyền môn, cập nhật ưu đãi hạng theo chính sách |
| AC-17 | Coach giao giáo án | Chỉ đúng người/lớp nhận được |

### 13.2. Thứ tự thực hiện đề xuất

1. Chốt quy tắc chưa rõ, sửa lỗi nền tảng và thống nhất DTO/tên role.
2. Hoàn thiện Flow 1: tài khoản, danh mục, hạng và gói môn.
3. Hoàn thiện Flow 3 ở mức thanh toán/thu tiền đủ để cấp gói thật; sau đó báo cáo cơ bản.
4. Hoàn thiện Flow 2: tạo buổi, đặt/hủy, lịch và phân quyền.
5. Ưu tiên phần Coach: lịch thật → danh sách thật → điểm danh thật; nối lịch sử Member.
6. Thêm check-in khu, giáo án, kết quả và đánh giá trong Flow 4.
7. Làm AI khi dữ liệu nền và luồng bắt buộc ổn định.

Số Flow là mã yêu cầu, không phải thứ tự lập trình bắt buộc. Có thể làm song song màn hình và API khi đã thống nhất hợp đồng dữ liệu.

## 14. Đối chiếu repo và các quyết định cần chốt

### 14.1. Hiện trạng đã quan sát

- FE dùng React, TypeScript, Vite, Tailwind; đã có trang công khai và bốn portal.
- Backend chia Api/Application/Domain/Infrastructure; có endpoint tài khoản, gói, subscription, lớp, booking, lịch và điểm danh.
- Một phần FE quản lý người dùng/gói đã có request API; các màn Coach và nhiều luồng khác vẫn dùng dữ liệu mẫu.
- `GET /api/schedule/coach` trả lớp phụ trách và danh sách học viên; `POST /api/classes/{id}/attendance` nhận `attended`/`no_show`.
- Điểm danh FE dùng `present`/`absent`/`late`, chưa có xử lý lưu ở nút hoàn tất; cần đồng bộ hợp đồng dữ liệu trước khi nối.
- Có rủi ro nghiệp vụ trong mã đã đọc: đặt trùng làm tăng chỗ, thiếu kiểm tra đúng môn, thiếu kiểm tra Coach phụ trách khi điểm danh, hủy hộ chưa xác định Member, thông báo hủy lớp lọc sai trạng thái.
- Luồng thanh toán FE vẫn mô phỏng, không phải xác nhận giao dịch thật.
- Kiểm tra TypeScript gần nhất có bốn lỗi; chưa xác nhận backend build/chạy bằng database thật trong lượt rà soát.

Các nhận xét này là snapshot của commit đã nêu; phải kiểm tra diff khi repo đổi. Dòng “Done” trong tài liệu tiến độ không tự chứng minh một luồng đã chạy hoàn chỉnh từ FE đến database.

### 14.2. Danh sách quyết định chưa chốt

| Vấn đề | Cần nhóm quyết định |
| --- | --- |
| Danh mục môn | Chọn khoảng 12 môn chính thức và tên khu tương ứng |
| Hạng Plus/Pro | Giá, thời hạn, tủ đồ, tỷ lệ giảm và số giờ đặt sớm |
| Gói có HLV | Lớp nhóm, PT cá nhân hay cả hai; số buổi và điều kiện sử dụng |
| Thời hạn gói | Có 1/3/12 tháng ngay trong MVP hay triển khai ít lựa chọn trước |
| Kích hoạt/gia hạn | Bắt đầu khi thanh toán hay ngày chọn; cách tính mốc hết hạn |
| Ưu đãi | Mua hạng cùng đơn có giảm ngay không; voucher có cộng dồn không |
| Hủy/hoàn tiền | Hạn hủy, lớp hủy có hoàn tiền/hoàn lượt không; ai phê duyệt |
| Điểm danh | Có đi trễ/ghi chú ngay không; thời điểm mở/khóa, quyền sửa |
| Khu và phòng | Một môn có một hay nhiều phòng; khung giờ, sức chứa và bảo trì |
| Lễ tân | Quyền điểm danh hộ, hoàn tiền và phạm vi báo cáo |
| Thanh toán | Phương thức online sẽ tích hợp và quy trình thu tiền tại quầy |

Không tự biến các giá trị minh họa trong demo thành quy tắc chính thức.

## 15. Hướng dẫn dùng tài liệu khi giao việc cho AI

### 15.1. Nguyên tắc

- Dùng tài liệu này để xác định yêu cầu mục tiêu; dùng source code/API hiện tại để xác định cách tích hợp.
- Nếu hai nguồn không khớp, nêu rõ khác biệt trước khi đổi hợp đồng dữ liệu hoặc nghiệp vụ.
- Khi chỉ giao phần Coach, không tự sửa quyền thanh toán/Manager hoặc thay mô hình gói.
- Không tạo thêm danh sách Member, lớp, gói riêng ở từng role để giả lập đồng bộ.
- Tách rõ dữ liệu demo với dữ liệu thật; không tạo thông báo lưu/thanh toán thành công khi chưa có kết quả thật.
- Chỉ coi công việc hoàn thành khi đã kiểm tra cả đường đi thành công và ngoại lệ quan trọng trong phạm vi thay đổi.

### 15.2. Mẫu yêu cầu triển khai phần Coach

> Đọc Sport_Center_Project_Specification.md và mã nguồn hiện tại. Tôi phụ trách Coach. Hãy triển khai CO-02, CO-03 và CO-06: lấy lịch dạy thật, hiển thị học viên đúng buổi và lưu điểm danh. Giữ đồng bộ UI với các portal hiện có. Đối chiếu DTO backend trước khi ánh xạ trạng thái; không gửi absent/late vào API chỉ hiểu attended/no_show. Kiểm tra quyền Coach trên từng buổi, không sửa booking đã hủy và không báo lưu thành công giả. Sau khi làm, báo các file thay đổi, API sử dụng, cách kiểm tra và phần còn thiếu. Không commit/push nếu tôi chưa yêu cầu.

---

**Căn cứ biên soạn:** Yêu cầu và quyết định trong cuộc trao đổi của người dùng; các lần đọc repo nêu ở đầu tài liệu. Các mục ghi “đề xuất” cần được nhóm duyệt. Tài liệu này không bổ sung nghiên cứu thị trường mới và không xác nhận những chức năng chưa kiểm thử là đã hoàn thành.
