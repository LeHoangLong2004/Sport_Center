const A = "/assets"

const imgHero = `${A}/dff04.png`
const imgCoach = `${A}/b76c1.png`
const imgSimilar1 = `${A}/cc0af.png`
const imgSimilar2 = `${A}/a3bc3.png`
const imgSimilar3 = `${A}/880d2.png`
const imgZap = `${A}/92d4d.svg`
const imgInfo = `${A}/9e43a.svg`
const imgCalendar = `${A}/3d7e4.svg`
const imgUser = `${A}/12f02.svg`
const imgClock = `${A}/e0683.svg`
const imgTrendingUp = `${A}/6212b.svg`
const imgUsers = `${A}/4ae3a.svg`
const imgZap1 = `${A}/87505.svg`
const imgPhone = `${A}/1632b.svg`
const imgFacebook = `${A}/6efbf.svg`
const imgInstagram = `${A}/520a2.svg`
const imgYoutube = `${A}/27371.svg`
const imgLinkedin = `${A}/d1c41.svg`

const navItems = [
  { label: "Trang chủ", active: false },
  { label: "Bộ môn", active: false },
  { label: "Lớp học", active: true },
  { label: "Huấn luyện viên", active: false },
  { label: "Gói tập", active: false },
  { label: "Về chúng tôi", active: false },
  { label: "Liên hệ", active: false },
]

const classInfo = [
  { icon: imgCalendar, label: "Thời gian diễn ra", value: "18:30 - Thứ Năm hàng tuần" },
  { icon: imgUser, label: "Huấn luyện viên phụ trách", value: "HLV. Marcus Đặng" },
  { icon: imgClock, label: "Thời lượng buổi tập", value: "60 phút hoạt động" },
  { icon: imgTrendingUp, label: "Độ khó bài tập", value: "Trung cấp - Nâng cao" },
  { icon: imgUsers, label: "Số chỗ trống còn lại", value: "13 / 15 suất tập", green: true },
]

const notes = [
  "Vui lòng mang theo nước cá nhân và khăn lau mồ hôi sạch.",
  "Có mặt trước giờ bắt đầu tập 10-15 phút để khởi động khớp.",
  "Mặc trang phục thể thao co giãn thoải mái, giày thể thao chuyên dụng.",
]

const similarClasses = [
  { img: imgSimilar1, title: "Kettlebell Burn Class", meta: "Thứ Ba - 18:30 • Phòng Studio B" },
  { img: imgSimilar2, title: "Kickboxing Core Intensity", meta: "Thứ Sáu - 19:30 • Khu Boxing" },
  { img: imgSimilar3, title: "Athletic Sprint Conditioning", meta: "Thứ Bảy - 08:30 • Sân Đa Năng" },
]

