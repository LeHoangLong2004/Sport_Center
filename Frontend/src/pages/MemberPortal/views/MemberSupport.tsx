import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberSupportTicketItem } from "../types";
import {
  DEFAULT_SUPPORT_TICKETS,
  getSavedMemberData,
  saveMemberData,
} from "../services/memberData";
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
  const [activeTab, setActiveTab] = useState<"ai" | "tickets">("ai");

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Xin chào Nguyễn Lan Anh! Tôi là Trợ lý AI của SportCenter. Tôi có thể hỗ trợ bạn tra cứu lịch tập, kiểm tra hạn gói, hoặc giải đáp các thắc mắc về kỹ thuật bài tập và dinh dưỡng thể thao. Bạn cần tôi hỗ trợ gì hôm nay?",
      time: "08:00",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");

  // Support Tickets State
  const [tickets, setTickets] = useState<MemberSupportTicketItem[]>(() =>
    getSavedMemberData("member_support_tickets", DEFAULT_SUPPORT_TICKETS)
  );
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<any>("Tư vấn dịch vụ");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketContent, setTicketContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick questions
  const quickQuestions = [
    "Lịch tập tiếp theo của tôi là khi nào?",
    "Gói tập của tôi còn hạn bao lâu?",
    "Gợi ý thực đơn giàu đạm cho ngày tập nặng",
    "Cách giảm đau cơ sau buổi tập chân (Leg day)",
  ];

  const handleSendQuestion = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { sender: "user", text: q, time: now };

    // Intelligent Mock Response
    let aiReply = "Tôi đã ghi nhận câu hỏi của bạn. ";
    const lower = q.toLowerCase();

    if (lower.includes("lịch") || lower.includes("buổi") || lower.includes("hôm nay") || lower.includes("ngày mai")) {
      aiReply = "📅 Bạn có ca tập gần nhất là lớp **Yoga Cân Bằng Cột Sống** vào ngày 13/10 lúc 07:00 tại Studio 2 với HLV Minh Tuấn. Tiếp theo là ca **Kèm 1-1 với HLV Enam** vào 08:30 ngày 14/10.";
    } else if (lower.includes("gói") || lower.includes("hạn") || lower.includes("ngày")) {
      aiReply = "💳 Bạn đang có 2 gói còn hiệu lực:\n1. **Gói Yoga Chuyên Sâu 3 Tháng** (Hạn đến 30/11/2026, còn 49 ngày).\n2. **Gói Gym & Thể Lực 1 Tháng** (Hạn đến 31/10/2026, còn 19 ngày).";
    } else if (lower.includes("thực đơn") || lower.includes("ăn") || lower.includes("đạm") || lower.includes("dinh dưỡng")) {
      aiReply = "🥗 Gợi ý thực đơn phục hồi giàu Protein:\n• Bữa sáng: 2 quả trứng ốp la, 1 lát bánh mì đen, 1 cốc sữa chua Hy Lạp.\n• Bữa trưa: 150g ức gà áp chảo, cơm gạo lứt, bông cải xanh luộc.\n• Trước tập 1h: 1 quả chuối + 1 muỗng Whey Protein.\n• Bữa tối: 150g cá hồi hoặc thịt bò áp chảo, salad dầu oliu.";
    } else if (lower.includes("đau cơ") || lower.includes("mỏi") || lower.includes("chân") || lower.includes("giãn")) {
      aiReply = "💪 Để giảm hiện tượng đau mỏi cơ (DOMS) sau ngày tập chân:\n1. Dành 10-15 phút lăn bọt (Foam Roller) đùi trước và bắp chuối.\n2. Tắm nước ấm và ngâm chân để tăng tuần hoàn máu.\n3. Uống đủ 2-2.5 lít nước và bổ sung thêm Magie/BCAA nếu cần.\n4. Đi bộ nhẹ nhàng 15-20 phút thay vì nằm yên cả ngày.";
    } else {
      aiReply = `Dạ với yêu cầu "${q}", hệ thống SportCenter khuyên bạn nên kết hợp tập luyện đều đặn 3-4 buổi/tuần và có thể gửi ticket hỗ trợ hoặc trao đổi trực tiếp với HLV để có lộ trình chính xác nhất!`;
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
      status: "open",
      createdAt: nowStr,
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveMemberData("member_support_tickets", updated);
    setIsTicketModalOpen(false);
    setTicketSubject("");
    setTicketContent("");
    setFeedback(`Yêu cầu #${newTicket.id} đã được gửi đến ban quản lý và lễ tân!`);
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
          <button onClick={() => setFeedback(null)} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Trợ lý AI & Hỗ trợ trung tâm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hỏi đáp thông minh 24/7 hoặc gửi phiếu yêu cầu hỗ trợ trực tiếp đến nhân viên
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ai"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Trợ lý AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "tickets"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Yêu cầu hỗ trợ ({tickets.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI ASSISTANT CHAT */}
      {activeTab === "ai" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[580px] overflow-hidden">
          {/* Top Quick Suggestions */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center gap-2 overflow-x-auto text-xs hidden-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Gợi ý:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuestion(q)}
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs shrink-0 transition-colors shadow-2xs font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-gradient-to-tr from-slate-900 to-slate-800 text-emerald-400 border border-slate-700 shadow-xs"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                        : "bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span
                    className={`block text-[10px] text-slate-400 mt-1 ${
                      m.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion(inputQuestion);
            }}
            className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Nhập câu hỏi cho trợ lý AI (VD: Lịch tập ngày mai, bài tập giảm mỡ...)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Danh sách các yêu cầu hỗ trợ bạn đã gửi đến trung tâm
            </span>
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gửi yêu cầu mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {t.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.subject}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold self-start sm:self-center ${
                      t.status === "resolved"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {t.status === "resolved" ? "Đã phản hồi giải quyết" : "Đang chờ xử lý"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.content}
                </p>

                {t.reply && (
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                      <span>Phản hồi từ trung tâm ({t.repliedBy || "Lễ tân"}):</span>
                      <span className="text-[10px] font-normal text-slate-400">{t.repliedAt}</span>
                    </div>
                    <p className="leading-relaxed">{t.reply}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 pt-1">
                  Mã yêu cầu: <span className="font-mono text-slate-600 dark:text-slate-300">{t.id}</span> • Ngày gửi: {t.createdAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TẠO TICKET MỚI (PORTAL) */}
      {isTicketModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gửi yêu cầu hỗ trợ mới
                </h3>
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Phân loại yêu cầu:
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e: any) => setTicketCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Tư vấn dịch vụ">Tư vấn dịch vụ & Gói tập</option>
                    <option value="Đổi lịch">Xin đổi lịch / Bảo lưu buổi tập</option>
                    <option value="Cơ sở vật chất">Phản ánh cơ sở vật chất (phòng tập, máy móc)</option>
                    <option value="Hoàn tiền">Khiếu nại & Hoàn tiền</option>
                    <option value="Khác">Ý kiến đóng góp khác</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tiêu đề: *
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="VD: Xin phép đổi lịch tập lớp Yoga sang tối Thứ 5"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nội dung chi tiết: *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={ticketContent}
                    onChange={(e) => setTicketContent(e.target.value)}
                    placeholder="Mô tả cụ thể vấn đề hoặc mong muốn của bạn để bộ phận hỗ trợ xử lý nhanh nhất..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 rounded-lg shadow-sm"
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
