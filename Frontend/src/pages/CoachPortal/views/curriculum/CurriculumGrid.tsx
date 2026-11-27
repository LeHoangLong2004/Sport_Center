import React, { useState } from "react";
import {
  Clock,
  Dumbbell,
  Users,
  Edit2,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Archive,
} from "lucide-react";
import type { MockCurriculum } from "../../services/api";
import {
  getEffectiveStatus,
  getValidAssignmentText,
  cleanDuplicateSuffixes,
} from "./curriculumUtils";

interface CurriculumGridProps {
  loading: boolean;
  curricula: MockCurriculum[];
  onEdit: (c: MockCurriculum) => void;
  onAssign: (c: MockCurriculum) => void;
  onApprove?: (c: MockCurriculum) => void;
  approvingId?: string | null;
  onDelete: (c: MockCurriculum) => void;
  deletingId?: string | null;
}

interface CurriculumCardProps {
  curriculum: MockCurriculum;
  onEdit: (c: MockCurriculum) => void;
  onAssign: (c: MockCurriculum) => void;
  onApprove?: (c: MockCurriculum) => void;
  approvingId?: string | null;
  onDelete: (c: MockCurriculum) => void;
  deletingId?: string | null;
}

const CurriculumCard: React.FC<CurriculumCardProps> = ({
  curriculum: c,
  onEdit,
  onAssign,
  onApprove,
  approvingId,
  onDelete,
  deletingId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const effectiveStatus = getEffectiveStatus(c);
  const assignmentInfo = getValidAssignmentText(c);
  const isAiPlan = c.source === "ai_recommendation" || c.source === "ai";
  const displayTitle = cleanDuplicateSuffixes(c.name).replace(/^giáo\s*án\s*/i, "").trim() || c.name;
  const exerciseCount = Array.isArray(c.exercises) ? c.exercises.length : 0;
  const sessions = c.programOutline?.sessions || [];
  const sessionsToShow = isExpanded ? sessions : sessions.slice(0, 3);
  const hasMoreSessions = sessions.length > 3;
  const exercisesToShow = isExpanded ? c.exercises : c.exercises.slice(0, 3);
  const hasMoreExercises = exerciseCount > 3;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md shadow-xs group">
      <div>
        {/* TẦNG 1: Tiêu đề + Huy hiệu AI + Huy hiệu trạng thái */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug break-words"
                title={displayTitle}
              >
                {displayTitle}
              </h3>
              {isAiPlan && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  AI Gợi ý
                </span>
              )}
            </div>
          </div>

          {/* Huy hiệu trạng thái chuẩn hóa */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${effectiveStatus.badgeClass} shrink-0 inline-flex items-center gap-1 shadow-xs`}
            title={effectiveStatus.tooltip}
          >
            {effectiveStatus.key === "ready" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            {effectiveStatus.key === "empty" && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            {effectiveStatus.label}
          </span>
        </div>

        {/* TẦNG 2: Tag metadata (Bộ môn, Trình độ, Thời lượng) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
            {c.sport || "Chưa xác định"}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700">
            {c.level || "Cơ bản"}
          </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="text-slate-900 dark:text-slate-100 font-semibold">{c.duration || 60}</span> phút/buổi
          </span>
          {c.programOutline && <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800">{c.programOutline.durationWeeks} tuần · {sessions.length} buổi</span>}
        </div>

        {/* TẦNG 3: Mục tiêu kế hoạch (độ tương phản cao) */}
        {c.goal && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">Mục tiêu:</span>
            {c.goal}
          </div>
        )}

        {/* TẦNG 4: Lộ trình các buổi trong kế hoạch */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {sessions.length > 0 ? `Lộ trình (${sessions.length} buổi)` : `Bài tập thuộc kế hoạch (${exerciseCount})`}
            </span>
            {(sessions.length > 0 ? hasMoreSessions : hasMoreExercises) && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer py-0.5 px-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                {isExpanded ? (
                  <>
                    Thu gọn <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                  </>
                ) : (
                  <>
                    Xem toàn bộ <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-1.5">
              {sessionsToShow.map((session) => (
                <div key={`${session.sessionNumber}-${session.weekNumber}`} className="px-2.5 py-2 rounded-lg bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Buổi {session.sessionNumber} · Tuần {session.weekNumber}: {session.title || "Chưa đặt chủ đề"}</div>
                  {session.goal && <div className="mt-0.5 text-slate-600 dark:text-slate-400">{session.goal}</div>}
                  <div className="mt-1 text-[11px] text-slate-500">{session.exercises.length} bài tập</div>
                </div>
              ))}
              {hasMoreSessions && !isExpanded && <button type="button" onClick={() => setIsExpanded(true)} className="w-full py-1 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg">+ Xem thêm {sessions.length - 3} buổi</button>}
            </div>
          ) : exerciseCount === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Chưa có bài tập nào trong kế hoạch.
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5 text-[11px] leading-relaxed">
                  Đây là nội dung của kế hoạch. Hãy thêm bài tập trước khi tạo lượt giao cho học viên.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {exercisesToShow.map((ex, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-4 text-right shrink-0">
                      {i + 1}.
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {ex.name || `Bài tập ${i + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ex.reps && (
                      <span className="px-1.5 py-0.5 text-[11px] font-medium rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {ex.reps}
                      </span>
                    )}
                    {ex.rest && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        nghỉ {ex.rest}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {!isExpanded && hasMoreExercises && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="w-full py-1 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                >
                  + Xem thêm {exerciseCount - 3} bài tập nữa ▾
                </button>
              )}
            </div>
          )}
        </div>

        {/* TẦNG 5: Thông tin giao bài (đồng bộ trạng thái) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div
            className={`text-xs flex items-center gap-2 ${
              assignmentInfo.isAssigned
                ? "text-sky-800 dark:text-sky-300 font-semibold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Users
              className={`w-3.5 h-3.5 shrink-0 ${
                assignmentInfo.isAssigned
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-slate-400"
              }`}
            />
            <span className="truncate">{assignmentInfo.displayText}</span>
          </div>
        </div>
      </div>

      {/* TẦNG 6: Nhóm nút hành động + Ngày cập nhật */}
      <div className="flex items-center justify-between gap-3 pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Cập nhật: <span className="text-slate-700 dark:text-slate-300 font-semibold">{c.updatedAt}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={deletingId === c.id}
            onClick={() => onDelete(c)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg border border-amber-200 dark:border-amber-900/60 transition-colors disabled:opacity-50"
            title="Xóa kế hoạch"
            aria-label={`Xóa kế hoạch ${c.name}`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{deletingId === c.id ? "Đang xóa..." : "Xóa"}</span>
          </button>
          {/* Nút Duyệt sẵn sàng nếu là bản nháp và đã có bài */}
          {onApprove && c.status === "Nháp" && exerciseCount > 0 && (
            <button
              type="button"
              disabled={approvingId === c.id}
              onClick={() => onApprove(c)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
              title="Đánh dấu kế hoạch này là sẵn sàng giao cho học viên"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{approvingId === c.id ? "Đang xử lý..." : "Duyệt sẵn sàng"}</span>
            </button>
          )}

          {/* Nút Sửa / Thêm bài tập */}
          <button
            type="button"
            onClick={() => onEdit(c)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>{exerciseCount === 0 ? "Thêm bài tập" : "Sửa"}</span>
          </button>

          {/* Chia sẻ kế hoạch tập luyện trong thư viện cho học viên/lớp. */}
          {exerciseCount === 0 ? (
            <button
              type="button"
              disabled
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-not-allowed opacity-70"
              title="Cần thêm ít nhất 1 bài tập trước khi giao"
            >
              <Send className="w-3 h-3" />
              <span>Giao kế hoạch</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAssign(c)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1.5 shadow-xs shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>{c.assignedTo.length > 0 ? "Giao thêm" : "Giao kế hoạch"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CurriculumGrid: React.FC<CurriculumGridProps> = ({
  loading,
  curricula,
  onEdit,
  onAssign,
  onApprove,
  approvingId,
  onDelete,
  deletingId,
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mb-3" />
        <p className="font-medium text-sm">Đang tải danh sách kế hoạch...</p>
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        <Dumbbell className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2 opacity-60" />
        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
          Không tìm thấy kế hoạch nào phù hợp.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái / bộ môn.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {curricula.map((c) => (
        <CurriculumCard
          key={c.id}
          curriculum={c}
          onEdit={onEdit}
          onAssign={onAssign}
          onApprove={onApprove}
          approvingId={approvingId}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
};
