import { useState } from "react";
import { IconChevronDown, IconPlus } from "../Icons";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]
const HOURS = [6, 9, 14, 17, 20]

type ClassBlock = {
  day: number
  hour: number
  type: "GROUP" | "PT" | "SPECIAL"
  name: string
}

const weekClasses: ClassBlock[] = [
  { day: 0, hour: 9, type: "GROUP", name: "CrossFit A" },
  { day: 0, hour: 17, type: "GROUP", name: "CrossFit A" },
  { day: 1, hour: 6, type: "GROUP", name: "Yoga Sáng" },
  { day: 1, hour: 9, type: "PT", name: "PT: Minh Khoa" },
  { day: 1, hour: 20, type: "GROUP", name: "Yoga Đêm" },
  { day: 2, hour: 9, type: "GROUP", name: "Gym Group B" },
  { day: 2, hour: 14, type: "PT", name: "PT: Lan Anh" },
  { day: 3, hour: 9, type: "GROUP", name: "Gym Combat" },
  { day: 3, hour: 17, type: "GROUP", name: "CrossFit A" },
  { day: 4, hour: 6, type: "GROUP", name: "Yoga Sáng" },
  { day: 4, hour: 14, type: "PT", name: "PT: Lan Anh" },
  { day: 4, hour: 20, type: "GROUP", name: "Yoga Đêm" },
  { day: 5, hour: 17, type: "PT", name: "PT: Thu Trang" },
  { day: 6, hour: 14, type: "SPECIAL", name: "Sự kiện SC" },
]

const typeStyles = {
  GROUP: { color: "#3B82F6", bg: "#EEF5FF", label: "GROUP" },
  PT: { color: "#F97316", bg: "#FFF1E8", label: "PT" },
  SPECIAL: { color: "#8B5CF6", bg: "#EDE9FE", label: "SPECIAL" },
}

export function CoachSchedule() {
  const [filter, setFilter] = useState<"all" | "GROUP" | "PT" | "SPECIAL">("all")

  const visible = filter === "all" ? weekClasses : weekClasses.filter((c) => c.type === filter)

  return (
    <div className="cp-schedule-screen">
      <div className="cp-schedule-toolbar">
        <div className="cp-week-picker">
          <span>Tuần này: 23/10 - 29/10</span>
          <IconChevronDown />
        </div>
        <div className="cp-filter-tabs">
          {(["all", "GROUP", "PT", "SPECIAL"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`cp-filter-tab ${filter === f ? "active" : ""}`}
              style={
                filter === f && f !== "all"
                  ? { background: typeStyles[f].bg, color: typeStyles[f].color, borderColor: typeStyles[f].color }
                  : undefined
              }
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tất cả" : f === "GROUP" ? `Lớp nhóm (${weekClasses.filter(c=>c.type==="GROUP").length})` : f === "PT" ? `PT cá nhân (${weekClasses.filter(c=>c.type==="PT").length})` : `Đặc biệt (${weekClasses.filter(c=>c.type==="SPECIAL").length})`}
            </button>
          ))}
        </div>
        <div className="cp-week-total">Tổng dạy: 18 buổi/tuần</div>
        <button className="cp-btn-primary" type="button">
          <IconPlus /> + Thêm lịch mới
        </button>
      </div>

      <div className="cp-week-grid-wrap">
        <div className="cp-week-grid">
          <div className="cp-week-header">
            <div className="cp-week-corner" />
            {DAYS.map((d) => (
              <div key={d} className="cp-week-day-head">{d}</div>
            ))}
          </div>
          {HOURS.map((hour) => (
            <div key={hour} className="cp-week-row">
              <div className="cp-week-time">{String(hour).padStart(2, "0")}:00</div>
              {DAYS.map((_, di) => {
                const cls = visible.find((c) => c.day === di && c.hour === hour)
                return (
                  <div key={di} className="cp-week-cell">
                    {cls && (
                      <div
                        className="cp-week-block"
                        style={{
                          color: typeStyles[cls.type].color,
                          background: typeStyles[cls.type].bg,
                          borderLeftColor: typeStyles[cls.type].color,
                        }}
                      >
                        <span className="cp-week-block-type">{typeStyles[cls.type].label}</span>
                        <span className="cp-week-block-name">{cls.name}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}