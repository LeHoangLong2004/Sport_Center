import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CalendarClock, CheckCircle2, ClipboardList, Search, Sparkles, UserRound } from "lucide-react";
import { CoachAPI } from "../services/api";
import { CoachManualHomeworkComposer } from "./CoachManualHomeworkComposer";
import { cleanWorkoutPlanName, type HomeworkExercise } from "../../MemberPortal/views/workouts/workoutTypes";

type HomeworkAssignment = {
  id: string;
  memberId: string;
  memberName: string;
  memberCode?: string | null;
  planId: string;
  planName: string;
  status: string;
  progressPct?: number | null;
  assignedDate: string;
  dueDate?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  exerciseCount: number;
  exercises: HomeworkExercise[];
};

const STATUS: Record<string, { label: string; tone: string }> = {
  assigned: { label: "Đã giao", tone: "bg-slate-100 text-slate-700" },
  in_progress: { label: "Đang thực hiện", tone: "bg-blue-50 text-blue-700" },
  pending_review: { label: "Chờ duyệt", tone: "bg-amber-50 text-amber-700" },
  completed: { label: "Đã hoàn thành", tone: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Cần làm lại", tone: "bg-rose-50 text-rose-700" },
};

function formatDate(value?: string | null) {
  if (!value) return "Chưa đặt hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa đặt hạn" : new Intl.DateTimeFormat("vi-VN").format(date);
}

export function CoachHomeworksTab({
  onCreateWithAi,
}: {
  onCreateWithAi: () => void;
}) {
  const [items, setItems] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showManualComposer, setShowManualComposer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HomeworkAssignment | null>(null);

  const reload = async () => {
    setError("");
    try {
      const rows = await CoachAPI.getCoachHomeworks();
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setError(err?.message || "Không thể tải bài tập về nhà đã giao.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const counts = useMemo(() => ({
    total: items.length,
    active: items.filter((x) => x.status === "assigned" || x.status === "in_progress").length,
    review: items.filter((x) => x.status === "pending_review").length,
    completed: items.filter((x) => x.status === "completed").length,
  }), [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const text = `${item.memberName} ${item.memberCode || ""} ${item.planName}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase().trim())) && (filter === "all" || item.status === filter);
  }), [items, query, filter]);

  const verify = async (item: HomeworkAssignment, status: "completed" | "rejected") => {
    setVerifyingId(item.id);
    try {
      await CoachAPI.verifyWorkout(item.id, { status });
      await reload();
    } catch (err: any) {
      setError(err?.message || "Không thể cập nhật trạng thái bài tập.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><ClipboardList className="w-6 h-6 text-emerald-600" /> Bài tập về nhà</h1>
          <p className="mt-1 text-sm text-slate-500">Mỗi mục ở đây là một lượt giao riêng cho học viên/lớp; theo dõi hạn hoàn thành, tiến độ và duyệt bài nộp tại đây.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowManualComposer(true)} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-400">＋ Soạn nội dung thủ công</button>
          <button type="button" onClick={onCreateWithAi} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Soạn với AI</button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[ ["Tổng bài đã giao", counts.total], ["Đang thực hiện", counts.active], ["Chờ Coach duyệt", counts.review], ["Đã hoàn thành", counts.completed] ].map(([label, count]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{count}</div></div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo học viên hoặc tên bài tập..." className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm"><option value="all">Tất cả trạng thái</option><option value="assigned">Đã giao</option><option value="in_progress">Đang thực hiện</option><option value="pending_review">Chờ duyệt</option><option value="completed">Đã hoàn thành</option><option value="rejected">Cần làm lại</option></select>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {loading ? <div className="py-16 text-center text-sm text-slate-500">Đang tải bài tập đã giao...</div> : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-14 text-center"><ClipboardList className="mx-auto w-9 h-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-800 dark:text-slate-100">{items.length ? "Không có bài tập phù hợp" : "Chưa có bài tập về nhà nào được giao"}</h3><p className="mt-1 text-sm text-slate-500">Kế hoạch tập luyện là nội dung mẫu; khi giao, hệ thống tạo lượt bài tập riêng và theo dõi tiến độ ở đây.</p><div className="mt-4 flex justify-center gap-2"><button type="button" onClick={() => setShowManualComposer(true)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Soạn nội dung thủ công</button><button type="button" onClick={onCreateWithAi} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Soạn với AI</button></div></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const status = STATUS[item.status] || { label: item.status, tone: "bg-slate-100 text-slate-700" };
            return <article key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-white">{cleanWorkoutPlanName(item.planName)}</h3><div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300"><UserRound className="w-4 h-4 text-emerald-600" />{item.memberName}{item.memberCode ? ` · ${item.memberCode}` : ""}</div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div className="text-xs text-slate-500">Tiến độ</div><div className="mt-1 font-bold">{Math.round(Number(item.progressPct || 0))}% · {item.exerciseCount} bài tập</div><div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, Number(item.progressPct || 0)))}%` }} /></div></div><div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div className="text-xs text-slate-500">Hạn hoàn thành</div><div className="mt-1 flex items-center gap-1.5 font-bold"><CalendarClock className="w-4 h-4 text-slate-400" />{formatDate(item.dueDate)}</div><div className="mt-1 text-xs text-slate-500">Giao ngày {formatDate(item.assignedDate)}</div></div></div>
              <button type="button" onClick={() => setSelectedItem(item)} className="mt-4 w-full rounded-xl border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">Xem chi tiết bài tập ({item.exerciseCount})</button>
              {item.notes && <p className="mt-3 text-sm text-slate-500">Ghi chú: {item.notes}</p>}
              {item.status === "pending_review" && <div className="mt-4 flex justify-end gap-2"><button type="button" disabled={verifyingId === item.id} onClick={() => void verify(item, "rejected")} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 disabled:opacity-50">Yêu cầu làm lại</button><button type="button" disabled={verifyingId === item.id} onClick={() => void verify(item, "completed")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 className="w-4 h-4" />Duyệt hoàn thành</button></div>}
            </article>;
          })}
        </div>
      )}
      {showManualComposer && <CoachManualHomeworkComposer onClose={() => setShowManualComposer(false)} onCreated={() => { setShowManualComposer(false); void reload(); }} />}
      {selectedItem && createPortal(<div className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelectedItem(null)}><section role="dialog" aria-modal="true" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}><header className="flex shrink-0 items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800"><div><div className="text-xs font-bold uppercase tracking-wide text-emerald-600">Chi tiết bài tập về nhà</div><h2 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{cleanWorkoutPlanName(selectedItem.planName)}</h2><p className="mt-1 text-sm text-slate-500">{selectedItem.memberName} · {Math.round(Number(selectedItem.progressPct || 0))}% hoàn thành</p></div><button type="button" onClick={() => setSelectedItem(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Đóng">×</button></header><div className="min-h-0 overflow-y-auto p-5"><div className="space-y-3">{(selectedItem.exercises || []).map((exercise, index) => <article key={exercise.id || index} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="font-bold text-slate-900 dark:text-white">{index + 1}. {exercise.name}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{[exercise.sets && `${exercise.sets} hiệp`, exercise.reps, exercise.duration, exercise.rest && `Nghỉ ${exercise.rest}`].filter(Boolean).join(" · ") || "Theo hướng dẫn"}</p>{exercise.note && <p className="mt-2 text-sm text-slate-500">{exercise.note}</p>}</article>)}{(!selectedItem.exercises || selectedItem.exercises.length === 0) && <p className="text-sm text-slate-500">Không có chi tiết bài tập.</p>}</div>{selectedItem.notes && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Ghi chú: {selectedItem.notes}</p>}</div><footer className="flex shrink-0 justify-end border-t border-slate-100 p-4 dark:border-slate-800"><button type="button" onClick={() => setSelectedItem(null)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Đóng</button></footer></section></div>, document.body)}
    </section>
  );
}
