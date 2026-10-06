import { IconCheck } from "../Icons";
import { A } from "../constants";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { UserAvatar } from "../../../components/UserAvatar";

export default function CoachProfile() {
  const { profile, loading } = useUserProfile();

  const certs = [
    "Chứng chỉ Master Yoga Alliance 200H Mỹ.",
    "Chứng nhận Huấn luyện viên thể lực CrossFit Level 2 quốc tế.",
    "Chứng chỉ PT chuyên nghiệp liên đoàn tại Việt Nam.",
    "Chuyên gia tư vấn dinh dưỡng nâng cao (Nutritional Specialist).",
  ]



  return (
    <div className="cp-profile-screen">
      <div className="cp-profile-hero-card">
        <UserAvatar src={profile?.avatarUrl} name={profile?.fullName || "Huấn luyện viên"} className="cp-profile-photo text-3xl" />
        <div className="cp-profile-hero-info">
          <div className="cp-profile-name-row">
            <h2 className="cp-profile-name">{profile?.fullName || "Huấn luyện viên"}</h2>
            <span className="cp-master-badge">{(profile?.roleName || "Huấn luyện viên").toUpperCase()}</span>
          </div>
          <p className="cp-profile-sub">
            {profile?.id ? `Mã HLV: ${profile.id.substring(0,8)}` : "Mã HLV: Đang cập nhật"} • Bộ môn phụ trách chính: Gym, Yoga & CrossFit
          </p>
          <div className="cp-profile-fields">
            <div>
              <p className="cp-profile-field-label">ĐIỆN THOẠI</p>
              <p className="cp-profile-field-val">{profile?.phone || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="cp-profile-field-label">EMAIL LIÊN HỆ</p>
              <p className="cp-profile-field-val">{profile?.email || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="cp-profile-field-label">BẰNG CẤP & CHỨNG CHỈ</p>
              <p className="cp-profile-field-val">
                Bằng cử nhân Y sinh học TDTT • NASM CPT
              </p>
            </div>
            <div>
              <p className="cp-profile-field-label">KINH NGHIỆM</p>
              <p className="cp-profile-field-val">8 năm huấn luyện chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cp-profile-sections">
        <div className="cp-profile-card">
          <h3 className="cp-profile-card-title">Chứng chỉ & Chuyên môn đạt được</h3>
          <ul className="cp-cert-list">
            {certs.map((c) => (
              <li key={c} className="cp-cert-item">
                <span className="cp-cert-check">
                  <IconCheck />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="cp-profile-card">
          <h3 className="cp-profile-card-title">Đánh giá & Doanh số cá nhân</h3>
          <div className="cp-kpi-list">
            <div className="cp-kpi-row">
              <span className="cp-kpi-label">Điểm hài lòng học viên (CSAT):</span>
              <span className="cp-kpi-val" style={{ color: "#10B981" }}>4.9 / 5.0 (★)</span>
            </div>
            <div className="cp-kpi-row">
              <span className="cp-kpi-label">Tỷ lệ gia hạn gói tập PT:</span>
              <span className="cp-kpi-val" style={{ color: "#3B82F6" }}>88.5%</span>
            </div>
            <div className="cp-kpi-row">
              <span className="cp-kpi-label">KPI đạt được tháng này:</span>
              <span className="cp-kpi-val" style={{ color: "#F97316" }}>115% mục tiêu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}