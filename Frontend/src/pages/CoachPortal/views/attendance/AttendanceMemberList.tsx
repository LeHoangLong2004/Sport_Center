import { UserCheck, UserX, Clock, MessageSquare, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { MockMember, AttendanceRecord, AttendanceStatus } from "../../services/api";

interface Props {
  members: MockMember[];
  records: AttendanceRecord[];
  isLocked: boolean;
  onStatusChange: (memberId: string, status: AttendanceStatus) => void;
  onNoteChange: (memberId: string, note: string) => void;
  totalEnrolledCount: number;
}

export default function AttendanceMemberList({
  members,
  records,
  isLocked,
  onStatusChange,
  onNoteChange,
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
          Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab trạng thái khác.
        </p>
      </div>
    );
  }

  const quickNotes = [
    { label: "+ Đi muộn", text: "Đi muộn", setStatus: "attended" as AttendanceStatus },
    { label: "+ Có phép", text: "Có phép", setStatus: "no_show" as AttendanceStatus },
    { label: "+ Thể lực tốt", text: "Thể lực tốt", setStatus: null },
    { label: "+ Đau mỏi cơ", text: "Đau mỏi cơ", setStatus: null },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header (Desktop & Tablet) */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <div className="col-span-5 flex items-center gap-2">
          <span>Học viên</span>
          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {members.length}
          </span>
        </div>
        <div className="col-span-3 text-center">Trạng thái điểm danh</div>
        <div className="col-span-4">Ghi chú buổi tập</div>
      </div>

      {/* Member Roster Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {members.map((m, index) => {
          const record = records.find((r) => r.memberId === m.id);
          const status = record?.status || "chưa điểm danh";
          const note = record?.note || "";

          const isAttended = status === "attended";
          const isAbsent = status === "no_show";
          const isPending = status === "chưa điểm danh";

          return (
            <div
              key={m.id}
              className={`p-4 sm:px-6 transition-colors duration-150 ${
                isAttended
                  ? "bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/50"
                  : isAbsent
                  ? "bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/50"
                  : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Column 1: Student Information (5 cols) */}
                <div className="md:col-span-5 flex items-center gap-3.5 min-w-0">
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
                        className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs shadow-xs">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Status Dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {m.name}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {m.code || `#MEM-${m.id.slice(0, 4)}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {m.phone && <span className="">{m.phone}</span>}
                      {m.phone && m.goal && <span>•</span>}
                      {m.goal && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[160px]">
                          Mục tiêu: {m.goal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: Attendance Action Buttons (3 cols, centered) */}
                <div className="md:col-span-3 flex flex-col items-center justify-center gap-1.5">
                  {/* Segmented Button Group */}
                  <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => onStatusChange(m.id, isAttended ? "chưa điểm danh" : "attended")}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                        isAttended
                          ? "bg-emerald-600 text-white shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
                      } ${isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                    >
                      <UserCheck className={`w-4 h-4 ${isAttended ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                      Có mặt
                    </button>

                    <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => onStatusChange(m.id, isAbsent ? "chưa điểm danh" : "no_show")}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                        isAbsent
                          ? "bg-rose-600 text-white shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-rose-700 hover:bg-rose-50/60 dark:hover:bg-rose-950/30"
                      } ${isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                    >
                      <UserX className={`w-4 h-4 ${isAbsent ? "text-white" : "text-rose-600 dark:text-rose-400"}`} />
                      Vắng mặt
                    </button>
                  </div>

                  {/* Status Helper Tag */}
                  <div className="text-[11px] font-medium">
                    {isAttended && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Đã xác nhận có mặt
                      </span>
                    )}
                    {isAbsent && (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3 h-3" /> Đã ghi nhận vắng
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3 h-3" /> Chưa điểm danh
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 3: Notes & Quick Tags (4 cols) */}
                <div className="md:col-span-4 space-y-1.5">
                  <div className="relative">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="Ghi chú buổi tập (thể lực, lý do...)"
                      value={note}
                      onChange={(e) => onNoteChange(m.id, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed shadow-2xs"
                    />
                  </div>

                  {!isLocked && (
                    <div className="flex flex-wrap items-center gap-1">
                      {quickNotes.map((qn) => (
                        <button
                          key={qn.label}
                          type="button"
                          onClick={() => {
                            const newNote = note ? `${note}, ${qn.text}` : qn.text;
                            onNoteChange(m.id, newNote);
                            if (qn.setStatus) {
                              onStatusChange(m.id, qn.setStatus);
                            }
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                        >
                          {qn.label}
                        </button>
                      ))}
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
