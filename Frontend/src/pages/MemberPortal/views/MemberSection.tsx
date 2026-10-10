import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function MemberSection({
  page,
  onNavigate,
}: {
  page: keyof typeof memberSections
  onNavigate: (page: MemberPage) => void
}) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);

  React.useEffect(() => {
    import('../services/api').then(({ MemberAPI }) => {
      if (page === 'payment') {
        MemberAPI.getMySubscriptions().then(data => {
          if (data && data.length > 0) setSub(data[0]);
        }).catch(console.error);
        MemberAPI.getMyInvoices().then(data => setInvoices(data || [])).catch(console.error);
      } else if (page === 'reports') {
        MemberAPI.getMyBookings().then(data => setBookings(data || [])).catch(console.error);
      }
    });
  }, [page]);

  const content = useMemo(() => {
    const base = memberSections[page];
    if (page === 'payment') {
      const daysLeft = sub ? Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 3600 * 24)) : 0;
      return {
        ...base,
        stats: [
          ["Gói hiện tại", sub?.packageName || "Chưa đăng ký", sub ? "Có hiệu lực" : ""],
          ["Ngày hết hạn", sub?.endDate ? sub.endDate.split('T')[0].split('-').reverse().join('/') : "--", daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã hết hạn"],
          ["Trạng thái", (sub?.paymentStatus === 1 || sub?.paymentStatus === 'Completed') && daysLeft > 0 ? 'Đang hoạt động' : 'Không hoạt động', ''],
        ],
        rows: invoices.map(inv => [
          inv.invoiceCode || `HD-${inv.id.substring(0,6)}`,
          inv.description || "Thanh toán gói tập",
          `${(inv.amount || 0).toLocaleString('vi-VN')} đ`
        ])
      };
    }
    
    if (page === 'reports') {
      return {
        ...base,
        stats: [
          ["Buổi tập", `${bookings.length} buổi`, "Tổng cộng"],
          ["Trạng thái", "Đang tích cực", ""],
          ["Hoạt động", "Bình thường", ""],
        ],
        rows: bookings.map(b => {
          const d = new Date(b.schedule?.scheduleTime || b.bookingDate);
          return [
            b.schedule?.className || b.schedule?.sportName || "Lớp học",
            `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`,
            b.status === 0 ? "Đã đặt" : b.status === 1 ? "Hoàn thành" : b.status === 2 ? "Hủy" : "Đã Check-in"
          ];
        })
      };
    }
    return base;
  }, [page, sub, invoices, bookings]);

  return (
    <MemberShell page={page} onNavigate={onNavigate}>
      <section className="mp-overview-content">
        <div className="mp-page-heading">
          <div>
            <span className="mp-kicker">{content.kicker}</span>
            <p>{content.title}</p>
            <small>{content.description}</small>
          </div>
        </div>

        <div className="mp-dashboard-column">
          <div className="mp-stat-grid">
            {content.stats.map(([label, value, detail], index) => (
              <div
                className={`mp-stat-card ${index === 0 ? "teal" : index === 1 ? "green" : ""}`}
                key={label}
              >
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </div>
            ))}
          </div>

          <div className="mp-card">
            <strong className="mp-card-label">
              {page === "users" ? "THÔNG TIN CHI TIẾT" : "HOẠT ĐỘNG GẦN ĐÂY"}
            </strong>
            <div className="mp-schedule-table">
              {content.rows.map(([primary, secondary, meta]) => (
                <div className="mp-schedule-row" key={primary}>
                  <strong>{primary}</strong>
                  <span>{secondary}</span>
                  <span>{meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MemberShell>
  )
}
