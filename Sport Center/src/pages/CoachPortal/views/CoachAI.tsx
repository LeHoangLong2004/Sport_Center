import { useState } from "react";
import { IconSearch, IconChevronDown, IconRefresh } from "../Icons";
import { A } from "../constants";

const AI_EXERCISES = [
  { icon: "🔥", name: "HIIT Tabata 20/10 Core Burn", duration: "45 phút", target: "Đốt mỡ bụng", level: "Cao" },
  { icon: "🥊", name: "Shadow Boxing & Footwork Drills", duration: "30 phút", target: "Tăng sức bền", level: "Trung bình" },
  { icon: "🏋️", name: "Kettlebell Swings & Thrusters", duration: "25 phút", target: "Sức mạnh cơ trung tâm", level: "Cao" },
  { icon: "💜", name: "Cool-down & Stretch giãn cơ sâu", duration: "15 phút", target: "Phục hồi cơ bắp", level: "Thấp" },
]

const groupClasses = [
  { name: "Yoga Gây & Dây Cơ Bản", subject: "Yoga", members: 12, next: "Thứ Sáu - 07:00" },
  { name: "Gym Group BodyCombat", subject: "Cardio", members: 20, next: "Thứ Bảy - 09:00" },
  { name: "CrossFit Thể Lực Cao Độ", subject: "Thể lực", members: 8, next: "Chủ nhật - 17:00" },
]

const levelColorAI: Record<string, string> = {
  Cao: "#EF4444",
  "Trung bình": "#F97316",
  Thấp: "#10B981",
}

export function CoachAI() {
  const [studentOpen, setStudentOpen] = useState(true)

  return (
    <div className="cp-ai-screen">
      <div className="cp-ai-selector">
        <label className="cp-student-select" onClick={() => setStudentOpen(!studentOpen)}>
          <IconSearch />
          <span>Chọn học viên để gợi ý bài tập...</span>
          <IconChevronDown />
        </label>
        <span className="cp-selected-badge">Đã chọn 1 học viên</span>
      </div>

      <div className="cp-ai-student-card">
        <img src={`${A}/c814c.png`} alt="Nguyễn Minh Khoa" className="cp-ai-student-avatar" />
        <div className="cp-ai-student-info">
          <strong>Nguyễn Minh Khoa</strong>
          <span className="cp-ai-student-tag">HIIT & Boxing</span>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">TRÌNH ĐỘ</p>
          <p className="cp-ai-stat-val">Trung bình</p>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">MỤC TIÊU HUẤN LUYỆN</p>
          <p className="cp-ai-stat-val">Giảm mỡ & Tăng sức bền</p>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">ĐÃ LUYỆN TẬP</p>
          <p className="cp-ai-stat-val">24 buổi</p>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">BUỔI GẦN NHẤT</p>
          <p className="cp-ai-stat-val">25/10/2026</p>
        </div>
      </div>

      <div className="cp-ai-body">
        <div className="cp-ai-suggestions">
          <div className="cp-ai-sug-head">
            <div>
              <h2 className="cp-panel-title">Bài tập được AI đề xuất</h2>
              <p className="cp-ai-sug-sub">Dựa trên thể lực, lịch sử tập luyện và mục tiêu đốt mỡ</p>
            </div>
            <span className="cp-ai-badge">✦ Được tạo bởi AI</span>
          </div>

          <div className="cp-ai-plan-card">
            <p className="cp-ai-plan-title">Kế hoạch tập luyện tuần tới (Tuần 5)</p>
            <p className="cp-ai-plan-desc">
              Tập trung cải thiện chỉ số Sức bền tim mạch thông qua chuỗi bài HIIT cường độ
              cao ngắt quãng kết hợp Power Boxing.
            </p>
            <div className="cp-ai-exercise-list">
              {AI_EXERCISES.map((ex) => (
                <div className="cp-ai-exercise-item" key={ex.name}>
                  <span className="cp-ai-ex-icon">{ex.icon}</span>
                  <div className="cp-ai-ex-info">
                    <strong>{ex.name}</strong>
                    <span className="cp-ai-ex-sub">{ex.duration} • {ex.target}</span>
                  </div>
                  <span
                    className="cp-ai-ex-level"
                    style={{ color: levelColorAI[ex.level] }}
                  >
                    {ex.level}
                  </span>
                </div>
              ))}
            </div>
            <div className="cp-ai-plan-actions">
              <button className="cp-btn-primary cp-btn-full" type="button">
                Áp dụng kế hoạch này
              </button>
              <button className="cp-btn-outline" type="button">
                <IconRefresh /> Tạo gợi ý mới
              </button>
            </div>
          </div>
        </div>

        <div className="cp-ai-analysis">
          <div className="cp-ai-analysis-card">
            <h3 className="cp-profile-card-title">Phân tích thể lực AI</h3>
            {[
              { label: "Sức bền (Cardio)", pct: 72, color: "#3B82F6" },
              { label: "Sức mạnh (Power)", pct: 58, color: "#8B5CF6" },
              { label: "Dẻo dai (Flexibility)", pct: 45, color: "#F97316" },
            ].map((bar) => (
              <div key={bar.label} className="cp-bar-row">
                <div className="cp-bar-head">
                  <span>{bar.label}</span>
                  <span style={{ color: bar.color, fontFamily: "var(--font-bold)" }}>{bar.pct}%</span>
                </div>
                <div className="cp-bar-track">
                  <div
                    className="cp-bar-fill"
                    style={{ width: `${bar.pct}%`, background: bar.color }}
                  />
                </div>
              </div>
            ))}
            <div className="cp-ai-kcal">
              <span>⚡</span>
              <div>
                <p className="cp-ai-kcal-label">TIÊU THỤ NĂNG LƯỢNG TRUNG BÌNH</p>
                <p className="cp-ai-kcal-val">520 kcal / buổi tập</p>
              </div>
            </div>
          </div>

          <div className="cp-ai-analysis-card">
            <div className="cp-bar-head">
              <h3 className="cp-profile-card-title" style={{ margin: 0 }}>Lịch sử tiến bộ</h3>
              <span className="cp-ai-trend">Xu hướng 4 tuần</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 220 80" preserveAspectRatio="none">
              <polyline
                points="10,60 70,45 130,30 190,10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {[10, 70, 130, 190].map((x, i) => (
                <circle key={i} cx={x} cy={[60, 45, 30, 10][i]} r="4" fill="#3B82F6" />
              ))}
            </svg>
            <div className="cp-chart-labels">
              {["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4 (Hiện tại)"].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cp-ai-group">
        <h2 className="cp-panel-title">Gợi ý bài tập cho lớp nhóm</h2>
        <table className="cp-curriculum-table">
          <thead>
            <tr>
              <th>TÊN LỚP HỌC</th>
              <th>BỘ MÔN</th>
              <th>SỐ HỘI VIÊN</th>
              <th>GIỜ HỌC TIẾP THEO</th>
              <th>HÀNH ĐỘNG AI</th>
            </tr>
          </thead>
          <tbody>
            {groupClasses.map((g) => (
              <tr key={g.name}>
                <td>{g.name}</td>
                <td>{g.subject}</td>
                <td>{g.members} học viên</td>
                <td>{g.next}</td>
                <td>
                  <button className="cp-ai-action-btn" type="button">
                    ✦ Tạo giáo án AI cho lớp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}