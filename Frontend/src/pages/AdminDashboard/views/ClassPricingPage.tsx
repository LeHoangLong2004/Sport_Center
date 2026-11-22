import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, LoaderCircle, RefreshCw, Save, Tags } from "lucide-react";
import { toast } from "sonner";

type Sport = { id: string; name: string };
type PriceVersion = {
  sportId: string;
  sportName: string;
  pricePerSession: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
};

const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const nextDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day + 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
};

const formatDate = (value: string | null) => {
  if (!value) return "Chưa đặt ngày kết thúc";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

const parseDisplayDate = (value: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  if (year < 1000 || month < 1 || month > 12 || day < 1) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${yearText}-${monthText}-${dayText}`;
};

const formatMoney = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount)} đ`;

async function readError(response: Response) {
  try {
    const body = await response.json();
    return body.message || body.title || body.detail || "Không thể xử lý yêu cầu.";
  } catch {
    return "Không thể xử lý yêu cầu. Vui lòng thử lại.";
  }
}

export function ClassPricingPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [versions, setVersions] = useState<PriceVersion[]>([]);
  const [sportId, setSportId] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(formatDate(todayLocal()));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [sportResponse, priceResponse] = await Promise.all([
        fetch("/api/sports", { headers }),
        fetch("/api/class-pricing/", { headers }),
      ]);
      if (!sportResponse.ok) throw new Error(await readError(sportResponse));
      if (!priceResponse.ok) throw new Error(await readError(priceResponse));
      const sportData = await sportResponse.json();
      const priceData = await priceResponse.json();
      const nextSports = Array.isArray(sportData) ? sportData : [];
      const nextVersions = Array.isArray(priceData) ? priceData : [];
      setSports(nextSports);
      setVersions(nextVersions);
      setSportId((current) => current || nextSports[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải bảng giá.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const versionsForSport = useMemo(
    () => versions
      .filter((version) => version.sportId === sportId)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom)),
    [sportId, versions],
  );
  const currentPrice = versionsForSport.find((version) =>
    version.isActive && !version.effectiveTo && version.effectiveFrom <= todayLocal(),
  );
  const minEffectiveDate = useMemo(() => {
    const latestDate = versionsForSport.reduce(
      (latest, version) => version.effectiveFrom > latest ? version.effectiveFrom : latest,
      "",
    );
    return latestDate >= todayLocal() ? nextDate(latestDate) : todayLocal();
  }, [versionsForSport]);

  useEffect(() => {
    setEffectiveFrom(formatDate(minEffectiveDate));
  }, [minEffectiveDate]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(pricePerSession);
    const effectiveFromIso = parseDisplayDate(effectiveFrom);
    if (!sportId) return toast.error("Vui lòng chọn bộ môn.");
    if (!Number.isFinite(amount) || amount < 0) return toast.error("Đơn giá phải là số không âm.");
    if (!effectiveFromIso) return toast.error("Ngày không hợp lệ. Vui lòng nhập theo dạng dd/mm/yyyy.");
    if (effectiveFromIso < minEffectiveDate) return toast.error("Ngày áp dụng phải sau phiên bản giá gần nhất.");

    setSaving(true);
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    try {
      const response = await fetch(`/api/class-pricing/${sportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pricePerSession: amount, effectiveFrom: effectiveFromIso }),
      });
      if (!response.ok) throw new Error(await readError(response));
      toast.success("Đã cập nhật giá áp dụng cho các lớp thuộc bộ môn này.");
      setPricePerSession("");
      await loadData();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Không thể lưu bảng giá.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">Bảng giá lớp học</p>
          <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            Cấu hình đơn giá mỗi buổi theo bộ môn. Giá lớp được đồng bộ theo đơn giá đang có hiệu lực nhân với tổng số buổi.
          </p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải lại
        </button>
      </header>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <span>{error}</span>
          <button type="button" onClick={() => void loadData()} className="font-bold underline">Thử tải lại</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><Tags size={19} /></div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Lịch sử giá theo bộ môn</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Các phiên bản giá được lưu lại để tra cứu.</p>
            </div>
          </div>
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <label htmlFor="class-pricing-sport" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Bộ môn</label>
            <select id="class-pricing-sport" value={sportId} onChange={(event) => setSportId(event.target.value)} disabled={loading || sports.length === 0}
              className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              {sports.length === 0 && <option value="">Chưa có bộ môn</option>}
              {sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
            </select>
          </div>
          {currentPrice && (
            <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200"><CircleDollarSign size={18} /> Đơn giá đang áp dụng</div>
              <strong className="text-lg text-emerald-800 dark:text-emerald-300">{formatMoney(currentPrice.pricePerSession)}<span className="ml-1 text-xs font-medium">/buổi</span></strong>
            </div>
          )}
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="px-3 py-3 font-bold">Đơn giá / buổi</th><th className="px-3 py-3 font-bold">Từ ngày</th><th className="px-3 py-3 font-bold">Đến ngày</th><th className="px-3 py-3 font-bold">Trạng thái</th>
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="py-10 text-center text-slate-500"><LoaderCircle className="mr-2 inline animate-spin" size={16} />Đang tải bảng giá…</td></tr>
                  : versionsForSport.length === 0 ? <tr><td colSpan={4} className="py-10 text-center text-slate-500">Bộ môn chưa có lịch sử giá.</td></tr>
                    : versionsForSport.map((version) => <tr key={`${version.sportId}-${version.effectiveFrom}`} className="border-b border-slate-50 last:border-0 dark:border-slate-800/70">
                      <td className="px-3 py-3.5 font-bold text-slate-900 dark:text-white">{formatMoney(version.pricePerSession)}</td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">{formatDate(version.effectiveFrom)}</td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">{formatDate(version.effectiveTo)}</td>
                      <td className="px-3 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${version.effectiveFrom > todayLocal() && version.isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" : version.isActive && !version.effectiveTo ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{version.effectiveFrom > todayLocal() && version.isActive ? "Sắp áp dụng" : version.isActive && !version.effectiveTo ? "Đang áp dụng" : "Đã kết thúc"}</span></td>
                    </tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"><Save size={18} /></div>
            <div><h2 className="font-bold text-slate-900 dark:text-white">Tạo giá mới</h2><p className="text-xs text-slate-500 dark:text-slate-400">Tạo phiên bản có ngày hiệu lực.</p></div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="class-pricing-amount" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Đơn giá mỗi buổi (VNĐ)</label>
              <input id="class-pricing-amount" type="number" min="0" step="1000" required value={pricePerSession} onChange={(event) => setPricePerSession(event.target.value)} placeholder="Ví dụ: 120000"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <p className="mt-1 text-xs text-slate-500">Có thể nhập 0 cho bộ môn miễn phí.</p>
            </div>
            <div>
              <label htmlFor="class-pricing-date" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><CalendarDays size={14} /> Ngày bắt đầu áp dụng</label>
              <input id="class-pricing-date" type="text" required inputMode="numeric" autoComplete="off" maxLength={10} pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} placeholder="dd/mm/yyyy" aria-describedby="class-pricing-date-help"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <p id="class-pricing-date-help" className="mt-1 text-xs text-slate-500">Nhập theo dạng dd/mm/yyyy. Ngày áp dụng phải sau phiên bản giá đã có.</p>
            </div>
            {sportId && pricePerSession !== "" && Number(pricePerSession) >= 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Ví dụ giá khóa</p>
                <p className="mt-1 text-xs text-slate-500">{formatMoney(Number(pricePerSession))} × số buổi được chọn khi tạo khóa.</p>
              </div>
            )}
            <button type="submit" disabled={saving || loading || !sportId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Đang lưu…" : "Lưu phiên bản giá"}
            </button>
            <p className="text-xs leading-relaxed text-slate-500">Khi đến ngày hiệu lực, giá hiển thị của các lớp sẽ được tính lại theo đơn giá mới và số buổi. Các lượt đăng ký đã thanh toán giữ nguyên số tiền đã chốt.</p>
          </form>
        </section>
      </div>
    </div>
  );
}
