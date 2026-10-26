import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { MemberSupportTicketItem } from "../../types";
import {
  CheckCircle2,
  Clock,
  Plus,
  X,
  MessageSquare,
  Shield,
} from "lucide-react";

interface SupportTicketsProps {
  tickets: MemberSupportTicketItem[];
  onCreateTicket: (ticket: MemberSupportTicketItem) => void;
}

export const SupportTickets: React.FC<SupportTicketsProps> = ({ tickets, onCreateTicket }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<any>("Tư vấn dịch vụ");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketContent, setTicketContent] = useState("");

  React.useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketContent.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung yêu cầu.");
      return;
    }
    const nowStr = new Date().toLocaleString("vi-VN");
    const newTicket: MemberSupportTicketItem = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      category: ticketCategory,
      subject: ticketSubject.trim(),
      content: ticketContent.trim(),
      createdAt: nowStr,
      status: "open",
    };
    onCreateTicket(newTicket);
    toast.success("Đã gửi yêu cầu hỗ trợ thành công!");
    setIsModalOpen(false);
    setTicketSubject("");
    setTicketContent("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Danh sách phiếu hỗ trợ của bạn
        </h3>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Gửi yêu cầu mới</span>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có yêu cầu hỗ trợ nào</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Nếu bạn cần hỗ trợ về hợp đồng, chuyển nhượng gói, đổi huấn luyện viên hoặc báo cáo sự cố cơ sở vật chất, hãy bấm "Gửi yêu cầu mới".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {t.category}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === "resolved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {t.status === "resolved" ? (
                    <><CheckCircle2 className="w-3 h-3" /> Đã phản hồi</>
                  ) : (
                    <><Clock className="w-3 h-3" /> Đang xử lý</>
                  )}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.subject}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.content}</p>
              {t.reply && (
                <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/40 text-xs text-orange-950 dark:text-orange-200 mt-2">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-orange-600" />
                    <span>Phản hồi từ Ban Quản lý SportCenter:</span>
                  </div>
                  <p>{t.reply}</p>
                </div>
              )}
              <div className="text-[10px] text-slate-400 pt-1">Ngày gửi: {t.createdAt}</div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gửi yêu cầu hỗ trợ đến Ban Quản lý
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Danh mục vấn đề:</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Tư vấn dịch vụ">Tư vấn dịch vụ & Gia hạn gói</option>
                    <option value="Lịch tập & HLV">Thắc mắc Lịch tập & Đổi Huấn luyện viên</option>
                    <option value="Thanh toán & Hóa đơn">Thanh toán, Hóa đơn & Đối soát</option>
                    <option value="Cơ sở vật chất">Góp ý Cơ sở vật chất & Thiết bị</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Tiêu đề yêu cầu:</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="VD: Nhờ hỗ trợ dời hạn gói tập do đi công tác"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Nội dung chi tiết:</label>
                  <textarea
                    rows={4}
                    value={ticketContent}
                    onChange={(e) => setTicketContent(e.target.value)}
                    placeholder="Mô tả cụ thể thông tin để nhân viên CSKH hỗ trợ bạn thuận tiện nhất..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
