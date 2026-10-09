import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset, ClassItem } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';
import { useUserProfile } from '../../../hooks/useUserProfile';

export function Confirm({
  selectedClass,
  onNavigate,
}: {
  selectedClass: ClassItem
  onNavigate: (page: MemberPage) => void
}) {
  const { profile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedClass.id) {
      setError("Không tìm thấy ID lớp học. Vui lòng thử lại.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      import('../services/api').then(async ({ MemberAPI }) => {
        try {
          await MemberAPI.bookClass(selectedClass.id as string);
          onNavigate("success");
        } catch (err: any) {
          setError(err.message || "Đã xảy ra lỗi khi đặt lớp. Vui lòng thử lại.");
        } finally {
          setIsSubmitting(false);
        }
      });
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

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
              <small>LỚP NHÓM • {selectedClass.sportName || "HIIT"}</small>
              <strong>{selectedClass.title}</strong>
              <span>Coach: {selectedClass.coach}</span>
              <b>{selectedClass.schedule}</b>
            </div>
          </div>

          <div className="mp-member-context">
            <strong>HỘI VIÊN ĐĂNG KÝ</strong>
            <div>
              <span>Họ và tên</span>
              <b>{profile?.fullName || "Hội viên"}</b>
            </div>
            <div>
              <span>Gói hội viên</span>
              <small>{profile?.roleName || "Member"}</small>
            </div>
            <div>
              <span>Mã thành viên</span>
              <b className="uppercase">MB-{profile?.id?.substring(0, 6) || "XXXXXX"}</b>
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
            <button onClick={() => onNavigate("classes")} type="button" disabled={isSubmitting}>
              Quay lại
            </button>
            <button
              className="confirm"
              onClick={handleConfirm}
              type="button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt chỗ"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200">
              {error}
            </div>
          )}
        </div>
      </section>
    </MemberShell>
  )
}
