import React, { useState, useEffect } from 'react';
import { iCalendar, iSearch2, iChevron, coachAvatar1, coachAvatar2, hrAvatar1 } from '../shared';
import { CreateClassModal } from '../components/CreateClassModal';
import { ClassDetailModal } from '../components/ClassDetailModal';
import { BookingRow } from '../components/BookingRow';

export function SchedulePage() {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  const [classes, setClasses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [editClassData, setEditClassData] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings'>('calendar');
  const [bookings, setBookings] = useState<any[]>([]);
  const facilities = ["Studio 1 (Yoga/Pilates)", "Studio 2 (Dance)", "Studio 3 (Cycling)", "Gym Area"];

  const handleRoomChange = (room: string) => {
    if (room === 'Tất cả') {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(prev => 
        prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
      );
    }
  };

  // Lấy ngày bắt đầu của tuần hiện tại (Thứ 2)
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
    
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };
    return `${formatDate(currentWeekStart)} - ${formatDate(end)}, ${end.getFullYear()}`;
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes/all");
      if (res.ok) {
        const data = await res.json();
        const formattedClasses = data.map((c: any, i: number) => {
          const start = new Date(c.scheduleTime);
          const end = new Date(start.getTime() + (c.durationMinutes || 60) * 60000);
          
          const day = start.getDay() === 0 ? 6 : start.getDay() - 1; 
          const startHour = start.getHours() + start.getMinutes() / 60;
          const endHour = end.getHours() + end.getMinutes() / 60;
          const hourIndex = (startHour - 6) / 2; 
          const durationIndex = (endHour - startHour) / 2;

          let colorBg = '';
          let colorText = '';

          if (c.status === false) {
            colorBg = 'bg-gray-100 border-gray-300 border-l-gray-400 opacity-60';
            colorText = 'text-gray-500 line-through';
          } else {
            const colorOptions = [
              { bg: 'bg-blue-50 border-blue-200 border-l-blue-500', text: 'text-blue-700' },
              { bg: 'bg-emerald-50 border-emerald-200 border-l-emerald-500', text: 'text-emerald-700' },
              { bg: 'bg-violet-50 border-violet-200 border-l-violet-500', text: 'text-violet-700' },
              { bg: 'bg-orange-50 border-orange-200 border-l-orange-500', text: 'text-orange-700' },
              { bg: 'bg-rose-50 border-rose-200 border-l-rose-500', text: 'text-rose-700' },
            ];
            const color = colorOptions[i % colorOptions.length];
            colorBg = color.bg;
            colorText = color.text;
          }

          return {
            id: c.id,
            name: c.className,
            room: c.facilityName || 'Studio',
            coach: c.coachName,
            enrolled: `${c.currentEnrolled || 0}/${c.capacity || 0}`,
            day: day,
            hour: hourIndex,
            duration: durationIndex,
            color: colorBg,
            text: colorText,
            rawStart: start,
            isCancelled: c.status === false
          };
        });
        setClasses(formattedClasses);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bookings/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchBookings();
  }, []);

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

  // Lọc các lớp trong tuần đang chọn
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  let classesThisWeek = classes.filter(c => c.rawStart >= currentWeekStart && c.rawStart <= weekEnd);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    classesThisWeek = classesThisWeek.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.coach && c.coach.toLowerCase().includes(q))
    );
  }

  if (selectedRooms.length > 0) {
    // Chỉ lấy phần tên chính của phòng (ví dụ: "Studio 1 (Yoga/Pilates)" -> "Studio 1") để lọc chính xác
    classesThisWeek = classesThisWeek.filter(c => 
      selectedRooms.some(r => c.room.includes(r.split(" (")[0]))
    );
  }

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${id}/approve`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${id}/reject`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Lịch trình & Lớp học</p>
          <p className="text-[#64748b] text-sm mt-1">Sắp xếp thời khóa biểu và phân công HLV cho các lớp Group-X.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#f1f5f9] p-1 rounded-lg flex items-center shrink-0">
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'calendar' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
            >
              Lịch trình
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'bookings' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
            >
              Danh sách đặt chỗ
            </button>
          </div>
          {activeTab === 'calendar' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="font-semibold text-white text-sm">+ Tạo lớp mới</span>
            </button>
          )}
        </div>
      </div>

      {showCreateModal && <CreateClassModal onClose={() => { setShowCreateModal(false); fetchClasses(); }} />}
      {editClassData && <CreateClassModal editData={editClassData} onClose={() => { setEditClassData(null); fetchClasses(); }} />}
      {selectedClassId && <ClassDetailModal 
        classId={selectedClassId} 
        onClose={() => { setSelectedClassId(null); fetchClasses(); }} 
        onEdit={(data) => { setEditClassData(data); setSelectedClassId(null); }}
      />}

      {activeTab === 'calendar' ? (
        <div className="flex gap-4 pt-2">
          {/* Sidebar Filters */}
        <div className="w-[240px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2.5 rounded-lg">
            <img src={iSearch2} alt="" className="size-4 shrink-0" />
            <input 
              placeholder="Tìm lớp, HLV..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm outline-none" 
            />
          </div>
          
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm">
            <p className="font-bold text-[#0f172a] text-sm mb-3">Bộ lọc Phòng tập</p>
            <div className="flex flex-col gap-2">
              <label className="flex gap-2 items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedRooms.length === 0}
                  onChange={() => handleRoomChange('Tất cả')}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-[#475569] text-sm group-hover:text-[#0f172a]">Tất cả</span>
              </label>
              {facilities.map((r, i) => (
                <label key={i} className="flex gap-2 items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedRooms.includes(r)}
                    onChange={() => handleRoomChange(r)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-[#475569] text-sm group-hover:text-[#0f172a]">{r}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm">
            <p className="font-bold text-[#0f172a] text-sm mb-3">Huấn luyện viên (Workload)</p>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500 italic">Đang cập nhật...</p>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl drop-shadow-sm flex flex-col min-w-0">
          <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevWeek} className="p-1 hover:bg-slate-100 rounded">
                <img src={iChevron} alt="" className="size-5 rotate-90 opacity-60" />
              </button>
              <p className="font-bold text-[#0f172a] text-base">{getWeekString()}</p>
              <button onClick={handleNextWeek} className="p-1 hover:bg-slate-100 rounded">
                <img src={iChevron} alt="" className="size-5 -rotate-90 opacity-60" />
              </button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="bg-white drop-shadow-sm px-4 py-1.5 rounded-md text-sm font-semibold text-[#0f172a]">Tuần</button>
              <button className="px-4 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a]">Tháng</button>
            </div>
          </div>

          <div className="flex-1 flex overflow-auto relative p-4">
            {/* simple grid calendar */}
            <div className="flex flex-col w-full min-w-[800px]">
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="w-16"></div>
                {days.map(d => (
                  <div key={d} className="text-center pb-2 border-b border-slate-200">
                    <p className="text-[#64748b] text-xs font-semibold uppercase">{d}</p>
                  </div>
                ))}
              </div>
              <div className="flex-1 relative">
                {hours.map((h, i) => (
                  <div key={h} className="grid grid-cols-8 gap-2 relative h-24 group">
                    <div className="w-16 flex justify-end pr-3">
                      <span className="text-[#94a3b8] text-[11px] font-medium -mt-2">{h}</span>
                    </div>
                    {days.map((_, col) => (
                      <div key={col} className="border-t border-slate-200 group-hover:bg-slate-50/50 transition-colors relative">
                        {/* Đường kẻ lằn ranh đứt quãng cho giữa giờ (lẻ) */}
                        <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-200/60 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Render classes directly over the grid */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8 gap-2 pl-[4.5rem]">
                  {days.map((_, colIdx) => (
                    <div key={colIdx} className="relative h-full">
                      {classesThisWeek.filter(c => c.day === colIdx).map((c, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedClassId(c.id)}
                          className={`absolute w-full rounded-md border border-l-4 p-1 flex flex-col justify-between pointer-events-auto cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden ${c.color}`}
                          style={{ 
                            top: `${c.hour * 6}rem`, 
                            height: `calc(${c.duration * 6}rem - 2px)`, 
                            marginTop: '1px',
                            zIndex: 10
                          }}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <p className={`font-bold text-[10px] leading-tight truncate ${c.text}`}>{c.name}</p>
                            <span className="bg-white/90 px-1 py-0.5 rounded text-[8px] font-bold shrink-0 shadow-sm border border-black/5 leading-none">{c.enrolled}</span>
                          </div>
                          <div className={`flex items-center justify-between opacity-80 mt-auto ${c.text}`}>
                            <div className="flex items-center gap-0.5 truncate min-w-0 pr-1">
                              <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <p className="text-[8px] font-medium truncate">{c.room}</p>
                            </div>
                            <div className="flex items-center gap-0.5 truncate shrink-0">
                              <svg className="w-2.5 h-2.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              <p className={`text-[8px] font-medium truncate ${c.text}`}>{c.coach}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full flex-1 min-h-0">
          <div className="flex flex-col w-full h-full overflow-hidden">
            <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[24px] py-[14px] text-[#64748b] text-[13px] w-full border-b border-[#e2e8f0] shrink-0">
              <span className="flex-1 min-w-0">HỘI VIÊN</span>
              <span className="w-[180px] shrink-0">LỚP HỌC</span>
              <span className="w-[160px] shrink-0">THỜI GIAN</span>
              <span className="w-[160px] shrink-0">ĐẶT LÚC</span>
              <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
              <span className="w-[80px] shrink-0 text-right">THAO TÁC</span>
            </div>
            <div className="flex flex-col flex-1 w-full overflow-y-auto">
              {bookings.map((b) => (
                <BookingRow 
                  key={b.id} 
                  booking={b} 
                  handleApprove={handleApprove} 
                  handleReject={handleReject} 
                />
              ))}
              {bookings.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-sm">Chưa có dữ liệu đặt chỗ</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
