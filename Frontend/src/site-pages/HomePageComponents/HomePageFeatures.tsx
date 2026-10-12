import { FadeUp } from "../../components/Motion";
import { features } from "../homePageData";

export default function HomePageFeatures() {
  return (
    <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
      <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[56px]">
        <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">
            CÔNG NGHỆ VÀ TRẢI NGHIỆM
          </p>
        </div>
        <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-[1.2] m-0">
          Công nghệ vượt tầm hình dung
        </h2>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[560px] m-0">
          SportCenter tích hợp AI, phân tích sinh trắc học và không gian chuyên
          biệt để mang lại trải nghiệm luyện tập đỉnh cao.
        </p>
      </FadeUp>

      <div className="grid grid-cols-4 gap-[24px]">
        {features.map(({ icon, title, desc }, index) => (
          <FadeUp
            delay={index * 0.1}
            key={title}
            className="border border-[#e2e8f0] flex flex-col gap-[16px] p-[28px] rounded-[16px] bg-[#f8fafc] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="text-[32px] leading-none">{icon}</div>
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] leading-[1.3] m-0">
                {title}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] m-0">
                {desc}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
