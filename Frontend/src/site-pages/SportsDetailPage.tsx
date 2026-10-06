const assetPathPrefix = "/assets";

const imgHero = `${assetPathPrefix}/7badb.png`;
const imgPool = `${assetPathPrefix}/ea32c.png`;
const imgCoach1 = `${assetPathPrefix}/8887e.png`;
const imgCoach2 = `${assetPathPrefix}/23c27.png`;
const imgCoach3 = `${assetPathPrefix}/0284f.png`;
const imgAvatar1 = `${assetPathPrefix}/1449a.png`;
const imgAvatar2 = `${assetPathPrefix}/231b8.png`;
const imgAvatar3 = `${assetPathPrefix}/d7502.png`;
const imgZap = `${assetPathPrefix}/92d4d.svg`;
const imgCheck = `${assetPathPrefix}/c13a7.svg`;
const imgStar = `${assetPathPrefix}/a608c.svg`;
const imgZapFooter = `${assetPathPrefix}/87505.svg`;
const imgPhone = `${assetPathPrefix}/1632b.svg`;
const imgFacebook = `${assetPathPrefix}/6efbf.svg`;
const imgInstagram = `${assetPathPrefix}/520a2.svg`;
const imgYoutube = `${assetPathPrefix}/27371.svg`;
const imgLinkedin = `${assetPathPrefix}/d1c41.svg`;

const navItems = [
  "Trang chủ",
  "Bộ môn",
  "Lớp học",
  "Huấn luyện viên",
  "Gói tập",
  "Về chúng tôi",
  "Liên hệ",
];

const schedule = [
  {
    time: "Thứ Ba - 08:00 - 09:30",
    name: "Aqua Basic Therapy",
    coach: "HLV. Alexander Trần",
    room: "Hồ Bơi Lớn A",
    slots: "Còn 5 chỗ trống",
    full: false,
  },
  {
    time: "Thứ Năm - 18:30 - 20:00",
    name: "Aqua HIIT Power",
    coach: "HLV. Alexander Trần",
    room: "Hồ Bơi Lớn B",
    slots: "Còn 8 chỗ trống",
    full: false,
  },
  {
    time: "Thứ Bảy - 09:00 - 10:30",
    name: "Olympic Performance swim",
    coach: "HLV. Minh Thư",
    room: "Hồ Bơi Lớn A",
    slots: "Lớp đã đầy",
    full: true,
  },
];

const coaches = [
  {
    img: imgCoach1,
    name: "HLV. Alexander Trần",
    spec: "Bơi lội & Trị liệu Aqua",
    desc: "Chứng chỉ Cứu hộ Quốc tế ILS, 10 năm kinh nghiệm dẫn dắt đội tuyển trẻ quốc gia.",
  },
  {
    img: imgCoach2,
    name: "HLV. Nguyễn Hà Anh",
    spec: "Huấn luyện viên bơi bướm",
    desc: "Kiện tướng quốc gia môn Bơi lội, giàu sư phạm kỹ thuật cho trẻ em và người mới.",
  },
  {
    img: imgCoach3,
    name: "HLV. Marcus Đặng",
    spec: "Aqua Athletic Performance",
    desc: "Chuyên gia sức bền tim mạch, xây dựng bài tập đốt mỡ và hồi phục chấn thương.",
  },
];

const roadmap = [
  {
    level: "CƠ BẢN",
    period: "Tháng thứ 1-2",
    title: "Nhập môn & Kỹ thuật nổi",
    desc: "Học viên làm quen nước, kiểm soát nhịp thở, học các động tác đập chân cơ bản của bơi sải.",
  },
  {
    level: "TRUNG CẤP",
    period: "Tháng thứ 3-4",
    title: "Kỹ thuật thở & Hoàn thiện sải",
    desc: "Kết hợp thở nhịp nhàng, tối ưu sải tay, bơi liên tục 50m không mất sức.",
  },
  {
    level: "NÂNG CAO",
    period: "Tháng thứ 5 trở đi",
    title: "Aqua HIIT & Bơi tốc độ",
    desc: "Rèn luyện sức bền tim mạch nâng cao kết hợp các bài tập tạ dưới nước củng cố cơ lõi.",
  },
];

