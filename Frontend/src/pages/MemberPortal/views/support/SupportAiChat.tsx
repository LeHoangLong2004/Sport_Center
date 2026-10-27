import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, RotateCcw, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import type { MemberScreen } from "../../types";
import { MemberBackendAPI, type MemberAiAction } from "../../services/memberData";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
  action?: MemberAiAction;
  actionLabel?: string | null;
  source?: "ai" | "fallback" | "throttled" | "offline";
}

interface SupportAiChatProps {
  userName: string;
  storageKey?: string;
  onNavigate?: (screen: MemberScreen) => void;
  onOpenTickets?: () => void;
}

const ACTION_TO_SCREEN: Partial<Record<MemberAiAction, MemberScreen>> = {
  schedule: "schedule",
  booking: "booking",
  packages: "packages",
  payments: "payments",
  workouts: "workouts",
  attendance: "attendance",
  chat: "chat",
};

const nowLabel = () => new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const buildGreeting = (userName: string): ChatMessage => ({
  sender: "ai",
  text: `Xin chào ${userName}! 👋 Tôi là Trợ lý AI của SportCenter. Tôi có thể xem lịch tập, gói tập của bạn và giải đáp về kỹ thuật bài tập, dinh dưỡng hay nội quy trung tâm. Bạn cần hỗ trợ gì hôm nay?`,
  time: nowLabel(),
  source: "ai",
});

export const SupportAiChat: React.FC<SupportAiChatProps> = ({
  userName,
  storageKey = "member_ai_chat",
  onNavigate,
  onOpenTickets,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore corrupted cache */
    }
    return [buildGreeting(userName)];
  });
  const [inputQuestion, setInputQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Hiện tại tôi có giáo án nào được giao không?",
    "Hôm nay và ngày mai tôi có lịch tập gì?",
    "Gói tập của tôi còn hạn bao lâu?",
    "Gợi ý thực đơn giàu đạm cho ngày tập nặng",
    "Cách giảm đau cơ sau buổi tập chân (Leg day)",
    "Tôi muốn hủy lớp thì phải làm sao?",
  ];

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
    } catch {
      /* storage full / disabled */
    }
  }, [messages, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isThinking) return;

    const history = messages
      .slice(1) // skip greeting
      .slice(-6)
      .map((m) => ({ role: m.sender, text: m.text }));

    setMessages((prev) => [...prev, { sender: "user", text: q, time: nowLabel() }]);
    setInputQuestion("");
    setIsThinking(true);

    const result = await MemberBackendAPI.askAI(q, history);

    const aiMsg: ChatMessage = result
      ? {
          sender: "ai",
          text: result.answer,
          time: result.timestamp || nowLabel(),
          action: result.action,
          actionLabel: result.actionLabel,
          source: result.source,
        }
      : {
          sender: "ai",
          text: "⚠️ Không thể kết nối tới máy chủ lúc này. Bạn vui lòng thử lại sau ít phút hoặc gửi Phiếu hỗ trợ để Lễ tân hỗ trợ trực tiếp nhé.",
          time: nowLabel(),
          action: "support_ticket",
          actionLabel: "Gửi phiếu hỗ trợ cho Lễ tân",
          source: "offline",
        };

    setMessages((prev) => [...prev, aiMsg]);
    setIsThinking(false);
  };

  const handleAction = (action?: MemberAiAction) => {
    if (!action || action === "none") return;
    if (action === "support_ticket") {
      onOpenTickets?.();
      return;
    }
    const screen = ACTION_TO_SCREEN[action];
    if (screen) onNavigate?.(screen);
  };

  const handleReset = () => {
    setMessages([buildGreeting(userName)]);
    sessionStorage.removeItem(storageKey);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4.5 h-4.5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Trợ lý AI SportCenter</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by Gemini • Hiểu lịch tập & gói tập của bạn</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={isThinking}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          title="Bắt đầu cuộc trò chuyện mới"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Cuộc trò chuyện mới
        </button>
      </div>

      {/* Quick questions */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-400 shrink-0 text-[11px] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi ý câu hỏi:
        </span>
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isThinking}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:text-orange-600 shrink-0 transition-colors cursor-pointer text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => {
          const isAi = m.sender === "ai";
          const showAction = isAi && m.action && m.action !== "none" && m.actionLabel;
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${isAi ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
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
              <div className={`space-y-1.5 ${isAi ? "" : "flex flex-col items-end"}`}>
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    isAi
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                      : "bg-orange-600 text-white rounded-tr-xs"
                  }`}
                >
                  {m.text}
                </div>
                {showAction && (
                  <button
                    type="button"
                    onClick={() => handleAction(m.action)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[11px] font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors cursor-pointer"
                  >
                    {m.actionLabel}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] text-slate-400">{m.time}</span>
                  {isAi && idx > 0 && m.source && m.source !== "ai" && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400" title="AI tạm thời không khả dụng, đang dùng câu trả lời dự phòng">
                      • Chế độ dự phòng
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
              <span className="ml-2 text-[11px] text-slate-500">Trợ lý đang soạn câu trả lời…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuestion);
          }}
          className="flex items-center gap-2"
        >
          <input
            id="member-ai-chat-input"
            type="text"
            value={inputQuestion}
            maxLength={1000}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Hỏi về lịch tập, gói tập, dinh dưỡng, kỹ thuật bài tập..."
            className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-orange-500"
          />
          <button
            id="member-ai-chat-send"
            type="submit"
            disabled={isThinking || !inputQuestion.trim()}
            className="p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
          <ShieldCheck className="w-3 h-3" />
          Trợ lý AI chỉ đưa ra gợi ý tham khảo, không thay thế chẩn đoán y khoa. Các thao tác đặt/hủy lớp, thanh toán bạn vẫn tự thực hiện.
        </p>
      </div>
    </div>
  );
};
