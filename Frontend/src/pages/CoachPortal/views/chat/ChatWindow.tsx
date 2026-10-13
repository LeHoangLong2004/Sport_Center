import React from "react";
import { Users, Send } from "lucide-react";
import type { Conversation } from "./types";

interface ChatWindowProps {
  activeConv: Conversation;
  inputText: string;
  setInputText: (t: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeConv,
  inputText,
  setInputText,
  onSendMessage,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 dark:bg-slate-900/60">
      {/* Active conversation header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {activeConv.type === "class" ? (
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Users className="w-5 h-5" />
              </div>
            ) : (
              <img
                src={activeConv.avatar}
                alt={activeConv.title}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            )}
            {activeConv.online && (
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 absolute bottom-0 right-0"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              {activeConv.title}
            </h3>
            <span className="text-xs text-slate-400">
              {activeConv.subtitle} • {activeConv.online ? "Đang trực tuyến" : "Ngoại tuyến"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            {activeConv.type === "class" ? "Hội thoại lớp" : "Kèm 1–1"}
          </span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {activeConv.messages.map((m) => {
          const isMe = m.sender === "coach";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                  isMe
                    ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input message form */}
      <form
        onSubmit={onSendMessage}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={`Nhắn tin cho ${activeConv.title}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
          title="Gửi tin nhắn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
