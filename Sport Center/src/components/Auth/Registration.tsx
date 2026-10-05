import React, { FormEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { assets } from './shared';

export function Registration({
  onRegistered,
  onLogin,
  onHome,
}: {
  onRegistered: () => void
  onLogin: () => void
  onHome?: () => void
}) {
  async function submit(event: FormEvent) {
    event.preventDefault()
    
    const formData = new FormData(event.target as HTMLFormElement)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const role = formData.get("role") as string
    const password = formData.get("password") as string
    const passwordConfirmation = formData.get("passwordConfirmation") as string

    if (password !== passwordConfirmation) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, phoneNumber: phone, password, roleName: role })
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        alert(data.message || "Đăng ký thất bại.")
        return
      }
      
      if (data.token) localStorage.setItem("token", data.token)
      if (data.profile) localStorage.setItem("user", JSON.stringify(data.profile))
      
      onRegistered()
    } catch (err) {
      alert("Lỗi kết nối đến server API.")
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
              Mở khóa<br />tiềm năng.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Đăng ký để tham gia hệ sinh thái Sport Center và trải nghiệm dịch vụ chăm sóc sức khỏe toàn diện.
            </p>
          </div>

          <div className="hidden lg:block mt-20">
            <p className="text-sm text-slate-400 font-medium">© 2026 Sports Center • Tham gia ngay</p>
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
              <span className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold text-xs tracking-widest uppercase rounded-full mb-4">Tạo tài khoản mới</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Đăng ký</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <input
                    autoComplete="email"
                    name="email"
                    placeholder="nguyenvana@email.com"
                    required
                    type="email"
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                  </div>
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    name="phone"
                    placeholder="0901 234 567"
                    required
                    type="tel"
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input
                      autoComplete="new-password"
                      name="password"
                      placeholder="••••••••"
                      required
                      type="password"
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Xác nhận</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input
                      autoComplete="new-password"
                      name="passwordConfirmation"
                      placeholder="••••••••"
                      required
                      type="password"
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Vai trò (Role)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <select
                    name="role"
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40 focus:border-[#14b8a6] transition-all focus:bg-white appearance-none"
                  >
                    <option value="member">Hội viên (Member)</option>
                    <option value="manager">Quản lý (Manager)</option>
                    <option value="staff">Lễ tân (Staff)</option>
                    <option value="coach">Huấn luyện viên (Coach)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] hover:-translate-y-1 mt-8"
            >
              Đăng ký tài khoản
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>

            <div className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Đã có tài khoản?</span>{" "}
              <button 
                type="button" 
                onClick={onLogin}
                className="font-bold text-[#14b8a6] hover:text-[#0d9488] transition-colors ml-1"
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}