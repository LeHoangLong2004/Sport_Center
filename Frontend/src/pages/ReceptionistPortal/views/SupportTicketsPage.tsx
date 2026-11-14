import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Send,
  X,
  User,
  Phone,
  Tag,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { mergeStoredTicketReplies } from "../../MemberPortal/services/memberData";

export interface SupportTicket {
  id: string;
  userId?: string;
  memberName?: string;
  memberPhone?: string;
  category: string;
  subject: string;
  content: string;
  status: "open" | "resolved";
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "TCK-971",
    memberName: "Lê Quang Vinh",
    memberPhone: "0987654321",
    category: "Tư vấn dịch vụ & Gia hạn gói",
    subject: "Xin bảo lưu gói tập 2 tuần do đi công tác",
    content: "Chào ban quản lý, tuần tới tôi có chuyến công tác từ ngày 15/11 đến 30/11 nên không thể đến phòng tập. Nhờ trung tâm hỗ trợ tạm dừng/bảo lưu thời hạn thẻ tập của tôi trong thời gian này giúp tôi với ạ. Xin cảm ơn!",
    status: "open",
    createdAt: "2026-11-13 14:43:55",
  },
  {
    id: "TCK-482",
    memberName: "Trần Mai Anh",
    memberPhone: "0912345678",
    category: "Thắc mắc Lịch tập & Đổi Huấn luyện viên",
    subject: "Đổi giờ tập PT ca tối sang ca sáng",
    content: "Tôi muốn đổi giờ tập PT với HLV Tuấn từ 19:00 sang 07:00 sáng thứ 3 và thứ 5 hàng tuần do có lịch làm việc mới.",
    status: "resolved",
    createdAt: "2026-11-12 09:15:20",
    reply: "Lễ tân đã liên hệ với HLV Tuấn và xác nhận đổi lịch tập sang 07:00 sáng Thứ 3 & Thứ 5 cho chị bắt đầu từ tuần này nhé!",
    repliedAt: "2026-11-12 10:30:00",
    repliedBy: "Nguyễn Văn Lễ Tân"
  }
];

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    let rawList: SupportTicket[] = [];

    // 1. Thử lấy từ Backend Lễ tân
    try {
      const res = await fetch("/api/receptionist/support-tickets");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tickets) && data.tickets.length > 0) {
          rawList = data.tickets;
        }
      }
    } catch {}

    // 2. Thử lấy từ Backend Hội viên
    if (rawList.length === 0) {
      try {
        const memRes = await fetch("/api/member/support-tickets");
        if (memRes.ok) {
          const memData = await memRes.json();
          if (Array.isArray(memData) && memData.length > 0) {
            rawList = memData;
          }
        }
      } catch {}
    }

    // 3. Đọc từ shared localStorage
    if (rawList.length === 0) {
      try {
        const local = localStorage.getItem("smartgym_support_tickets");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) rawList = parsed;
        }
      } catch {}
    }

    // 4. Nếu chưa có gì thì dùng DEFAULT_TICKETS
    if (rawList.length === 0) {
      rawList = DEFAULT_TICKETS;
    }

    // Luôn luôn hợp nhất các phản hồi đã lưu (đảm bảo không bao giờ bị mất khi refresh)
    const merged = mergeStoredTicketReplies(rawList);
    setTickets(merged);
    try {
      localStorage.setItem("smartgym_support_tickets", JSON.stringify(merged));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        (t.memberName || "").toLowerCase().includes(q) ||
        (t.memberPhone || "").toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && t.status === "open") ||
        (statusFilter === "resolved" && t.status === "resolved");

      const matchCat =
        categoryFilter === "all" || t.category === categoryFilter;

      return matchSearch && matchStatus && matchCat;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  const openCount = tickets.filter((t) => t.status === "open").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  // Open modal
  const handleOpenReply = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.reply || "");
  };

  // Quick replies
  const setQuickReply = (text: string) => {
    setReplyText(text);
  };

  // Submit reply
  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    setSubmitting(true);
    const nowStr = new Date().toLocaleString("vi-VN");

    try {
      const res = await fetch(`/api/receptionist/support-tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: replyText.trim(),
          repliedBy: "Nguyễn Văn Lễ Tân",
        }),
      });

      if (res.ok) {
        toast.success(`Đã phản hồi và giải quyết phiếu ${selectedTicket.id}!`);
      } else {
        toast.success(`Đã cập nhật trạng thái đã xử lý cho phiếu ${selectedTicket.id}!`);
      }
    } catch {
      toast.success(`Đã cập nhật trạng thái phiếu ${selectedTicket.id}!`);
    }

    // Update state locally and in shared localStorage
    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            status: "resolved" as const,
            reply: replyText.trim(),
            repliedAt: nowStr,
            repliedBy: "Nguyễn Văn Lễ Tân",
          }
        : t
    );

    setTickets(updatedTickets);

    try {
      const raw = localStorage.getItem("smartgym_ticket_replies");
      const currentReplies = raw ? JSON.parse(raw) : {};
      currentReplies[selectedTicket.id] = {
        status: "resolved",
        reply: replyText.trim(),
        repliedAt: nowStr,
        repliedBy: "Nguyễn Văn Lễ Tân",
      };
      localStorage.setItem("smartgym_ticket_replies", JSON.stringify(currentReplies));
      localStorage.setItem("smartgym_support_tickets", JSON.stringify(updatedTickets));
      window.dispatchEvent(new Event("support-tickets-updated"));
      window.dispatchEvent(new StorageEvent("storage", { key: "smartgym_support_tickets" }));
    } catch {}

    setSubmitting(false);
    setSelectedTicket(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng yêu cầu tiếp nhận</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{tickets.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang chờ xử lý</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{openCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đã giải quyết xong</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{resolvedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã phiếu, tên hội viên, số điện thoại, tiêu đề..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Trạng thái:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer font-medium"
          >
            <option value="all">Tất cả ({tickets.length})</option>
            <option value="open">Đang chờ xử lý ({openCount})</option>
            <option value="resolved">Đã giải quyết ({resolvedCount})</option>
          </select>

          <button
            onClick={fetchTickets}
            title="Tải lại danh sách"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có yêu cầu hỗ trợ nào phù hợp</h4>
            <p className="text-xs text-slate-500 mt-1">Các phiếu yêu cầu mới từ hội viên sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md ${
                t.status === "open"
                  ? "border-amber-200/80 dark:border-amber-900/40"
                  : "border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {t.id}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {t.category}
                  </span>
                  <span className="text-xs text-slate-400">• {t.createdAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      t.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {t.status === "resolved" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã giải quyết
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        Chờ Lễ tân xử lý
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleOpenReply(t)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      t.status === "open"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-600/20"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t.status === "open" ? "Tiếp nhận & Phản hồi" : "Cập nhật phản hồi"}
                  </button>
                </div>
              </div>

              {/* Member info */}
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mb-2 py-1.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.memberName || "Hội viên"}</span>
                </div>
                {t.memberPhone && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.memberPhone}</span>
                  </div>
                )}
              </div>

              {/* Title & Content */}
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">
                {t.subject}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {t.content}
              </p>

              {/* Existing Reply */}
              {t.reply && (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Phản hồi bởi: {t.repliedBy || "Lễ tân"}
                    </span>
                    {t.repliedAt && <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400">{t.repliedAt}</span>}
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed pt-0.5">{t.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Tiếp nhận & Xử lý phiếu {selectedTicket.id}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hội viên: <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.memberName}</strong> ({selectedTicket.memberPhone})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Ticket detail snippet */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{selectedTicket.subject}</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{selectedTicket.content}</p>
              </div>

              {/* Quick reply templates */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 block">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Gợi ý phản hồi nhanh:
                </label>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQuickReply("Lễ tân đã tiếp nhận yêu cầu và tạm ngưng/bảo lưu gói tập của bạn theo thời gian quy định.")
                    }
                    className="text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                  >
                    👉 <em>"Lễ tân đã tiếp nhận yêu cầu và tạm ngưng/bảo lưu gói tập của bạn..."</em>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickReply("Lễ tân đã liên hệ HLV và xác nhận chuyển đổi lịch tập ca mới cho bạn thành công.")
                    }
                    className="text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                  >
                    👉 <em>"Lễ tân đã liên hệ HLV và xác nhận chuyển đổi lịch tập ca mới..."</em>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickReply("Bộ phận kỹ thuật & quản lý cơ sở vật chất đã ghi nhận và đang tiến hành xử lý ngay trong ngày.")
                    }
                    className="text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                  >
                    👉 <em>"Bộ phận kỹ thuật & quản lý đã ghi nhận và đang xử lý..."</em>
                  </button>
                </div>
              </div>

              {/* Textarea reply */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Nội dung phản hồi cho hội viên: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung trả lời / giải quyết để hội viên xem được trên trang cá nhân..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={submitting || !replyText.trim()}
                  onClick={handleSendReply}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold cursor-pointer transition-colors shadow-xs shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "Đang gửi..." : "Xác nhận & Giải quyết phiếu"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

