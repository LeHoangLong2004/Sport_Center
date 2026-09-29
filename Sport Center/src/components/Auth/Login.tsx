import React, { useState, FormEvent } from 'react';
import { AuthVisual } from './AuthVisual';

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
    <main className="login-page">
      <AuthVisual />

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="back-home-btn"
            >
              ← Quay về trang chủ
            </button>
          )}
          <div className="login-heading">
            <span className="eyebrow-blue">CHÀO MỪNG TRỞ LẠI</span>
            <p className="login-title">Đăng nhập hệ thống</p>
            <p className="login-copy">
              Nhập thông tin tài khoản để truy cập hệ thống.
            </p>
          </div>

          <div className="demo-accounts">
            <p className="demo-accounts-label">Tài khoản demo</p>
            <div className="demo-accounts-list">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-account-chip"
                  onClick={() => fillDemo(account)}
                >
                  <span className="demo-chip-role">{account.label}</span>
                  <span className="demo-chip-name">{account.name}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Email hoặc mã nhân viên</span>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              type="text"
              required
            />
          </label>
          <label className="field">
            <span>Mật khẩu</span>
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              type="password"
              required
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="forgot-password-row">
            <button type="button" onClick={onForgotPassword}>
              Quên mật khẩu?
            </button>
          </div>
          <button
            className="primary-button login-button"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập an toàn →"}
          </button>
          <div className="login-switch">
            <span>Chưa có tài khoản?</span>
            <button type="button" onClick={onRegister}>
              Đăng ký ngay
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}