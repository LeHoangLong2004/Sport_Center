import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember, SportOption } from "../services/api";
import { CheckCircle2, BookOpen, ClipboardList } from "lucide-react";
import { makeDraft, makePlanSession } from "./curriculum/types";
import {
  resolveSportInfo,
  normalizeLevel,
  cleanDuplicateSuffixes,
  getEffectiveStatus,
} from "./curriculum/curriculumUtils";
import { CurriculumHeader } from "./curriculum/CurriculumHeader";
import { CurriculumGrid } from "./curriculum/CurriculumGrid";
import { CurriculumEditorModal } from "./curriculum/CurriculumEditorModal";
import { CurriculumAssignModal } from "./curriculum/CurriculumAssignModal";
import { CurriculumDeleteConfirmModal } from "./curriculum/CurriculumDeleteConfirmModal";
import CoachAI from "./CoachAI";
import { CoachHomeworksTab } from "./CoachHomeworksTab";

interface CoachCurriculumProps {
  initialTab?: "library" | "ai";
  initialMemberId?: string | null;
}

export default function CoachCurriculum({
  initialTab = "library",
  initialMemberId,
}: CoachCurriculumProps = {}) {
  const [activeTab, setActiveTab] = useState<"library" | "homework">("library");
  const [showAiComposer, setShowAiComposer] = useState(initialTab === "ai");
  const [aiReturnTab, setAiReturnTab] = useState<"library" | "homework">("library");
  const [assignAfterSave, setAssignAfterSave] = useState(false);
  const [curricula, setCurricula] = useState<MockCurriculum[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MockCurriculum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockCurriculum | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ curricId: string; curricName: string; sport?: string; level?: string } | null>(null);
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // The API scopes curricula by the coach id in the authenticated token.
    Promise.all([CoachAPI.getCurricula(), CoachAPI.getSchedule(), CoachAPI.getMembers(), CoachAPI.getSports()])
      .then(([cur, sch, mem, sportOptions]) => {
        if (cancelled) return;
        const loadedSports = Array.isArray(sportOptions) ? sportOptions : [];
        setSports(loadedSports);
        setCurricula(normalizeCurricula(Array.isArray(cur) ? cur : [], loadedSports));
        setSessions(Array.isArray(sch) ? sch : []);
        setMembers(Array.isArray(mem) ? mem : []);
      })
      .catch((error) => {
        console.error("Failed to load coach curricula", error);
        if (!cancelled) {
          setCurricula([]);
          setFeedback({ type: "error", msg: "Không thể tải danh sách kế hoạch tập luyện từ hệ thống." });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadCurricula = async () => {
    const data = await CoachAPI.getCurricula();
    setCurricula(normalizeCurricula(Array.isArray(data) ? data : [], sports));
  };

  const [modalError, setModalError] = useState<string | null>(null);

  const openNew = (assignOnSave = false) => {
    setModalError(null);
    setDraft(makeDraft(sports));
    setEditingId("new");
    setAssignAfterSave(assignOnSave);
  };

  const openEdit = (curriculum: MockCurriculum) => {
    setModalError(null);
    const selectedSport = sports.find(
      (sport) => sport.id === curriculum.sportId || sport.name === curriculum.sport
    );
    setDraft({
      ...curriculum,
      sportId: selectedSport?.id || curriculum.sportId || null,
      sport: selectedSport?.name || curriculum.sport,
      exercises: curriculum.exercises.map((exercise) => ({ ...exercise })),
      programOutline: curriculum.programOutline
        ? {
            ...curriculum.programOutline,
            sessions: curriculum.programOutline.sessions.map((session) => ({
              ...session,
              exercises: session.exercises.map((exercise) => ({ ...exercise })),
            })),
          }
        : {
            durationWeeks: 1,
            sessionsPerWeek: 2,
            sessions: [
              {
                ...makePlanSession(1),
                title: "Buổi tập hiện có",
                exercises: curriculum.exercises.map((exercise) => ({ ...exercise })),
              },
            ],
          },
    });
    setEditingId(curriculum.id);
  };

  const closeEdit = () => {
    setDraft(null);
    setEditingId(null);
    setModalError(null);
    setAssignAfterSave(false);
  };

  const handleSave = async () => {
    if (!draft) return;
    setModalError(null);

    if (!draft.name.trim()) {
      setModalError("Tên kế hoạch không được để trống.");
      return;
    }

    const outline = draft.programOutline || { durationWeeks: 1, sessionsPerWeek: 1, sessions: [] };
    const usedSessions = outline.sessions.filter((session) =>
      session.title.trim() || session.goal.trim() || session.activities.trim() || session.coachNotes.trim() ||
      session.exercises.some((exercise) => exercise.name.trim() || exercise.reps.trim() || exercise.rest.trim() || exercise.note.trim())
    );
    if (usedSessions.length === 0) {
      setModalError("Thêm ít nhất một buổi vào lộ trình kế hoạch.");
      return;
    }
    if (usedSessions.some((session) => !session.title.trim())) {
      setModalError("Vui lòng đặt chủ đề cho từng buổi đã nhập nội dung.");
      return;
    }

    const normalizedSessions = usedSessions.map((session, index) => ({
      ...session,
      sessionNumber: index + 1,
      exercises: session.exercises.filter((exercise) =>
        exercise.name.trim() || exercise.reps?.trim() || exercise.rest?.trim() || exercise.note?.trim()
      ),
    }));
    const validExercises = normalizedSessions.flatMap((session) => session.exercises);

    if (assignAfterSave && validExercises.length === 0) {
      setModalError("Thêm ít nhất một bài tập trước khi giao bài tập về nhà.");
      return;
    }

    const hasEmptyName = validExercises.some((e) => !e.name.trim());
    if (hasEmptyName) {
      setModalError("Vui lòng nhập tên cho tất cả các bài tập trong danh sách (hoặc xóa bài chưa dùng).");
      return;
    }

    const cleanedDraft = {
      ...draft,
      status: validExercises.length === 0 ? "Nháp" as const : draft.status,
      exercises: validExercises,
      programOutline: { ...outline, sessions: normalizedSessions },
    };

    setIsSaving(true);
    setFeedback(null);
    const shouldAssignAfterSave = assignAfterSave && (!editingId || editingId === "new");
    try {
      let savedPlan: any = null;
      if (editingId && editingId !== "new") {
        await CoachAPI.updateCurriculum(editingId, cleanedDraft);
      } else {
        savedPlan = await CoachAPI.saveCurriculum(cleanedDraft);
      }

      await reloadCurricula();
      setFeedback({
        type: "success",
        msg: validExercises.length === 0
          ? "Đã xóa toàn bộ bài tập và lưu kế hoạch ở trạng thái Nháp."
          : "Đã lưu kế hoạch tập luyện thành công!",
      });
      closeEdit();
      if (shouldAssignAfterSave && savedPlan?.id) {
        setAssignTarget({
          curricId: String(savedPlan.id),
          curricName: cleanedDraft.name,
          sport: cleanedDraft.sport,
          level: cleanedDraft.level,
        });
        setAssignAfterSave(false);
      }
      setTimeout(() => setFeedback(null), 3500);
    } catch (error: any) {
      console.error("Failed to save coach curriculum", error);
      const errorMsg = error?.message || "Không thể lưu kế hoạch. Vui lòng thử lại.";
      setModalError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async (type: "class" | "member", id: string, name: string) => {
    if (!assignTarget) return;

    setIsAssigning(true);
    try {
      await CoachAPI.assignCurriculum(assignTarget.curricId, {
        type,
        id,
        name,
        deadline: assignDeadline,
        note: assignNote,
      });
      await reloadCurricula();
      setAssignTarget(null);
      setFeedback({ type: "success", msg: `Đã giao kế hoạch "${assignTarget.curricName}" cho ${name} thành công!` });
      setActiveTab("homework");
      setTimeout(() => setFeedback(null), 3500);
    } catch (error: any) {
      console.error("Failed to assign coach curriculum", error);
      const errMsg = error?.message || "Không thể giao kế hoạch. Vui lòng thử lại.";
      setFeedback({ type: "error", msg: errMsg });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsAssigning(false);
    }
  };

  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = async (curriculum: MockCurriculum) => {
    setApprovingId(curriculum.id);
    try {
      await CoachAPI.approveCurriculum(curriculum.id);
      await reloadCurricula();
      setFeedback({
        type: "success",
        msg: `Kế hoạch "${curriculum.name}" đã được đánh dấu là Sẵn sàng giao!`
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (error: any) {
      console.error("Failed to approve curriculum", error);
      setFeedback({
        type: "error",
        msg: error?.message || "Không thể duyệt kế hoạch. Vui lòng thử lại."
      });
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setApprovingId(null);
    }
  };

  const handleArchive = async (curriculum: MockCurriculum) => {
    setDeletingId(curriculum.id);
    try {
      await CoachAPI.archiveCurriculum(curriculum.id);
      await reloadCurricula();
      setFeedback({ type: "success", msg: `Đã xóa kế hoạch “${curriculum.name}” khỏi thư viện HLV. Học viên đã nhận vẫn xem được bài tập và lịch sử tập luyện.` });
      setDeleteTarget(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (error: any) {
      setFeedback({
        type: "error",
        msg: error?.message || "Không thể xóa kế hoạch. Vui lòng thử lại.",
      });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const uniqueClasses = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    sessions.forEach((session) => {
      if (!map.has(session.classId)) {
        map.set(session.classId, { id: session.classId, name: session.className.split("–")[0].trim() });
      }
    });
    return Array.from(map.values());
  }, [sessions]);

  const filteredCurricula = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return curricula.filter((curriculum) => {
      const matchSearch =
        !query ||
        curriculum.name.toLowerCase().includes(query) ||
        curriculum.goal?.toLowerCase().includes(query) ||
        curriculum.sport?.toLowerCase().includes(query) ||
        curriculum.level?.toLowerCase().includes(query) ||
        curriculum.description?.toLowerCase().includes(query) ||
        curriculum.exercises?.some((ex) => ex.name?.toLowerCase().includes(query));

      const matchSport = sportFilter === "all" || curriculum.sport === sportFilter;

      const effective = getEffectiveStatus(curriculum);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "ready" && effective.key === "ready") ||
        (statusFilter === "assigned" && curriculum.assignedTo.length > 0) ||
        (statusFilter === "draft" && (effective.key === "draft" || effective.key === "empty"));

      return matchSearch && matchSport && matchStatus;
    });
  }, [curricula, searchQuery, sportFilter, statusFilter]);

  const sportsList = useMemo(() => {
    const list = new Set<string>();
    list.add("all");
    sports.forEach((s) => list.add(s.name));
    curricula.forEach((c) => {
      if (c.sport && c.sport !== "Chưa xác định") list.add(c.sport);
    });
    return Array.from(list);
  }, [sports, curricula]);

  function normalizeCurricula(items: MockCurriculum[], sportOptions: SportOption[]) {
    return items.map((curriculum) => {
      const cleanName = cleanDuplicateSuffixes(curriculum.name);
      const normLevel = normalizeLevel(curriculum.level);
      const resolvedSport = resolveSportInfo(
        curriculum.sport,
        curriculum.sportId,
        sportOptions,
        cleanName,
        curriculum.goal || "",
        curriculum.description || ""
      );

      // Lọc bỏ đối tượng đã giao có tên trùng với tên kế hoạch (lỗi lặp dữ liệu trước đây)
      const cleanAssignedTo = (curriculum.assignedTo || []).filter(
        (target) =>
          target &&
          target.name &&
          target.name.trim().toLowerCase() !== cleanName.toLowerCase()
      );

      return {
        ...curriculum,
        name: cleanName,
        level: normLevel,
        sportId: resolvedSport.sportId,
        sport: resolvedSport.sport,
        assignedTo: cleanAssignedTo,
      };
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {showAiComposer ? (
        <CoachAI
          initialMemberId={initialMemberId}
          backLabel={aiReturnTab === "homework" ? "Bài tập về nhà" : "Kế hoạch tập luyện"}
          onBackToLibrary={() => {
            setShowAiComposer(false);
            setActiveTab(aiReturnTab);
            void reloadCurricula();
          }}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button type="button" onClick={() => setActiveTab("library")} className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "library" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
              <BookOpen className="w-4 h-4" /><span>Kế hoạch tập luyện ({curricula.length})</span>
            </button>
            <button type="button" onClick={() => setActiveTab("homework")} className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "homework" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
              <ClipboardList className="w-4 h-4" /><span>Bài tập về nhà</span>
            </button>
          </div>

          {activeTab === "homework" ? (
            <CoachHomeworksTab
              onCreateWithAi={() => { setAiReturnTab("homework"); setShowAiComposer(true); }}
            />
          ) : <>
          <CurriculumHeader
            curricula={curricula}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sportFilter={sportFilter}
            setSportFilter={setSportFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sportsList={sportsList}
            onOpenNew={openNew}
            onOpenAiTab={() => { setAiReturnTab("library"); setShowAiComposer(true); }}
          />

          {feedback && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                  : "bg-rose-50 dark:rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{feedback.msg}</span>
            </div>
          )}

          <CurriculumGrid
            loading={loading}
            curricula={filteredCurricula}
            onEdit={openEdit}
            onApprove={handleApprove}
            approvingId={approvingId}
            deletingId={deletingId}
            onAssign={(curriculum) =>
              setAssignTarget({
                curricId: curriculum.id,
                curricName: curriculum.name,
                sport: curriculum.sport,
                level: curriculum.level,
              })
            }
            onDelete={(curriculum) => setDeleteTarget(curriculum)}
          />

          <CurriculumEditorModal
            editingId={editingId}
            draft={draft}
            setDraft={setDraft}
            isSaving={isSaving}
            error={modalError}
            sports={sports}
            onClose={closeEdit}
            onSave={handleSave}
          />

          <CurriculumAssignModal
            assignTarget={assignTarget}
            assignDeadline={assignDeadline}
            setAssignDeadline={setAssignDeadline}
            assignNote={assignNote}
            setAssignNote={setAssignNote}
            uniqueClasses={uniqueClasses}
            members={members}
            onClose={() => setAssignTarget(null)}
            onAssign={handleAssign}
            isSubmitting={isAssigning}
          />

          {deleteTarget && (
            <CurriculumDeleteConfirmModal
              planName={deleteTarget.name}
              isDeleting={deletingId === deleteTarget.id}
              onCancel={() => {
                if (deletingId !== deleteTarget.id) setDeleteTarget(null);
              }}
              onConfirm={() => void handleArchive(deleteTarget)}
            />
          )}
          </>}
        </>
      )}
    </div>
  );
}
