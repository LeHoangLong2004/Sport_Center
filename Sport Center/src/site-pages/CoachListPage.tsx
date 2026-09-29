const assetPathPrefix = "/assets/site/3992";
const imgCoachPortrait = `${assetPathPrefix}/a59d2.png`;
const imgRectangle = `${assetPathPrefix}/39ffe.png`;
const imgRectangle1 = `${assetPathPrefix}/1578c.png`;
const imgRectangle2 = `${assetPathPrefix}/efbfe.png`;
const imgEllipse = `${assetPathPrefix}/e075d.png`;
const imgEllipse1 = `${assetPathPrefix}/c77c6.png`;
const imgEllipse2 = `${assetPathPrefix}/0a5a3.png`;
const imgEllipse3 = `${assetPathPrefix}/13f50.png`;

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", true],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

const certTags = ["ACE Certified", "NASM PES", "CrossFit L2", "Trị liệu Thể thao"];

const coreSkills = [
  "HIIT / Tabata lộ trình cá nhân hóa",
  "Sức bền tim mạch & phục hồi",
  "Chỉnh sửa tư thế & phòng chấn thương",
  "Tư vấn dinh dưỡng theo mục tiêu",
];

const disciplines = [
  { img: imgRectangle, name: "Functional HIIT", kcal: "Đốt 700–900 kcal/buổi" },
  { img: imgRectangle1, name: "Boxing & Kickfit", kcal: "600–800 kcal/buổi" },
  { img: imgRectangle2, name: "TRX Suspension", kcal: "450–600 kcal/buổi" },
];

const scheduleRows = [
  { day: "Thứ Hai", time: "08:00–09:00", className: "HIIT Performance", type: "Functional HIIT", room: "Studio A", status: "Còn 3 chỗ", available: true },
  { day: "Thứ Tư", time: "18:30–19:30", className: "Kickfit Basic", type: "Boxing & Kickfit", room: "Arena Ring", status: "Đầy chỗ", available: false },
  { day: "Thứ Sáu", time: "08:00–09:00", className: "TRX Core Flow", type: "TRX Suspension", room: "Studio B", status: "Còn 6 chỗ", available: true },
  { day: "Thứ Bảy", time: "15:00–16:00", className: "HIIT Advanced", type: "Functional HIIT", room: "Studio A", status: "Còn 2 chỗ", available: true },
];

const testimonials = [
  { img: imgEllipse, name: "Nguyễn Minh Anh", membership: "Thành viên 6 tháng", quote: "Nhờ sự kiên nhẫn và phương pháp khoa học của Khoa, mình đã giảm được 8kg trong 3 tháng mà không cảm thấy kiệt sức." },
  { img: imgEllipse1, name: "Trần Hải Nam", membership: "Thành viên VIP", quote: "Từng tập qua nhiều PT nhưng Khoa là người huấn luyện bài bản và tận tâm nhất mình từng gặp." },
  { img: imgEllipse2, name: "Lê Thị Thu Thủy", membership: "Thành viên 1 năm", quote: "Khoa không chỉ chỉnh động tác mà còn tư vấn dinh dưỡng chi tiết giúp mình đạt mục tiêu nhanh hơn nhiều." },
  { img: imgEllipse3, name: "Phạm Quốc Bảo", membership: "Thành viên mới", quote: "Mỗi buổi tập với Khoa mình đều cảm thấy tràn đầy năng lượng và có động lực để tiếp tục." },
];

const footerServices = ["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"];
const footerLinks = ["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"];
const footerPolicies = ["Chính sách bảo mật", "Điều khoản sử dụng", "Cookie"];
const socialIcons = ["fb", "ig", "yt", "li"];

