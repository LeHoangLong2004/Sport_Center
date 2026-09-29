import React, { useState, FormEvent } from 'react';
import { AuthVisual } from './AuthVisual';

export function ForgotPassword({
  onSubmit,
  onLogin,
}: {
  onSubmit: () => void
  onLogin: () => void
}) {
  const [loading, setLoading] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(onSubmit, 450)
  }

  return (
    <main className="login-page">
      <AuthVisual emphasized />

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <button
            type="button"
            onClick={onLogin}
            className="back-home-btn"
          >
            ← Quay lại đăng nhập
          </button>
          <div className="login-heading">
            <span className="eyebrow-blue">KHÔI PHỤC MẬT KHẨU</span>
            <p className="login-title">Quên mật khẩu?</p>
            <p className="login-copy">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi mã xác minh để đặt lại mật khẩu.
            </p>
          </div>
          <label className="field">
            <span>Địa chỉ email</span>
            <input
              placeholder="email@sportscenter.vn"
              type="email"
              required
              autoComplete="email"
            />
          </label>
          <button
            className="primary-button login-button"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang gửi mã..." : "Gửi mã xác minh →"}
          </button>
          <div className="login-switch">
            <span>Đã nhớ mật khẩu?</span>
            <button type="button" onClick={onLogin}>
              Đăng nhập
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}