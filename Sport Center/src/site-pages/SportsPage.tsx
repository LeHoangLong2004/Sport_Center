const assetPathPrefix = "/assets";

const imgSportSwim = `${assetPathPrefix}/cfb22.png`;
const imgSportYoga = `${assetPathPrefix}/88bba.png`;
const imgSportHiit = `${assetPathPrefix}/e865e.png`;
const imgSportBoxing = `${assetPathPrefix}/252a5.png`;
const imgSportBasket = `${assetPathPrefix}/3c386.png`;
const imgCoach1 = `${assetPathPrefix}/336c1.png`;
const imgCoach2 = `${assetPathPrefix}/94995.png`;
const imgCoach3 = `${assetPathPrefix}/c8fd9.png`;
const imgCoach4 = `${assetPathPrefix}/bd2c1.png`;
const imgZap = `${assetPathPrefix}/b0e9c.svg`;
const imgDroplets = `${assetPathPrefix}/6fa21.svg`;
const imgFlame = `${assetPathPrefix}/d478f.svg`;
const imgCircleX = `${assetPathPrefix}/2fbc6.svg`;
const imgDumbbell = `${assetPathPrefix}/510f5.svg`;
const imgFlame1 = `${assetPathPrefix}/cc26f.svg`;
const imgDumbbell1 = `${assetPathPrefix}/79907.svg`;
const imgFlower2 = `${assetPathPrefix}/ae280.svg`;
const imgChevronDown = `${assetPathPrefix}/bb97c.svg`;
const imgZapFooter = `${assetPathPrefix}/63873.svg`;
const imgSmartphone = `${assetPathPrefix}/669da.svg`;
const imgFacebook = `${assetPathPrefix}/0e500.svg`;
const imgInstagram = `${assetPathPrefix}/1bab9.svg`;
const imgVideo = `${assetPathPrefix}/c50cd.svg`;
const imgLinkedin = `${assetPathPrefix}/650a2.svg`;

const navItems = [
  "Trang chủ",
  "Bộ môn",
  "Lớp học",
  "Huấn luyện viên",
  "Gói tập",
  "Về chúng tôi",
  "Liên hệ",
];

const filterTags = [
  { label: "Tất cả bộ môn", active: true },
  { label: "Đốt mỡ & Tăng cơ", active: false },
  { label: "Dẻo dai & Thư giãn", active: false },
  { label: "Dành cho Trẻ em", active: false },
  { label: "Dành cho Người mới bắt đầu", active: false },
];

const sportsTop = [
  {
    img: imgSportSwim,
    badge: "12 lớp tuần này",
    icon: imgDroplets,
    title: "Bơi lội & Aqua Fitness",
    desc: "Tăng dung tích phổi, giảm áp lực xương khớp, rèn luyện tim mạch toàn diện",
    stat: "Đốt 500-750 kcal/buổi • Mọi trình độ",
  },
  {
    img: imgSportYoga,
    badge: "16 lớp tuần này",
    icon: imgCircleX,
    title: "Yoga & Mat Pilates",
    desc: "Chỉnh sửa tư thế cột sống, cải thiện dẻo dai, kết hợp thiền định giải tỏa stress",
    stat: "Đốt 300-500 kcal/buổi • Mọi trình độ",
  },
  {
    img: imgSportHiit,
    badge: "20 lớp tuần này",
    icon: imgDumbbell,
    title: "Functional HIIT & Strength",
    desc: "Đốt mỡ thừa tối ưu kéo dài 24h sau tập, xây dựng cơ bắp săn chắc vững vàng",
    stat: "Đốt 600-900 kcal/buổi • Trung cấp trở lên",
  },
];

const sportsBottom = [
  {
    img: imgSportBoxing,
    badge: "15 lớp tuần này",
    icon: imgCircleX,
    title: "Boxing & Kickfit",
    desc: "Rèn luyện phản xạ, xả stress cường độ cao, tăng cường thăng bằng và sức mạnh thân trên",
    stat: "Đốt 700-1000 kcal/buổi • Có lớp cơ bản",
  },
  {
    img: imgSportBasket,
    badge: "8 lớp tuần này",
    icon: imgCircleX,
    title: "Bóng rổ & Thể thao Đội nhóm",
    desc: "Tăng chiều cao tự nhiên, cải thiện phản xạ nhanh, nâng cao tinh thần đồng đội",
    stat: "Đốt 500-800 kcal/buổi • Mọi trình độ",
  },
];

