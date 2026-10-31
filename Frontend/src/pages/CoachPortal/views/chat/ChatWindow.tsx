import React from "react";
import { Users, Send } from "lucide-react";
import { UserAvatar } from "../../../../components/UserAvatar";
import type { Conversation } from "./types";

interface ChatWindowProps {
  activeConv?: Conversation;
  inputText: string;
  setInputText: (t: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  errorMessage?: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeConv,
  inputText,
  setInputText,
  onSendMessage,
  messagesEndRef,
  errorMessage,
}) => {
  if (!activeConv) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/40 dark:bg-slate-900/60 p-8 text-center">
        <div>
          <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Chưa có cuộc trò chuyện nào
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Tin nhắn với học viên hoặc lớp được phân công sẽ xuất hiện ở đây.
          </p>
          {errorMessage && (
            <p className="mt-4 max-w-md rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

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
              <UserAvatar
                src={activeConv.avatar}
                name={activeConv.title}
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
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20 rounded-br-none"
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
          className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
          title="Gửi tin nhắn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
