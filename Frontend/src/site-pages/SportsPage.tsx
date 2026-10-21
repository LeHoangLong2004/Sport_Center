import { useMemo, useState } from "react";
import { FadeIn, FadeUp } from "../components/Motion";
import { SportCard } from "./SportCard";
import { imgCircleX, imgDumbbell, imgHeroBg, imgChevronDown } from "./sportsPageData";
import { useSportsCatalog } from "./useSportsCatalog";

const fallbackIcons = [imgCircleX, imgDumbbell];

function getSportSlug(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BoMonPage() {
  const [activeSport, setActiveSport] = useState("all");
  const { sports, coaches, isLoading, loadError } = useSportsCatalog();
  const visibleSports = useMemo(() => activeSport === "all" ? sports : sports.filter((sport) => sport.id === activeSport), [activeSport, sports]);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <section className="relative flex flex-col gap-[32px] items-start px-[80px] py-[100px] w-full min-h-[480px] justify-center overflow-hidden">
        <FadeIn className="absolute inset-0 pointer-events-none"><img alt="" className="absolute inset-0 w-full h-full object-cover" src={imgHeroBg} /><div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" /><div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" /></FadeIn>
        <div className="relative z-10 flex flex-col gap-[16px] items-start w-full">
          <FadeUp className="bg-[rgba(16,185,129,0.12)] border border-[#10b981] px-[14px] py-[7px] rounded-full"><p className="font-bold text-[#10b981] text-[12px] uppercase tracking-wider">HỆ SINH THÁI THỂ THAO</p></FadeUp>
          <FadeUp delay={0.2}><p className="font-extrabold text-white text-[48px] leading-[1.1] max-w-[720px]">Chọn chuyển động phù hợp với cơ thể bạn</p></FadeUp>
          <FadeUp delay={0.3}><p className="text-[#cbd5e1] text-[18px] leading-[1.6] max-w-[640px]">Khám phá các bộ môn đang được trung tâm quản lý và đăng ký lớp học phù hợp với mục tiêu luyện tập.</p></FadeUp>
        </div>
        <FadeUp delay={0.4} className="relative z-10 flex flex-wrap gap-[12px] items-start w-full">
          <SportFilter active={activeSport === "all"} onClick={() => setActiveSport("all")} label="Tất cả bộ môn" />
          {sports.map((sport) => <SportFilter key={sport.id} active={activeSport === sport.id} onClick={() => setActiveSport(sport.id)} label={sport.name} />)}
        </FadeUp>
      </section>

      <section className="bg-[#f8fafc] flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full">
        <FadeUp className="flex flex-col gap-[8px] items-start w-full"><p className="font-extrabold text-[#0f172a] text-[32px]">Các bộ môn tại SportCenter</p><div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" /></FadeUp>
        {isLoading && <p className="text-[#64748b] text-[14px]">Đang tải danh sách bộ môn...</p>}
        {!isLoading && loadError && <p className="text-[#dc2626] text-[14px]">{loadError}</p>}
        {!isLoading && !loadError && visibleSports.length === 0 && <p className="text-[#64748b] text-[14px]">Chưa có bộ môn nào trong hệ thống.</p>}
        {!isLoading && !loadError && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px] w-full">{visibleSports.map((sport, index) => <SportCard key={sport.id} id={getSportSlug(sport.name) || sport.id} img={sport.imageUrl || imgHeroBg} badge="Bộ môn" icon={fallbackIcons[index % fallbackIcons.length]} title={sport.name} desc={sport.description || "Khám phá lớp học và lịch tập phù hợp tại SportCenter."} stat="Xem lớp học đang mở" delay={index * 0.05} tall={false} />)}</div>}
      </section>

      <section className="bg-white flex flex-col gap-[32px] items-start px-[80px] py-[64px] w-full">
        <FadeUp className="flex flex-col gap-[8px] items-start w-full"><p className="font-extrabold text-[#0f172a] text-[32px]">Được hướng dẫn bởi các huấn luyện viên</p><div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" /></FadeUp>
        {coaches.length === 0 ? <p className="text-[#64748b] text-[14px]">Chưa có huấn luyện viên trong hệ thống.</p> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px] w-full">{coaches.map((coach, index) => <FadeUp key={coach.id} delay={index * 0.05} className="bg-white border border-[#e2e8f0] flex flex-col overflow-hidden rounded-[16px] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all"><div className="h-[260px] w-full overflow-hidden"><img alt={coach.name} className="w-full h-full object-cover" src={coach.img || imgHeroBg} /></div><div className="flex flex-col gap-[10px] p-[20px]"><h3 className="font-extrabold text-[#0f172a] text-[18px]">{coach.name}</h3><p className="font-semibold text-[#2563eb] text-[14px]">{coach.spec}</p><p className="text-[#64748b] text-[13px] leading-relaxed min-h-[58px]">{coach.desc}</p></div></FadeUp>)}</div>}
      </section>

      <section className="bg-[#f8fafc] flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full"><FadeUp className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full relative shadow-2xl"><div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent pointer-events-none rounded-[24px]" /><div className="relative z-10 flex flex-col gap-[12px] items-start text-center w-full"><p className="font-extrabold text-white text-[32px] w-full">Trải nghiệm tập thử bộ môn bạn yêu thích</p><p className="text-[#94a3b8] text-[16px] w-full">Để lại thông tin, đội ngũ tư vấn sẽ liên hệ với bạn.</p></div><div className="relative z-10 flex gap-[16px] items-center w-full"><input type="text" placeholder="Họ và tên của bạn" className="bg-[#1e293b] border border-[#334155] flex-1 px-[16px] py-[14px] rounded-[8px] text-white outline-none placeholder:text-[#94a3b8] focus:border-[#10b981]" /><input type="tel" placeholder="Số điện thoại liên hệ" className="bg-[#1e293b] border border-[#334155] flex-1 px-[16px] py-[14px] rounded-[8px] text-white outline-none placeholder:text-[#94a3b8] focus:border-[#10b981]" /><div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-center justify-between px-[16px] py-[14px] rounded-[8px]"><p className="text-[#94a3b8] text-[14px]">Chọn bộ môn muốn thử</p><img alt="" src={imgChevronDown} className="w-[16px] h-[16px]" /></div><button className="bg-[#10b981] text-white font-extrabold px-[24px] py-[14px] rounded-[8px]">Nhận vé tập thử</button></div></FadeUp></section>
    </div>
  );
}

function SportFilter({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <div onClick={onClick} className={`flex items-center px-[20px] py-[12px] rounded-full cursor-pointer hover:bg-[#2563eb] transition-colors ${active ? "bg-[#2563eb]" : "bg-[rgba(30,41,59,0.5)] border border-[#334155] backdrop-blur-md"}`}><p className="font-semibold text-white text-[14px] whitespace-nowrap">{label}</p></div>;
}
