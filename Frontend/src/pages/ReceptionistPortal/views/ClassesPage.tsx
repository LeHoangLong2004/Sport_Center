import React, { useState, useMemo } from 'react';
import { A } from '../shared';

export function ClassesPage() {
  const [category, setCategory] = useState("Tất cả lớp")
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [shift, setShift] = useState("Tất cả")
  const [coachQuery, setCoachQuery] = useState("")
  const [classes, setClasses] = useState<any[]>([])
  const [sports, setSports] = useState<any[]>([])
  const [membersList, setMembersList] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [memberId, setMemberId] = useState("")
  const [loadingBook, setLoadingBook] = useState(false)
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"}|null>(null);

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const fetchClasses = () => {
    fetch('/api/classes/available')
      .then(r => r.json())
      .then(data => {
        const images = ["60eeb.png", "340d3.png", "b0a09.png", "25c0c.png", "5709f.png", "8b5dc.png"];
        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        
        const mapped = data.map((d: any, i: number) => {
          const date = new Date(d.scheduleTime);
          const day = dayNames[date.getDay()];
          const dd = String(date.getDate()).padStart(2, '0');
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const hh = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          
          return {
            id: d.id,
            sportName: d.sportName,
            title: d.className || d.name || "Lớp học",
            coach: d.coachName || "N/A",
            schedule: `${day}, ${dd}/${mm} • ${hh}:${min} (${d.durationMinutes} phút)`,
            room: `Phòng: ${d.facilityName}`,
            spacesText: `Còn ${d.availableSpots ?? (d.capacity - (d.currentEnrolled || d.currentBookings || 0))} chỗ`,
            spaces: d.availableSpots ?? (d.capacity - (d.currentEnrolled || d.currentBookings || 0)),
            image: images[i % images.length],
            startHour: date.getHours(),
            date: date.getDate(),
            rawDate: d.scheduleTime,
          };
        });
        setClasses(mapped);
      })
      .catch(e => console.error(e));
  }

  React.useEffect(() => {
    fetchClasses();

    fetch('/api/sports')
      .then(r => r.json())
      .then(data => setSports(data))
      .catch(e => console.error(e));

    const token = localStorage.getItem("token");
    if (token) {
        fetch("/api/users", { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) {
                setMembersList(data.filter((u: any) => u.roleName?.toLowerCase() === 'member'));
            }
        });
    }
  }, []);

  const visibleClasses = useMemo(
    () =>
      classes.filter((item) => {
        const matchCoach = item.coach.toLowerCase().includes(coachQuery.toLowerCase());
        const matchCategory = category === "Tất cả lớp" || 
            (item.sportName && item.sportName.toLowerCase().includes(category.toLowerCase())) || 
            item.title.toLowerCase().includes(category.toLowerCase());
            
        let matchShift = true;
        if (shift.includes("Sáng")) {
           matchShift = item.startHour >= 6 && item.startHour < 12;
        } else if (shift.includes("Chiều")) {
           matchShift = item.startHour >= 12 && item.startHour < 17;
        } else if (shift.includes("Tối")) {
           matchShift = item.startHour >= 17 && item.startHour < 22;
        }

        const matchDay = selectedDate === 0 || item.date === selectedDate;

        return matchCoach && matchCategory && matchShift && matchDay;
      }),
    [coachQuery, category, shift, selectedDate, classes],
  )

  const handleBookForMember = async () => {
    if (!memberId || !selectedClass) return;
    setLoadingBook(true);
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`/api/classes/${selectedClass.id}/book-for-member`, {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ MemberId: memberId })
        });
        const d = await res.json();
        if (res.ok) {
            showToast("Đặt lớp thành công cho hội viên!", "success");
            setSelectedClass(null);
            fetchClasses(); // Refresh data
        } else {
            showToast(d.message || "Không thể đặt lớp", "error");
        }
    } catch(e) {
        showToast("Có lỗi xảy ra: " + String(e), "error");
    } finally {
        setLoadingBook(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-2 flex-1 w-full max-w-6xl mx-auto relative">
      {toast && (
        <div className={`fixed top-6 right-1/2 translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${toast.type === "success" ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]" : "bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]"} transition-all animate-in slide-in-from-top-4 fade-in duration-300`}>
          <div className={`flex items-center justify-center size-7 shrink-0 rounded-full ${toast.type === "success" ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {toast.type === "success" ? <polyline points="20 6 9 17 4 12"></polyline> : <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>}
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-wide">{toast.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Quản lý Lớp học & Đặt hộ</h2>
          <p className="text-slate-500 font-medium text-sm">Hỗ trợ hội viên tra cứu và giữ chỗ lớp học trực tiếp tại quầy.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
          <div className="flex flex-wrap gap-2">
            {["Tất cả lớp", ...sports.map(s => s.name)].map((item) => (
              <button
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${category === item ? 'bg-[#a855f7] text-white shadow-md shadow-purple-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input
              aria-label="Lọc theo huấn luyện viên"
              onChange={(event) => setCoachQuery(event.target.value)}
              placeholder="Lọc theo HLV..."
              value={coachQuery}
              className="pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-slate-800 bg-slate-50 focus:bg-white w-full text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <strong className="text-xs font-bold text-slate-400 tracking-widest uppercase">Lịch trong tuần</strong>
            <button onClick={() => setSelectedDate(0)} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${selectedDate === 0 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Xem tất cả</button>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-3 hidden-scrollbar">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              const currentDay = d.getDay() === 0 ? 7 : d.getDay();
              d.setDate(d.getDate() - currentDay + 1 + i);
              const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
              const dayName = dayNames[d.getDay()];
              const dateNum = d.getDate();
              return (
                <button
                  className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-xl border transition-all duration-200 ${selectedDate === dateNum ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  key={dateNum}
                  onClick={() => setSelectedDate(dateNum)}
                  type="button"
                >
                  <span className={`text-[11px] font-bold uppercase mb-1 ${selectedDate === dateNum ? 'text-purple-600' : 'text-slate-400'}`}>{dayName}</span>
                  <strong className={`text-xl font-black ${selectedDate === dateNum ? 'text-purple-700' : 'text-slate-700'}`}>{dateNum}</strong>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <strong className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Khung giờ</strong>
          <div className="flex flex-wrap gap-2">
            {[
              "Tất cả",
              "Sáng (06:00 - 12:00)",
              "Chiều (12:00 - 17:00)",
              "Tối (17:00 - 21:00)",
            ].map((item) => (
              <button
                className={`px-4 py-2 rounded-xl border font-bold text-[13px] transition-all duration-200 ${shift === item ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleClasses.map((item) => (
          <article
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg hover:border-purple-200 transition-all duration-300 flex flex-col group cursor-pointer"
            key={item.id}
            onClick={() => setSelectedClass(item)}
          >
            <div className="relative h-40 overflow-hidden bg-slate-100">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={`/assets/member-booking/${item.image}`}
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  {item.room}
                </span>
                <h3 className="text-base font-bold text-white leading-tight line-clamp-1">{item.title}</h3>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>HLV: <strong className="text-slate-800">{item.coach}</strong></span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${item.spaces > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.spacesText}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-slate-800">{item.schedule}</span>
              </div>
            </div>
          </article>
        ))}
        {visibleClasses.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">
            Không tìm thấy lớp học nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Đặt hộ lớp học</h3>
              <button 
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 size-8 flex items-center justify-center rounded-full transition-colors border border-slate-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex gap-4">
                <img src={`/assets/member-booking/${selectedClass.image}`} className="size-16 rounded-xl object-cover shadow-sm" alt=""/> 
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-slate-800 leading-tight">{selectedClass.title}</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">{selectedClass.schedule}</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex flex-col gap-2 text-sm text-purple-900">
                <p><strong>HLV:</strong> {selectedClass.coach}</p>
                <p><strong>Phòng:</strong> {selectedClass.room}</p>
                <p><strong>Tình trạng:</strong> {selectedClass.spacesText}</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Chọn hội viên cần đặt hộ:</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  value={memberId}
                  onChange={e => setMemberId(e.target.value)}
                >
                  <option value="">-- Chọn hội viên --</option>
                  {membersList.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedClass(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleBookForMember}
                disabled={!memberId || loadingBook}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loadingBook ? "Đang xử lý..." : "Xác nhận đặt lớp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
