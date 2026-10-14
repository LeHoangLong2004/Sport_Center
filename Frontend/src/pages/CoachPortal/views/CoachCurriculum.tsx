import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember } from "../services/api";
import { curriculumSync, type SyncedCurriculum } from "../../MemberPortal/services/curriculumSync";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  Dumbbell,
  Users,
  CheckCircle2,
  Edit2,
  Trash2,
  Send,
  X
} from "lucide-react";

type CurriculumStatus = "Nháp" | "Đã giao" | "Lưu trữ" | "Hoàn thành";

const STATUS_STYLE: Record<CurriculumStatus, { label: string; bg: string; text: string }> = {
  "Nháp": { label: "Bản nháp", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  "Đã giao": { label: "Đã giao", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "Hoàn thành": { label: "Hoàn thành", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  "Lưu trữ": { label: "Lưu trữ", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
};

const EMPTY_EXERCISE = { name: "", reps: "", rest: "", note: "" };

function makeDraft(): MockCurriculum {
  return {
    id: `cur_${Date.now()}`,
    name: "",
    sport: "Gym",
    goal: "",
    level: "Cơ bản",
    duration: 60,
    status: "Nháp",
    updatedAt: new Date().toISOString().split("T")[0],
    description: "",
    exercises: [
      { name: "Khởi động toàn thân", reps: "5 phút", rest: "30s", note: "Xoay khớp cổ tay, chân" },
      { name: "", reps: "", rest: "", note: "" },
    ],
    assignedTo: [],
  };
}

export default function CoachCurriculum() {
  const [curricula, setCurricula] = useState<any[]>(() => curriculumSync.getCurricula());
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MockCurriculum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ curricId: string; curricName: string } | null>(null);
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  useEffect(() => {
    // 1. Initial load from curriculumSync
    const syncData = curriculumSync.getCurricula();
    setCurricula(syncData);

    // 2. Fetch coach schedule & members
    Promise.all([
      CoachAPI.getSchedule(),
      CoachAPI.getMembers(),
    ])
      .then(([sch, mem]) => {
        setSessions(sch);
        setMembers(mem);
      })
      .catch(console.error);

    // 3. Subscribe to real-time updates from member task checkoffs
    const unsub = curriculumSync.subscribe(() => {
      setCurricula(curriculumSync.getCurricula());
    });

    return () => unsub();
  }, []);

  const openNew = () => {
    setDraft(makeDraft());
    setEditingId("new");
  };

  const openEdit = (c: MockCurriculum) => {
    setDraft({ ...c, exercises: c.exercises.map((e) => ({ ...e })) });
    setEditingId(c.id);
  };

  const closeEdit = () => {
    setDraft(null);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setFeedback({ type: "error", msg: "Tên giáo án không được để trống." });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      await CoachAPI.saveCurriculum({
        ...draft,
        updatedAt: new Date().toISOString().split("T")[0],
      });
    } catch {}

    const updated = {
      ...draft,
      status: "Nháp" as const,
      updatedAt: new Date().toISOString().split("T")[0],
      coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
      coachName: "HLV Hồ Xuân Ánh Nam",
      assignedTo: draft.assignedTo || [],
    };
    curriculumSync.saveCurricula([updated, ...curricula.filter((c) => c.id !== updated.id)]);
    setCurricula(curriculumSync.getCurricula());
    setFeedback({ type: "success", msg: "Đã lưu giáo án thành công!" });
    closeEdit();
    setIsSaving(false);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAssign = async (type: "class" | "member", id: string, name: string) => {
    if (!assignTarget) return;
    try {
      await CoachAPI.assignCurriculum(assignTarget.curricId, { type, id, name });
    } catch {
      // optimistic
    }
    curriculumSync.assignCurriculumToMember(
      assignTarget.curricId,
      { type, id, name },
      { deadline: assignDeadline, note: assignNote }
    );
    setCurricula(curriculumSync.getCurricula());
    setAssignTarget(null);
    setFeedback({ type: "success", msg: `Đã giao giáo án "${assignTarget.curricName}" cho ${name} thành công!` });
    setTimeout(() => setFeedback(null), 3500);
  };

  const uniqueClasses = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    sessions.forEach((s) => {
      if (!map.has(s.classId)) {
        map.set(s.classId, { id: s.classId, name: s.className.split("–")[0].trim() });
      }
    });
    return Array.from(map.values());
  }, [sessions]);

  const filteredCurricula = useMemo(() => {
    return curricula.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.goal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSport = sportFilter === "all" || c.sport === sportFilter;
      return matchSearch && matchSport;
    });
  }, [curricula, searchQuery, sportFilter]);

  const sportsList = useMemo(() => {
    return ["all", ...Array.from(new Set(curricula.map((c) => c.sport)))];
  }, [curricula]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Giáo án & Bài tập
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết kế giáo án tập luyện theo bộ môn và giao bài cho học viên / lớp phụ trách
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Tạo giáo án mới
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số giáo án</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{curricula.length}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Đã giao cho học viên</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {curricula.filter((c) => c.status === "Đã giao").length}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bản nháp đang soạn</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {curricula.filter((c) => c.status === "Nháp").length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Tìm theo tên giáo án, mục tiêu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Bộ môn:
          </span>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            {sportsList.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Curricula Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          Đang tải danh sách giáo án...
        </div>
      ) : filteredCurricula.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
          Không tìm thấy giáo án nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCurricula.map((c) => {
            const statusBadge = STATUS_STYLE[c.status as CurriculumStatus] || {
              label: c.status,
              bg: "bg-slate-100",
              text: "text-slate-600",
            };

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {c.sport}
                        </span>
                        <span className="text-xs text-slate-400">• {c.level}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          • <Clock className="w-3 h-3" /> {c.duration} phút
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.bg} ${statusBadge.text} shrink-0`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {c.goal && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Mục tiêu:</span> {c.goal}
                    </p>
                  )}

                  {/* Exercises preview snippet */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Danh sách bài tập ({c.exercises.length} bài)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.exercises.slice(0, 4).map((ex, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                        >
                          <Dumbbell className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">{ex.name || `Bài ${i + 1}`}</span>
                          {ex.reps && <span className="text-slate-400 text-[10px]">({ex.reps})</span>}
                        </span>
                      ))}
                      {c.exercises.length > 4 && (
                        <span className="text-xs px-2 py-1 text-slate-400 self-center">
                          +{c.exercises.length - 4} bài nữa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned to pills */}
                  {c.assignedTo.length > 0 && (
                    <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 flex flex-wrap items-center gap-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/60">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Đã giao:{" "}
                        {c.assignedTo.map((t: any, idx: number) => (
                          <span key={idx} className="font-semibold mr-1.5">
                            {t.name} (Tiến độ: {t.progressPercent !== undefined ? t.progressPercent : 0}%)
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400">
                    Cập nhật: {c.updatedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignTarget({ curricId: c.id, curricName: c.name })}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" /> Giao bài
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {editingId && draft &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingId === "new" ? "Tạo giáo án mới" : "Chỉnh sửa giáo án"}
                </h3>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tên giáo án: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Yoga Cân Bằng Cột Sống – Tuần 1"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Bộ môn:
                    </label>
                    <select
                      value={draft.sport}
                      onChange={(e) => setDraft({ ...draft, sport: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {["Gym", "Yoga", "Pilates", "Boxing", "Bơi", "CrossFit"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Trình độ:
                    </label>
                    <select
                      value={draft.level}
                      onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {["Cơ bản", "Trung cấp", "Nâng cao"].map((l) => (
                        <option key={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Thời lượng (phút):
                    </label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={draft.duration}
                      onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Mục tiêu luyện tập:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Tăng sức mạnh cốt lõi, giảm áp lực thắt lưng..."
                    value={draft.goal}
                    onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Mô tả / Lưu ý khi tập:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về nhịp thở, tư thế chuẩn..."
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Exercise list editor */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Danh sách bài tập ({draft.exercises.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          exercises: [...draft.exercises, { ...EMPTY_EXERCISE }],
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Thêm bài tập
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {draft.exercises.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                      >
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="Tên bài (VD: Squat, Plank...)"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...draft.exercises];
                              updated[i].name = e.target.value;
                              setDraft({ ...draft, exercises: updated });
                            }}
                            className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Hiệp/Lần (3x12)"
                            value={ex.reps}
                            onChange={(e) => {
                              const updated = [...draft.exercises];
                              updated[i].reps = e.target.value;
                              setDraft({ ...draft, exercises: updated });
                            }}
                            className="w-24 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          />
                          <input
                            type="text"
                            placeholder="Nghỉ (45s)"
                            value={ex.rest}
                            onChange={(e) => {
                              const updated = [...draft.exercises];
                              updated[i].rest = e.target.value;
                              setDraft({ ...draft, exercises: updated });
                            }}
                            className="w-20 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = draft.exercises.filter((_, idx) => idx !== i);
                              setDraft({ ...draft, exercises: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            title="Xóa bài này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
                >
                  {isSaving ? "Đang lưu..." : "Lưu giáo án"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ASSIGN MODAL */}
      {assignTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Giao giáo án
                </h3>
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-500 dark:text-slate-400">
                Chọn lớp học hoặc học viên để giao giáo án{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{assignTarget.curricName}"
                </span>:
              </p>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hạn hoàn thành (Deadline):
                </label>
                <input
                  type="date"
                  value={assignDeadline}
                  onChange={(e) => setAssignDeadline(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3"
                />

                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ghi chú bài tập về nhà:
                </label>
                <input
                  type="text"
                  placeholder="VD: Tập 3 hiệp, nghỉ đủ 45s giữa các hiệp..."
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3"
                />
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Chọn Lớp học phụ trách:
                </span>
                <div className="flex flex-col gap-1.5">
                  {uniqueClasses.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleAssign("class", cls.id, cls.name)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
                    >
                      <span>📚 Lớp: {cls.name}</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Giao ngay →</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Hoặc chọn Học viên kèm 1–1:
                </span>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleAssign("member", m.id, m.name)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
                    >
                      <span>👤 {m.name} ({m.code})</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Giao ngay →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
