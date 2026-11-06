import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface SupportTicketModalProps {
  isOpen: boolean;
  category: string;
  subject: string;
  content: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onCategoryChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export function SupportTicketModal({
  isOpen,
  category,
  subject,
  content,
  onClose,
  onSubmit,
  onCategoryChange,
  onSubjectChange,
  onContentChange,
}: SupportTicketModalProps) {
  const ticketCategory = category;
  const ticketSubject = subject;
  const ticketContent = content;
  return (
    <>
      {/* CREATE TICKET MODAL (PORTAL) */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gửi yêu cầu hỗ trợ đến Ban Quản lý
                </h3>
                <button
                  onClick={() => onClose()}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Danh mục vấn đề:
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Tư vấn dịch vụ">Tư vấn dịch vụ & Gia hạn gói</option>
                    <option value="Lịch tập & HLV">Thắc mắc Lịch tập & Đổi Huấn luyện viên</option>
                    <option value="Thanh toán & Hóa đơn">Thanh toán, Hóa đơn & Đối soát</option>
                    <option value="Cơ sở vật chất">Góp ý Cơ sở vật chất & Thiết bị</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tiêu đề yêu cầu:
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                    placeholder="VD: Nhờ hỗ trợ dời hạn gói tập do đi công tác"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nội dung chi tiết:
                  </label>
                  <textarea
                    rows={4}
                    value={ticketContent}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Mô tả cụ thể thông tin để nhân viên CSKH hỗ trợ bạn thuận tiện nhất..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
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
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-xs shadow-emerald-600/20"
                  >
                    Gửi yêu cầu
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

