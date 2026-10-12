import React from "react";
import { ShieldCheck, X, Plus, Check } from "lucide-react";
import { PackageDraft, periods, formatLabels, linesToText, textToLines } from "./utils";
import { PackagePeriod, SportFormat } from "../../../../services/packageApi";

export function PackageEditor({
  draft,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  draft: PackageDraft
  onChange: (draft: PackageDraft) => void
  onClose: () => void
  onSave: () => void
  saving: boolean
}) {
  const isMembership = draft.category === "membership"

  const setField = <K extends keyof PackageDraft,>(
    key: K,
    value: PackageDraft[K],
  ) => onChange({ ...draft, [key]: value })

  const setPrice = (period: PackagePeriod, value: number) =>
    onChange({ ...draft, prices: { ...draft.prices, [period]: value } })

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"

  const labelClass = "block text-sm font-semibold text-slate-700"

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-editor-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {isMembership
                ? "Cấu hình hạng thành viên"
                : "Danh mục gói môn tập"}
            </span>
            <h2
              id="package-editor-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {draft.name || "Tạo gói môn tập"}
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>
        <div className="max-h-[calc(92vh-145px)] space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Thông tin chung
            </h3>
            {isMembership ? (
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Tên gói</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setField("name", event.target.value)}
                    className={fieldClass}
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Bộ môn</label>
                  <input
                    value={draft.sport || ""}
                    onChange={(event) => setField("sport", event.target.value)}
                    className={fieldClass}
                    placeholder="Ví dụ: Yoga, Boxing"
                    maxLength={50}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Khu sử dụng</label>
                  <input
                    value={draft.area || ""}
                    onChange={(event) => setField("area", event.target.value)}
                    className={fieldClass}
                    placeholder="Ví dụ: Studio Yoga"
                    maxLength={80}
                    required
                  />
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
              <label className={labelClass}>Mô tả</label>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                className={fieldClass}
                rows={2}
                maxLength={240}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isActive}
                disabled={draft.tier === "basic"}
                onChange={(event) => setField("isActive", event.target.checked)}
                className="size-4 accent-blue-600"
              />{" "}
              Đang mở bán
              {draft.tier === "basic" && (
                <span className="text-xs font-normal text-slate-500">
                  (Cơ bản luôn được bật)
                </span>
              )}
            </label>
          </section>
          <section>
            <h3 className="text-sm font-bold text-slate-900">
              Tổng giá theo kỳ hạn
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Nhập tổng giá của từng kỳ, không tự nhân giá tháng.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {periods.map((period) => (
                <label key={period} className={labelClass}>
                  {period} tháng
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={draft.prices[period]}
                    disabled={draft.tier === "basic"}
                    onChange={(event) =>
                      setPrice(period, Number(event.target.value))
                    }
                    className={`${fieldClass} disabled:bg-slate-100`}
                    required
                  />
                </label>
              ))}
            </div>
          </section>
          {isMembership ? (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Quy tắc ưu đãi
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className={labelClass}>
                  Giảm tự tập/lớp nhóm (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.groupDiscountPct}
                    onChange={(event) =>
                      setField("groupDiscountPct", Number(event.target.value))
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Giảm Coach 1–1 (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.coachDiscountPct}
                    onChange={(event) =>
                      setField("coachDiscountPct", Number(event.target.value))
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Đặt lớp trước (giờ)
                  <input
                    type="number"
                    min={0}
                    value={draft.bookingAdvanceHours}
                    onChange={(event) =>
                      setField(
                        "bookingAdvanceHours",
                        Number(event.target.value),
                      )
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className={labelClass}>
                Điều kiện tủ đồ
                <textarea
                  value={draft.lockerTerms}
                  onChange={(event) =>
                    setField("lockerTerms", event.target.value)
                  }
                  className={fieldClass}
                  rows={2}
                />
              </label>
            </section>
          ) : (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Cấu hình hình thức
              </h3>
              {draft.format === "self" ? (
                <label className={labelClass}>
                  Khung giờ sử dụng
                  <input
                    value={draft.accessHours || ""}
                    onChange={(event) =>
                      setField("accessHours", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Ví dụ: 06:00–22:00"
                  />
                </label>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className={labelClass}>
                    Buổi mỗi tháng
                    <input
                      type="number"
                      min={1}
                      value={draft.sessionsPerMonth || ""}
                      onChange={(event) =>
                        setField("sessionsPerMonth", Number(event.target.value))
                      }
                      className={fieldClass}
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Phút mỗi buổi
                    <input
                      type="number"
                      min={1}
                      value={draft.minutesPerSession || ""}
                      onChange={(event) =>
                        setField(
                          "minutesPerSession",
                          Number(event.target.value),
                        )
                      }
                      className={fieldClass}
                      required
                    />
                  </label>
                  {draft.format === "group" ? (
                    <label className={labelClass}>
                      Sĩ số tối đa
                      <input
                        type="number"
                        min={1}
                        value={draft.maxClassSize || ""}
                        onChange={(event) =>
                          setField("maxClassSize", Number(event.target.value))
                        }
                        className={fieldClass}
                        required
                      />
                    </label>
                  ) : (
                    <div>
                      <span className={labelClass}>Sĩ số</span>
                      <p className={`${fieldClass} bg-slate-50`}>
                        Cố định 1 người
                      </p>
                    </div>
                  )}
                </div>
              )}
              <label className={labelClass}>
                Điều kiện sử dụng
                <textarea
                  value={linesToText(draft.terms)}
                  onChange={(event) =>
                    setField("terms", textToLines(event.target.value))
                  }
                  className={fieldClass}
                  rows={3}
                  placeholder="Mỗi điều kiện một dòng"
                  required
                />
              </label>
            </section>
          )}
          {!isMembership && draft.format === "self" && (
            <label className={labelClass}>
              Điều kiện sử dụng
              <textarea
                value={linesToText(draft.terms)}
                onChange={(event) =>
                  setField("terms", textToLines(event.target.value))
                }
                className={fieldClass}
                rows={3}
                placeholder="Mỗi điều kiện một dòng"
                required
              />
            </label>
          )}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quyền lợi bổ sung
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Thêm các quyền lợi để hiển thị cho khách hàng. Nội dung mô tả không tự thực thi thay
                cho tính năng hệ thống.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              {draft.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(event) => {
                      const newBenefits = [...draft.benefits]
                      newBenefits[index] = event.target.value
                      setField("benefits", newBenefits)
                    }}
                    className={fieldClass}
                    placeholder="Nhập quyền lợi..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newBenefits = draft.benefits.filter((_, i) => i !== index)
                      setField("benefits", newBenefits)
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 shrink-0 transition-colors"
                    title="Xóa"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setField("benefits", [...draft.benefits, ""])}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 w-fit px-2 py-1.5 -ml-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} />
                Thêm quyền lợi
              </button>
            </div>
          </section>
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <span>
              Giá và quyền lợi được chụp lại khi tạo đơn. Chỉnh sửa danh mục chỉ
              áp dụng cho đơn mua mới; ngừng bán không thu hồi gói đã thanh
              toán.
            </span>
          </div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Check size={16} />
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </footer>
      </div>
    </div>
  )
}
