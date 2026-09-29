const assetPathPrefix = "/assets/site/5015";
const imgRectangle = `${assetPathPrefix}/396e1.png`;
const imgRectangle1 = `${assetPathPrefix}/8bfe4.png`;
const imgRectangle2 = `${assetPathPrefix}/178a3.png`;
const imgRectangle3 = `${assetPathPrefix}/e15f8.png`;
const imgRectangle4 = `${assetPathPrefix}/c6aa6.png`;
const imgRectangle5 = `${assetPathPrefix}/25d4b.png`;
const imgRectangle6 = `${assetPathPrefix}/4331b.png`;

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

const row1Cards = [
  {
    img: imgRectangle1,
    tagBg: "bg-[rgba(16,185,129,0.1)]",
    tagColor: "text-[#10b981]",
    tag: "Tin tức",
    title: "Lợi ích vượt trội từ bộ môn Mat Pilates cho nhân viên văn phòng",
    desc: "Tìm hiểu cách Mat Pilates giúp giải tỏa cơn đau mỏi vai gáy và lấy lại đường nét vóc dáng săn chắc hiệu quả chỉ sau 4 tuần.",
    date: "12/06/2025",
  },
  {
    img: imgRectangle2,
    tagBg: "bg-[#eff6ff]",
    tagColor: "text-[#2563eb]",
    tag: "Sự kiện",
    title: "Ngày hội Yoga Trị Liệu & Thiền Định: Hòa nhịp tâm trí đón bình an",
    desc: "Chuỗi workshop hướng dẫn thiền sâu kết hợp chuỗi động tác phục hồi năng lượng dưới sự dẫn dắt từ Đại sứ Yoga Alliance Ấn Độ.",
    date: "12/06/2025",
  },
  {
    img: imgRectangle3,
    tagBg: "bg-[#fffbeb]",
    tagColor: "text-[#f59e0b]",
    tag: "Hoạt động CLB",
    title: "Vinh danh Đội tuyển Bóng rổ trẻ SportCenter vô địch Giải khu vực",
    desc: "Khoảnh khắc tuyệt vời khi các tài năng trẻ U15 của câu lạc bộ xuất sắc vượt qua các đối thủ mạnh giành cúp vàng danh giá.",
    date: "12/06/2025",
  },
];

const row2Cards = [
  {
    img: imgRectangle4,
    tagBg: "bg-[rgba(16,185,129,0.1)]",
    tagColor: "text-[#10b981]",
    tag: "Tin tức",
    title: "Dinh dưỡng thông minh: Nên ăn gì trước và sau khi tập HIIT cường độ cao?",
    desc: "Thực đơn khoa học giúp bổ sung năng lượng nhanh chóng, thúc đẩy đốt mỡ và hạn chế tình trạng mệt mỏi, mất sức trong lúc tập.",
    date: "08/06/2025",
  },
  {
    img: imgRectangle5,
    tagBg: "bg-[#eff6ff]",
    tagColor: "text-[#2563eb]",
    tag: "Sự kiện",
    title: "Workshop: Kỹ thuật bơi lội an toàn và phòng chống đuối nước cho trẻ nhỏ",
    desc: "Buổi chia sẻ kiến thức thực tế cực kỳ bổ ích và thực hành trực tiếp dưới hồ dành riêng cho các bậc phụ huynh và bé U10.",
    date: "08/06/2025",
  },
  {
    img: imgRectangle6,
    tagBg: "bg-[#fffbeb]",
    tagColor: "text-[#f59e0b]",
    tag: "Hoạt động CLB",
    title: "Giao lưu Boxing nội bộ: Trải nghiệm không khí thi đấu thực thụ",
    desc: "Sự kiện thể thao dành riêng cho các thành viên lớp Kickfit trải nghiệm thử thách thi đấu bán chuyên nghiệp với trọng tài giám sát.",
    date: "08/06/2025",
  },
];

function NewsCard({
  img,
  tagBg,
  tagColor,
  tag,
  title,
  desc,
  date,
}: {
  img: string;
  tagBg: string;
  tagColor: string;
  tag: string;
  title: string;
  desc: string;
  date: string;
}) {
  return (
    <div className="bg-white flex flex-col flex-1 min-w-0 overflow-hidden rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.03)]">
      <div className="h-[200px] w-full overflow-hidden">
        <img alt={title} className="w-full h-full object-cover" src={img} />
      </div>
      <div className="flex flex-col gap-[16px] items-start p-[24px] w-full">
        <span className={`${tagBg} ${tagColor} font-['Inter:Bold'] font-bold text-[11px] px-[10px] py-[4px] rounded-full`}>
          {tag}
        </span>
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] leading-[1.4]">{title}</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">{desc}</p>
        <div className="border-t border-[#e2e8f0] pt-[16px] flex items-center justify-between w-full">
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[12px]">{date}</p>
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px] cursor-pointer">Đọc bài viết →</p>
        </div>
      </div>
    </div>
  );
}

