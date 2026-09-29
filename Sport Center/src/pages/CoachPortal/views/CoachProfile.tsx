import { IconCheck } from "../Icons";
import { A } from "../constants";

export default function CoachProfile() {
  const certs = [
    "Chứng chỉ Master Yoga Alliance 200H Mỹ.",
    "Chứng nhận Huấn luyện viên thể lực CrossFit Level 2 quốc tế.",
    "Chứng chỉ PT chuyên nghiệp liên đoàn tại Việt Nam.",
    "Chuyên gia tư vấn dinh dưỡng nâng cao (Nutritional Specialist).",
  ]

  return (
    <div className="cp-profile-screen">
      <div className="cp-profile-hero-card">
        <img src={`${A}/f6154.png`} alt="HLV Nguyễn Minh Tuấn" className="cp-profile-photo" />
        <div className="cp-profile-hero-info">
          <div className="cp-profile-name-row">
            <h2 className="cp-profile-name">HLV Nguyễn Minh Tuấn</h2>
            <span className="cp-master-badge">MASTER COACH</span>
          </div>
          <p className="cp-profile-sub">
            Mã HLV: HLV-4019 • Bộ môn phụ trách chính: Gym, Yoga & CrossFit
          </p>
          <div className="cp-profile-fields">
            <div>
              <p className="cp-profile-field-label">ĐIỆN THOẠI</p>
              <p className="cp-profile-field-val">098 765 4321</p>
            </div>
            <div>
              <p className="cp-profile-field-label">EMAIL LIÊN HỆ</p>
              <p className="cp-profile-field-val">tuan.nm@sportcenter.com</p>
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
          <button className="cp-btn-outline cp-btn-full" style={{ marginTop: 20 }} type="button">
            Yêu cầu chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  )
}