export default function HoSoHlvRedesign() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0 sticky top-0 z-50">
        <div className="flex gap-[10px] items-center">
          <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[36px]">
            <span className="text-white font-['Inter:Extra_Bold'] font-extrabold text-[14px]">⚡</span>
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
              <p className={`font-['Inter:${active ? "Bold" : "Medium"}'] font-${active ? "bold" : "medium"} text-[15px] whitespace-nowrap ${active ? "text-[#2563eb]" : "text-[#1e293b]"}`}>
                {label}
              </p>
              {active && (
                <div className="absolute bottom-0 left-[14px] bg-[#2563eb] h-[2px] rounded-[1px] w-[24px]" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-[12px] items-center">
          <div className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px] whitespace-nowrap">Đăng nhập</p>
          </div>
          <div className="bg-[#10b981] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] whitespace-nowrap">Đăng ký thành viên</p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0f172a] flex items-center gap-[64px] px-[80px] py-[80px] w-full">
        <div className="shrink-0">
          <img
            src={imgCoachPortrait}
            alt="Coach Trần Khoa"
            className="w-[480px] h-[480px] object-cover rounded-[16px]"
          />
        </div>
        <div className="flex flex-col gap-[24px] flex-1">
          <div className="inline-flex items-center bg-[#10b981] px-[14px] py-[6px] rounded-full self-start">
            <span className="font-['Inter:Bold'] font-bold text-white text-[12px] uppercase tracking-wider">
              🏆 HLV ĐƯỢC YÊU THÍCH NHẤT
            </span>
          </div>
          <div className="flex flex-col gap-[8px]">
            <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[48px] leading-tight">
              Coach Trần Khoa
            </h1>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[20px]">
              Master Trainer — Functional HIIT & Strength
            </p>
          </div>
          <div className="flex flex-wrap gap-[10px]">
            {certTags.map((tag) => (
              <span
                key={tag}
                className="border border-[#334155] font-['Inter:Medium'] font-medium text-[#94a3b8] text-[13px] px-[12px] py-[6px] rounded-[6px]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-[40px] pt-[8px]">
            {[
              { value: "7", label: "Năm kinh nghiệm" },
              { value: "500+", label: "Học viên" },
              { value: "4.9/5.0", label: "Đánh giá" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-[4px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[36px] leading-none">
                  {value}
                </p>
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white flex gap-[48px] items-start px-[80px] py-[80px] w-full">
        <div className="flex flex-col gap-[24px] flex-1">
          <div className="flex flex-col gap-[12px]">
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight">
              Triết lý huấn luyện & Sự nghiệp
            </h2>
            <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
          </div>
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[16px] leading-[1.75]">
            Với Coach Trần Khoa, mỗi học viên là một hành trình độc đáo. Anh không áp dụng một công thức cố định mà luôn cá nhân hóa từng bài tập, phù hợp với thể trạng, mục tiêu và lịch sinh hoạt của từng người.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[16px] leading-[1.75]">
            Hơn 7 năm gắn bó với nghề, Khoa đã đồng hành cùng hơn 500 học viên từ người mới bắt đầu cho đến vận động viên chuyên nghiệp, giúp họ đạt được những mục tiêu tưởng chừng bất khả thi.
          </p>
        </div>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-[20px] p-[32px] rounded-[16px] w-[360px] shrink-0">
          <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">Chuyên môn cốt lõi</h3>
          <div className="flex flex-col gap-[14px]">
            {coreSkills.map((skill) => (
              <div key={skill} className="flex gap-[12px] items-start">
                <span className="text-[#10b981] font-bold text-[16px] mt-[1px]">✓</span>
                <p className="font-['Inter:Medium'] font-medium text-[#1e293b] text-[15px] leading-[1.5]">{skill}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section className="bg-[#f8fafc] flex flex-col gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col gap-[12px] items-center">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight text-center">
            Các bộ môn Coach Trần Khoa trực tiếp giảng dạy
          </h2>
          <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
        </div>
        <div className="flex gap-[24px]">
          {disciplines.map(({ img, name, kcal }) => (
            <div key={name} className="flex flex-col rounded-[16px] overflow-hidden bg-white border border-[#e2e8f0] flex-1">
              <img src={img} alt={name} className="w-full h-[220px] object-cover" />
              <div className="flex flex-col gap-[8px] p-[24px]">
                <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">{name}</h3>
                <p className="font-['Inter:Medium'] font-medium text-[#10b981] text-[14px]">🔥 {kcal}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-white flex flex-col gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col gap-[12px] items-center">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight text-center">
            Lịch giảng dạy tuần này
          </h2>
          <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
        </div>
        <div className="rounded-[12px] overflow-hidden border border-[#e2e8f0]">
          <div className="bg-[#0f172a] flex">
            {["Thứ", "Giờ", "Lớp học", "Bộ môn", "Phòng", "Trạng thái"].map((col) => (
              <div key={col} className="flex-1 px-[20px] py-[16px]">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[13px] uppercase tracking-wider">
                  {col}
                </p>
              </div>
            ))}
          </div>
          {scheduleRows.map((row, i) => (
            <div
              key={i}
              className={`flex border-t border-[#e2e8f0] ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}
            >
              <div className="flex-1 px-[20px] py-[18px]">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[14px]">{row.day}</p>
              </div>
              <div className="flex-1 px-[20px] py-[18px]">
                <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[14px]">{row.time}</p>
              </div>
              <div className="flex-1 px-[20px] py-[18px]">
                <p className="font-['Inter:Medium'] font-medium text-[#1e293b] text-[14px]">{row.className}</p>
              </div>
              <div className="flex-1 px-[20px] py-[18px]">
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">{row.type}</p>
              </div>
              <div className="flex-1 px-[20px] py-[18px]">
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">{row.room}</p>
              </div>
              <div className="flex-1 px-[20px] py-[18px]">
                <span
                  className={`inline-block font-['Inter:Semi_Bold'] font-semibold text-[13px] px-[10px] py-[4px] rounded-full ${
                    row.available
                      ? "bg-[#d1fae5] text-[#065f46]"
                      : "bg-[#fee2e2] text-[#991b1b]"
                  }`}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f8fafc] flex flex-col gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col gap-[12px] items-center">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight text-center">
            Học viên nói gì về Coach Trần Khoa
          </h2>
          <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
        </div>
        <div className="grid grid-cols-4 gap-[24px]">
          {testimonials.map(({ img, name, membership, quote }) => (
            <div key={name} className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] p-[24px] rounded-[16px]">
              <div className="flex gap-[12px] items-center">
                <img src={img} alt={name} className="size-[48px] rounded-full object-cover shrink-0" />
                <div className="flex flex-col gap-[2px]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[15px]">{name}</p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px]">{membership}</p>
                </div>
              </div>
              <div className="flex gap-[2px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-[#f59e0b] text-[16px]">★</span>
                ))}
              </div>
              <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[14px] leading-[1.6]">
                "{quote}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f8fafc] flex flex-col items-center px-[80px] pb-[80px]">
        <div className="bg-[#0f172a] flex flex-col gap-[32px] items-center px-[64px] py-[64px] rounded-[24px] w-full">
          <div className="flex flex-col gap-[12px] items-center">
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] leading-tight text-center">
              Đặt lịch tập thử cùng Coach Trần Khoa ngay hôm nay
            </h2>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] text-center">
              Trải nghiệm 1 buổi đánh giá thể trạng miễn phí
            </p>
          </div>
          <div className="flex gap-[12px] items-center">
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              className="bg-[#1e293b] border border-[#334155] font-['Inter:Regular'] font-normal text-white text-[14px] px-[18px] py-[12px] rounded-[8px] w-[240px] placeholder:text-[#64748b] outline-none focus:border-[#10b981]"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              className="bg-[#1e293b] border border-[#334155] font-['Inter:Regular'] font-normal text-white text-[14px] px-[18px] py-[12px] rounded-[8px] w-[200px] placeholder:text-[#64748b] outline-none focus:border-[#10b981]"
            />
            <button className="bg-[#10b981] font-['Inter:Bold'] font-bold text-white text-[14px] px-[24px] py-[12px] rounded-[8px] cursor-pointer whitespace-nowrap hover:bg-[#059669] transition-colors">
              Đặt lịch tập ngay
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full shrink-0">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] items-start w-[360px]">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px]">
                <span className="text-white font-['Inter:Extra_Bold'] font-extrabold text-[16px]">⚡</span>
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
            {footerServices.map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">SportCenter</p>
            {footerLinks.map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[320px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
            </p>
            <div className="flex gap-[8px] items-center pt-[8px]">
              {socialIcons.map((s) => (
                <div
                  key={s}
                  className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] cursor-pointer hover:bg-[#10b981] transition-colors"
                >
                  <span className="text-white text-[12px] font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e293b] flex items-center justify-between pt-[32px] w-full">
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">© 2026 SportCenter. All rights reserved.</p>
          <div className="flex gap-[24px] items-center">
            {footerPolicies.map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px] cursor-pointer hover:text-white transition-colors">
                {item}
              </p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
