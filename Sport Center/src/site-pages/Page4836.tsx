const assetPathPrefix = "/assets/site/4836";
const imgRectangle = `${assetPathPrefix}/17871.png`;
const imgRectangle1 = `${assetPathPrefix}/b7626.png`;

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", true],
];

const faqItems = [
  {
    q: "Tôi có được tập thử trước khi quyết định mua gói tập không?",
    a: "Có, SportCenter luôn hỗ trợ 01 buổi tập thử MIỄN PHÍ hoàn toàn đối với bất kỳ bộ môn nào bạn yêu thích. Vui lòng đăng ký trước qua Form liên hệ.",
  },
  {
    q: "Hồ bơi của trung tâm sử dụng công nghệ lọc nước gì?",
    a: "Hệ thống bơi lội Aqua tại trung tâm sử dụng công nghệ lọc muối điện phân và điều chỉnh nhiệt độ nước thông minh theo thời tiết, hoàn toàn không gây cay mắt hay khô da.",
  },
  {
    q: "Tôi có thể bảo lưu hoặc chuyển nhượng gói tập không?",
    a: "Các gói tập từ 6 tháng trở lên đều được hỗ trợ bảo lưu từ 30-90 ngày miễn phí. Thủ tục chuyển nhượng có thể thực hiện nhanh chóng tại quầy lễ tân chi nhánh gần nhất.",
  },
  {
    q: "Tôi có được hỗ trợ bãi đỗ xe ô tô/xe máy không?",
    a: "Tất cả các chi nhánh của SportCenter đều có hầm giữ xe rộng rãi, an ninh tốt và hoàn toàn miễn phí cho hội viên trong suốt thời gian luyện tập.",
  },
];

