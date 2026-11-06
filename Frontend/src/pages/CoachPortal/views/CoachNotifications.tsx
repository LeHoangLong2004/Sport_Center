/**
 * CO-08 — Trung tâm Thông báo Huấn luyện viên
 * Giao diện xem thông báo từ Hệ thống, Quản lý phê duyệt lớp & Đánh giá từ học viên.
 */
import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  CalendarCheck,
  Star,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  X,
  ChevronRight,
  Eye,
} from "lucide-react";
import { CoachAPI } from "../services/api";
import type { MockNotification } from "../services/api";
import CoachReviewDetailModal from "../components/CoachReviewDetailModal";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  fetchCoachReviews,
  fetchReviewById,
  type SyncedCoachReview,
} from "../../../services/sync/reviewSync";

type FilterTab = "all" | "unread" | "reviews" | "approvals" | "system";

export default function CoachNotifications() {
  const { profile } = useUserProfile();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Review detail modal state
  const [selectedReview, setSelectedReview] = useState<Partial<SyncedCoachReview> | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const notifs = await CoachAPI.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await CoachAPI.markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await CoachAPI.markAllNotificationsAsRead();
    setFeedback("Đã đánh dấu tất cả thông báo là đã đọc.");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenReviewModal = async (n: MockNotification) => {
    setReviewModalOpen(true);
    setReviewLoading(true);

    try {
      // 1. If notification has targetId (UUID), try fetchReviewById
      if (
        n.targetId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(n.targetId)
      ) {
        const rev = await fetchReviewById(n.targetId);
        if (rev) {
          setSelectedReview(rev);
          return;
        }
      }

      // 2. Fetch all reviews for this coach
      const coachId = profile?.id;
      let coachReviews: SyncedCoachReview[] = [];
      if (coachId) {
        coachReviews = await fetchCoachReviews(coachId);
      }

      // 2a. Match by targetId if review list contains it
      let match = coachReviews.find((r) => r.id === n.targetId);

      // 2b. Match by sessionName in notification content or title
      if (!match) {
        match = coachReviews.find(
          (r) =>
            r.sessionName &&
            (n.content.toLowerCase().includes(r.sessionName.toLowerCase()) ||
              n.title.toLowerCase().includes(r.sessionName.toLowerCase()))
        );
      }

      // 2c. Match by date
      if (!match && coachReviews.length > 0) {
        const notifDate = n.sentAt ? n.sentAt.split("T")[0] : "";
        match = coachReviews.find((r) => r.createdAt && r.createdAt.split("T")[0] === notifDate);
        if (!match) match = coachReviews[0];
      }

      if (match) {
        setSelectedReview(match);
      } else {
        // Fallback representation directly from the notification
        setSelectedReview({
          id: n.id,
          coachId: coachId || "",
          coachName: profile?.fullName || "Huấn luyện viên",
          memberId: "",
          memberName: "Học viên ẩn danh",
          anonymizedMemberName: "Học viên ẩn danh",
          rating: 5,
          comment: n.content,
          tags: ["Giảng dạy dễ hiểu", "Động viên tích cực"],
          createdAt: n.sentAt,
          sessionName: n.title.includes("đánh giá") ? "Buổi tập chuyên đề" : n.title,
        });
      }
    } catch (e) {
      console.error("Lỗi khi mở chi tiết đánh giá:", e);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleNotificationClick = async (n: MockNotification) => {
    if (!n.isRead) {
      void handleMarkAsRead(n.id);
    }

    const category = getNotificationCategory(n);
    if (category === "reviews") {
      await handleOpenReviewModal(n);
    }
  };

  // Helper to categorize notifications
  const getNotificationCategory = (n: MockNotification): "reviews" | "approvals" | "system" => {
    const text = `${n.title} ${n.content} ${n.notificationType || ""}`.toLowerCase();
    if (text.includes("đánh giá") || text.includes("review") || text.includes("5/5") || text.includes("sao")) {
      return "reviews";
    }
    if (
      text.includes("duyệt") ||
      text.includes("đề xuất") ||
      text.includes("lớp học") ||
      text.includes("ca dạy") ||
      text.includes("lịch dạy")
    ) {
      return "approvals";
    }
    return "system";
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.targetName && n.targetName.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Tab filter
      if (activeTab === "unread") return !n.isRead;
      if (activeTab === "reviews") return getNotificationCategory(n) === "reviews";
      if (activeTab === "approvals") return getNotificationCategory(n) === "approvals";
      if (activeTab === "system") return getNotificationCategory(n) === "system";

      return true;
    });
  }, [notifications, searchQuery, activeTab]);

  // Counts for tabs
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const reviewCount = useMemo(
    () => notifications.filter((n) => getNotificationCategory(n) === "reviews").length,
    [notifications]
  );
  const approvalCount = useMemo(
    () => notifications.filter((n) => getNotificationCategory(n) === "approvals").length,
    [notifications]
  );
  const systemCount = useMemo(
    () => notifications.filter((n) => getNotificationCategory(n) === "system").length,
    [notifications]
  );

  const formatTimestamp = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      if (Number.isNaN(d.getTime())) return isoDate;

      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      if (isToday) {
        return `Hôm nay, ${hours}:${minutes}`;
      }
      return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
    } catch {
      return isoDate;
    }
  };

  const renderBadge = (n: MockNotification) => {
    const category = getNotificationCategory(n);
    if (category === "reviews") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
          Đánh giá HLV
        </span>
      );
    }
    if (category === "approvals") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
          <CalendarCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Phê duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
        <Info className="w-3 h-3 text-sky-600 dark:text-sky-400" />
        Hệ thống
      </span>
    );
  };

  const renderIcon = (n: MockNotification) => {
    const category = getNotificationCategory(n);
    if (category === "reviews") {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs border border-amber-200/60 dark:border-amber-800/60">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
        </div>
      );
    }
    if (category === "approvals") {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60">
          <CalendarCheck className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs border border-teal-200/60 dark:border-teal-800/60">
        <Bell className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Thông báo
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-xs">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Xem cập nhật phê duyệt lớp học, phản hồi đánh giá từ hội viên và tin tức trung tâm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            type="button"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
            title="Làm mới thông báo"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-teal-600" />
              <span>Đọc tất cả</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Search & Category Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung thông báo..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Tất cả ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Đánh giá HLV ({reviewCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "approvals"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Duyệt lớp & Lịch ({approvalCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "system"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Hệ thống ({systemCount})
          </button>
        </div>
      </div>

      {/* 3. Notification List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600" />
            <p>Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <BellOff className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Không tìm thấy thông báo nào
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."
                  : "Bạn đã cập nhật mọi thông tin mới nhất!"}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.isRead;
            const category = getNotificationCategory(n);
            const isReviewNotification = category === "reviews";

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`relative group bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
                  isUnread
                    ? "border-teal-300 dark:border-teal-800 bg-teal-50/20 dark:bg-teal-950/10 shadow-xs hover:border-teal-400"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                } ${isReviewNotification ? "hover:border-amber-300 dark:hover:border-amber-700" : ""}`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Left Category Icon */}
                  {renderIcon(n)}

                  {/* Center Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {renderBadge(n)}
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" title="Chưa đọc" />
                      )}
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(n.sentAt)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {n.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {n.content}
                    </p>

                    {n.deadline && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <Calendar className="w-3 h-3" />
                        <span>Hạn thực hiện: {n.deadline}</span>
                      </div>
                    )}

                    {/* Dedicated CTA for Review Notifications */}
                    {isReviewNotification && (
                      <div className="mt-3 pt-3 border-t border-amber-100/70 dark:border-amber-900/40 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Bấm để xem chi tiết nhận xét & tiêu chí đánh giá
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Mark as read button */}
                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleMarkAsRead(n.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors shrink-0 cursor-pointer"
                      title="Đánh dấu đã đọc"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Detail Modal */}
      <CoachReviewDetailModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        review={selectedReview}
        loading={reviewLoading}
        onNavigateToAllReviews={() => {
          window.location.hash = "#coach-reviews";
        }}
      />
    </div>
  );
}
