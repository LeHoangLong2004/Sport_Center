import CTABanner from "./HomePageComponents/CTABanner";
import HomePageFeatures from "./HomePageComponents/HomePageFeatures";
import { HomePageStatsInline } from "./HomePageComponents/HomePageStatsInline";
import { HomePageStatsStrip } from "./HomePageComponents/HomePageStatsStrip";
import { HomePageAboutSection } from "./HomePageComponents/HomePageAboutSection";
import HomePageSportsGrid from "./HomePageComponents/HomePageSportsGrid";
import HomePageClassesSection from "./HomePageComponents/HomePageClassesSection";
import HomePageTrainersSection from "./HomePageComponents/HomePageTrainersSection";
import { imgHeroBg } from "./homePageData";
import { FadeUp, FadeIn } from "../components/Motion";

export default function HomePage() {
  return (
    <div
      className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen"
      data-node-id="2263:home"
      data-name="trang-chu-redesign"
    >
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center gap-[28px] w-full min-h-[640px] px-[80px] py-[120px] shrink-0 overflow-hidden">
        <FadeIn className="absolute inset-0 pointer-events-none">
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            src={imgHeroBg}
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        </FadeIn>

        <FadeUp
          delay={0.2}
          className="relative z-10 flex flex-col items-center gap-[24px] max-w-[860px] text-center"
        >
          <div className="bg-[rgba(16,185,129,0.12)] border border-[#10b981] flex items-center px-[14px] py-[7px] rounded-[100px] shrink-0">
            <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase tracking-wider">
              TRANG CHỦ — SPORTCENTER ENERGY PLATFORM
            </p>
          </div>

          <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[56px] leading-[1.1] m-0">
            Năng lượng cho mọi
            <br />
            chuyển động.
          </h1>

          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[18px] leading-[1.6] max-w-[600px] m-0">
            Hệ sinh thái thể thao đa bộ môn chuẩn quốc tế — nơi công nghệ luyện
            tập, huấn luyện viên đẳng cấp và không gian sang trọng hội tụ.
          </p>

          <div className="flex gap-[14px] items-center mt-[4px]">
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#pricing";
              }}
              className="bg-[#10b981] hover:bg-[#059669] flex items-center gap-[8px] px-[28px] py-[14px] rounded-[10px] cursor-pointer shrink-0 transition-colors border-0"
              data-name="btn-register"
            >
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[15px] whitespace-nowrap">
                Đăng ký tham quan miễn phí
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#lophoc";
              }}
              className="border border-white/60 hover:bg-white/10 flex items-center gap-[8px] px-[28px] py-[14px] rounded-[10px] cursor-pointer shrink-0 transition-colors bg-transparent"
              data-name="btn-classes"
            >
              <p className="font-['Inter:Semi_Bold'] font-semibold text-white text-[15px] whitespace-nowrap">
                Xem lớp học ngay →
              </p>
            </button>
          </div>
        </FadeUp>

        <HomePageStatsInline />
      </section>

      <HomePageFeatures />

      {/* ── About / Facility ── */}
      <HomePageAboutSection />

      {/* ── Sport categories ── */}
      <HomePageSportsGrid />

      {/* ── Featured Classes ── */}
      <HomePageClassesSection />

      <HomePageStatsStrip />

      {/* ── Trainers ── */}
      <HomePageTrainersSection />

      <CTABanner />
    </div>
  );
}
