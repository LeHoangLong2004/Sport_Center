import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X, Plus, Check, AlertCircle } from "lucide-react";
import { PackageDraft, periods, formatLabels, linesToText, textToLines } from "./utils";
import { PackagePricingFields } from "./PackagePricingFields";
import { PackagePeriod, SportFormat } from "../../../../services/packageApi";

export function PackageEditor({
  draft,
  onChange,
  onClose,
  onSave,
  saving,
  error,
}: {
  draft: PackageDraft;
  onChange: (draft: PackageDraft) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string;
}) {
  const isMembership = draft.category === "membership";

  // Cố định UI: Khóa triệt để cuộn trang của cả body lẫn container manager-page-content
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Khóa các container cuộn nội bộ của trang Dashboard
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      ".manager-page-content, main, .overflow-y-auto"
    );
    const prevScrollStates: { el: HTMLElement; overflow: string }[] = [];

    scrollContainers.forEach((el) => {
      prevScrollStates.push({ el, overflow: el.style.overflow });
      el.style.overflow = "hidden";
    });

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      prevScrollStates.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, []);

  // Danh sách bộ môn hỗ trợ cho dropdown (lấy trực tiếp từ CSDL)
  const [sportsOptions, setSportsOptions] = useState<string[]>([]);

  // Danh sách phòng tập / khu vực hỗ trợ cho dropdown (lấy trực tiếp từ CSDL bảng facilities)
  const [facilitiesOptions, setFacilitiesOptions] = useState<string[]>([]);

  // Tự động tải danh sách bộ môn và phòng tập từ database qua API
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/sports").then((res) => (res.ok ? res.json() : [])).catch(() => []),
      fetch("/api/facilities").then((res) => (res.ok ? res.json() : [])).catch(() => []),
    ]).then(([sportsData, facilitiesData]) => {
      if (!isMounted) return;
      if (Array.isArray(sportsData) && sportsData.length > 0) {
        const names = sportsData.map((s: any) => s.name?.trim()).filter(Boolean);
        setSportsOptions(Array.from(new Set(names)));
      }
      if (Array.isArray(facilitiesData) && facilitiesData.length > 0) {
        const fNames = facilitiesData.map((f: any) => f.name?.trim()).filter(Boolean);
        setFacilitiesOptions(Array.from(new Set([...fNames, "Toàn khu"])));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setField = <K extends keyof PackageDraft>(
    key: K,
    value: PackageDraft[K]
  ) => onChange({ ...draft, [key]: value });

  const fieldClass =
    "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors";

  const labelClass = "block text-xs font-semibold text-slate-700";

  const contentEndRef = React.useRef<HTMLDivElement>(null);

  // Sử dụng createPortal gắn trực tiếp ra ngoài thẻ <body> để thoát khỏi containment/animation của PageTransition
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-editor-title"
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        style={{
          height: "85vh",
          maxHeight: "720px",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal cố định ở đỉnh */}
        <header 
          className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-white shrink-0"
          style={{ flexShrink: 0 }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {isMembership ? "Cấu hình hạng thành viên" : "Danh mục gói môn tập"}
            </span>
            <h2
              id="package-editor-title"
              className="text-base font-bold text-slate-900"
            >
              {draft.name || "Tạo gói môn tập"}
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Nội dung Form cuộn độc lập bên trong */}
        <div 
          className="package-modal-scroll px-5 py-4 space-y-4"
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Thông tin chung
            </h3>
            {isMembership ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Hạng hệ thống</label>
                  <input
                    disabled
                    value={
                      draft.tier === "basic"
                        ? "Cơ bản"
                        : draft.tier === "plus"
                        ? "Plus"
                        : "Premium"
                    }
                    className={`${fieldClass} bg-slate-50`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tên hiển thị</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setField("name", event.target.value)}
                    className={fieldClass}
                    maxLength={60}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Tên gói</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setField("name", event.target.value)}
                    className={fieldClass}
                    placeholder="Ví dụ: Gym tự tập, Boxing 1-1"
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Bộ môn áp dụng</label>
                  <select
                    value={draft.sport || ""}
                    onChange={(event) => setField("sport", event.target.value)}
                    className={fieldClass}
                    required
                  >
                    <option value="">-- Chọn bộ môn --</option>
                    {sportsOptions.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                    {draft.sport && !sportsOptions.includes(draft.sport) && (
                      <option value={draft.sport}>{draft.sport}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Khu sử dụng / Phòng tập</label>
                  <select
                    value={draft.area || ""}
                    onChange={(event) => setField("area", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">-- Chọn phòng tập / khu vực --</option>
                    {facilitiesOptions.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                    {draft.area && !facilitiesOptions.includes(draft.area) && (
                      <option value={draft.area}>{draft.area}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Hình thức</label>
                  <select
                    value={draft.format}
                    onChange={(event) =>
                      setField("format", event.target.value as SportFormat)
                    }
                    className={fieldClass}
                  >
                    <option value="self">Tự tập</option>
                    <option value="group">Lớp nhóm</option>
                    <option value="coach">Coach 1–1</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>Mô tả gói</label>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                className={fieldClass}
                rows={2}
                maxLength={240}
                placeholder="Mô tả tóm tắt quyền lợi và trải nghiệm của gói tập..."
                required
              />
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.isActive}
                disabled={draft.tier === "basic"}
                onChange={(event) => setField("isActive", event.target.checked)}
                className="size-3.5 rounded accent-blue-600"
              />{" "}
              Đang mở bán công khai cho Hội viên
              {draft.tier === "basic" && (
                <span className="text-[11px] font-normal text-slate-400">
                  (Hạng Cơ bản luôn được bật)
                </span>
              )}
            </label>
          </section>

          {/* Cấu hình giá và kỳ hạn */}
          <PackagePricingFields
            draft={draft}
            onChange={onChange}
            isMembership={isMembership}
            fieldClass={fieldClass}
            labelClass={labelClass}
          />

          {/* Quyền lợi bổ sung */}
          <section className="space-y-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Quyền lợi bổ sung
              </h3>
              <p className="text-[11px] text-slate-400">
                Mỗi quyền lợi sẽ hiển thị dưới dạng dấu tích xanh trên thẻ gói của Hội viên.
              </p>
            </div>
            <div className="space-y-1.5">
              {draft.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(event) => {
                      const newBenefits = [...draft.benefits];
                      newBenefits[index] = event.target.value;
                      setField("benefits", newBenefits);
                    }}
                    className={fieldClass}
                    placeholder="Nhập quyền lợi (VD: Tủ đồ miễn phí, Khăn tập...)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newBenefits = draft.benefits.filter((_, i) => i !== index);
                      setField("benefits", newBenefits);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0 transition-colors"
                    title="Xóa quyền lợi này"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setField("benefits", [...draft.benefits, ""]);
                  setTimeout(() => {
                    contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus size={13} />
                Thêm quyền lợi
              </button>
            </div>
          </section>

          <div className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-xs leading-relaxed text-blue-900">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-blue-600" />
            <span>
              Khi lưu cấu hình, gói môn sẽ được tự động liên kết với bộ môn trong CSDL để phục vụ việc kiểm tra phân quyền đặt lịch và đối soát báo cáo.
            </span>
          </div>

          <div ref={contentEndRef} className="h-4" />
        </div>

        {/* Footer Cố định ở đáy */}
        <footer 
          className="flex justify-end gap-2.5 border-t border-slate-200 px-5 py-3 bg-slate-50 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
          style={{ flexShrink: 0 }}
        >
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm transition-colors"
          >
            <Check size={14} />
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
