import { useEffect, useState } from "react";
import { FadeUp } from "../../components/Motion";
import { imgHeroBg } from "../homePageData";

type AboutStats = { value: string; label: string };

export function HomePageAboutSection() {
  const [image, setImage] = useState(imgHeroBg);
  const [stats, setStats] = useState<AboutStats[]>([
    { value: "—", label: "Không gian" },
    { value: "—", label: "Huấn luyện viên" },
    { value: "—", label: "Lớp đang mở" },
    { value: "—", label: "Suất trống" },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/facilities").then((response) => response.ok ? response.json() : []),
      fetch("/api/coaches").then((response) => response.ok ? response.json() : []),
      fetch("/api/classes/available").then((response) => response.ok ? response.json() : []),
    ]).then(([facilities, coaches, classes]) => {
      const facilityRows = Array.isArray(facilities) ? facilities : [];
      const coachRows = Array.isArray(coaches) ? coaches : [];
      const classRows = Array.isArray(classes) ? classes : [];
      const firstImage = facilityRows.find((facility: any) => facility.imageUrl)?.imageUrl;
      if (firstImage) setImage(firstImage);
      setStats([
        { value: String(facilityRows.length), label: "Không gian" },
        { value: String(coachRows.length), label: "Huấn luyện viên" },
        { value: String(classRows.length), label: "Lớp đang mở" },
        { value: String(classRows.reduce((sum: number, item: any) => sum + Math.max(0, Number(item.capacity || 0) - Number(item.currentEnrolled || 0)), 0)), label: "Suất trống" },
      ]);
    }).catch(() => undefined);
  }, []);

  return (
    <section className="bg-[#f8fafc] flex gap-[60px] items-center px-[80px] py-[80px] w-full shrink-0">
      <FadeUp className="flex-1 min-w-0 rounded-[20px] overflow-hidden h-[420px] relative shrink-0 shadow-2xl" style={{ maxWidth: "520px" }}>
        <img alt="Không gian SportCenter" className="absolute inset-0 w-full h-full object-cover max-w-none hover:scale-105 transition-transform duration-700" src={image} />
      </FadeUp>
      <FadeUp delay={0.2} className="flex-1 min-w-0 flex flex-col gap-[24px] items-start">
        <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase tracking-wider">HỆ SINH THÁI THỂ THAO</p>
        </div>
        <div className="flex flex-col gap-[4px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[34px] leading-[1.2] m-0">Không gian luyện tập<br />chuẩn quốc tế</h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px] mt-[10px]" />
        </div>
        <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.7] m-0">SportCenter cung cấp hệ sinh thái luyện tập với các bộ môn, phòng tập và huấn luyện viên được quản lý tập trung.</p>
        <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.7] m-0">Thông tin trên trang được đồng bộ từ dữ liệu thực tế của trung tâm để hội viên dễ dàng khám phá và đặt lịch.</p>
        <div className="grid grid-cols-2 gap-[16px] w-full mt-[4px]">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-white border border-[#e2e8f0] flex flex-col gap-[4px] p-[16px] rounded-[12px]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[22px] leading-none m-0">{value}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">{label}</p>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
