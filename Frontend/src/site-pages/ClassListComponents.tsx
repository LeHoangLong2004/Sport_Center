import { FadeUp } from "../components/Motion";

const A = "/assets";
const imgUser = `${A}/9b7e7.svg`;
const imgClock = `${A}/0d849.svg`;
const imgMapPin = `${A}/b6ae5.svg`;

export type ClassStatus = "available" | "full" | "almost";

export interface ClassItem {
  id: string;
  title: string;
  status: ClassStatus;
  statusLabel: string;
  trainer: string;
  schedule: string;
  location: string;
  spots: string;
  img: string;
}

function StatusBadge({
  status,
  label,
}: {
  status: ClassStatus;
  label: string;
}) {
  const styles: Record<ClassStatus, string> = {
    available: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
    full: "bg-[rgba(100,116,139,0.1)] text-[#64748b]",
    almost: "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full font-['Inter:Bold'] font-bold text-[12px] ${styles[status]}`}
    >
      {label}
    </span>
  );
}

export function ClassCard({ item }: { item: ClassItem }) {
  const isAvailable = item.status !== "full";

  return (
    <FadeUp
      className="bg-white border border-[#e2e8f0] rounded-2xl p-5 flex gap-5 items-center shadow-[0_4px_6px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-1 hover:border-[#10b981] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition-all duration-300 group"
      data-name="class-card"
      data-class-id={item.id}
    >
      <div className="shrink-0 w-[180px] h-[130px] rounded-xl overflow-hidden relative">
        <img
          src={item.img}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-normal truncate max-w-[280px] group-hover:text-[#10b981] transition-colors">
            {item.title}
          </p>
          <StatusBadge status={item.status} label={item.statusLabel} />
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <span className="flex gap-1.5 items-center shrink-0">
            <img src={imgUser} alt="" className="w-[11px] h-[11px]" />
            <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] whitespace-nowrap">
              {item.trainer}
            </span>
          </span>
          <span className="flex gap-1.5 items-center shrink-0">
            <img src={imgClock} alt="" className="w-[11px] h-[11px]" />
            <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] whitespace-nowrap">
              {item.schedule}
            </span>
          </span>
          <span className="flex gap-1.5 items-center min-w-0">
            <img
              src={imgMapPin}
              alt=""
              className="w-[11px] h-[11px] shrink-0"
            />
            <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] truncate">
              {item.location}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`font-['Inter:Semi_Bold'] font-semibold text-[13px] ${item.status === "full" ? "text-[#64748b]" : "text-[#059669]"}`}
          >
            {item.spots}
          </span>
          {isAvailable ? (
            <button
              className="bg-[#2563eb] text-white font-['Inter:Bold'] font-bold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors"
              data-name="btn-detail"
              data-class-id={item.id}
              type="button"
            >
              Chi tiết &amp; Đăng ký
            </button>
          ) : (
            <button
              className="bg-[#94a3b8] text-white font-['Inter:Bold'] font-bold text-[13px] px-4 py-2 rounded-lg cursor-not-allowed"
              type="button"
              disabled
            >
              Đã đầy chỗ
            </button>
          )}
        </div>
      </div>
    </FadeUp>
  );
}
