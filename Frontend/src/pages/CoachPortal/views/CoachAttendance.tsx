import { useState } from "react";
import { IconCheck } from "../Icons";
import { A } from "../constants";

const attendanceClasses = [
  { id: "c1", name: "Yoga Gây & Dây Cơ Bản", time: "07:00 - 08:00", date: "26/10/2026" },
  { id: "c2", name: "Gym Group BodyCombat", time: "09:00 - 10:30", date: "26/10/2026" },
]

const attendanceStudents = [
  { id: "s1", name: "Nguyễn Lan Anh", avatar: `${A}/50eeb.png` },
  { id: "s2", name: "Lê Minh Triết", avatar: `${A}/c814c.png` },
  { id: "s3", name: "Vũ Thu Trang", avatar: `${A}/88820.png` },
  { id: "s4", name: "Trần Minh Khoa", avatar: `${A}/98afc.png` },
]

export function CoachAttendance() {
  const [selectedClass, setSelectedClass] = useState("c1")
  const [statuses, setStatuses] = useState<Record<string, string>>({
    s1: "present",
    s2: "absent",
    s3: "present",
    s4: "late",
  })

  const setStatus = (studentId: string, status: string) => {
    setStatuses(prev => ({ ...prev, [studentId]: status }))
  }

  const currentClass = attendanceClasses.find(c => c.id === selectedClass)

  return (
    <div className="cp-attendance-screen" style={{ padding: "0", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="cp-attendance-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "16px 24px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#0F172A", fontWeight: 600 }}>Lớp học hiện tại</h2>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.9rem" }}>Hôm nay, {currentClass?.date}</p>
        </div>
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", outline: "none", fontSize: "0.95rem", color: "#1E293B", background: "#F8FAFC", cursor: "pointer", minWidth: "250px" }}
        >
          {attendanceClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.time})</option>
          ))}
        </select>
      </div>

      <div className="cp-attendance-list" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table className="cp-curriculum-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left" }}>
              <th style={{ padding: "16px 24px", color: "#475569", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Học viên</th>
              <th style={{ padding: "16px 24px", color: "#475569", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Trạng thái điểm danh</th>
              <th style={{ padding: "16px 24px", color: "#475569", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Ghi chú / Nhắc nhở</th>
            </tr>
          </thead>
          <tbody>
            {attendanceStudents.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={s.avatar} alt={s.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    <strong style={{ color: "#0F172A", fontSize: "0.95rem", fontWeight: 600 }}>{s.name}</strong>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      type="button"
                      onClick={() => setStatus(s.id, "present")}
                      style={{ 
                        padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 500, border: "1px solid transparent", cursor: "pointer",
                        background: statuses[s.id] === "present" ? "#D1FAE5" : "#F1F5F9", 
                        color: statuses[s.id] === "present" ? "#059669" : "#64748B",
                        borderColor: statuses[s.id] === "present" ? "#34D399" : "transparent",
                        transition: "all 0.2s"
                      }}>Có mặt</button>
                    <button 
                      type="button"
                      onClick={() => setStatus(s.id, "late")}
                      style={{ 
                        padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 500, border: "1px solid transparent", cursor: "pointer",
                        background: statuses[s.id] === "late" ? "#FEF3C7" : "#F1F5F9", 
                        color: statuses[s.id] === "late" ? "#D97706" : "#64748B",
                        borderColor: statuses[s.id] === "late" ? "#FBBF24" : "transparent",
                        transition: "all 0.2s"
                      }}>Đi trễ</button>
                    <button 
                      type="button"
                      onClick={() => setStatus(s.id, "absent")}
                      style={{ 
                        padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 500, border: "1px solid transparent", cursor: "pointer",
                        background: statuses[s.id] === "absent" ? "#FEE2E2" : "#F1F5F9", 
                        color: statuses[s.id] === "absent" ? "#DC2626" : "#64748B",
                        borderColor: statuses[s.id] === "absent" ? "#F87171" : "transparent",
                        transition: "all 0.2s"
                      }}>Vắng</button>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <input type="text" placeholder="Thêm ghi chú..." style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", fontSize: "0.9rem", color: "#1E293B" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="cp-btn-primary" type="button" style={{ padding: "12px 24px", fontSize: "1rem" }}>
          <IconCheck /> Hoàn tất & Lưu điểm danh
        </button>
      </div>
    </div>
  )
}