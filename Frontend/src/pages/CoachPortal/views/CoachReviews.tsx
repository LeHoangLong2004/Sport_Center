import { useState, useEffect, useMemo } from "react";
import { Star, MessageSquare, Calendar, ShieldCheck, User } from "lucide-react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  fetchCoachReviews,
} from "../../MemberPortal/services/reviewSync";

interface ReviewItem {
  id: string;
  memberId: string;
  memberName: string;
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt: string;
  sessionName?: string;
}

export default function CoachReviews() {
  const { profile } = useUserProfile();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const coachId = profile.id;
    let active = true;

    async function loadReviews() {
      setLoading(true);
      try {
        const list = await fetchCoachReviews(coachId);
        if (active) setReviews(list);
      } catch (err) {
        console.error("Lỗi tải đánh giá:", err);
        if (active) setReviews([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviews();

    const interval = setInterval(() => {
      void loadReviews();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [profile?.id]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0.0, count: 0, breakdown: [0, 0, 0, 0, 0] };
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((total / reviews.length).toFixed(1));
    const breakdown = [5, 4, 3, 2, 1].map(
      (star) => reviews.filter((r) => r.rating === star).length
    );
    return { avg, count: reviews.length, breakdown };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (selectedStar === null) return reviews;
    return reviews.filter((r) => r.rating === selectedStar);
  }, [reviews, selectedStar]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                PHẢN HỒI HỌC VIÊN
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Đánh giá ẩn danh bảo mật
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              Đánh giá & Nhận xét
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Phản hồi thực tế từ học viên sau các buổi học (danh tính học viên được ẩn danh để đảm bảo tính khách quan).
            </p>
          </div>

          {/* Quick CSAT Score Box */}
          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 self-start md:self-auto">
            <div className="text-center pr-6 border-r border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                {stats.avg}
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{stats.count} lượt đánh giá</p>
            </div>

            {/* Star Distribution Small */}
            <div className="space-y-1 min-w-[130px]">
              {[5, 4, 3, 2, 1].map((star, idx) => {
                const count = stats.breakdown[idx];
                const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="w-3">{star}★</span>
                    <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-4 text-right text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedStar(null)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            selectedStar === null
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          Tất cả ({reviews.length})
        </button>

        {[5, 4, 3, 2, 1].map((s, idx) => {
          const count = stats.breakdown[idx];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStar(s)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStar === s
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <span>{s} sao</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-slate-400">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Reviews List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-sm text-slate-400">
            Đang tải đánh giá từ cơ sở dữ liệu...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Chưa có đánh giá nào {selectedStar ? `mức ${selectedStar} sao` : ""}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Phản hồi từ học viên sau khi kết thúc buổi học sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          filteredReviews.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {item.memberName}
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Đánh giá ẩn danh
                      </span>
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < item.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      {item.sessionName && (
                        <span className="text-xs text-slate-400 font-medium">· {item.sessionName}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </div>
              </div>

              {item.comment && (
                <p className="mt-3.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  {item.comment}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {item.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
