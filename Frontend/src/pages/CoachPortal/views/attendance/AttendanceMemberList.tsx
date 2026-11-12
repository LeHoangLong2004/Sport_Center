import { UserCheck, UserX, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { MockMember, AttendanceRecord, AttendanceStatus } from "../../services/api";

interface Props {
  members: MockMember[];
  records: AttendanceRecord[];
  isLocked: boolean;
  onStatusChange: (memberId: string, status: AttendanceStatus) => void;
  onNoteChange?: (memberId: string, note: string) => void;
  totalEnrolledCount: number;
}

export default function AttendanceMemberList({
  members,
  records,
  isLocked,
  onStatusChange,
  totalEnrolledCount,
}: Props) {
  if (totalEnrolledCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Chưa có học viên đăng ký ca học này
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Học viên có thể đặt lịch trước giờ tập qua ứng dụng Member hoặc được lễ tân xếp lớp tại quầy. Danh sách điểm danh sẽ tự động cập nhật khi có học viên đăng ký.
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Không tìm thấy học viên nào phù hợp
        </h3>
        <p className="text-xs text-slate-400">
          Thử tìm kiếm với từ khóa khác (họ tên, mã học viên hoặc số điện thoại).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header (Desktop & Tablet) */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <div className="col-span-7 flex items-center gap-2">
          <span>Học viên</span>
          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {members.length}
          </span>
        </div>
        <div className="col-span-5 text-right sm:pr-4">Trạng thái điểm danh</div>
      </div>

      {/* Member Roster Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {members.map((m, index) => {
          const record = records.find((r) => r.memberId === m.id);
          const status = record?.status || "chưa điểm danh";

          const isAttended = status === "attended";
          const isAbsent = status === "no_show";
          const isPending = status !== "attended" && status !== "no_show";

          return (
            <div
              key={m.id}
              className={`p-3.5 sm:px-6 transition-colors duration-150 ${
                isAttended
                  ? "bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40"
                  : isAbsent
                  ? "bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40"
                  : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Information: Avatar + Name + Code + Phone / Goal */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* STT Index */}
                  <span className="text-xs font-semibold text-slate-400 w-5 shrink-0 text-center">
                    {index + 1}
                  </span>

                  {/* Avatar with Status Ring */}
                  <div className="relative shrink-0">
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs shadow-xs">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Status Dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        isAttended
                          ? "bg-emerald-500"
                          : isAbsent
                          ? "bg-rose-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  </div>

                  {/* Name, Code & Sub-details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {m.name}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
                        {m.code || `#MB-${m.id.slice(0, 4)}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {m.phone && <span>{m.phone}</span>}
                      {m.phone && m.goal && <span>•</span>}
                      {m.goal && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[180px]">
                          {m.goal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Selection / Badge (Centered/Right-aligned) */}
                <div className="flex items-center justify-end sm:justify-start gap-2 self-end sm:self-center shrink-0">
                  {isLocked ? (
                    /* Read-only Mode Badge */
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold">
                      {isAttended && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Có mặt
                        </span>
                      )}
                      {isAbsent && (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/50 px-3 py-1.5 rounded-lg font-bold">
                          <XCircle className="w-4 h-4" /> Vắng mặt
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4" /> Chưa điểm danh
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Interactive 2-Button Toggle (Có mặt vs Vắng mặt) */
                    <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs gap-1">
                      {/* Có mặt */}
                      <button
                        type="button"
                        onClick={() => onStatusChange(m.id, isAttended ? "chưa điểm danh" : "attended")}
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isAttended
                            ? "bg-emerald-600 text-white shadow-xs font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 ${isAttended ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                        <span>Có mặt</span>
                      </button>

                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />

                      {/* Vắng mặt */}
                      <button
                        type="button"
                        onClick={() => onStatusChange(m.id, isAbsent ? "chưa điểm danh" : "no_show")}
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isAbsent
                            ? "bg-rose-600 text-white shadow-xs font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        }`}
                      >
                        <UserX className={`w-4 h-4 ${isAbsent ? "text-white" : "text-rose-600 dark:text-rose-400"}`} />
                        <span>Vắng</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