const testimonials = [
  {
    avatar: imgAvatar1,
    name: "Quốc Hùng, 34 tuổi",
    text: '"Hồ bơi ở đây cực kỳ sạch, không hề có mùi Clo khó chịu. HLV Alexander hướng dẫn rất tận tình, nhờ vậy tôi đã sửa được dáng sải sau 1 tháng tập."',
  },
  {
    avatar: imgAvatar2,
    name: "Phương Linh, 28 tuổi",
    text: '"Lớp Aqua Fitness thực sự rất vui và hiệu quả. Vừa đốt calo cực đã, vừa giải tỏa áp lực công việc hàng ngày vô cùng sảng khoái."',
  },
  {
    avatar: imgAvatar3,
    name: "Minh Anh, 22 tuổi",
    text: '"Hồ bơi tiêu chuẩn chất lượng Olympic. Phòng tắm, tủ locker sạch sẽ và hiện đại. Điểm cộng lớn cho dịch vụ chăm sóc khách hàng ở đây."',
  },
];



function StarRow() {
  return (
    <div className="flex gap-[4px] items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-center size-[16px]">
          <img alt="" src={imgStar} style={{ width: 13, height: 13 }} />
        </div>
      ))}
    </div>
  );
}



export default function ChiTietBoMonPage() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">

      {/* Hero */}
      <div className="relative flex flex-col gap-[24px] items-start px-[80px] py-[64px] w-full shrink-0 min-h-[320px]">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute inset-0 object-cover size-full max-w-none" src={imgHero} />
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.85)]" />
        </div>
        <div className="relative flex gap-[8px] items-center text-[14px]">
          <p className="font-['Inter:Medium'] font-medium text-[#94a3b8]">Trang chủ</p>
          <p className="font-['Inter:Medium'] font-medium text-[#94a3b8]">{`>`}</p>
          <p className="font-['Inter:Medium'] font-medium text-[#94a3b8]">Bộ môn</p>
          <p className="font-['Inter:Medium'] font-medium text-[#94a3b8]">{`>`}</p>
          <p className="font-['Inter:Semi_Bold'] font-semibold text-white">Bơi lội & Aqua Fitness</p>
        </div>
        <div className="relative flex items-center">
          <div className="bg-[#10b981] flex items-center px-[14px] py-[6px] rounded-[100px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[12px] whitespace-nowrap">ĐANG MỞ ĐĂNG KÝ</p>
          </div>
        </div>
        <p className="relative font-['Inter:Extra_Bold'] font-extrabold text-white text-[48px] leading-normal whitespace-nowrap">
          Bơi lội & Aqua Fitness
        </p>
        <p className="relative font-['Inter:Regular'] font-normal text-[#94a3b8] text-[18px] leading-[1.6] max-w-[680px]">
          Hệ sinh thái bơi lội tiêu chuẩn Olympic, kết hợp các phương pháp phục hồi chức năng thể chất và nâng cao hiệu suất tim mạch dưới nước.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white flex gap-[64px] items-center p-[80px] w-full shrink-0">
        <div className="relative h-[400px] rounded-[16px] shrink-0 w-[600px] overflow-hidden">
          <img alt="Hồ bơi SportCenter" className="absolute inset-0 object-cover size-full max-w-none rounded-[16px]" src={imgPool} />
        </div>
        <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[32px] w-full">
            Tại sao nên chọn Bơi lội tại SportCenter?
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] leading-[1.6] w-full">
            Sở hữu hồ bơi vô cực rộng 50m tiêu chuẩn quốc tế, trang bị hệ thống lọc nước ozone không sử dụng hóa chất độc hại, thân thiện tuyệt đối với làn da và hệ hô hấp của học viên.
          </p>
          <div className="flex flex-col gap-[16px] items-start w-full">
            {[
              "Nâng cao thể lực tim mạch vượt trội",
              "Phương pháp an toàn không gây tổn thương xương khớp",
              "Giáo án cá nhân hóa theo mục tiêu từng học viên",
            ].map((point) => (
              <div key={point} className="flex gap-[12px] items-center w-full">
                <div className="bg-[rgba(37,99,235,0.1)] flex items-center justify-center rounded-[12px] size-[24px] shrink-0">
                  <img alt="" src={imgCheck} style={{ width: 11, height: 11 }} />
                </div>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[15px] whitespace-nowrap">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-[#f8fafc] flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[28px]">Lịch lớp bơi lội tuần này</p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px]">
            Vui lòng xem và đăng ký suất tập sớm để đảm bảo vị trí lớp học.
          </p>
        </div>
        <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-clip rounded-[12px] w-full">
          {/* Header */}
          <div className="bg-[#1e293b] flex gap-[20px] items-start p-[18px] w-full">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] w-[180px]">Thời gian</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] w-[220px]">Lớp học</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] w-[200px]">Huấn luyện viên</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] w-[180px]">Phòng tập / Hồ</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] w-[150px]">Suất trống</p>
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] flex-1 text-right">Đăng ký</p>
          </div>
          {/* Rows */}
          {schedule.map((row, i) => (
            <div key={i} className={`flex gap-[20px] items-center p-[18px] w-full ${i < schedule.length - 1 ? "border-b border-[#e2e8f0]" : ""}`}>
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px] w-[180px]">{row.time}</p>
              <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px] w-[220px]">{row.name}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[14px] w-[200px]">{row.coach}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] w-[180px]">{row.room}</p>
              <p className={`font-['Inter:Semi_Bold'] font-semibold text-[14px] w-[150px] ${row.full ? "text-[#64748b]" : "text-[#059669]"}`}>{row.slots}</p>
              <div className="flex flex-1 items-start justify-end">
                <div
                  className={`flex items-center px-[16px] py-[8px] rounded-[6px] cursor-pointer ${row.full ? "bg-[#94a3b8]" : "bg-[#10b981]"}`}
                  data-name={row.full ? "" : "btn-register-class"}
                >
                  <p className="font-['Inter:Bold'] font-bold text-white text-[13px] whitespace-nowrap">
                    {row.full ? "Đầy chỗ" : "Đăng ký ngay"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaches */}
      <div className="bg-white flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[28px]">Chuyên gia dẫn dắt lớp bơi lội</p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px]">
            Đội ngũ HLV chuyên môn cao với bằng cấp sư phạm thể chất và chứng nhận cứu hộ quốc tế.
          </p>
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {coaches.map((c) => (
            <div key={c.name} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-clip rounded-[16px]">
              <div className="relative h-[260px] w-full shrink-0">
                <img alt={c.name} className="absolute inset-0 object-cover size-full max-w-none" src={c.img} />
              </div>
              <div className="flex flex-col gap-[12px] items-start p-[20px] w-full">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] whitespace-nowrap">{c.name}</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px] whitespace-nowrap">{c.spec}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-[1.4] w-full">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-[#f8fafc] flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[28px]">Lộ trình rèn luyện bơi lội bài bản</p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px]">
            Các bài học được cấu trúc khoa học từ dễ đến khó để bạn yên tâm tiến bộ.
          </p>
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {roadmap.map((r) => (
            <div key={r.level} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[32px] rounded-[16px]">
              <div className="flex gap-[12px] items-center">
                <div className="bg-[rgba(37,99,235,0.1)] flex items-center px-[12px] py-[4px] rounded-[100px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[12px] whitespace-nowrap">{r.level}</p>
                </div>
                <p className="font-['Inter:Medium'] font-medium text-[#64748b] text-[14px] whitespace-nowrap">{r.period}</p>
              </div>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] w-full">{r.title}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] w-full">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[28px]">Đánh giá thực tế từ học viên</p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px]">
            Cùng nghe câu chuyện thành công của các hội viên bơi lội tại trung tâm.
          </p>
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[32px] rounded-[16px] shadow-[0px_4px_6px_rgba(0,0,0,0.02)]">
              <StarRow />
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">{t.text}</p>
              <div className="flex gap-[12px] items-center">
                <div className="relative size-[40px] shrink-0">
                  <img alt={t.name} className="absolute inset-0 size-full max-w-none rounded-full object-cover" src={t.avatar} width="40" height="40" />
                </div>
                <p className="font-['Inter:Bold'] font-bold text-[#1e293b] text-[15px] whitespace-nowrap">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0f172a] flex flex-col gap-[24px] items-center p-[80px] w-full shrink-0">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] text-center whitespace-nowrap">
          Trải nghiệm tập thử Bơi lội miễn phí 01 buổi hôm nay!
        </p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] text-center whitespace-nowrap">
          Đăng ký để nhận tư vấn lịch hẹn và kiểm tra thể trạng miễn phí từ HLV.
        </p>
        <div className="bg-[#10b981] flex items-center px-[32px] py-[14px] rounded-[8px] cursor-pointer" data-name="btn-submit">
          <p className="font-['Inter:Bold'] font-bold text-white text-[15px] whitespace-nowrap">Nhận vé tập thử ngay</p>
        </div>
      </div>

    </div>
  );
}
