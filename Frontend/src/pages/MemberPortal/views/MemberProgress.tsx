import React, { useState } from "react";
import type { MemberScreen, MemberBodyMetricItem } from "../types";
import {
  DEFAULT_BODY_METRICS,
  getSavedMemberData,
  saveMemberData,
} from "../services/memberData";
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Scale,
  Calendar,
  CheckCircle2,
  Plus,
  Sparkles,
  Award,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberProgress({ onNavigate }: Props) {
  const [metrics, setMetrics] = useState<MemberBodyMetricItem[]>(() =>
    getSavedMemberData("member_body_metrics", DEFAULT_BODY_METRICS)
  );

  const [newWeight, setNewWeight] = useState("");
  const [newNote, setNewNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const latest = metrics[metrics.length - 1];
  const initial = metrics[0];
  const weightDiff = (latest.weightKg - initial.weightKg).toFixed(1);

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!w || isNaN(w) || w <= 20 || w >= 300) {
      alert("Vui lòng nhập cân nặng hợp lệ (kg)!");
      return;
    }

    const heightM = (latest.heightCm || 162) / 100;
    const bmiVal = parseFloat((w / (heightM * heightM)).toFixed(1));

    const todayStr = new Date().toISOString().split("T")[0];
    const newEntry: MemberBodyMetricItem = {
      date: todayStr,
      weightKg: w,
      heightCm: latest.heightCm,
      bmi: bmiVal,
      bodyFatPct: latest.bodyFatPct ? parseFloat((latest.bodyFatPct - 0.2).toFixed(1)) : 21.5,
      muscleMassKg: latest.muscleMassKg ? parseFloat((latest.muscleMassKg + 0.1).toFixed(1)) : 23.9,
      note: newNote.trim() || "Cập nhật định kỳ",
    };

    const updated = [...metrics, newEntry];
    setMetrics(updated);
    saveMemberData("member_body_metrics", updated);
    setNewWeight("");
    setNewNote("");
    setFeedback("Đã cập nhật chỉ số cân nặng mới thành công!");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Chỉ số thể hình & Tiến độ</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Theo dõi sự biến thiên cân nặng, tỷ lệ cơ mỡ và đánh giá thể chất định kỳ từ Huấn luyện viên
        </p>
      </div>

      {/* 4 CARDS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Cân nặng hiện tại</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {latest.weightKg} kg
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Giảm {Math.abs(Number(weightDiff))} kg so với ngày bắt đầu</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Chỉ số BMI</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {latest.bmi}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            Vóc dáng cân đối tiêu chuẩn
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tỷ lệ mỡ ước tính</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {latest.bodyFatPct}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            Mức săn chắc lý tưởng
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Khối lượng cơ bắp</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {latest.muscleMassKg} kg
          </div>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tăng cơ săn nét</span>
          </div>
        </div>
      </div>

      {/* GRAPH & LOG HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar/Line Visualizer (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Biểu đồ theo dõi cân nặng qua các mốc thời gian
          </h3>

          {/* Simple Clean Responsive Bar Graph */}
          <div className="h-56 flex items-end justify-between gap-4 pt-8 pb-4 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            {metrics.map((m, idx) => {
              const maxW = 70;
              const heightPct = Math.round((m.weightKg / maxW) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                    {m.weightKg}kg
                  </span>
                  <div
                    className="w-full max-w-[48px] bg-emerald-500 hover:bg-emerald-400 rounded-t-lg transition-all"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">
                    {m.date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Table history */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Ngày ghi</th>
                  <th className="p-3">Cân nặng</th>
                  <th className="p-3">BMI</th>
                  <th className="p-3">Tỷ lệ mỡ</th>
                  <th className="p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {metrics.map((m, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium">{m.date}</td>
                    <td className="p-3 font-bold">{m.weightKg} kg</td>
                    <td className="p-3">{m.bmi}</td>
                    <td className="p-3">{m.bodyFatPct}%</td>
                    <td className="p-3 text-slate-500">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick update weight form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cập nhật cân nặng mới
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ghi lại cân nặng tuần này để theo dõi tiến độ
            </p>

            <form onSubmit={handleAddMetric} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Cân nặng hiện tại (kg): *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="VD: 55.0"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Ghi chú cảm nhận thể trạng:
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="VD: Cảm thấy cơ thể nhẹ nhõm, bớt mỡ bụng..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 font-bold transition-colors shadow-xs"
              >
                Lưu chỉ số mới
              </button>
            </form>
          </div>

          {/* Coach Assessment Note */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <Award className="w-4 h-4" />
              <span>Đánh giá từ Huấn luyện viên</span>
            </div>
            <p className="leading-relaxed">
              "Nguyễn Lan Anh có sự cải thiện rõ rệt về sức bền cốt lõi sau 4 tuần. Tiếp tục duy trì chế độ dinh dưỡng giàu đạm và ngủ đủ 7 tiếng để cơ bắp phục hồi tối ưu!"
            </p>
            <p className="text-[11px] text-slate-400 italic">— HLV Enam (Master Trainer)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
