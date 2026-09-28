const assetPathPrefix = "/assets/site/5218";
const imgRectangle = `${assetPathPrefix}/de597.png`;
const imgRectangle1 = `${assetPathPrefix}/6b20b.png`;

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

export default function ChiTietTinTucRedesign() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full sticky top-0 z-50">
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
            <div
              key={label}
              className="flex flex-col h-full items-start justify-center px-[14px] py-[24px] relative cursor-pointer"
            >
              <p className={`text-[15px] whitespace-nowrap ${active ? "font-['Inter:Bold'] font-bold text-[#2563eb]" : "font-['Inter:Medium'] font-medium text-[#1e293b]"}`}>
                {label}
              </p>
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

      {/* Breadcrumb */}
      <div className="flex gap-[8px] items-center px-[80px] py-[24px] text-[14px]">
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] cursor-pointer hover:text-[#0f172a] transition-colors">Trang chủ</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8]">&gt;</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] cursor-pointer hover:text-[#0f172a] transition-colors">Tin tức &amp; Sự kiện</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8]">&gt;</p>
        <p className="font-['Inter:Medium'] font-medium text-[#0f172a]">Chi tiết sự kiện bơi lội 2025</p>
      </div>

      {/* Article Layout */}
      <div className="flex gap-[48px] items-start pb-[64px] px-[80px] w-full">
        {/* Main Article */}
        <article className="bg-white flex flex-col gap-[24px] items-start p-[40px] rounded-[16px] shadow-[0px_4px_6px_rgba(0,0,0,0.03)] w-[832px] shrink-0">
          {/* Category tag */}
          <span className="bg-[#fef2f2] font-['Inter:Bold'] font-bold text-[#ef4444] text-[12px] px-[10px] py-[4px] rounded-full">
            GIẢI ĐẤU THƯỜNG NIÊN
          </span>

          {/* Title */}
          <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px] leading-[1.3] w-full">
            Giải Bơi Lội Mùa Hè 2025 tại SportCenter — Cơ hội khẳng định tài năng bứt phá
          </h1>

          {/* Meta: author, date, reading time */}
          <div className="flex gap-[24px] items-center w-full">
            <div className="flex gap-[6px] items-center">
              <span className="text-[#94a3b8] text-[14px]">👤</span>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">Tác giả: Ban Tổ Chức</p>
            </div>
            <div className="flex gap-[6px] items-center">
              <span className="text-[#94a3b8] text-[14px]">📅</span>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">15/06/2025</p>
            </div>
            <div className="flex gap-[6px] items-center">
              <span className="text-[#94a3b8] text-[14px]">🕐</span>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">5 phút đọc</p>
            </div>
          </div>

          {/* Hero image */}
          <div className="h-[400px] w-full overflow-hidden rounded-[12px]">
            <img
              alt="Giải Bơi Lội Mùa Hè 2025"
              className="w-full h-full object-cover"
              src={imgRectangle}
            />
          </div>

          {/* Lead paragraph */}
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[16px] leading-[1.6] w-full">
            Chào đón mùa hè rực lửa, giải bơi lội thường niên SportCenter Aquatics Championship 2025 đã chính thức khởi tranh. Đây là sân chơi thể thao chuyên nghiệp được mong chờ nhất trong năm của toàn bộ hệ sinh thái của chúng tôi.
          </p>

          {/* Body paragraph */}
          <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[15px] leading-[1.6] w-full">
            Với sứ mệnh truyền cảm hứng về lối sống tích cực, bứt phá mọi giới hạn thể chất của bản thân, giải đấu năm nay hứa hẹn mang đến những màn tranh tài nghẹt thở, những cú chạm đích ấn tượng và năng lượng rực cháy từ các vận động viên phong trào tại toàn bộ các chi nhánh.
          </p>

          {/* Section: race categories */}
          <div className="flex flex-col gap-[12px] items-start w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[20px]">
              Thông tin chi tiết về các cự ly tranh tài
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[15px] leading-[1.6]">
              Giải đấu năm nay được chia làm 3 nhóm đối tượng chính với các cự ly được thiết kế phù hợp thể trạng từng nhóm tuổi nhằm đảm bảo tính cạnh tranh lành mạnh và an toàn cao:
            </p>
          </div>

          {/* Race categories list */}
          <div className="bg-[#f8fafc] flex flex-col gap-[12px] items-start p-[20px] rounded-[8px] w-full text-[15px]">
            <p className="text-[#0f172a]">
              <span className="font-['Inter:Bold'] font-bold">• Nhóm trẻ em (U12): </span>
              <span className="font-['Inter:Regular'] font-normal">Tranh tài cự ly 25m Tự do và 25m Bơi ếch.</span>
            </p>
            <p className="text-[#0f172a]">
              <span className="font-['Inter:Bold'] font-bold">• Nhóm phong trào (18-45): </span>
              <span className="font-['Inter:Regular'] font-normal">Tranh tài cự ly 50m Tự do, 50m Bơi ếch và tiếp sức đồng đội 4x50m.</span>
            </p>
            <p className="text-[#0f172a]">
              <span className="font-['Inter:Bold'] font-bold">• Nhóm nâng cao: </span>
              <span className="font-['Inter:Regular'] font-normal">Tranh tài cự ly 100m Tự do cá nhân chọn nhà vô địch bứt phá.</span>
            </p>
          </div>

          {/* Secondary image */}
          <div className="h-[260px] w-full overflow-hidden rounded-[8px]">
            <img
              alt="Hình ảnh giải đấu bơi lội"
              className="w-full h-full object-cover"
              src={imgRectangle1}
            />
          </div>

          {/* Pull quote */}
          <blockquote className="border-l-4 border-[#2563eb] pl-[20px] w-full">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[16px] leading-[1.6]">
              "Bơi lội không chỉ là một môn thể thao tăng chiều cao và cải thiện hệ tim mạch tuyệt vời, đó còn là một kỹ năng sinh tồn thiết yếu mà ai cũng nên sở hữu. Chúng tôi rất tự hào khi thấy sự tiến bộ vượt bậc của học viên qua giải đấu này." — HLV. Alexander Trần chia sẻ.
            </p>
          </blockquote>

          {/* Divider */}
          <div className="border-t border-[#e2e8f0] w-full" />

          {/* Share */}
          <div className="flex gap-[12px] items-center w-full">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#94a3b8] text-[14px]">Chia sẻ bài viết:</p>
            {["Facebook", "Twitter", "Linkedin"].map((platform) => (
              <button
                key={platform}
                className="border border-[#e2e8f0] font-['Inter:Semi_Bold'] font-semibold text-[#334155] text-[13px] px-[16px] py-[6px] rounded-full cursor-pointer hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
              >
                {platform}
              </button>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="flex flex-col gap-[32px] items-start flex-1 min-w-0 pt-0">
          {/* Related articles */}
          <div className="bg-white flex flex-col gap-[20px] items-start p-[24px] rounded-[16px] shadow-[0px_4px_6px_rgba(0,0,0,0.03)] w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px]">Bài viết liên quan</p>
            <div className="flex flex-col gap-[16px] items-start w-full">
              {[
                { title: "Cách tối ưu nhịp thở khi bơi cự ly dài cho người mới", date: "10/06/2025" },
                { title: "Chế độ dinh dưỡng đặc biệt trước ngày thi đấu", date: "08/06/2025" },
                { title: "Trải nghiệm Yoga dưới nước: Thử thách dẻo dai mới", date: "05/06/2025" },
              ].map(({ title, date }) => (
                <div key={title} className="flex flex-col gap-[4px] items-start w-full cursor-pointer group">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[14px] leading-[1.4] group-hover:text-[#2563eb] transition-colors line-clamp-2">
                    {title}
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[12px]">{date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="bg-white flex flex-col gap-[20px] items-start p-[24px] rounded-[16px] shadow-[0px_4px_6px_rgba(0,0,0,0.03)] w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px]">Sự kiện sắp tới</p>
            <div className="flex flex-col gap-[16px] items-start w-full">
              {[
                { title: "Đại hội Kickfit Toàn quốc tại SportCenter", date: "25/07/2025", badge: "Miễn phí" },
                { title: "Workshop: Yoga và hành trình chữa lành cột sống", date: "15/08/2025", badge: "Đăng ký trước" },
              ].map(({ title, date, badge }) => (
                <div key={title} className="bg-[#f8fafc] flex flex-col gap-[8px] items-start p-[12px] rounded-[8px] w-full">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[14px] leading-[1.4] w-full">{title}</p>
                  <div className="flex items-center justify-between w-full text-[12px]">
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8]">{date}</p>
                    <p className="font-['Inter:Bold'] font-bold text-[#2563eb]">{badge}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="bg-[#0f172a] flex flex-col gap-[24px] items-center overflow-hidden p-[32px] rounded-[16px] w-full">
            <div className="flex flex-col gap-[8px] items-center text-center w-full">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] w-full">
                Bắt đầu bứt phá thể chất ngay hôm nay!
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] w-full leading-[1.5]">
                Nhận ngay 01 vé tập thử MIỄN PHÍ bất kỳ bộ môn bơi lội, yoga hay strength chuyên sâu.
              </p>
            </div>
            <button className="bg-[#10b981] flex items-center justify-center px-[24px] py-[12px] rounded-[8px] w-full cursor-pointer hover:bg-[#059669] transition-colors">
              <p className="font-['Inter:Bold'] font-bold text-white text-[14px]">Đăng ký trải nghiệm ngay</p>
            </button>
          </div>
        </aside>
      </div>

      {/* Comment Section */}
      <section className="bg-white flex flex-col gap-[32px] items-start pb-[80px] pt-[64px] px-[80px] w-full">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px]">
          Bình luận &amp; Phản hồi (12)
        </p>

        {/* Comment form */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <textarea
            className="bg-[#f8fafc] border border-[#e2e8f0] font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] h-[80px] p-[16px] rounded-[8px] w-full resize-none placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2563eb] transition-colors"
            placeholder="Nhập ý kiến phản hồi hoặc câu hỏi của bạn tại đây..."
          />
          <button className="bg-[#2563eb] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer hover:bg-[#1d4ed8] transition-colors">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px]">Gửi bình luận</p>
          </button>
        </div>

        {/* Existing comments */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          {[
            {
              name: "Hoàng Minh",
              time: "2 giờ trước",
              text: "Tôi đã đăng ký cự ly 50m bơi ếch. Mong chờ giải đấu bùng nổ năm nay!",
            },
            {
              name: "Phạm Thảo",
              time: "1 ngày trước",
              text: "Hồ bơi bên trung tâm cực kỳ chất lượng, nước mát và lọc muối muối vô cùng mượt da.",
            },
          ].map(({ name, time, text }) => (
            <div key={name} className="bg-[#f8fafc] flex flex-col gap-[8px] items-start p-[16px] rounded-[8px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[14px]">{name}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[12px]">{time}</p>
              </div>
              <p className="font-['Inter:Regular'] font-normal text-[#334155] text-[14px] leading-[1.5] w-full">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-[40px] items-start pb-[48px] pt-[64px] px-[80px] w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] items-start w-[360px]">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#10b981] flex items-center justify-center rounded-[8px] size-[40px]">
                <span className="text-white font-extrabold text-[16px]">⚡</span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">
              Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.
            </p>
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
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
            </p>
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
          <p className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px]">© 2026 SportCenter. Bảo lưu mọi quyền thương hiệu.</p>
          <div className="flex gap-[24px] items-center">
            {["Chính sách bảo mật", "Điều khoản sử dụng"].map((item) => (
              <p key={item} className="font-['Inter:Regular'] font-normal text-[#475569] text-[13px] cursor-pointer hover:text-white transition-colors">{item}</p>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
