import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  MapPin,
  Star,
  Phone,
  MessageSquare,
} from "lucide-react";
import type { MemberSessionItem, MemberScreen } from "../../types";
import { CoachAvatar } from "../../utils/coachAvatar";
import { STATUS_BADGE } from "./scheduleConstants";

interface Props {
  session: MemberSessionItem | null;
  onClose: () => void;
  onNavigate: (screen: MemberScreen) => void;
  onStartCancelSession: (session: MemberSessionItem) => void;
}

export default function SessionDetailModal({
  session,
  onClose,
  onNavigate,
  onStartCancelSession,
}: Props) {
  if (!session) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                session.type === "pt"
                  ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {session.type === "pt" ? "Kèm riêng 1-1 PT" : session.sport}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                STATUS_BADGE[session.status]?.bg || ""
              } ${STATUS_BADGE[session.status]?.text || ""}`}
            >
              {STATUS_BADGE[session.status]?.label || session.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {session.name}
          </h3>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Thời gian & Ngày</span>
            <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {session.startTime} – {session.endTime} ({session.date})
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Phòng / Địa điểm</span>
            <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {session.room}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <CoachAvatar
                src={session.coachAvatar}
                name={session.coachName}
                className="w-12 h-12 rounded-xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-slate-400 block text-[11px] font-medium">Huấn luyện viên phụ trách</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong className="text-slate-900 dark:text-white font-bold text-sm truncate">
                    {session.coachName}
                  </strong>
                  {session.coachRating ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {session.coachRating}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate">
                  {session.coachSpecialty || "Huấn luyện viên thể hình"}
                  {session.coachExperienceYears ? ` • ${session.coachExperienceYears} năm kinh nghiệm` : ""}
                </p>
              </div>
            </div>

            {session.coachBio && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                "{session.coachBio}"
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
              {session.coachPhone ? (
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Phone className="w-3 h-3 text-teal-600" />
                  <a href={`tel:${session.coachPhone}`} className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
                    {session.coachPhone}
                  </a>
                </span>
              ) : (
                <span className="text-slate-400">HLV SmartGym</span>
              )}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Phí buổi học: <strong className="text-teal-700 dark:text-teal-400">{session.price ? `${session.price.toLocaleString('vi-VN')} đ` : "150.000 đ (Giá gốc)"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Coach Note / Feedback */}
        {session.coachNote && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs">
            <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              Lời nhận xét & dặn dò từ HLV:
            </div>
            <p className="text-amber-900 dark:text-amber-200 leading-relaxed italic">
              "{session.coachNote}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate("chat");
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Nhắn tin với HLV</span>
          </button>

          {(session.status === "sắp diễn ra" || session.status === "đang diễn ra") && (
            <button
              type="button"
              onClick={() => {
                onStartCancelSession(session);
              }}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              Hủy lịch đặt chỗ
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
