import React from "react";
import { createPortal } from "react-dom";
import { Star, ShieldCheck, Calendar, Clock, X, MessageSquare, Award, ExternalLink } from "lucide-react";
import type { SyncedCoachReview } from "../../../services/sync/reviewSync";

interface CoachReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Partial<SyncedCoachReview> | null;
  loading?: boolean;
  onNavigateToAllReviews?: () => void;
}

export default function CoachReviewDetailModal({
  isOpen,
  onClose,
  review,
  loading = false,
  onNavigateToAllReviews,
}: CoachReviewDetailModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Hôm nay";
    try {
      const d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return isoString;
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };

  const getRatingLabel = (rating: number = 5) => {
    if (rating >= 5) return "Tuyệt vời (5/5 sao)";
    if (rating >= 4) return "Hài lòng (4/5 sao)";
    if (rating >= 3) return "Bình thường (3/5 sao)";
    if (rating >= 2) return "Cần cải thiện (2/5 sao)";
    return "Không hài lòng (1/5 sao)";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-teal-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Phản hồi Huấn luyện viên
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chi tiết Đánh giá từ Học viên
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Đang tải thông tin đánh giá...</p>
            </div>
          ) : !review ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Không tìm thấy thông tin chi tiết cho đánh giá này.
            </div>
          ) : (
            <>
              {/* Member & Date Header */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                    {review.anonymizedMemberName?.slice(-3) || "HV"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{review.anonymizedMemberName || review.memberName || "Học viên ẩn danh"}</span>
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Danh tính bảo mật khách quan
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>

              {/* Rating Big Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4.5 text-center space-y-2">
                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                  <span>{review.rating ?? 5}.0</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < (review.rating ?? 5)
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  {getRatingLabel(review.rating)}
                </p>
              </div>

              {/* Session / Class Info */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Buổi tập / Lớp học được đánh giá
                </label>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{review.sessionName || "Buổi tập chuyên đề cùng HLV"}</span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Đã hoàn thành
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  Cảm nhận & Góp ý từ học viên
                </label>
                <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  {review.comment && review.comment.trim() !== "" ? (
                    `“${review.comment}”`
                  ) : (
                    <span className="not-italic text-slate-400">Học viên không để lại lời nhắn thêm.</span>
                  )}
                </div>
              </div>

              {/* Tags / Highlights */}
              {review.tags && review.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Tiêu chí được học viên đánh giá cao
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-2.5 shrink-0">
          {onNavigateToAllReviews ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToAllReviews();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
            >
              <span>Xem tất cả đánh giá</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

