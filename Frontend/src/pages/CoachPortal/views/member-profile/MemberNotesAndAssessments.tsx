import React from "react";
import { FileText, Check, Award } from "lucide-react";

interface MemberNotesAndAssessmentsProps {
  notes: string[];
  newNote: string;
  setNewNote: (n: string) => void;
  noteSaved: boolean;
  onAddNote: (e: React.FormEvent) => void;
}

export const MemberNotesAndAssessments: React.FC<MemberNotesAndAssessmentsProps> = ({
  notes,
  newNote,
  setNewNote,
  noteSaved,
  onAddNote,
}) => {
  return (
    <div className="space-y-6">
      {/* Nhận xét & Đánh giá của Coach */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Ghi chú & Đánh giá của Coach</h2>
          </div>
        </div>

        {/* Note form */}
        <form onSubmit={onAddNote} className="mt-4 space-y-2">
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Nhập ghi chú hoặc đánh giá buổi tập cho học viên này..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <div className="flex items-center justify-between">
            {noteSaved ? (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Đã lưu ghi chú!
              </span>
            ) : (
              <span></span>
            )}
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Lưu nhận xét
            </button>
          </div>
        </form>

        {/* Note stream */}
        <div className="mt-4 space-y-2.5">
          {notes.map((note, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Huấn luyện viên Enam</span>
                <span>{index === 0 ? "Hôm nay" : `${index + 1} tuần trước`}</span>
              </div>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Thể lực định kỳ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Kiểm tra Thể lực Định kỳ</h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Đạt chuẩn</span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Chống đẩy (Push-up test)</span>
            <span className="font-bold text-slate-900 dark:text-white">
              25 cái / phút <span className="text-emerald-600 font-semibold">(Tốt)</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Plank giữ cốt lõi</span>
            <span className="font-bold text-slate-900 dark:text-white">
              90 giây <span className="text-emerald-600 font-semibold">(Đạt)</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Bodyweight Squat</span>
            <span className="font-bold text-slate-900 dark:text-white">
              35 lần / phút <span className="text-emerald-600 font-semibold">(Tốt)</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Độ dẻo chạm mũi chân</span>
            <span className="font-bold text-slate-900 dark:text-white">
              +4 cm <span className="text-blue-600 font-semibold">(Cải thiện)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
