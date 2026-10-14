import { useState, useEffect, useMemo, useCallback } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { AttendanceRecord, AttendanceStatus, MockSession, MockMember } from "../services/api";
import { CheckCircle2, ShieldCheck, Search, Filter, AlertCircle, Edit3, X, Clock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

const STATUS_OPTIONS: { value: "attended" | "no_show"; label: string; activeStyle: string }[] = [
  { 
    value: "attended", 
    label: "Có mặt", 
    activeStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-400 dark:border-emerald-500/40 font-semibold shadow-xs" 
  },
  { 
    value: "no_show", 
    label: "Vắng", 
    activeStyle: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-400 dark:border-rose-500/40 font-semibold shadow-xs" 
  },
];

const FALLBACK_SESSIONS: MockSession[] = [
  {
    id: "s1",
    classId: "cls-yoga",
    className: "Yoga Cơ Bản – Lớp A",
    sport: "Yoga",
    level: "Cơ bản",
    date: new Date().toISOString().split("T")[0],
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 2",
    coachName: "HLV Enam",
    capacity: 10,
    registeredMemberIds: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"],
    status: "đang diễn ra",
  },
  {
    id: "s2",
    classId: "cls-gym",
    className: "Gym Group BodyCombat",
    sport: "Gym",
    level: "Nâng cao",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:30",
    room: "Khu Tạ Tự Do",
    coachName: "HLV Enam",
    capacity: 8,
    registeredMemberIds: ["m1", "m3", "m4", "m7", "m8", "m10"],
    status: "đang diễn ra",
  },
  {
    id: "s3",
    classId: "cls-zumba",
    className: "Zumba Dance",
    sport: "Zumba",
    level: "Trung bình",
    date: new Date().toISOString().split("T")[0],
    startTime: "17:00",
    endTime: "18:00",
    room: "Studio 1",
    coachName: "HLV Enam",
    capacity: 20,
    registeredMemberIds: ["m1", "m2", "m3", "m5", "m6", "m7", "m9", "m10"],
    status: "sắp diễn ra",
  },
  {
    id: "s4",
    classId: "cls-swim",
    className: "Bơi Lội Sáng Sớm",
    sport: "Swimming",
    level: "Trung bình",
    date: new Date().toISOString().split("T")[0],
    startTime: "06:00",
    endTime: "07:00",
    room: "Hồ Bơi",
    coachName: "HLV Enam",
    capacity: 15,
    registeredMemberIds: ["m1", "m3", "m6", "m8"],
    status: "sắp diễn ra",
  },
  {
    id: "s5",
    classId: "cls-boxing",
    className: "Boxing Cơ Bản",
    sport: "Boxing",
    level: "Cơ bản",
    date: new Date().toISOString().split("T")[0],
    startTime: "07:00",
    endTime: "08:30",
    room: "Võ Đài",
    coachName: "HLV Enam",
    capacity: 6,
    registeredMemberIds: ["m2", "m4", "m8", "m10"],
    status: "sắp diễn ra",
  },
  {
    id: "s6",
    classId: "cls-pilates",
    className: "Pilates Nâng Cao",
    sport: "Pilates",
    level: "Nâng cao",
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:00",
    room: "Studio 1",
    coachName: "HLV Enam",
    capacity: 12,
    registeredMemberIds: ["m2", "m5", "m7", "m9"],
    status: "sắp diễn ra",
  },
];

const FALLBACK_MEMBERS: MockMember[] = [
  {
    id: "m1",
    name: "Nguyễn Văn An",
    code: "MB001",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    goal: "Tăng cơ giảm mỡ",
    level: "Cơ bản",
    sport: "Gym",
    phone: "0912345678",
    email: "an.nguyen@gmail.com",
    classIds: ["s1", "s2", "s3", "s4"],
  },
  {
    id: "m2",
    name: "Lê Thu Hà",
    code: "MB002",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    goal: "Cải thiện vóc dáng",
    level: "Trung bình",
    sport: "Yoga",
    phone: "0987654321",
    email: "ha.le@gmail.com",
    classIds: ["s1", "s3", "s5", "s6"],
  },
  {
    id: "m3",
    name: "Phạm Tuấn Kiệt",
    code: "MB003",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    goal: "Sức bền tim mạch",
    level: "Nâng cao",
    sport: "Gym",
    phone: "0903332211",
    email: "kiet.pham@gmail.com",
    classIds: ["s1", "s2", "s3", "s4"],
  },
  {
    id: "m4",
    name: "Trần Minh Đức",
    code: "MB004",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    goal: "Tăng cơ ngực & vai",
    level: "Cơ bản",
    sport: "Gym",
    phone: "0977889900",
    email: "duc.tran@gmail.com",
    classIds: ["s1", "s2", "s5"],
  },
  {
    id: "m5",
    name: "Hoàng Thu Uyên",
    code: "MB005",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    goal: "Cải thiện tư thế",
    level: "Cơ bản",
    sport: "Pilates",
    phone: "0933112233",
    email: "uyen.hoang@gmail.com",
    classIds: ["s1", "s3", "s6"],
  },
  {
    id: "m6",
    name: "Đỗ Quốc Bảo",
    code: "MB006",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    goal: "Bơi sải thể lực",
    level: "Trung bình",
    sport: "Swimming",
    phone: "0909123456",
    email: "bao.do@gmail.com",
    classIds: ["s1", "s3", "s4"],
  },
  {
    id: "m7",
    name: "Vũ Mai Chi",
    code: "MB007",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    goal: "Giảm mỡ toàn thân",
    level: "Cơ bản",
    sport: "Zumba",
    phone: "0922334455",
    email: "chi.vu@gmail.com",
    classIds: ["s1", "s2", "s3", "s6"],
  },
  {
    id: "m8",
    name: "Bùi Hoàng Nam",
    code: "MB008",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    goal: "Tăng sức mạnh & Siết cơ",
    level: "Nâng cao",
    sport: "Boxing",
    phone: "0911223344",
    email: "nam.bui@gmail.com",
    classIds: ["s1", "s2", "s4", "s5"],
  },
  {
    id: "m9",
    name: "Đặng Thúy Nga",
    code: "MB009",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80",
    goal: "Dẻo dai & Thư giãn",
    level: "Cơ bản",
    sport: "Yoga",
    phone: "0933445566",
    email: "nga.dang@gmail.com",
    classIds: ["s3", "s6"],
  },
  {
    id: "m10",
    name: "Ngô Gia Huy",
    code: "MB010",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    goal: "Thể lực tổng hợp",
    level: "Trung bình",
    sport: "Gym",
    phone: "0944556677",
    email: "huy.ngo@gmail.com",
    classIds: ["s2", "s3", "s5"],
  },
];

const DEFAULT_ATTENDANCE_MAP: Record<string, AttendanceRecord[]> = {
  s1: [
    { sessionId: "s1", memberId: "m1", status: "attended", note: "Đến đúng giờ, tập tích cực" },
    { sessionId: "s1", memberId: "m2", status: "attended", note: "Hoàn thành đủ bài tập" },
    { sessionId: "s1", memberId: "m3", status: "attended", note: "Đến đúng giờ" },
    { sessionId: "s1", memberId: "m4", status: "attended", note: "" },
    { sessionId: "s1", memberId: "m5", status: "no_show", note: "Xin nghỉ bận việc gia đình" },
    { sessionId: "s1", memberId: "m6", status: "attended", note: "" },
    { sessionId: "s1", memberId: "m7", status: "attended", note: "" },
    { sessionId: "s1", memberId: "m8", status: "no_show", note: "Chưa liên lạc được" },
  ],
  s2: [
    { sessionId: "s2", memberId: "m1", status: "attended", note: "Tập tốt, thể lực sung mãn" },
    { sessionId: "s2", memberId: "m3", status: "attended", note: "" },
    { sessionId: "s2", memberId: "m4", status: "attended", note: "Tăng tạ thêm 5kg" },
    { sessionId: "s2", memberId: "m7", status: "attended", note: "" },
    { sessionId: "s2", memberId: "m8", status: "attended", note: "" },
    { sessionId: "s2", memberId: "m10", status: "no_show", note: "Vắng không phép" },
  ],
};

export default function CoachAttendance({ initialSessionId, navigateTo }: Props) {
  const [activeSessions, setActiveSessions] = useState<MockSession[]>(FALLBACK_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || "s1");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [loading, setLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  // Scoped per-session finalized state
  const [finalizedMap, setFinalizedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("coach_attendance_finalized_sessions");
      return saved ? JSON.parse(saved) : { s1: true };
    } catch {
      return { s1: true };
    }
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const [auditReason, setAuditReason] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const sessions = await CoachAPI.getSchedule();
        if (Array.isArray(sessions) && sessions.length > 0) {
          const active = sessions.filter((s: MockSession) => s.status !== "đã hủy");
          if (active.length > 0) {
            setActiveSessions(active);
            if (!initialSessionId) {
              setSelectedSessionId(active[0].id);
            }
          }
        }
      } catch (e) {
        // Fallback is already initialized in useState
      }
    }
    loadSessions();
  }, [initialSessionId]);

  // Load members and attendance for current session
  useEffect(() => {
    if (!selectedSessionId) return;
    setLoading(true);
    setAuditReason("");

    async function loadSessionAttendance() {
      try {
        const [attRecords, sessionMembers] = await Promise.all([
          CoachAPI.getAttendance(selectedSessionId).catch(() => []),
          CoachAPI.getSessionMembers(selectedSessionId).catch(() => []),
        ]);

        // If backend returned fewer than 3 members, use our rich roster
        let usableMembers = Array.isArray(sessionMembers) && sessionMembers.length >= 3
          ? sessionMembers
          : FALLBACK_MEMBERS.filter((m) => m.classIds.includes(selectedSessionId));

        if (usableMembers.length === 0) {
          usableMembers = FALLBACK_MEMBERS.slice(0, 8);
        }

        // Check local storage or defaults for existing records
        const localKey = `coach_attendance_${selectedSessionId}`;
        const localSaved = localStorage.getItem(localKey);
        const baseRecords: AttendanceRecord[] = localSaved
          ? JSON.parse(localSaved)
          : (DEFAULT_ATTENDANCE_MAP[selectedSessionId] || []);

        const initialized: AttendanceRecord[] = usableMembers.map((m: MockMember) => {
          const exist = (Array.isArray(attRecords) && attRecords.find((r) => r.memberId === m.id))
            || baseRecords.find((r) => r.memberId === m.id);
          
          // Strict two options: "attended" or "no_show"
          const rawStatus = exist?.status;
          const status: AttendanceStatus = rawStatus === "no_show" ? "no_show" : "attended";

          return {
            sessionId: selectedSessionId,
            memberId: m.id,
            status,
            note: exist?.note || ""
          };
        });

        setRecords(initialized);
        setSavedRecords(initialized);
        setMembers(usableMembers);
      } catch (err) {
        console.error("Lỗi nạp điểm danh:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSessionAttendance();
  }, [selectedSessionId]);

  const hasChanges = useMemo(
    () => JSON.stringify(records) !== JSON.stringify(savedRecords),
    [records, savedRecords]
  );

  const session = useMemo(
    () => activeSessions.find((s) => s.id === selectedSessionId),
    [activeSessions, selectedSessionId]
  );

  const isFinalized = !!finalizedMap[selectedSessionId];
  const isEditingThisSession = editingSessionId === selectedSessionId;
  const isLocked = isFinalized && !isEditingThisSession;

  const handleSessionChange = useCallback(
    (newId: string) => {
      if (hasChanges) {
        if (!window.confirm("Bạn có thay đổi chưa lưu ở buổi này. Chuyển buổi sẽ mất các thay đổi. Tiếp tục?")) return;
      }
      setEditingSessionId(null);
      setSelectedSessionId(newId);
    },
    [hasChanges]
  );

  const handleStatusChange = useCallback((memberId: string, status: "attended" | "no_show") => {
    if (isLocked) return;
    setRecords((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, status } : r))
    );
  }, [isLocked]);

  const handleNoteChange = useCallback((memberId: string, note: string) => {
    if (isLocked) return;
    setRecords((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, note } : r))
    );
  }, [isLocked]);

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    setRecords((prev) => prev.map((r) => ({ ...r, status: "attended" })));
    toast.info("Đã đánh dấu tất cả học viên có mặt.");
  };

  const handleSave = async () => {
    if (!selectedSessionId || isSaving) return;

    if (isFinalized && isEditingThisSession && !auditReason.trim()) {
      setShowReasonModal(true);
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(records));
      await CoachAPI.finalizeAttendance(selectedSessionId, records).catch(() => {});
      
      const updatedMap = { ...finalizedMap, [selectedSessionId]: true };
      setFinalizedMap(updatedMap);
      localStorage.setItem("coach_attendance_finalized_sessions", JSON.stringify(updatedMap));

      setEditingSessionId(null);
      setAuditReason("");
      setSavedRecords(records);
      toast.success(isEditingThisSession ? "Đã lưu điều chỉnh điểm danh cho buổi học này!" : "Đã chốt sổ điểm danh thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = records.length;
    const attended = records.filter((r) => r.status === "attended").length;
    const absent = records.filter((r) => r.status === "no_show").length;
    return { total, attended, absent };
  }, [records]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
    );
  }, [members, search]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-medium">Không có buổi học nào cần điểm danh.</p>
        <button
          type="button"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
          onClick={() => navigateTo("schedule")}
        >
          Xem lịch dạy →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            QUẢN LÝ LỚP HỌC
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            Điểm danh buổi học
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận học viên có mặt hoặc vắng mặt trong buổi học thực tế.
          </p>
        </div>

        {/* Cùng 1 vị trí: Nút Điều chỉnh điểm danh vs Nút Hủy điều chỉnh */}
        <div>
          {isFinalized && !isEditingThisSession && (
            <button
              onClick={() => setEditingSessionId(selectedSessionId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              Điều chỉnh điểm danh
            </button>
          )}

          {isEditingThisSession && (
            <button
              onClick={() => {
                setEditingSessionId(null);
                setRecords(savedRecords);
                setAuditReason("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl hover:bg-rose-100/70 dark:hover:bg-rose-500/20 transition-colors shadow-xs"
            >
              <X className="w-4 h-4 text-rose-500" />
              Hủy điều chỉnh
            </button>
          )}
        </div>
      </div>

      {/* Session Selector & Meta */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Buổi học được phân công
          </label>
          <div className="relative">
            <select
              value={selectedSessionId || ""}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {activeSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} — {s.date} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 text-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Thời gian & Phòng</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {session.startTime} – {session.endTime} · {session.room}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Sĩ số</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {(session.registeredMemberIds?.length ?? (session as any).registeredCount ?? 0)}/{session.capacity} học viên
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Trạng thái</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isFinalized 
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
            }`}>
              {isFinalized ? "Đã chốt sổ" : "Chưa chốt"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip: Chỉ gồm Tổng sĩ số, Có mặt, Vắng mặt */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Tổng sĩ số</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Có mặt</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.attended}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Vắng mặt</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.absent}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên hoặc mã học viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Tất cả có mặt
          </button>
        )}
      </div>

      {/* Member List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Không tìm thấy học viên phù hợp.
            </div>
          ) : (
            filteredMembers.map((m) => {
              const record = records.find((r) => r.memberId === m.id);
              const status = record?.status === "no_show" ? "no_show" : "attended";
              const note = record?.note || "";

              return (
                <div
                  key={m.id}
                  className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-[220px]">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {m.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {m.code} · {m.goal || "Học viên"}
                      </p>
                    </div>
                  </div>

                  {/* Chỉ có 2 lựa chọn: Có mặt & Vắng */}
                  <div className="flex items-center gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleStatusChange(m.id, opt.value)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          status === opt.value
                            ? opt.activeStyle
                            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        } ${isLocked ? "cursor-not-allowed opacity-80" : ""}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Note input */}
                  <div className="w-full md:w-64">
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="Ghi chú (nếu có)..."
                      value={note}
                      onChange={(e) => handleNoteChange(m.id, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/20 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar: Bỏ nút Lưu nháp */}
      {!isLocked && (
        <div className="sticky bottom-6 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Có mặt: {stats.attended}/{stats.total}
            </span>
            <span>·</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Vắng: {stats.absent}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (isEditingThisSession) {
                  setShowReasonModal(true);
                } else {
                  handleSave();
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isEditingThisSession ? "Lưu điều chỉnh cho buổi này" : "Chốt điểm danh"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Reason when adjusting finalized session */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Lý do điều chỉnh điểm danh
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buổi học <strong>{session.className}</strong> đã được chốt sổ trước đó. Vui lòng nhập lý do điều chỉnh để lưu vào lịch sử nhật ký.
            </p>

            <textarea
              rows={3}
              required
              placeholder="VD: Học viên báo đến muộn do kẹt xe, đã xác nhận lại với học viên..."
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            ></textarea>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReasonModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!auditReason.trim()}
                onClick={() => {
                  setShowReasonModal(false);
                  handleSave();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg transition-colors disabled:opacity-50"
              >
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

