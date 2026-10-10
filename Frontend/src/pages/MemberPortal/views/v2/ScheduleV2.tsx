import { useState, useEffect } from "react";
import { Navigate } from "./types";
import { Shell } from "./MemberShellV2";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
// Mock data removed in favor of dynamic fetching

export function Schedule({ onNavigate }: { onNavigate: Navigate }) {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const getWeekString = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const formatDate = (date: Date) => `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${formatDate(currentWeekStart)} - ${formatDate(end)}, ${end.getFullYear()}`;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/schedule/my", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((item: any) => {
            const startDate = new Date(item.startTime);
            const endDate = new Date(item.endTime);
            const startHour = startDate.getHours() + startDate.getMinutes() / 60;
            const endHour = endDate.getHours() + endDate.getMinutes() / 60;
            const dayOfWeek = startDate.getDay() === 0 ? 7 : startDate.getDay(); // 1=Mon...7=Sun
            
            let tone = "teal";
            if (item.sportType?.toLowerCase()?.includes("gym") || item.sportType?.toLowerCase()?.includes("cardio")) tone = "green";
            if (item.sportType?.toLowerCase()?.includes("pt") || item.role === "Coach") tone = "orange";

            return {
              rawStart: startDate,
              column: dayOfWeek,
              startHour: startHour,
              endHour: endHour,
              tone: tone,
              title: item.className || "Lớp học",
              detail: item.coachName || "Coach",
              meta: item.roomName || "Phòng tập",
              status: item.bookingStatus
            };
          });
          setAllEvents(formatted);
        } else if (res.status === 401 || res.status === 403) {
          alert("Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại để xem lịch!");
        }
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      }
    };
    fetchSchedule();
  }, []);

  const calendarEvents = allEvents.filter(ev => {
    const evDate = ev.rawStart;
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return evDate >= currentWeekStart && evDate < endOfWeek;
  });

  return (
    <Shell page="schedule" onNavigate={onNavigate}>
      <section className="p-8 bg-slate-50 min-h-[calc(100vh-78px)] flex gap-6 flex-col xl:flex-row items-start">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex-1 w-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <button onClick={handlePrevWeek} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {currentWeekStart.getTime() === (() => {
                    const d = new Date();
                    const day = d.getDay();
                    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                    const monday = new Date(d.setDate(diff));
                    monday.setHours(0, 0, 0, 0);
                    return monday.getTime();
                  })() ? "Tuần học hiện tại" : "Lịch học tuần"}
                </h2>
                <button onClick={handleNextWeek} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5 ml-10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {getWeekString()}
              </p>
            </div>
            <div className="flex gap-5 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200/60">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lớp nhóm</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-500/50"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">PT Cá nhân</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tự tập tự do</span></div>
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-[850px]">
              <div className="grid grid-cols-[70px_repeat(7,1fr)] bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="py-2.5 px-3 text-center border-r border-slate-200/50"></div>
                {days.map(day => <div key={day} className="py-2.5 px-3 text-center border-r border-slate-200/50">{day}</div>)}
              </div>
              <div className="relative bg-white" style={{ minHeight: '608px' }}>
                {["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"].map((time) => (
                  <div key={time} className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-slate-100 h-[76px]">
                    <div className="py-2 px-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100 flex items-center justify-center bg-slate-50/30">{time}</div>
                    {days.map(day => <div key={day} className="border-r border-slate-100 last:border-r-0 relative hover:bg-teal-50/20 transition-colors cursor-crosshair"></div>)}
                  </div>
                ))}
                
                {/* Events - positioned absolute */}
                {calendarEvents.map((ev, i) => {
                  const bg = ev.tone === 'teal' ? 'bg-teal-50/95 border-teal-200 text-teal-800' : 
                             ev.tone === 'green' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 
                             'bg-orange-50/95 border-orange-200 text-orange-800';
                  const dot = ev.tone === 'teal' ? 'bg-teal-500 shadow-teal-500/40' : 
                              ev.tone === 'green' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-orange-500 shadow-orange-500/40';
                  
                  // 1 hour = 38px. Grid starts at 06:00
                  const top = `calc(${(ev.startHour - 6) * 38}px + 4px)`;
                  const durationHour = Math.max(ev.endHour - ev.startHour, 1);
                  const height = `calc(${durationHour * 38}px - 8px)`;
                  
                  return (
                    <button type="button" onClick={() => ev.title === "Functional HIIT" && onNavigate("workout")} key={i} className={`absolute text-left p-2.5 rounded-xl border shadow-sm backdrop-blur-md ${bg} hover:shadow-md transition-all cursor-pointer z-10 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-1 ${ev.tone === 'teal' ? 'focus:ring-teal-500' : ev.tone === 'green' ? 'focus:ring-emerald-500' : 'focus:ring-orange-500'}`} style={{ top, left: `calc(70px + ${((ev.column - 1) / 7) * 100}% + 4px)`, width: `calc(${100 / 7}% - 8px)`, minHeight: height }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`}></span>
                        <strong className="text-xs font-bold leading-tight truncate pr-0.5">{ev.title}</strong>
                      </div>
                      <div className="text-[11px] font-medium opacity-90 flex items-center gap-1 truncate">
                        <svg className="shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {ev.detail}
                      </div>
                      {ev.meta && (
                        <div className="text-[10px] font-medium opacity-75 mt-0.5 flex items-center gap-1 truncate">
                          <svg className="shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {ev.meta}
                        </div>
                      )}
                      {ev.status && (
                        <div className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${ev.status === 'Confirmed' ? 'bg-green-100/80 text-green-700' : ev.status === 'Waitlist' ? 'bg-yellow-100/80 text-yellow-700' : 'bg-slate-100/80 text-slate-700'}`}>
                          {ev.status}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-4 rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm" onClick={() => onNavigate("classes")} type="button">
            + Đặt lớp mới
          </button>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <strong className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Buổi tập tiếp theo</strong>
            {(() => {
              const nextEvent = allEvents
                .filter(ev => ev.rawStart > new Date())
                .sort((a, b) => a.rawStart.getTime() - b.rawStart.getTime())[0];

              if (!nextEvent) {
                return <p className="text-sm text-slate-500 italic">Chưa có lịch sắp tới</p>;
              }

              const d = nextEvent.rawStart;
              const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
              
              return (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex flex-col items-center justify-center bg-white border border-slate-200 w-14 h-16 rounded-xl shadow-sm shrink-0">
                    <span className="text-[10px] font-bold text-teal-600 uppercase">{dayNames[d.getDay()]}</span>
                    <b className="text-xl font-black text-slate-800">{d.getDate()}</b>
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-base font-bold text-slate-800 truncate mb-1">{nextEvent.title}</strong>
                    <small className="block text-xs font-medium text-slate-500 truncate flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')} • {nextEvent.detail}
                    </small>
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <strong className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Tiến trình tháng {new Date().getMonth() + 1}</strong>
            {(() => {
              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();
              const monthEvents = allEvents.filter(ev => ev.rawStart.getMonth() === currentMonth && ev.rawStart.getFullYear() === currentYear);
              
              return (
                <dl className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <dt className="text-sm font-medium text-slate-500">Số buổi tập</dt>
                    <dd className="text-sm font-bold text-slate-800">{monthEvents.length} buổi</dd>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <dt className="text-sm font-medium text-slate-500">Tiêu thụ calo (ước tính)</dt>
                    <dd className="text-sm font-bold text-orange-600 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
                      {(monthEvents.length * 450).toLocaleString('en-US')} kcal
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-slate-500">Chuỗi tập</dt>
                    <dd className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      -- ngày
                    </dd>
                  </div>
                </dl>
              );
            })()}
          </div>
        </aside>
      </section>
    </Shell>
  )
}