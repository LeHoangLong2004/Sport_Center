import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberSessionItem } from "../types";
import {
  DEFAULT_MEMBER_SESSIONS,
  getSavedMemberData,
  saveMemberData,
} from "../services/memberData";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  X,
  Star,
  PlusCircle,
  RotateCcw,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberSchedule({ onNavigate }: Props) {
  const [sessions, setSessions] = useState<MemberSessionItem[]>(() =>
    getSavedMemberData("member_sessions", DEFAULT_MEMBER_SESSIONS)
  );

  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [cancellingSession, setCancellingSession] = useState<MemberSessionItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Lock body scroll on modal
  useEffect(() => {
    if (cancellingSession) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [cancellingSession]);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "sắp diễn ra" || s.status === "đang diễn ra"
  );
  const pastSessions = sessions.filter((s) => s.status === "hoàn thành");
  const cancelledSessions = sessions.filter((s) => s.status === "đã hủy");

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSession) return;
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy lịch.");
      return;
    }

    const updated = sessions.map((s) =>
      s.id === cancellingSession.id
        ? {
            ...s,
            status: "đã hủy" as const,
            cancelReason: cancelReason.trim(),
          }
        : s
    );

    setSessions(updated);
    saveMemberData("member_sessions", updated);
    setCancellingSession(null);
    setCancelReason("");
    setFeedback(`Đã hủy buổi tập "${cancellingSession.name}". Chỗ học đã được giải phóng.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Lịch tập của tôi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi tất cả lịch học lớp nhóm và ca tập kèm 1-1 của bạn
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "upcoming"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Buổi sắp tới ({upcomingSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "past"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Lịch sử buổi học ({pastSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cancelled")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "cancelled"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Đã hủy ({cancelledSessions.length})
          </button>
        </div>
      </div>

      {/* 1. UPCOMING TAB */}
      {activeTab === "upcoming" && (
        <div className="space-y-3">
          {upcomingSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Bạn chưa có buổi tập nào sắp tới
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hãy khám phá các lớp học hoặc đặt lịch tập kèm riêng với Huấn luyện viên
              </p>
              <button
                type="button"
                onClick={() => onNavigate("booking")}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đặt lịch lớp ngay</span>
              </button>
            </div>
          ) : (
            upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Date badge */}
                  <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 text-center shrink-0 min-w-[80px]">
                    <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {session.startTime}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {session.date}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          session.type === "pt"
                            ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {session.type === "pt" ? "Kèm 1-1 PT" : session.sport}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {session.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.room}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>HLV: <strong className="text-slate-700 dark:text-slate-200">{session.coachName}</strong></span>
                      </div>
                    </div>

                    {session.coachNote && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                        💬 Lời dặn từ HLV: "{session.coachNote}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setCancellingSession(session)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
                  >
                    Hủy đặt chỗ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. PAST TAB */}
      {activeTab === "past" && (
        <div className="space-y-3">
          {pastSessions.map((session) => (
            <div
              key={session.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center shrink-0 min-w-[76px]">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {session.startTime}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {session.date}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {session.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        session.attendanceStatus === "có mặt"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : session.attendanceStatus === "đi muộn"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {session.attendanceStatus === "có mặt"
                        ? "Có mặt"
                        : session.attendanceStatus === "đi muộn"
                        ? "Đi muộn"
                        : "Vắng"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {session.room} • {session.coachName}
                  </p>

                  {session.coachNote && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 italic">
                      Nhận xét: "{session.coachNote}"
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => onNavigate("reviews")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Đánh giá HLV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. CANCELLED TAB */}
      {activeTab === "cancelled" && (
        <div className="space-y-3">
          {cancelledSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Bạn chưa có buổi tập nào bị hủy.
            </div>
          ) : (
            cancelledSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4 opacity-75"
              >
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {session.name} ({session.date} lúc {session.startTime})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    HLV: {session.coachName} • {session.room}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                    Lý do hủy: {session.cancelReason || "Học viên tự hủy"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL HỦY ĐẶT CHỖ (PORTAL TO BODY) */}
      {cancellingSession &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xác nhận hủy đặt chỗ
                </h3>
                <button
                  onClick={() => setCancellingSession(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmCancel} className="p-5 space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">{cancellingSession.name}</p>
                  <p className="text-[11px] mt-0.5">
                    Thời gian: {cancellingSession.startTime} ngày {cancellingSession.date}
                  </p>
                  <p className="text-[11px] mt-1 italic">
                    Hủy lịch sẽ giải phóng chỗ cho hội viên khác và không làm mất gói tập của bạn.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Lý do hủy: *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="VD: Em bận việc đột xuất không kịp đến trung tâm..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCancellingSession(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
                  >
                    Xác nhận hủy
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