const goals = [
  {
    icon: imgFlame1,
    title: "Giảm mỡ & Định hình vóc dáng",
    sub: "Tiêu hao 600+ calo/buổi",
    desc: "Gói bài tập tập trung đẩy nhịp tim, tối ưu hóa quá trình đốt mỡ thừa cơ thể ngay cả sau khi kết thúc buổi tập.",
    suggest: "Đề xuất: HIIT, Boxing, Bơi lội",
  },
  {
    icon: imgDumbbell1,
    title: "Tăng cơ & Sức mạnh cốt lõi",
    sub: "Tối ưu hóa sợi cơ & sức bền",
    desc: "Kích thích sinh cơ học, tăng mật độ xương và củng cố toàn bộ nhóm cơ lõi trung tâm giúp cơ thể vững vàng.",
    suggest: "Đề xuất: Gym, Free Weights, TRX",
  },
  {
    icon: imgFlower2,
    title: "Cân bằng & Phục hồi cơ thể",
    sub: "Giảm căng cơ, cải thiện ngủ sâu",
    desc: "Xoa dịu hệ thần kinh, giải tỏa chấn thương cơ bắp, điều hòa hơi thở sâu nuôi dưỡng tái tạo tế bào cơ thể.",
    suggest: "Đề xuất: Yoga, Pilates, Sauna",
  },
];

const coaches = [
  { img: imgCoach1, name: "HLV. Alexander Trần", spec: "Bơi lội & Trị liệu Aqua", desc: "Chứng chỉ Cứu hộ Quốc tế ILS, 10 năm kinh nghiệm đội tuyển" },
  { img: imgCoach2, name: "HLV. Minh Thư", spec: "Yoga & Trị liệu Cột sống", desc: "Chứng chỉ Ashtanga Yoga Alliance 500H tại Ấn Độ" },
  { img: imgCoach3, name: "HLV. Marcus Đặng", spec: "Strength & HIIT Performance", desc: "Chứng nhận Huấn luyện viên cá nhân NASM-CPT Hoa Kỳ" },
  { img: imgCoach4, name: "HLV. Hoàng Kim", spec: "Boxing & Kickfit", desc: "Cựu vận động viên Boxing quốc gia, Chứng chỉ võ thuật WBA" },
];

