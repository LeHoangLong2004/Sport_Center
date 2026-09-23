# SRS: HỆ THỐNG QUẢN LÝ TRUNG TÂM THỂ THAO (SmartGym OS)

| Trường | Giá trị |
|---|---|
| **Mã đề tài** | SWP391_FA26_TOPIC_04 |
| **Giảng viên phụ trách** | MinhTTH5 |
| **Phiên bản** | 1.0.0 (Production-Ready Spec) |
| **Trạng thái** | APPROVED |
| **Kiến trúc cốt lõi** | Multi-Role RBAC (Center Manager, Coach, Member, Receptionist), Cloud-Ready RESTful API, Automated Scheduling & Billing Engine, Integrated AI Fitness Assistant. |

## 1.1. Mục tiêu hệ thống (Objective)

Xây dựng nền tảng phần mềm quản trị toàn diện cho trung tâm thể thao và thể hình (Fitness & Sports Center), kết nối liền mạch 4 đối tượng tác nhân: Quản lý trung tâm, Huấn luyện viên, Lễ tân và Hội viên. Hệ thống hướng đến:

- 1. Số hóa quy trình vận hành: Loại bỏ ghi chép thủ công, hợp nhất dữ liệu hội viên, lịch học, phòng tập, check-in và thanh toán trên một nền tảng duy nhất.
- 2. Nâng cao tỷ lệ duy trì hội viên (Retention Rate): Minh bạch lộ trình tập luyện, trực quan hóa tiến độ thể chất và áp dụng AI để cá nhân hóa giáo án.
- 3. Quản trị thông minh theo thời gian thực: Cung cấp bảng điều khiển (Dashboard) theo dõi doanh thu, tỷ lệ lấp đầy lớp học và hiệu suất nhân sự.

## 1.4. Ngoài phạm vi (Out-of-Scope) — TUYỆT ĐỐI KHÔNG LÀM

- KHÔNG can thiệp trực tiếp phần cứng cổng xoay (Turnstile Gateway): chỉ cung cấp API quét mã QR trên máy tính bảng/máy tính quầy lễ tân; không viết driver nhúng phần cứng.
- KHÔNG xây dựng sàn thương mại điện tử (E-commerce Marketplace): không bán lẻ đồ thể thao/thực phẩm bổ sung giao hàng quy mô lớn.
- KHÔNG chẩn đoán điều trị y khoa: AI chỉ khuyến nghị thể dục/dinh dưỡng đại chúng, kèm cảnh báo miễn trừ trách nhiệm y tế.

## 1.2. Phân loại vai trò người dùng (System Actors)

| Vai trò (Actor) | Trách nhiệm chính trong hệ thống |
|---|---|
| **Center Manager (Quản lý trung tâm)** | Quản lý danh mục hội viên, HLV, nhân viên; quản lý gói tập, học phí, bộ môn, phòng tập; phân công HLV; xem báo cáo doanh thu/vận hành; cấu hình RBAC và kiểm duyệt Audit Log. |
| **Coach (Huấn luyện viên)** | Xem lịch dạy và danh sách học viên; theo dõi mục tiêu, chỉ số thể chất của học viên; tạo giáo án cá nhân/lớp; điểm danh lớp học; ghi nhận kết quả tập luyện và nhận xét sau buổi tập; sử dụng AI gợi ý bài tập. |
| **Member (Học viên / Thành viên)** | Tự đăng ký tài khoản, xem và mua/gia hạn gói tập; tìm kiếm và đặt/hủy lớp học; theo dõi lịch cá nhân, lịch sử điểm danh, tiến độ tập luyện; nhận bài tập về nhà; tương tác với AI Chatbot hỏi đáp. |
| **Receptionist (Nhân viên Lễ tân)** | Tiếp đón hội viên, check-in vào cổng (QR Code/Mã hội viên); đăng ký hội viên mới tại quầy; thu học phí, xử lý thanh toán, xuất hóa đơn; đặt/hủy lịch học hộ hội viên; tiếp nhận yêu cầu hỗ trợ. |

## 1.3. Phạm vi triển khai (Scope Breakdown)

