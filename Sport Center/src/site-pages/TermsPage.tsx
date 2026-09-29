import { useState } from "react";

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

const tocSections = [
  { id: "section-1", label: "1. Điều khoản sử dụng" },
  { id: "section-2", label: "2. Chính sách bảo mật" },
  { id: "section-3", label: "3. Chính sách hoàn tiền" },
  { id: "section-4", label: "4. Quy định phòng tập" },
  { id: "section-5", label: "5. Chính sách hủy gói" },
];

export default function ChinhSachDieuKhoanRedesign() {
  const [activeSection, setActiveSection] = useState("section-1");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0 sticky top-0 z-50">
        <div className="flex gap-[10px] items-center">
          <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[36px]">
            <span className="text-white font-extrabold text-[14px]">⚡</span>
          </div>
          <div className="flex flex-col gap-[2px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] leading-none">SPORTCENTER</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[9px] uppercase leading-none">Energy Platform</p>
          </div>
        </div>
        <div className="flex gap-[4px] h-full items-center">
          {navItems.map(([label, active]) => (
            <div key={label} className="flex flex-col h-full items-start justify-center px-[14px] py-[24px] relative cursor-pointer">
              <p className={`text-[15px] whitespace-nowrap ${active ? "font-['Inter:Bold'] font-bold text-[#2563eb]" : "font-['Inter:Medium'] font-medium text-[#1e293b]"}`}>{label}</p>
              {active && <div className="absolute bottom-0 left-[14px] bg-[#2563eb] h-[2px] rounded-[1px] w-[24px]" />}
            </div>
          ))}
        </div>
        <div className="flex gap-[12px] items-center">
          <div className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Đăng nhập</p>
          </div>
          <div className="bg-[#10b981] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px]">Đăng ký thành viên</p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#0f172a] flex flex-col gap-[16px] items-start px-[80px] py-[60px] w-full">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[36px] text-white">
          Chính sách & Điều khoản sử dụng
        </p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] w-[720px] leading-[1.6]">
          Chào mừng bạn đến với SportCenter. Vui lòng đọc kỹ các điều khoản và chính sách dưới đây để đảm bảo quyền lợi tốt nhất khi tập luyện tại hệ thống của chúng tôi.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-[48px] items-start pb-[80px] pt-[64px] px-[80px] w-full">
        {/* Sidebar Table of Contents */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[12px] items-start p-[24px] rounded-[16px] w-[280px] shrink-0 sticky top-[88px] drop-shadow-[0px_4px_6px_rgba(0,0,0,0.04)]">
          <p className="font-['Inter:Bold'] font-bold text-[#94a3b8] text-[12px] uppercase w-full">Mục lục tài liệu</p>
          <div className="flex flex-col gap-[4px] items-start w-full">
            {tocSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-start px-[16px] py-[12px] rounded-[8px] w-full text-left transition-colors cursor-pointer ${
                  activeSection === section.id
                    ? "bg-[#2563eb]"
                    : "bg-white hover:bg-[#f8fafc]"
                }`}
              >
                <p className={`flex-1 font-['Inter:Semi_Bold'] font-semibold text-[14px] leading-snug ${
                  activeSection === section.id ? "text-white" : "text-[#0f172a]"
                }`}>
                  {section.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-[48px] items-start max-w-[880px]">

          {/* Section 1 */}
          <section id="section-1" className="flex flex-col gap-[20px] items-start w-full scroll-mt-[100px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px] w-full leading-snug">
              1. Điều khoản sử dụng dịch vụ SportCenter
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">
              Bằng cách hoàn thành quá trình đăng ký tài khoản thành viên hoặc sử dụng dịch vụ tại hệ thống câu lạc bộ SportCenter, khách hàng (sau đây gọi là "Hội viên") đồng ý tuân thủ toàn bộ các điều khoản được thỏa thuận rõ ràng trong tài liệu pháp lý này.
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">Các điều khoản chính bao gồm:</p>
            <div className="flex flex-col gap-[12px] items-start pl-[20px] w-full">
              {[
                "1.1. Khách hàng cam kết có đầy đủ năng lực hành vi dân sự và đủ điều kiện thể chất để tham gia các khóa huấn luyện thể lực cường độ cao.",
                "1.2. Thẻ hội viên được cung cấp theo dạng định danh cá nhân và không được chia sẻ sử dụng chung cho nhiều người khi chưa có sự chấp thuận bằng văn bản.",
                "1.3. Khách hàng phải xuất trình mã QR cá nhân trên ứng dụng di động hoặc thẻ cứng hợp lệ mỗi lần vào cổng tại bất kỳ chi nhánh nào.",
                "1.4. SportCenter có toàn quyền thay đổi khung giờ mở cửa, lịch giảng dạy các lớp nhóm hoặc thay đổi trang thiết bị định kỳ nhằm mục đích bảo dưỡng.",
                "1.5. Mọi trường hợp cố ý phá hoại tài sản chung hoặc xúc phạm danh dự của hội viên khác sẽ bị đình chỉ tư cách tham gia tập luyện vĩnh viễn mà không hoàn phí.",
              ].map((point, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full">{point}</p>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="flex flex-col gap-[20px] items-start w-full scroll-mt-[100px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px] w-full leading-snug">
              2. Chính sách bảo mật thông tin khách hàng
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">
              Chúng tôi luôn tôn trọng quyền riêng tư của mọi khách hàng. Toàn bộ thông tin thu thập trong quá trình đăng ký, các chỉ số sức khỏe sinh học Inbody hay thông tin giao dịch tài chính đều được lưu trữ tuyệt mật.
            </p>
            <div className="flex flex-col gap-[12px] items-start pl-[20px] w-full">
              {[
                "2.1. Mục đích thu thập: Tối ưu hóa giáo án huấn luyện, kiểm soát việc check-in hợp lệ, gửi thông báo cập nhật lịch học và ưu đãi định kỳ.",
                "2.2. SportCenter cam kết tuyệt đối không bán, chia sẻ hoặc chuyển giao thông tin cá nhân cho bất kỳ bên thứ ba nào vì mục đích thương mại.",
                "2.3. Dữ liệu hình ảnh camera giám sát tại khu vực chung chỉ phục vụ công tác bảo an, đảm bảo an toàn tài sản và giải quyết tranh chấp pháp lý nếu phát sinh.",
                "2.4. Hội viên có quyền yêu cầu trích xuất dữ liệu, chỉnh sửa thông tin cá nhân hoặc yêu cầu khóa vĩnh viễn tài khoản dịch vụ bất kỳ lúc nào.",
              ].map((point, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full">{point}</p>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="flex flex-col gap-[20px] items-start w-full scroll-mt-[100px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px] w-full leading-snug">
              3. Chính sách hoàn tiền phí dịch vụ
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">
              Nhằm đảm bảo trải nghiệm dịch vụ minh bạch nhất, SportCenter áp dụng chính sách xử lý hoàn trả học phí rõ ràng đối với các trường hợp cụ thể dưới đây:
            </p>
            <div className="flex flex-col gap-[12px] items-start pl-[20px] w-full">
              {[
                "3.1. Hoàn tiền 100% trong vòng 72 giờ (3 ngày) kể từ thời điểm ký hợp đồng nếu hội viên chưa thực hiện kích hoạt sử dụng dịch vụ và chưa vào tập buổi nào.",
                "3.2. Không hỗ trợ hoàn trả chi phí đối với hợp đồng đã kích hoạt hoặc các gói khuyến mãi đặc biệt trừ trường hợp có bệnh lý nghiêm trọng không thể tiếp tục tập luyện lâu dài (có giấy xác nhận của bệnh viện chuyên khoa).",
                "3.3. Thời gian tiếp nhận và xử lý thủ tục hoàn trả kéo dài tối đa từ 7 đến 14 ngày làm việc thông qua tài khoản ngân hàng chính chủ ký kết hợp đồng ban đầu.",
              ].map((point, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full">{point}</p>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="flex flex-col gap-[20px] items-start w-full scroll-mt-[100px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px] w-full leading-snug">
              4. Quy định chung khi sinh hoạt tại phòng tập
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">
              Môi trường tập luyện văn minh đòi hỏi ý thức tự giác từ mỗi thành viên. Vui lòng tuân thủ tuyệt đối các quy định sinh hoạt sau để tạo không gian rèn luyện lành mạnh:
            </p>
            <div className="flex flex-col gap-[12px] items-start pl-[20px] w-full">
              {[
                "4.1. Trang phục: Bắt buộc mặc quần áo thể thao co giãn thoải mái và đi giày thể thao sạch sẽ, không bám đất cát từ bên ngoài vào khu vực tập.",
                "4.2. Vệ sinh: Đặt lại tạ, thảm tập và các dụng cụ khác về đúng vị trí quy định sau khi hoàn thành hiệp tập. Lau sạch mồ hôi trên máy tập bằng khăn cá nhân.",
                "4.3. Ứng xử: Không gây tiếng ồn lớn, nói tục, chửi thề hay làm ảnh hưởng tiêu cực đến sự tập trung của những hội viên xung quanh.",
                "4.4. An toàn tài sản: Vui lòng tự cất giữ tư trang quan trọng trong tủ khóa locker cá nhân. SportCenter không chịu trách nhiệm đối với bất kỳ mất mát cá nhân nào tại phòng tập.",
              ].map((point, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full">{point}</p>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="flex flex-col gap-[20px] items-start w-full scroll-mt-[100px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px] w-full leading-snug">
              5. Chính sách bảo lưu và hủy bỏ gói dịch vụ
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">
              Quy trình tạm ngưng hoạt động hoặc đơn phương chấm dứt gói tập được hướng dẫn chi tiết theo quy định sau:
            </p>
            <div className="flex flex-col gap-[12px] items-start pl-[20px] w-full">
              {[
                "5.1. Bảo lưu gói tập: Hội viên được quyền yêu cầu bảo lưu miễn phí khi gặp sự cố sức khỏe đột xuất với thời hạn linh hoạt tối đa 60 ngày mỗi chu kỳ thẻ.",
                "5.2. Chấm dứt dịch vụ trước hạn: Hội viên đơn phương chấm dứt hợp đồng sớm hơn kỳ hạn sẽ chịu phí chấm dứt tương đương 20% tổng giá trị hợp đồng còn lại.",
                "5.3. Hủy bỏ do vi phạm quy định: Trong trường hợp hội viên vi phạm nghiêm trọng nội quy phòng tập nhiều lần, ban quản trị có quyền đơn phương hủy bỏ gói tập không bồi hoàn.",
              ].map((point, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full">{point}</p>
              ))}
            </div>
          </section>

          {/* Divider & Last updated */}
          <div className="border-t border-[#e2e8f0] pt-[24px] w-full">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[14px]">Cập nhật lần cuối: 01/09/2025</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] items-start w-[360px]">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px]"><span className="text-white font-extrabold text-[16px]">⚡</span></div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[16px]">📱 Hotline: 1900 6868</p>
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">Dịch vụ nổi bật</p>
            {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">SportCenter</p>
            {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[320px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh</p>
            <div className="flex gap-[8px] items-center pt-[8px]">
              {["fb", "ig", "yt", "in"].map((s, i) => (
                <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] cursor-pointer hover:bg-[#10b981] transition-colors">
                  <span className="text-white text-[11px] font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e293b] flex items-center justify-between pt-[32px] w-full">
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">© 2026 SportCenter. All rights reserved.</p>
          <div className="flex gap-[24px] items-center">
            {["Chính sách bảo mật", "Điều khoản sử dụng", "Cookie"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px] cursor-pointer hover:text-white transition-colors">{item}</p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
