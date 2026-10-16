import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberCoachReviewItem } from "../types";
import { getSavedMemberData, saveMemberData } from "../services/memberData";
import { submitCoachReview } from "../services/reviewSync";
import { scheduleSync } from "../services/scheduleSync";
import {
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  MessageSquare,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberReviews({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const memberName = user?.fullName || user?.name || "Hội viên";
  const storageKey = userId ? `member_coach_reviews_${userId}` : "member_coach_reviews";

  const [reviews, setReviews] = useState<MemberCoachReviewItem[]>(() =>
    getSavedMemberData(storageKey, [])
  );

  const [activeReviewSession, setActiveReviewSession] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Nhiệt tình", "Sửa form kỹ"]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const TAGS_LIST = [
    "Nhiệt tình",
    "Sửa form kỹ",
    "Đúng giờ",
    "Âm nhạc thư giãn",
    "Bài tập đa dạng",
    "Động viên tích cực",
    "Giảng dạy dễ hiểu",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewSession) return;
    if (!comment.trim()) {
      alert("Vui lòng nhập cảm nhận hoặc góp ý cho Huấn luyện viên.");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewRes = await submitCoachReview({
        coachId: activeReviewSession.coachId || "",
        coachName: activeReviewSession.coachName || "HLV Thể thao",
        sessionId: activeReviewSession.sessionId,
        sessionName: activeReviewSession.sessionName,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        memberName,
      });

      const newReview: MemberCoachReviewItem = {
        id: reviewRes.id,
        sessionId: activeReviewSession.sessionId,
        sessionName: activeReviewSession.sessionName,
        coachId: reviewRes.coachId,
        coachName: reviewRes.coachName,
        date: new Date().toISOString().split("T")[0],
        rating,
        tags: selectedTags,
        comment: comment.trim(),
      };

      const updated = [newReview, ...reviews];
      setReviews(updated);
      saveMemberData(storageKey, updated);

      setActiveReviewSession(null);
      setComment("");
      setSelectedTags(["Nhiệt tình", "Sửa form kỹ"]);
      setRating(5);
      setFeedback("Cảm ơn bạn đã gửi đánh giá! Đóng góp của bạn giúp HLV hoàn thiện chất lượng giảng dạy.");
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      alert("Có lỗi xảy ra khi lưu đánh giá. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
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
                  onClick={() => {
                    setActiveReviewSession(s);
                    setRating(5);
                    setComment("");
                  }}
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

      {/* REVIEW MODAL (PORTAL) */}
      {activeReviewSession &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    {activeReviewSession.sessionName}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Đánh giá HLV {activeReviewSession.coachName}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveReviewSession(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Mức độ hài lòng:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-slate-700 dark:text-slate-300">
                      {rating === 5 ? "Rất hài lòng ⭐⭐⭐⭐⭐" : `${rating} sao`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Nhãn nhận xét nổi bật:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS_LIST.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          selectedTags.includes(tag)
                            ? "bg-orange-600 border-orange-600 text-white"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Cảm nhận chi tiết & góp ý:
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Hãy chia sẻ trải nghiệm tập luyện, tinh thần hướng dẫn hoặc bài học bạn nhận được từ HLV..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveReviewSession(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
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
