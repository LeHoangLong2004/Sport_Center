import { FadeUp } from "../../components/Motion";
import { stats } from "../homePageData";

export function HomePageStatsStrip() {
  return (
    <section className="bg-[#0f172a] flex gap-[0px] items-stretch w-full shrink-0">
      {stats.map(({ value, label }, index) => (
        <FadeUp
          delay={index * 0.1}
          key={label}
          className={`flex-1 flex flex-col gap-[8px] items-center justify-center py-[52px] px-[32px] ${
            index < stats.length - 1 ? "border-r border-[#1e293b]" : ""
          }`}
        >
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[44px] leading-none m-0">
            {value}
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] text-center m-0">
            {label}
          </p>
        </FadeUp>
      ))}
    </section>
  );
}
