import { useState, useEffect, useMemo, useCallback } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { AttendanceRecord, AttendanceStatus, MockSession, MockMember } from "../services/api";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; style: string }[] = [
  { value: "chưa điểm danh", label: "Chưa điểm danh", style: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  { value: "attended",        label: "Có mặt",         style: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { value: "no_show",         label: "Vắng",           style: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { value: "late",            label: "Đi trễ",         style: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
];

export default function CoachAttendance({ initialSessionId, navigateTo }: Props) {
  const [activeSessions, setActiveSessions] = useState<MockSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState("");

  // Tải danh sách buổi học
  useEffect(() => {
    CoachAPI.getSchedule().then((sessions) => {
      const active = sessions.filter((s: MockSession) => s.status !== "đã hủy");
      setActiveSessions(active);
      if (!selectedSessionId && active.length > 0) {
        setSelectedSessionId(active[0].id);
      }
    });
  }, []);

  // Tải danh sách học viên & kết quả điểm danh của buổi đang chọn
  useEffect(() => {
    if (!selectedSessionId) return;
    setLoading(true);
    Promise.all([
      CoachAPI.getAttendance(selectedSessionId),
      CoachAPI.getSessionMembers(selectedSessionId)
    ]).then(([attRecords, sessionMembers]) => {
      const initialized = sessionMembers.map((m: MockMember) => {
        const exist = attRecords.find((r: AttendanceRecord) => r.memberId === m.id);
        return exist || { sessionId: selectedSessionId, memberId: m.id, status: "chưa điểm danh" as AttendanceStatus, note: "" };
      });
      setRecords(initialized);
      setSavedRecords(initialized);
      setMembers(sessionMembers);
      setSaveSuccess(false);
      setSaveError(null);
      setLoading(false);
    });
  }, [selectedSessionId]);

  const hasChanges = useMemo(
    () => JSON.stringify(records) !== JSON.stringify(savedRecords),
    [records, savedRecords]
  );

  const session = useMemo(
    () => activeSessions.find((s) => s.id === selectedSessionId),
    [activeSessions, selectedSessionId]
  );

  const handleSessionChange = useCallback(
    (newId: string) => {
      if (hasChanges) {
        if (!window.confirm("Bạn có thay đổi chưa lưu. Chuyển buổi sẽ mất các thay đổi này. Tiếp tục?")) return;
      }
      setSelectedSessionId(newId);
    },
    [hasChanges]
  );

  const handleStatusChange = useCallback((memberId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, status } : r))
    );
    setSaveSuccess(false);
    setSaveError(null);
  }, []);

  const handleNoteChange = useCallback((memberId: string, note: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, note } : r))
    );
    setSaveSuccess(false);
  }, []);

  const handleSave = async (isDraft: boolean) => {
    if (!selectedSessionId || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      if (isDraft) {
        await CoachAPI.saveAttendanceDraft(selectedSessionId, records);
      } else {
        await CoachAPI.finalizeAttendance(selectedSessionId, records);
      }
      setSavedRecords(records);
      setSaveSuccess(true);
    } catch (err) {
      const e = err as Error;
      setSaveError(e?.message || "Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllPresent = () => {
    if (!window.confirm("Đánh dấu TẤT CẢ học viên (kể cả đã nhập) là Có mặt. Tiếp tục?")) return;
    setRecords((prev) => prev.map((r) => ({ ...r, status: "attended" as AttendanceStatus })));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const stats = useMemo(() => {
    const total = records.length;
    const attended = records.filter((r) => r.status === "attended").length;
    const absent = records.filter((r) => r.status === "no_show").length;
    const late = records.filter((r) => r.status === "late").length;
    const pending = records.filter((r) => r.status === "chưa điểm danh").length;
    return { total, attended, absent, late, pending };
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
        <p>Không có buổi học nào để điểm danh.</p>
        <button type="button" className="text-teal-600 hover:underline text-sm" onClick={() => navigateTo("schedule")}>
          → Xem lịch dạy
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Điểm danh</h1>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Chọn buổi học</label>
          <select
            className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={selectedSessionId || ""}
            onChange={(e) => handleSessionChange(e.target.value)}
          >
            {activeSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.className} — {s.date} {s.startTime}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <div><span className="font-medium text-slate-700 dark:text-slate-200">{session.room}</span></div>
          <div>{session.registeredMemberIds.length}/{session.capacity} người đăng ký</div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Đang tải danh sách...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatChip label="Tổng" value={stats.total} color="text-slate-700 dark:text-slate-200" />
            <StatChip label="Có mặt" value={stats.attended} color="text-green-600" />
            <StatChip label="Vắng" value={stats.absent} color="text-red-600" />
            <StatChip label="Chưa điểm danh" value={stats.pending} color={stats.pending > 0 ? "text-amber-600" : "text-slate-500"} />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã học viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              ✓ Tất cả có mặt
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span>Học viên</span>
              <span className="text-center">Trạng thái</span>
              <span className="w-[140px]">Ghi chú</span>
            </div>

            {filteredMembers.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">Không tìm thấy học viên.</div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredMembers.map((m) => {
                const record = records.find((r) => r.memberId === m.id);
                const status = record?.status || "chưa điểm danh";
                const note = record?.note || "";

                return (
                  <div key={m.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.code}</div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleStatusChange(m.id, opt.value)}
                          title={opt.label}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                            status === opt.value
                              ? `${opt.style} border-current ring-1 ring-current`
                              : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-transparent hover:border-slate-300 dark:hover:border-slate-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Ghi chú..."
                      value={note}
                      onChange={(e) => handleNoteChange(m.id, e.target.value)}
                      className="w-[140px] border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-4">
            <div className="flex flex-col gap-1">
              {hasChanges && !saveError && (
                <span className="text-amber-600 text-sm font-medium">● {stats.pending > 0 ? `${stats.pending} học viên chưa điểm danh` : "Có thay đổi chưa lưu"}</span>
              )}
              {saveSuccess && !hasChanges && (
                <span className="text-green-600 text-sm font-medium">✓ Đã lưu thành công qua API</span>
              )}
              {saveError && (
                <span className="text-red-600 text-sm font-medium">✗ {saveError}</span>
              )}
            </div>
            <div className="flex gap-3">
                <button
                type="button"
                disabled={!hasChanges || isSaving}
                onClick={() => handleSave(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    !hasChanges || isSaving
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "border border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                }`}
                >
                {isSaving ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                type="button"
                disabled={!hasChanges || isSaving || stats.pending > 0}
                title={stats.pending > 0 ? "Phải điểm danh đủ tất cả mới được chốt sổ" : ""}
                onClick={() => handleSave(false)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    !hasChanges || isSaving || stats.pending > 0
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20"
                }`}
                >
                Chốt sổ
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
