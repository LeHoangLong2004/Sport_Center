import React from "react";
import { ShieldCheck, Star, Phone, MessageCircle } from "lucide-react";
import { CoachAvatar } from "../../../utils/coachAvatar";

interface BookingCoachCardProps {
  coach: any;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
}

export const BookingCoachCard: React.FC<BookingCoachCardProps> = ({
  coach,
  onStartChatWithCoach,
}) => {
  if (!coach) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 border border-teal-200 dark:border-teal-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" /> Huấn luyện viên phụ trách lớp của bạn
        </span>
        <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-teal-100">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {coach.coachRating ?? "—"}
        </span>
      </div>

      <div className="flex items-center gap-3.5">
        <CoachAvatar
          src={coach.coachAvatar}
          name={coach.coachName}
          className="w-14 h-14 rounded-full border-2 border-teal-500 shadow-md shrink-0"
        />
        <div>
          <h4 className="font-black text-base text-slate-900 dark:text-white">
            {coach.coachName}
          </h4>
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
            {coach.coachSpecialty}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
            <Phone className="w-3 h-3 text-slate-400" /> {coach.coachPhone}
          </p>
        </div>
      </div>

      <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
        "{coach.coachBio || "Chào mừng bạn tham gia lớp học! Huấn luyện viên rất mong chờ được đồng hành cùng bạn trong buổi tập sắp tới."}"
      </div>

      <button
        type="button"
        onClick={() =>
          onStartChatWithCoach(coach.coachName, coach.coachId, coach.coachAvatar)
        }
        className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Nhắn tin trò chuyện với HLV {coach.coachName}</span>
      </button>
    </div>
  );
};