| Flow | Mức độ ưu tiên | Nội dung chính |
|---|---|---|
| **Flow 1: Quản lý Người dùng & Gói thành viên** | Must Have | Quản lý tài khoản, hồ sơ cá nhân, RBAC cho 4 vai trò; quản lý danh mục gói tập (giá, thời hạn, số buổi, quyền lợi); đăng ký hội viên tại quầy & tự đăng ký online; quản lý trạng thái gói cước (Active/Inactive/Expired/Suspended) và batch job tự động quét hạn. |
| **Flow 2: Đặt lịch & Quản lý Lịch biểu Lớp học** | Must Have | Quản lý danh mục lớp học, bộ môn, phòng tập và sức chứa; lập lịch định kỳ, phân công HLV (kiểm tra xung đột lịch); hội viên tự đặt/hủy chỗ theo chính sách; lễ tân đặt/hủy hộ; lịch cá nhân hóa đồng bộ cho Member và Coach. |
| **Flow 3: Thanh toán & Báo cáo Doanh thu** | Must Have | Thanh toán tại quầy (tiền mặt/chuyển khoản/POS); thanh toán trực tuyến & tự động gia hạn; tự động xuất hóa đơn PDF qua email; dashboard doanh thu, hội viên mới/tái tục, tỷ lệ lấp đầy lớp. |
| **Flow 4: Quản lý Tập luyện & Điểm danh** | Nice to Have | Check-in QR/mã định danh; điểm danh lớp học (Có mặt/Đi muộn/Vắng mặt); soạn giáo án & giao bài tập về nhà; ghi nhận chỉ số thể chất và nhận xét; biểu đồ tiến độ thể chất cho Member. |
| **Flow 5: Gợi ý bài tập bằng AI** | Nice to Have | Động cơ AI phân tích mục tiêu (giảm mỡ/tăng cơ/phục hồi), BMI, lịch sử tập luyện, thể trạng để tự động sinh giáo án gợi ý cho HLV và hội viên. |
| **Flow 6: Trợ lý ảo AI tương tác** | Nice to Have | Chatbot tích hợp LLM hỗ trợ 24/7: kỹ thuật bài tập, dinh dưỡng cơ bản, lịch mở cửa lớp học và nội quy trung tâm. |

## 2. Quy tắc nghiệp vụ (Business Rules)

