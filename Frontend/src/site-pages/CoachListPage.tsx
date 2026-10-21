import { useEffect, useState } from "react"
import { FadeIn, FadeUp } from "../components/Motion"

type Coach = {
  id: string
  fullName?: string | null
  avatarUrl?: string | null
  specialty?: string | null
  bio?: string | null
  experienceYears?: number | null
  rating?: number | null
}

const fallbackImage = "/assets/images/hero_bg.jpg"

function resolveImageUrl(value?: string | null) {
  const imageUrl = value?.trim()
  if (!imageUrl) return fallbackImage
  return /^(https?:|data:|blob:)/i.test(imageUrl) || imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`
}

export default function HoSoHlvRedesign() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch("/api/coaches")
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách huấn luyện viên.")
        return (await response.json()) as Coach[]
      })
      .then((items) => {
        if (!cancelled) setCoaches(Array.isArray(items) ? items : [])
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const ratedCoaches = coaches.filter((coach) => Number(coach.rating) > 0)
  const averageRating = ratedCoaches.length
    ? (ratedCoaches.reduce((sum, coach) => sum + Number(coach.rating), 0) / ratedCoaches.length).toFixed(1)
    : "—"
  const maxExperience = coaches.reduce((max, coach) => Math.max(max, Number(coach.experienceYears) || 0), 0)

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <section className="bg-[#0f172a] relative flex flex-col items-center gap-[24px] px-[80px] py-[100px] w-full min-h-[480px] overflow-hidden text-center">
        <FadeIn className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute inset-0 w-full h-full object-cover" src={fallbackImage} />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
        </FadeIn>
        <FadeUp className="relative z-10 bg-[#10b981]/20 border border-[#10b981]/50 px-[14px] py-[6px] rounded-full">
          <span className="font-bold text-[#10b981] text-[12px] uppercase tracking-wider">Đội ngũ huấn luyện viên</span>
        </FadeUp>
        <FadeUp delay={0.1} className="relative z-10 font-extrabold text-white text-[48px] leading-tight">
          Huấn luyện viên SportCenter
        </FadeUp>
        <FadeUp delay={0.2} className="relative z-10 text-[#cbd5e1] text-[18px] leading-relaxed max-w-[640px]">
          Khám phá đội ngũ huấn luyện viên đang hoạt động và thông tin được đồng bộ trực tiếp từ hệ thống.
        </FadeUp>
        <div className="relative z-10 flex gap-[48px] items-center pt-[12px]">
          <Metric value={isLoading ? "—" : String(coaches.length)} label="HLV đang hoạt động" />
          <Metric value={isLoading ? "—" : averageRating} label="Đánh giá trung bình" />
          <Metric value={isLoading ? "—" : maxExperience ? `${maxExperience}+` : "—"} label="Năm kinh nghiệm cao nhất" />
        </div>
      </section>

      <section className="bg-white flex flex-col gap-[32px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col gap-[10px] items-center text-center">
          <h2 className="font-extrabold text-[#0f172a] text-[32px]">Danh sách huấn luyện viên</h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[64px]" />
        </div>
        {error ? <p className="text-center text-[#dc2626] text-[14px]">{error}</p> : null}
        {!isLoading && !error && coaches.length === 0 ? (
          <p className="text-center text-[#64748b] text-[14px]">Chưa có huấn luyện viên trong hệ thống.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px]">
            {coaches.map((coach, index) => (
              <FadeUp
                delay={index * 0.05}
                key={coach.id}
                className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col overflow-hidden rounded-[16px] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="h-[260px] w-full overflow-hidden">
                  <img
                    alt={coach.fullName || "Huấn luyện viên"}
                    className="w-full h-full object-cover"
                    src={resolveImageUrl(coach.avatarUrl)}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = fallbackImage
                    }}
                  />
                </div>
                <div className="flex flex-col gap-[10px] p-[20px]">
                  <h3 className="font-extrabold text-[#0f172a] text-[18px]">{coach.fullName || "Huấn luyện viên"}</h3>
                  <p className="font-semibold text-[#2563eb] text-[14px]">{coach.specialty || "Chưa cập nhật chuyên môn"}</p>
                  <p className="text-[#64748b] text-[13px] leading-relaxed min-h-[58px]">
                    {coach.bio || "Thông tin huấn luyện viên đang được cập nhật từ hệ thống."}
                  </p>
                  <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-[12px] text-[13px]">
                    <span className="text-[#475569]">{coach.experienceYears == null ? "Chưa cập nhật" : `${coach.experienceYears} năm kinh nghiệm`}</span>
                    <span className="font-semibold text-[#10b981]">{Number(coach.rating) > 0 ? `${coach.rating}/5` : "Chưa có đánh giá"}</span>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-[4px] items-center">
      <p className="font-extrabold text-[#10b981] text-[30px] leading-none">{value}</p>
      <p className="text-[#94a3b8] text-[13px]">{label}</p>
    </div>
  )
}
