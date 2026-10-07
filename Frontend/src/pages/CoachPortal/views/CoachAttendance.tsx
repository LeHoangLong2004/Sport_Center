/**
 * CO-04 — Điểm danh (ưu tiên cao nhất theo spec)
 *
 * Quy tắc dữ liệu (spec §7.3):
 * 1. Chưa có kết quả → "chưa điểm danh", không mặc định có mặt/vắng
 * 2. Mỗi cặp buổi–học viên có một kết quả hiện hành
 * 3. Đổi buổi tải đúng danh sách và kết quả của buổi mới
 * 4. Không dùng chung trạng thái học viên giữa nhiều buổi
 * 5. Không điểm danh booking/lớp đã hủy
 * 7. Tìm kiếm/lọc không làm mất thay đổi đang nhập
 * 8. Thống kê tính trên toàn danh sách, không chỉ hàng lọc
 * 9. "chưa điểm danh" là trạng thái UI riêng, không gửi thành no_show
 *
 * API contract (spec §7.5):
 *   Có mặt → "attended"
 *   Vắng   → "no_show"
 *   Đi trễ → Demo only (chưa có BE support)
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { CoachScreen } from "../types";
import {
  MOCK_SESSIONS,
  getMockAttendance,
  saveMockAttendance,
  getMembersForSession,
  type AttendanceRecord,
  type AttendanceStatus,
} from "../services/mockData";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; style: string }[] = [
  { value: "chưa điểm danh", label: "Chưa điểm danh", style: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  { value: "attended",        label: "Có mặt",         style: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { value: "no_show",         label: "Vắng",           style: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { value: "late",            label: "Đi trễ (Demo)", style: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
];

export default function CoachAttendance({ initialSessionId, navigateTo }: Props) {
  const activeSessions = MOCK_SESSIONS.filter((s) => s.status !== "đã hủy");
  const defaultSessionId = initialSessionId || activeSessions[0]?.id || null;

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(defaultSessionId);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [simulateError, setSimulateError] = useState(false);

  // Detect unsaved changes
  const hasChanges = useMemo(
    () => JSON.stringify(records) !== JSON.stringify(savedRecords),
    [records, savedRecords]
  );

  // Load records when session changes (spec rule 3)
  useEffect(() => {
    if (!selectedSessionId) return;
    const loaded = getMockAttendance(selectedSessionId);
    setRecords(loaded);
    setSavedRecords(loaded);
    setSaveSuccess(false);
    setSaveError(null);
  }, [selectedSessionId]);

  const session = useMemo(
    () => MOCK_SESSIONS.find((s) => s.id === selectedSessionId),
    [selectedSessionId]
  );
  const members = useMemo(
    () => (selectedSessionId ? getMembersForSession(selectedSessionId) : []),
    [selectedSessionId]
  );

  // Warn before switching session if unsaved (spec §7.4 step last)
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

  const handleSave = async () => {
    if (!selectedSessionId || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveMockAttendance(selectedSessionId, records, simulateError);
      setSavedRecords(records);
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err?.message || "Lưu thất bại. Vui lòng thử lại.");
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

  // Stats trên toàn danh sách (spec rule 8), không chỉ hàng đang lọc
  const stats = useMemo(() => {
    const total = records.length;
    const attended = records.filter((r) => r.status === "attended").length;
    const absent = records.filter((r) => r.status === "no_show").length;
    const late = records.filter((r) => r.status === "late").length;
    const pending = records.filter((r) => r.status === "chưa điểm danh").length;
    return { total, attended, absent, late, pending };
  }, [records]);

  // Search chỉ lọc hiển thị, KHÔNG làm mất records (spec rule 7)
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

  const isCancelled = session.status === "đã hủy";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Điểm danh</h1>

      {/* Banner demo */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
        ⚠️ Demo — lưu trên trình duyệt. "Đi trễ" là tùy chọn đề xuất, chưa có backend hỗ trợ.
      </div>

      {/* Bộ chọn buổi */}
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

      {/* Cảnh báo buổi đã hủy */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300 font-semibold">
          ⛔ Buổi này đã bị hủy — không thể điểm danh.
        </div>
      )}

      {!isCancelled && (
        <>
          {/* Thống kê — tính trên toàn danh sách */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatChip label="Tổng" value={stats.total} color="text-slate-700 dark:text-slate-200" />
            <StatChip label="Có mặt" value={stats.attended} color="text-green-600" />
            <StatChip label="Vắng" value={stats.absent} color="text-red-600" />
            <StatChip label="Chưa điểm danh" value={stats.pending} color={stats.pending > 0 ? "text-amber-600" : "text-slate-500"} />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã học viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              ✓ Tất cả có mặt
            </button>
          </div>

          {/* Bảng học viên */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span>Học viên</span>
              <span className="text-center">Trạng thái</span>
              <span className="w-[140px]">Ghi chú</span>
            </div>

            {filteredMembers.length === 0 && members.length > 0 && (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">
                Không tìm thấy học viên. (Thay đổi của bạn vẫn được giữ.)
              </div>
            )}
            {members.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">
                Buổi này chưa có học viên đăng ký.
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredMembers.map((m) => {
                const record = records.find((r) => r.memberId === m.id);
                const status = record?.status || "chưa điểm danh";
                const note = record?.note || "";

                return (
                  <div key={m.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-4 py-3">
                    {/* Học viên */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.code}</div>
                      </div>
                    </div>

                    {/* Trạng thái */}
                    <div className="flex gap-1.5 shrink-0">
                      {STATUS_OPTIONS.map((opt) => {
                        const isActive = status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleStatusChange(m.id, opt.value)}
                            title={opt.label}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                              isActive
                                ? `${opt.style} border-current ring-1 ring-current`
                                : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-transparent hover:border-slate-300 dark:hover:border-slate-500"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Ghi chú */}
                    <input
                      type="text"
                      placeholder="Ghi chú..."
                      value={note}
                      onChange={(e) => handleNoteChange(m.id, e.target.value)}
                      className="w-[140px] border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex flex-col gap-1">
              {hasChanges && !saveError && (
                <span className="text-amber-600 text-sm font-medium">● {stats.pending > 0 ? `${stats.pending} học viên chưa điểm danh` : "Có thay đổi chưa lưu"}</span>
              )}
              {saveSuccess && !hasChanges && (
                <span className="text-green-600 text-sm font-medium">✓ Demo — lưu trên trình duyệt thành công</span>
              )}
              {saveError && (
                <span className="text-red-600 text-sm font-medium">✗ {saveError}</span>
              )}
              {/* Test error simulation */}
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer mt-1">
                <input type="checkbox" checked={simulateError} onChange={(e) => setSimulateError(e.target.checked)} />
                Giả lập lỗi lưu (test)
              </label>
            </div>
            <button
              type="button"
              disabled={!hasChanges || isSaving}
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                !hasChanges || isSaving
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20"
              }`}
            >
              {isSaving ? "Đang lưu..." : saveError ? "Thử lại" : "Lưu kết quả"}
            </button>
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