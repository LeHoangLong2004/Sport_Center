import CTABanner from "./HomePageComponents/CTABanner";
const a4642 = "/assets/site/4642";
const a3992 = "/assets/site/3992";
const a5634 = "/assets/site/5634";

const imgHeroBg = "/assets/images/hero_bg.jpg";
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

import { FadeUp, FadeIn } from '../components/Motion';

export default function HomePage() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen" data-node-id="2263:home" data-name="trang-chu-redesign">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center gap-[28px] w-full min-h-[640px] px-[80px] py-[120px] shrink-0 overflow-hidden">
        <FadeIn className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute inset-0 w-full h-full object-cover max-w-none" src={imgHeroBg} />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        </FadeIn>

        <FadeUp delay={0.2} className="relative z-10 flex flex-col items-center gap-[24px] max-w-[860px] text-center">
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
        </FadeUp>

        {/* Stats inline */}
        <FadeUp delay={0.4} className="relative z-10 flex gap-[48px] items-center mt-[16px]">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-[4px]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[28px] leading-none">{value}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">{label}</p>
            </div>
          ))}
        </FadeUp>
      </section>

      {/* ── Features / Công nghệ ── */}
      <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
        <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[56px]">
          <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">CÔNG NGHỆ VÀ TRẢI NGHIỆM</p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-[1.2] m-0">
            Công nghệ vượt tầm hình dung
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[560px] m-0">
            SportCenter tích hợp AI, phân tích sinh trắc học và không gian chuyên biệt để mang lại trải nghiệm luyện tập đỉnh cao.
          </p>
        </FadeUp>

        <div className="grid grid-cols-4 gap-[24px]">
          {features.map(({ icon, title, desc }, index) => (
            <FadeUp delay={index * 0.1} key={title} className="border border-[#e2e8f0] flex flex-col gap-[16px] p-[28px] rounded-[16px] bg-[#f8fafc] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="text-[32px] leading-none">{icon}</div>
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] leading-[1.3] m-0">{title}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] m-0">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── About / Facility ── */}
      <section className="bg-[#f8fafc] flex gap-[60px] items-center px-[80px] py-[80px] w-full shrink-0">
        <FadeUp className="flex-1 min-w-0 rounded-[20px] overflow-hidden h-[420px] relative shrink-0 shadow-2xl" style={{ maxWidth: "520px" }}>
          <img alt="Không gian SportCenter" className="absolute inset-0 w-full h-full object-cover max-w-none hover:scale-105 transition-transform duration-700" src={imgAboutPhoto} />
        </FadeUp>
        <FadeUp delay={0.2} className="flex-1 min-w-0 flex flex-col gap-[24px] items-start">
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
        </FadeUp>
      </section>

      {/* ── Sport categories ── */}
      <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
        <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
          <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">12 BỘ MÔN</p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
            Khám phá bộ môn tại SportCenter
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
            Từ gym chuẩn quốc tế, hồ bơi trị liệu đến yoga, boxing và bóng rổ — mọi đam mê thể thao đều có chỗ tại đây.
          </p>
        </FadeUp>

        <div className="grid grid-cols-3 gap-[20px]">
          {sports.map(({ img, label }, index) => (
            <FadeUp delay={index * 0.1} key={label} className="relative rounded-[16px] overflow-hidden h-[220px] cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300">
              <img alt={label} className="absolute inset-0 w-full h-full object-cover max-w-none transition-transform duration-500 group-hover:scale-105" src={img} />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.9)] via-[rgba(11,31,58,0.3)] to-transparent" />
              <div className="absolute bottom-0 left-0 p-[20px] transform transition-transform duration-300 group-hover:-translate-y-2">
                <p className="font-['Inter:Bold'] font-bold text-white text-[17px] leading-none">{label}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#10b981] text-[13px] mt-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">Khám phá →</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Featured Classes ── */}
      <section className="bg-[#f8fafc] w-full px-[80px] py-[80px] shrink-0">
        <FadeUp className="flex items-end justify-between mb-[40px]">
          <div className="flex flex-col gap-[12px]">
            <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0 w-fit">
              <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase tracking-wider">LỊCH HÔM NAY</p>
            </div>
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
              Lớp nổi bật
            </h2>
          </div>
          <div className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 transition-colors" data-name="btn-classes">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Xem tất cả lớp học →</p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-4 gap-[20px]">
          {classes.map(({ img, name, coach, time, slots, tag }, index) => (
            <FadeUp delay={index * 0.1} key={name} className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden flex flex-col hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
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
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-[#0f172a] flex gap-[0px] items-stretch w-full shrink-0">
        {stats.map(({ value, label }, i) => (
            <FadeUp delay={i * 0.1} key={label} className={`flex-1 flex flex-col gap-[8px] items-center justify-center py-[52px] px-[32px] ${i < stats.length - 1 ? "border-r border-[#1e293b]" : ""}`}>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[44px] leading-none m-0">{value}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] text-center m-0">{label}</p>
            </FadeUp>
          ))}
      </section>

      {/* ── Trainers ── */}
      <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
        <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
          <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">ĐỘI NGŨ CHUYÊN GIA</p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
            Chứng nhận huấn luyện viên
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
            Đội ngũ hơn 48 HLV được chứng nhận quốc tế — ACE, ISSA, ACSM — với kinh nghiệm từ 5 đến 15 năm.
          </p>
        </FadeUp>

        <div className="grid grid-cols-4 gap-[24px]">
          {trainers.map(({ img, name, specialty, exp, rating }, index) => (
            <FadeUp delay={index * 0.1} key={name} className="border border-[#e2e8f0] flex flex-col gap-[16px] p-[24px] rounded-[20px] items-center text-center hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="size-[96px] rounded-full overflow-hidden shrink-0 shadow-md">
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
            </FadeUp>
          ))}
        </div>
      </section>

      <CTABanner />

    </div>
  );
}
