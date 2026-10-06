import React, { useState, useEffect, useRef, KeyboardEvent, FormEvent } from 'react';
import { AuthVisual } from './AuthVisual';
import { assets } from './shared';
import { ThemeToggle } from './ThemeToggle';

export function Verification({ onVerified }: { onVerified: () => void }) {
  const [digits, setDigits] = useState(["4", "8", "2", "", "", ""])
  const [seconds, setSeconds] = useState(299)
  const [error, setError] = useState("")
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    inputs.current[3]?.focus()
  }, [])

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    )
    setError("")
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    if (digits.some((digit) => !digit)) {
      setError("Vui lòng nhập đủ 6 chữ số.")
      return
    }
    
    const token = digits.join("")
    const email = localStorage.getItem("reset_email")
    
    if (email) {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token })
        })
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.message || "Mã xác minh không chính xác hoặc đã hết hạn.")
          return
        }
        
        localStorage.removeItem("reset_email")
        onVerified()
      } catch (err) {
        setError("Lỗi kết nối máy chủ API.")
      }
    } else {
      onVerified()
    }
  }

  function resend() {
    setDigits(["", "", "", "", "", ""])
    setSeconds(299)
    setError("")
    inputs.current[0]?.focus()
  }

  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <main className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans selection:bg-[#14b8a6] selection:text-white transition-colors duration-300">
      <AuthVisual emphasized />

      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative overflow-y-auto">
        <ThemeToggle />
        
        {/* Glow effect in background */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#14b8a6]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none" />

        <form className="w-full max-w-md relative z-10" onSubmit={verify}>
          <div className="mb-10 text-center">
            <span className="inline-block text-[#3b82f6] font-bold text-xs tracking-widest uppercase mb-2">XÁC MINH TÀI KHOẢN</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Xác minh qua Email</h2>
            <p className="text-slate-500 dark:text-[#94a3b8] text-sm max-w-xs mx-auto">
              Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến email của bạn. Vui
              lòng nhập mã bên dưới để kích hoạt tài khoản.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] rounded-xl p-4 mb-8 shadow-sm dark:shadow-none">
            <svg className="text-[#14b8a6]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span className="font-semibold text-slate-900 dark:text-white">nguyenvana@email.com</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 rounded uppercase">ĐÃ GỬI</span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between gap-2 mb-4">
              {digits.map((digit, index) => (
                <input
                  aria-label={`Chữ số xác minh ${index + 1}`}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-white dark:bg-[#1e293b]/80 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all shadow-sm dark:shadow-inner ${
                    digit || index === 3 
                      ? "border-[#14b8a6] text-slate-900 dark:text-white ring-1 ring-[#14b8a6]/20" 
                      : "border-slate-200 dark:border-[#334155] text-slate-400 dark:text-[#64748b] placeholder-slate-300 dark:placeholder-[#475569]"
                  }`}
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKey(index, event)}
                  placeholder="-"
                  ref={(element) => {
                    inputs.current[index] = element
                  }}
                  value={digit}
                />
              ))}
            </div>
            
            <div className="flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-[#94a3b8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>
                Mã xác minh có hiệu lực trong <strong className="text-slate-700 dark:text-[#cbd5e1]">{countdown}</strong>
              </span>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start justify-center gap-2 text-red-600 dark:text-red-400 text-sm text-center">
                <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0f766e] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 dark:shadow-teal-500/10 transition-all active:scale-[0.98]"
          >
            Xác minh tài khoản
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-[#94a3b8]">
            <span>Không nhận được mã?</span>{" "}
            <button 
              type="button" 
              onClick={resend}
              className="font-bold text-slate-900 hover:text-[#14b8a6] dark:text-white dark:hover:text-[#14b8a6] transition-colors"
            >
              Gửi lại mã
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}