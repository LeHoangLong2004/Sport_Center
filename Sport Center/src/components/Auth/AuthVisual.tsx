import React from 'react';
import { assets } from './shared';

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">SC</span>
      <span className="brand-name">SPORTCENTER OS</span>
    </div>
  )
}

export function AuthVisual({ emphasized = false }: { emphasized?: boolean }) {
  return (
    <section className="login-visual">
      <img className="login-photo" src={`${assets}/33567.png`} alt="" />
      <div className="login-overlay" />
      <Brand />
      <div className="login-message">
        <span className="eyebrow-orange">VẬN HÀNH ĐA BỘ MÔN</span>
        <p className={emphasized ? "login-slogan emphasized" : "login-slogan"}>
          Năng lượng cho mọi chuyển động.
        </p>
        <p className="login-description">
          Một hệ thống thống nhất cho thành viên, lớp học, thanh toán và huấn
          luyện thông minh.
        </p>
      </div>
      <p className="copyright">
        © 2026 Sports Center • Bảo mật dữ liệu vận hành
      </p>
    </section>
  )
}