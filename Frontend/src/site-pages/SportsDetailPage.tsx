import { imgCheck } from "./sportsDetailData"
import { SportCoachesSection } from "./sports-detail/SportCoachesSection"
import { SportScheduleSection } from "./sports-detail/SportScheduleSection"
import { useSportDetail } from "./useSportDetail"

export default function ChiTietBoMonPage() {
  const { sport, isLoading, error } = useSportDetail()

  if (isLoading) return <DetailState message="Đang tải thông tin bộ môn..." />
  if (!sport || error) return <DetailState message={error || "Không tìm thấy bộ môn."} error />

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <div className="relative flex flex-col gap-[24px] items-start px-[80px] py-[64px] w-full shrink-0 min-h-[320px]">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute inset-0 object-cover size-full max-w-none" src={sport.heroImg} />
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.85)]" />
        </div>
        <div className="relative flex gap-[8px] items-center text-[14px]">
          <a href="#home" className="text-[#94a3b8] hover:text-white transition-colors">Trang chủ</a>
          <span className="text-[#94a3b8]">&gt;</span>
          <a href="#bomon" className="text-[#94a3b8] hover:text-white transition-colors">Bộ môn</a>
          <span className="text-[#94a3b8]">&gt;</span>
          <span className="font-semibold text-white">{sport.name}</span>
        </div>
        <div className="relative flex items-center">
          <div className="bg-[#10b981] flex items-center px-[14px] py-[6px] rounded-[100px]">
            <p className="font-bold text-white text-[12px] whitespace-nowrap">ĐANG MỞ ĐĂNG KÝ</p>
          </div>
        </div>
        <h1 className="relative font-extrabold text-white text-[44px] leading-tight">{sport.name}</h1>
        <p className="relative text-[#94a3b8] text-[17px] leading-[1.6] max-w-[680px]">{sport.tagline}</p>
      </div>

      <div className="bg-white flex gap-[64px] items-center p-[80px] w-full shrink-0">
        <div className="relative h-[380px] rounded-[16px] shrink-0 w-[560px] overflow-hidden shadow-lg">
          <img alt={sport.facilityTitle} className="absolute inset-0 object-cover size-full max-w-none rounded-[16px]" src={sport.facilityImg} />
        </div>
        <div className="flex flex-1 flex-col gap-[20px] items-start min-w-0">
          <p className="font-extrabold text-[#1e293b] text-[30px] w-full">{sport.facilityTitle}</p>
          <p className="text-[#64748b] text-[15px] leading-[1.6] w-full">{sport.facilityDesc}</p>
          <div className="flex gap-[12px] items-center w-full">
            <div className="bg-[rgba(37,99,235,0.1)] flex items-center justify-center rounded-[12px] size-[24px] shrink-0">
              <img alt="" src={imgCheck} style={{ width: 11, height: 11 }} />
            </div>
            <p className="font-semibold text-[#1e293b] text-[14px]">Dữ liệu được lấy từ hệ thống SportCenter</p>
          </div>
        </div>
      </div>

      <SportScheduleSection name={sport.name} schedule={sport.schedule} />
      <SportCoachesSection name={sport.name} coaches={sport.coaches} />

      <div className="bg-[#0f172a] flex flex-col gap-[20px] items-center p-[80px] w-full shrink-0">
        <p className="font-extrabold text-white text-[30px] text-center">Trải nghiệm tập thử {sport.name} miễn phí hôm nay!</p>
        <p className="text-[#94a3b8] text-[15px] text-center max-w-[600px]">Nhận ngay 01 buổi tập trải nghiệm cùng HLV chuyên nghiệp.</p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            window.location.hash = "#pricing"
          }}
          className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-[14px] px-[32px] py-[14px] rounded-[8px] transition-colors cursor-pointer"
        >
          Nhận vé tập thử ngay
        </button>
      </div>
    </div>
  )
}

function DetailState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <div className="bg-[#f8fafc] flex items-center justify-center min-h-screen w-full">
      <p className={error ? "text-[#dc2626]" : "text-[#64748b]"}>{message}</p>
    </div>
  )
}
