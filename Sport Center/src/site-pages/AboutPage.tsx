const assetPathPrefix = "/assets/site/4642";
const imgHeroSection = `${assetPathPrefix}/7708b.png`;
const imgRectangle = `${assetPathPrefix}/11022.png`;
const imgFrame = `${assetPathPrefix}/193e0.png`;
const imgFrame1 = `${assetPathPrefix}/fc4e2.png`;
const imgFrame2 = `${assetPathPrefix}/80c73.png`;
const imgFrame3 = `${assetPathPrefix}/72f98.png`;
const imgFrame4 = `${assetPathPrefix}/a90ba.png`;
const imgFrame5 = `${assetPathPrefix}/62488.png`;
const imgRectangle1 = `${assetPathPrefix}/e756d.png`;
const imgRectangle2 = `${assetPathPrefix}/03c1e.png`;
const imgRectangle3 = `${assetPathPrefix}/45d5c.png`;

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", true],
  ["Liên hệ", false],
];

const facilities = [
  { img: imgFrame, label: "Bể bơi Aqua Trị liệu" },
  { img: imgFrame1, label: "Không gian Gym & Strength" },
  { img: imgFrame2, label: "Studio Yoga & Thiền định" },
  { img: imgFrame3, label: "Arena HIIT Performance" },
  { img: imgFrame4, label: "Boxing & Kickfit Ring" },
  { img: imgFrame5, label: "Sân Bóng rổ Đội nhóm" },
];

const team = [
  {
    img: imgRectangle1,
    name: "Ông Đặng Thế Nam",
    title: "Giám đốc Vận hành",
    desc: "12 năm quản lý chuỗi dịch vụ thể thao cao cấp, tối ưu hóa hệ thống phòng tập và trải nghiệm hội viên.",
  },
  {
    img: imgRectangle2,
    name: "Bà Trần Minh Thư",
    title: "Trưởng Ban Đào tạo Chuyên môn",
    desc: "Chuyên gia thạc sĩ khoa học dinh dưỡng thể chất tại Úc, chịu trách nhiệm thiết kế hệ thống giáo án SportCenter.",
  },
  {
    img: imgRectangle3,
    name: "HLV. Alexander Trần",
    title: "Quản lý Đội ngũ HLV",
    desc: "Cựu vận động viên đội tuyển quốc gia chuyên nghiệp bơi lội, huấn luyện và định hướng kỹ năng sư phạm HLV.",
  },
];

const partners = [
  "Matrix Fitness",
  "Technogym",
  "InBody Global",
  "Under Armour",
  "Gatorade Partner",
];