| Mã BR | Tên quy tắc | Chi tiết |
|---|---|---|
| **BR-001** | Điều kiện kích hoạt gói hội viên | Gói hội viên chỉ chuyển ACTIVE khi đã thanh toán thành công 100% giá trị gói (hoặc trả góp được Manager phê duyệt). Ngày bắt đầu tính hạn là ngày thanh toán hoặc ngày kích hoạt do khách chọn (tối đa không quá 30 ngày kể từ ngày thanh toán). |
| **BR-002** | Quy tắc bảo lưu và gia hạn gói tập | Mỗi gói tập chỉ được bảo lưu tối đa 1 lần, tổng thời gian bảo lưu không quá 60 ngày. Trong thời gian bảo lưu, toàn bộ quyền lợi vào phòng tập và đặt lịch lớp sẽ tạm thời bị khóa. |
| **BR-003** | Quy chuẩn định danh và hồ sơ cá nhân | Mỗi hội viên được cấp duy nhất 1 Mã thẻ hội viên (Member_Code) và 1 Mã QR động dùng để check-in. Email và Số điện thoại của tài khoản phải là duy nhất trên toàn hệ thống. |
| **BR-004** | Chính sách đặt và hủy lớp học | Hội viên chỉ đặt chỗ cho lớp trong khung giờ/quyền lợi của gói còn hạn. Đặt chỗ: tối đa 7 ngày trước, tối thiểu 30 phút trước giờ học. Hủy hợp lệ: trước tối thiểu 2 tiếng; hủy muộn hoặc vắng không báo trước bị tính là 1 buổi đã sử dụng (No-show penalty). |
| **BR-005** | Kiểm soát sức chứa phòng học (Capacity & Overbooking) | Tự động khóa Booking khi lớp đã đủ người (Current_Bookings >= Max_Capacity). Hỗ trợ Waitlist tối đa 5 người; khi có người hủy, hệ thống tự động đôn người đầu danh sách chờ lên chính thức và gửi thông báo xác nhận. |
| **BR-006** | Ngăn chặn xung đột lịch HLV và Phòng tập | Một HLV không thể được phân công cho 2 lớp cùng khung giờ. Một phòng tập không thể chứa 2 lớp có lịch trùng hoặc đè lên nhau. |
| **BR-007** | Xác thực điều kiện Check-in vào cổng | Khi quét mã check-in: kiểm tra trạng thái gói phải ACTIVE, thời gian quét nằm trong khung giờ quy định của gói (VD gói Off-peak chỉ check-in trước 16:00). Nếu hợp lệ, ghi nhận Check-in và hiển thị đèn xanh trong ≤ 1 giây. |
| **BR-008** | Quy tắc khấu trừ buổi tập khi điểm danh | HLV điểm danh (ATTENDED) sẽ trừ số buổi khả dụng của gói tương ứng. Nếu vắng mặt có phép xác nhận trước 2 tiếng: hoàn trả lại lượt buổi tập vào tài khoản. |
| **BR-009** | Xử lý lỗi thanh toán tự động (Subscription Retry) | Với gói tự động gia hạn hàng tháng, nếu trừ tiền thất bại: gửi thông báo nhắc và tự động thử lại 3 lần trong 5 ngày. Sau 5 ngày không thành công, gói chuyển sang SUSPENDED. |
| **BR-010** | Bảo mật nhật ký kiểm toán (Audit Trail) | Mọi thao tác nhạy cảm (sửa giá gói, hủy hóa đơn, gán quyền Admin/Manager, xóa học viên) bắt buộc ghi Audit Log với User ID, IP, Timestamp (UTC) và dữ liệu thay đổi (Old Value -> New Value). Lưu trữ bất biến tối thiểu 7 năm. |
| **BR-011** | Phạm vi an toàn của AI (AI Safety Guardrails) | AI chỉ đưa ra gợi ý dựa trên dữ liệu người dùng cung cấp (mục tiêu, thể trạng, chấn thương cũ). Không sinh khuyến nghị dùng dược chất kích thích hoặc thực đơn ăn kiêng cực đoan nguy hại sức khỏe. |
| **BR-012** | Quy tắc hoàn tiền và hủy gói tập (Refund Policy) | Hội viên chỉ được hoàn tiền trong vòng 7 ngày kể từ ngày kích hoạt gói và chưa sử dụng buổi tập nào. Số tiền hoàn trả bị khấu trừ phí xử lý giao dịch (nếu có) và phải được Center Manager phê duyệt trước khi xử lý. |
| **BR-013** | Giới hạn khối lượng công việc của Huấn luyện viên (Coach Workload Limit) | Một HLV không được phân công quá 8 lớp học trong cùng một ngày và không quá 40 giờ giảng dạy trong một tuần, nhằm đảm bảo chất lượng huấn luyện và tuân thủ luật lao động. |
| **BR-014** | Chính sách đổi lớp học tương đương (Class Swap Policy) | Hội viên được phép đổi sang lớp học khác cùng bộ môn (nếu còn chỗ trống) tối đa 2 lần trong cùng tuần mà không bị tính là hủy hoặc trừ buổi tập. |
| **BR-015** | Quy tắc bảo mật dữ liệu cá nhân (Data Privacy Compliance) | Dữ liệu cá nhân và chỉ số thể chất của hội viên chỉ được chia sẻ nội bộ với HLV phụ trách và Center Manager; không được xuất/chia sẻ ra ngoài hệ thống nếu không có sự đồng ý bằng văn bản của hội viên, tuân thủ Nghị định về bảo vệ dữ liệu cá nhân. |
| **BR-016** | Xử lý sự cố thanh toán trùng lặp (Duplicate Payment Handling) | Nếu hệ thống ghi nhận 2 giao dịch thanh toán thành công trùng khớp cho cùng 1 hóa đơn trong vòng 5 phút, hệ thống tự động đánh dấu giao dịch thứ 2 là nghi vấn trùng lặp và tạo yêu cầu hoàn tiền chờ Manager xác nhận. |
| **BR-017** | Quy tắc truy cập đa chi nhánh (Multi-branch Access Rule) | Hội viên chỉ được sử dụng quyền lợi gói tập tại chi nhánh đã đăng ký, trừ khi gói tập thuộc loại All-Access Multi-branch; Center Manager chỉ được toàn quyền quản trị trên chi nhánh mình phụ trách, trừ khi được cấp quyền Super Admin. |

## 3. Danh sách yêu cầu chức năng (Functional Requirements)

