import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember } from "../services/api";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MockCurriculum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ curricId: string; curricName: string } | null>(null);
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
    Promise.all([CoachAPI.getCurricula(), CoachAPI.getSchedule(), CoachAPI.getMembers()])
      .then(([cur, sch, mem]) => {
        if (cancelled) return;
        setCurricula(Array.isArray(cur) ? cur : []);
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
    setCurricula(Array.isArray(data) ? data : []);
  };

  const openNew = () => {
    setDraft(makeDraft());
    setEditingId("new");
  };

  const openEdit = (curriculum: MockCurriculum) => {
    setDraft({ ...curriculum, exercises: curriculum.exercises.map((exercise) => ({ ...exercise })) });
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
    } catch (error) {
      console.error("Failed to assign coach curriculum", error);
      setFeedback({ type: "error", msg: "Không thể giao giáo án. Vui lòng thử lại." });
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
    return ["all", ...Array.from(new Set(curricula.map((curriculum) => curriculum.sport)))];
  }, [curricula]);

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
        onAssign={(curriculum) => setAssignTarget({ curricId: curriculum.id, curricName: curriculum.name })}
      />

      <CurriculumEditorModal
        editingId={editingId}
        draft={draft}
        setDraft={setDraft}
        isSaving={isSaving}
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
      />
    </div>
  );
}