export default function LienHeRedesign() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full">
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
            <div
              key={label}
              className="flex flex-col h-full items-center justify-center px-[16px] gap-[4px] cursor-pointer"
            >
              {active ? (
                <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[15px]">{label}</p>
              ) : (
                <p className="font-['Inter:Medium'] font-medium text-[#1e293b] text-[15px]">{label}</p>
              )}
              {active && <div className="bg-[#2563eb] h-[2px] rounded-[1px] w-[24px]" />}
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

      {/* Hero Banner */}
      <section className="bg-[#0f172a] flex flex-col gap-[16px] items-start px-[80px] py-[56px] w-full shrink-0">
        <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-full">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase">SPORTCENTER OFFICIAL</p>
        </div>
        <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[36px]">
          Liên hệ với SportCenter
        </h1>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.5] max-w-[640px]">
          Chúng tôi luôn sẵn sàng lắng nghe, tư vấn lộ trình và đồng hành cùng hành trình bứt phá năng lượng thể chất của bạn.
        </p>
      </section>

      {/* Contact Grid */}
      <section className="flex gap-[48px] items-start px-[80px] py-[64px] w-full shrink-0">
        {/* Contact Form */}
        <div className="bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.03)] flex flex-col gap-[24px] items-start flex-1 min-w-0 p-[40px] rounded-[16px]">
          <div className="flex flex-col gap-[8px] items-start w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px]">
              Gửi tin nhắn cho chúng tôi
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">
              Để lại thông tin dưới đây, chúng tôi sẽ liên hệ tư vấn trong 15 phút.
            </p>
          </div>

          <div className="flex flex-col gap-[16px] items-start w-full">
            {/* Row 1: Name + Email */}
            <div className="flex gap-[16px] items-start w-full">
              <div className="flex flex-col gap-[6px] items-start flex-1 min-w-0">
                <label className="font-['Inter:Semi_Bold'] font-semibold text-[#334155] text-[13px]">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="bg-[#f8fafc] border border-[#e2e8f0] w-full px-[16px] py-[12px] rounded-[8px] text-[#0f172a] text-[14px] font-['Inter:Regular'] font-normal outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-[6px] items-start flex-1 min-w-0">
                <label className="font-['Inter:Semi_Bold'] font-semibold text-[#334155] text-[13px]">
                  Địa chỉ Email *
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="bg-[#f8fafc] border border-[#e2e8f0] w-full px-[16px] py-[12px] rounded-[8px] text-[#0f172a] text-[14px] font-['Inter:Regular'] font-normal outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Phone + Topic */}
            <div className="flex gap-[16px] items-start w-full">
              <div className="flex flex-col gap-[6px] items-start flex-1 min-w-0">
                <label className="font-['Inter:Semi_Bold'] font-semibold text-[#334155] text-[13px]">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  className="bg-[#f8fafc] border border-[#e2e8f0] w-full px-[16px] py-[12px] rounded-[8px] text-[#0f172a] text-[14px] font-['Inter:Regular'] font-normal outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-[6px] items-start flex-1 min-w-0">
                <label className="font-['Inter:Semi_Bold'] font-semibold text-[#334155] text-[13px]">
                  Chủ đề liên hệ *
                </label>
                <select
                  defaultValue="tu-van"
                  className="bg-white border border-[#2563eb] w-full px-[16px] py-[12px] rounded-[8px] text-[#0f172a] text-[14px] font-['Inter:Medium'] font-medium outline-none focus:border-[#2563eb] transition-colors appearance-none cursor-pointer"
                >
                  <option value="tu-van">Tư vấn gói tập & ưu đãi</option>
                  <option value="tham-quan">Đặt lịch tham quan</option>
                  <option value="tap-thu">Đăng ký tập thử</option>
                  <option value="khac">Chủ đề khác</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-[6px] items-start w-full">
              <label className="font-['Inter:Semi_Bold'] font-semibold text-[#334155] text-[13px]">
                Nội dung lời nhắn
              </label>
              <textarea
                rows={5}
                placeholder="Tôi muốn đăng ký tập thử bộ môn Yoga và nhận báo giá các gói tập năm 2026..."
                className="bg-[#f8fafc] border border-[#e2e8f0] w-full px-[16px] py-[16px] rounded-[8px] text-[#0f172a] text-[14px] font-['Inter:Regular'] font-normal outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] transition-colors resize-none"
              />
            </div>
          </div>

          <button className="bg-[#10b981] flex items-center justify-center w-full px-[32px] py-[14px] rounded-[8px] cursor-pointer hover:bg-[#059669] transition-colors">
            <p className="font-['Inter:Bold'] font-bold text-white text-[15px]">Gửi tin nhắn ngay</p>
          </button>
        </div>

        {/* Contact Info Column */}
        <div className="flex flex-col gap-[24px] items-start w-[440px] shrink-0">
          {/* Address Card */}
          <div className="bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.03)] flex flex-col gap-[16px] items-start p-[24px] rounded-[16px] w-full">
            <div className="flex gap-[12px] items-center">
              <div className="bg-[#eff6ff] flex items-center justify-center rounded-[8px] size-[40px] shrink-0">
                <span className="text-[20px]">📍</span>
              </div>
              <div className="flex flex-col gap-[2px] items-start">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[13px] uppercase">TRỤ SỞ CHÍNH</p>
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px]">Chi nhánh Quận 10</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh.
            </p>
            <div className="h-[120px] rounded-[8px] w-full relative overflow-hidden">
              <img alt="Bản đồ chi nhánh Quận 10" className="absolute inset-0 object-cover size-full max-w-none" src={imgRectangle} />
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.03)] flex flex-col gap-[16px] items-start p-[24px] rounded-[16px] w-full">
            <div className="flex gap-[12px] items-center">
              <div className="bg-[rgba(16,185,129,0.1)] flex items-center justify-center rounded-[8px] size-[40px] shrink-0">
                <span className="text-[20px]">📞</span>
              </div>
              <div className="flex flex-col gap-[2px] items-start">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[13px] uppercase">KẾT NỐI NHANH</p>
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px]">Hotline & Hỗ trợ</p>
              </div>
            </div>
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[15px]">
                Điện thoại: <span className="text-[#2563eb]">1900 6868</span>
              </p>
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[15px]">
                Email: <span className="text-[#2563eb]">support@sportcenter.vn</span>
              </p>
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.03)] flex flex-col gap-[16px] items-start p-[24px] rounded-[16px] w-full">
            <div className="flex gap-[12px] items-center">
              <div className="bg-[#fffbeb] flex items-center justify-center rounded-[8px] size-[40px] shrink-0">
                <span className="text-[20px]">🕐</span>
              </div>
              <div className="flex flex-col gap-[2px] items-start">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[13px] uppercase">THỜI GIAN</p>
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px]">Giờ mở cửa trung tâm</p>
              </div>
            </div>
            <div className="flex flex-col gap-[4px] items-start w-full">
              <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[15px]">06:00 — 22:00</p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
                Phục vụ liên tục kể cả Thứ 7, Chủ Nhật & ngày Lễ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[450px] w-full shrink-0 relative overflow-hidden">
        <img
          alt="Bản đồ SportCenter"
          className="absolute inset-0 object-cover size-full max-w-none"
          src={imgRectangle1}
        />
      </section>

      {/* FAQ Section */}
      <section className="bg-white flex flex-col gap-[40px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-center w-full">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[28px]">
            Câu hỏi phổ biến
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px]">
            Giải đáp nhanh các thắc mắc thường gặp từ hội viên mới
          </p>
        </div>
        <div className="flex flex-col gap-[16px] items-start w-full">
          {faqItems.map(({ q, a }, i) => (
            <div key={i} className="bg-[#f8fafc] flex flex-col gap-[12px] items-start p-[20px] rounded-[12px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] flex-1 min-w-0 pr-[16px]">{q}</p>
                <span className="text-[#94a3b8] text-[18px] shrink-0">▾</span>
              </div>
              <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[14px] leading-[1.5] w-full">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] items-start w-[360px]">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px]">
                <span className="text-white font-extrabold text-[16px]">⚡</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">
              Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.
            </p>
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
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
            </p>
            <div className="flex gap-[8px] items-center pt-[8px]">
              {["fb", "ig", "yt", "in"].map((s, i) => (
                <div
                  key={i}
                  className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] cursor-pointer hover:bg-[#10b981] transition-colors"
                >
                  <span className="text-white text-[11px] font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1e293b] flex items-center justify-between pt-[32px] w-full">
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">
            © 2026 SportCenter. Bảo lưu mọi quyền thương hiệu.
          </p>
          <div className="flex gap-[24px] items-center">
            {["Chính sách bảo mật", "Điều khoản sử dụng"].map((item) => (
              <p
                key={item}
                className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px] cursor-pointer hover:text-white transition-colors"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
