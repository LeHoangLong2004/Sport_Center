import { useState, useEffect } from "react";

const assetPathPrefix = "/assets/site/5391";
const imgFeaturedImage = `${assetPathPrefix}/25749.png`;
const imgRectangle = `${assetPathPrefix}/f9c71.png`;
const imgRectangle1 = `${assetPathPrefix}/a787c.png`;
const imgRectangle2 = `${assetPathPrefix}/1437d.png`;
const imgRectangle3 = `${assetPathPrefix}/c0b2a.png`;
const imgRectangle4 = `${assetPathPrefix}/0da36.png`;
const imgRectangle5 = `${assetPathPrefix}/62103.png`;

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

const offerCards = [
  {
    img: imgRectangle,
    badge: "MỚI",
    badgeColor: "bg-[#10b981]",
    title: "Giảm 15% gói tập cặp đôi",
    desc: "Nhân đôi động lực tập luyện cùng người thương hoặc bạn thân tại mọi phòng tập.",
    expiry: "31/12/2026",
  },
  {
    img: imgRectangle1,
    badge: "SẮP HẾT",
    badgeColor: "bg-[#ef4444]",
    title: "Miễn phí 1 tháng Aqua Fitness",
    desc: "Dành riêng cho khách hàng đăng ký sớm nhất trong tuần này gói bơi tiêu chuẩn.",
    expiry: "28/02/2026",
  },
  {
    img: imgRectangle2,
    badge: "MỚI",
    badgeColor: "bg-[#10b981]",
    title: "Tặng 3 buổi PT 1 kèm 1",
    desc: "Thiết lập tư thế chuẩn cùng lộ trình dinh dưỡng đo ni đóng giày cho riêng cơ thể bạn.",
    expiry: "15/03/2026",
  },
  {
    img: imgRectangle3,
    badge: "MỚI",
    badgeColor: "bg-[#10b981]",
    title: "Combo Yoga & Mat Pilates",
    desc: "Rèn dẻo dai kết hợp chỉnh sửa cột sống vóc dáng trọn gói trị liệu chuyên sâu.",
    expiry: "30/04/2026",
  },
  {
    img: imgRectangle4,
    badge: "ƯU ĐÃI",
    badgeColor: "bg-[#2563eb]",
    title: "Học sinh - Sinh viên giảm 20%",
    desc: "Luôn đồng hành cùng năng lượng trẻ, bứt phá thể chất vững vàng vượt qua kỳ thi.",
    expiry: "31/12/2026",
  },
  {
    img: imgRectangle5,
    badge: "SẮP HẾT",
    badgeColor: "bg-[#ef4444]",
    title: "Trải nghiệm Boxing Kickfit 0đ",
    desc: "1 buổi tập thử phản xạ xả stress cường độ cao cùng huấn luyện viên quốc gia.",
    expiry: "10/02/2026",
  },
];

function useCountdown(targetDate: Date) {
  const getTimeLeft = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  });
  return timeLeft;
}

function TimerBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex gap-[4px] items-center">
      <div className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[54px]">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[20px] text-white">
          {String(value).padStart(2, "0")}
        </p>
      </div>
      <p className="font-['Inter:Regular'] font-normal text-[#e0f2fe] text-[12px]">{label}</p>
    </div>
  );
}

