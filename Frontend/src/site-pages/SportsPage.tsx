import { FadeUp, FadeIn } from "../components/Motion"
import { SportCard } from "./SportCard"
import * as sportsPageData from "./sportsPageData"

const {
  assetPathPrefix,
  imgHeroBg,
  imgSportSwim,
  imgSportYoga,
  imgSportHiit,
  imgSportBoxing,
  imgSportBasket,
  imgCoach1,
  imgCoach2,
  imgCoach3,
  imgCoach4,
  imgZap,
  imgDroplets,
  imgFlame,
  imgCircleX,
  imgDumbbell,
  imgFlame1,
  imgDumbbell1,
  imgFlower2,
  imgChevronDown,
  imgZapFooter,
  imgSmartphone,
  imgFacebook,
  imgInstagram,
  imgVideo,
  imgLinkedin,
  navItems,
  filterTags,
  sportsTop,
  sportsBottom,
  goals,
  coaches
} = sportsPageData

export default function BoMonPage() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      {/* Hero Banner */}
      <section className="relative flex flex-col gap-[32px] items-start px-[80px] py-[100px] w-full shrink-0 overflow-hidden min-h-[480px] justify-center">
        <FadeIn className="absolute inset-0 pointer-events-none">
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            src={imgHeroBg}
          />
          <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        </FadeIn>
        <div className="relative z-10 flex flex-col gap-[16px] items-start w-full">
          <FadeUp className="bg-[rgba(16,185,129,0.12)] border border-[#10b981] flex items-center px-[14px] py-[7px] rounded-[100px]">
            <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase whitespace-nowrap tracking-wider">
              HỆ SINH THÁI THỂ THAO ĐA BỘ MÔN
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[48px] leading-[1.1] w-full max-w-[720px]">
              Chọn chuyển động phù hợp với cơ thể bạn
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[18px] leading-[1.6] max-w-[640px]">
              Khám phá 5 bộ môn thể thao tiêu chuẩn quốc tế với giáo án tối ưu
              theo thể trạng và mục tiêu rèn luyện cá nhân.
            </p>
          </FadeUp>
        </div>
        <FadeUp
          delay={0.4}
          className="relative z-10 flex flex-wrap gap-[12px] items-start w-full"
        >
          {filterTags.map(({ label, active }) => (
            <div
              key={label}
              className={`flex items-center px-[20px] py-[12px] rounded-[100px] cursor-pointer hover:bg-[#2563eb] transition-colors ${
                active
                  ? "bg-[#2563eb]"
                  : "bg-[rgba(30,41,59,0.5)] border border-[#334155] backdrop-blur-md"
              }`}
            >
              <p className="font-['Inter:Semi_Bold'] font-semibold text-white text-[14px] whitespace-nowrap">
                {label}
              </p>
            </div>
          ))}
        </FadeUp>
      </section>

      {/* 5 Sports Grid */}
      <section className="bg-[#f8fafc] flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <FadeUp className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            5 Không gian luyện tập chuyên biệt
          </p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </FadeUp>
        <div className="flex gap-[24px] items-start w-full">
          {sportsTop.map((s, index) => (
            <SportCard delay={index * 0.1} key={s.title} {...s} />
          ))}
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {sportsBottom.map((s, index) => (
            <SportCard delay={index * 0.1} key={s.title} {...s} tall />
          ))}
        </div>
      </section>

      {/* Goals Section */}
      <section className="bg-white flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <FadeUp className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Bạn muốn đạt được điều gì?
          </p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </FadeUp>
        <div className="flex gap-[24px] items-stretch w-full">
          {goals.map((g, index) => (
            <FadeUp
              delay={index * 0.1}
              key={g.title}
              className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[32px] rounded-[16px] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-[16px] items-center w-full">
                <div className="bg-[#ecfdf5] flex items-center justify-center rounded-[12px] size-[48px] shrink-0">
                  <img alt="" src={g.icon} style={{ width: 24, height: 24 }} />
                </div>
                <div className="flex flex-col gap-[2px] items-start flex-1 min-w-0">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] w-full">
                    {g.title}
                  </p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[13px] whitespace-nowrap">
                    {g.sub}
                  </p>
                </div>
              </div>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] h-[68px] overflow-hidden">
                {g.desc}
              </p>
              <div className="bg-[#eff6ff] flex items-start px-[12px] py-[8px] rounded-[8px] w-full">
                <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px] flex-1 min-w-0">
                  {g.suggest}
                </p>
              </div>
              <div className="flex gap-[6px] items-center cursor-pointer pt-[8px] group">
                <p className="font-['Inter:Bold'] font-bold text-[#059669] text-[14px] group-hover:text-[#047857] transition-colors">
                  Xem lộ trình mẫu
                </p>
                <p className="font-['Inter:Bold'] font-bold text-[#059669] text-[14px] group-hover:translate-x-1 transition-transform group-hover:text-[#047857]">
                  →
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Coaches Section */}
      <section className="bg-[#f8fafc] flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full shrink-0">
        <FadeUp className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Được hướng dẫn bởi các Huấn luyện viên hàng đầu
          </p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </FadeUp>
        <div className="flex gap-[24px] items-start w-full">
          {coaches.map((c, index) => (
            <FadeUp
              delay={index * 0.1}
              key={c.name}
              className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-clip rounded-[16px] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-[260px] w-full shrink-0 overflow-hidden">
                <img
                  alt={c.name}
                  className="absolute inset-0 object-cover size-full max-w-none transition-transform duration-500 group-hover:scale-105"
                  src={c.img}
                />
              </div>
              <div className="flex flex-col gap-[12px] items-start p-[20px] w-full">
                <div className="flex flex-col gap-[4px] items-start w-full">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] w-full group-hover:text-[#10b981] transition-colors">
                    {c.name}
                  </p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px] w-full">
                    {c.spec}
                  </p>
                </div>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-[1.4] h-[54px] overflow-hidden w-full">
                  {c.desc}
                </p>
                <div
                  className="border border-[#2563eb] flex items-center justify-center px-[16px] py-[10px] rounded-[8px] w-full cursor-pointer hover:bg-[#2563eb] hover:text-white transition-colors"
                  data-name="btn-coach-schedule"
                >
                  <p className="font-['Inter:Bold'] font-bold text-[13px] whitespace-nowrap text-inherit">
                    Xem lịch dạy của HLV
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#f8fafc] flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full shrink-0 overflow-hidden">
        <FadeUp className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent pointer-events-none rounded-[24px]" />
          <div className="flex flex-col gap-[12px] items-start text-center w-full relative z-10">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] w-full">
              Trải nghiệm tập thử miễn phí 01 buổi bộ môn bạn yêu thích
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] w-full">
              Để lại thông tin, đội ngũ tư vấn sẽ thiết kế buổi trải nghiệm
              chuẩn quốc tế dành riêng cho bạn.
            </p>
          </div>
          <div className="flex gap-[16px] items-center w-full relative z-10">
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
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-center justify-between min-w-0 px-[16px] py-[14px] rounded-[8px] cursor-pointer hover:border-[#10b981] transition-colors">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] flex-1 min-w-0">
                Chọn bộ môn muốn thử
              </p>
              <img
                alt=""
                src={imgChevronDown}
                style={{ width: 16, height: 16 }}
              />
            </div>
            <button className="bg-[#10b981] flex flex-1 items-center justify-center min-w-0 px-[24px] py-[14px] rounded-[8px] cursor-pointer hover:bg-[#059669] transition-colors shadow-lg shadow-[#10b981]/25">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[14px] whitespace-nowrap">
                Nhận vé tập thử ngay
              </p>
            </button>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}
