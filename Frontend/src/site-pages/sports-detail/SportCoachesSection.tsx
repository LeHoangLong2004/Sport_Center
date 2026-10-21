import type { SportDetailCoach } from "../useSportDetail"

interface SportCoachesSectionProps {
  name: string
  coaches: SportDetailCoach[]
}

export function SportCoachesSection({ name, coaches }: SportCoachesSectionProps) {
  return (
    <div className="bg-white flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
      <div className="flex flex-col gap-[8px] items-start w-full">
        <p className="font-extrabold text-[#1e293b] text-[28px]">Huấn luyện viên phụ trách {name}</p>
        <p className="text-[#64748b] text-[15px]">Danh sách huấn luyện viên được lấy từ các lớp học đang mở.</p>
      </div>
      {coaches.length === 0 ? (
        <div className="border border-[#e2e8f0] rounded-[12px] p-[24px] text-[#64748b] text-[14px] w-full">
          Chưa có huấn luyện viên được phân công cho bộ môn này.
        </div>
      ) : (
        <div className="flex flex-wrap gap-[24px] items-start w-full">
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-[240px] overflow-clip rounded-[16px]">
              <div className="relative h-[260px] w-full shrink-0">
                <img alt={coach.name} className="absolute inset-0 object-cover size-full max-w-none" src={coach.img} />
              </div>
              <div className="flex flex-col gap-[12px] items-start p-[20px] w-full">
                <p className="font-extrabold text-[#1e293b] text-[18px]">{coach.name}</p>
                <p className="font-semibold text-[#2563eb] text-[14px]">{coach.spec}</p>
                <p className="text-[#64748b] text-[13px] leading-[1.4] w-full">{coach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
