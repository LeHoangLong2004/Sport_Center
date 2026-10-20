import React, { useState } from "react";
import { MessageSquare, X, Dumbbell, Building2, UserCheck, Users } from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { DirectoryContact, ChatDirectory } from "./chatTypes";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachContacts: DirectoryContact[];
  directory: ChatDirectory;
  isLoading: boolean;
  onStartChat: (contact: DirectoryContact) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  coachContacts,
  directory,
  isLoading,
  onStartChat
}) => {
  const [modalTab, setModalTab] = useState<"coaches" | "managers" | "members" | "classes">("coaches");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Bắt đầu cuộc trò chuyện mới
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn người bạn muốn trao đổi trong hệ thống SportCenter
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 px-4 text-xs font-bold">
          <button
            onClick={() => setModalTab("coaches")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalTab === "coaches"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Huấn luyện viên
          </button>
          <button
            onClick={() => setModalTab("managers")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalTab === "managers"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Quản lý & Hỗ trợ
          </button>
          <button
            onClick={() => setModalTab("members")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalTab === "members"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Hội viên khác
          </button>
          <button
            onClick={() => setModalTab("classes")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalTab === "classes"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Nhóm lớp
          </button>
        </div>

        {/* Modal Body List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {isLoading && (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Đang tải danh sách từ hệ thống...
            </div>
          )}

          {modalTab === "coaches" &&
            coachContacts.map((c) => (
              <div
                key={c.id}
                onClick={() => onStartChat(c)}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CoachAvatar src={c.avatar} name={c.name} className="w-11 h-11 rounded-xl ring-2 ring-slate-100 dark:ring-slate-800 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-700">HLV</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.subtitle}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                  Nhắn tin
                </button>
              </div>
            ))}

          {modalTab === "managers" &&
            directory.managers.map((m) => (
              <div
                key={m.id}
                onClick={() => onStartChat(m)}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CoachAvatar src={m.avatar} name={m.name} className="w-11 h-11 rounded-xl ring-2 ring-slate-100 dark:ring-slate-800" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">{m.roleTag}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.subtitle}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                  Liên hệ
                </button>
              </div>
            ))}

          {modalTab === "members" &&
            directory.members.map((mb) => (
              <div
                key={mb.id}
                onClick={() => onStartChat(mb)}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CoachAvatar src={mb.avatar} name={mb.name} className="w-11 h-11 rounded-xl ring-2 ring-slate-100 dark:ring-slate-800" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{mb.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">HỘI VIÊN</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{mb.subtitle}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                  Kết nối
                </button>
              </div>
            ))}

          {modalTab === "classes" &&
            directory.classes.map((cl) => (
              <div
                key={cl.id}
                onClick={() => onStartChat(cl)}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CoachAvatar src={cl.avatar} name={cl.name} className="w-11 h-11 rounded-xl ring-2 ring-slate-100 dark:ring-slate-800" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{cl.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">NHÓM LỚP</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{cl.subtitle}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                  Vào nhóm
                </button>
              </div>
            ))}

          {!isLoading && (
            (modalTab === "coaches" ? coachContacts :
              modalTab === "managers" ? directory.managers :
              modalTab === "members" ? directory.members : directory.classes).length === 0
          ) && (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Chưa có dữ liệu phù hợp trong hệ thống.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
