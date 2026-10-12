import React, { useState, useMemo } from "react";
import { A } from "../shared";
import {
  ClassesFilters,
  ClassesGrid,
  ClassesToast,
} from "./ClassesPageSections";

export function ClassesPage() {
  const [category, setCategory] = useState("Tất cả lớp");
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [shift, setShift] = useState("Tất cả");
  const [coachQuery, setCoachQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [memberId, setMemberId] = useState("");
  const [loadingBook, setLoadingBook] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClasses = () => {
    fetch("/api/classes/available")
      .then((r) => r.json())
      .then((data) => {
        const images = [
          "60eeb.png",
          "340d3.png",
          "b0a09.png",
          "25c0c.png",
          "5709f.png",
          "8b5dc.png",
        ];
        const dayNames = [
          "Chủ Nhật",
          "Thứ Hai",
          "Thứ Ba",
          "Thứ Tư",
          "Thứ Năm",
          "Thứ Sáu",
          "Thứ Bảy",
        ];

        const mapped = data.map((d: any, i: number) => {
          const date = new Date(d.scheduleTime);
          const day = dayNames[date.getDay()];
          const dd = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const hh = String(date.getHours()).padStart(2, "0");
          const min = String(date.getMinutes()).padStart(2, "0");

          return {
            id: d.id,
            sportName: d.sportName,
            title: d.className || d.name || "Lớp học",
            coach: d.coachName || "N/A",
            schedule: `${day}, ${dd}/${mm} • ${hh}:${min} (${d.durationMinutes} phút)`,
            room: `Phòng: ${d.facilityName}`,
            spacesText: `Còn ${d.availableSpots ?? d.capacity - (d.currentEnrolled || d.currentBookings || 0)} chỗ`,
            spaces:
              d.availableSpots ??
              d.capacity - (d.currentEnrolled || d.currentBookings || 0),
            image: images[i % images.length],
            startHour: date.getHours(),
            date: date.getDate(),
            rawDate: d.scheduleTime,
          };
        });
        setClasses(mapped);
      })
      .catch((e) => console.error(e));
  };

  React.useEffect(() => {
    fetchClasses();

    fetch("/api/sports")
      .then((r) => r.json())
      .then((data) => setSports(data))
      .catch((e) => console.error(e));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMembersList(
              data.filter((u: any) => u.roleName?.toLowerCase() === "member"),
            );
          }
        });
    }
  }, []);

  const visibleClasses = useMemo(
    () =>
      classes.filter((item) => {
        const matchCoach = item.coach
          .toLowerCase()
          .includes(coachQuery.toLowerCase());
        const matchCategory =
          category === "Tất cả lớp" ||
          (item.sportName &&
            item.sportName.toLowerCase().includes(category.toLowerCase())) ||
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
  );

  const handleBookForMember = async () => {
    if (!memberId || !selectedClass) return;
    setLoadingBook(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/classes/${selectedClass.id}/book-for-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ MemberId: memberId }),
        },
      );
      const d = await res.json();
      if (res.ok) {
        showToast("Đặt lớp thành công cho hội viên!", "success");
        setSelectedClass(null);
        fetchClasses(); // Refresh data
      } else {
        showToast(d.message || "Không thể đặt lớp", "error");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra: " + String(e), "error");
    } finally {
      setLoadingBook(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 flex-1 w-full max-w-6xl mx-auto relative">
      <ClassesToast toast={toast} />
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            Quản lý Lớp học & Đặt hộ
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Hỗ trợ hội viên tra cứu và giữ chỗ lớp học trực tiếp tại quầy.
          </p>
        </div>
      </div>

      <ClassesFilters
        sports={sports}
        category={category}
        setCategory={setCategory}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        coachQuery={coachQuery}
        setCoachQuery={setCoachQuery}
        shift={shift}
        setShift={setShift}
      />
      <ClassesGrid
        visibleClasses={visibleClasses}
        setSelectedClass={setSelectedClass}
      />
      {/* Booking Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">
                Đặt hộ lớp học
              </h3>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 size-8 flex items-center justify-center rounded-full transition-colors border border-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex gap-4">
                <img
                  src={`/assets/member-booking/${selectedClass.image}`}
                  className="size-16 rounded-xl object-cover shadow-sm"
                  alt=""
                />
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-slate-800 leading-tight">
                    {selectedClass.title}
                  </h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {selectedClass.schedule}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex flex-col gap-2 text-sm text-purple-900">
                <p>
                  <strong>HLV:</strong> {selectedClass.coach}
                </p>
                <p>
                  <strong>Phòng:</strong> {selectedClass.room}
                </p>
                <p>
                  <strong>Tình trạng:</strong> {selectedClass.spacesText}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                  Chọn hội viên cần đặt hộ:
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                >
                  <option value="">-- Chọn hội viên --</option>
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.email})
                    </option>
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
  );
}
