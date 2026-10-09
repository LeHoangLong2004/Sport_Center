import React, { useState, useMemo } from 'react';
import { MemberPage, ClassItem, asset } from '../shared';
import MemberShell from '../components/MemberShell';

export function Classes({
  onNavigate,
  onSelect,
}: {
  onNavigate: (page: MemberPage) => void;
  onSelect: (item: ClassItem) => void;
}) {
  const [category, setCategory] = useState("Tất cả lớp");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [shift, setShift] = useState("Sáng (06:00 - 12:00)");
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
                  <article
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                    key={item.id || item.title}
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span>HLV: <strong className="text-slate-800">{item.coach}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span className="text-slate-800">{item.schedule}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{item.spaces}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelect(item);
                          }}
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
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy lớp học</h3>
                  <p className="text-slate-500">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {loadingMyBookings ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-slate-600 font-medium">Đang tải danh sách đơn đặt lớp của bạn...</p>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có đơn đặt lớp nào</h3>
                  <p className="text-slate-500 mb-6">Bạn chưa đăng ký lớp học nào. Hãy chọn tab "Tìm & Đặt lớp" để đăng ký lớp tập phù hợp!</p>
                  <button
                    onClick={() => setViewMode('available')}
                    className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-colors"
                  >
                    Khám phá lớp học ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myBookings.map((b: any, idx: number) => {
                    const status = b.bookingStatus || b.status || 'confirmed';
                    const startTime = b.startTime ? new Date(b.startTime) : null;
                    const dateStr = startTime
                      ? startTime.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : 'Chưa xếp lịch';

                    let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                    let statusLabel = "🟢 Đã xác nhận";

                    if (status === 'pending') {
                      badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
                      statusLabel = "⏳ Chờ duyệt";
                    } else if (status === 'rejected') {
                      badgeClass = "bg-red-100 text-red-800 border-red-200";
                      statusLabel = "❌ Bị từ chối";
                    } else if (status === 'attended') {
                      badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                      statusLabel = "🔵 Đã tham gia";
                    } else if (status === 'cancelled') {
                      badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
                      statusLabel = "🔴 Đã hủy";
                    } else if (status === 'no_show') {
                      badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                      statusLabel = "🟡 Vắng mặt";
                    }

                    return (
                      <div key={b.id || idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              {b.sportType || 'Lớp nhóm'}
                            </span>
                            <h3 className="text-xl font-bold text-slate-800">{b.className || 'Lớp học'}</h3>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass} shrink-0`}>
                            {statusLabel}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span className="font-semibold text-slate-700">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            <span>HLV: <strong className="text-slate-800">{b.coachName || 'N/A'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            <span>Phòng: <strong className="text-slate-800">{b.roomName || 'Studio'}</strong></span>
                          </div>
                        </div>

                        {(status === 'confirmed' || status === 'pending') && (
                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              disabled={cancellingId === b.id}
                              onClick={() => requestCancelBooking(b.id)}
                              className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              {cancellingId === b.id ? "Đang hủy..." : "Hủy chỗ đặt"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Hủy đặt lớp?</h3>
                <p className="text-slate-500 font-medium text-sm">
                  Bạn có chắc chắn muốn hủy đặt chỗ cho lớp học này không? Hành động này không thể hoàn tác.
                </p>
                <div className="flex items-center gap-3 w-full pt-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={confirmCancelBooking}
                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-600/20"
                  >
                    Xác nhận hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {notification.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-4">
                {notification.type === 'success' ? (
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-800">
                  {notification.type === 'success' ? 'Thành công!' : 'Đã có lỗi xảy ra!'}
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {notification.message}
                </p>
                <div className="w-full pt-4">
                  <button
                    onClick={() => setNotification({ ...notification, show: false })}
                    className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-teal-600/20"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </MemberShell>
  );
}