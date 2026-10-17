import React, { useState, useEffect } from "react";
import { CreateClassModal } from "../components/CreateClassModal";
import { ClassDetailModal } from "../components/ClassDetailModal";
import { ScheduleFilters } from "./ScheduleFilters";
import { ScheduleBookings } from "./ScheduleBookings";
import { ScheduleHeader } from "./ScheduleHeader";
import { ScheduleCalendarView } from "./ScheduleCalendarView";

export function SchedulePage() {
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  const hours = Array.from({ length: 15 }, (_, index) =>
    `${String(index + 6).padStart(2, "0")}:00`,
  );

  const [classes, setClasses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [editClassData, setEditClassData] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "bookings">("calendar");
  const [bookings, setBookings] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);

  const handleRoomChange = (room: string) => {
    if (!room || room === "Tất cả") {
      setSelectedRooms([]);
    } else {
      setSelectedRooms([room]);
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
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    };
    return `${formatDate(currentWeekStart)} - ${formatDate(end)}, ${end.getFullYear()}`;
  };

  const weekDates = days.map((label, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    return {
      label,
      date: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`,
    };
  });

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes/all");
      if (res.ok) {
        const data = await res.json();
        const formattedClasses = data.map((c: any, i: number) => {
          const start = new Date(c.scheduleTime);
          const end = new Date(
            start.getTime() + (c.durationMinutes || 60) * 60000,
          );

          const day = start.getDay() === 0 ? 6 : start.getDay() - 1;
          const startHour = start.getHours() + start.getMinutes() / 60;
          const endHour = end.getHours() + end.getMinutes() / 60;
          const hourIndex = (startHour - 6) / 2;
          const durationIndex = (endHour - startHour) / 2;

          let colorBg = "";
          let colorText = "";

          if (c.status === false) {
            colorBg = "bg-gray-100 border-gray-300 border-l-gray-400 opacity-60";
            colorText = "text-gray-500 line-through";
          } else {
            const colorOptions = [
              { bg: "bg-blue-50 border-blue-200 border-l-blue-500", text: "text-blue-700" },
              { bg: "bg-emerald-50 border-emerald-200 border-l-emerald-500", text: "text-emerald-700" },
              { bg: "bg-violet-50 border-violet-200 border-l-violet-500", text: "text-violet-700" },
              { bg: "bg-orange-50 border-orange-200 border-l-orange-500", text: "text-orange-700" },
              { bg: "bg-rose-50 border-rose-200 border-l-rose-500", text: "text-rose-700" },
            ];
            const color = colorOptions[i % colorOptions.length];
            colorBg = color.bg;
            colorText = color.text;
          }

          return {
            id: c.id,
            name: c.className,
            sport: c.sportName,
            room: c.facilityName || "Studio",
            coach: c.coachName,
            enrolled: `${c.currentEnrolled || 0}/${c.capacity || 0}`,
            day: day,
            hour: hourIndex,
            duration: durationIndex,
            durationMinutes: c.durationMinutes || 60,
            color: colorBg,
            text: colorText,
            rawStart: start,
            isCancelled: c.status === false,
          };
        });
        setClasses(formattedClasses);

        // Fallback để dropdown vẫn có dữ liệu nếu endpoint phòng tập tạm thời lỗi.
        const roomsFromClasses = Array.from(
          new Set(
            formattedClasses
              .map((item: any) => item.room?.trim())
              .filter(Boolean),
          ),
        ) as string[];
        setFacilities((current) => (current.length ? current : roomsFromClasses));
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await fetch("/api/facilities");
      if (res.ok) {
        const data = await res.json();
        const roomNames = Array.from(
          new Set(
            (Array.isArray(data) ? data : [])
              .map((facility: any) => facility.name?.trim())
              .filter(Boolean),
          ),
        ) as string[];

        if (roomNames.length > 0) {
          setFacilities(roomNames);
        }
      }
    } catch (error) {
      console.error("Failed to fetch facilities:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bookings/all", {
        headers: { Authorization: `Bearer ${token}` },
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
    fetchFacilities();
    fetchBookings();

    // A member can submit a booking from another tab/session while Manager is
    // already viewing this page. Keep the approval list in sync without
    // requiring a manual navigation or a full-page reload.
    const refreshBookings = () => {
      if (document.visibilityState === "visible") {
        void fetchBookings();
      }
    };
    const interval = window.setInterval(refreshBookings, 15000);
    window.addEventListener("focus", refreshBookings);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshBookings);
    };
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

  const handleCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Lọc các lớp trong tuần đang chọn
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  let classesThisWeek = classes.filter(
    (c) => c.rawStart >= currentWeekStart && c.rawStart <= weekEnd,
  );

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    classesThisWeek = classesThisWeek.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.coach && c.coach.toLowerCase().includes(q)),
    );
  }

  if (selectedRooms.length > 0) {
    classesThisWeek = classesThisWeek.filter((c) =>
      selectedRooms.some((r) => {
        const classRoom = String(c.room || "").trim().toLowerCase();
        const selectedRoom = r.trim().toLowerCase();
        const classRoomBase = classRoom.split(" (")[0];
        const selectedRoomBase = selectedRoom.split(" (")[0];

        return classRoom === selectedRoom || classRoomBase === selectedRoomBase;
      }),
    );
  }

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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
      <ScheduleHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreate={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateClassModal
          onClose={() => {
            setShowCreateModal(false);
            fetchClasses();
          }}
        />
      )}
      {editClassData && (
        <CreateClassModal
          editData={editClassData}
          onClose={() => {
            setEditClassData(null);
            fetchClasses();
          }}
        />
      )}
      {selectedClassId && (
        <ClassDetailModal
          classId={selectedClassId}
          onClose={() => {
            setSelectedClassId(null);
            fetchClasses();
          }}
          onEdit={(data) => {
            setEditClassData(data);
            setSelectedClassId(null);
          }}
        />
      )}

      {activeTab === "calendar" ? (
        <div className="flex flex-col gap-4 pt-2 min-w-0">
          <ScheduleFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            facilities={facilities}
            selectedRooms={selectedRooms}
            onRoomChange={handleRoomChange}
            currentWeekString={getWeekString()}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onToday={handleCurrentWeek}
          />

          <ScheduleCalendarView
            hours={hours}
            weekDates={weekDates}
            classesThisWeek={classesThisWeek}
            onSelectClass={(id) => setSelectedClassId(id)}
          />
        </div>
      ) : (
        <ScheduleBookings
          bookings={bookings}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
