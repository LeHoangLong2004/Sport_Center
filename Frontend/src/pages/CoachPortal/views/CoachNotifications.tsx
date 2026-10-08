/**
 * CO-08 — Thông báo & Bài tập về nhà
 * Chọn lớp/học viên có quyền. Xem lịch sử.
 */
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { CoachAPI } from "../services/api";
import type { MockNotification, MockSession, MockMember } from "../services/api";

type NType = "Thông báo" | "Bài tập về nhà";

export default function CoachNotifications() {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; code: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<NType>("Thông báo");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [targetType, setTargetType] = useState<"class" | "member">("class");
  const [targetId, setTargetId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      CoachAPI.getNotifications(),
      CoachAPI.getSchedule(),
      CoachAPI.getMembers()
    ]).then(([notifs, sch, mem]) => {
      setNotifications(notifs);
      setSessions(sch);
      setMembers(mem);
      
      const uniqueClassesMap = new Map<string, string>();
      sch.forEach((s: MockSession) => uniqueClassesMap.set(s.classId, s.classId));
      if (uniqueClassesMap.size > 0) {
        setTargetId(Array.from(uniqueClassesMap.keys())[0]);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const uniqueClasses = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    sessions.forEach((s) => {
      if (!map.has(s.classId)) map.set(s.classId, { id: s.classId, name: s.className.split("–")[0].trim() });
    });
    return Array.from(map.values());
  }, [sessions]);

  const targetName = useMemo(() => {
    if (targetType === "class") return uniqueClasses.find((c) => c.id === targetId)?.name || "";
    return members.find((m) => m.id === targetId)?.name || "";
  }, [targetType, targetId, uniqueClasses, members]);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) { setFeedback("Vui lòng điền tiêu đề và nội dung."); return; }
    if (!targetId) { setFeedback("Vui lòng chọn người nhận."); return; }
    setIsSending(true);
    await CoachAPI.sendNotification({ title, content, type, targetType, targetId, targetName, deadline: type === "Bài tập về nhà" ? deadline : undefined });
    const notifs = await CoachAPI.getNotifications();
    setNotifications(notifs);
    setIsSending(false);
    setShowForm(false);
    setTitle(""); setContent(""); setDeadline("");
    setFeedback("Đã gửi thông báo thành công");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
        <button type="button" onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 shadow-md shadow-teal-500/20">
          + Tạo thông báo
        </button>
      </div>

      {feedback && (
        <div className="rounded-xl px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 text-sm">
          {feedback}
        </div>
      )}

      {/* Lịch sử */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Lịch sử gửi</h2>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">Chưa có thông báo nào.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{n.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.type === "Bài tập về nhà" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                        {n.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      → {n.targetName} · {new Date(n.sentAt).toLocaleDateString("vi-VN")}
                      {n.deadline && ` · Hạn: ${n.deadline}`}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{n.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo thông báo</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {/* Loại */}
            <div className="flex gap-2">
              {(["Thông báo", "Bài tập về nhà"] as NType[]).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${type === t ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Người nhận */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Người nhận</label>
              <div className="flex gap-2 mb-2">
                {(["class", "member"] as const).map((tt) => (
                  <button key={tt} type="button" onClick={() => { setTargetType(tt); setTargetId(tt === "class" ? uniqueClasses[0]?.id || "" : members[0]?.id || ""); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${targetType === tt ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                    {tt === "class" ? "Lớp" : "Học viên"}
                  </button>
                ))}
              </div>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={selectCls}>
                {targetType === "class"
                  ? uniqueClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                  : members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
              {/* Xem trước người nhận */}
              <div className="text-xs text-slate-400 mt-1">
                Người nhận: <span className="text-teal-600 dark:text-teal-400 font-medium">{targetName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tiêu đề *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Tiêu đề thông báo" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nội dung *</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className={inputCls} placeholder="Nội dung..." />
            </div>
            {type === "Bài tập về nhà" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hạn thực hiện</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                Hủy
              </button>
              <button type="button" onClick={handleSend} disabled={isSending}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:bg-slate-300">
                {isSending ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const selectCls = "border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 w-full";
const inputCls = "border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full";
