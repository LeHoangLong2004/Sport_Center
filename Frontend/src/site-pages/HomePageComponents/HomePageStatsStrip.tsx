import { useEffect, useState } from "react";
import { FadeUp } from "../../components/Motion";

export function HomePageStatsStrip() {
  const [stats, setStats] = useState([
    { value: "—", label: "Thành viên hoạt động" },
    { value: "—", label: "Huấn luyện viên" },
    { value: "—", label: "Đánh giá trung bình" },
    { value: "—", label: "Kinh nghiệm cao nhất" },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/coaches").then((response) => response.ok ? response.json() : []),
      fetch("/api/classes/available").then((response) => response.ok ? response.json() : []),
    ]).then(([coaches]) => {
      const rows = Array.isArray(coaches) ? coaches : [];
      const ratings = rows.map((coach: any) => Number(coach.rating)).filter((rating: number) => Number.isFinite(rating) && rating > 0);
      const experiences = rows.map((coach: any) => Number(coach.experienceYears)).filter((years: number) => Number.isFinite(years) && years >= 0);
      setStats([
        { value: "—", label: "Thành viên hoạt động" },
        { value: String(rows.length), label: "Huấn luyện viên" },
        { value: ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : "—", label: "Đánh giá trung bình" },
        { value: experiences.length ? `${Math.max(...experiences)}+` : "—", label: "Kinh nghiệm cao nhất" },
      ]);
    }).catch(() => undefined);
  }, []);

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
