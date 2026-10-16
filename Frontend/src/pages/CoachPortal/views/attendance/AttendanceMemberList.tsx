import type { MockMember, AttendanceRecord } from "../../services/api";

const STATUS_OPTIONS: { value: "attended" | "no_show"; label: string; activeStyle: string }[] = [
  {
    value: "attended",
    label: "Có mặt",
    activeStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-400 dark:border-emerald-500/40 font-semibold shadow-xs",
  },
  {
    value: "no_show",
    label: "Vắng",
    activeStyle: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-400 dark:border-rose-500/40 font-semibold shadow-xs",
  },
];

interface Props {
  members: MockMember[];
  records: AttendanceRecord[];
  isLocked: boolean;
  onStatusChange: (memberId: string, status: "attended" | "no_show") => void;
  onNoteChange: (memberId: string, note: string) => void;
}

export default function AttendanceMemberList({
  members,
  records,
  isLocked,
  onStatusChange,
  onNoteChange,
}: Props) {
  if (members.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-sm text-slate-400">
        Không tìm thấy học viên phù hợp.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {members.map((m) => {
          const record = records.find((r) => r.memberId === m.id);
          const status = record?.status || "chưa điểm danh";
          const note = record?.note || "";

          return (
            <div
              key={m.id}
              className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex flex-1 items-center gap-3.5 min-w-[220px]">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"
                />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {m.code} · {m.goal || "Học viên"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onStatusChange(m.id, opt.value)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      status === opt.value
                        ? opt.activeStyle
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    } ${isLocked ? "cursor-not-allowed opacity-80" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-64">
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="Ghi chú (nếu có)..."
                  value={note}
                  onChange={(e) => onNoteChange(m.id, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/20 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
