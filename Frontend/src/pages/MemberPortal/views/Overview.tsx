import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function Overview({
  onNavigate,
}: {
  onNavigate: (page: MemberPage) => void
}) {
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState<string[]>([])

  function sendMessage(event: FormEvent) {
    event.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    setConversation((current) => [...current, cleanMessage])
    setMessage("")
  }

  return (
    <MemberShell page="overview" onNavigate={onNavigate}>
      <section className="mp-overview-content">
        <div className="mp-page-heading">
          <div>
            <span className="mp-kicker">FLOW 6 • AI ASSISTANT</span>
            <p>Xin chào, Lan Anh 👋</p>
            <small>Lịch tập, tiến độ và hỗ trợ cá nhân trong một nơi.</small>
          </div>
          <button
            className="mp-primary-action"
            onClick={() => onNavigate("classes")}
            type="button"
          >
            Đặt lớp
          </button>
        </div>

        <div className="mp-portal-grid">
          <div className="mp-dashboard-column">
            <div className="mp-stat-grid">
              <div className="mp-stat-card teal">
                <span>Gói hiện tại</span>
                <strong>Premium</strong>
                <small>Còn 88 ngày</small>
              </div>
              <div className="mp-stat-card green">
                <span>Chuỗi tập</span>
                <strong>12 ngày</strong>
                <small>Kỷ lục 18 ngày</small>
              </div>
              <div className="mp-stat-card">
                <span>Tiến độ mục tiêu</span>
                <strong>45%</strong>
                <small>−1,8 / −4 kg</small>
              </div>
            </div>

            <div className="mp-card">
              <strong className="mp-card-label">Lịch sắp tới</strong>
              <div className="mp-schedule-table">
                <div className="mp-schedule-head">
                  <span>THỜI GIAN</span>
                  <span>LỚP</span>
                  <span>COACH</span>
                </div>
                {[
                  ["Hôm nay • 18:30", "Functional HIIT", "Trần Khoa"],
                  ["T4 • 08:00", "Yoga Flow", "Mai Phương"],
                  ["T6 • 17:30", "PT cá nhân", "Trần Khoa"],
                ].map((row) => (
                  <div className="mp-schedule-row" key={row[0]}>
                    <strong>{row[0]}</strong>
                    <span>{row[1]}</span>
                    <span>{row[2]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mp-card mp-notice-card">
              <strong className="mp-card-label">Thông báo</strong>
              <span>
                Coach đã cập nhật kế hoạch tuần 5 • Gói Premium sẽ gia hạn sau
                88 ngày
              </span>
              <small>1 cập nhật mới</small>
            </div>
          </div>

          <aside className="mp-ai-panel">
            <div className="mp-ai-heading">
              <span>
                <img
                  src={asset("overview", "ece3e.svg")}
                  alt=""
                />
              </span>
              <div>
                <strong>Move AI</strong>
                <small>● Đang trực tuyến</small>
              </div>
            </div>
            <p className="mp-ai-message">
              Chào Lan Anh! Hôm nay bạn có lớp HIIT lúc 18:30. Mình đề xuất
              khởi động gối 8 phút trước buổi tập.
            </p>
            <p className="mp-user-message">
              Tôi có thể đổi sang lớp nhẹ hơn không?
            </p>
            <p className="mp-ai-message">
              Có. Yoga Recovery lúc 19:00 còn 6 chỗ và phù hợp với tình trạng
              đầu gối hôm nay. Bạn muốn mình giữ chỗ?
            </p>
            {conversation.map((item, index) => (
              <p className="mp-user-message" key={`${item}-${index}`}>
                {item}
              </p>
            ))}
            <strong className="mp-suggestion-title">GỢI Ý CÂU HỎI</strong>
            {[
              "Lịch tập tuần này",
              "Bài tập phục hồi gối",
              "Quyền lợi gói Premium",
            ].map((suggestion) => (
              <button
                className="mp-suggestion"
                key={suggestion}
                onClick={() => setMessage(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
            <form className="mp-message-input" onSubmit={sendMessage}>
              <input
                aria-label="Tin nhắn cho Move AI"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Hỏi về lịch, bài tập, dịch vụ..."
                value={message}
              />
              <button aria-label="Gửi tin nhắn" type="submit">
                <img src={asset("overview", "c2444.svg")} alt="" />
              </button>
            </form>
          </aside>
        </div>
      </section>
    </MemberShell>
  )
}
