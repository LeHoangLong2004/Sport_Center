import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';
import { useUserProfile } from '../../../hooks/useUserProfile';

function ScheduleList() {
  const [schedule, setSchedule] = useState<any[]>([]);
  useEffect(() => {
    import('../services/api').then(({ MemberAPI }) => {
      MemberAPI.getMySchedule().then(data => setSchedule(data || [])).catch(console.error);
    });
  }, []);

  if (schedule.length === 0) return <div className="text-slate-400 p-2 text-sm">Chưa có lịch sắp tới</div>;

  return (
    <>
      {schedule.slice(0, 3).map((item, idx) => {
        const d = new Date(item.startTime);
        return (
          <div className="mp-schedule-row" key={idx}>
            <strong>
              {d.toLocaleDateString('vi-VN')} {d.getHours()}:{String(d.getMinutes()).padStart(2, '0')}
            </strong>
            <span>{item.className || item.sportType || 'Lớp học'}</span>
            <span>{item.coachName || 'N/A'}</span>
          </div>
        );
      })}
    </>
  );
}

function StatCards() {
  const [sub, setSub] = useState<any>(null);
  const [metric, setMetric] = useState<any>(null);

  useEffect(() => {
    import('../services/api').then(({ MemberAPI }) => {
      MemberAPI.getMySubscriptions().then(data => {
        if (data && data.length > 0) setSub(data[0]);
      }).catch(console.error);

      MemberAPI.getBodyMetricsHistory().then(data => {
        if (data && data.length > 0) setMetric(data[0]);
      }).catch(console.error);
    });
  }, []);

  const daysLeft = sub ? Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 3600 * 24)) : 0;

  return (
    <div className="mp-stat-grid">
      <div className="mp-stat-card teal">
        <span>Gói hiện tại</span>
        <strong>{sub?.packageName || 'Chưa đăng ký'}</strong>
        <small>{daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết hạn'}</small>
      </div>
      <div className="mp-stat-card green">
        <span>Chuỗi tập</span>
        <strong>-- ngày</strong>
        <small>Kỷ lục -- ngày</small>
      </div>
      <div className="mp-stat-card">
        <span>Cân nặng gần nhất</span>
        <strong>{metric?.weightKg ? `${metric.weightKg} kg` : '--'}</strong>
        <small>{metric?.heightCm ? `${metric.heightCm} cm` : 'Chưa cập nhật'}</small>
      </div>
    </div>
  );
}

export function Overview({
  onNavigate,
}: {
  onNavigate: (page: MemberPage) => void;
}) {
  const { profile } = useUserProfile();
  const userName = profile?.fullName ? profile.fullName.split(' ').pop() : 'Hội viên';

  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<string[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch('/api/schedule/my', {
      headers: { Authorization: `Bearer ${token}` }
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
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    setConversation(current => [...current, cleanMessage]);
    setMessage("");
  }

  return (
    <MemberShell page="overview" onNavigate={onNavigate}>
      <section className="mp-overview-content">
        <div className="mp-page-heading">
          <div>
            <span className="mp-kicker">FLOW 6 • AI ASSISTANT</span>
            <p>Xin chào, {userName} 👋</p>
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
            <StatCards />

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
                <ScheduleList />
              </div>
            </div>

            <div className="mp-card mp-notice-card">
              <strong className="mp-card-label">Thông báo</strong>
              <span>
                Coach đã cập nhật kế hoạch tuần 5 • Gói Premium sẽ gia hạn sau 88 ngày
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
              Chào {userName}! Hôm nay bạn có lớp HIIT lúc 18:30. Mình đề xuất khởi động gối 8 phút trước buổi tập.
            </p>
            <p className="mp-user-message">
              Tôi có thể đổi sang lớp nhẹ hơn không?
            </p>
            <p className="mp-ai-message">
              Có. Yoga Recovery lúc 19:00 còn 6 chỗ và phù hợp với tình trạng đầu gối hôm nay. Bạn muốn mình giữ chỗ?
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
            ].map(suggestion => (
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
                onChange={event => setMessage(event.target.value)}
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
  );
}