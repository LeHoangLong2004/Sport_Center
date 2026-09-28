const a4642 = "/assets/site/4642";
const a3992 = "/assets/site/3992";
const a5634 = "/assets/site/5634";

const imgHeroBg = `${a4642}/7708b.png`;
const imgAboutPhoto = `${a4642}/11022.png`;
const imgClass1 = `${a4642}/193e0.png`;
const imgClass2 = `${a4642}/fc4e2.png`;
const imgClass3 = `${a4642}/80c73.png`;
const imgClass4 = `${a4642}/72f98.png`;
const imgSport1 = `${a5634}/53742.png`;
const imgSport2 = `${a5634}/50d66.png`;
const imgSport3 = `${a5634}/1b1ce.png`;
const imgSport4 = `${a5634}/70fa4.png`;
const imgSport5 = `${a5634}/c8171.png`;
const imgSport6 = `${a5634}/15dd2.png`;
const imgTrainer1 = `${a3992}/e075d.png`;
const imgTrainer2 = `${a3992}/c77c6.png`;
const imgTrainer3 = `${a3992}/0a5a3.png`;
const imgTrainer4 = `${a3992}/13f50.png`;
const imgZap = `${a3992}/e1f77.svg`;
const imgZapFooter = `${a4642}/4e22a.svg`;
const imgStar = `${a3992}/49fac.svg`;
const imgFlame = `${a3992}/1d59c.svg`;
const imgSmartphone = `${a4642}/f8c94.svg`;
const imgFacebook = `${a4642}/ac914.svg`;
const imgInstagram = `${a4642}/530d2.svg`;
const imgYoutube = `${a4642}/89fdc.svg`;
const imgLinkedin = `${a4642}/8582f.svg`;

const sports = [
  { img: imgSport1, label: "Gym & Fitness" },
  { img: imgSport2, label: "Bơi lội Aqua" },
  { img: imgSport3, label: "Yoga & Pilates" },
  { img: imgSport4, label: "Boxing Kickfit" },
  { img: imgSport5, label: "Bóng rổ" },
  { img: imgSport6, label: "Thể dục nhịp điệu" },
];

const classes = [
  { img: imgClass1, name: "HIIT Buổi Sáng", coach: "PT Minh Khoa", time: "06:00 – 07:00", slots: "4 chỗ trống", tag: "HOT" },
  { img: imgClass2, name: "Yoga Trị Liệu", coach: "PT Lan Anh", time: "08:00 – 09:00", slots: "8 chỗ trống", tag: "MỚI" },
  { img: imgClass3, name: "Kickboxing Pro", coach: "PT Gia Hân", time: "17:30 – 18:30", slots: "2 chỗ trống", tag: "SẮP ĐẦY" },
  { img: imgClass4, name: "Aqua Fitness", coach: "PT Đức Long", time: "19:00 – 20:00", slots: "12 chỗ trống", tag: "" },
];

const trainers = [
  { img: imgTrainer1, name: "Nguyễn Minh Khoa", specialty: "Strength & HIIT", exp: "8 năm", rating: 4.9 },
  { img: imgTrainer2, name: "Lê Lan Anh", specialty: "Yoga & Pilates", exp: "6 năm", rating: 4.8 },
  { img: imgTrainer3, name: "Trần Gia Hân", specialty: "Boxing & MMA", exp: "10 năm", rating: 5.0 },
  { img: imgTrainer4, name: "Phạm Thu Trang", specialty: "Aqua & Swim", exp: "5 năm", rating: 4.7 },
];

const features = [
  {
    icon: "⚡",
    title: "Move AI Coach",
    desc: "Giáo án cá nhân hoá theo thể trạng, lịch sử tập luyện và mục tiêu của từng hội viên.",
  },
  {
    icon: "📊",
    title: "InBody Tracking",
    desc: "Phân tích chỉ số cơ thể chuyên sâu theo chuẩn InBody mỗi tuần — không phỏng đoán.",
  },
  {
    icon: "🏟️",
    title: "5 Không gian chuyên biệt",
    desc: "Gym, hồ bơi, sân boxing, phòng yoga và khu phục hồi thể thao riêng biệt.",
  },
  {
    icon: "📅",
    title: "Đặt lịch thông minh",
    desc: "Chọn lớp, đặt chỗ và nhận nhắc nhở tự động qua ứng dụng SportCenter.",
  },
];

