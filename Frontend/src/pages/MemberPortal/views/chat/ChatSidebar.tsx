import React from "react";
import { Search, Users, User } from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { ChatConversation } from "./chatTypes";
import type { MemberScreen } from "../../types";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId: string;
  search: string;
  onSearchChange: (val: string) => void;
  filterCategory: "all" | "coach" | "member" | "manager" | "class";
  onFilterCategoryChange: (cat: "all" | "coach" | "member" | "manager" | "class") => void;
  onSelectConversation: (id: string) => void;
  onNavigate?: (screen: MemberScreen) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  search,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  onSelectConversation,
  onNavigate
}) => {
  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      {/* Search bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm HLV, hội viên, quản lý, nhóm lớp..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
          {[
            { id: "all", label: "Tất cả" },
            { id: "coach", label: "HLV" },
            { id: "member", label: "Hội viên" },
            { id: "manager", label: "Quản lý" },
            { id: "class", label: "Nhóm lớp" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterCategoryChange(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                filterCategory === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation items list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Không tìm thấy cuộc trò chuyện nào
          </div>
        ) : (
          conversations.map((c) => {
            const isActive = c.id === activeId;
            const cat = c.category || (c.type === "class" ? "class" : "coach");
            const roleTag = c.roleTag || (cat === "coach" ? "HLV" : cat === "manager" ? "BQL" : cat === "member" ? "HỘI VIÊN" : "LỚP HỌC");

            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="relative shrink-0">
                  {c.avatar || cat === "coach" ? (
                    <CoachAvatar
                      src={c.avatar}
                      name={c.title}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800">
                      {c.type === "class" ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                  )}
                  {c.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">
                        {c.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          cat === "coach"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                            : cat === "manager"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                            : cat === "member"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                        }`}
                      >
                        {roleTag}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{c.lastTime}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
                    {c.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span className="truncate">{c.subtitle}</span>
                    {Boolean(c.unreadCount) && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 ml-1">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Cần đặt lịch tập mới?</span>
        <button
          onClick={() => onNavigate?.("booking")}
          className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
        >
          Đặt lịch PT &gt;
        </button>
      </div>
    </div>
  );
};
