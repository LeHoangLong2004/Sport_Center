import React, { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  Scale,
  Ruler,
  TrendingUp,
  Heart,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MemberAPI } from "../services/api";

export interface BodyMetricItem {
  id: string;
  userId: string;
  weight: number;
  height: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi: number;
  recordedAt: string;
}

export default function MemberProgress() {
  const [metrics, setMetrics] = useState<BodyMetricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [muscleMass, setMuscleMass] = useState<string>("");
  const [recordDate, setRecordDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await MemberAPI.getBodyMetrics();
      if (Array.isArray(data)) {
        setMetrics(data);
      }
    } catch (err) {
      console.error("Lỗi tải chỉ số InBody:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const latest = metrics[0] || null;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) {
      return { label: "Thiếu cân", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" };
    }
    if (bmi < 24.9) {
      return { label: "Bình thường (Lý tưởng)", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" };
    }
    if (bmi < 29.9) {
      return { label: "Thừa cân", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800" };
    }
    return { label: "Béo phì", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" };
  };

  const handleOpenModal = () => {
    if (latest) {
      setHeight(latest.height ? String(latest.height) : "");
      setWeight(latest.weight ? String(latest.weight) : "");
    }
    setIsModalOpen(true);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 20 || w >= 300) {
      setErrorMsg("Vui lòng nhập cân nặng hợp lệ (20kg - 300kg).");
      return;
    }
    if (isNaN(h) || h <= 50 || h >= 250) {
      setErrorMsg("Vui lòng nhập chiều cao hợp lệ (50cm - 250cm).");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await MemberAPI.createBodyMetric({
        weight: w,
        height: h,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
        recordedAt: recordDate ? new Date(recordDate).toISOString() : new Date().toISOString(),
      });

      setSuccessMsg("Ghi nhận chỉ số InBody thành công!");
      setIsModalOpen(false);
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      await loadMetrics();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể lưu chỉ số thể chất.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              INBODY & TIẾN ĐỘ THỂ CHẤT
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Theo dõi Chỉ số Thể chất & BMI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dữ liệu số đo InBody được đồng bộ trực tiếp từ máy đo và dùng cho AI may đo giáo án cá nhân.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận số đo mới</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Cards */}
      {latest ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: BMI */}
          {(() => {
            const cat = getBmiCategory(latest.bmi);
            return (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Chỉ số BMI</span>
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {latest.bmi?.toFixed(1) || "--"}
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${cat.bg} ${cat.color}`}>
                  {cat.label}
                </div>
              </div>
            );
          })()}

          {/* Card 2: Cân nặng */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Cân nặng</span>
              <Scale className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {latest.weight} <span className="text-xs font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Đo ngày {new Date(latest.recordedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* Card 3: Chiều cao */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Chiều cao</span>
              <Ruler className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {latest.height} <span className="text-xs font-semibold text-slate-400">cm</span>
            </div>
            <p className="text-[10px] text-slate-400">Chuẩn vóc dáng</p>
          </div>

          {/* Card 4: Mỡ & Cơ bắp */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Tỷ lệ mỡ / Khối cơ</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {latest.bodyFat ? `${latest.bodyFat}%` : "--"} /{" "}
              {latest.muscleMass ? `${latest.muscleMass}kg` : "--"}
            </div>
            <p className="text-[10px] text-slate-400">InBody Scanner</p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
          <Scale className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Chưa có dữ liệu InBody nào
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Nhấn nút "Ghi nhận số đo mới" ở trên hoặc liên hệ HLV tại phòng tập để đo máy InBody định kỳ.
          </p>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Lịch sử kiểm tra & thay đổi thể trạng</span>
          </h3>
          <span className="text-xs text-slate-400">{metrics.length} lần đo</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Đang tải lịch sử chỉ số...</span>
          </div>
        ) : metrics.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Chưa có bản ghi số đo nào được lưu trên máy chủ.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">Ngày ghi nhận</th>
                  <th className="p-3.5">Cân nặng</th>
                  <th className="p-3.5">Chiều cao</th>
                  <th className="p-3.5">Chỉ số BMI</th>
                  <th className="p-3.5">Đánh giá thể trạng</th>
                  <th className="p-3.5">Tỷ lệ mỡ</th>
                  <th className="p-3.5 pr-5">Khối cơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.map((m) => {
                  const cat = getBmiCategory(m.bmi);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 pl-5 font-semibold text-slate-900 dark:text-white">
                        {new Date(m.recordedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {m.weight} kg
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{m.height} cm</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {m.bmi ? m.bmi.toFixed(1) : "--"}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {m.bodyFat ? `${m.bodyFat}%` : "--"}
                      </td>
                      <td className="p-3.5 pr-5 text-slate-600 dark:text-slate-300">
                        {m.muscleMass ? `${m.muscleMass} kg` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Metric */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Cập nhật tiến độ
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Ghi nhận Chỉ số InBody Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Cân nặng (kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="VD: 65.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Chiều cao (cm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="VD: 172"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tỷ lệ mỡ Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 18.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Khối lượng cơ (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 32.5"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Ngày đo:
                </label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu chỉ số</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
