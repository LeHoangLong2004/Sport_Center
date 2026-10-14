import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberCoachReviewItem } from "../types";
import {
  DEFAULT_COACH_REVIEWS,
  getSavedMemberData,
  saveMemberData,
} from "../services/memberData";
import {
  submitCoachReview,
  fetchCoachReviews,
  subscribeToReviews,
} from "../services/reviewSync";
import { scheduleSync } from "../services/scheduleSync";
import {
  Star,
  CheckCircle2,
  User,
  Calendar,
  MessageSquare,
  Sparkles,
  X,
  Plus,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

const DEFAULT_AVAILABLE_FOR_REVIEW = [
  {
    sessionId: "sess-05",
    sessionName: "Functional HIIT Cường độ cao",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam (HLV Enam)",
    date: "2026-10-13",
  },
];

export default function MemberReviews({ onNavigate }: Props) {
  const [reviews, setReviews] = useState<MemberCoachReviewItem[]>(() =>
    getSavedMemberData("member_coach_reviews", DEFAULT_COACH_REVIEWS)
  );

  const [activeReviewSession, setActiveReviewSession] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Nhiệt tình", "Sửa form kỹ"]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available sessions to review, merged from scheduleSync
  const availableSessions = useMemo(() => {
    const fromSchedule = scheduleSync.getSyncedSessions()
      .filter(
        (s) =>
          s.type === "pt" ||
          s.attendanceStatus === "có mặt" ||
          (s.coachName && s.coachName.includes("Nam"))
      )
      .map((s) => ({
        sessionId: s.id,
        sessionName: s.className || `Tập 1-1 với ${s.coachName}`,
        coachId: s.coachId || "25f50fba-506a-4edf-9db7-43f77f6741a4",
        coachName: s.coachName || "HLV Hồ Xuân Ánh Nam",
        date: s.date || new Date().toISOString().split("T")[0],
      }));

    const combined = [...fromSchedule, ...DEFAULT_AVAILABLE_FOR_REVIEW];
    const unique = new Map<string, (typeof combined)[0]>();
    combined.forEach((item) => {
      // Don't show in available if already reviewed
      const alreadyReviewed = reviews.some((r) => r.sessionId === item.sessionId);
      if (!alreadyReviewed && !unique.has(item.sessionId)) {
        unique.set(item.sessionId, item);
      }
    });
    return Array.from(unique.values());
  }, [reviews]);

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
        coachId: activeReviewSession.coachId || "25f50fba-506a-4edf-9db7-43f77f6741a4",
        coachName: activeReviewSession.coachName || "HLV Hồ Xuân Ánh Nam",
        sessionId: activeReviewSession.sessionId,
        sessionName: activeReviewSession.sessionName,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        memberName: "Hồ Xuân Ánh Nam",
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

      const updated = [newReview, ...reviews.filter((r) => r.id !== newReview.id)];
      setReviews(updated);
      saveMemberData("member_coach_reviews", updated);

      setActiveReviewSession(null);
      setComment("");
      setFeedback(`Cảm ơn bạn đã gửi đánh giá cho ${activeReviewSession.coachName}! Đánh giá đã được gửi và ẩn danh bảo mật.`);
      setTimeout(() => setFeedback(null), 4000);
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
          <button onClick={() => setFeedback(null)} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Đánh giá Huấn luyện viên</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gửi nhận xét sau mỗi buổi tập để giúp nâng cao chất lượng huấn luyện của trung tâm
        </p>
      </div>

      {/* 1. SESSIONS WAITING FOR REVIEW */}
      {availableSessions.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Buổi học đã hoàn thành chờ bạn đánh giá ({availableSessions.length}):</span>
          </div>

          <div className="space-y-2.5">
            {availableSessions.map((sess) => (
              <div
                key={sess.sessionId}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {sess.sessionName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    HLV: <strong>{sess.coachName}</strong> • Ngày học: {sess.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveReviewSession(sess)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm self-start sm:self-center flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Đánh giá ngay</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. REVIEWS SENT HISTORY */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Lịch sử các đánh giá bạn đã gửi ({reviews.length})
        </h3>

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{rev.sessionName}</span>
                  <span className="text-slate-400 ml-2">với {rev.coachName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-slate-500 text-[11px] ml-1">({rev.rating}/5)</span>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 italic">
                "{rev.comment}"
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {rev.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    #{tag}
                  </span>
                ))}
                <span className="text-[10px] text-slate-400 ml-auto">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL GỬI ĐÁNH GIÁ (PORTAL) */}
      {activeReviewSession &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    Đánh giá chất lượng
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeReviewSession.coachName} - {activeReviewSession.sessionName}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveReviewSession(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs">
                {/* Rating Stars */}
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
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {rating === 5
                        ? "Rất tuyệt vời!"
                        : rating === 4
                        ? "Hài lòng"
                        : rating === 3
                        ? "Bình thường"
                        : "Cần cải thiện"}
                    </span>
                  </div>
                </div>

                {/* Quick Tags */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Điểm nổi bật của buổi học:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_LIST.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            active
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment textarea */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Cảm nhận & Góp ý chi tiết cho HLV: *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="VD: Thầy chỉnh tư thế rất kỹ, bài tập nặng vừa sức, em rất thích buổi tập này!"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveReviewSession(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 rounded-lg shadow-sm"
                  >
                    Gửi đánh giá
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
