import { FadeIn, FadeUp } from "../components/Motion"
import { useAboutData } from "./useAboutData"

const imgHeroSection = "/assets/images/hero_bg.jpg"

export default function VeTrungTamRedesign() {
  const { facilities, team, classCount, availableSpots, isLoading, error } = useAboutData()
  const stats = [
    { value: team.length.toString(), label: "Huấn luyện viên" },
    { value: facilities.length.toString(), label: "Không gian tập luyện" },
    { value: classCount.toString(), label: "Lớp đang mở" },
    { value: availableSpots.toString(), label: "Suất trống hiện tại" },
  ]

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full">
      <section className="relative flex flex-col gap-[24px] h-[560px] items-center justify-center p-[80px] w-full shrink-0 overflow-hidden">
        <FadeIn className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute object-cover size-full max-w-none" src={imgHeroSection} />
          <div className="absolute bg-slate-900/60 mix-blend-multiply inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        </FadeIn>
        <FadeUp delay={0.2} className="relative bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-full">
          <p className="font-bold text-[#10b981] text-[12px] uppercase">VỀ CHÚNG TÔI - SPORTCENTER</p>
        </FadeUp>
        <FadeUp delay={0.3} className="relative font-extrabold text-white text-[44px] leading-[1.2] text-center">
          Hệ sinh thái thể thao đa bộ môn hàng đầu
        </FadeUp>
        <FadeUp delay={0.4} className="relative text-[#94a3b8] text-[18px] leading-[1.6] text-center max-w-[640px]">
          Nơi hội tụ công nghệ luyện tập hiện đại, không gian chuyên nghiệp và đội ngũ chuyên gia giàu kinh nghiệm.
        </FadeUp>
      </section>

      <section className="bg-white flex gap-[48px] items-center p-[80px] w-full shrink-0 overflow-hidden">
        <FadeUp className="flex flex-col gap-[24px] items-start flex-1 min-w-0">
          <div className="flex flex-col gap-[8px] items-start w-full">
            <h2 className="font-extrabold text-[#0f172a] text-[32px]">Sứ mệnh & Tầm nhìn</h2>
            <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
          </div>
          <p className="text-[#1e293b] text-[16px] leading-[1.6]">
            SportCenter đồng hành cùng hội viên trong quá trình rèn luyện, xây dựng thói quen vận động và nâng cao chất lượng cuộc sống.
          </p>
          <p className="text-[#1e293b] text-[16px] leading-[1.6]">
            Các bộ môn, lớp học, phòng tập và huấn luyện viên bên dưới được đồng bộ trực tiếp từ hệ thống.
          </p>
        </FadeUp>
        <FadeUp delay={0.2} className="flex-1 min-w-0 h-[360px] rounded-[16px] overflow-hidden relative shrink-0 shadow-2xl">
          <img alt="Không gian SportCenter" className="absolute inset-0 object-cover size-full max-w-none hover:scale-105 transition-transform duration-700" src={facilities[0]?.img || imgHeroSection}
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = imgHeroSection
            }} />
        </FadeUp>
      </section>

      <section className="bg-[#0f172a] flex gap-[24px] items-stretch p-[80px] w-full shrink-0">
        {stats.map(({ value, label }, index) => (
          <FadeUp delay={index * 0.1} key={label} className="bg-[#1e293b] flex flex-col gap-[8px] items-center flex-1 min-w-0 p-[32px] rounded-[16px] hover:bg-[#334155] transition-colors">
            <p className="font-extrabold text-[#10b981] text-[40px]">{isLoading ? "—" : value}</p>
            <p className="text-white text-[14px] text-center opacity-80">{label}</p>
          </FadeUp>
        ))}
      </section>

      <section className="bg-[#f8fafc] flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <h2 className="font-extrabold text-[#0f172a] text-[32px]">Không gian luyện tập</h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        {error ? <DataMessage message={error} error /> : facilities.length === 0 && !isLoading ? <DataMessage message="Chưa có phòng tập trong hệ thống." /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px] w-full">
            {facilities.map((facility, index) => (
              <FadeUp delay={index * 0.1} key={facility.id} className="relative w-full h-[280px] flex flex-col items-start justify-end overflow-hidden p-[24px] rounded-[16px] group shadow-sm hover:shadow-xl transition-all duration-300">
                <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[16px]">
                  <img alt="" className="absolute object-cover size-full max-w-none rounded-[16px] transition-transform duration-500 group-hover:scale-105" src={facility.img}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = imgHeroSection
                    }} />
                  <div className="absolute bg-[rgba(15,23,42,0.4)] inset-0 rounded-[16px]" />
                </div>
                <p className="relative font-extrabold text-white text-[20px]">{facility.label}</p>
              </FadeUp>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[8px] items-start w-full">
          <h2 className="font-extrabold text-[#0f172a] text-[32px]">Đội ngũ huấn luyện viên</h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px]" />
        </div>
        {team.length === 0 && !isLoading ? <DataMessage message="Chưa có huấn luyện viên trong hệ thống." /> : (
          <div className="flex flex-wrap gap-[24px] items-start w-full">
            {team.map((coach, index) => (
              <FadeUp delay={index * 0.1} key={coach.id} className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-[280px] overflow-hidden rounded-[16px] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="h-[260px] w-full relative shrink-0 overflow-hidden">
                  <img alt={coach.name} className="absolute inset-0 object-cover size-full max-w-none" src={coach.img} />
                </div>
                <div className="flex flex-col gap-[12px] items-start p-[24px] w-full">
                  <p className="font-extrabold text-[#0f172a] text-[18px]">{coach.name}</p>
                  <p className="font-semibold text-[#2563eb] text-[14px]">{coach.title}</p>
                  <p className="text-[#64748b] text-[13px] leading-[1.5]">{coach.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#f8fafc] flex flex-col gap-[20px] items-center px-[80px] py-[64px] w-full shrink-0">
        <p className="font-bold text-[#64748b] text-[14px] uppercase text-center">Đối tác & nhà cung cấp</p>
        <p className="text-[#94a3b8] text-[14px] text-center">Thông tin đối tác sẽ được cập nhật từ hệ thống khi có dữ liệu.</p>
      </section>

      <section className="bg-[#f8fafc] flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full shrink-0 overflow-hidden">
        <FadeUp className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent pointer-events-none rounded-[24px]" />
          <div className="flex flex-col gap-[12px] items-center text-center w-full relative z-10">
            <p className="font-extrabold text-white text-[32px] w-full">Đặt lịch hẹn tham quan không gian thực tế ngay hôm nay</p>
            <p className="text-[#94a3b8] text-[16px] w-full">Đội ngũ tư vấn viên sẽ hướng dẫn bạn tham quan chi tiết SportCenter.</p>
          </div>
          <div className="flex gap-[16px] items-center w-full relative z-10">
            <input type="text" placeholder="Họ và tên của bạn" className="bg-[#1e293b] border border-[#334155] flex-1 min-w-0 px-[16px] py-[14px] rounded-[8px] text-white text-[14px] outline-none placeholder:text-[#94a3b8] focus:border-[#10b981] transition-colors" />
            <input type="tel" placeholder="Số điện thoại liên hệ" className="bg-[#1e293b] border border-[#334155] flex-1 min-w-0 px-[16px] py-[14px] rounded-[8px] text-white text-[14px] outline-none placeholder:text-[#94a3b8] focus:border-[#10b981] transition-colors" />
            <button className="bg-[#10b981] flex-1 min-w-0 flex items-center justify-center px-[24px] py-[14px] rounded-[8px] cursor-pointer hover:bg-[#059669] transition-colors shadow-lg shadow-[#10b981]/25">
              <p className="font-extrabold text-white text-[14px]">Đăng ký tham quan ngay</p>
            </button>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}

function DataMessage({ message, error = false }: { message: string; error?: boolean }) {
  return <p className={error ? "text-[#dc2626] text-[14px]" : "text-[#64748b] text-[14px]"}>{message}</p>
}
