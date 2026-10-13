import React, { useState, useMemo } from 'react';
import { MemberPage, ClassItem, asset } from '../shared';
import MemberShell from '../components/MemberShell';
import { CancelBookingModal, NotificationModal } from '../components/ClassesModals';
import { ClassCard } from '../components/ClassCard';
import { MyBookingsPanel } from './MyBookingsPanel';


export function Classes({
  onNavigate,
  onSelect,
}: {
  onNavigate: (page: MemberPage) => void;
  onSelect: (item: ClassItem) => void;
}) {
  const [category, setCategory] = useState("Tất cả lớp");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [shift, setShift] = useState("Tất cả");
  const [coachQuery, setCoachQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'available' | 'my_bookings'>('available');
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMyBookings = () => {
    setLoadingMyBookings(true);
    const token = localStorage.getItem("token");
    fetch('/api/schedule/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMyBookings(data);
        }
      })
      .catch(e => console.error("Error fetching my bookings:", e))
      .finally(() => setLoadingMyBookings(false));
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [classToCancel, setClassToCancel] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const requestCancelBooking = (classId: string) => {
    setClassToCancel(classId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!classToCancel) return;
    setCancellingId(classToCancel);
    setShowCancelModal(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/classes/${classToCancel}/cancel-booking`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok) {
        setNotification({ show: true, type: 'success', message: "Hủy đặt chỗ thành công!" });
        fetchMyBookings();
      } else {
        setNotification({ show: true, type: 'error', message: d.message || "Không thể hủy đặt chỗ." });
      }
    } catch (err) {
      setNotification({ show: true, type: 'error', message: "Lỗi kết nối khi hủy đặt chỗ." });
    } finally {
      setCancellingId(null);
      setClassToCancel(null);
    }
  };

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

      fetch('/api/sports')
        .then(r => r.json())
        .then(data => setSports(data))
        .catch(e => console.error(e));

      fetchMyBookings();
    });
  }, []);

  const visibleClasses = useMemo(() => {
    return classes.filter(item => {
      const matchCoach = item.coach.toLowerCase().includes(coachQuery.toLowerCase());
      const matchCategory =
        category === "Tất cả lớp" ||
        (item.sportName && item.sportName.toLowerCase().includes(category.toLowerCase())) ||
        item.title.toLowerCase().includes(category.toLowerCase());
      const matchDate = !selectedDate || item.dateStr === selectedDate;
      let matchShift = true;
      if (shift.includes("Sáng")) matchShift = item.hour >= 6 && item.hour < 12;
      else if (shift.includes("Chiều")) matchShift = item.hour >= 12 && item.hour < 17;
      else if (shift.includes("Tối")) matchShift = item.hour >= 17;

      return matchCoach && matchCategory && matchDate && matchShift;
    });
  }, [coachQuery, category, classes, selectedDate, shift]);

  return (
    <MemberShell page="classes" onNavigate={onNavigate}>
      <section className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Quản lý & Đặt lịch lớp học</h2>
              <p className="text-slate-500 font-medium">Lựa chọn các lớp nhóm phù hợp hoặc theo dõi trạng thái đơn đặt lớp của bạn.</p>
            </div>

            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl shrink-0 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('available')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  viewMode === 'available' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📅 Tìm & Đặt lớp
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('my_bookings');
                  fetchMyBookings();
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'my_bookings' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📌 Lịch đã đặt
                {myBookings.length > 0 && (
                  <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {myBookings.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {viewMode === 'available' ? (
            <>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-8">
                <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                  <div className="flex flex-wrap gap-2">
                    {["Tất cả lớp", ...sports.map(s => s.name)].map(item => (
                      <button
                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
                          category === item
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <input
                      aria-label="Lọc theo huấn luyện viên"
                      onChange={event => setCoachQuery(event.target.value)}
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
                        onChange={e => setSelectedDate(e.target.value)}
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
                      "Tất cả",
                      "Sáng (06:00 - 12:00)",
                      "Chiều (12:00 - 17:00)",
                      "Tối (17:00 - 21:00)",
                    ].map(item => (
                      <button
                        className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${
                          shift === item
                            ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
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
                {visibleClasses.map(item => (
                  <ClassCard key={item.id || item.title} item={item} onSelect={onSelect} />
                  
                ))}
              </div>

              {visibleClasses.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy lớp học</h3>
                  <p className="text-slate-500">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                </div>
              )}
            </>
          ) : (
            <MyBookingsPanel loading={loadingMyBookings} bookings={myBookings} cancellingId={cancellingId} onExplore={() => setViewMode("available")} onRequestCancel={requestCancelBooking} />
          )}
        </div>

        <CancelBookingModal 
          show={showCancelModal} 
          onHide={() => setShowCancelModal(false)} 
          onConfirm={confirmCancelBooking} 
        />

        <NotificationModal 
          notification={notification} 
          onHide={() => setNotification({ ...notification, show: false })} 
        />
      </section>
    </MemberShell>
  );
}