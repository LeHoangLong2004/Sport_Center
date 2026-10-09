import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { A, BillingPeriod, Stepper, OrderSummarySidebar } from "./shared";

export function OTPScreen({
  pkg,
  period,
  onConfirm,
  onCancel,
}: {
  pkg: any
  period: BillingPeriod
  onConfirm: () => void
  onCancel: () => void
}) {
  const [digits, setDigits] = useState(["8", "5", "2", "0", "", ""])
  const [seconds, setSeconds] = useState(45)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [])

  function updateDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1)
    setDigits((cur) => cur.map((x, idx) => (idx === i ? d : x)))
    if (d && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Stepper active={3} />

      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-7 items-start p-8 rounded-[16px] w-full">
              <div className="flex flex-col gap-2 w-full">
                <p className="font-['Inter'] font-bold text-[#0b1f3a] text-[24px]">Xác minh mã giao dịch OTP</p>
                <p className="font-['Inter'] font-normal text-[#64748b] text-sm leading-[20px]">
                  Chúng tôi đã gửi mã xác thực giao dịch OTP gồm 6 chữ số đến số điện thoại{" "}
                  <strong className="text-[#0f172a]">0901 234 567</strong> và email{" "}
                  <strong className="text-[#0f172a]">lananh.nguyen@email.com</strong>
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-3 items-start justify-center w-full">
                  {digits.map((d, i) => {
                    const isActive = i === 4
                    return (
                      <div key={i} className="relative">
                        <input
                          ref={(el) => { inputs.current[i] = el }}
                          value={d}
                          onChange={(e) => updateDigit(i, e.target.value)}
                          onKeyDown={(e) => handleKey(i, e)}
                          maxLength={1}
                          inputMode="numeric"
                          className={`size-16 rounded-[12px] text-center font-['Inter'] font-bold text-[#0f172a] text-[28px] outline-none ${
                            isActive
                              ? "border-2 border-teal-500"
                              : "border border-[#e2e8f0]"
                          } bg-white`}
                        />
                        {isActive && !d && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-teal-500 h-6 w-0.5 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-1.5 items-start justify-center w-full text-[#64748b] text-[13px]">
                  <span className="font-['Inter'] font-normal">Không nhận được mã?</span>
                  <span className="font-['Inter'] font-semibold">
                    Gửi lại mã sau <span className="text-teal-600">{seconds}s</span>
                  </span>
                </div>
              </div>

              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/c7fb6.svg`} className="block w-full" alt="" />
                </div>
              </div>

              <div className="flex gap-4 items-start w-full">
                <button
                  type="button"
                  onClick={onCancel}
                  className="border border-[#64748b] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-[15px] hover:bg-[#f8fafc] transition-colors"
                >
                  Hủy giao dịch
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="bg-teal-500 flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-white text-[15px] hover:bg-teal-600 transition-colors"
                >
                  Xác nhận OTP
                </button>
              </div>
            </div>
          </div>

          <OrderSummarySidebar pkg={pkg} period={period} screen="otp" />
        </div>
      </div>
    </div>
  )
}

