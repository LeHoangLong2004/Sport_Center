import React, { useState, useMemo, useEffect } from "react";
import {
  ClassesFilters,
  ClassesGrid,
  ClassesToast,
} from "./ClassesPageSections";
import { ReceptionistBookClassModal } from "./classes/ReceptionistBookClassModal";

export function ClassesPage() {
  const [category, setCategory] = useState("Tất cả lớp");
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [shift, setShift] = useState("Tất cả");
  const [coachQuery, setCoachQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
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

        const mapped = (Array.isArray(data) ? data : []).map((d: any, i: number) => {
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

  useEffect(() => {
    fetchClasses();

    fetch("/api/sports")
      .then((r) => r.json())
      .then((data) => setSports(Array.isArray(data) ? data : []))
      .catch((e) => console.error(e));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/users/members-lookup", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (r.ok) return r.json();
          return fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json());
        })
        .then((data) => {
          if (Array.isArray(data)) {
            const list = data.filter((u: any) => !u.roleName || u.roleName.toLowerCase() === "member");
            setMembersList(list);
          }
        })
        .catch((e) => console.error("Error loading members:", e));
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

      {/* Extracted Booking Modal */}
      <ReceptionistBookClassModal
        selectedClass={selectedClass}
        membersList={membersList}
        onClose={() => setSelectedClass(null)}
        onSuccess={(msg) => {
          showToast(msg, "success");
          fetchClasses();
        }}
        onError={(msg) => showToast(msg, "error")}
      />
    </div>
  );
}

export default ClassesPage;
