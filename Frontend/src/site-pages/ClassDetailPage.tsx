import { useState, useEffect } from "react";
import { FadeIn, FadeUp } from "../components/Motion";

const A = "/assets";
const imgHeroDefault = `${A}/dff04.png`;
const imgCoachDefault = `${A}/b76c1.png`;
const imgInfo = `${A}/9e43a.svg`;
const imgCalendar = `${A}/3d7e4.svg`;
const imgUser = `${A}/12f02.svg`;
const imgClock = `${A}/e0683.svg`;
const imgTrendingUp = `${A}/6212b.svg`;
const imgUsers = `${A}/4ae3a.svg`;
const imgMapPin = `${A}/b6ae5.svg`;

const defaultNotes = [
  "Vui lòng mang theo nước cá nhân và khăn lau mồ hôi sạch.",
  "Có mặt trước giờ bắt đầu tập 10-15 phút để khởi động khớp.",
  "Mặc trang phục thể thao co giãn thoải mái, giày thể thao chuyên dụng.",
];

function getRequestedClassId(): string {
  const query = window.location.hash.split("?")[1] || "";
  return new URLSearchParams(query).get("classId") || "";
}

function formatSchedule(isoString?: string, duration = 60) {
  try {
    if (!isoString) return "Lịch chưa cập nhật";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "Lịch chưa cập nhật";
    const dayNames = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const day = dayNames[d.getDay()];
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const endD = new Date(d.getTime() + duration * 60_000);
    const endH = endD.getHours().toString().padStart(2, "0");
    const endM = endD.getMinutes().toString().padStart(2, "0");
    const dateFormatted = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${hours}:${minutes} - ${endH}:${endM} (${day}, ${dateFormatted})`;
  } catch {
    return isoString || "Lịch chưa cập nhật";
  }
}

function getClassHeroImage(
  className?: string,
  sportName?: string,
  imageUrl?: string | null,
): string {
  if (imageUrl && !imageUrl.includes("undefined")) return imageUrl;
  const text = `${className || ""} ${sportName || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (text.includes("boi") || text.includes("swim")) return "/assets/cfb22.png";
  if (text.includes("yoga")) return "/assets/88bba.png";
  if (text.includes("gym") || text.includes("the hinh") || text.includes("hiit"))
    return "/assets/e865e.png";
  if (text.includes("box")) return "/assets/252a5.png";
  if (text.includes("bong ro") || text.includes("basket"))
    return "/assets/3c386.png";
  if (text.includes("cau long") || text.includes("badminton"))
    return "/assets/images/hero_bg.jpg";
  return imgHeroDefault;
}

export default function ClassDetailPage() {
  const [classData, setClassData] = useState<any | null>(null);
  const [similarClasses, setSimilarClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/classes/available");
      if (!res.ok) throw new Error("Không thể tải thông tin lớp học.");
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("Hiện chưa có lớp học nào khả dụng trong hệ thống.");
      }

      const currentId = getRequestedClassId();
      const current =
        list.find((item: any) => item.id === currentId) || list[0];
      setClassData(current);

      const others = list
        .filter((item: any) => item.id !== current.id)
        .slice(0, 3);
      setSimilarClasses(others);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleHash = () => {
      loadData();
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#f8fafc] flex items-center justify-center w-full min-h-[500px]">
        <p className="text-[#64748b] text-[16px] font-medium">
          Đang tải thông tin chi tiết lớp học...
        </p>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="bg-[#f8fafc] flex flex-col items-center justify-center w-full min-h-[500px] gap-4">
        <p className="text-[#dc2626] text-[16px] font-semibold">
          {error || "Không tìm thấy lớp học."}
        </p>
        <button
          onClick={() => {
            window.location.hash = "#lophoc";
          }}
          className="bg-[#2563eb] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1d4ed8] transition"
        >
          Quay lại danh sách lớp học
        </button>
      </div>
    );
  }

  const duration = classData.durationMinutes || 60;
  const availableSpots =
    classData.availableSpots !== undefined
      ? classData.availableSpots
      : Math.max(0, (classData.capacity || 20) - (classData.currentEnrolled || 0));
  const capacity = classData.capacity || 20;
  const isAvailable = availableSpots > 0;
  const heroImg = getClassHeroImage(
    classData.className,
    classData.sportName,
    classData.imageUrl,
  );
  const coachName = classData.coachName || "Huấn luyện viên phụ trách";
  const coachAvatar = classData.coachAvatar || imgCoachDefault;
  const coachSpecialty =
    classData.coachSpecialty || `${classData.sportName || "Thể thao"} Specialist`;
  const coachBio =
    classData.coachBio ||
    `${coachName} có nhiều năm kinh nghiệm huấn luyện chuyên sâu môn ${classData.sportName || "thể thao"} tại SportCenter, sở hữu các chứng nhận huấn luyện viên uy tín và phương pháp rèn luyện khoa học, an toàn.`;

  const classInfoItems = [
    {
      icon: imgCalendar,
      label: "Thời gian diễn ra",
      value: formatSchedule(classData.scheduleTime, duration),
    },
    {
      icon: imgUser,
      label: "Huấn luyện viên phụ trách",
      value: coachName,
    },
    {
      icon: imgMapPin,
      label: "Phòng tập & Cơ sở",
      value: classData.facilityName || "Khu vực tập luyện SportCenter",
    },
    {
      icon: imgClock,
      label: "Thời lượng buổi tập",
      value: `${duration} phút hoạt động`,
    },
    {
      icon: imgTrendingUp,
      label: "Bộ môn",
      value: classData.sportName || "Group-X",
    },
    {
      icon: imgUsers,
      label: "Số chỗ trống còn lại",
      value: isAvailable
        ? `${availableSpots} / ${capacity} suất tập`
        : "Đã hết chỗ",
      green: isAvailable,
    },
  ];

  const handleBooking = () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (token && (user.role?.toLowerCase() === "member" || !user.role)) {
        window.location.hash = "#member";
      } else {
        window.location.hash = "#admin";
      }
    } catch {
      window.location.hash = "#admin";
    }
  };

  return (
    <div
      className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen"
      data-node-id="2263:3795"
    >
      {/* Content body */}
      <div
        className="flex flex-col gap-8 py-10 px-[80px] w-full"
        data-node-id="2263:3826"
        data-name="content-body"
      >
        {/* Breadcrumb */}
        <div
          className="flex gap-2 items-center text-[14px]"
          data-node-id="2263:3827"
        >
          <span
            onClick={() => {
              window.location.hash = "#home";
            }}
            className="font-['Inter:Medium'] font-medium text-[#64748b] cursor-pointer hover:text-[#1e293b] transition-colors"
            data-name="breadcrumb-home"
          >
            Trang chủ
          </span>
          <span className="font-['Inter:Medium'] font-medium text-[#64748b]">
            &gt;
          </span>
          <span
            onClick={() => {
              window.location.hash = "#lophoc";
            }}
            className="font-['Inter:Medium'] font-medium text-[#64748b] cursor-pointer hover:text-[#1e293b] transition-colors"
            data-name="breadcrumb-lophoc"
          >
            Lớp học
          </span>
          <span className="font-['Inter:Medium'] font-medium text-[#64748b]">
            &gt;
          </span>
          <span className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b]">
            {classData.className}
          </span>
        </div>

        {/* Main two-column layout */}
        <div
          className="flex gap-12 items-start w-full"
          data-node-id="2263:3833"
        >
          {/* Left column */}
          <div
            className="flex-1 min-w-0 flex flex-col gap-8"
            data-node-id="2263:3834"
          >
            {/* Hero image */}
            <div className="w-full h-[420px] rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 shadow-sm">
              <img
                src={heroImg}
                alt={classData.className}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = imgHeroDefault;
                }}
              />
              <div className="absolute top-4 left-4 bg-[#10b981] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase">
                {classData.sportName || "Lớp học"}
              </div>
            </div>

            {/* Title + description */}
            <div
              className="flex flex-col gap-4 w-full"
              data-node-id="2263:3836"
            >
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[36px] leading-normal">
                {classData.className}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] leading-[1.6]">
                Lớp học{" "}
                <strong className="text-slate-800 font-semibold">
                  {classData.className}
                </strong>{" "}
                thuộc bộ môn{" "}
                <strong className="text-slate-800 font-semibold">
                  {classData.sportName}
                </strong>
                , được giảng dạy trực tiếp bởi{" "}
                <strong className="text-slate-800 font-semibold">
                  {coachName}
                </strong>{" "}
                tại cơ sở{" "}
                <strong className="text-slate-800 font-semibold">
                  {classData.facilityName}
                </strong>
                . Giáo án được xây dựng khoa học nhằm nâng cao sức khỏe, tối ưu
                hiệu suất chuyển động và đem lại trải nghiệm luyện tập sôi nổi,
                tràn đầy năng lượng.
              </p>
            </div>

            {/* Notes card */}
            <div
              className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-5 w-full shadow-sm"
              data-node-id="2263:3839"
            >
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-normal">
                Lưu ý &amp; Chuẩn bị trước buổi tập
              </p>
              <div className="flex flex-col gap-3 w-full">
                {defaultNotes.map((note, i) => (
                  <div key={i} className="flex gap-2.5 items-center">
                    <img
                      src={imgInfo}
                      alt=""
                      className="w-[13px] h-[13px] shrink-0"
                    />
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-normal">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="shrink-0 w-[400px]" data-node-id="2263:3857">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 shadow-[0_4px_6px_rgba(0,0,0,0.02)] sticky top-6">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] leading-normal">
                Thông tin lớp học
              </p>
              <div className="w-full h-px bg-[#e2e8f0]" />
              <div className="flex flex-col gap-4 w-full">
                {classInfoItems.map((info, i) => (
                  <div key={i} className="flex gap-3 items-center w-full">
                    <div className="flex items-center justify-center shrink-0 size-5">
                      <img src={info.icon} alt="" className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[12px] leading-normal">
                        {info.label}
                      </p>
                      <p
                        className={`font-['Inter:Bold'] font-bold text-[15px] leading-normal ${
                          info.green ? "text-[#059669]" : "text-[#1e293b]"
                        }`}
                      >
                        {info.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {isAvailable ? (
                <button
                  onClick={handleBooking}
                  className="bg-[#10b981] flex items-center justify-center px-6 py-3.5 rounded-lg w-full hover:bg-[#059669] transition-colors shadow-md shadow-emerald-500/10 cursor-pointer"
                  type="button"
                  data-name="btn-register-class"
                >
                  <span className="font-['Inter:Bold'] font-bold text-white text-[15px] whitespace-nowrap">
                    Đăng ký lớp này ngay
                  </span>
                </button>
              ) : (
                <button
                  disabled
                  className="bg-[#94a3b8] flex items-center justify-center px-6 py-3.5 rounded-lg w-full cursor-not-allowed"
                  type="button"
                >
                  <span className="font-['Inter:Bold'] font-bold text-white text-[15px] whitespace-nowrap">
                    Lớp đã kín chỗ
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coach profile */}
        <div
          className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 w-full shadow-sm"
          data-node-id="2263:3899"
          data-name="coach-profile"
        >
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] leading-normal">
            Thông tin Huấn luyện viên của bạn
          </p>
          <div className="w-full h-px bg-[#e2e8f0]" />
          <div className="flex gap-6 items-center w-full">
            <div className="shrink-0 size-[120px] rounded-full overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={coachAvatar}
                alt={coachName}
                className="w-full h-full object-cover"
                width="120"
                height="120"
                onError={(e) => {
                  e.currentTarget.src = imgCoachDefault;
                }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[20px] leading-normal whitespace-nowrap">
                {coachName}
              </p>
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px] leading-normal whitespace-nowrap">
                {coachSpecialty}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6]">
                {coachBio}
              </p>
            </div>
          </div>
        </div>

        {/* Similar classes */}
        {similarClasses.length > 0 && (
          <div
            className="flex flex-col gap-6 w-full"
            data-node-id="2263:3908"
            data-name="similar-classes"
          >
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[24px] leading-normal">
              Các lớp học tương tự gợi ý
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {similarClasses.map((sc) => {
                const scImg = getClassHeroImage(
                  sc.className,
                  sc.sportName,
                  sc.imageUrl,
                );
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      window.location.hash = `#chitietlophoc?classId=${sc.id}`;
                    }}
                    className="flex-1 min-w-0 bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:border-[#10b981] transition-all group"
                    data-name="similar-class-card"
                    data-class-id={sc.id}
                  >
                    <div className="w-full h-[160px] overflow-hidden relative bg-slate-100">
                      <img
                        src={scImg}
                        alt={sc.className}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = imgHeroDefault;
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {sc.sportName || "Bộ môn"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2.5 p-5">
                      <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[16px] leading-normal truncate group-hover:text-[#10b981] transition-colors">
                        {sc.className}
                      </p>
                      <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-normal truncate">
                        {formatSchedule(sc.scheduleTime, sc.durationMinutes)} •{" "}
                        {sc.facilityName}
                      </p>
                      <div className="flex gap-1 items-center pt-1">
                        <span className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px] group-hover:translate-x-0.5 transition-transform">
                          Xem chi tiết
                        </span>
                        <span className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[13px] group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