export default function TinTucSuKienRedesign() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full sticky top-0 z-50">
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
              className="flex flex-col h-full items-start justify-center px-[14px] py-[24px] relative cursor-pointer"
            >
              <p className={`text-[15px] whitespace-nowrap ${active ? "font-['Inter:Bold'] font-bold text-[#2563eb]" : "font-['Inter:Medium'] font-medium text-[#1e293b]"}`}>
                {label}
              </p>
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

      {/* Hero Banner */}
      <section className="bg-[#0f172a] flex flex-col gap-[16px] items-start px-[80px] py-[56px] w-full">
        <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-full">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase">SPORTCENTER OFFICIAL</p>
        </div>
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[36px] leading-[1.2]">Tin tức &amp; Sự kiện</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.5] max-w-[640px]">
          Cập nhật nhanh nhất các hoạt động thể thao, giải đấu nội bộ, chương trình ưu đãi hội viên và kiến thức sức khỏe bổ ích từ chuyên gia.
        </p>
      </section>

      {/* Filter + Search */}
      <div className="flex items-center justify-between pb-[16px] pt-[32px] px-[80px] w-full">
        <div className="flex gap-[8px] items-center">
          {[
            { label: "Tất cả", active: true },
            { label: "Tin tức", active: false },
            { label: "Sự kiện", active: false },
            { label: "Hoạt động CLB", active: false },
          ].map(({ label, active }) => (
            <button
              key={label}
              className={`font-['Inter:Semi_Bold'] font-semibold text-[14px] px-[20px] py-[10px] rounded-full cursor-pointer border transition-colors ${
                active
                  ? "bg-[#2563eb] text-white border-transparent"
                  : "bg-white text-[#334155] border-[#e2e8f0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="bg-white border border-[#e2e8f0] flex gap-[10px] items-center px-[16px] py-[10px] rounded-[8px] w-[320px]">
          <span className="text-[#94a3b8] text-[16px]">🔍</span>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">Tìm kiếm tin tức...</p>
        </div>
      </div>

      {/* Featured Article */}
      <section className="flex items-start pb-[32px] pt-[16px] px-[80px] w-full">
        <div className="bg-white flex flex-1 items-start min-w-0 overflow-hidden rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.03)]">
          <div className="h-[400px] w-[640px] shrink-0 overflow-hidden">
            <img alt="Giải Bơi Lội Mùa Hè 2025" className="w-full h-full object-cover" src={imgRectangle} />
          </div>
          <div className="flex flex-col gap-[24px] items-start justify-center flex-1 min-w-0 p-[48px] self-stretch">
            <div className="flex flex-col gap-[12px] items-start w-full">
              <span className="bg-[#fef2f2] font-['Inter:Bold'] font-bold text-[#ef4444] text-[12px] px-[10px] py-[4px] rounded-full">
                SỰ KIỆN NỔI BẬT
              </span>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[28px] leading-[1.3]">
                Giải Bơi Lội Mùa Hè 2025 tại SportCenter — Cơ hội khẳng định tài năng bứt phá
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[15px] leading-[1.5]">
                Giải đấu bơi lội thường niên lớn nhất dành riêng cho các hội viên và học viên tài năng của SportCenter đã chính thức mở cổng đăng ký từ hôm nay. Cơ cấu giải thưởng cực kỳ hấp dẫn lên tới 50 triệu đồng.
              </p>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-[8px] items-center">
                <span className="text-[#94a3b8] text-[14px]">📅</span>
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">Đăng ngày: 15/06/2025</p>
              </div>
              <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[15px] cursor-pointer">Đọc thêm →</p>
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="flex flex-col gap-[32px] items-start pb-[48px] pt-[16px] px-[80px] w-full">
        <div className="flex gap-[24px] items-stretch w-full">
          {row1Cards.map((card) => (
            <NewsCard key={card.title} {...card} />
          ))}
        </div>
        <div className="flex gap-[24px] items-stretch w-full">
          {row2Cards.map((card) => (
            <NewsCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* Pagination */}
      <div className="flex gap-[8px] items-center justify-center pb-[64px] w-full">
        {[
          { label: "<", active: false },
          { label: "1", active: true },
          { label: "2", active: false },
          { label: "3", active: false },
          { label: ">", active: false },
        ].map(({ label, active }) => (
          <button
            key={label}
            className={`flex items-center justify-center rounded-[8px] size-[40px] cursor-pointer border text-[14px] transition-colors ${
              active
                ? "bg-[#2563eb] text-white font-['Inter:Bold'] font-bold border-transparent"
                : "bg-white text-[#334155] font-['Inter:Semi_Bold'] font-semibold border-[#e2e8f0]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Newsletter */}
      <div className="flex flex-col items-start pb-[80px] px-[80px] w-full">
        <div className="bg-[#eff6ff] flex items-center justify-between p-[48px] rounded-[16px] w-full">
          <div className="flex flex-col gap-[8px] items-start w-[480px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#2563eb] text-[22px]">
              Đăng ký nhận ưu đãi &amp; cẩm nang luyện tập
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[14px] leading-[1.5]">
              Chúng tôi hứa chỉ gửi những bài viết thực sự chất lượng và thông tin khuyến mãi hữu ích nhất.
            </p>
          </div>
          <div className="flex gap-[12px] items-center">
            <div className="bg-white border border-[#e2e8f0] flex items-center px-[16px] py-[12px] rounded-[8px] w-[300px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">Nhập địa chỉ email của bạn</p>
            </div>
            <button className="bg-[#2563eb] flex items-center px-[24px] py-[12px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Bold'] font-bold text-white text-[14px]">Đăng ký ngay</p>
            </button>
          </div>
        </div>
      </div>

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
                <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] cursor-pointer hover:bg-[#10b981] transition-colors">
                  <span className="text-white text-[11px] font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e293b] flex items-center justify-between pt-[32px] w-full">
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">© 2026 SportCenter. Bảo lưu mọi quyền thương hiệu.</p>
          <div className="flex gap-[24px] items-center">
            {["Chính sách bảo mật", "Điều khoản sử dụng"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px] cursor-pointer hover:text-white transition-colors">{item}</p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