export default function ClassDetailPage() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen" data-node-id="2263:3795">
      {/* Navbar */}
      <nav
        className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0"
        data-node-id="2263:3796"
        data-name="navbar"
      >
        <div className="flex gap-2.5 items-center cursor-pointer" data-name="logo-group">
          <div className="bg-[#10b981] flex items-center justify-center rounded-lg size-9 shrink-0">
            <img src={imgZap} alt="" className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-none">SPORTCENTER</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[9px] uppercase leading-none">Energy Platform</p>
          </div>
        </div>
        <div className="flex gap-2 h-full items-center" data-name="menu-items">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col h-full items-start justify-center px-4 py-6 cursor-pointer"
              data-name={`menu-item-${item.label}`}
            >
              <p className={`whitespace-nowrap text-[15px] leading-normal ${item.active ? "font-['Inter:Bold'] font-bold text-[#2563eb]" : "font-['Inter:Medium'] font-medium text-[#1e293b]"}`}>
                {item.label}
              </p>
              {item.active && <div className="bg-[#2563eb] h-0.5 rounded-sm w-6 mt-1" />}
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center" data-name="navbar-actions">
          <button className="border border-[#e2e8f0] px-[18px] py-2.5 rounded-lg" type="button" data-name="btn-login">
            <span className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px] whitespace-nowrap">Đăng nhập</span>
          </button>
          <button className="bg-[#10b981] px-5 py-2.5 rounded-lg" type="button" data-name="btn-register">
            <span className="font-['Inter:Bold'] font-bold text-white text-[14px] whitespace-nowrap">Đăng ký thành viên</span>
          </button>
        </div>
      </nav>

      {/* Content body */}
      <div className="flex flex-col gap-8 py-10 px-[80px] w-full" data-node-id="2263:3826" data-name="content-body">
        {/* Breadcrumb */}
        <div className="flex gap-2 items-center text-[14px]" data-node-id="2263:3827">
          <span className="font-['Inter:Medium'] font-medium text-[#64748b] cursor-pointer hover:text-[#1e293b] transition-colors" data-name="breadcrumb-home">Trang chủ</span>
          <span className="font-['Inter:Medium'] font-medium text-[#64748b]">&gt;</span>
          <span className="font-['Inter:Medium'] font-medium text-[#64748b] cursor-pointer hover:text-[#1e293b] transition-colors" data-name="breadcrumb-lophoc">Lớp học</span>
          <span className="font-['Inter:Medium'] font-medium text-[#64748b]">&gt;</span>
          <span className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b]">Functional HIIT</span>
        </div>

        {/* Main two-column layout */}
        <div className="flex gap-12 items-start w-full" data-node-id="2263:3833">
          {/* Left column */}
          <div className="flex-1 min-w-0 flex flex-col gap-8" data-node-id="2263:3834">
            {/* Hero image */}
            <div className="w-full h-[420px] rounded-2xl overflow-hidden shrink-0">
              <img src={imgHero} alt="Functional HIIT Performance" className="w-full h-full object-cover" />
            </div>

            {/* Title + description */}
            <div className="flex flex-col gap-4 w-full" data-node-id="2263:3836">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[36px] leading-normal">
                Functional HIIT Performance
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] leading-[1.6]">
                Lớp tập cường độ cao luân phiên sử dụng tạ tay, dây kháng lực và bóng y học. Đây là giáo án tối ưu nhất giúp đẩy nhịp tim lên vùng đốt mỡ tối đa, tăng hiệu suất hoạt động phổi và phục hồi năng lượng thể lực hiệu quả.
              </p>
            </div>

            {/* Notes card */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-5 w-full" data-node-id="2263:3839">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-normal">
                Lưu ý &amp; Chuẩn bị trước buổi tập
              </p>
              <div className="flex flex-col gap-3 w-full">
                {notes.map((note, i) => (
                  <div key={i} className="flex gap-2.5 items-center">
                    <img src={imgInfo} alt="" className="w-[13px] h-[13px] shrink-0" />
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-normal">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="shrink-0 w-[400px]" data-node-id="2263:3857">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 shadow-[0_4px_6px_rgba(0,0,0,0.02)]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] leading-normal">
                Thông tin lớp học
              </p>
              <div className="w-full h-px bg-[#e2e8f0]" />
              <div className="flex flex-col gap-4 w-full">
                {classInfo.map((info, i) => (
                  <div key={i} className="flex gap-3 items-center w-full">
                    <div className="flex items-center justify-center shrink-0 size-5">
                      <img src={info.icon} alt="" className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[12px] leading-normal">{info.label}</p>
                      <p className={`font-['Inter:Bold'] font-bold text-[15px] leading-normal ${(info as { green?: boolean }).green ? "text-[#059669]" : "text-[#1e293b]"}`}>
                        {info.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="bg-[#10b981] flex items-center justify-center px-6 py-3.5 rounded-lg w-full hover:bg-[#059669] transition-colors"
                type="button"
                data-name="btn-register-class"
              >
                <span className="font-['Inter:Bold'] font-bold text-white text-[15px] whitespace-nowrap">Đăng ký lớp này ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coach profile */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 w-full" data-node-id="2263:3899" data-name="coach-profile">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] leading-normal">
            Thông tin Huấn luyện viên của bạn
          </p>
          <div className="w-full h-px bg-[#e2e8f0]" />
          <div className="flex gap-6 items-center w-full">
            <div className="shrink-0 size-[120px] rounded-full overflow-hidden">
              <img src={imgCoach} alt="HLV. Marcus Đặng" className="w-full h-full object-cover" width="120" height="120" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] leading-normal whitespace-nowrap">
                HLV. Marcus Đặng
              </p>
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px] leading-normal whitespace-nowrap">
                Strength &amp; HIIT Performance Coach
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6]">
                Marcus có hơn 8 năm giảng dạy các phương pháp rèn luyện thể chất toàn diện tại các câu lạc bộ thể thao cao cấp. Sở hữu chứng nhận huấn luyện viên cá nhân uy tín từ NASM-CPT Hoa Kỳ và bằng cử nhân giáo dục thể chất.
              </p>
            </div>
          </div>
        </div>

        {/* Similar classes */}
        <div className="flex flex-col gap-6 w-full" data-node-id="2263:3908" data-name="similar-classes">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[24px] leading-normal">
            Các lớp học tương tự gợi ý
          </p>
          <div className="flex gap-6 items-start w-full">
            {similarClasses.map((sc, i) => (
              <div
                key={i}
                className="flex-1 min-w-0 bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition-shadow"
                data-name="similar-class-card"
              >
                <div className="w-full h-[160px] overflow-hidden">
                  <img src={sc.img} alt={sc.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[16px] leading-normal whitespace-nowrap">
                    {sc.title}
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-normal whitespace-nowrap">
                    {sc.meta}
                  </p>
                  <div className="flex gap-1 items-center">
                    <span className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px]">Xem chi tiết</span>
                    <span className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px]">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-10 pb-12 pt-16 px-[80px] w-full" data-node-id="2263:3935" data-name="footer">
        <div className="flex items-start justify-between w-full gap-8 flex-wrap">
          <div className="flex flex-col gap-6 max-w-[360px]">
            <div className="flex gap-2.5 items-center cursor-pointer" data-name="logo-group-footer">
              <div className="bg-[#10b981] flex items-center justify-center rounded-lg size-10 shrink-0">
                <img src={imgZap1} alt="" className="w-[19px] h-[19px]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase leading-none">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">
              Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.
            </p>
            <div className="flex gap-2 items-center">
              <img src={imgPhone} alt="" className="w-[13px] h-[13px]" />
              <p className="font-['Inter:Bold'] font-bold text-white text-[16px] whitespace-nowrap">Hotline: 1900 6868</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-[200px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Dịch vụ nổi bật</p>
            {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((s) => (
              <p key={s} className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{s}</p>
            ))}
          </div>
          <div className="flex flex-col gap-4 w-[200px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">SportCenter</p>
            {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((s) => (
              <p key={s} className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{s}</p>
            ))}
          </div>
          <div className="flex flex-col gap-4 max-w-[320px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
            </p>
            <div className="flex gap-3 pt-2">
              {[imgFacebook, imgInstagram, imgYoutube, imgLinkedin].map((icon, i) => (
                <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-lg size-9">
                  <img src={icon} alt="" className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-[#1e293b]" />
        <div className="flex items-center justify-between w-full flex-wrap gap-4" data-name="policy-links">
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
            © 2026 SportCenter. Bảo lưu mọi quyền thương hiệu.
          </p>
          <div className="flex gap-6">
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] cursor-pointer hover:text-white transition-colors">Chính sách bảo mật</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] cursor-pointer hover:text-white transition-colors">Điều khoản sử dụng</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
