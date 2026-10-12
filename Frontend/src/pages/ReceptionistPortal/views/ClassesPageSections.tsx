export function ClassesToast({
  toast,
}: {
  toast: { msg: string; type: string } | null;
}) {
  return (
    <>
      {toast && (
        <div
          className={`fixed top-6 right-1/2 translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${
            toast.type === "success"
              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]"
              : "bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]"
          } transition-all animate-in slide-in-from-top-4 fade-in duration-300`}
        >
          <div
            className={`flex items-center justify-center size-7 shrink-0 rounded-full ${
              toast.type === "success" ? "bg-[#22c55e]" : "bg-[#ef4444]"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {toast.type === "success" ? (
                <polyline points="20 6 9 17 4 12"></polyline>
              ) : (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              )}
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-wide">
            {toast.msg}
          </span>
        </div>
      )}
    </>
  );
}

export function ClassesFilters(props: {
  sports: any[];
  category: string;
  setCategory: (value: string) => void;
  selectedDate: number;
  setSelectedDate: (value: number) => void;
  coachQuery: string;
  setCoachQuery: (value: string) => void;
  shift: string;
  setShift: (value: string) => void;
}) {
  const {
    sports,
    category,
    setCategory,
    selectedDate,
    setSelectedDate,
    coachQuery,
    setCoachQuery,
    shift,
    setShift,
  } = props;
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        <div className="flex flex-wrap gap-2">
          {["Tất cả lớp", ...sports.map((s) => s.name)].map((item) => (
            <button
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                category === item
                  ? "bg-[#a855f7] text-white shadow-md shadow-purple-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
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
          <strong className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            Lịch trong tuần
          </strong>
          <button
            onClick={() => setSelectedDate(0)}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
              selectedDate === 0
                ? "bg-purple-100 text-purple-700"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Xem tất cả
          </button>
        </div>
        <div className="flex overflow-x-auto pb-2 gap-3 hidden-scrollbar">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            const currentDay = d.getDay() === 0 ? 7 : d.getDay();
            d.setDate(d.getDate() - currentDay + 1 + i);
            const dayNames = [
              "Chủ nhật",
              "Thứ 2",
              "Thứ 3",
              "Thứ 4",
              "Thứ 5",
              "Thứ 6",
              "Thứ 7",
            ];
            const dayName = dayNames[d.getDay()];
            const dateNum = d.getDate();
            return (
              <button
                className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-xl border transition-all duration-200 ${
                  selectedDate === dateNum
                    ? "bg-purple-50 border-purple-200"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
                key={dateNum}
                onClick={() => setSelectedDate(dateNum)}
                type="button"
              >
                <span
                  className={`text-[11px] font-bold uppercase mb-1 ${
                    selectedDate === dateNum
                      ? "text-purple-600"
                      : "text-slate-400"
                  }`}
                >
                  {dayName}
                </span>
                <strong
                  className={`text-xl font-black ${
                    selectedDate === dateNum
                      ? "text-purple-700"
                      : "text-slate-700"
                  }`}
                >
                  {dateNum}
                </strong>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <strong className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">
          Khung giờ
        </strong>
        <div className="flex flex-wrap gap-2">
          {[
            "Tất cả",
            "Sáng (06:00 - 12:00)",
            "Chiều (12:00 - 17:00)",
            "Tối (17:00 - 21:00)",
          ].map((item) => (
            <button
              className={`px-4 py-2 rounded-xl border font-bold text-[13px] transition-all duration-200 ${
                shift === item
                  ? "bg-[#0f172a] border-[#0f172a] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
  );
}

export function ClassesGrid(props: {
  visibleClasses: any[];
  setSelectedClass: (item: any) => void;
}) {
  const { visibleClasses, setSelectedClass } = props;
  return (
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
              <h3 className="text-base font-bold text-white leading-tight line-clamp-1">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>
                  HLV: <strong className="text-slate-800">{item.coach}</strong>
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  item.spaces > 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {item.spacesText}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
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
  );
}