function Navbar({ active }: { active: string }) {
  return (
    <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0 sticky top-0 z-50">
      <div className="flex gap-[10px] items-center shrink-0" data-name="logo-group">
        <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[36px] shrink-0">
          <img alt="" src={imgZap} style={{ width: 20, height: 20 }} />
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] leading-none">SPORTCENTER</p>
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[9px] uppercase leading-none">Energy Platform</p>
        </div>
      </div>
      <div className="flex gap-[4px] h-full items-center">
        {navItems.map((label) => {
          const isActive = label === active;
          return (
            <div
              key={label}
              className="flex flex-col h-full items-start justify-center px-[16px] py-[24px] relative shrink-0 cursor-pointer"
              data-name={`menu-item-${label}`}
            >
              <p className={`font-['Inter:${isActive ? "Bold" : "Medium"}'] font-${isActive ? "bold" : "medium"} text-[15px] whitespace-nowrap ${isActive ? "text-[#2563eb]" : "text-[#1e293b]"}`}>
                {label}
              </p>
              {isActive && <div className="absolute bottom-0 left-[16px] bg-[#2563eb] h-[2px] rounded-[1px] w-[24px]" />}
            </div>
          );
        })}
      </div>
      <div className="flex gap-[12px] items-center shrink-0">
        <div className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer" data-name="btn-login">
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px] whitespace-nowrap">Đăng nhập</p>
        </div>
        <div className="bg-[#10b981] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer" data-name="btn-register">
          <p className="font-['Inter:Bold'] font-bold text-white text-[14px] whitespace-nowrap">Đăng ký thành viên</p>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full shrink-0">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col gap-[24px] items-start w-[360px]">
          <div className="flex gap-[10px] items-center shrink-0" data-name="logo-group-footer">
            <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px] shrink-0">
              <img alt="" src={imgZapFooter} style={{ width: 24, height: 24 }} />
            </div>
            <div className="flex flex-col gap-[2px] items-start">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase leading-none">Energy Platform</p>
            </div>
          </div>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6] w-full">
            Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.
          </p>
          <div className="flex gap-[8px] items-center">
            <img alt="" src={imgSmartphone} style={{ width: 16, height: 16 }} />
            <p className="font-['Inter:Bold'] font-bold text-white text-[16px] whitespace-nowrap">Hotline: 1900 6868</p>
          </div>
        </div>
        <div className="flex flex-col gap-[16px] items-start w-[200px]">
          <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Dịch vụ nổi bật</p>
          {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((s) => (
            <p key={s} className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{s}</p>
          ))}
        </div>
        <div className="flex flex-col gap-[16px] items-start w-[200px]">
          <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">SportCenter</p>
          {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((s) => (
            <p key={s} className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{s}</p>
          ))}
        </div>
        <div className="flex flex-col gap-[16px] items-start w-[320px]">
          <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
            Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
          </p>
          <div className="flex gap-[12px] items-start pt-[8px]">
            {[imgFacebook, imgInstagram, imgVideo, imgLinkedin].map((icon, i) => (
              <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] shrink-0">
                <img alt="" src={icon} style={{ width: 18, height: 18 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[#1e293b] w-full" />
      <div className="flex items-center justify-between w-full">
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">© 2026 SportCenter. Bảo lưu mọi quyền thương hiệu.</p>
        <div className="flex gap-[24px] items-start" data-name="policy-links">
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] cursor-pointer hover:text-white">Chính sách bảo mật</p>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] cursor-pointer hover:text-white">Điều khoản sử dụng</p>
        </div>
      </div>
    </footer>
  );
}

function SportCard({ img, badge, icon, title, desc, stat, tall }: {
  img: string; badge: string; icon: string; title: string; desc: string; stat: string; tall?: boolean;
}) {
  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-clip rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)]">
      <div className="relative w-full shrink-0" style={{ height: tall ? 220 : 200 }}>
        <img alt={title} className="absolute inset-0 object-cover size-full max-w-none" src={img} />
        <div className="absolute bg-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] left-[16px] top-[16px]">
          <p className="font-['Inter:Bold'] font-bold text-white text-[12px] whitespace-nowrap">{badge}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[16px] items-start p-[24px] w-full">
        <div className="flex gap-[12px] items-center w-full">
          <div className="bg-[#eff6ff] flex items-center justify-center rounded-[8px] size-[36px] shrink-0">
            <img alt="" src={icon} style={{ width: 20, height: 20 }} />
          </div>
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{title}</p>
        </div>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] h-[64px] overflow-hidden">{desc}</p>
        <div className="border-t border-[#e2e8f0] w-full" />
        <div className="flex gap-[8px] items-center w-full">
          <img alt="" src={imgFlame} style={{ width: 16, height: 16 }} />
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[13px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{stat}</p>
        </div>
        <div className="flex gap-[4px] items-center cursor-pointer" data-name="btn-sport-detail">
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px] whitespace-nowrap">Xem lịch tập & Chi tiết môn</p>
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px]">→</p>
        </div>
      </div>
    </div>
  );
}

