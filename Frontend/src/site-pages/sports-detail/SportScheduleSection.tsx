import type { SportDetailSession } from "../useSportDetail"

interface SportScheduleSectionProps {
  name: string
  schedule: SportDetailSession[]
}

export function SportScheduleSection({ name, schedule }: SportScheduleSectionProps) {
  return (
    <div className="bg-[#f8fafc] flex flex-col gap-[28px] items-start p-[80px] w-full shrink-0">
      <div className="flex flex-col gap-[6px] items-start w-full">
        <p className="font-extrabold text-[#1e293b] text-[26px]">Lịch lớp {name}</p>
        <p className="text-[#64748b] text-[14px]">Danh sách lớp học đang mở được lấy trực tiếp từ hệ thống.</p>
      </div>
      {schedule.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px] text-[#64748b] text-[14px] w-full">
          Hiện chưa có lớp học nào cho bộ môn này.
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-auto rounded-[12px] w-full shadow-xs">
          <div className="bg-[#1e293b] flex gap-[20px] items-start min-w-[1000px] p-[16px] w-full text-white font-bold text-[13px]">
            <span className="w-[180px]">Thời gian</span>
            <span className="w-[220px]">Lớp học</span>
            <span className="w-[200px]">Huấn luyện viên</span>
            <span className="w-[180px]">Khu vực / Phòng</span>
            <span className="w-[150px]">Suất trống</span>
            <span className="flex-1 text-right">Đăng ký</span>
          </div>
          {schedule.map((row, index) => (
            <div key={`${row.name}-${row.time}`} className={`flex gap-[20px] items-center min-w-[1000px] p-[16px] w-full ${index < schedule.length - 1 ? "border-b border-[#e2e8f0]" : ""}`}>
              <span className="font-semibold text-[#1e293b] text-[13px] w-[180px]">{row.time}</span>
              <span className="font-bold text-[#2563eb] text-[13px] w-[220px]">{row.name}</span>
              <span className="text-[#1e293b] text-[13px] w-[200px]">{row.coach}</span>
              <span className="text-[#64748b] text-[13px] w-[180px]">{row.room}</span>
              <span className={`font-semibold text-[13px] w-[150px] ${row.full ? "text-[#94a3b8]" : "text-[#059669]"}`}>{row.slots}</span>
              <div className="flex flex-1 items-start justify-end">
                <button
                  type="button"
                  disabled={row.full}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!row.full) window.location.hash = "#pricing"
                  }}
                  className={`px-[16px] py-[7px] rounded-[6px] text-white font-bold text-[12px] transition-colors ${row.full ? "bg-[#94a3b8] cursor-not-allowed" : "bg-[#10b981] hover:bg-[#059669] cursor-pointer"}`}
                >
                  {row.full ? "Đầy chỗ" : "Đăng ký ngay"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
