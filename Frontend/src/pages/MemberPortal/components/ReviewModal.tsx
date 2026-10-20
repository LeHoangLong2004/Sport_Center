import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
interface ReviewModalProps {
  activeReviewSession: any | null;
  rating: number;
  selectedTags: string[];
  comment: string;
  isSubmitting: boolean;
  tagsList: string[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onRatingChange: (rating: number) => void;
  onToggleTag: (tag: string) => void;
  onCommentChange: (comment: string) => void;
}

export function ReviewModal({
  activeReviewSession,
  rating,
  selectedTags,
  comment,
  isSubmitting,
  tagsList,
  onClose,
  onSubmit,
  onRatingChange,
  onToggleTag,
  onCommentChange,
}: ReviewModalProps) {
  return (
    <>
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
                  onClick={() => onClose()}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Mức độ hài lòng:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
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
                    {tagsList.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
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
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Hãy chia sẻ trải nghiệm tập luyện, tinh thần hướng dẫn hoặc bài học bạn nhận được từ HLV..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onClose()}
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
    </>
  );
}

