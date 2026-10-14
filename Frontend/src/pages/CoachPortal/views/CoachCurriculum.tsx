import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember } from "../services/api";
import { CheckCircle2 } from "lucide-react";
import { makeDraft } from "./curriculum/types";
import { CurriculumHeader } from "./curriculum/CurriculumHeader";
import { CurriculumGrid } from "./curriculum/CurriculumGrid";
import { CurriculumEditorModal } from "./curriculum/CurriculumEditorModal";
import { CurriculumAssignModal } from "./curriculum/CurriculumAssignModal";
import { curriculumSync, type SyncedCurriculum } from "../../MemberPortal/services/curriculumSync";

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
      {/* Header, Metrics & Filters */}
      <CurriculumHeader
        curricula={curricula}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sportFilter={sportFilter}
        setSportFilter={setSportFilter}
        sportsList={sportsList}
        onOpenNew={openNew}
      />

      {/* Feedback banner */}
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

      {/* Curricula Cards Grid */}
      <CurriculumGrid
        loading={loading}
        curricula={filteredCurricula}
        onEdit={openEdit}
        onAssign={(c) => setAssignTarget({ curricId: c.id, curricName: c.name })}
      />

      {/* Edit / Create Modal */}
      <CurriculumEditorModal
        editingId={editingId}
        draft={draft}
        setDraft={setDraft}
        isSaving={isSaving}
        onClose={closeEdit}
        onSave={handleSave}
      />

      {/* Assign Modal */}
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
