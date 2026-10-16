import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberSupportTicketItem } from "../types";
import { getSavedMemberData, saveMemberData } from "../services/memberData";
import {
  Bot,
  HelpCircle,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  X,
  MessageSquare,
  Shield,
  User,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function MemberSupport({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const userName = user?.fullName || user?.name || "Hội viên";
  const storageKey = userId ? `member_support_tickets_${userId}` : "member_support_tickets";

  const [activeTab, setActiveTab] = useState<"ai" | "tickets">("ai");

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Xin chào ${userName}! Tôi là Trợ lý AI của SportCenter. Tôi có thể hỗ trợ bạn tra cứu lịch tập, kiểm tra thông tin hoặc giải đáp các thắc mắc về kỹ thuật bài tập và dinh dưỡng thể thao. Bạn cần tôi hỗ trợ gì hôm nay?`,
      time: "08:00",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");

  // Support Tickets State
  const [tickets, setTickets] = useState<MemberSupportTicketItem[]>(() =>
    getSavedMemberData(storageKey, [])
  );
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<any>("Tư vấn dịch vụ");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketContent, setTicketContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick questions
  const quickQuestions = [
    "Lịch tập của tôi xem ở đâu?",
    "Làm sao để đăng ký gói tập mới?",
    "Gợi ý thực đơn giàu đạm cho ngày tập nặng",
    "Cách giảm đau cơ sau buổi tập chân (Leg day)",
  ];

  const handleSendQuestion = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { sender: "user", text: q, time: now };

    let aiReply = "Tôi đã ghi nhận câu hỏi của bạn. ";
    const lower = q.toLowerCase();

    if (lower.includes("lịch") || lower.includes("buổi") || lower.includes("hôm nay") || lower.includes("ngày mai")) {
      aiReply = "📅 Bạn có thể theo dõi và quản lý toàn bộ các ca học nhóm cũng như ca kèm 1-1 tại mục **Lịch tập cá nhân** trên thanh điều hướng. Tại đó bạn cũng có thể đổi ca hoặc hủy lịch trước giờ tập.";
    } else if (lower.includes("gói") || lower.includes("hạn") || lower.includes("đăng ký") || lower.includes("mua")) {
      aiReply = "💳 Để xem các gói thẻ thành viên Gym, Bơi, Yoga, Boxing đang mở đăng ký kèm ưu đãi hiện hành, bạn có thể ghé mục **Gói tập & Dịch vụ** trên menu để lựa chọn gói phù hợp nhé.";
    } else if (lower.includes("thực đơn") || lower.includes("ăn") || lower.includes("đạm") || lower.includes("dinh dưỡng")) {
      aiReply = "🥗 Gợi ý thực đơn phục hồi giàu Protein:\n• Bữa sáng: 2 quả trứng ốp la, 1 lát bánh mì đen, 1 cốc sữa chua Hy Lạp.\n• Bữa trưa: 150g ức gà áp chảo, cơm gạo lứt, bông cải xanh luộc.\n• Trước tập 1h: 1 quả chuối + 1 muỗng Whey Protein.\n• Bữa tối: 150g cá hồi hoặc thịt bò áp chảo, salad dầu oliu.";
    } else if (lower.includes("đau cơ") || lower.includes("mỏi") || lower.includes("chân") || lower.includes("giãn")) {
      aiReply = "💪 Để giảm hiện tượng đau mỏi cơ (DOMS) sau ngày tập:\n1. Dành 10-15 phút lăn bọt (Foam Roller) đùi trước và bắp chuối.\n2. Tắm nước ấm và ngâm chân để tăng tuần hoàn máu.\n3. Uống đủ 2-2.5 lít nước và bổ sung thêm Magie/BCAA nếu cần.\n4. Đi bộ nhẹ nhàng 15-20 phút thay vì nằm yên cả ngày.";
    } else {
      aiReply = `Dạ với câu hỏi "${q}", bạn có thể trao đổi trực tiếp với Huấn luyện viên hoặc gửi phiếu yêu cầu hỗ trợ (Ticket) tại tab bên cạnh để bộ phận Lễ tân & CSKH hỗ trợ bạn nhanh nhất!`;
    }

    const aiMsg: ChatMessage = { sender: "ai", text: aiReply, time: now };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuestion("");
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketContent.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung yêu cầu.");
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

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveMemberData(storageKey, updated);

    setIsTicketModalOpen(false);
    setTicketSubject("");
    setTicketContent("");
    setFeedback("Đã gửi yêu cầu hỗ trợ thành công! Nhân viên CSKH sẽ phản hồi trong 2-4 giờ làm việc.");
    setTimeout(() => setFeedback(null), 4000);
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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Trợ giúp & Hỗ trợ</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trợ lý AI thể thao 24/7 và hệ thống tiếp nhận yêu cầu CSKH từ hội viên
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-white dark:bg-slate-700 text-orange-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Trợ lý AI 24/7</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tickets"
                ? "bg-white dark:bg-slate-700 text-orange-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Phiếu hỗ trợ ({tickets.length})</span>
          </button>
        </div>
      </div>

      {/* 1. AI ASSISTANT VIEW */}
      {activeTab === "ai" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[560px]">
          {/* Quick Questions Header */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-slate-400 shrink-0 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi ý câu hỏi:
            </span>
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendQuestion(q)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:text-orange-600 shrink-0 transition-colors cursor-pointer text-[11px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => {
              const isAi = m.sender === "ai";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    isAi ? "self-start" : "self-end ml-auto flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isAi
                        ? "bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                        isAi
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                          : "bg-orange-600 text-white rounded-tr-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuestion(inputQuestion);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Đặt câu hỏi về dinh dưỡng, bài tập, lịch rèn luyện..."
                className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TICKETS VIEW */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Danh sách phiếu hỗ trợ của bạn
            </h3>
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Gửi yêu cầu mới</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa có yêu cầu hỗ trợ nào
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Nếu bạn cần hỗ trợ về hợp đồng, chuyển nhượng gói, đổi huấn luyện viên hoặc báo cáo sự cố cơ sở vật chất, hãy bấm "Gửi yêu cầu mới".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2"
                >
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
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Đã phản hồi
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Đang xử lý
                        </>
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
        </div>
      )}

      {/* CREATE TICKET MODAL (PORTAL) */}
      {isTicketModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gửi yêu cầu hỗ trợ đến Ban Quản lý
                </h3>
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Danh mục vấn đề:
                  </label>
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
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tiêu đề yêu cầu:
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
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
                    onChange={(e) => setTicketContent(e.target.value)}
                    placeholder="Mô tả cụ thể thông tin để nhân viên CSKH hỗ trợ bạn thuận tiện nhất..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
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
}
