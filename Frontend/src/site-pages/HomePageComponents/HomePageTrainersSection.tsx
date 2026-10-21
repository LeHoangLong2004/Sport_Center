import { useEffect, useState } from "react";
import { FadeUp } from "../../components/Motion";
import { StarRow } from "./StarRow";
import { imgFlame, imgHeroBg } from "../homePageData";

type HomeTrainer = {
  id: string;
  img: string;
  name: string;
  specialty: string;
  exp: string;
  rating: number | null;
};

export default function HomePageTrainersSection() {
  const [trainers, setTrainers] = useState<HomeTrainer[]>([]);

  useEffect(() => {
    fetch("/api/coaches")
      .then((response) => response.ok ? response.json() : [])
      .then((items) => {
        setTrainers((Array.isArray(items) ? items : []).slice(0, 4).map((item: any) => ({
          id: String(item.id),
          img: item.avatarUrl || imgHeroBg,
          name: item.fullName || "Huấn luyện viên",
          specialty: item.specialty || "Chưa cập nhật chuyên môn",
          exp: item.experienceYears == null ? "Chưa cập nhật" : `${item.experienceYears} năm`,
          rating: typeof item.rating === "number" ? item.rating : null,
        })));
      })
      .catch(() => setTrainers([]));
  }, []);

  return (
    <section className="bg-white w-full px-[80px] py-[80px] shrink-0">
      <FadeUp className="flex flex-col gap-[12px] items-center text-center mb-[48px]">
        <div className="bg-[rgba(37,99,235,0.08)] border border-[#2563eb] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[11px] uppercase tracking-wider">
            ĐỘI NGŨ CHUYÊN GIA
          </p>
        </div>
        <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] m-0 leading-[1.2]">
          Chứng nhận huấn luyện viên
        </h2>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] max-w-[520px] m-0">
          Đội ngũ hơn 48 HLV được chứng nhận quốc tế — ACE, ISSA, ACSM — với
          kinh nghiệm từ 5 đến 15 năm.
        </p>
      </FadeUp>

      <div className="grid grid-cols-4 gap-[24px]">
        {trainers.map(({ id, img, name, specialty, exp, rating }, index) => (
          <FadeUp
            delay={index * 0.1}
            key={id}
            onClick={(e) => {
              e.stopPropagation();
              window.location.hash = "#coach";
            }}
            className="border border-[#e2e8f0] flex flex-col gap-[16px] p-[24px] rounded-[20px] items-center text-center hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="size-[96px] rounded-full overflow-hidden shrink-0 shadow-md">
              <img
                alt={name}
                className="w-full h-full object-cover"
                src={img}
              />
            </div>
            <div className="flex flex-col gap-[4px] items-center">
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] m-0">
                {name}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">
                {specialty}
              </p>
            </div>
            {rating === null ? (
              <p className="text-xs text-slate-400">Chưa có đánh giá</p>
            ) : (
              <StarRow rating={rating} />
            )}
            <div className="flex gap-[8px] items-center">
              <img alt="" src={imgFlame} style={{ width: 14, height: 14 }} />
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[13px] m-0">
                {exp}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
