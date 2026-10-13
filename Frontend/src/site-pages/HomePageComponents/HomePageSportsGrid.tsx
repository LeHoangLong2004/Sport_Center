import { FadeUp } from "../../components/Motion";
import { sports } from "../homePageData";

export default function HomePageSportsGrid() {
  return (
    <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
      <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
        <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">
            12 BỘ MÔN
          </p>
        </div>
        <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
          Khám phá bộ môn tại SportCenter
        </h2>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
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
              alt={label}
              className="absolute inset-0 w-full h-full object-cover max-w-none transition-transform duration-500 group-hover:scale-105"
              src={img}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.9)] via-[rgba(11,31,58,0.3)] to-transparent" />
            <div className="absolute bottom-0 left-0 p-[20px] transform transition-transform duration-300 group-hover:-translate-y-2">
              <p className="font-['Inter:Bold'] font-bold text-white text-[17px] leading-none">
                {label}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#10b981] text-[13px] mt-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Khám phá →
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
