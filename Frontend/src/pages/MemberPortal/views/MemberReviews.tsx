import { useState, useEffect, useMemo } from "react";
import type { MemberScreen, MemberCoachReviewItem, MemberSessionItem } from "../types";
import { fetchMyReviews, submitCoachReview } from "../services/reviewSync";
import { scheduleSync } from "../services/scheduleSync";
import { getSavedMemberData, MemberBackendAPI } from "../services/memberData";
import { resolveSessionStatus } from "./schedule/scheduleConstants";
import {
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  MessageSquare,
  History,
  Clock,
  Award,
  ThumbsUp,
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
  const [serverSessions, setServerSessions] = useState<MemberSessionItem[]>([]);
  const [activeReviewSession, setActiveReviewSession] = useState<ReviewSessionTarget | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return "5.0";
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Check if there was a direct review request passed from Schedule
  useEffect(() => {
    try {
      const targetStr = localStorage.getItem("target_review_session");
      if (targetStr) {
        const parsed = JSON.parse(targetStr);
        if (parsed && (parsed.sessionName || parsed.sessionId)) {
          setActiveReviewSession(parsed);
        }
        localStorage.removeItem("target_review_session");
      }
    } catch {}
  }, []);

  // Fetch submitted reviews
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
            date: item.createdAt ? item.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            rating: item.rating,
            tags: item.tags,
            comment: item.comment,
          }))
        );
      })
      .catch((error) => console.error("Không thể tải lịch sử đánh giá:", error));

    // Also load bookings from backend to ensure freshest data
    void MemberBackendAPI.getBookings()
      .then((bookings) => {
        if (active && Array.isArray(bookings)) {
          setServerSessions(bookings);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [userId]);

  // Available sessions to review from user's real completed sessions
  const availableSessions = useMemo(() => {
    const storageKey = userId ? `member_sessions_${userId}` : "member_sessions";
    const localMemberSessions = getSavedMemberData<MemberSessionItem[]>(storageKey, []);
    const syncedSessions = scheduleSync.getSyncedSessions();

    const candidateList: ReviewSessionTarget[] = [];

    // 1. Sessions from member schedule storage and server bookings
    const combinedMemberSessions = [...serverSessions, ...localMemberSessions];
    combinedMemberSessions.forEach((s) => {
      const effStatus = resolveSessionStatus(s.status, s.date, s.endTime, s.startTime);
      const isCompleted = effStatus === "hoàn thành" || s.attendanceStatus === "có mặt";
      const hasCoach = s.coachName && s.coachName !== "N/A" && s.coachName.trim() !== "";
      if (isCompleted && hasCoach) {
        candidateList.push({
          sessionId: s.id,
          sessionName: s.name || `Tập cùng ${s.coachName}`,
          coachId: s.coachId || "",
          coachName: s.coachName,
          date: s.date || new Date().toISOString().split("T")[0],
        });
      }
    });

    // 2. Sessions from coach schedule sync (if any)
    syncedSessions.forEach((s) => {
      const matchMember = s.memberId === userId || s.memberName === memberName;
      const isCompleted = s.attendanceStatus === "có mặt" || s.status === "hoàn thành";
      if (matchMember && isCompleted && s.coachName) {
        candidateList.push({
          sessionId: s.id,
          sessionName: s.className || `Tập với ${s.coachName}`,
          coachId: s.coachId || "",
          coachName: s.coachName,
          date: s.date || new Date().toISOString().split("T")[0],
        });
      }
    });

    // 3. Deduplicate and filter out already reviewed sessions
    let reviewedIds: string[] = [];
    try {
      reviewedIds = JSON.parse(localStorage.getItem("reviewed_session_ids") || "[]");
    } catch {}

    const unique = new Map<string, ReviewSessionTarget>();
    candidateList.forEach((item) => {
      const alreadyReviewed =
        reviews.some((r) => r.sessionId === item.sessionId) ||
        reviewedIds.includes(item.sessionId);

      if (!alreadyReviewed && item.sessionId && !unique.has(item.sessionId)) {
        unique.set(item.sessionId, item);
      }
    });

    return Array.from(unique.values());
  }, [reviews, serverSessions, userId, memberName]);

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
      coachId: reviewRes.coachId || data.coachId,
      coachName: reviewRes.coachName || data.coachName || "Coach",
      date: new Date().toISOString().split("T")[0],
      rating: data.rating,
      tags: data.tags,
      comment: data.comment,
    };

    setReviews((prev) => [newReview, ...prev]);
    setActiveTab("history");
    setFeedback("Cảm ơn bạn đã gửi đánh giá! Đóng góp của bạn giúp HLV hoàn thiện chất lượng giảng dạy.");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Đánh giá Huấn luyện viên
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gửi phản hồi và xem lại lịch sử nhận xét chất lượng giảng dạy sau mỗi ca tập luyện thực tế của bạn
          </p>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1.5 max-w-fit shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Ca tập chờ đánh giá</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              availableSessions.length > 0
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            {availableSessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử đánh giá của bạn</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
            {reviews.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SESSIONS READY FOR REVIEW */}
      {activeTab === "pending" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Ca tập đã hoàn thành cần gửi nhận xét ({availableSessions.length})
              </h3>
            </div>
          </div>

          {availableSessions.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Tất cả ca tập đã được đánh giá đầy đủ!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Hiện bạn không còn buổi tập nào cần gửi nhận xét. Sau khi bạn tham gia các buổi tập tiếp theo cùng Huấn luyện viên, mục đánh giá sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSessions.map((s) => (
                <div
                  key={s.sessionId}
                  className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                      Đã hoàn thành
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-1">
                      {s.sessionName}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      HLV phụ trách: <strong className="text-slate-800 dark:text-slate-200">{s.coachName}</strong>
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      Ngày tập: {s.date}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveReviewSession(s)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Viết đánh giá ngay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMITTED REVIEWS (LỊCH SỬ ĐÁNH GIÁ) */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
                  Đánh giá đã gửi
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {reviews.length} <span className="text-xs font-normal text-slate-400">lượt</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
                  Điểm trung bình bạn chấm
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {avgRating}
                  </span>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center text-amber-500">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
                  Mức độ hài lòng
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {reviews.length > 0 ? "100%" : "Chưa có"} <span className="text-xs font-normal text-slate-400">{reviews.length > 0 ? "Tích cực" : "Dữ liệu"}</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* List of Reviews */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                Danh sách đánh giá đã hoàn thành ({reviews.length})
              </h3>
            </div>

            {reviews.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Bạn chưa gửi đánh giá nào
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Các đánh giá của bạn sau khi hoàn thành buổi học cùng Huấn luyện viên sẽ được lưu trữ lịch sử tại đây.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((r) => (
                  <div key={r.id} className="py-5 first:pt-2 last:pb-2 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {r.sessionName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          HLV: <strong className="text-slate-700 dark:text-slate-300">{r.coachName}</strong> • Ngày gửi: {r.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-800">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 ml-1">
                          {r.rating}.0
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{r.comment || "Không có góp ý thêm."}"
                    </div>

                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800"
                          >
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      <ReviewModal
        session={activeReviewSession}
        onClose={() => setActiveReviewSession(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}