| Mã FR | Nhóm Flow | Tên yêu cầu | Actor thực hiện | Mô tả chi tiết | Độ ưu tiên | Liên quan BR |
|---|---|---|---|---|---|---|
| **FR-001** | Flow 1 | CRUD Tài khoản & Hồ sơ cá nhân | Center Manager, Member | Quản lý hồ sơ toàn diện cho Center Manager, Coach, Receptionist, Member. Cho phép Member tự cập nhật thông tin cá nhân (ảnh đại diện, ngày sinh, số điện thoại, liên hệ khẩn cấp). | Must-Have | BR-003 |
| **FR-002** | Flow 1 | Quản lý Danh mục Gói hội viên | Center Manager | Giao diện cho Center Manager cấu hình gói cước: tên gói, mức giá, thời hạn, giới hạn số buổi, các bộ môn/khu vực được phép truy cập. | Must-Have | BR-001 |
| **FR-003** | Flow 1 | Phân quyền truy cập theo vai trò (RBAC) | Center Manager | Kiểm soát nghiêm ngặt quyền hạn truy cập màn hình và API theo 4 vai trò. Khóa chức năng ngoài thẩm quyền. | Must-Have | BR-010 |
| **FR-004** | Flow 1 | Quản lý Nhật ký thao tác (Audit Log) | Center Manager | Ghi lại và cho phép Center Manager tra cứu, lọc lịch sử các thao tác quan trọng (thay đổi giá, hủy gói, xóa dữ liệu). | Must-Have | BR-010 |
| **FR-005** | Flow 1 | Đăng ký nhanh tại quầy Lễ tân | Receptionist | Giao diện tối ưu cho Receptionist nhập nhanh thông tin khách mới, chọn gói tập, gán mã thẻ và kích hoạt ngay tại chỗ. | Must-Have | BR-001, BR-003 |
| **FR-023** | Flow 1 | Hệ thống thông báo đa kênh | Hệ thống (Tự động) | Gửi Push Notification và Email khi: đặt lịch thành công, lớp bị đổi lịch/hủy, gói sắp hết hạn (trước 7 ngày), có bài tập mới từ HLV. | Must-Have | BR-004 |
| **FR-006** | Flow 2 | Quản lý Lịch biểu Lớp học & Phòng tập | Center Manager | Center Manager tạo, cập nhật, hủy thời khóa biểu lớp học, gán phòng tập và thiết lập số lượng học viên tối đa. | Must-Have | BR-005, BR-006 |
| **FR-007** | Flow 2 | Phân công HLV & Kiểm tra xung đột | Center Manager | Phân công Coach phụ trách từng buổi học; tự động cảnh báo và chặn phân công nếu Coach hoặc phòng tập bị trùng lịch. | Must-Have | BR-006 |
| **FR-008** | Flow 2 | Hội viên Đặt & Hủy lịch học | Member | Member tìm kiếm lớp theo bộ môn, thời gian, HLV và đặt chỗ/hủy đặt chỗ theo đúng chính sách thời gian. | Must-Have | BR-004, BR-005 |
| **FR-009** | Flow 2 | Lễ tân Hỗ trợ đặt lịch hộ | Receptionist | Tiếp nhận yêu cầu qua điện thoại/tại quầy, Lễ tân tra cứu hội viên và đặt/hủy lớp thay cho hội viên. | Must-Have | BR-004 |
| **FR-010** | Flow 2 | Lịch biểu cá nhân hóa (Personal Calendar) | Member, Coach | Giao diện lịch Tuần/Tháng cho Member (lớp đã đăng ký) và Coach (lịch dạy các lớp phụ trách). | Must-Have | — |
| **FR-024** | Flow 2 | Batch Job Tự động nhắc lịch tập | Hệ thống (Tự động) | Tác vụ nền chạy tự động mỗi ngày quét các lớp diễn ra trong 24 giờ tiếp theo để gửi thông báo nhắc nhở hội viên. | Must-Have | BR-004 |
| **FR-011** | Flow 3 | Thanh toán tại quầy POS & Tiền mặt | Receptionist | Lễ tân tạo đơn hàng thu tiền gói tập, ghi nhận hình thức thanh toán (tiền mặt/chuyển khoản/POS) và cập nhật tức thì trạng thái hóa đơn. | Must-Have | BR-001 |
| **FR-012** | Flow 3 | Thanh toán trực tuyến & Tự động gia hạn | Member | Tích hợp cổng thanh toán online (VNPay/MoMo/Stripe) cho phép Member thanh toán trên Web/App và đăng ký gia hạn định kỳ (Subscription). | Must-Have | BR-009 |
| **FR-013** | Flow 3 | Tự động xuất Hóa đơn điện tử PDF | Hệ thống (Tự động) | Tự động tạo tệp hóa đơn/phiếu thu PDF có mã tra cứu sau khi thanh toán thành công, hỗ trợ in tại quầy hoặc gửi qua email. | Must-Have | — |
| **FR-014** | Flow 3 | Dashboard Báo cáo & Phân tích tổng thể | Center Manager | Biểu đồ trực quan cho Center Manager: doanh thu theo ngày/tháng/năm, hội viên mới/tái tục, tỷ lệ tham gia lớp học, xếp hạng lớp học yêu thích nhất. | Must-Have | — |
| **FR-015** | Flow 3 | Batch Job Quét trạng thái gói tập hàng đêm | Hệ thống (Tự động) | Chạy tự động lúc 00:00 hàng ngày, quét toàn bộ hợp đồng gói tập và tự động chuyển trạng thái EXPIRED đối với gói quá hạn. | Must-Have | BR-001 |
| **FR-016** | Flow 4 | Check-in vào cổng tức thì | Member, Receptionist | Hội viên quét mã QR trên app hoặc xuất trình mã thẻ tại quầy; hệ thống kiểm tra quyền lợi và ghi nhận thời gian vào cổng. | Nice-to-Have | BR-007 |
| **FR-017** | Flow 4 | Điểm danh lớp học (Class Roll-call) | Coach, Receptionist | Coach hoặc Lễ tân mở danh sách học viên để tích chọn điểm danh: Có mặt, Vắng mặt, Đi muộn. Hệ thống tự động trừ buổi tập tương ứng. | Nice-to-Have | BR-008 |
| **FR-018** | Flow 4 | Soạn giáo án tập luyện cá nhân/nhóm | Coach | HLV tạo kế hoạch bài tập (tên động tác, số hiệp/set, số lần/rep, mức tạ, video hướng dẫn) và giao cho từng học viên hoặc lớp. | Nice-to-Have | — |
| **FR-019** | Flow 4 | Ghi nhận kết quả & Đánh giá buổi tập | Coach | Sau buổi tập, HLV ghi nhận mức độ hoàn thành, cập nhật chỉ số đo lường (nhịp tim, thể lực) và gửi nhận xét/dặn dò cho học viên. | Nice-to-Have | — |
| **FR-020** | Flow 4 | Biểu đồ tiến độ thể chất của Hội viên | Member | Giao diện biểu đồ đường/cột cho học viên theo dõi thay đổi cân nặng, tỷ lệ mỡ, khối lượng cơ và tần suất đi tập qua các tháng. | Nice-to-Have | — |
| **FR-021** | Flow 5 | AI Workout Recommendation Engine | Coach, Member | Dựa trên hồ sơ thể chất (chiều cao, cân nặng, BMI, mục tiêu, mức độ kinh nghiệm) và nhật ký tập luyện gần nhất, AI tự động sinh gợi ý bài tập cho ngày tập tiếp theo. | Nice-to-Have | BR-011 |
| **FR-022** | Flow 6 | Giao diện Chatbot Trợ lý ảo AI | Member | Khung chat trực tiếp trong ứng dụng cho phép học viên hỏi bằng ngôn ngữ tự nhiên về: lịch mở cửa lớp, kỹ thuật động tác, mẹo ăn uống phục hồi và chính sách phòng tập. | Nice-to-Have | BR-011 |
| **FR-025** | Flow 2 | Tìm kiếm & Lọc lớp học nâng cao | Member | Member tìm kiếm lớp học theo nhiều tiêu chí kết hợp: bộ môn, HLV, khung giờ, mức độ (cơ bản/nâng cao), phòng tập và tình trạng còn chỗ; kết quả cập nhật realtime. | Nice-to-Have | — |
| **FR-026** | Flow 2 | Quản lý khối lượng công việc HLV (Coach Workload Dashboard) | Center Manager | Center Manager xem tổng số giờ dạy, số lớp phụ trách của từng HLV theo ngày/tuần để phân công hợp lý và tránh vượt giới hạn workload. | Nice-to-Have | BR-013 |
| **FR-027** | Flow 2 | Đổi lớp học tương đương (Class Swap) | Member | Member yêu cầu đổi sang lớp học khác cùng bộ môn còn chỗ trống trong tuần mà không bị tính là hủy hoặc trừ buổi tập theo chính sách đổi lớp. | Nice-to-Have | BR-014 |
| **FR-028** | Flow 3 | Xuất báo cáo Excel/PDF theo yêu cầu | Center Manager | Center Manager xuất báo cáo doanh thu, danh sách hội viên, tỷ lệ lấp đầy lớp học ra file Excel/PDF theo khoảng thời gian tùy chọn để phục vụ họp/báo cáo. | Nice-to-Have | — |
| **FR-029** | Flow 3 | Xử lý hoàn tiền & Giao dịch trùng lặp | Receptionist, Center Manager | Cho phép Receptionist/Manager tạo yêu cầu hoàn tiền, hệ thống tự động phát hiện giao dịch thanh toán trùng lặp và đưa vào hàng chờ xác nhận trước khi hoàn tiền. | Nice-to-Have | BR-012, BR-016 |
| **FR-030** | Flow 1 | Quản lý đa chi nhánh (Multi-branch Management) | Center Manager, Member | Center Manager quản lý danh sách chi nhánh, gán quyền hạn quản trị theo chi nhánh; Member lựa chọn/đổi chi nhánh sử dụng dịch vụ theo loại gói tập. | Nice-to-Have | BR-017 |
| **FR-031** | Flow 1 | Khôi phục mật khẩu & Xác thực tài khoản | Tất cả vai trò | Cho phép người dùng đặt lại mật khẩu qua email/OTP, xác thực email khi đăng ký tài khoản mới để đảm bảo tính hợp lệ của thông tin liên hệ. | Must-Have | BR-003 |
| **FR-032** | Flow 4 | Đánh giá & Phản hồi sau buổi tập (Feedback & Rating) | Member, Center Manager | Member đánh giá chất lượng lớp học/HLV sau mỗi buổi tập (thang điểm sao + nhận xét); Center Manager tổng hợp báo cáo mức độ hài lòng theo lớp/HLV. | Nice-to-Have | — |
| **FR-033** | Flow 4 | Quản lý thiết bị & Bảo trì phòng tập | Center Manager | Center Manager quản lý danh mục thiết bị/phòng tập, ghi nhận lịch bảo trì định kỳ và đánh dấu phòng/thiết bị tạm ngưng sử dụng khi đang bảo trì. | Nice-to-Have | — |
| **FR-034** | Flow 3 | Chương trình giới thiệu hội viên (Referral Program) | Member | Member giới thiệu bạn bè đăng ký gói tập mới bằng mã giới thiệu; hệ thống tự động ghi nhận và cộng ưu đãi (buổi tập/chiết khấu) cho cả hai bên sau khi giao dịch hoàn tất. | Nice-to-Have | — |

