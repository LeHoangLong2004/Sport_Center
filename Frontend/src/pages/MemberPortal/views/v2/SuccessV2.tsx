import { Navigate } from "./types";
import { Shell, src } from "./MemberShellV2";

export function Success({ onNavigate, selectedClass }: { onNavigate: Navigate, selectedClass?: any }) {
  const code = selectedClass?.id ? `BK-${selectedClass.id.substring(0, 5).toUpperCase()}` : "BK-20241";
  
  let timeStr = "18:30 - 19:30";
  let dateStr = "Thứ Ba, 24/09/2024";
  
  if (selectedClass?.schedule) {
    const parts = selectedClass.schedule.split(" • ");
    if (parts.length >= 2) {
      dateStr = parts[0];
      const timePart = parts[1]; 
      const tmatch = timePart.match(/(\d{2}:\d{2})/);
      if (tmatch) {
        timeStr = tmatch[1];
      } else {
        timeStr = timePart;
      }
    } else {
      dateStr = selectedClass.schedule;
      timeStr = "";
    }
  }

  return (
    <Shell page="success" onNavigate={onNavigate}>
      <section className="m2-success-content">
        <div className="m2-success-box">
          <span className="m2-success-icon"><img src={src("success", "3cd18.svg")} alt="" /></span>
          <div className="m2-success-copy">
            <strong>Đặt chỗ thành công!</strong>
            <span>Mã số đặt chỗ của bạn đã được ghi nhận trên hệ thống SportCenter.</span>
          </div>
          <div className="m2-ticket">
            <div className="m2-ticket-head"><span>{selectedClass?.title || "Lớp học"}</span><strong>Mã: {code}</strong></div>
            <img className="m2-ticket-line" src={src("success", "88b99.svg")} alt="" />
            <div className="m2-ticket-grid">
              <div><small>HUẤN LUYỆN VIÊN</small><strong>{selectedClass?.coach || "Coach"}</strong></div>
              <div><small>KHU VỰC</small><strong>{selectedClass?.room || "Phòng tập"}</strong></div>
              <div><small>THỜI GIAN</small><strong>{dateStr}</strong></div>
              {timeStr && <div><small>KHUNG GIỜ</small><strong>{timeStr}</strong></div>}
            </div>
            <img className="m2-ticket-line" src={src("success", "88b99.svg")} alt="" />
            <div className="m2-ticket-note">
              <img src={src("success", "e7a6b.svg")} alt="" />
              <span>Lưu ý: Quý khách có thể <strong>Hủy miễn phí trước 16:30</strong> cùng ngày.</span>
            </div>
          </div>
          <div className="m2-success-actions">
            <button onClick={() => onNavigate("schedule")} type="button">Xem lịch tập</button>
            <button onClick={() => onNavigate("classes")} type="button">Đặt thêm lớp</button>
            <button onClick={() => onNavigate("overview")} type="button">Về trang chủ</button>
          </div>
        </div>
      </section>
    </Shell>
  )
}
