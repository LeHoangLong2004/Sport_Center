import React, { useRef, useState } from "react";
import { Users, Send, Image as ImageIcon, Paperclip, Loader2 } from "lucide-react";
import { UserAvatar } from "../../../../components/UserAvatar";
import type { Conversation } from "./types";

interface ChatWindowProps {
  activeConv?: Conversation;
  inputText: string;
  setInputText: (t: string) => void;
  onSendMessage: (e?: React.FormEvent, attachment?: { url: string; type: string }) => void;
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước tệp không được vượt quá 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "chat");

      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Tải ảnh thất bại");
      }
      onSendMessage(undefined, { url: data.url, type: "image" });
    } catch (err: any) {
      alert(err?.message || "Không thể tải tệp lên.");
    } finally {
      setUploading(false);
    }
  };

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
          const isImg =
            m.attachmentType === "image" ||
            (m.attachmentUrl && /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(m.attachmentUrl));

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                  isMe
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 rounded-br-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none"
                }`}
              >
                {m.text && <div>{m.text}</div>}

                {m.attachmentUrl && (
                  <div className="mt-2">
                    {isImg ? (
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-xl border border-white/20 hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={m.attachmentUrl}
                          alt="Đính kèm"
                          className="max-h-56 max-w-full rounded-xl object-contain bg-black/10"
                        />
                      </a>
                    ) : (
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/15 dark:bg-white/10 hover:bg-black/25 dark:hover:bg-white/20 text-xs transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Xem tệp đính kèm</span>
                      </a>
                    )}
                  </div>
                )}
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
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          title="Gửi hình ảnh đính kèm"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>

        <input
          type="text"
          placeholder={`Nhắn tin cho ${activeConv.title}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || uploading}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
          title="Gửi tin nhắn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
