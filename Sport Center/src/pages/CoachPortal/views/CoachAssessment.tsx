import { useState } from "react";
import { IconSearch } from "../Icons";
import { A } from "../constants";

const students = [
  {
    name: "Nguyễn Lan Anh",
    type: "PT 1-1",
    avatar: `${A}/50eeb.png`,
    progress: "Tiến triển tốt",
    progressColor: "#10B981",
    progressBg: "#D1FAE5",
    weight: "54kg",
    goal: "Giảm 3kg mỡ mông đùi",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Hôm nay, 14:00",
  },
  {
    name: "Lê Minh Triết",
    type: "Fitness Member",
    avatar: `${A}/c814c.png`,
    progress: "Ổn định",
    progressColor: "#3B82F6",
    progressBg: "#EEF5FF",
    weight: "78kg",
    goal: "Tăng 2kg cơ bắp tay",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Hôm nay, 08:15",
  },
  {
    name: "Vũ Thu Trang",
    type: "Yoga VIP 1-1",
    avatar: `${A}/88820.png`,
    progress: "Khá chậm",
    progressColor: "#F97316",
    progressBg: "#FFF1E8",
    weight: "49kg",
    goal: "Phục hồi khớp vai thẳng trục",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Hôm nay, 08:02",
  },
  {
    name: "Trần Minh Khoa",
    type: "CrossFit Team",
    avatar: `${A}/98afc.png`,
    progress: "Tiến triển xuất sắc",
    progressColor: "#0D9488",
    progressBg: "#CCFBF1",
    weight: "82kg",
    goal: "Cải thiện VO2 Max & Thể lực",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Thứ 3, 17:00",
  },
]

export function CoachAssessment() {
  const [query, setQuery] = useState("")
  const visible = students.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="cp-assessment-screen">
      <div className="cp-assessment-toolbar">
        <h2 className="cp-panel-title">Theo dõi tiến trình & Ghi chú HLV</h2>
        <label className="cp-search-box">
          <IconSearch />
          <input
            placeholder="Tìm tên học viên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="cp-student-grid">
        {visible.map((s) => (
          <div className="cp-student-card" key={s.name}>
            <div className="cp-student-head">
              <div className="cp-student-id">
                <img src={s.avatar} alt={s.name} className="cp-student-avatar" />
                <div>
                  <strong className="cp-student-name">{s.name}</strong>
                  <span className="cp-student-type">{s.type}</span>
                </div>
              </div>
              <span
                className="cp-progress-badge"
                style={{ color: s.progressColor, background: s.progressBg }}
              >
                {s.progress}
              </span>
            </div>
            <div className="cp-student-stats">
              <div>
                <p className="cp-student-stat-label">CÂN NẶNG HIỆN TẠI</p>
                <p className="cp-student-stat-val">{s.weight}</p>
              </div>
              <div>
                <p className="cp-student-stat-label">MỤC TIÊU HUẤN LUYỆN</p>
                <p className="cp-student-stat-val">{s.goal}</p>
              </div>
            </div>
            <div className="cp-student-note-wrap">
              <p className="cp-student-note-label">
                GHI CHÚ HLV BUỔI GẦN NHẤT ({s.noteTime})
              </p>
              <p className="cp-student-note">{s.note}</p>
            </div>
            <div className="cp-student-actions">
              <button className="cp-btn-primary cp-btn-sm" type="button">
                Viết ghi chú buổi mới
              </button>
              <button className="cp-btn-outline cp-btn-sm" type="button">
                Lịch sử Body Fat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}