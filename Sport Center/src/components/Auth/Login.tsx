import React, { useState, FormEvent } from 'react';
import { AuthVisual } from './AuthVisual';
import { ThemeToggle } from './ThemeToggle';

export type DemoRole = "admin" | "member" | "coach" | "receptionist"

export const demoAccounts: {
  email: string
  password: string
  role: DemoRole
  label: string
  name: string
}[] = [
  {
    email: "manager@sportscenter.vn",
    password: "sportscenter",
    role: "admin",
    label: "Quản trị viên",
    name: "Trần Minh Quân",
  },
  {
    email: "lananh@email.com",
    password: "member123",
    role: "member",
    label: "Hội viên",
    name: "Nguyễn Lan Anh",
  },
  {
    email: "coach@sportscenter.vn",
    password: "coach123",
    role: "coach",
    label: "Huấn luyện viên",
    name: "Lê Văn Hùng",
  },
  {
    email: "letan@sportscenter.vn",
    password: "letan123",
    role: "receptionist",
    label: "Lễ tân",
    name: "Ngọc Mai",
  },
]

export function Login({
  onLogin,
  onLoginAs,
  onRegister,
  onForgotPassword,
  onHome,
}: {
  onLogin: () => void
  onLoginAs?: (role: DemoRole) => void
  onRegister: () => void
  onForgotPassword: () => void
  onHome?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("manager@sportscenter.vn")
  const [password, setPassword] = useState("sportscenter")
  const [error, setError] = useState("")

  function fillDemo(account: (typeof demoAccounts)[0]) {
    setEmail(account.email)
    setPassword(account.password)
    setError("")
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const matched = demoAccounts.find(
      (a) => a.email === email.trim() && a.password === password,
    )
    if (!matched) {
      setError("Email hoặc mật khẩu không đúng. Hãy dùng tài khoản demo bên dưới.")
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      if (onLoginAs) onLoginAs(matched.role)
      else onLogin()
    }, 450)
  }

  return (
    <main className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans selection:bg-[#14b8a6] selection:text-white transition-colors duration-300">
      <AuthVisual />

      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative overflow-y-auto">
        <ThemeToggle />
        
        {/* Glow effect in background */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#14b8a6]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none" />

        <form className="w-full max-w-md relative z-10" onSubmit={submit}>
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-[#94a3b8] dark:hover:text-white transition-colors mb-10 group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Quay về trang chủ
            </button>
          )}

          <div className="mb-10">
            <span className="inline-block text-[#3b82f6] font-bold text-xs tracking-widest uppercase mb-2">CHÀO MỪNG TRỞ LẠI</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Đăng nhập hệ thống</h2>
            <p className="text-slate-500 dark:text-[#94a3b8] text-sm">
              Nhập thông tin tài khoản để truy cập hệ thống quản trị.
            </p>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider mb-3">Tài khoản demo truy cập nhanh</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="flex flex-col items-start px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-[#1e293b] dark:hover:bg-[#334155] dark:border-[#334155] dark:hover:border-[#475569] rounded-lg transition-all text-left shadow-sm dark:shadow-none"
                  onClick={() => fillDemo(account)}
                >
                  <span className="text-[10px] font-bold text-[#14b8a6] uppercase">{account.label}</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-[#cbd5e1]">{account.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">Email hoặc mã nhân viên</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#64748b]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6] transition-all shadow-sm dark:shadow-none"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">Mật khẩu</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#64748b]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  type="password"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6] transition-all shadow-sm dark:shadow-none"
                  placeholder="••••••••"
                />
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end mt-4 mb-6">
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="text-sm font-medium text-[#14b8a6] hover:text-[#0d9488] transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0f766e] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 dark:shadow-teal-500/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang xác thực...
              </>
            ) : (
              <>
                Đăng nhập an toàn
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </>
            )}
          </button>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-[#94a3b8]">
            <span>Chưa có tài khoản?</span>{" "}
            <button 
              type="button" 
              onClick={onRegister}
              className="font-bold text-slate-900 hover:text-[#14b8a6] dark:text-white dark:hover:text-[#14b8a6] transition-colors"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}