const stats = [
  { value: "2.486+", label: "Thành viên hoạt động" },
  { value: "48", label: "Huấn luyện viên" },
  { value: "5★", label: "Đánh giá trung bình" },
  { value: "12+", label: "Năm kinh nghiệm" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[3px] items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <img key={i} alt="" src={imgStar} style={{ width: 14, height: 14, opacity: i <= Math.round(rating) ? 1 : 0.25 }} />
      ))}
      <span className="ml-[4px] font-['Inter:Bold'] font-bold text-[#0f172a] text-[13px]">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen" data-node-id="2263:home" data-name="trang-chu-redesign">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0 sticky top-0 z-50">
        <div className="flex gap-[10px] items-center shrink-0" data-name="logo-group">
          <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[36px] shrink-0">
            <img alt="" src={imgZap} style={{ width: 20, height: 20 }} />
          </div>
          <div className="flex flex-col gap-[2px] items-start shrink-0">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] leading-none">SPORTCENTER</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[9px] uppercase leading-none">Energy Platform</p>
          </div>
        </div>

        <div className="flex gap-[4px] h-full items-center">
          {[
            ["Trang chủ", true],
            ["Bộ môn", false],
            ["Lớp học", false],
            ["Huấn luyện viên", false],
            ["Gói tập", false],
            ["Về chúng tôi", false],
            ["Liên hệ", false],
          ].map(([label, active]) => (
            <div
              key={label as string}
              className="flex flex-col h-full items-start justify-center px-[14px] py-[24px] relative shrink-0 cursor-pointer"
              data-name={`menu-item-${label}`}
            >
              <p
                className={`font-['Inter:${active ? "Bold" : "Medium"}'] font-${active ? "bold" : "medium"} text-[15px] whitespace-nowrap ${active ? "text-[#2563eb]" : "text-[#1e293b]"}`}
              >
                {label as string}
              </p>
              {active && <div className="absolute bottom-0 left-[14px] bg-[#2563eb] h-[2px] rounded-[1px] w-[24px]" />}
            </div>
          ))}
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

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center gap-[28px] w-full min-h-[640px] px-[80px] py-[120px] shrink-0 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute inset-0 w-full h-full object-cover max-w-none" src={imgHeroBg} />
          <div className="absolute inset-0 bg-[rgba(11,31,58,0.82)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-[24px] max-w-[860px] text-center">
          <div className="bg-[rgba(16,185,129,0.12)] border border-[#10b981] flex items-center px-[14px] py-[7px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase tracking-wider">
              TRANG CHỦ — SPORTCENTER ENERGY PLATFORM
            </p>
          </div>

          <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[56px] leading-[1.1] m-0">
            Năng lượng cho mọi<br />chuyển động.
          </h1>

          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[18px] leading-[1.6] max-w-[600px] m-0">
            Hệ sinh thái thể thao đa bộ môn chuẩn quốc tế — nơi công nghệ luyện tập, huấn luyện viên đẳng cấp và không gian sang trọng hội tụ.
          </p>

          <div className="flex gap-[14px] items-center mt-[4px]">
            <div className="bg-[#10b981] flex items-center gap-[8px] px-[28px] py-[14px] rounded-[10px] cursor-pointer shrink-0" data-name="btn-register">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[15px] whitespace-nowrap">Đăng ký tham quan miễn phí</p>
            </div>
            <div className="border border-white border-opacity-40 flex items-center gap-[8px] px-[28px] py-[14px] rounded-[10px] cursor-pointer shrink-0" data-name="btn-classes">
              <p className="font-['Inter:Semi_Bold'] font-semibold text-white text-[15px] whitespace-nowrap">Xem lớp học ngay →</p>
            </div>
          </div>
        </div>

        {/* Stats inline */}
        <div className="relative z-10 flex gap-[48px] items-center mt-[16px]">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-[4px]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[28px] leading-none">{value}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features / Công nghệ ── */}
      <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
        <div className="flex flex-col gap-[12px] items-center text-center mb-[56px]">
          <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">CÔNG NGHỆ VÀ TRẢI NGHIỆM</p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-[1.2] m-0">
            Công nghệ vượt tầm hình dung
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[560px] m-0">
            SportCenter tích hợp AI, phân tích sinh trắc học và không gian chuyên biệt để mang lại trải nghiệm luyện tập đỉnh cao.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[24px]">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="border border-[#e2e8f0] flex flex-col gap-[16px] p-[28px] rounded-[16px] bg-[#f8fafc] hover:border-[#10b981] transition-colors">
              <div className="text-[32px] leading-none">{icon}</div>
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] leading-[1.3] m-0">{title}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] m-0">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / Facility ── */}
      <section className="bg-[#f8fafc] flex gap-[60px] items-center px-[80px] py-[80px] w-full shrink-0">
        <div className="flex-1 min-w-0 rounded-[20px] overflow-hidden h-[420px] relative shrink-0" style={{ maxWidth: "520px" }}>
          <img alt="Không gian SportCenter" className="absolute inset-0 w-full h-full object-cover max-w-none" src={imgAboutPhoto} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-[24px] items-start">
          <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase tracking-wider">HỆ SINH THÁI THỂ THAO</p>
          </div>
          <div className="flex flex-col gap-[4px]">
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[34px] leading-[1.2] m-0">
              Không gian luyện tập<br />chuẩn quốc tế
            </h2>
            <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px] mt-[10px]" />
          </div>
          <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.7] m-0">
            Được thành lập từ năm 2018, SportCenter sở hữu hơn 5.000 m² không gian luyện tập chuyên biệt với thiết bị Technogym thế hệ mới nhất, hồ bơi trị liệu tiêu chuẩn Olympic và đội ngũ hơn 48 huấn luyện viên được chứng nhận quốc tế.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.7] m-0">
            Mỗi hội viên được tiếp cận giáo án cá nhân hoá qua nền tảng Move AI — từ phân tích InBody, lập kế hoạch dinh dưỡng đến theo dõi tiến trình theo thời gian thực.
          </p>
          <div className="grid grid-cols-2 gap-[16px] w-full mt-[4px]">
            {[
              ["5.000 m²", "Tổng diện tích"],
              ["48+", "HLV chứng chỉ quốc tế"],
              ["5 khu vực", "Không gian chuyên biệt"],
              ["24/7", "Hỗ trợ trực tuyến"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="bg-white border border-[#e2e8f0] flex flex-col gap-[4px] p-[16px] rounded-[12px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[22px] leading-none m-0">{val}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sport categories ── */}
      <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
        <div className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
          <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">12 BỘ MÔN</p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
            Khám phá bộ môn tại SportCenter
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
            Từ gym chuẩn quốc tế, hồ bơi trị liệu đến yoga, boxing và bóng rổ — mọi đam mê thể thao đều có chỗ tại đây.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-[20px]">
          {sports.map(({ img, label }) => (
            <div key={label} className="relative rounded-[16px] overflow-hidden h-[220px] cursor-pointer group">
              <img alt={label} className="absolute inset-0 w-full h-full object-cover max-w-none transition-transform duration-500 group-hover:scale-105" src={img} />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.85)] via-[rgba(11,31,58,0.3)] to-transparent" />
              <div className="absolute bottom-0 left-0 p-[20px]">
                <p className="font-['Inter:Bold'] font-bold text-white text-[17px] leading-none">{label}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#10b981] text-[13px] mt-[4px]">Khám phá →</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Classes ── */}
      <section className="bg-[#f8fafc] w-full px-[80px] py-[80px] shrink-0">
        <div className="flex items-end justify-between mb-[40px]">
          <div className="flex flex-col gap-[12px]">
            <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0 w-fit">
              <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase tracking-wider">LỊCH HÔM NAY</p>
            </div>
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
              Lớp nổi bật
            </h2>
          </div>
          <div className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer shrink-0 whitespace-nowrap" data-name="btn-classes">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Xem tất cả lớp học →</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[20px]">
          {classes.map(({ img, name, coach, time, slots, tag }) => (
            <div key={name} className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden flex flex-col hover:border-[#10b981] transition-colors">
              <div className="relative h-[180px]">
                <img alt={name} className="absolute inset-0 w-full h-full object-cover max-w-none" src={img} />
                {tag && (
                  <div className={`absolute top-[12px] left-[12px] px-[8px] py-[4px] rounded-[6px] ${tag === "HOT" ? "bg-[#f97316]" : tag === "SẮP ĐẦY" ? "bg-[#dc2626]" : "bg-[#10b981]"}`}>
                    <p className="font-['Inter:Bold'] font-bold text-white text-[11px]">{tag}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-[10px] p-[18px]">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[15px] leading-[1.3] m-0">{name}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">{coach}</p>
                <div className="flex items-center justify-between pt-[4px] border-t border-[#f1f5f9]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[13px] m-0">{time}</p>
                  <p className="font-['Inter:Regular'] font-normal text-[#10b981] text-[12px] m-0">{slots}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-[#0f172a] flex gap-[0px] items-stretch w-full shrink-0">
        {stats.map(({ value, label }, i) => (
          <div key={label} className={`flex-1 flex flex-col gap-[8px] items-center justify-center py-[52px] px-[32px] ${i < stats.length - 1 ? "border-r border-[#1e293b]" : ""}`}>
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[44px] leading-none m-0">{value}</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] text-center m-0">{label}</p>
          </div>
        ))}
      </section>

      {/* ── Trainers ── */}
      <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
        <div className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
          <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">ĐỘI NGŨ CHUYÊN GIA</p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
            Chứng nhận huấn luyện viên
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
            Đội ngũ hơn 48 HLV được chứng nhận quốc tế — ACE, ISSA, ACSM — với kinh nghiệm từ 5 đến 15 năm.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[24px]">
          {trainers.map(({ img, name, specialty, exp, rating }) => (
            <div key={name} className="border border-[#e2e8f0] flex flex-col gap-[16px] p-[24px] rounded-[20px] items-center text-center hover:border-[#10b981] transition-colors">
              <div className="size-[96px] rounded-full overflow-hidden shrink-0">
                <img alt={name} className="w-full h-full object-cover" src={img} />
              </div>
              <div className="flex flex-col gap-[4px] items-center">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] m-0">{name}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">{specialty}</p>
              </div>
              <StarRow rating={rating} />
              <div className="flex gap-[8px] items-center">
                <img alt="" src={imgFlame} style={{ width: 14, height: 14 }} />
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[13px] m-0">{exp} kinh nghiệm</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-[#f8fafc] px-[80px] pb-[64px] pt-[32px] w-full shrink-0">
        <div className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[56px] rounded-[24px] w-full">
          <div className="flex flex-col gap-[12px] items-center text-center w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[34px] leading-[1.2] m-0">
              Sẵn sàng đổi thay cuộc đời?
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.6] max-w-[560px] m-0">
              Đăng ký tham quan không gian thực tế miễn phí và nhận ngay vé trải nghiệm hồ bơi Aqua trị liệu VIP.
            </p>
          </div>

          <div className="flex gap-[12px] items-stretch w-full">
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-start min-w-0 px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">Họ và tên của bạn</p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-start min-w-0 px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">Số điện thoại liên hệ</p>
            </div>
            <div className="bg-[#10b981] flex flex-1 items-center justify-center min-w-0 px-[24px] py-[14px] rounded-[8px] cursor-pointer" data-name="btn-submit">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[14px] whitespace-nowrap">Đăng ký tham quan ngay</p>
            </div>
          </div>

          <div className="flex gap-[32px] items-center w-full border-t border-[#1e293b] pt-[24px]">
            {[
              ["✓", "Tham quan miễn phí 100%"],
              ["✓", "Vé trải nghiệm hồ bơi VIP"],
              ["✓", "Tư vấn giáo án cá nhân"],
            ].map(([icon, text]) => (
              <div key={text} className="flex gap-[8px] items-center">
                <span className="font-['Inter:Bold'] font-bold text-[#10b981] text-[14px]">{icon}</span>
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] m-0">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full shrink-0">
        <div className="flex items-start justify-between w-full">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-[24px] items-start w-[360px] shrink-0" data-name="logo-group-footer">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px] shrink-0">
                <img alt="" src={imgZapFooter} style={{ width: 24, height: 24 }} />
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">
              Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.
            </p>
            <div className="flex gap-[6px] items-center">
              <img alt="" src={imgSmartphone} style={{ width: 16, height: 16 }} />
              <p className="font-['Inter:Bold'] font-bold text-white text-[16px]">Hotline: 1900 6868</p>
            </div>
          </div>

          {/* Dịch vụ */}
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">Dịch vụ nổi bật</p>
            {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>

          {/* SportCenter */}
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">SportCenter</p>
            {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>

          {/* Address + social */}
          <div className="flex flex-col gap-[16px] items-start w-[320px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
            </p>
            <div className="flex gap-[8px] items-center pt-[8px]">
              {[imgFacebook, imgInstagram, imgYoutube, imgLinkedin].map((icon, i) => (
                <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] cursor-pointer hover:bg-[#10b981] transition-colors">
                  <img alt="" src={icon} style={{ width: 18, height: 18 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1e293b] flex items-center justify-between pt-[32px] w-full" data-name="policy-links">
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">
            © 2026 SportCenter. All rights reserved.
          </p>
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
