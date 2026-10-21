import { useEffect, useState } from "react";
import { FadeUp } from "../../components/Motion";

type InlineStat = { value: string; label: string };
const emptyStats: InlineStat[] = [
  { value: "—", label: "Huấn luyện viên" },
  { value: "—", label: "Không gian" },
  { value: "—", label: "Lớp đang mở" },
];

export function HomePageStatsInline() {
  const [stats, setStats] = useState(emptyStats);

  useEffect(() => {
    Promise.all([
      fetch("/api/coaches").then((response) => response.ok ? response.json() : []),
      fetch("/api/facilities").then((response) => response.ok ? response.json() : []),
      fetch("/api/classes/available").then((response) => response.ok ? response.json() : []),
    ]).then(([coaches, facilities, classes]) => {
      setStats([
        { value: String(Array.isArray(coaches) ? coaches.length : 0), label: "Huấn luyện viên" },
        { value: String(Array.isArray(facilities) ? facilities.length : 0), label: "Không gian" },
        { value: String(Array.isArray(classes) ? classes.length : 0), label: "Lớp đang mở" },
      ]);
    }).catch(() => setStats(emptyStats));
  }, []);

  return (
    <FadeUp delay={0.4} className="relative z-10 flex gap-[48px] items-center mt-[16px]">
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-[4px]">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[28px] leading-none">{value}</p>
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">{label}</p>
        </div>
      ))}
    </FadeUp>
  );
}
