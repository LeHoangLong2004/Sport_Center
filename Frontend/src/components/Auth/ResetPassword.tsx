import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthVisual } from "./AuthVisual";
import { ThemeToggle } from "./ThemeToggle";

export function ResetPassword({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("reset_email") || "";
    setEmail(savedEmail);
  }, []);

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage({ type: "error", text: "Vui lòng nhập địa chỉ email tài khoản." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không trùng khớp với mật khẩu mới." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errText = data.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
        setMessage({ type: "error", text: errText });
        toast.error("Cập nhật mật khẩu thất bại", { id: "auth-toast", description: errText });
        return;
      }

      localStorage.removeItem("reset_email");
      const succText = data.message || "Đặt lại mật khẩu thành công!";
      setMessage({ type: "success", text: succText });
      toast.success("Cập nhật mật khẩu thành công!", {
        id: "auth-toast",
        description: "Vui lòng đăng nhập với mật khẩu mới của bạn.",
      });

      window.setTimeout(onLogin, 1200);
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại mạng." });
      toast.error("Lỗi kết nối đến máy chủ", { id: "auth-toast" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-300">
      <AuthVisual emphasized />

      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative overflow-y-auto">
        <ThemeToggle />

        {/* Glow effect in background */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

        <form className="w-full max-w-md relative z-10" onSubmit={handleResetPassword}>
          <button
            type="button"
            onClick={onLogin}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-[#94a3b8] dark:hover:text-white transition-colors mb-8 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại đăng nhập
          </button>

          <div className="mb-6">
            <span className="inline-block text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-widest uppercase mb-2">
              THIẾT LẬP BẢO MẬT
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Tạo mật khẩu mới
            </h2>
            <p className="text-slate-500 dark:text-[#94a3b8] text-sm">
              Nhập mật khẩu mới và xác nhận để cập nhật thông tin đăng nhập của bạn.
            </p>
          </div>

          {/* Email Card */}
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                @
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                  Tài khoản đặt lại
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {email || "Chưa xác định"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogin}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Đổi email
            </button>
          </div>

          <div className="space-y-4">
            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#64748b]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (message) setMessage(null);
                  }}
                  minLength={6}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  autoFocus
                  className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6] transition-all shadow-sm dark:shadow-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#64748b]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (message) setMessage(null);
                  }}
                  minLength={6}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6] transition-all shadow-sm dark:shadow-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Validation or status message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {message.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0f766e] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang cập nhật...
              </>
            ) : (
              "Xác nhận đặt lại mật khẩu"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