## 4. Yêu cầu phi chức năng (Non-Functional Requirements)

| Mã NFR | Phân loại | Tiêu chuẩn kỹ thuật định lượng | Độ ưu tiên |
|---|---|---|---|
| **NFR-001** | Hiệu năng | Thời gian phản hồi giao diện & API: thao tác duyệt Web, tải danh sách dữ liệu ≤ 2.0 giây. Riêng Check-in vào cổng và thanh toán tại quầy phải phản hồi ≤ 1.0 giây. | Bắt buộc (High) |
| **NFR-002** | Hiệu năng | Tốc độ xử lý của AI: động cơ gợi ý bài tập (FR-021) và phản hồi tin nhắn đầu tiên của AI Chatbot (FR-022) phải trả kết quả trong ≤ 3.0 giây. | Trung bình (Medium) |
| **NFR-003** | Tải đồng thời | Khả năng chịu tải (Throughput): hệ thống vận hành mượt mà, không nghẽn mạng giờ cao điểm (18:00-21:00) với tải đồng thời tối thiểu 1.000 Active Users. | Bắt buộc (High) |
| **NFR-004** | Sẵn sàng | SLA đạt 99.9%: cam kết hệ thống sẵn sàng phục vụ 99.9% thời gian trong năm (ngoại trừ bảo trì được thông báo trước). | Bắt buộc (High) |
| **NFR-005** | Bảo mật | Mã hóa truyền tải và dữ liệu nhạy cảm: 100% kết nối qua HTTPS/TLS 1.3. PII và mật khẩu băm an toàn (BCrypt/Argon2). Dữ liệu thẻ/thanh toán mã hóa AES-256. | Bắt buộc (High) |
| **NFR-006** | Bảo mật | Xác thực và phân quyền (RBAC & MFA): hỗ trợ MFA cho tài khoản quản trị (Center Manager). RBAC kiểm tra token chặt chẽ trên từng API endpoint. | Bắt buộc (High) |
| **NFR-007** | An toàn mã | Phòng chống lỗ hổng bảo mật: đáp ứng OWASP Top 10 (chống SQL Injection, XSS, CSRF, IDOR). Không còn lỗ hổng High/Critical trước khi bàn giao. | Trung bình (Medium) |
| **NFR-008** | Giám sát | Giám sát hệ thống 24/7: tự động giám sát CPU/RAM/Disk và tỷ lệ lỗi API. Gửi cảnh báo qua Email/Slack khi CPU > 85% kéo dài trên 5 phút. | Bắt buộc (High) |
| **NFR-009** | Tuân thủ | Lưu trữ Audit Trail: nhật ký giao dịch tài chính, điểm danh và thay đổi quyền hạn lưu trữ an toàn tối thiểu 7 năm. | Trung bình (Medium) |
| **NFR-010** | Chuyển đổi | Thời gian gián đoạn chuyển đổi (Downtime): cung cấp công cụ chuyển đổi dữ liệu từ hệ thống cũ; downtime khi Golive tối đa ≤ 12 giờ (ban đêm). | Trung bình (Medium) |
| **NFR-011** | Mở rộng | Tự động mở rộng (Auto-scaling): hạ tầng hỗ trợ mở rộng theo chiều ngang khi tải CPU vượt quá 70%. | Trung bình (Medium) |
| **NFR-012** | Kiến trúc | Hỗ trợ chuỗi nhiều cơ sở (Multi-branch/Multi-tenant): DB và backend sẵn sàng tách biệt dữ liệu theo chi nhánh, dễ mở rộng chuỗi mà không sửa code. | Trung bình (Medium) |
| **NFR-013** | Khả dụng (Usability) | Giao diện responsive, tương thích trình duyệt Chrome/Safari/Edge phiên bản mới nhất và màn hình từ 360px (mobile) đến 1920px (desktop). Thao tác chính (đặt lịch, check-in) không quá 3 bước. | Trung bình (Medium) |
| **NFR-014** | Đa ngôn ngữ (Localization) | Giao diện hỗ trợ tối thiểu 2 ngôn ngữ (Tiếng Việt, Tiếng Anh); định dạng ngày/giờ/tiền tệ hiển thị theo chuẩn địa phương (VNĐ, dd/mm/yyyy). | Thấp (Low) |
| **NFR-015** | Sao lưu & Phục hồi (Backup & Recovery) | Dữ liệu được sao lưu tự động hàng ngày; Recovery Point Objective (RPO) ≤ 24 giờ và Recovery Time Objective (RTO) ≤ 4 giờ trong trường hợp sự cố hệ thống. | Bắt buộc (High) |
| **NFR-016** | Khả năng bảo trì (Maintainability) | Mã nguồn tuân thủ coding convention thống nhất, có tài liệu API (Swagger/OpenAPI) đầy đủ; độ phủ unit test tối thiểu 70% cho các module nghiệp vụ cốt lõi (thanh toán, đặt lịch). | Trung bình (Medium) |
| **NFR-017** | Khả năng tương tác (Interoperability) | Cổng thanh toán (VNPay/MoMo/Stripe) và dịch vụ email/SMS bên thứ ba phải có SLA phản hồi ≤ 5 giây; hệ thống có cơ chế retry và ghi log khi bên thứ ba gián đoạn. | Trung bình (Medium) |
| **NFR-018** | Giới hạn truy cập API (Rate Limiting) | API công khai (đặt lịch, tra cứu lớp học) giới hạn tối đa 100 request/phút/IP để chống lạm dụng và tấn công từ chối dịch vụ (DDoS) ở tầng ứng dụng. | Trung bình (Medium) |

