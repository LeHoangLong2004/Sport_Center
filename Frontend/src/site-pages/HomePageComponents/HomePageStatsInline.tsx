import { FadeUp } from "../../components/Motion";
import { stats } from "../homePageData";

export function HomePageStatsInline() {
  return (
    <FadeUp
      delay={0.4}
      className="relative z-10 flex gap-[48px] items-center mt-[16px]"
    >
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-[4px]">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[28px] leading-none">
            {value}
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
            {label}
          </p>
        </div>
      ))}
    </FadeUp>
  );
}
