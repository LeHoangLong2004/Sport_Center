import React from "react";
import { ArrowLeft, Phone, Mail, Dumbbell, Target, MessageSquare, Plus } from "lucide-react";
import type { CoachScreen } from "../../types";
import type { MockMember } from "../../services/api";

interface MemberHeroCardProps {
  member: MockMember;
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

export const MemberHeroCard: React.FC<MemberHeroCardProps> = ({ member, navigateTo }) => {
  return (
    <>
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          onClick={() => navigateTo("members")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách học viên</span>
        </button>

        <span className="text-xs text-slate-400">
          Mã học viên: <strong className="font-mono text-slate-700 dark:text-slate-200">{member.code}</strong>
        </span>
      </div>

      {/* Hero Member Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-orange-500/20 shadow-md shadow-orange-500/10"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {member.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                  Đang tập luyện
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {member.level}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {member.phone || "0901234568"}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {member.email || "member@test.com"}
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                  Môn: <strong className="text-slate-700 dark:text-slate-300">{member.sport}</strong>
                </span>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Mục tiêu huấn luyện:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Target className="w-3 h-3 text-emerald-600" />
                  {member.goal || "Sức khỏe & Săn chắc cơ"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => navigateTo("chat", { memberId: member.id })}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm shadow-orange-500/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Nhắn tin trao đổi
            </button>
            <button
              type="button"
              onClick={() => navigateTo("curriculum")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Giao giáo án mới
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
