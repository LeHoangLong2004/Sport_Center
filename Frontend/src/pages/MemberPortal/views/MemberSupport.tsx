import React, { useState } from "react";
import type { MemberScreen, MemberSupportTicketItem } from "../types";
import { getSavedMemberData, saveMemberData } from "../services/memberData";
import { Bot, HelpCircle, CheckCircle2, X } from "lucide-react";
import { SupportAiChat } from "./support/SupportAiChat";
import { SupportTickets } from "./support/SupportTickets";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberSupport({ onNavigate: _onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const userName = user?.fullName || user?.name || "Hội viên";
  const storageKey = userId ? `member_support_tickets_${userId}` : "member_support_tickets";

  const [activeTab, setActiveTab] = useState<"ai" | "tickets">("ai");
  const [tickets, setTickets] = useState<MemberSupportTicketItem[]>(() =>
    getSavedMemberData(storageKey, [])
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCreateTicket = (ticket: MemberSupportTicketItem) => {
    const updated = [ticket, ...tickets];
    setTickets(updated);
    saveMemberData(storageKey, updated);
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

      {activeTab === "ai" && <SupportAiChat userName={userName} />}
      {activeTab === "tickets" && (
        <SupportTickets tickets={tickets} onCreateTicket={handleCreateTicket} />
      )}
    </div>
  );
}

