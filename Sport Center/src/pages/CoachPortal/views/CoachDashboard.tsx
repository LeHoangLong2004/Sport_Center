import { CoachScreen } from "../types";
import { IconCalendar } from "../Icons";

export default function CoachDashboard({ onNavigate }: { onNavigate: (s: CoachScreen) => void }) {
  const stats = [
    {
      icon: "📅",
      label: "Lớp dạy hôm nay",
      value: "4 lớp",
      color: "#3B82F6",
      bg: "#EEF5FF",
    },
    {
      icon: "👥",
      label: "Tổng số học viên",
      value: "28 học viên",
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      icon: "🏃",
      label: "Lịch PT cá nhân",
      value: "3 buổi hôm nay",
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
    {
      icon: "💰",
      label: "Thu nhập tạm tính(Tháng này)",
      value: "18.5tr đ",
      color: "#F97316",
      bg: "#FFF1E8",
      highlight: true,
    },
  ]

  const schedule = [
    { time: "07:00 - 08:00", name: "Yoga Gây & Dây Cơ Bản", location: "Studio 2", type: "Lớp Nhóm", typeColor: "#3B82F6", border: "#3B82F6" },
    { time: "09:00 - 10:30", name: "Gym Group BodyCombat", location: "Khu Fitness A", type: "Lớp Nhóm", typeColor: "#3B82F6", border: "#3B82F6" },
    { time: "14:00 - 15:00", name: "PT Huấn Luyện: Nguyễn Lan Anh", location: "Khu PT VIP", type: "PT 1-1", typeColor: "#F97316", border: "#F97316" },
    { time: "17:00 - 18:30", name: "CrossFit Thể Lực Cao Độ", location: "Studio Ngoài Trời", type: "Lớp Nhóm Đặc biệt", typeColor: "#0D9488", border: "#0D9488" },
  ]

  const notifications = [
    {
      tag: "YÊU CẦU PT",
      tagColor: "#10B981",
      tagBg: "#D1FAE5",
      time: "10 phút trước",
      content: "Hội viên Trần Minh Khoa yêu cầu đặt lịch PT 1-1 cho ngày mai lúc 15:00.",
      actions: ["Chấp nhận", "Từ chối"],
    },
    {
      tag: "YÊU CẦU MỚI",
      tagColor: "#3B82F6",
      tagBg: "#EEF5FF",
      time: "1 giờ trước",
      content: "Đăng ký mới từ hội viên VIP: Vũ Thu Trang muốn chọn bạn làm HLV cá nhân 24 buổi.",
      actions: [],
    },
    {
      tag: "LỊCH THAY ĐỔI",
      tagColor: "#64748B",
      tagBg: "#F1F5F9",
      time: "Hôm qua",
      content: (
        <>Lớp Gym Group BodyCombat ngày 28/10 chuyển từ Studio 1 sang <strong>Khu Fitness A</strong>.</>
      ),
      actions: [],
    },
  ]

  return (
    <div className="cp-dashboard">
      <div className="cp-stat-grid">
        {stats.map((s) => (
          <div className="cp-stat-card" key={s.label}>
            <div className="cp-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="cp-stat-label">{s.label}</p>
              <p
                className="cp-stat-value"
                style={s.highlight ? { color: "#F97316" } : undefined}
              >
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="cp-dashboard-body">
        <div className="cp-schedule-panel">
          <div className="cp-panel-head">
            <h2 className="cp-panel-title">Lịch dạy hôm nay</h2>
            <span className="cp-date-badge">
              <IconCalendar />
              Thứ Năm, 26/10/2026
            </span>
          </div>
          <div className="cp-schedule-list">
            {schedule.map((s) => (
              <div
                key={s.name}
                className="cp-schedule-item"
                style={{ borderLeftColor: s.border }}
                onClick={() => onNavigate("schedule")}
              >
                <span className="cp-schedule-time">{s.time}</span>
                <div className="cp-schedule-info">
                  <span className="cp-schedule-name">{s.name}</span>
                  <span className="cp-schedule-loc">{s.location}</span>
                </div>
                <span
                  className="cp-type-badge"
                  style={{ color: s.typeColor, background: s.typeColor + "18" }}
                >
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="cp-notif-panel">
          <h2 className="cp-panel-title">Thông báo & Yêu cầu mới</h2>
          <div className="cp-notif-list">
            {notifications.map((n, i) => (
              <div className="cp-notif-card" key={i}>
                <div className="cp-notif-head">
                  <span
                    className="cp-notif-tag"
                    style={{ color: n.tagColor, background: n.tagBg }}
                  >
                    {n.tag}
                  </span>
                  <span className="cp-notif-time">{n.time}</span>
                </div>
                <p className="cp-notif-content">{n.content}</p>
                {n.actions.length > 0 && (
                  <div className="cp-notif-actions">
                    {n.actions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={a === "Chấp nhận" ? "cp-btn-primary-sm" : "cp-btn-ghost-sm"}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}