export default function VeTrungTamRedesign() {
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

      {/* Hero */}
      <section className="relative flex flex-col gap-[24px] h-[560px] items-center justify-center p-[80px] w-full shrink-0 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute object-cover size-full max-w-none" src={imgHeroSection} />
          <div className="absolute bg-[rgba(15,23,42,0.85)] inset-0" />
        </div>
        <div className="relative bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-full">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase">
            VỀ CHÚNG TÔI - SPORTCENTER
          </p>
        </div>
        <h1 className="relative font-['Inter:Extra_Bold'] font-extrabold text-white text-[44px] leading-[1.2] text-center">
          Hệ sinh thái thể thao đa bộ môn hàng đầu
        </h1>
        <p className="relative font-['Inter:Regular'] font-normal text-[#94a3b8] text-[18px] leading-[1.6] text-center max-w-[640px]">
          Nơi hội tụ công nghệ luyện tập hiện đại, không gian sang trọng và đội ngũ chuyên gia giàu kinh nghiệm kiến tạo thể chất hoàn hảo.
        </p>
      </section>

      {/* Brand Story / Mission */}
      <section className="bg-white flex gap-[48px] items-center p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[24px] items-start flex-1 min-w-0">
          <div className="flex flex-col gap-[8px] items-start w-full">
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
              Sứ mệnh & Tầm nhìn
            </h2>
            <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
          </div>
          <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.6]">
            Được thành lập từ năm 2018, SportCenter tự hào là đơn vị tiên phong xây dựng mô hình hệ sinh thái thể thao đa bộ môn khép kín chuẩn quốc tế tại Việt Nam. Sứ mệnh của chúng tôi là truyền cảm hứng rèn luyện và bứt phá thể chất đến hàng triệu con người thông qua nền tảng Energy Platform ưu việt.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.6]">
            Chúng tôi không chỉ cung cấp máy móc thiết bị, mà còn đồng hành kiến tạo một phong cách sống mới tràn đầy năng lượng tích cực thông qua các buổi trị liệu, dinh dưỡng thể thao và giáo án bám sát thể trạng người Á Đông.
          </p>
        </div>
        <div className="flex-1 min-w-0 h-[360px] rounded-[16px] overflow-hidden relative shrink-0">
          <img alt="" className="absolute inset-0 object-cover size-full max-w-none" src={imgRectangle} />
        </div>
      </section>

      {/* Stats Showcase */}
      <section className="bg-[#0f172a] flex gap-[24px] items-stretch p-[80px] w-full shrink-0">
        {[
          { value: "2.486+", label: "Thành viên hoạt động" },
          { value: "38+ Lớp", label: "Lớp học mỗi tuần" },
          { value: "15+ HLV", label: "Huấn luyện viên chuyên nghiệp" },
          { value: "94%", label: "Khách hàng hài lòng" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="bg-[#1e293b] flex flex-col gap-[8px] items-center flex-1 min-w-0 p-[32px] rounded-[16px]"
          >
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[40px]">{value}</p>
            <p className="font-['Inter:Regular'] font-normal text-white text-[14px] text-center opacity-80">{label}</p>
          </div>
        ))}
      </section>

      {/* Facilities */}
      <section className="bg-[#f8fafc] flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Không gian luyện tập tiêu chuẩn Olympic
          </h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="flex flex-col gap-[24px] w-full">
          {([facilities.slice(0, 3), facilities.slice(3, 6)] as typeof facilities[]).map((row, ri) => (
            <div key={ri} className="flex gap-[24px] items-start w-full">
              {row.map(({ img, label }) => (
                <div
                  key={label}
                  className="relative flex-1 min-w-0 h-[280px] flex flex-col items-start justify-end overflow-hidden p-[24px] rounded-[16px]"
                >
                  <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[16px]">
                    <img alt="" className="absolute object-cover size-full max-w-none rounded-[16px]" src={img} />
                    <div className="absolute bg-[rgba(15,23,42,0.4)] inset-0 rounded-[16px]" />
                  </div>
                  <p className="relative font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px]">{label}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="bg-white flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Ban điều hành & Đội ngũ chuyên gia
          </h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {team.map(({ img, name, title, desc }) => (
            <div
              key={name}
              className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col items-start flex-1 min-w-0 overflow-hidden rounded-[16px]"
            >
              <div className="h-[260px] w-full relative shrink-0 overflow-hidden">
                <img alt={name} className="absolute inset-0 object-cover size-full max-w-none" src={img} />
              </div>
              <div className="flex flex-col gap-[12px] items-start p-[24px] w-full">
                <div className="flex flex-col gap-[2px] items-start">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px]">{name}</p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px]">{title}</p>
                </div>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-[1.5]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="bg-[#f8fafc] flex flex-col gap-[32px] items-center px-[80px] py-[64px] w-full shrink-0">
        <p className="font-['Inter:Bold'] font-bold text-[#64748b] text-[14px] uppercase text-center">
          Đối tác chiến lược & Nhà cung cấp thiết bị chính thức
        </p>
        <div className="flex items-center justify-between pt-[12px] w-full">
          {partners.map((partner) => (
            <div key={partner} className="flex gap-[10px] items-center">
              <span className="text-[#64748b] text-[18px]">🏆</span>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#64748b] text-[16px]">{partner}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#f8fafc] flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full shrink-0">
        <div className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full">
          <div className="flex flex-col gap-[12px] items-center text-center w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] w-full">
              Đặt lịch hẹn tham quan không gian thực tế ngay hôm nay
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] w-full">
              Đội ngũ tư vấn viên sẽ hướng dẫn bạn tham quan chi tiết 5 không gian chuyên biệt và nhận vé trải nghiệm hồ bơi Aqua trị liệu VIP miễn phí.
            </p>
          </div>
          <div className="flex gap-[16px] items-center w-full">
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              className="bg-[#1e293b] border border-[#334155] flex-1 min-w-0 px-[16px] py-[14px] rounded-[8px] text-white text-[14px] font-['Inter:Regular'] font-normal outline-none placeholder:text-[#94a3b8] focus:border-[#10b981] transition-colors"
            />
            <input
              type="tel"
              placeholder="Số điện thoại liên hệ"
              className="bg-[#1e293b] border border-[#334155] flex-1 min-w-0 px-[16px] py-[14px] rounded-[8px] text-white text-[14px] font-['Inter:Regular'] font-normal outline-none placeholder:text-[#94a3b8] focus:border-[#10b981] transition-colors"
            />
            <button className="bg-[#10b981] flex-1 min-w-0 flex items-center justify-center px-[24px] py-[14px] rounded-[8px] cursor-pointer hover:bg-[#059669] transition-colors">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[14px]">Đăng ký tham quan ngay</p>
            </button>
          </div>
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
