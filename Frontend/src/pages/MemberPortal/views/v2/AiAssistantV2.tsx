import { FormEvent, useState } from "react";
import { Navigate } from "./types";
import { Shell } from "./MemberShellV2";

const plan = [
  ["Thứ Hai (Day 1)", "HIIT Đốt Mỡ + Circuit Training", "45 phút", "400-450 kcal"],
  ["Thứ Tư (Day 2)", "Core Stabilization (Cơ bụng & lõi)", "30 phút", "250 kcal"],
  ["Thứ Sáu (Day 3)", "Tabata Abs & Cardio liên tục", "40 phút", "350 kcal"],
  ["Chủ Nhật (Day 4)", "Pilates Recovery & giãn cơ", "50 phút", "200 kcal"],
]

export function AiAssistant({ onNavigate }: { onNavigate: Navigate }) {
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState<string[]>([])
  function submit(event: FormEvent) {
    event.preventDefault()
    const next = message.trim()
    if (!next) return
    setSent((current) => [...current, next])
    setMessage("")
  }
  return (
    <Shell page="ai" onNavigate={onNavigate}>
      <section className="flex h-[calc(100vh-78px)] bg-slate-50 overflow-hidden">
        {/* Sidebar History */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <strong className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Lịch sử Chat</strong>
            <button aria-label="Cuộc trò chuyện mới" type="button" className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {[
            ["Kế hoạch dinh dưỡng tuần 4", "Hôm nay"],
            ["Đau mỏi cơ sau buổi Legday", "Hôm qua"],
            ["Cách tính lượng Calories thâm hụt", "T5, 19/09"],
            ["Đề xuất lớp Yoga phù hợp gối", "T2, 16/09"],
            ["Tăng cơ giảm mỡ cho dân văn phòng", "05/09"],
          ].map(([title, date], index) => (
            <button className={`w-full text-left p-3 rounded-xl transition-all ${index === 0 ? "bg-teal-50 border border-teal-100" : "hover:bg-slate-50 border border-transparent"}`} key={title} type="button">
              <strong className={`block text-sm font-semibold truncate ${index === 0 ? "text-teal-700" : "text-slate-700"}`}>{title}</strong>
              <small className={`block text-xs mt-1 ${index === 0 ? "text-teal-500" : "text-slate-400"}`}>{date}</small>
            </button>
          ))}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 1 2-2zm0 6a2 2 0 0 1 2 2v6a2 2 0 0 1-4 0v-6a2 2 0 0 1 2-2zm0 12a2 2 0 0 1 2 2H10a2 2 0 0 1 2-2z"/></svg>
              </div>
              <div>
                <strong className="block text-sm font-bold text-slate-800">Move AI Coach</strong>
                <small className="block text-xs font-medium text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Trợ lý AI đang trực tuyến hỗ trợ bạn</small>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-end">
              <p className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-2xl rounded-tr-sm px-5 py-3 text-sm max-w-[80%] leading-relaxed">
                Gợi ý bài tập cho giảm mỡ bụng trong vòng 4 tuần hiệu quả nhất. Mình có thể tập 4 buổi một tuần tại nhà hoặc phòng gym đều được.
              </p>
            </div>
            
            <div className="flex justify-start items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 1 2-2zm0 6a2 2 0 0 1 2 2v6a2 2 0 0 1-4 0v-6a2 2 0 0 1 2-2zm0 12a2 2 0 0 1 2 2H10a2 2 0 0 1 2-2z"/></svg>
              </div>
              <div className="bg-gradient-to-br from-teal-600 to-indigo-700 text-white shadow-xl shadow-teal-900/10 rounded-3xl rounded-tl-sm px-6 py-5 text-sm max-w-[85%] leading-relaxed">
                <p className="mb-4 text-teal-50">Chào Minh Anh! Để giảm mỡ bụng hiệu quả và an toàn, chúng ta cần kết hợp giữa bài tập đốt mỡ toàn thân (HIIT) và các bài tập tăng cường khối lượng cơ trung tâm (Core). Mình đề xuất cho bạn giáo án 4 ngày dưới đây:</p>
                
                <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/20 mb-4 backdrop-blur-sm">
                  <div className="grid grid-cols-[1fr_2fr_1fr_1fr] bg-white/10 p-3 text-xs font-bold tracking-wider text-teal-100 uppercase border-b border-white/10">
                    <div>NGÀY</div><div>BÀI TẬP CHI TIẾT</div><div>THỜI LƯỢNG</div><div>CALO ƯỚC TÍNH</div>
                  </div>
                  {plan.map((row, idx) => (
                    <div key={row[0]} className={`grid grid-cols-[1fr_2fr_1fr_1fr] p-3 text-sm items-center ${idx !== plan.length - 1 ? 'border-b border-white/10' : ''} hover:bg-white/5 transition-colors`}>
                      <span className="font-semibold text-white">{row[0]}</span>
                      <span className="text-teal-50">{row[1]}</span>
                      <span className="text-teal-100">{row[2]}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-medium text-xs w-fit">{row[3]}</span>
                    </div>
                  ))}
                </div>
                
                <p className="mb-5 text-teal-50">Dinh dưỡng cũng đóng vai trò quyết định, hãy giữ mức thâm hụt nhẹ 300 kcal/ngày nhé. Bạn có muốn mình tạo chi tiết bài tập cho từng ngày không?</p>
                
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-4 py-2 rounded-full text-xs transition-all shadow-sm">Thêm vào lịch</button>
                  <button type="button" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium px-4 py-2 rounded-full text-xs transition-all">Điều chỉnh</button>
                  <button type="button" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium px-4 py-2 rounded-full text-xs transition-all">Tạo giáo án</button>
                </div>
              </div>
            </div>

            {sent.map((text, index) => (
              <div className="flex justify-end" key={`${text}-${index}`}>
                <p className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-2xl rounded-tr-sm px-5 py-3 text-sm max-w-[80%] leading-relaxed animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-white border-t border-slate-200">
            <form className="relative flex items-center shadow-sm border border-slate-200 rounded-full bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all overflow-hidden" onSubmit={submit}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} className="w-full bg-transparent outline-none py-3.5 pl-6 pr-12 text-sm text-slate-700 placeholder-slate-400" placeholder="Hỏi về lịch tập, chế độ dinh dưỡng, kĩ thuật tập luyện..." />
              <button aria-label="Gửi tin nhắn" type="submit" className={`absolute right-2 p-2 rounded-full transition-all ${message.trim() ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' : 'bg-slate-200 text-slate-400'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </form>
          </div>
        </div>
      </section>
    </Shell>
  )
}
