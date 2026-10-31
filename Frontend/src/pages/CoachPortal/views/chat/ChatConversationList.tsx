import React from "react";
import { Search, Users } from "lucide-react";
import { UserAvatar } from "../../../../components/UserAvatar";
import type { Conversation } from "./types";

interface ChatConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  filterType: "all" | "class" | "direct";
  onFilterChange: (type: "all" | "class" | "direct") => void;
}

export const ChatConversationList: React.FC<ChatConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  search,
  onSearchChange,
  filterType,
  onFilterChange,
}) => {
  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      {/* Search bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm học viên hoặc lớp học..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 mt-2.5">
          {(["all", "direct", "class"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange(type)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? "bg-orange-500 text-white font-bold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {type === "all" ? "Tất cả" : type === "direct" ? "Kèm 1–1" : "Nhóm lớp"}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {conversations.map((conv) => {
          const isSelected = conv.id === activeId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-slate-100/90 dark:bg-slate-800/80"
                  : "hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {conv.type === "class" ? (
                  <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <UserAvatar
                    src={conv.avatar}
                    name={conv.title}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                )}
                {conv.online && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 absolute bottom-0 right-0"></span>
                )}
              </div>

              {/* Conv details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                    {conv.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {conv.lastTime}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug">
                  {conv.lastMessage}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400 truncate">
                    {conv.subtitle}
                  </span>
                  {conv.unreadCount ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-orange-500 text-white rounded-full">
                      {conv.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
