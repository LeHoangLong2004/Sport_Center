import React, { useState, FormEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { assets } from './shared';

export type UserRole = "admin" | "member" | "coach" | "receptionist"


export function Login({
  onLogin,
  onLoginAs,
  onRegister,
  onForgotPassword,
  onHome,
}: {
  onLogin: () => void
  onLoginAs?: (role: UserRole) => void
  onRegister: () => void
  onForgotPassword: () => void
  onHome?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        setError(data.message || data.title || "Đăng nhập thất bại. Hãy kiểm tra thông tin.")
        setLoading(false)
        return
      }
      
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data))
      
      if (onLoginAs) {
        const roleStr = data.role?.toLowerCase() || ""
        if (roleStr === "manager" || roleStr === "admin") onLoginAs("admin")
        else if (roleStr === "coach") onLoginAs("coach")
        else if (roleStr === "receptionist") onLoginAs("receptionist")
        else onLoginAs("member")
      } else {
        onLogin()
      }
    } catch (err) {
      setError("Lỗi kết nối đến server API.")
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 font-sans selection:bg-[#14b8a6] selection:text-white overflow-hidden">
      {/* Full-screen Background */}
      <img 
        className="absolute inset-0 w-full h-full object-cover scale-105" 
        src={`${assets}/sport_center_auth_bg.jpg`} 
        alt="Background" 
      />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden">
        
        {/* Left Side: Brand & Visuals */}
        <div className="w-full lg:w-5/12 p-10 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[#14b8a6]/20 to-transparent border-b lg:border-b-0 lg:border-r border-white/10">
          <div>
            <div className="flex gap-3 items-center mb-12">
              <div className="bg-[#14b8a6] flex items-center justify-center rounded-xl w-14 h-14 shadow-lg shadow-[#14b8a6]/30">
                <span className="font-black text-white text-2xl">SC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-xl tracking-wider">SPORTCENTER</span>
                <span className="font-bold text-[#86efac] text-xs tracking-widest uppercase">Operating System</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Hệ thống quản trị<br />thông minh.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Đăng nhập để trải nghiệm không gian số hóa toàn diện dành cho mọi thành viên của Sport Center.
            </p>
          </div>

          <div className="hidden lg:block mt-20">
            <p className="text-sm text-slate-400 font-medium">© 2026 Sports Center • Phiên bản 2.0</p>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full lg:w-7/12 p-10 lg:p-14 bg-white dark:bg-slate-900/80">
          <form className="w-full max-w-md mx-auto" onSubmit={submit}>
            {onHome && (
              <button
                type="button"
                onClick={onHome}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-8 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                Quay về trang chủ
              </button>
            )}

            <div className="mb-10">
              <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase rounded-full mb-4">Chào mừng trở lại</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Đăng nhập</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên đăng nhập / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end mt-4 mb-8">
              <button 
                type="button" 
                onClick={onForgotPassword}
                className="text-sm font-bold text-[#14b8a6] hover:text-[#0d9488] transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] hover:-translate-y-1 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập an toàn
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </>
              )}
            </button>

            <div className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Chưa có tài khoản?</span>{" "}
              <button 
                type="button" 
                onClick={onRegister}
                className="font-bold text-[#14b8a6] hover:text-[#0d9488] transition-colors ml-1"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
