import { useEffect, useState } from "react";
import { FadeUp } from "../../components/Motion";
import { imgClass1, imgClass2, imgClass3, imgClass4 } from "../homePageData";

type HomeClass = {
  id: string;
  img: string;
  name: string;
  coach: string;
  time: string;
  slots: string;
  tag: string;
};

export default function HomePageClassesSection() {
  const [classes, setClasses] = useState<HomeClass[]>([]);

  useEffect(() => {
    fetch("/api/classes/available")
      .then((response) => response.ok ? response.json() : [])
      .then((items) => {
        const images = [imgClass1, imgClass2, imgClass3, imgClass4];
        const mapped = (Array.isArray(items) ? items : []).slice(0, 4).map((item: any, index: number) => {
          const start = new Date(item.scheduleTime);
          const end = new Date(start.getTime() + Number(item.durationMinutes || 60) * 60000);
          const available = Math.max(0, Number(item.capacity || 0) - Number(item.currentEnrolled || 0));
          return {
            id: String(item.id),
            img: images[index % images.length],
            name: item.className || "Lớp học",
            coach: item.coachName || "Huấn luyện viên chưa cập nhật",
            time: `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
            slots: available > 0 ? `${available} chỗ trống` : "Đã đủ chỗ",
            tag: available > 0 && available <= 3 ? "SẮP ĐẦY" : "",
          };
        });
        setClasses(mapped);
      })
      .catch(() => setClasses([]));
  }, []);

  return (
    <section className="bg-[#f8fafc] w-full px-[80px] py-[80px] shrink-0">
      <FadeUp className="flex items-end justify-between mb-[40px]">
        <div className="flex flex-col gap-[12px]">
          <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0 w-fit">
            <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase tracking-wider">
              LỊCH HÔM NAY
            </p>
          </div>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
            Lớp nổi bật
          </h2>
        </div>
        <div
          className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 transition-colors"
          data-name="btn-classes"
          onClick={(e) => {
            e.stopPropagation();
            window.location.hash = "#lophoc";
          }}
        >
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">
            Xem tất cả lớp học →
          </p>
        </div>
      </FadeUp>

      <div className="grid grid-cols-4 gap-[20px]">
        {classes.map(({ id, img, name, coach, time, slots, tag }, index) => (
          <FadeUp
            delay={index * 0.1}
            key={id}
            onClick={(e) => {
              e.stopPropagation();
              window.location.hash = "#chitietlophoc";
            }}
            className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden flex flex-col hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-[180px]">
              <img
                alt={name}
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                src={img}
              />
              {tag && (
                <div
                  className={`absolute top-[12px] left-[12px] px-[8px] py-[4px] rounded-[6px] ${
                    tag === "HOT"
                      ? "bg-[#f97316]"
                      : tag === "SẮP ĐẦY"
                        ? "bg-[#dc2626]"
                        : "bg-[#10b981]"
                  }`}
                >
                  <p className="font-['Inter:Bold'] font-bold text-white text-[11px]">
                    {tag}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[10px] p-[18px]">
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[15px] leading-[1.3] m-0">
                {name}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">
                {coach}
              </p>
              <div className="flex items-center justify-between pt-[4px] border-t border-[#f1f5f9]">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[13px] m-0">
                  {time}
                </p>
                <p className="font-['Inter:Regular'] font-normal text-[#10b981] text-[12px] m-0">
                  {slots}
                </p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
