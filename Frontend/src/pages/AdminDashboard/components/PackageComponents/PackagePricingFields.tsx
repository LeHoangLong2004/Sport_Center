import { PackageDraft, periods, linesToText, textToLines } from "./utils"
import { PackagePeriod } from "../../../../services/packageApi"

interface PackagePricingFieldsProps {
  draft: PackageDraft
  onChange: (draft: PackageDraft) => void
  isMembership: boolean
  fieldClass: string
  labelClass: string
}

export function PackagePricingFields({ draft, onChange, isMembership, fieldClass, labelClass }: PackagePricingFieldsProps) {
  const setField = <K extends keyof PackageDraft,>(key: K, value: PackageDraft[K]) =>
    onChange({ ...draft, [key]: value })
  const setPrice = (period: PackagePeriod, value: number) =>
    onChange({ ...draft, prices: { ...draft.prices, [period]: value } })

  return (
    <>
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

    </>
  )
}
