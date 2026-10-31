import React from "react";
import {
  MessageSquare,
  Users,
  User,
  CheckCircle2,
  Dumbbell,
  Calendar,
  Headphones,
  Shield,
  CheckCheck,
  Sparkles,
  Send
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { ChatConversation } from "./chatTypes";
import type { MemberScreen } from "../../types";

interface ChatActiveAreaProps {
  activeConv?: ChatConversation;
  inputText: string;
  onInputTextChange: (text: string) => void;
  isSending: boolean;
  quickPrompts: string[];
  onSendMessage: (e?: React.FormEvent, customText?: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onNavigate?: (screen: MemberScreen) => void;
}

export const ChatActiveArea: React.FC<ChatActiveAreaProps> = ({
  activeConv,
  inputText,
  onInputTextChange,
  isSending,
  quickPrompts,
  onSendMessage,
  messagesEndRef,
  onNavigate
}) => {
  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/30 dark:bg-slate-900/50">
        <MessageSquare className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
        <p className="text-sm font-semibold">Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const cat = activeConv.category || (activeConv.type === "class" ? "class" : "coach");

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-slate-900/50">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {activeConv.avatar || cat === "coach" ? (
              <CoachAvatar
                src={activeConv.avatar}
                name={activeConv.title}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800">
                {activeConv.type === "class" ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
            )}
            {activeConv.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                {activeConv.title}
              </h3>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  cat === "coach"
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                    : cat === "manager"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    : cat === "member"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                }`}
              >
                {activeConv.roleTag || "LIÊN HỆ"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {activeConv.subtitle} · {activeConv.online ? "Đang trực tuyến" : "Ngoại tuyến"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cat === "coach" && (
            <>
              <button
                onClick={() => onNavigate?.("workouts")}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                Giáo án
              </button>
              <button
                onClick={() => onNavigate?.("schedule")}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Lịch tập
              </button>
            </>
          )}
          {cat === "manager" && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
              <Headphones className="w-3 h-3" />
              Hotline: 1900 6868
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
            {activeConv.type === "class" ? "Nhóm lớp" : "Trò chuyện 1-1"}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <div className="flex justify-center my-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <Shield className="w-3 h-3 text-emerald-500" />
            Tin nhắn được mã hóa và lưu trữ an toàn trên hệ thống SmartGym
          </span>
        </div>

        {activeConv.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Chưa có tin nhắn nào
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với {activeConv.title}.
            </p>
          </div>
        ) : (
          activeConv.messages.map((m) => {
            const isMe = m.sender === "member";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%] ${
                  isMe ? "ml-auto" : "mr-auto"
                }`}
              >
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {m.senderName || activeConv.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        m.sender === "coach"
                          ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                          : m.sender === "manager"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {m.sender === "coach" ? "HLV" : (m.sender === "manager" ? "BQL" : "HỘI VIÊN")}
                    </span>
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>

                <div
                  className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Gợi ý:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(undefined, q)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Field */}
      <form
        onSubmit={onSendMessage}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder={`Nhắn tin cho ${activeConv.title}...`}
          value={inputText}
          onChange={(e) => onInputTextChange(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-2xs shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
