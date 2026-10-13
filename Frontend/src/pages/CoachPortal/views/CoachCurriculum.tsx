import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember } from "../services/api";
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

type CurriculumStatus = "NhÃ¡p" | "ÄÃ£ giao" | "LÆ°u trá»¯";

const STATUS_STYLE: Record<CurriculumStatus, { label: string; bg: string; text: string }> = {   "NhÃ¡p": { label: "Báº£n nhÃ¡p", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },   "ÄÃ£ giao": { label: "ÄÃ£ giao", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },   "LÆ°u trá»¯": { label: "LÆ°u trá»¯", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" }, };

const EMPTY_EXERCISE = { name: "", reps: "", rest: "", note: "" };

function makeDraft(): MockCurriculum {
  return {
    id: `cur_${Date.now()}`,
    name: "",
    sport: "Gym",
    goal: "",
    level: "CÆ¡ báº£n",
    duration: 60,
    status: "NhÃ¡p",
    updatedAt: new Date().toISOString().split("T")[0],
    description: "",
    exercises: [
      { name: "Khá»Ÿi Ä‘á»™ng toÃ n thÃ¢n", reps: "5 phÃºt", rest: "30s", note: "Xoay khá»›p cá»• tay, chÃ¢n" },
      { name: "", reps: "", rest: "", note: "" },
    ],
    assignedTo: [],
  };
}

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
  const [loading, setLoading] = useState(true);

  /* Search & filter */
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      CoachAPI.getCurricula(),
      CoachAPI.getSchedule(),
      CoachAPI.getMembers(),
    ])
      .then(([cur, sch, mem]) => {
        setCurricula(cur);
        setSessions(sch);
        setMembers(mem);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
      setFeedback({ type: "error", msg: "TÃªn giÃ¡o Ã¡n khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng." });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      await CoachAPI.saveCurriculum({
        ...draft,
        updatedAt: new Date().toISOString().split("T")[0],
      });
      const cur = await CoachAPI.getCurricula();
      setCurricula(cur);
      setFeedback({ type: "success", msg: "ÄÃ£ lÆ°u giÃ¡o Ã¡n thÃ nh cÃ´ng!" });
      closeEdit();
    } catch {
      /* Local fallback */
      setCurricula((prev) => {
        const idx = prev.findIndex((c) => c.id === draft.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...draft, updatedAt: new Date().toISOString().split("T")[0] };
          return updated;
        }
        return [{ ...draft, updatedAt: new Date().toISOString().split("T")[0] }, ...prev];
      });
      setFeedback({ type: "success", msg: "ÄÃ£ lÆ°u giÃ¡o Ã¡n thÃ nh cÃ´ng!" });
      closeEdit();
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleAssign = async (type: "class" | "member", id: string, name: string) => {
    if (!assignTarget) return;
    try {
      await CoachAPI.assignCurriculum(assignTarget.curricId, { type, id, name });
    } catch {
      /* optimistic */
    }
    setCurricula((prev) =>
      prev.map((c) => {
        if (c.id === assignTarget.curricId) {
          const exists = c.assignedTo.some((t) => t.id === id);
          return {
            ...c,
            status: "ÄÃ£ giao",
            assignedTo: exists ? c.assignedTo : [...c.assignedTo, { type, id, name }],
          };
        }
        return c;
      })
    );
    setAssignTarget(null);
    setFeedback({ type: "success", msg: `ÄÃ£ giao giÃ¡o Ã¡n "${assignTarget.curricName}" cho ${name}` });
    setTimeout(() => setFeedback(null), 3500);
  };

  const uniqueClasses = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    sessions.forEach((s) => {
      if (!map.has(s.classId)) {
        map.set(s.classId, { id: s.classId, name: s.className.split("â€“")[0].trim() });
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

  return (     <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">       {/* Header */}       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">         <div>           <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">             <BookOpen className="w-6 h-6 text-slate-700 dark:text-slate-300" />             GiÃ¡o Ã¡n & BÃ i táº­p           </h1>           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">             Thiáº¿t káº¿ giÃ¡o Ã¡n táº­p luyá»‡n theo bá»™ mÃ´n vÃ  giao bÃ i cho há»c viÃªn / lá»›p phá»¥ trÃ¡ch           </p>         </div>          <button           type="button"           onClick={openNew}           className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl transition-colors shadow-sm self-start md:self-auto"         >           <Plus className="w-4 h-4" /> Táº¡o giÃ¡o Ã¡n má»›i         </button>       </div>        {/* Feedback banner */}       {feedback && (         <div           className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${             feedback.type === "success"               ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"               : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"           }`}         >           <CheckCircle2 className="w-5 h-5 shrink-0" />           <span>{feedback.msg}</span>         </div>       )}        {/* Metrics Row */}       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">         <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">           <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tá»•ng sá»‘ giÃ¡o Ã¡n</span>           <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{curricula.length}</div>         </div>         <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">           <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ÄÃ£ giao cho há»c viÃªn</span>           <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">             {curricula.filter((c) => c.status === "ÄÃ£ giao").length}           </div>         </div>         <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">           <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Báº£n nhÃ¡p Ä‘ang soáº¡n</span>           <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">             {curricula.filter((c) => c.status === "NhÃ¡p").length}           </div>         </div>       </div>        {/* Search & Filters */}       <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">         <div className="flex items-center gap-2 flex-1 min-w-[240px]">           <Search className="w-4 h-4 text-slate-400 ml-1" />           <input             type="text"             placeholder="TÃ¬m theo tÃªn giÃ¡o Ã¡n, má»¥c tiÃªu..."             value={searchQuery}             onChange={(e) => setSearchQuery(e.target.value)}             className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"           />         </div>          <div className="flex items-center gap-2">           <span className="text-xs text-slate-400 flex items-center gap-1">             <Filter className="w-3.5 h-3.5" /> Bá»™ mÃ´n:           </span>           <select             value={sportFilter}             onChange={(e) => setSportFilter(e.target.value)}             className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"           >             {sportsList.map((s) => (               <option key={s} value={s}>                 {s === "all" ? "Táº¥t cáº£" : s}               </option>             ))}           </select>         </div>       </div>        {/* Curricula Cards Grid */}       {loading ? (         <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">           Äang táº£i danh sÃ¡ch giÃ¡o Ã¡n...         </div>       ) : filteredCurricula.length === 0 ? (         <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">           KhÃ´ng tÃ¬m tháº¥y giÃ¡o Ã¡n nÃ o phÃ¹ há»£p.         </div>       ) : (         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">           {filteredCurricula.map((c) => {             const statusBadge = STATUS_STYLE[c.status as CurriculumStatus] || {               label: c.status,               bg: "bg-slate-100",               text: "text-slate-600",             };              return (               <div                 key={c.id}                 className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"               >                 <div>                   <div className="flex items-start justify-between gap-3 mb-2">                     <div>                       <h3 className="font-semibold text-base text-slate-900 dark:text-white">                         {c.name}                       </h3>                       <div className="flex items-center gap-2 mt-1">                         <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">                           {c.sport}                         </span>                         <span className="text-xs text-slate-400">â€¢ {c.level}</span>                         <span className="text-xs text-slate-400 flex items-center gap-1">                           â€¢ <Clock className="w-3 h-3" /> {c.duration} phÃºt                         </span>                       </div>                     </div>                      <span                       className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.bg} ${statusBadge.text} shrink-0`}                     >                       {statusBadge.label}                     </span>                   </div>                    {c.goal && (                     <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">                       <span className="font-medium text-slate-700 dark:text-slate-300">Má»¥c tiÃªu:</span> {c.goal}                     </p>                   )}                    {/* Exercises preview snippet */}                   <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">                     <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">                       Danh sÃ¡ch bÃ i táº­p ({c.exercises.length} bÃ i)                     </span>                     <div className="flex flex-wrap gap-1.5">                       {c.exercises.slice(0, 4).map((ex, i) => (                         <span                           key={i}                           className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"                         >                           <Dumbbell className="w-3 h-3 text-slate-400" />                           <span className="font-medium">{ex.name || `BÃ i ${i + 1}`}</span>                           {ex.reps && <span className="text-slate-400 text-[10px]">({ex.reps})</span>}                         </span>                       ))}                       {c.exercises.length > 4 && (                         <span className="text-xs px-2 py-1 text-slate-400 self-center">                           +{c.exercises.length - 4} bÃ i ná»¯a                         </span>                       )}                     </div>                   </div>                    {/* Assigned to pills */}                   {c.assignedTo.length > 0 && (                     <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">                       <Users className="w-3.5 h-3.5" />                       <span>ÄÃ£ giao cho: {c.assignedTo.map((t) => t.name).join(", ")}</span>                     </div>                   )}                 </div>                  {/* Actions */}                 <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">                   <span className="text-[11px] text-slate-400">                     Cáº­p nháº­t: {c.updatedAt}                   </span>                    <div className="flex items-center gap-2">                     <button                       type="button"                       onClick={() => openEdit(c)}                       className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"                     >                       <Edit2 className="w-3 h-3" /> Sá»­a                     </button>                     <button                       type="button"                       onClick={() => setAssignTarget({ curricId: c.id, curricName: c.name })}                       className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"                     >                       <Send className="w-3 h-3" /> Giao bÃ i                     </button>                   </div>                 </div>               </div>             );           })}         </div>       )}        {/* EDIT / CREATE MODAL */}       {editingId && draft &&         createPortal(           <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">                 <h3 className="font-bold text-slate-900 dark:text-white text-base">                   {editingId === "new" ? "Táº¡o giÃ¡o Ã¡n má»›i" : "Chá»‰nh sá»­a giÃ¡o Ã¡n"}                 </h3>                 <button                   type="button"                   onClick={closeEdit}                   className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"                 >                   <X className="w-5 h-5" />                 </button>               </div>                <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">                 <div>                   <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                     TÃªn giÃ¡o Ã¡n: <span className="text-rose-500">*</span>                   </label>                   <input                     type="text"                     required                     placeholder="VD: Yoga CÃ¢n Báº±ng Cá»™t Sá»‘ng â€“ Tuáº§n 1"                     value={draft.name}                     onChange={(e) => setDraft({ ...draft, name: e.target.value })}                     className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"                   />                 </div>                  <div className="grid grid-cols-3 gap-3">                   <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Bá»™ mÃ´n:                     </label>                     <select                       value={draft.sport}                       onChange={(e) => setDraft({ ...draft, sport: e.target.value })}                       className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     >                       {["Gym", "Yoga", "Pilates", "Boxing", "BÆ¡i", "CrossFit"].map((s) => (                         <option key={s} value={s}>                           {s}                         </option>                       ))}                     </select>                   </div>                   <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       TrÃ¬nh Ä‘á»™:                     </label>                     <select                       value={draft.level}                       onChange={(e) => setDraft({ ...draft, level: e.target.value })}                       className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     >                       {["CÆ¡ báº£n", "Trung cáº¥p", "NÃ¢ng cao"].map((l) => (                         <option key={l}>                           {l}                         </option>                       ))}                     </select>                   </div>                   <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Thá»i lÆ°á»£ng (phÃºt):                     </label>                     <input                       type="number"                       min={15}                       step={15}                       value={draft.duration}                       onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}                       className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                 </div>                  <div>                   <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                     Má»¥c tiÃªu luyá»‡n táº­p:                   </label>                   <input                     type="text"                     placeholder="VD: TÄƒng sá»©c máº¡nh cá»‘t lÃµi, giáº£m Ã¡p lá»±c tháº¯t lÆ°ng..."                     value={draft.goal}                     onChange={(e) => setDraft({ ...draft, goal: e.target.value })}                     className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                   />                 </div>                  <div>                   <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                     MÃ´ táº£ / LÆ°u Ã½ khi táº­p:                   </label>                   <textarea                     rows={2}                     placeholder="Ghi chÃº thÃªm vá» nhá»‹p thá»Ÿ, tÆ° tháº¿ chuáº©n..."                     value={draft.description}                     onChange={(e) => setDraft({ ...draft, description: e.target.value })}                     className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                   />                 </div>                  {/* Exercise list editor */}                 <div className="pt-2">                   <div className="flex items-center justify-between mb-2">                     <span className="font-bold text-slate-800 dark:text-slate-200">                       Danh sÃ¡ch bÃ i táº­p ({draft.exercises.length})                     </span>                     <button                       type="button"                       onClick={() =>                         setDraft({                           ...draft,                           exercises: [...draft.exercises, { ...EMPTY_EXERCISE }],                         })                       }                       className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"                     >                       <Plus className="w-3 h-3" /> ThÃªm bÃ i táº­p                     </button>                   </div>                    <div className="flex flex-col gap-2.5">                     {draft.exercises.map((ex, i) => (                       <div                         key={i}                         className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"                       >                         <div className="flex-1 w-full">                           <input                             type="text"                             placeholder="TÃªn bÃ i (VD: Squat, Plank...)"                             value={ex.name}                             onChange={(e) => {                               const updated = [...draft.exercises];                               updated[i].name = e.target.value;                               setDraft({ ...draft, exercises: updated });                             }}                             className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"                           />                         </div>                          <div className="flex items-center gap-2 w-full sm:w-auto">                           <input                             type="text"                             placeholder="Hiá»‡p/Láº§n (3x12)"                             value={ex.reps}                             onChange={(e) => {                               const updated = [...draft.exercises];                               updated[i].reps = e.target.value;                               setDraft({ ...draft, exercises: updated });                             }}                             className="w-24 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"                           />                           <input                             type="text"                             placeholder="Nghá»‰ (45s)"                             value={ex.rest}                             onChange={(e) => {                               const updated = [...draft.exercises];                               updated[i].rest = e.target.value;                               setDraft({ ...draft, exercises: updated });                             }}                             className="w-20 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"                           />                           <button                             type="button"                             onClick={() => {                               const updated = draft.exercises.filter((_, idx) => idx !== i);                               setDraft({ ...draft, exercises: updated });                             }}                             className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"                             title="XÃ³a bÃ i nÃ y"                           >                             <Trash2 className="w-4 h-4" />                           </button>                         </div>                       </div>                     ))}                   </div>                 </div>               </div>                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">                 <button                   type="button"                   onClick={closeEdit}                   className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"                 >                   Há»§y                 </button>                 <button                   type="button"                   disabled={isSaving}                   onClick={handleSave}                   className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"                 >                   {isSaving ? "Äang lÆ°u..." : "LÆ°u giÃ¡o Ã¡n"}                 </button>               </div>             </div>           </div>,           document.body         )}        {/* ASSIGN MODAL */}       {assignTarget &&         createPortal(           <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-xs">               <div className="flex items-center justify-between">                 <h3 className="font-bold text-slate-900 dark:text-white text-base">                   Giao giÃ¡o Ã¡n                 </h3>                 <button                   type="button"                   onClick={() => setAssignTarget(null)}                   className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"                 >                   <X className="w-5 h-5" />                 </button>               </div>                <p className="text-slate-500 dark:text-slate-400">                 Chá»n lá»›p há»c hoáº·c há»c viÃªn Ä‘á»ƒ giao giÃ¡o Ã¡n{" "}                 <span className="font-semibold text-slate-800 dark:text-slate-200">                   "{assignTarget.curricName}"                 </span>:               </p>                <div>                 <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">                   Háº¡n hoÃ n thÃ nh (Deadline):                 </label>                 <input                   type="date"                   value={assignDeadline}                   onChange={(e) => setAssignDeadline(e.target.value)}                   className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3"                 />                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">                   Ghi chÃº bÃ i táº­p vá» nhÃ :                 </label>                 <input                   type="text"                   placeholder="VD: Táº­p 3 hiá»‡p, nghá»‰ Ä‘á»§ 45s giá»¯a cÃ¡c hiá»‡p..."                   value={assignNote}                   onChange={(e) => setAssignNote(e.target.value)}                   className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3"                 />               </div>                <div>                 <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">                   Chá»n Lá»›p há»c phá»¥ trÃ¡ch:                 </span>                 <div className="flex flex-col gap-1.5">                   {uniqueClasses.map((cls) => (                     <button                       key={cls.id}                       type="button"                       onClick={() => handleAssign("class", cls.id, cls.name)}                       className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"                     >                       <span>ðŸ“š Lá»›p: {cls.name}</span>                       <span className="text-[11px] text-emerald-600 font-semibold">Giao ngay â†’</span>                     </button>                   ))}                 </div>               </div>                <div>                 <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">                   Hoáº·c chá»n Há»c viÃªn kÃ¨m 1â€“1:                 </span>                 <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">                   {members.map((m) => (                     <button                       key={m.id}                       type="button"                       onClick={() => handleAssign("member", m.id, m.name)}                       className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"                     >                       <span>ðŸ‘¤ {m.name} ({m.code})</span>                       <span className="text-[11px] text-emerald-600 font-semibold">Giao ngay â†’</span>                     </button>                   ))}                 </div>               </div>             </div>           </div>,           document.body         )}     </div>   );
}

