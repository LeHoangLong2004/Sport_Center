import { useState, useEffect, useMemo } from "react";
import type { MemberScreen, MemberCoachReviewItem } from "../types";
import { fetchMyReviews, submitCoachReview } from "../services/reviewSync";
import { scheduleSync } from "../services/scheduleSync";
import {
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  MessageSquare,
} from "lucide-react";
import { ReviewModal, type ReviewSessionTarget } from "./reviews/ReviewModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberReviews({ onNavigate: _onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const memberName = user?.fullName || user?.name || "Hội viên";
  const [reviews, setReviews] = useState<MemberCoachReviewItem[]>([]);
  const [activeReviewSession, setActiveReviewSession] = useState<ReviewSessionTarget | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    void fetchMyReviews()
      .then((items) => {
        if (!active) return;
        setReviews(
          items.map((item) => ({
            id: item.id,
            sessionId: item.sessionId || "",
            sessionName: item.sessionName || "Buổi tập",
            coachId: item.coachId,
            coachName: item.coachName || "Huấn luyện viên",
            date: item.createdAt.split("T")[0],
            rating: item.rating,
            tags: item.tags,
            comment: item.comment,
          }))
        );
      })
      .catch((error) => console.error("Không thể tải lịch sử đánh giá:", error));

    return () => {
      active = false;
    };
  }, [userId]);

  // Available sessions to review from user's real completed sessions
  const availableSessions = useMemo(() => {
    const fromSchedule = scheduleSync.getSyncedSessions()
      .filter(
        (s) =>
          (s.memberId === userId || s.memberName === memberName) &&
          (s.attendanceStatus === "có mặt" || s.status === "hoàn thành") &&
          s.coachName
      )
      .map((s) => ({
        sessionId: s.id,
        sessionName: s.className || `Tập với ${s.coachName}`,
        coachId: s.coachId || "",
        coachName: s.coachName,
        date: s.date || new Date().toISOString().split("T")[0],
      }));

    const unique = new Map<string, (typeof fromSchedule)[0]>();
    fromSchedule.forEach((item) => {
      const alreadyReviewed = reviews.some((r) => r.sessionId === item.sessionId);
      if (!alreadyReviewed && !unique.has(item.sessionId)) {
        unique.set(item.sessionId, item);
      }
    });
    return Array.from(unique.values());
  }, [reviews, userId, memberName]);

  const handleReviewSubmit = async (data: {
    sessionId: string;
    sessionName: string;
    coachId: string;
    coachName: string;
    rating: number;
    tags: string[];
    comment: string;
  }) => {
    const reviewRes = await submitCoachReview({
      coachId: data.coachId,
      coachName: data.coachName,
      sessionId: data.sessionId,
      sessionName: data.sessionName,
      rating: data.rating,
      comment: data.comment,
      tags: data.tags,
      memberName,
    });

    const newReview: MemberCoachReviewItem = {
      id: reviewRes.id,
      sessionId: data.sessionId,
      sessionName: data.sessionName,
      coachId: reviewRes.coachId,
      coachName: reviewRes.coachName || data.coachName || "Coach",
      date: new Date().toISOString().split("T")[0],
      rating: data.rating,
      tags: data.tags,
      comment: data.comment,
    };

    setReviews((prev) => [newReview, ...prev]);
    setFeedback("Cảm ơn bạn đã gửi đánh giá! Đóng góp của bạn giúp HLV hoàn thiện chất lượng giảng dạy.");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Đánh giá Huấn luyện viên</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gửi phản hồi và xếp hạng chất lượng hướng dẫn sau mỗi ca tập luyện thực tế của bạn
        </p>
      </div>

      {/* 1. SESSIONS READY FOR REVIEW */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ca tập đã tham gia cần bạn gửi cảm nhận ({availableSessions.length})
            </h3>
          </div>
        </div>

        {availableSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              Chưa có buổi tập nào cần đánh giá
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Sau khi bạn tham gia và hoàn thành các buổi tập kèm cùng Huấn luyện viên, mục đánh giá sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableSessions.map((s) => (
              <div
                key={s.sessionId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.sessionName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">HLV: {s.coachName}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Ngày tập: {s.date}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReviewSession(s)}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  Viết đánh giá
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SUBMITTED REVIEWS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Lịch sử đánh giá của bạn ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p>Bạn chưa gửi đánh giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{r.sessionName}</h4>
                    <p className="text-[11px] text-slate-500">HLV: {r.coachName} • Ngày gửi: {r.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{r.comment}"</p>

                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      <ReviewModal
        session={activeReviewSession}
        onClose={() => setActiveReviewSession(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}

