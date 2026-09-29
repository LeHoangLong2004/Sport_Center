import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function MemberProfile({ onNavigate }: { onNavigate: (page: MemberPage) => void }) {
  return (
    <MemberShell page="profile" onNavigate={onNavigate}>
      <div className="mp-profile-page">
        <div className="mp-profile-hero">
          <div className="mp-profile-avatar-wrap">
            <img
              src="/assets/member-dashboard/af3ea.svg"
              alt="Ảnh đại diện"
              className="mp-profile-avatar"
            />
            <button className="mp-profile-avatar-edit" type="button" aria-label="Đổi ảnh">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.933 13.733l-3.6.8.8-3.6L11.333 2Z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="mp-profile-hero-info">
            <h2 className="mp-profile-name">Nguyễn Lan Anh</h2>
            <span className="mp-profile-badge">Hội viên Premium</span>
            <p className="mp-profile-id">ID: MEM-2024-00142</p>
          </div>
        </div>

        <div className="mp-profile-sections">
          <div className="mp-profile-card">
            <div className="mp-profile-card-header">
              <h3>Thông tin cá nhân</h3>
              <button type="button" className="mp-profile-edit-btn">Chỉnh sửa</button>
            </div>
            <div className="mp-profile-fields">
              <div className="mp-profile-field">
                <span className="mp-profile-label">Họ và tên</span>
                <span className="mp-profile-value">Nguyễn Lan Anh</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Email</span>
                <span className="mp-profile-value">lananh@sportscenter.vn</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Số điện thoại</span>
                <span className="mp-profile-value">0912 345 678</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Ngày sinh</span>
                <span className="mp-profile-value">15/03/1995</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Giới tính</span>
                <span className="mp-profile-value">Nữ</span>
              </div>
            </div>
          </div>

          <div className="mp-profile-card">
            <div className="mp-profile-card-header">
              <h3>Thông tin gói tập</h3>
            </div>
            <div className="mp-profile-fields">
              <div className="mp-profile-field">
                <span className="mp-profile-label">Gói hiện tại</span>
                <span className="mp-profile-value mp-profile-premium">Premium 12 tháng</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Ngày tham gia</span>
                <span className="mp-profile-value">01/10/2024</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Ngày hết hạn</span>
                <span className="mp-profile-value">30/09/2025</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Trạng thái</span>
                <span className="mp-profile-value mp-profile-status-active">Đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mp-profile-actions">
          <button type="button" className="mp-profile-action-btn mp-profile-action-primary">
            Đổi mật khẩu
          </button>
          <button type="button" className="mp-profile-action-btn mp-profile-action-secondary" onClick={() => onNavigate("overview")}>
            Quay lại tổng quan
          </button>
        </div>
      </div>
    </MemberShell>
  )
}
