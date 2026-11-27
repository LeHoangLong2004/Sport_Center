import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CalendarClock, ClipboardList, Plus, Send, Sparkles, UserRound, Users, X } from "lucide-react";
import type { CoachClassOverview, Flow5Exercise, MockMember, SportOption } from "../services/api";
import { CoachAPI } from "../services/api";
import { DateInput } from "../../../components/DateInput";
import { CoachAiExerciseCard } from "./coach-ai/CoachAiExerciseCard";

const newExercise = (order: number): Flow5Exercise => ({
  name: "",
  sets: "3",
  reps: "10 lần",
  duration: "",
  rest: "60 giây",
  note: "",
  order,
});

export function CoachManualHomeworkComposer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [members, setMembers] = useState<MockMember[]>([]);
  const [classes, setClasses] = useState<CoachClassOverview[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [targetType, setTargetType] = useState<"member" | "class">("member");
  const [targetId, setTargetId] = useState("");
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Cơ bản");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Flow5Exercise[]>([newExercise(1)]);

  useEffect(() => {
    let active = true;
    Promise.all([CoachAPI.getMembersOverview(), CoachAPI.getSports()])
      .then(([overview, availableSports]) => {
        if (!active) return;
        const loadedMembers = Array.isArray(overview.members) ? overview.members : [];
        const loadedClasses = Array.isArray(overview.classes) ? overview.classes : [];
        setMembers(loadedMembers);
        setClasses(loadedClasses);
        setSports(availableSports);
        setTargetType(loadedMembers.length ? "member" : "class");
        setTargetId(loadedMembers[0]?.id || loadedClasses[0]?.id || "");
        setSportId(availableSports[0]?.id || "");
      })
      .catch((err: any) => setError(err?.message || "Không thể tải danh sách học viên, lớp và bộ môn."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const changeExercise = (index: number, patch: Partial<Flow5Exercise>) => {
    setExercises((current) => current.map((exercise, i) => i === index ? { ...exercise, ...patch } : exercise));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= exercises.length) return;
    setExercises((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((exercise, i) => ({ ...exercise, order: i + 1 }));
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) return setError("Nhập tên bài tập về nhà.");
    if (!targetId) return setError("Chọn học viên hoặc lớp nhận bài tập.");
    const cleanExercises = exercises.filter((exercise) => exercise.name.trim());
    if (!cleanExercises.length) return setError("Thêm ít nhất một bài tập và nhập tên bài tập.");

    setSubmitting(true);
    try {
      await CoachAPI.createManualHomework({
        target: { type: targetType, id: targetId },
        planName: name.trim(),
        sportId: sportId || undefined,
        goal: goal.trim() || undefined,
        level,
        durationMinutes,
        dueDate: dueDate ? `${dueDate}T12:00:00.000Z` : undefined,
        notes: notes.trim() || undefined,
        exercises: cleanExercises.map((exercise, index) => ({ ...exercise, name: exercise.name.trim(), order: index + 1 })),
      });
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Không thể tạo bài tập về nhà. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const recipients = targetType === "member" ? members : classes;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl max-h-[94vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        <header className="shrink-0 flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></span><div><h2 className="font-bold text-slate-900 dark:text-white">Soạn bài tập về nhà</h2><p className="text-xs text-slate-500">Nhập thông tin và danh sách bài tập theo cấu trúc như kết quả AI.</p></div></div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Đóng"><X className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="md:col-span-2 text-xs font-bold text-slate-700 dark:text-slate-300">Tên bài tập về nhà *<input value={name} onChange={(e) => setName(e.target.value)} maxLength={160} placeholder="VD: Bài tập sức bền tuần này" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500" /></label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bộ môn<select value={sportId} onChange={(e) => setSportId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500"><option value="">Chọn bộ môn</option>{sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</select></label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trình độ<select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500"><option>Cơ bản</option><option>Trung cấp</option><option>Nâng cao</option></select></label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mục tiêu tập<input value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={500} placeholder="VD: Cải thiện sức bền và kỹ thuật" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500" /></label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời lượng dự kiến<input type="number" min={5} max={240} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500" /><span className="mt-1 block font-normal text-slate-400">Phút</span></label>
          </section>

          <section className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Giao cho</h3><p className="text-xs text-slate-500 mt-0.5">Hệ thống tạo lượt bài tập về nhà riêng cho người nhận.</p></div><CalendarClock className="w-5 h-5 text-emerald-600" /></div>
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { setTargetType("member"); setTargetId(members[0]?.id || ""); }} className={`rounded-xl px-3 py-2.5 text-sm font-semibold border flex items-center justify-center gap-2 ${targetType === "member" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600"}`}><UserRound className="w-4 h-4" />Học viên</button><button type="button" onClick={() => { setTargetType("class"); setTargetId(classes[0]?.id || ""); }} className={`rounded-xl px-3 py-2.5 text-sm font-semibold border flex items-center justify-center gap-2 ${targetType === "class" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600"}`}><Users className="w-4 h-4" />Lớp học</button></div>
            <select required value={targetId} onChange={(e) => setTargetId(e.target.value)} disabled={loading || recipients.length === 0} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 text-sm outline-none focus:border-emerald-500"><option value="">{loading ? "Đang tải danh sách..." : `Chọn ${targetType === "member" ? "học viên" : "lớp"}`}</option>{targetType === "member" ? members.map((member) => <option key={member.id} value={member.id}>{member.name}{member.code ? ` · ${member.code}` : ""}</option>) : classes.map((gymClass) => <option key={gymClass.id} value={gymClass.id}>{gymClass.className}</option>)}</select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hạn hoàn thành (không bắt buộc)<DateInput value={dueDate} onChange={setDueDate} className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 text-sm font-medium" /></label><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hướng dẫn thêm<textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="Lưu ý khi thực hiện bài tập..." className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500" /></label></div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><DumbbellIcon />Danh sách bài tập ({exercises.length})</h3><p className="text-xs text-slate-500 mt-1">Cấu trúc bài tập giống phần kết quả AI: hiệp, lần, thời lượng, nghỉ và lưu ý kỹ thuật.</p></div><button type="button" onClick={() => setExercises((current) => [...current, newExercise(current.length + 1)])} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><Plus className="w-4 h-4" />Thêm bài tập</button></div>
            {exercises.map((exercise, index) => <CoachAiExerciseCard key={index} exercise={exercise} index={index} totalCount={exercises.length} isDraft onUpdate={(patch) => changeExercise(index, patch)} onMove={(direction) => moveExercise(index, direction)} onRemove={() => setExercises((current) => current.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 })))} />)}
          </section>

          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        </div>

        <footer className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"><div className="hidden sm:flex items-center gap-2 text-xs text-slate-500"><Sparkles className="w-4 h-4 text-emerald-600" />Bài tập sẽ được giao ngay sau khi lưu.</div><div className="ml-auto flex gap-2"><button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-200">Hủy</button><button type="submit" disabled={submitting || loading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"><Send className="w-4 h-4" />{submitting ? "Đang giao..." : "Lưu và giao bài tập"}</button></div></footer>
      </form>
    </div>,
    document.body,
  );
}

function DumbbellIcon() {
  return <span className="text-emerald-600" aria-hidden="true">✣</span>;
}