export default function BoMonPage() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Navbar active="Bộ môn" />

      {/* Hero Banner */}
      <div className="bg-[#0f172a] flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <div className="flex flex-col gap-[16px] items-start w-full">
          <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px]">
            <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase whitespace-nowrap">
              HỆ SINH THÁI THỂ THAO ĐA BỘ MÔN
            </p>
          </div>
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[44px] leading-[1.2] w-full max-w-[720px]">
            Chọn chuyển động phù hợp với cơ thể bạn
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.6] max-w-[640px]">
            Khám phá 5 bộ môn thể thao tiêu chuẩn quốc tế với giáo án tối ưu theo thể trạng và mục tiêu rèn luyện cá nhân.
          </p>
        </div>
        <div className="flex flex-wrap gap-[12px] items-start w-full">
          {filterTags.map(({ label, active }) => (
            <div
              key={label}
              className={`flex items-center px-[20px] py-[12px] rounded-[100px] cursor-pointer ${
                active
                  ? "bg-[#2563eb]"
                  : "bg-[rgba(30,41,59,0.2)] border border-[#334155]"
              }`}
            >
              <p className="font-['Inter:Semi_Bold'] font-semibold text-white text-[14px] whitespace-nowrap">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Sports Grid */}
      <div className="bg-[#f8fafc] flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">5 Không gian luyện tập chuyên biệt</p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {sportsTop.map((s) => (
            <SportCard key={s.title} {...s} />
          ))}
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {sportsBottom.map((s) => (
            <SportCard key={s.title} {...s} tall />
          ))}
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">Bạn muốn đạt được điều gì?</p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="flex gap-[24px] items-stretch w-full">
          {goals.map((g) => (
            <div key={g.title} className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[32px] rounded-[16px]">
              <div className="flex gap-[16px] items-center w-full">
                <div className="bg-[#ecfdf5] flex items-center justify-center rounded-[12px] size-[48px] shrink-0">
                  <img alt="" src={g.icon} style={{ width: 24, height: 24 }} />
                </div>
                <div className="flex flex-col gap-[2px] items-start flex-1 min-w-0">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] w-full">{g.title}</p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[13px] whitespace-nowrap">{g.sub}</p>
                </div>
              </div>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] h-[68px] overflow-hidden">{g.desc}</p>
              <div className="bg-[#eff6ff] flex items-start px-[12px] py-[8px] rounded-[8px] w-full">
                <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px] flex-1 min-w-0">{g.suggest}</p>
              </div>
              <div className="flex gap-[6px] items-center cursor-pointer pt-[8px]">
                <p className="font-['Inter:Bold'] font-bold text-[#059669] text-[14px]">Xem lộ trình mẫu</p>
                <p className="font-['Inter:Bold'] font-bold text-[#059669] text-[14px]">→</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaches Section */}
      <div className="bg-[#f8fafc] flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">Được hướng dẫn bởi các Huấn luyện viên hàng đầu</p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {coaches.map((c) => (
            <div key={c.name} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-clip rounded-[16px]">
              <div className="relative h-[260px] w-full shrink-0">
                <img alt={c.name} className="absolute inset-0 object-cover size-full max-w-none" src={c.img} />
              </div>
              <div className="flex flex-col gap-[12px] items-start p-[20px] w-full">
                <div className="flex flex-col gap-[4px] items-start w-full">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] w-full">{c.name}</p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px] w-full">{c.spec}</p>
                </div>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-[1.4] h-[54px] overflow-hidden w-full">{c.desc}</p>
                <div className="border border-[#2563eb] flex items-center justify-center px-[16px] py-[10px] rounded-[8px] w-full cursor-pointer" data-name="btn-coach-schedule">
                  <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px] whitespace-nowrap">Xem lịch dạy của HLV</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-[#f8fafc] flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full shrink-0">
        <div className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full">
          <div className="flex flex-col gap-[12px] items-start text-center w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] w-full">
              Trải nghiệm tập thử miễn phí 01 buổi bộ môn bạn yêu thích
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] w-full">
              Để lại thông tin, đội ngũ tư vấn sẽ thiết kế buổi trải nghiệm chuẩn quốc tế dành riêng cho bạn.
            </p>
          </div>
          <div className="flex gap-[16px] items-center w-full">
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-start min-w-0 px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] flex-1 min-w-0">Họ và tên của bạn</p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-start min-w-0 px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] flex-1 min-w-0">Số điện thoại liên hệ</p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-center justify-between min-w-0 px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-white text-[14px] flex-1 min-w-0">Chọn bộ môn muốn thử</p>
              <img alt="" src={imgChevronDown} style={{ width: 16, height: 16 }} />
            </div>
            <div className="bg-[#10b981] flex flex-1 items-center justify-center min-w-0 px-[24px] py-[14px] rounded-[8px] cursor-pointer" data-name="btn-submit">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[14px] whitespace-nowrap">Nhận vé tập thử ngay</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