## 5. Mô hình dữ liệu cốt lõi (Core Data Models)

**Sơ đồ quan hệ (rút gọn):**

```
[User] 1 ─────────── n [MemberPackage] n ──────── 1 [PackagePlan]
  │                           │
  ├─────── n [Booking] n ──── 1 [ClassSchedule] 1 ─── 1 [ClassProgram]
  │                           │
  ├─────── n [Attendance] ────┘
  ├─────── n [Invoice]
  └─────── n [WorkoutPlan] 1 ─ n [WorkoutDetail]
```

### 5.1. Bảng Users (Người dùng hệ thống)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID / INT | PK | Khóa chính tự sinh |
| `member_code` | VARCHAR(20) | UNIQUE, NULL | Mã thẻ hội viên (VD: MEM-2026-001) |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Email đăng nhập |
| `password_hash` | VARCHAR(500) | NOT NULL | Mật khẩu băm (BCrypt) |
| `full_name` | VARCHAR(150) | NOT NULL | Họ và tên |
| `phone_number` | VARCHAR(20) | NOT NULL | Số điện thoại liên hệ |
| `role` | VARCHAR(30) | NOT NULL | MANAGER, COACH, RECEPTIONIST, MEMBER |
| `is_active` | BOOLEAN | DEFAULT TRUE | Trạng thái hoạt động của tài khoản |
| `created_at` | TIMESTAMP | DEFAULT UTC_NOW | Thời điểm tạo tài khoản |

