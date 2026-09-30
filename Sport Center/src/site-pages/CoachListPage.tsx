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

import { FadeUp, FadeIn } from "../components/Motion"

export default function HoSoHlvRedesign() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      

      {/* Hero */}
      <section className="bg-[#0f172a] relative flex items-center gap-[64px] px-[80px] py-[100px] w-full min-h-[560px] overflow-hidden">
        <FadeIn className="absolute inset-0 pointer-events-none z-0">
          <img alt="" className="absolute inset-0 w-full h-full object-cover max-w-none" src="/assets/images/hero_bg.jpg" />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
        </FadeIn>
        
        <FadeUp className="shrink-0 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#10b981] rounded-[16px] transform rotate-3 group-hover:rotate-6 transition-transform duration-500 opacity-20" />
            <img
              src={imgCoachPortrait}
              alt="Coach Trần Khoa"
              className="w-[480px] h-[480px] object-cover rounded-[16px] relative z-10 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2"
            />
          </div>
        </FadeUp>
        <div className="flex flex-col gap-[24px] flex-1 relative z-10">
          <FadeUp delay={0.1} className="inline-flex items-center bg-[#10b981]/20 border border-[#10b981]/50 px-[14px] py-[6px] rounded-full self-start backdrop-blur-sm">
            <span className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase tracking-wider">
              🏆 HLV ĐƯỢC YÊU THÍCH NHẤT
            </span>
          </FadeUp>
          <FadeUp delay={0.2} className="flex flex-col gap-[8px]">
            <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[48px] leading-tight drop-shadow-sm">
              Coach Trần Khoa
            </h1>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#cbd5e1] text-[20px]">
              Master Trainer — Functional HIIT & Strength
            </p>
          </FadeUp>
          <FadeUp delay={0.3} className="flex flex-wrap gap-[10px]">
            {certTags.map((tag) => (
              <span
                key={tag}
                className="border border-[#334155] bg-slate-800/50 backdrop-blur-sm font-['Inter:Medium'] font-medium text-[#cbd5e1] text-[13px] px-[12px] py-[6px] rounded-[6px]"
              >
                {tag}
              </span>
            ))}
          </FadeUp>
          <FadeUp delay={0.4} className="flex gap-[40px] pt-[16px]">
            {[
              { value: "7", label: "Năm kinh nghiệm" },
              { value: "500+", label: "Học viên" },
              { value: "4.9/5.0", label: "Đánh giá" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-[4px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[36px] leading-none drop-shadow-sm">
                  {value}
                </p>
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{label}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* About */}
      <section className="bg-white flex gap-[48px] items-start px-[80px] py-[80px] w-full">
        <FadeUp className="flex flex-col gap-[24px] flex-1">
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
        </FadeUp>
        <FadeUp delay={0.2} className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-[20px] p-[32px] rounded-[16px] w-[360px] shrink-0 shadow-lg hover:shadow-xl hover:border-[#10b981] transition-all duration-300">
          <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">Chuyên môn cốt lõi</h3>
          <div className="flex flex-col gap-[14px]">
            {coreSkills.map((skill) => (
              <div key={skill} className="flex gap-[12px] items-start">
                <span className="text-[#10b981] font-bold text-[16px] mt-[1px]">✓</span>
                <p className="font-['Inter:Medium'] font-medium text-[#1e293b] text-[15px] leading-[1.5]">{skill}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* Disciplines */}
      <section className="bg-[#f8fafc] flex flex-col gap-[48px] px-[80px] py-[80px] w-full">
        <FadeUp className="flex flex-col gap-[12px] items-center">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight text-center">
            Các bộ môn Coach Trần Khoa trực tiếp giảng dạy
          </h2>
          <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
        </FadeUp>
        <div className="flex gap-[24px]">
          {disciplines.map(({ img, name, kcal }, index) => (
            <FadeUp delay={index * 0.1} key={name} className="flex flex-col rounded-[16px] overflow-hidden bg-white border border-[#e2e8f0] flex-1 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#10b981] transition-all duration-300 group">
              <div className="relative overflow-hidden">
                <img src={img} alt={name} className="w-full h-[220px] object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col gap-[8px] p-[24px]">
                <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px] group-hover:text-[#10b981] transition-colors">{name}</h3>
                <p className="font-['Inter:Medium'] font-medium text-[#10b981] text-[14px]">🔥 {kcal}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-white flex flex-col gap-[48px] px-[80px] py-[80px] w-full">
        <FadeUp className="flex flex-col gap-[12px] items-center">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight text-center">
            Lịch giảng dạy tuần này
          </h2>
          <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
        </FadeUp>
        <FadeUp delay={0.2} className="rounded-[12px] overflow-hidden border border-[#e2e8f0] shadow-sm hover:shadow-lg transition-shadow duration-300">
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
              className={`flex border-t border-[#e2e8f0] hover:bg-blue-50 transition-colors cursor-pointer ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}
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
        </FadeUp>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f8fafc] flex flex-col gap-[48px] px-[80px] py-[80px] w-full">
        <FadeUp className="flex flex-col gap-[12px] items-center">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-tight text-center">
            Học viên nói gì về Coach Trần Khoa
          </h2>
          <div className="bg-[#2563eb] h-[4px] w-[48px] rounded-[2px]" />
        </FadeUp>
        <div className="grid grid-cols-4 gap-[24px]">
          {testimonials.map(({ img, name, membership, quote }, index) => (
            <FadeUp delay={index * 0.1} key={name} className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] p-[24px] rounded-[16px] shadow-[0_4px_6px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 hover:border-[#10b981] transition-all duration-300">
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
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f8fafc] flex flex-col items-center px-[80px] pb-[80px]">
        <FadeUp className="bg-[#0f172a] relative flex flex-col gap-[32px] items-center px-[64px] py-[64px] rounded-[24px] w-full overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent pointer-events-none" />
          <div className="flex flex-col gap-[12px] items-center relative z-10">
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
        </FadeUp>
      </section>

      
    </div>
  );
}
