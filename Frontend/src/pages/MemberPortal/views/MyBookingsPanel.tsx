interface MyBookingsPanelProps {
  loading: boolean
  bookings: any[]
  cancellingId: string | null
  onExplore: () => void
  onRequestCancel: (id: string) => void
}

export function MyBookingsPanel({ loading, bookings, cancellingId, onExplore, onRequestCancel }: MyBookingsPanelProps) {
  const loadingMyBookings = loading
  const myBookings = bookings
  return (
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
                    onClick={() => onExplore()}
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
                              onClick={() => onRequestCancel(b.id)}
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

  )
}
