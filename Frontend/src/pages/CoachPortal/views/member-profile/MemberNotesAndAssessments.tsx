import React, { useState } from "react";
import { FileText, Check, Award, Plus, Sparkles, X, Activity } from "lucide-react";
import type { MemberFitnessTest } from "./types";

interface MemberNotesAndAssessmentsProps {
  notes: { id: string; comment: string; nextStep: string; completion: number; createdAt: string }[];
  newNote: string;
  setNewNote: (n: string) => void;
  noteSaved: boolean;
  onAddNote: (e: React.FormEvent) => void;
  fitnessTests: MemberFitnessTest[];
  onAddFitnessTest?: (data: {
    metricName: string;
    value: number;
    unit: string;
    effort?: number;
    comment?: string;
    nextStep?: string;
  }) => Promise<void>;
}

const POPULAR_METRICS = [
  { name: "Squat (Gánh đùi)", unit: "kg" },
  { name: "Deadlift (Kéo tạ)", unit: "kg" },
  { name: "Bench Press (Đẩy ngực)", unit: "kg" },
  { name: "Plank giữ thân", unit: "giây" },
  { name: "Chạy bộ 5km", unit: "phút" },
  { name: "Hít đất (Push-ups)", unit: "cái" },
  { name: "Kéo xà (Pull-ups)", unit: "cái" },
];

export const MemberNotesAndAssessments: React.FC<MemberNotesAndAssessmentsProps> = ({
  notes,
  newNote,
  setNewNote,
  noteSaved,
  onAddNote,
  fitnessTests,
  onAddFitnessTest,
}) => {
  const [showTestForm, setShowTestForm] = useState(false);
  const [metricName, setMetricName] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [metricUnit, setMetricUnit] = useState("kg");
  const [effort, setEffort] = useState("8");
  const [testComment, setTestComment] = useState("");
  const [testNextStep, setTestNextStep] = useState("");
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(metricValue);
    if (!metricName.trim() || isNaN(val) || !onAddFitnessTest) return;

    setIsSubmittingTest(true);
    try {
      await onAddFitnessTest({
        metricName: metricName.trim(),
        value: val,
        unit: metricUnit.trim(),
        effort: parseInt(effort) || 8,
        comment: testComment.trim() || undefined,
        nextStep: testNextStep.trim() || undefined,
      });
      setTestSuccess(true);
      setMetricName("");
      setMetricValue("");
      setTestComment("");
      setTestNextStep("");
      setTimeout(() => {
        setTestSuccess(false);
        setShowTestForm(false);
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi ghi nhận kiểm tra thể lực", err);
    } finally {
      setIsSubmittingTest(false);
    }
  };

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
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Lưu nhận xét
            </button>
          </div>
        </form>

        {/* Note stream */}
        <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <div className="p-3 text-[11px] text-slate-400 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Chưa có ghi chú nào. Hãy để lại lời nhận xét đầu tiên cho học viên!
            </div>
          ) : notes.map((note, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-orange-600 dark:text-orange-400">HLV nhận xét</span>
                <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}</span>
              </div>
              <p>{note.comment}</p>
              {note.nextStep && (
                <p className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  🎯 Bước tiếp theo: {note.nextStep}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Thể lực định kỳ & Kết quả buổi tập */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Kiểm tra Thể lực & Kết quả</h2>
          </div>
          {onAddFitnessTest && (
            <button
              type="button"
              onClick={() => setShowTestForm(!showTestForm)}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {showTestForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showTestForm ? "Đóng" : "+ Ghi nhận chỉ số"}</span>
            </button>
          )}
        </div>

        {/* Form ghi nhận chỉ số */}
        {showTestForm && (
          <form onSubmit={handleSubmitTest} className="mt-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Ghi nhận chỉ số thể lực buổi tập</span>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_METRICS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setMetricName(m.name);
                    setMetricUnit(m.unit);
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    metricName === m.name
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên bài kiểm tra / Chỉ số</label>
                <input
                  type="text"
                  required
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  placeholder="Vd: Squat 1RM, Chạy 5km..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Kết quả</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="any"
                    required
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    placeholder="80"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={metricUnit}
                    onChange={(e) => setMetricUnit(e.target.value)}
                    placeholder="kg"
                    className="w-14 text-xs px-1.5 py-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Mức độ gắng sức (RPE)</label>
                <select
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="6">RPE 6 — Nhẹ nhàng, kiểm soát tốt</option>
                  <option value="7">RPE 7 — Vừa sức, còn 3 rep dự trữ</option>
                  <option value="8">RPE 8 — Nặng, còn 2 rep dự trữ</option>
                  <option value="9">RPE 9 — Rất nặng, còn 1 rep</option>
                  <option value="10">RPE 10 — Nỗ lực tối đa (Max Effort)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Mục tiêu tiếp theo</label>
                <input
                  type="text"
                  value={testNextStep}
                  onChange={(e) => setTestNextStep(e.target.value)}
                  placeholder="Vd: Tăng lên 85kg tuần sau"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Nhận xét buổi tập</label>
              <input
                type="text"
                value={testComment}
                onChange={(e) => setTestComment(e.target.value)}
                placeholder="Vd: Kỹ thuật tốt, khóa khớp chắc chắn..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {testSuccess ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Đã lưu chỉ số thể lực!
                </span>
              ) : <span></span>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTest || !metricName.trim() || !metricValue}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  {isSubmittingTest ? "Đang lưu..." : "Lưu kết quả"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Fitness tests list */}
        <div className="mt-4 space-y-2.5">
          {fitnessTests.length === 0 ? (
            <div className="p-5 text-xs text-slate-400 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Chưa có dữ liệu kiểm tra thể lực. Nhấn <strong>"+ Ghi nhận chỉ số"</strong> ở trên để nhập kết quả cho học viên!
            </div>
          ) : fitnessTests.map((test, idx) => (
            <div
              key={`${test.metricName}-${test.recordedAt}-${idx}`}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-700 dark:text-slate-200 font-bold">{test.metricName}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {test.value} <span className="text-xs font-semibold">{test.unit || ""}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>
                  {test.effort ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-semibold mr-1.5">
                      RPE {test.effort}
                    </span>
                  ) : null}
                  {test.comment ? `"${test.comment}"` : "Đã kiểm tra đạt chuẩn"}
                </span>
                <span>{test.recordedAt ? new Date(test.recordedAt).toLocaleDateString("vi-VN") : "Gần đây"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
