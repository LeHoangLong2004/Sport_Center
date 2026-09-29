import React, { useState, useEffect, useRef, KeyboardEvent, FormEvent } from 'react';
import { AuthVisual } from './AuthVisual';
import { assets } from './shared';

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

  function verify(event: FormEvent) {
    event.preventDefault()
    if (digits.some((digit) => !digit)) {
      setError("Vui lòng nhập đủ 6 chữ số.")
      return
    }
    onVerified()
  }

  function resend() {
    setDigits(["", "", "", "", "", ""])
    setSeconds(299)
    setError("")
    inputs.current[0]?.focus()
  }

  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <main className="login-page">
      <AuthVisual emphasized />
      <section className="verify-panel">
        <form className="verify-content" onSubmit={verify}>
          <div className="verify-heading">
            <span className="eyebrow-blue">XÁC MINH TÀI KHOẢN</span>
            <p className="verify-title">Xác minh qua Email</p>
            <p className="verify-copy">
              Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến email của bạn. Vui
              lòng nhập mã bên dưới để kích hoạt tài khoản.
            </p>
          </div>

          <div className="email-display">
            <img src={`${assets}/cacaa.svg`} alt="" />
            <span>nguyenvana@sportscenter.vn</span>
            <small>ĐÃ GỬI</small>
          </div>

          <div className="otp-block">
            <div className="otp-inputs">
              {digits.map((digit, index) => (
                <input
                  aria-label={`Chữ số xác minh ${index + 1}`}
                  className={
                    digit || index === 3 ? "otp-input active" : "otp-input"
                  }
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
            <div className="countdown">
              <img src={`${assets}/40e6a.svg`} alt="" />
              <span>
                Mã xác minh có hiệu lực trong <strong>{countdown}</strong>
              </span>
            </div>
            {error && <p className="otp-error">{error}</p>}
          </div>

          <div className="verify-actions">
            <button className="primary-button login-button" type="submit">
              Xác minh tài khoản →
            </button>
            <div className="resend-copy">
              <span>Không nhận được mã?</span>
              <button type="button" onClick={resend}>
                Gửi lại mã
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}