export default function UuDaiKhuyenMaiRedesign() {
  const deadline = new Date("2026-10-01T23:59:59");
  const { days, hours, minutes, seconds } = useCountdown(deadline);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0 sticky top-0 z-50">
        <div className="flex gap-[10px] items-center">
          <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[36px]">
            <span className="text-white font-extrabold text-[14px]">⚡</span>
          </div>
          <div className="flex flex-col gap-[2px]">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] leading-none">SPORTCENTER</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[9px] uppercase leading-none">Energy Platform</p>
          </div>
        </div>
        <div className="flex gap-[4px] h-full items-center">
          {navItems.map(([label, active]) => (
            <div key={label} className="flex flex-col h-full items-start justify-center px-[14px] py-[24px] relative cursor-pointer">
              <p className={`text-[15px] whitespace-nowrap ${active ? "font-['Inter:Bold'] font-bold text-[#2563eb]" : "font-['Inter:Medium'] font-medium text-[#1e293b]"}`}>{label}</p>
              {active && <div className="absolute bottom-0 left-[14px] bg-[#2563eb] h-[2px] rounded-[1px] w-[24px]" />}
            </div>
          ))}
        </div>
        <div className="flex gap-[12px] items-center">
          <div className="border border-[#e2e8f0] flex items-center px-[18px] py-[10px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Đăng nhập</p>
          </div>
          <div className="bg-[#10b981] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px]">Đăng ký thành viên</p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#0f172a] flex flex-col gap-[16px] items-start px-[80px] py-[64px] w-full">
        <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px]">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase">CHƯƠNG TRÌNH ƯU ĐÃI THÀNH VIÊN</p>
        </div>
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[44px] text-white leading-[1.2]">Ưu đãi dành riêng cho bạn</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.6] w-[640px]">
          Nhận ngay các ưu đãi đặc quyền từ SportCenter để bắt đầu hành trình bứt phá năng lượng thể chất và tinh thần ngay hôm nay.
        </p>
      </div>

      {/* Featured Promo with Countdown */}
      <div className="flex flex-col items-start pb-[24px] pt-[48px] px-[80px] w-full">
        <div
          className="flex h-[360px] items-center overflow-hidden rounded-[24px] w-full"
          style={{ background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)" }}
        >
          <div className="flex-1 h-full relative">
            <img alt="Ưu đãi nổi bật" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={imgFeaturedImage} />
          </div>
          <div className="flex flex-1 flex-col gap-[24px] h-full items-start justify-center p-[48px]">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="bg-[#ef4444] flex items-center px-[10px] py-[4px] rounded-[4px]">
                <p className="font-['Inter:Bold'] font-bold text-[12px] text-white">GIỚI HẠN</p>
              </div>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[32px] text-white leading-tight">GIẢM 30% GÓI 12 THÁNG</p>
              <p className="font-['Inter:Regular'] font-normal text-[#e0f2fe] text-[16px]">
                Áp dụng cho tất cả các bộ môn: Bơi lội, Yoga, Gym HIIT, Boxing, Bóng rổ.
              </p>
            </div>
            <div className="flex gap-[8px] items-center flex-wrap">
              <TimerBox value={days} label="Ngày" />
              <span className="font-['Inter:Extra_Bold'] font-extrabold text-[20px] text-white">:</span>
              <TimerBox value={hours} label="Giờ" />
              <span className="font-['Inter:Extra_Bold'] font-extrabold text-[20px] text-white">:</span>
              <TimerBox value={minutes} label="Phút" />
              <span className="font-['Inter:Extra_Bold'] font-extrabold text-[20px] text-white">:</span>
              <TimerBox value={seconds} label="Giây" />
            </div>
            <div className="bg-[#10b981] flex items-center px-[32px] py-[14px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Bold'] font-bold text-[15px] text-white">Đăng ký ngay →</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Cards Grid */}
      <div className="flex flex-col gap-[32px] items-start px-[80px] py-[48px] w-full">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">Các chương trình ưu đãi hiện có</p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="grid grid-cols-3 gap-[24px] w-full">
          {offerCards.map((card, i) => (
            <div key={i} className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[16px]">
              <div className="relative h-[180px] w-full">
                <img alt={card.title} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={card.img} />
                <div className={`absolute left-[16px] top-[16px] ${card.badgeColor} flex items-center px-[12px] py-[6px] rounded-[100px]`}>
                  <p className="font-['Inter:Bold'] font-bold text-[12px] text-white">{card.badge}</p>
                </div>
              </div>
              <div className="flex flex-col gap-[16px] items-start p-[24px] w-full">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] w-full">{card.title}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full h-[64px]">{card.desc}</p>
                <div className="border-t border-[#e2e8f0] w-full" />
                <div className="flex items-center justify-between w-full">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[13px]">Hạn dùng: {card.expiry}</p>
                  <div className="bg-[#eff6ff] flex items-center px-[16px] py-[8px] rounded-[8px] cursor-pointer">
                    <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px]">Xem chi tiết</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-white border-t border-b border-[#e2e8f0] flex flex-col gap-[48px] items-start px-[80px] py-[64px] w-full">
        <div className="flex flex-col gap-[8px] items-center w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] text-center">3 bước cực kỳ đơn giản để nhận ưu đãi</p>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        <div className="flex gap-[32px] items-start w-full">
          {[
            { icon: "🔍", num: "01", title: "Chọn ưu đãi của bạn", desc: "Khám phá danh sách và bấm chọn chương trình phù hợp nhất với mục tiêu tập luyện." },
            { icon: "📱", num: "02", title: "Để lại thông tin nhận quà", desc: "Điền số điện thoại hoặc mã ưu đãi để tư vấn viên kích hoạt vé mời của bạn." },
            { icon: "⚡", num: "03", title: "Trải nghiệm dịch vụ thực tế", desc: "Đến cơ sở SportCenter gần nhất để nhận thẻ thành viên và tận hưởng các tiện ích." },
          ].map((step) => (
            <div key={step.num} className="bg-[#f8fafc] flex flex-1 flex-col gap-[20px] items-start p-[32px] rounded-[16px]">
              <div className="flex items-center justify-between w-full">
                <div className="bg-[#eff6ff] flex items-center justify-center rounded-[12px] size-[48px]">
                  <span className="text-[24px]">{step.icon}</span>
                </div>
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#94a3b8] text-[28px]">{step.num}</p>
              </div>
              <div className="flex flex-col gap-[8px] items-start w-full">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px] w-full">{step.title}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.5] w-full">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="flex flex-col items-start px-[80px] py-[64px] w-full">
        <div className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full">
          <div className="flex flex-col gap-[12px] items-start text-center w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[32px] text-white w-full">
              Trải nghiệm tập thử miễn phí 01 buổi bộ môn bạn yêu thích
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] w-full">
              Để lại thông tin, đội ngũ tư vấn sẽ thiết kế buổi trải nghiệm chuẩn quốc tế dành riêng cho bạn.
            </p>
          </div>
          <div className="flex gap-[16px] items-center w-full">
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-start px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">Họ và tên của bạn</p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-start px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">Số điện thoại liên hệ</p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] flex flex-1 items-center justify-between px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-white text-[14px]">Chọn bộ môn muốn thử</p>
              <span className="text-[#94a3b8] text-[12px]">▾</span>
            </div>
            <div className="bg-[#10b981] flex flex-1 items-center justify-center px-[24px] py-[14px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[14px] text-white whitespace-nowrap">Nhận vé tập thử ngay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] items-start w-[360px]">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px]"><span className="text-white font-extrabold text-[16px]">⚡</span></div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[16px]">📱 Hotline: 1900 6868</p>
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">Dịch vụ nổi bật</p>
            {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[200px] text-[14px]">
            <p className="font-['Inter:Bold'] font-bold text-white uppercase">SportCenter</p>
            {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{item}</p>
            ))}
          </div>
          <div className="flex flex-col gap-[16px] items-start w-[320px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh</p>
            <div className="flex gap-[8px] items-center pt-[8px]">
              {["fb", "ig", "yt", "in"].map((s, i) => (
                <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-[8px] size-[36px] cursor-pointer hover:bg-[#10b981] transition-colors">
                  <span className="text-white text-[11px] font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e293b] flex items-center justify-between pt-[32px] w-full">
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">© 2026 SportCenter. All rights reserved.</p>
          <div className="flex gap-[24px] items-center">
            {["Chính sách bảo mật", "Điều khoản sử dụng", "Cookie"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px] cursor-pointer hover:text-white transition-colors">{item}</p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
