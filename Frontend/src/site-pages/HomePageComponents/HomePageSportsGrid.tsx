import { useEffect, useState } from "react";
import { FadeUp } from "../../components/Motion";
import { imgHeroBg } from "../homePageData";

type HomeSport = { id: string; img: string; label: string };

export default function HomePageSportsGrid() {
  const [sports, setSports] = useState<HomeSport[]>([]);

  useEffect(() => {
    fetch("/api/sports")
      .then((response) => response.ok ? response.json() : [])
      .then((items) => {
        setSports((Array.isArray(items) ? items : []).slice(0, 6).map((item: any) => ({
          id: String(item.id),
          img: item.imageUrl || imgHeroBg,
          label: item.name || "Bộ môn",
        })));
      })
      .catch(() => setSports([]));
  }, []);

  return (
    <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
      <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
        <div className="bg-slate-100 border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            {sports.length} BỘ MÔN
          </p>
        </div>
        <h2 className="font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
          Khám phá bộ môn tại SportCenter
        </h2>
        <p className="font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
          Từ gym chuẩn quốc tế, hồ bơi trị liệu đến yoga, boxing và bóng rổ —
          mọi đam mê thể thao đều có chỗ tại đây.
        </p>
      </FadeUp>

      <div className="grid grid-cols-3 gap-[20px]">
        {sports.map(({ id, img, label }, index) => (
          <FadeUp
            delay={index * 0.1}
            key={label}
            onClick={(e) => {
              e.stopPropagation();
              window.location.hash = `#chitietbomon?sport=${id}`;
            }}
            className="relative rounded-[16px] overflow-hidden h-[220px] cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover max-w-none transition-transform duration-500 group-hover:scale-105"
              src={img}
              onError={(e) => {
                const norm = (label || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                let fallback = imgHeroBg;
                if (norm.includes("boi") || norm.includes("swim")) fallback = "/assets/cfb22.png";
                else if (norm.includes("yoga")) fallback = "/assets/88bba.png";
                else if (norm.includes("gym") || norm.includes("the hinh") || norm.includes("hiit")) fallback = "/assets/e865e.png";
                else if (norm.includes("box")) fallback = "/assets/252a5.png";
                else if (norm.includes("bong ro") || norm.includes("basket")) fallback = "/assets/3c386.png";
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.9)] via-[rgba(11,31,58,0.3)] to-transparent" />
            <div className="absolute bottom-0 left-0 p-[20px] transform transition-transform duration-300 group-hover:-translate-y-2">
              <p className="font-bold text-white text-[17px] leading-none">
                {label}
              </p>
              <p className="font-normal text-[#10b981] text-[13px] mt-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Khám phá →
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
