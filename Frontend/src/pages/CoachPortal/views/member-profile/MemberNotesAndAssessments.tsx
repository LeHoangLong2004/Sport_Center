import React from "react";
import { FileText, Check, Award } from "lucide-react";
import type { MemberFitnessTest } from "./types";

interface MemberNotesAndAssessmentsProps {
  notes: { id: string; comment: string; nextStep: string; completion: number; createdAt: string }[];
  newNote: string;
  setNewNote: (n: string) => void;
  noteSaved: boolean;
  onAddNote: (e: React.FormEvent) => void;
  fitnessTests: MemberFitnessTest[];
}

export const MemberNotesAndAssessments: React.FC<MemberNotesAndAssessmentsProps> = ({
  notes,
  newNote,
  setNewNote,
  noteSaved,
  onAddNote,
  fitnessTests,
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
                <span>Đánh giá từ hệ thống</span>
                <span>{new Date(notes[index].createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p>{note.comment}</p>
              {note.nextStep && <p className="mt-1 text-slate-500">Bước tiếp theo: {note.nextStep}</p>}
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
          {fitnessTests.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 text-center border border-dashed border-slate-200 rounded-lg">
              Chưa có dữ liệu kiểm tra thể lực.
            </div>
          ) : fitnessTests.map((test) => (
            <div key={`${test.metricName}-${test.recordedAt}`} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{test.metricName}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {test.value} {test.unit || ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
