import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { AuthVisual } from "./AuthVisual";
import { ThemeToggle } from "./ThemeToggle";

type Step = "otp" | "password";

export function ResetPassword({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<Step>("otp");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [demoToken, setDemoToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setEmail(localStorage.getItem("reset_email") || "");
    setDemoToken(localStorage.getItem("reset_token_demo") || "");
  }, []);

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (token.length !== 6) {
      setMessage({ type: "error", text: "Vui lòng nhập đủ 6 chữ số OTP." });
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Mã OTP không hợp lệ." });
        return;
      }
      setStep("password");
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối đến server API." });
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không trùng khớp." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Không thể đặt lại mật khẩu." });
        return;
      }

      localStorage.removeItem("reset_email");
      localStorage.removeItem("reset_token_demo");
      setMessage({ type: "success", text: data.message || "Đặt lại mật khẩu thành công." });
      window.setTimeout(onLogin, 900);
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối đến server API." });
    } finally {
      setLoading(false);
    }
  }

  const isOtpStep = step === "otp";
  const otpDigits = Array.from({ length: 6 }, (_, index) => token[index] || "");

  function updateOtp(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setToken((current) => current.slice(0, index) + current.slice(index + 1));
      return;
    }

    const next = token.split("");
    next[index] = digits[digits.length - 1];
    setToken(next.join("").slice(0, 6));
    setMessage(null);
    if (index < 5) otpInputs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      const previous = token.slice(0, index - 1) + token.slice(index);
      setToken(previous);
      otpInputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      otpInputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    setToken(pasted);
    setMessage(null);
    otpInputs.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  return (
    <main className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans">
      <AuthVisual emphasized />
      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <ThemeToggle />
        <form className="w-full max-w-md relative z-10" onSubmit={isOtpStep ? verifyOtp : resetPassword}>
          <button type="button" onClick={onLogin} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-10">
            ← Quay lại đăng nhập
          </button>

          <div className="mb-8">
            <span className="text-[#3b82f6] font-bold text-xs tracking-widest uppercase">KHÔI PHỤC MẬT KHẨU</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 mb-2">
              {isOtpStep ? "Xác minh OTP" : "Đặt lại mật khẩu"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isOtpStep
                ? "Nhập mã OTP 6 số được gửi đến email của bạn để tiếp tục."
                : "Tạo mật khẩu mới cho tài khoản của bạn."}
            </p>
          </div>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required disabled={!isOtpStep} className="mt-1.5 block w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-normal disabled:opacity-70" />
          </label>

          {isOtpStep ? (
            <>
              <div className="mt-5">
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mã OTP</span>
                <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Mã OTP 6 chữ số">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => { otpInputs.current[index] = element; }}
                      value={digit}
                      onChange={(event) => updateOtp(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus={index === 0}
                      aria-label={`Chữ số OTP ${index + 1}`}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] transition-all"
                    />
                  ))}
                </div>
              </div>
              {demoToken && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  SMTP chưa cấu hình. Mã OTP demo local: <strong className="tracking-widest">{demoToken}</strong>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu mới
                <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" minLength={6} autoFocus required className="mt-1.5 block w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-normal" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Xác nhận mật khẩu mới
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" minLength={6} required className="mt-1.5 block w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-normal" />
              </label>
            </div>
          )}

          {message && <div className={`mt-5 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{message.text}</div>}
          <button disabled={loading} type="submit" className="w-full mt-6 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold py-3.5 px-4 rounded-xl disabled:opacity-70">
            {loading ? "Đang xử lý..." : isOtpStep ? "Xác minh OTP" : "Đặt lại mật khẩu"}
          </button>
        </form>
      </section>
    </main>
  );
}
