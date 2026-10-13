import { FadeUp } from "../components/Motion"
import { imgFlame } from "./sportsPageData"

export function SportCard({
  id = "boi-loi",
  img,
  badge,
  icon,
  title,
  desc,
  stat,
  tall,
  delay = 0,
}: {
  id?: string
  img: string
  badge: string
  icon: string
  title: string
  desc: string
  stat: string
  tall?: boolean
  delay?: number
}) {
  return (
    <FadeUp
      delay={delay}
      onClick={(e) => {
        e.stopPropagation();
        window.location.hash = `#chitietbomon?sport=${id}`;
      }}
      className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-clip rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 hover:border-[#10b981] transition-all duration-300 cursor-pointer group"
    >
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{ height: tall ? 220 : 200 }}
      >
        <img
          alt={title}
          className="absolute inset-0 object-cover size-full max-w-none transition-transform duration-500 group-hover:scale-105"
          src={img}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bg-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] left-[16px] top-[16px] shadow-md shadow-teal-500/20">
          <p className="font-['Inter:Bold'] font-bold text-white text-[12px] whitespace-nowrap">
            {badge}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-[16px] items-start p-[24px] w-full">
        <div className="flex gap-[12px] items-center w-full">
          <div className="bg-[#eff6ff] flex items-center justify-center rounded-[8px] size-[36px] shrink-0 group-hover:bg-blue-100 transition-colors">
            <img alt="" src={icon} style={{ width: 20, height: 20 }} />
          </div>
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-[#10b981] transition-colors">
            {title}
          </p>
        </div>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] h-[64px] overflow-hidden">
          {desc}
        </p>
        <div className="border-t border-[#e2e8f0] w-full" />
        <div className="flex gap-[8px] items-center w-full">
          <img alt="" src={imgFlame} style={{ width: 16, height: 16 }} />
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[13px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {stat}
          </p>
        </div>
        <div
          className="flex gap-[4px] items-center cursor-pointer"
          data-name="btn-sport-detail"
        >
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px] whitespace-nowrap group-hover:text-[#1d4ed8]">
            Xem lịch tập & Chi tiết môn
          </p>
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px] group-hover:translate-x-1 transition-transform group-hover:text-[#1d4ed8]">
            →
          </p>
        </div>
      </div>
    </FadeUp>
  )
}

