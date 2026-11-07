import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Minimize2,
  Sparkles,
} from "lucide-react";
import type { MemberScreen } from "../types";
import { MemberBackendAPI, type MemberAiAction } from "../services/memberData";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
  action?: MemberAiAction;
  actionLabel?: string | null;
  source?: "ai" | "fallback" | "throttled" | "offline";
}

interface Props {
  onNavigate: (screen: MemberScreen) => void;
  userName?: string;
  userId?: string;
}

const ACTION_TO_SCREEN: Partial<Record<MemberAiAction, MemberScreen>> = {
  schedule: "schedule",
  booking: "booking",
  packages: "packages",
  packages_sport: "packages",
  packages_membership: "packages",
  payments: "payments",
  workouts: "workouts",
  attendance: "attendance",
  chat: "chat",
};

const nowLabel = () =>
  new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export default function FloatingAiWidget({ onNavigate, userName = "Hội viên", userId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const storageKey = userId ? `member_floating_ai_chat_${userId}` : "member_floating_ai_chat";

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        sender: "ai",
        text: `Chào ${userName}! 👋 Tôi là Trợ lý AI SportCenter. Tôi có thể giải đáp lịch tập, gói tập, nhận xét của HLV hoặc kỹ thuật bài tập cho bạn. Bạn cần hỗ trợ gì?`,
        time: nowLabel(),
        source: "ai",
      },
    ];
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages, storageKey]);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  // Voice Speech-to-Text Initialization (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.lang = "vi-VN";
      recognizer.continuous = false;
      recognizer.interimResults = false;

      recognizer.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInputQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech. Bạn có thể sử dụng Google Chrome hoặc Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isThinking) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const history = messages
      .slice(1)
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
          text: "⚠️ Hiện tại hệ thống đang bận. Bạn vui lòng thử lại sau ít phút nhé.",
          time: nowLabel(),
          source: "offline",
        };

    setMessages((prev) => [...prev, aiMsg]);
    setIsThinking(false);
  };

  const handleAction = (action?: MemberAiAction) => {
    if (!action || action === "none") return;
    if (action === "packages_sport") {
      onNavigate("packages");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("switch-packages-tab", { detail: "sport" }));
      }, 50);
      setIsOpen(false);
      return;
    }
    if (action === "packages_membership") {
      onNavigate("packages");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("switch-packages-tab", { detail: "membership" }));
      }, 50);
      setIsOpen(false);
      return;
    }
    const screen = ACTION_TO_SCREEN[action];
    if (screen) {
      onNavigate(screen);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        sender: "ai",
        text: `Chào ${userName}! 👋 Tôi là Trợ lý AI SportCenter. Tôi có thể giải đáp lịch tập, gói tập, nhận xét của HLV hoặc kỹ thuật bài tập cho bạn. Bạn cần hỗ trợ gì?`,
        time: nowLabel(),
        source: "ai",
      },
    ]);
    localStorage.removeItem(storageKey);
  };

  const suggestions = [
    "Hôm nay tôi có lịch gì không?",
    "HLV vừa nhận xét gì về tôi?",
    "Gói tập của tôi còn hạn bao lâu?",
    "Gợi ý bữa ăn nhẹ sau tập",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Mở Trợ lý AI SportCenter"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-emerald-600 animate-pulse" />
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            Hỏi Trợ lý AI
          </span>
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Floating Chat Overlay Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[550px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-600 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Trợ lý AI SportCenter</h4>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Hiểu lịch tập, gói & HLV của bạn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Xóa đoạn chat làm mới"
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m, idx) => {
              const isAi = m.sender === "ai";
              const showAction = isAi && m.action && m.action !== "none" && m.actionLabel;
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 max-w-[88%] ${isAi ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-xs text-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`space-y-1.5 ${isAi ? "items-start" : "items-end"}`}>
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        isAi
                          ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                          : "bg-emerald-600 text-white rounded-tr-xs shadow-xs"
                      }`}
                    >
                      {m.text}
                    </div>

                    {showAction && (
                      <button
                        type="button"
                        onClick={() => handleAction(m.action)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        {m.actionLabel}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}

                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] text-slate-400">{m.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex gap-2 max-w-[85%] self-start">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-emerald-600 text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="ml-1.5 text-[11px] text-slate-400">Trợ lý đang suy nghĩ…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions (if few messages) */}
          {messages.length <= 3 && !isThinking && (
            <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Voice Listening Bar Indicator */}
          {isListening && (
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-800 dark:text-slate-300 animate-pulse">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-slate-600" />
                Đang lắng nghe bạn nói tiếng Việt...
              </span>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[11px] font-bold text-slate-700 underline cursor-pointer"
              >
                Dừng lại
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputQuestion);
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isListening
                    ? "bg-rose-50 border-rose-300 text-rose-600 animate-bounce"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600"
                }`}
                title={isListening ? "Dừng ghi âm" : "Nói để hỏi (Voice Input)"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Hỏi về lịch, gói tập, HLV, dinh dưỡng..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <button
                type="submit"
                disabled={isThinking || !inputQuestion.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                AI tự động hiểu hồ sơ & HLV
              </span>
              <span className="text-[9px]">v2.1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