### 5.2. Bảng PackagePlans (Danh mục gói tập)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID / INT | PK | Khóa chính |
| `plan_name` | VARCHAR(100) | NOT NULL | Tên gói (VD: Gym 3 Tháng, Yoga VIP) |
| `price` | DECIMAL(18,2) | NOT NULL | Giá niêm yết (VNĐ) |
| `duration_days` | INT | NOT NULL | Thời hạn sử dụng (VD: 30, 90, 365) |
| `total_sessions` | INT | NULL | Giới hạn số buổi (NULL = không giới hạn) |
| `access_hours` | VARCHAR(50) | DEFAULT 'ALL' | Khung giờ tập (ALL, OFF_PEAK) |

### 5.3. Bảng MemberPackages (Hợp đồng gói tập của Hội viên)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID / INT | PK | Khóa chính |
| `member_id` | UUID / INT | FK, NOT NULL | Hội viên sở hữu gói |
| `plan_id` | UUID / INT | FK, NOT NULL | Thuộc loại gói nào |
| `start_date` | DATE | NOT NULL | Ngày bắt đầu hiệu lực |
| `end_date` | DATE | NOT NULL | Ngày hết hạn |
| `remaining_sessions` | INT | NULL | Số buổi còn lại |
| `status` | VARCHAR(30) | NOT NULL | ACTIVE, INACTIVE, EXPIRED, SUSPENDED |

