import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember, SportOption } from "../services/api";
import { CheckCircle2 } from "lucide-react";
import { makeDraft } from "./curriculum/types";
import { CurriculumHeader } from "./curriculum/CurriculumHeader";
import { CurriculumGrid } from "./curriculum/CurriculumGrid";
import { CurriculumEditorModal } from "./curriculum/CurriculumEditorModal";
import { CurriculumAssignModal } from "./curriculum/CurriculumAssignModal";

export default function CoachCurriculum() {
  const [curricula, setCurricula] = useState<MockCurriculum[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MockCurriculum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ curricId: string; curricName: string; sport?: string; level?: string } | null>(null);
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

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
          setFeedback({ type: "error", msg: "Không thể tải danh sách giáo án từ hệ thống." });
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

  const openNew = () => {
    setDraft(makeDraft(sports));
    setEditingId("new");
  };

  const openEdit = (curriculum: MockCurriculum) => {
    const selectedSport = sports.find(
      (sport) => sport.id === curriculum.sportId || sport.name === curriculum.sport
    );
    setDraft({
      ...curriculum,
      sportId: selectedSport?.id || curriculum.sportId || null,
      sport: selectedSport?.name || curriculum.sport,
      exercises: curriculum.exercises.map((exercise) => ({ ...exercise })),
    });
    setEditingId(curriculum.id);
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
      if (editingId && editingId !== "new") {
        await CoachAPI.updateCurriculum(editingId, draft);
      } else {
        await CoachAPI.saveCurriculum(draft);
      }

      await reloadCurricula();
      setFeedback({ type: "success", msg: "Đã lưu giáo án thành công!" });
      closeEdit();
      setTimeout(() => setFeedback(null), 3500);
    } catch (error) {
      console.error("Failed to save coach curriculum", error);
      setFeedback({ type: "error", msg: "Không thể lưu giáo án. Vui lòng thử lại." });
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
      setFeedback({ type: "success", msg: `Đã giao giáo án "${assignTarget.curricName}" cho ${name} thành công!` });
      setTimeout(() => setFeedback(null), 3500);
    } catch (error: any) {
      console.error("Failed to assign coach curriculum", error);
      const errMsg = error?.message || "Không thể giao giáo án. Vui lòng thử lại.";
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
        msg: `Giáo án "${curriculum.name}" đã được đánh dấu là Sẵn sàng giao!`
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (error: any) {
      console.error("Failed to approve curriculum", error);
      setFeedback({
        type: "error",
        msg: error?.message || "Không thể phê duyệt giáo án. Vui lòng thử lại."
      });
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setApprovingId(null);
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
    const query = searchQuery.toLowerCase();
    return curricula.filter((curriculum) => {
      const matchSearch =
        curriculum.name.toLowerCase().includes(query) ||
        curriculum.goal?.toLowerCase().includes(query) ||
        curriculum.description?.toLowerCase().includes(query);
      const matchSport = sportFilter === "all" || curriculum.sport === sportFilter;
      return matchSearch && matchSport;
    });
  }, [curricula, searchQuery, sportFilter]);

  const sportsList = useMemo(() => {
    return ["all", ...sports.map((sport) => sport.name)];
  }, [sports]);

  function normalizeCurricula(items: MockCurriculum[], sportOptions: SportOption[]) {
    return items.map((curriculum) => {
      const selectedSport = sportOptions.find(
        (sport) => sport.id === curriculum.sportId || sport.name === curriculum.sport
      );
      return {
        ...curriculum,
        sportId: selectedSport?.id || curriculum.sportId || null,
        sport: selectedSport?.name || curriculum.sport || "Chưa xác định",
      };
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <CurriculumHeader
        curricula={curricula}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sportFilter={sportFilter}
        setSportFilter={setSportFilter}
        sportsList={sportsList}
        onOpenNew={openNew}
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
        onAssign={(curriculum) =>
          setAssignTarget({
            curricId: curriculum.id,
            curricName: curriculum.name,
            sport: curriculum.sport,
            level: curriculum.level,
          })
        }
      />

      <CurriculumEditorModal
        editingId={editingId}
        draft={draft}
        setDraft={setDraft}
        isSaving={isSaving}
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
    </div>
  );
}
