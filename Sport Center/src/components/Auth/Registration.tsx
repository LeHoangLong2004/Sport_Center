import React, { FormEvent } from 'react';
import { AuthVisual } from './AuthVisual';

export function Registration({
  onRegistered,
  onLogin,
  onHome,
}: {
  onRegistered: () => void
  onLogin: () => void
  onHome?: () => void
}) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onRegistered()
  }

  return (
    <main className="login-page">
      <AuthVisual emphasized />

      <section className="register-panel">
        <form className="register-form" onSubmit={submit}>
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="back-home-btn"
            >
              ← Quay về trang chủ
            </button>
          )}
          <div className="register-heading">
            <span className="eyebrow-blue">TẠO TÀI KHOẢN MỚI</span>
            <p className="register-title">Đăng ký tài khoản</p>
            <p className="register-copy">
              Điền thông tin để tạo tài khoản SportCenter của bạn
            </p>
          </div>

          <div className="register-fields">
            <label className="field register-field">
              <span>Họ và tên</span>
              <input
                autoComplete="name"
                name="name"
                placeholder="Nguyễn Văn A"
                required
              />
            </label>
            <label className="field register-field">
              <span>Email</span>
              <input
                autoComplete="email"
                name="email"
                placeholder="nguyenvana@sportscenter.vn"
                required
                type="email"
              />
            </label>
            <label className="field register-field">
              <span>Số điện thoại</span>
              <input
                autoComplete="tel"
                inputMode="tel"
                name="phone"
                placeholder="0901 234 567"
                required
                type="tel"
              />
            </label>
            <label className="field register-field">
              <span>Mật khẩu</span>
              <input
                autoComplete="new-password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
              />
            </label>
            <label className="field register-field">
              <span>Xác nhận mật khẩu</span>
              <input
                autoComplete="new-password"
                name="passwordConfirmation"
                placeholder="••••••••"
                required
                type="password"
              />
            </label>
          </div>

          <div className="register-actions">
            <button className="primary-button login-button" type="submit">
              Đăng ký tài khoản →
            </button>
            <div className="login-switch">
              <span>Đã có tài khoản?</span>
              <button type="button" onClick={onLogin}>
                Đăng nhập
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}