import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset, ClassItem } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function Classes({
  onNavigate,
  onSelect,
}: {
  onNavigate: (page: MemberPage) => void
  onSelect: (item: ClassItem) => void
}) {
  const [category, setCategory] = useState("Tất cả lớp")
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })
  const [shift, setShift] = useState("Sáng (06:00 - 12:00)")
  const [coachQuery, setCoachQuery] = useState("")
  const [classes, setClasses] = useState<any[]>([])

  React.useEffect(() => {
    import('../services/api').then(({ MemberAPI }) => {
      MemberAPI.getAvailableClasses()
        .then(data => {
          const images = ["60eeb.png", "340d3.png", "b0a09.png", "25c0c.png", "5709f.png", "8b5dc.png"];
          const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
          
          const mapped = data.map((d: any, i: number) => {
            const date = new Date(d.scheduleTime);
            const day = dayNames[date.getDay()];
            const yyyy = date.getFullYear();
            const MM = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            
            return {
              ...d,
              id: d.id,
              sportName: d.sportName,
              title: d.className || d.name || "Lớp học",
              coach: d.coachName || "N/A",
              schedule: `${day}, ${dd}/${MM} • ${hh}:${min} (${d.durationMinutes} phút)`,
              room: `Phòng: ${d.facilityName}`,
              spaces: `Còn ${d.availableSpots ?? (d.capacity - (d.currentEnrolled || d.currentBookings || 0))} chỗ`,
              image: images[i % images.length],
              dateStr: `${yyyy}-${MM}-${dd}`,
              hour: date.getHours()
            };
          });
          setClasses(mapped);
        })
        .catch(e => console.error(e));
    });
  }, []);

  const visibleClasses = useMemo(
    () =>
      classes.filter((item) => {
        const matchCoach = item.coach.toLowerCase().includes(coachQuery.toLowerCase());
        const matchCategory = category === "Tất cả lớp" || 
            (item.sportName && item.sportName.toLowerCase().includes(category.toLowerCase())) || 
            item.title.toLowerCase().includes(category.toLowerCase());
        const matchDate = !selectedDate || item.dateStr === selectedDate;
        let matchShift = true;
        if (shift.includes("Sáng")) matchShift = item.hour >= 6 && item.hour < 12;
        else if (shift.includes("Chiều")) matchShift = item.hour >= 12 && item.hour < 17;
        else if (shift.includes("Tối")) matchShift = item.hour >= 17;
        
        return matchCoach && matchCategory && matchDate && matchShift;
      }),
    [coachQuery, category, classes, selectedDate, shift],
  )

  return (
    <MemberShell page="classes" onNavigate={onNavigate}>
      <section className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Chọn lịch lớp học phù hợp</h2>
              <p className="text-slate-500 font-medium">Lựa chọn từ các lớp nhóm hoặc đặt chỗ huấn luyện viên chuyên nghiệp cho mục tiêu của bạn.</p>
            </div>
            <div className="shrink-0">
              <Progress step={1} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-8">
            <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
              <div className="flex flex-wrap gap-2">
                {["Tất cả lớp", "Yoga", "HIIT", "Swimming", "CrossFit"].map((item) => (
                  <button
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${category === item ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    key={item}
                    onClick={() => setCategory(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <input
                  aria-label="Lọc theo huấn luyện viên"
                  onChange={(event) => setCoachQuery(event.target.value)}
                  placeholder="Lọc theo HLV..."
                  value={coachQuery}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-slate-800 bg-slate-50 focus:bg-white w-full lg:w-64 font-medium"
                />
              </div>
            </div>

            <div>
              <strong className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Chọn ngày xem lịch</strong>
              <div className="flex gap-3 items-center">
                <div className="relative inline-block w-full md:w-auto">
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-transparent bg-white shadow-sm font-bold w-full md:w-auto z-10 relative cursor-pointer"
                    style={{ WebkitTextFillColor: 'transparent' }}
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-800 font-bold z-20 flex items-center gap-2">
                    {selectedDate ? selectedDate.split('-').reverse().join('/') : "dd/mm/yyyy"}
                  </div>
                </div>
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate("")}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Xem tất cả ngày
                  </button>
                )}
              </div>
            </div>

            <div>
              <strong className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Khung giờ</strong>
              <div className="flex flex-wrap gap-3">
                {[
                  "Sáng (06:00 - 12:00)",
                  "Chiều (12:00 - 17:00)",
                  "Tối (17:00 - 21:00)",
                ].map((item) => (
                  <button
                    className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${shift === item ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    key={item}
                    onClick={() => setShift(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleClasses.map((item) => (
              <article
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                key={item.title}
                onClick={() => onSelect(item)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={asset("classes", item.image)}
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/30">
                      {item.room}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{item.title}</h3>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>HLV: <strong className="text-slate-800">{item.coach}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span className="text-slate-800">{item.schedule}</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{item.spaces}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelect(item); }} 
                      type="button"
                      className="px-4 py-2 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-sm rounded-xl transition-colors duration-200"
                    >
                      Đặt chỗ
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {visibleClasses.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy lớp học</h3>
              <p className="text-slate-500">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
            </div>
          )}
          
        </div>
      </section>
    </MemberShell>
  )
}
