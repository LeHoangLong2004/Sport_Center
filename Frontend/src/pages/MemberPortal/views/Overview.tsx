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
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch('/api/schedule/my', {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUpcomingBookings(data);
        }
      })
      .catch(e => console.error("Error fetching overview schedule:", e));
  }, []);

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
            <p>Xin chào, Hội viên 👋</p>
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
                <strong>Active Member</strong>
                <small>Còn 30 ngày</small>
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
              <div className="flex items-center justify-between mb-3">
                <strong className="mp-card-label">Lịch sắp tới</strong>
                <button onClick={() => onNavigate("classes")} className="text-xs text-teal-600 font-bold hover:underline">
                  Quản lý đơn đặt
                </button>
              </div>
              <div className="mp-schedule-table">
                <div className="mp-schedule-head">
                  <span>THỜI GIAN</span>
                  <span>LỚP</span>
                  <span>TRẠNG THÁI</span>
                </div>
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.slice(0, 5).map((item, idx) => {
                    const st = item.startTime ? new Date(item.startTime) : null;
                    const dateText = st ? st.toLocaleString('vi-VN', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'Chưa xếp';
                    const status = item.bookingStatus || item.status || 'confirmed';

                    let badgeClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
                    let label = "Đã xác nhận";
                    if (status === 'pending') { badgeClass = "text-yellow-700 bg-yellow-50 border-yellow-200"; label = "Chờ duyệt"; }
                    else if (status === 'rejected') { badgeClass = "text-red-700 bg-red-50 border-red-200"; label = "Từ chối"; }
                    else if (status === 'attended') { badgeClass = "text-blue-700 bg-blue-50 border-blue-200"; label = "Đã tham gia"; }
                    else if (status === 'cancelled') { badgeClass = "text-rose-700 bg-rose-50 border-rose-200"; label = "Đã hủy"; }
                    else if (status === 'no_show') { badgeClass = "text-amber-700 bg-amber-50 border-amber-200"; label = "Vắng mặt"; }

                    return (
                      <div className="mp-schedule-row flex items-center justify-between py-2 border-b border-slate-100 text-sm" key={item.id || idx}>
                        <strong>{dateText}</strong>
                        <span className="font-semibold text-slate-800">{item.className}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-slate-400 text-sm">
                    Bạn chưa có lịch đặt lớp sắp tới.
                  </div>
                )}
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
