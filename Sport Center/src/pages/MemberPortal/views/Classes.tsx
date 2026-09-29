import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset, ClassItem } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function Classes({
  onNavigate,
  onSelect,
}: {
  onNavigate: (page: MemberPage) => void
  onSelect: (item: ClassItem) => void
}) {
  const [category, setCategory] = useState("Yoga")
  const [selectedDay, setSelectedDay] = useState(23)
  const [shift, setShift] = useState("Sáng (06:00 - 12:00)")
  const [coachQuery, setCoachQuery] = useState("")
  const visibleClasses = useMemo(
    () =>
      classItems.filter((item) =>
        item.coach.toLowerCase().includes(coachQuery.toLowerCase()),
      ),
    [coachQuery],
  )

  return (
    <MemberShell page="classes" onNavigate={onNavigate}>
      <section className="mp-classes-content">
        <div className="mp-classes-heading">
          <div>
            <p>Chọn lịch lớp học phù hợp</p>
            <span>
              Lựa chọn từ các lớp nhóm hoặc đặt chỗ huấn luyện viên chuyên
              nghiệp cho mục tiêu của bạn.
            </span>
          </div>
          <Progress step={1} />
        </div>

        <div className="mp-filters">
          <div className="mp-category-row">
            <div className="mp-tabs">
              {["Tất cả lớp", "Yoga", "HIIT", "Swimming", "CrossFit"].map(
                (item) => (
                  <button
                    className={category === item ? "active" : ""}
                    key={item}
                    onClick={() => setCategory(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <input
              aria-label="Lọc theo huấn luyện viên"
              onChange={(event) => setCoachQuery(event.target.value)}
              placeholder="Lọc theo HLV..."
              value={coachQuery}
            />
          </div>

          <div className="mp-week">
            <strong>LỊCH TRONG TUẦN (THÁNG 09/2026)</strong>
            <div>
              {[
                ["Thứ 2", 21],
                ["Thứ 3", 22],
                ["Thứ 4", 23],
                ["Thứ 5", 24],
                ["Thứ 6", 25],
                ["Thứ 7", 26],
                ["Chủ nhật", 27],
              ].map(([day, date]) => (
                <button
                  className={selectedDay === date ? "active" : ""}
                  key={date}
                  onClick={() => setSelectedDay(Number(date))}
                  type="button"
                >
                  <span>{day}</span>
                  <strong>{date}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="mp-shifts">
            <strong>KHUNG GIỜ:</strong>
            <div>
              {[
                "Sáng (06:00 - 12:00)",
                "Chiều (12:00 - 17:00)",
                "Tối (17:00 - 21:00)",
              ].map((item) => (
                <button
                  className={shift === item ? "active" : ""}
                  key={item}
                  onClick={() => setShift(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mp-class-grid">
          {visibleClasses.map((item) => (
            <article
              className="mp-class-card"
              key={item.title}
              onClick={() => onSelect(item)}
            >
              <img
                className="mp-class-photo"
                src={asset("classes", item.image)}
                alt=""
              />
              <div className="mp-class-body">
                <div>
                  <strong>{item.title}</strong>
                  <span>HLV: {item.coach}</span>
                </div>
                <div>
                  <p>{item.schedule}</p>
                  <small>{item.room}</small>
                </div>
                <footer>
                  <span>{item.spaces}</span>
                  <button onClick={() => onSelect(item)} type="button">
                    Đặt chỗ
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MemberShell>
  )
}
