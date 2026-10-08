/**
 * CO-09 — AI gợi ý bài tập
 * AI tạo bản nháp, Coach duyệt rồi mới lưu/giao.
 * Không tự giao khi AI vừa trả kết quả.
 * Dùng dữ liệu mẫu với nhãn "Gợi ý minh họa" vì chưa có AI backend.
 */
import { useState, useEffect } from "react";

const SPORT_OPTIONS = ["Yoga", "Gym", "Bơi", "CrossFit", "Cầu lông"];
const LEVEL_OPTIONS = ["Cơ bản", "Trung cấp", "Nâng cao"];
const EQUIPMENT_OPTIONS = ["Thảm tập", "Tạ tay", "Hồ bơi", "Xà đơn", "Dây kháng lực", "Không dụng cụ"];

const AI_SUGGESTIONS: Record<string, { name: string; reps: string; note: string }[]> = {
  Yoga: [
    { name: "Tư thế Núi (Tadasana)", reps: "5 phút", note: "Giữ lưng thẳng, thở đều" },
    { name: "Tư thế Chó úp mặt (Down Dog)", reps: "3 × 30s", note: "" },
    { name: "Tư thế Chiến binh I (Warrior I)", reps: "3 × 30s mỗi bên", note: "" },
    { name: "Tư thế Em bé (Balasana)", reps: "2 phút", note: "Thư giãn" },
  ],
  Gym: [
    { name: "Squat", reps: "4 × 12", note: "Giữ gót chân chạm sàn" },
    { name: "Push-up", reps: "3 × 15", note: "" },
    { name: "Plank", reps: "3 × 45s", note: "Giữ hông không sụp" },
    { name: "Dumbbell Row", reps: "3 × 12 mỗi bên", note: "" },
  ],
  Bơi: [
    { name: "Khởi động nước", reps: "200m chậm", note: "" },
    { name: "Kick board (chân)", reps: "4 × 50m", note: "Tập trung vào cú đập chân" },
    { name: "Freestyle kỹ thuật", reps: "4 × 100m", note: "Đếm nhịp tay" },
  ],
  CrossFit: [
    { name: "Box Jump", reps: "3 × 10", note: "" },
    { name: "Kettlebell Swing", reps: "3 × 15", note: "Hip hinge, không dùng lưng" },
    { name: "Burpee", reps: "3 × 10", note: "" },
    { name: "Air Squat", reps: "3 × 20", note: "" },
  ],
  "Cầu lông": [
    { name: "Khởi động", reps: "10 phút", note: "" },
    { name: "Di chuyển footwork 4 góc", reps: "5 × 2 phút", note: "" },
    { name: "Tập cầu cao", reps: "3 × 20 cái", note: "" },
    { name: "Tập smash", reps: "3 × 15 cái", note: "" },
  ],
};

export default function CoachAI() {
  const [sport, setSport] = useState("Yoga");
  const [level, setLevel] = useState("Cơ bản");
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [targetId, setTargetId] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<{ name: string; reps: string; note: string }[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../services/api").then(({ CoachAPI }) => {
      CoachAPI.getMembers().then(mem => {
        setMembers(mem);
        if (mem.length > 0) setTargetId(mem[0].id);
        setLoading(false);
      });
    });
  }, []);

  const toggleEquipment = (e: string) => {
    setEquipment((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDraft(null);
    setSaved(false);
    setFeedback(null);
    // Giả lập delay AI (chưa có backend)
    await new Promise((r) => setTimeout(r, 1500));
    setDraft(AI_SUGGESTIONS[sport] || AI_SUGGESTIONS.Yoga);
    setIsGenerating(false);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    setSaved(true);
    setFeedback("Gợi ý đã được lưu thành Nháp giáo án. Bạn có thể vào Giáo án để sửa và giao.");
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Đang tải...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI gợi ý bài tập</h1>
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl px-4 py-3 text-purple-800 dark:text-purple-200 text-sm">
        <strong>Lưu ý:</strong> Chưa có AI backend — kết quả dưới đây là{" "}
        <strong>Gợi ý minh họa</strong>, không phải phản hồi AI thật.
        Coach cần duyệt trước khi lưu hoặc giao.
      </div>

      {/* Step 1: Input */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">1. Thông tin gợi ý</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Học viên / Lớp</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={selectCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Môn</label>
            <select value={sport} onChange={(e) => { setSport(e.target.value); setDraft(null); }} className={selectCls}>
              {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trình độ</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
              {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mục tiêu</label>
            <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
              placeholder="VD: Giảm cân, tăng cơ..." className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Thiết bị có sẵn</label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((e) => (
              <button key={e} type="button" onClick={() => toggleEquipment(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${equipment.includes(e) ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-teal-700 transition-all shadow-md disabled:opacity-60">
          {isGenerating ? "Đang tạo gợi ý... ✨" : "✨ Tạo gợi ý bài tập"}
        </button>
      </div>

      {/* Step 2: Draft result */}
      {(isGenerating || draft) && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">2. Bản nháp gợi ý</h2>
            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700 font-semibold">
              Gợi ý minh họa — chưa phải AI thật
            </span>
          </div>

          {isGenerating ? (
            <div className="flex flex-col gap-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          ) : draft && (
            <>
              <div className="flex flex-col gap-2">
                {draft.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{ex.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ex.reps}{ex.note ? ` · ${ex.note}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 3: Coach action */}
              {!saved ? (
                <div className="flex gap-3 flex-wrap pt-2">
                  <button type="button" onClick={handleSaveDraft}
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 shadow-md shadow-teal-500/20">
                    Lưu thành Nháp giáo án
                  </button>
                  <button type="button" onClick={() => { setDraft(null); }}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Bỏ gợi ý này
                  </button>
                  <p className="w-full text-xs text-slate-400">
                    ⚠ Không tự động giao. Coach cần xem lại và xác nhận từng bước.
                  </p>
                </div>
              ) : (
                <div className="text-green-600 dark:text-green-400 text-sm font-medium">{feedback}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const selectCls = "border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 w-full";
const inputCls = "border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full";