### 5.4. Bảng ClassSchedules (Lịch mở lớp học)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID / INT | PK | Khóa chính |
| `class_name` | VARCHAR(150) | NOT NULL | Tên buổi học (VD: Zumba Sáng, Kickboxing) |
| `coach_id` | UUID / INT | FK, NOT NULL | HLV phụ trách buổi học |
| `room_name` | VARCHAR(50) | NOT NULL | Tên phòng tập / Studio |
| `start_time` | TIMESTAMP | NOT NULL | Thời gian bắt đầu |
| `end_time` | TIMESTAMP | NOT NULL | Thời gian kết thúc |
| `max_capacity` | INT | NOT NULL | Sức chứa tối đa |
| `current_bookings` | INT | DEFAULT 0 | Số người đã đặt thành công |

### 5.5. Bảng Bookings (Lịch sử đặt chỗ của hội viên)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID / INT | PK | Khóa chính |
| `schedule_id` | UUID / INT | FK, NOT NULL | Lớp học được đặt |
| `member_id` | UUID / INT | FK, NOT NULL | Hội viên đặt chỗ |
| `booking_status` | VARCHAR(30) | NOT NULL | CONFIRMED, CANCELLED, WAITLIST |
| `booked_at` | TIMESTAMP | DEFAULT UTC_NOW | Thời gian thao tác đặt |

### 5.6. Bảng Attendances (Bản ghi điểm danh & Check-in)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID / INT | PK | Khóa chính |
| `member_id` | UUID / INT | FK, NOT NULL | Hội viên tham gia |
| `schedule_id` | UUID / INT | FK, NULL | NULL nếu chỉ check-in vào cửa; có ID nếu điểm danh lớp |
| `check_in_time` | TIMESTAMP | DEFAULT UTC_NOW | Thời điểm ghi nhận |
| `status` | VARCHAR(30) | NOT NULL | ATTENDED, ABSENT, LATE |

## 6. Ma trận truy vết & Tiêu chí nghiệm thu (Acceptance Criteria)

| Mã Kiểm thử | Yêu cầu liên quan | Kịch bản kiểm thử | Kết quả kỳ vọng |
|---|---|---|---|
| **TC-MEM-01** | FR-001, FR-005, BR-003 | Lễ tân nhập thông tin hội viên mới với email đã tồn tại | Hệ thống báo lỗi trùng lặp 409 Conflict, không tạo trùng bản ghi. |
| **TC-SCH-01** | FR-006, FR-007, BR-006 | Manager xếp 1 HLV vào 2 lớp học có cùng khung giờ (18:00 - 19:30) | Hệ thống từ chối lưu và cảnh báo: "Huấn luyện viên đã có lịch dạy vào thời gian này". |
| **TC-BOK-01** | FR-008, BR-004, BR-005 | Hội viên thực hiện Booking khi lớp học đã đủ người (current_bookings = max_capacity) | Hệ thống ngăn đặt chính thức, đưa ra tùy chọn đăng ký vào danh sách chờ (WAITLIST). |
| **TC-BOK-02** | FR-008, BR-004 | Hội viên bấm hủy lớp trước giờ diễn ra 1 tiếng (Quy định là 2 tiếng) | Hệ thống thông báo hủy muộn, ghi nhận vắng mặt và trừ 1 buổi tập vào gói cước. |
| **TC-CHK-01** | FR-016, NFR-001, BR-007 | Lễ tân quét mã QR của hội viên có gói tập đã chuyển sang EXPIRED | Màn hình hiển thị cảnh báo đỏ từ chối vào cổng, thời gian phản hồi kiểm tra ≤ 1.0 giây. |
| **TC-PAY-01** | FR-011, FR-013, BR-001 | Lễ tân bấm hoàn tất thanh toán tiền mặt cho gói tập mới | Hệ thống kích hoạt gói thành viên sang ACTIVE, tự động sinh mã hóa đơn và xuất file PDF phiếu thu. |
| **TC-AI-01** | FR-021, NFR-002, BR-011 | Member gửi thông số thể chất BMI = 26, mục tiêu giảm cân | AI trả về kế hoạch tập Cardio và kiểm soát calo trong thời gian ≤ 3.0 giây, kèm khuyến nghị an toàn. |
