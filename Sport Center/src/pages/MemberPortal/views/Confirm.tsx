import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset, ClassItem } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function Confirm({
  selectedClass,
  onNavigate,
}: {
  selectedClass: ClassItem
  onNavigate: (page: MemberPage) => void
}) {
  return (
    <MemberShell page="confirm" onNavigate={onNavigate}>
      <section className="mp-confirm-content">
        <Progress step={2} />
        <div className="mp-confirm-card">
          <div className="mp-confirm-heading">
            <p>Thông tin xác nhận đăng ký lớp</p>
            <span>
              Vui lòng kiểm tra kỹ lịch học và các điều khoản đặt lớp trước khi
              xác nhận.
            </span>
          </div>

          <div className="mp-selected-class">
            <img src={asset("confirm", "fb4de.png")} alt="" />
            <div>
              <small>LỚP NHÓM • HIIT</small>
              <strong>{selectedClass.title}</strong>
              <span>Coach: {selectedClass.coach}</span>
              <b>
                {selectedClass.title === "Functional HIIT"
                  ? "18:30 Thứ Ba, Ngày 24/09 (Arena 2)"
                  : selectedClass.schedule}
              </b>
            </div>
          </div>

          <div className="mp-member-context">
            <strong>HỘI VIÊN ĐĂNG KÝ</strong>
            <div>
              <span>Họ và tên</span>
              <b>Nguyễn Lan Anh</b>
            </div>
            <div>
              <span>Gói hội viên</span>
              <small>Premium</small>
            </div>
            <div>
              <span>Mã thành viên</span>
              <b>MB-2048</b>
            </div>
          </div>

          <div className="mp-policy">
            <span className="mp-policy-icon">
              <img src={asset("confirm", "a030e.svg")} alt="" />
            </span>
            <div>
              <strong>Lưu ý quy định đặt lớp</strong>
              <span>
                Hủy đăng ký trước giờ bắt đầu ít nhất 2 giờ miễn phí. Đi tập
                trước giờ khởi động 10 phút để nhận thiết bị đo nhịp tim tại
                quầy.
              </span>
            </div>
          </div>

          <div className="mp-confirm-actions">
            <button onClick={() => onNavigate("classes")} type="button">
              Quay lại
            </button>
            <button
              className="confirm"
              onClick={() => onNavigate("success")}
              type="button"
            >
              Xác nhận đặt chỗ
            </button>
          </div>
        </div>
      </section>
    </MemberShell>
  )
}
