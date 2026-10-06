import { useState } from "react";
import { IconPlus } from "../Icons";

const curricula = [
  { name: "Yoga Gây & Dây Cơ Bản", category: "Yoga", level: "Beginner", duration: 60, uses: 42 },
  { name: "HIIT Đốt Mỡ Thể Lực Cao", category: "Cardio", level: "Advanced", duration: 45, uses: 56 },
  { name: "Tăng Cơ Ngực & Vai VIP PT", category: "Personal PT", level: "Intermediate", duration: 60, uses: 124 },
  { name: "Giáo Án CrossFit Cho Team", category: "Thể lực", level: "Advanced", duration: 90, uses: 18 },
  { name: "Yoga Trị Liệu Cột Sống", category: "Yoga", level: "Beginner", duration: 75, uses: 35 },
  { name: "Gym Nhẹ Nhàng Phục Hồi", category: "Fitness", level: "Beginner", duration: 50, uses: 29 },
  { name: "Giảm Cân Bền Vững PT 1-1", category: "Personal PT", level: "Intermediate", duration: 60, uses: 88 },
  { name: "Core & Abs Bụng Săn Chắc", category: "Cardio", level: "Intermediate", duration: 30, uses: 64 },
]

const levelColors: Record<string, { color: string; bg: string }> = {
  Beginner: { color: "#10B981", bg: "#D1FAE5" },
  Intermediate: { color: "#F97316", bg: "#FFF1E8" },
  Advanced: { color: "#EF4444", bg: "#FEE2E2" },
}

export function CoachCurriculum() {
  const [selected, setSelected] = useState(0)
  const curr = curricula[selected]

  return (
    <div className="cp-curriculum-screen">
      <div className="cp-curriculum-left">
        <div className="cp-curriculum-toolbar">
          <h2 className="cp-panel-title">Danh sách giáo án hoạt động</h2>
          <button className="cp-btn-primary" type="button">
            <IconPlus /> + Tạo giáo án mới
          </button>
        </div>
        <div className="cp-curriculum-table-wrap">
          <table className="cp-curriculum-table">
            <thead>
              <tr>
                <th>TÊN GIÁO ÁN</th>
                <th>PHÂN LOẠI</th>
                <th>CẤP ĐỘ</th>
                <th>THỜI LƯỢNG</th>
                <th>ĐÃ SỬ DỤNG</th>
              </tr>
            </thead>
            <tbody>
              {curricula.map((c, i) => (
                <tr
                  key={c.name}
                  className={selected === i ? "selected" : ""}
                  onClick={() => setSelected(i)}
                >
                  <td>{c.name}</td>
                  <td className="cp-curriculum-cat">{c.category}</td>
                  <td>
                    <span
                      className="cp-level-badge"
                      style={{
                        color: levelColors[c.level].color,
                        background: levelColors[c.level].bg,
                      }}
                    >
                      {c.level}
                    </span>
                  </td>
                  <td>{c.duration} phút</td>
                  <td>{c.uses} lần</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cp-curriculum-right">
        <p className="cp-detail-eyebrow">CHI TIẾT GIÁO ÁN ĐANG CHỌN</p>
        <h2 className="cp-detail-title">{curr.name}</h2>
        <p className="cp-detail-meta">
          Thời lượng: {curr.duration} phút • Cấp độ: {curr.level}
        </p>
        <div className="cp-detail-phases">
          <div className="cp-phase">
            <p className="cp-phase-head" style={{ color: "#F97316" }}>PHẦN 1: KHỞI ĐỘNG (15 PHÚT)</p>
            <p className="cp-phase-body">
              • 5 phút thở bụng ổn định tâm trí. • 10 phút khởi động xoay các
              khớp cổ, vai, hông kết hợp gây gỗ nhẹ để mở rộng biên độ chuyển
              động.
            </p>
          </div>
          <div className="cp-phase">
            <p className="cp-phase-head" style={{ color: "#10B981" }}>PHẦN 2: THỰC HÀNH CHÍNH (35 PHÚT)</p>
            <p className="cp-phase-body">
              • Chuỗi chiến binh kết hợp gây để cân chỉnh trục cột sống. •
              Sử dụng dây khang lực treo tường bổ trợ kéo giãn khớp vai và
              lồng ngực. • Thực hành các tư thế thăng bằng chân cơ gây định
              tâm thế đứng.
            </p>
          </div>
          <div className="cp-phase">
            <p className="cp-phase-head" style={{ color: "#8B5CF6" }}>PHẦN 3: THƯ GIÃN & PHỤC HỒI (10 PHÚT)</p>
            <p className="cp-phase-body">
              • Tư thế em bé giãn thắt lưng kết hợp dây. • Thư giãn sâu
              Savasana trong nhạc thiền Tây Tạng tình tâm tuyệt đối.
            </p>
          </div>
        </div>
        <button className="cp-btn-primary cp-btn-full" type="button">
          ÁP DỤNG CHO LỚP HỌC
        </button>
      </div>
    </div>
  )
}