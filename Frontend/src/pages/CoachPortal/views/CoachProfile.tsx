import { IconCheck } from "../Icons";
import { A } from "../constants";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { UserAvatar } from "../../../components/UserAvatar";

export default function CoachProfile({ navigateTo }: { navigateTo?: (screen: any) => void }) {
  const { profile, loading } = useUserProfile();

  const certs = profile?.certifications 
    ? profile.certifications.split(',').map(c => c.trim()).filter(Boolean)
    : [
        "Chưa cập nhật chứng chỉ chuyên môn."
      ];



  return (
    <div className="cp-profile-screen">
      <div className="cp-profile-hero-card relative">
        <UserAvatar src={profile?.avatarUrl} name={profile?.fullName || "Huấn luyện viên"} className="cp-profile-photo text-3xl" />
        <div className="cp-profile-hero-info">
          <div className="cp-profile-name-row flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <h2 className="cp-profile-name">{profile?.fullName || "Huấn luyện viên"}</h2>
              <span className="cp-master-badge">{(profile?.roleName || "Huấn luyện viên").toUpperCase()}</span>
            </div>
            
            {navigateTo && (
              <button 
                onClick={() => navigateTo("settings")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
          <p className="cp-profile-sub">
            {profile?.id ? `Mã HLV: ${profile.id.substring(0,8)}` : "Mã HLV: Đang cập nhật"} • Bộ môn phụ trách chính: {profile?.specialties || "Chưa cập nhật"}
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
                {certs[0]} {certs.length > 1 ? `& ${certs.length - 1} chứng chỉ khác` : ''}
              </p>
            </div>
            <div>
              <p className="cp-profile-field-label">KINH NGHIỆM</p>
              <p className="cp-profile-field-val">{profile?.experienceYears ? `${profile.experienceYears} năm huấn luyện chuyên nghiệp` : "Chưa cập nhật"}</p>
            </div>
          </div>
          {profile?.bio && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <p className="cp-profile-field-label mb-2">GIỚI THIỆU BẢN THÂN</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
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
