import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberSessionItem } from "../types";
import {
  getSavedMemberData,
  saveMemberData,
} from "../services/memberData";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";
import { scheduleSync } from "../services/scheduleSync";
import { DateInput } from "../../../components/DateInput";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

// Group Class Catalog
const CATALOG_GROUP_CLASSES = [
  {
    id: "gc-01",
    name: "Yoga Cân Bằng Cột Sống",
    sport: "Yoga",
    level: "Cơ bản",
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 2 - Tầng 2",
    coachName: "HLV Minh Tuấn",
    coachBio: "HLV Yoga Quốc tế Alliance 500h, 8 năm kinh nghiệm phục hồi cột sống.",
    capacity: 15,
    registeredCount: 12,
    description: "Giúp giải phóng áp lực đốt sống lưng, tăng cường độ dẻo dai và hơi thở.",
  },
  {
    id: "gc-02",
    name: "Functional HIIT Giảm Mỡ",
    sport: "Gym",
    level: "Nâng cao",
    startTime: "08:30",
    endTime: "09:30",
    room: "Arena 2 - Tầng 1",
    coachName: "HLV Enam",
    coachBio: "Chuyên gia huấn luyện thể lực và siết cơ, chứng chỉ NASM-CPT.",
    capacity: 16,
    registeredCount: 14,
    description: "Tập luyện chuỗi bài tập cường độ cao kích hoạt trao đổi chất và đốt calo liên tục.",
  },
  {
    id: "gc-03",
    name: "Boxing Cardio & Phản Xạ",
    sport: "Boxing",
    level: "Trung cấp",
    startTime: "18:00",
    endTime: "19:00",
    room: "Combat Ring - Tầng 3",
    coachName: "HLV Hoàng Long",
    coachBio: "Kiện tướng Boxing quốc gia, cựu vận động viên đội tuyển.",
    capacity: 20,
    registeredCount: 18,
    description: "Rèn luyện bộ pháp di chuyển, các tổ hợp đòn cơ bản và xả stress cực tốt.",
  },
  {
    id: "gc-04",
    name: "Pilates Core & Tỉ Lệ Dáng",
    sport: "Pilates",
    level: "Cơ bản",
    startTime: "09:00",
    endTime: "10:00",
    room: "Studio 3 - Tầng 2",
    coachName: "HLV Minh Thư",
    coachBio: "HLV Pilates Reformer & Mat, chuyên cải thiện vóc dáng và võng lưng.",
    capacity: 12,
    registeredCount: 12, // full
    description: "Siết cơ trọng tâm sâu, cải thiện tư thế đứng và làm thon gọn cơ thể.",
  },
  {
    id: "gc-05",
    name: "Zumba Sôi Động & Nhịp Điệu",
    sport: "Zumba",
    level: "Mọi cấp độ",
    startTime: "19:00",
    endTime: "20:00",
    room: "Dance Studio - Tầng 2",
    coachName: "HLV Ngọc Trâm",
    coachBio: "Zumba Fitness Zin quốc tế, năng lượng bùng nổ.",
    capacity: 25,
    registeredCount: 17,
    description: "Hòa mình cùng âm nhạc Latin sôi động, đốt cháy tới 600 calo mỗi buổi.",
  },
  {
    id: "gc-06",
    name: "Bơi Sải Thể Lực & Thở Nước",
    sport: "Bơi lội",
    level: "Trung cấp",
    startTime: "17:30",
    endTime: "18:30",
    room: "Hồ bơi vô cực - Tầng 4",
    coachName: "HLV Quốc Bảo",
    coachBio: "VĐV Bơi lội chuyên nghiệp, chuyên kỹ thuật đường dài.",
    capacity: 10,
    registeredCount: 7,
    description: "Hoàn thiện kỹ thuật quạt tay, đạp chân và nhịp thở đường trường bền bỉ.",
  },
];

// Open PT slots helper
export default function MemberBooking({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"group" | "pt">("group");

  // Filters
  const [selectedDate, setSelectedDate] = useState("2026-10-14");
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const storageKey = userId ? `member_sessions_${userId}` : "member_sessions";

  // My booked sessions
  const [mySessions, setMySessions] = useState<MemberSessionItem[]>(() =>
    getSavedMemberData(storageKey, [])
  );

  // Load open slots helper
  const loadAvailablePtSlots = () => {
    return scheduleSync.getOpenPtSlots().map((s) => ({
      id: s.id,
      sport: s.sport,
      coachName: s.coachName,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      note: s.coachNote || "Ca kèm 1-1 mở",
      isBooked: false,
    }));
  };

  // PT slots state
  const [ptSlots, setPtSlots] = useState(loadAvailablePtSlots);

  useEffect(() => {
    const unsub = scheduleSync.subscribe(() => {
      setPtSlots(loadAvailablePtSlots());
      setMySessions(getSavedMemberData(storageKey, []));
    });
    return unsub;
  }, [storageKey]);

  // Modal State
  const [selectedClassDetail, setSelectedClassDetail] = useState<any | null>(null);
  const [bookingPtSlot, setBookingPtSlot] = useState<any | null>(null);
  const [ptGoal, setPtGoal] = useState("Tăng cơ & Siết nét");
  const [ptNote, setPtNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Lock body scroll on modal open
  useEffect(() => {
    if (selectedClassDetail || bookingPtSlot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedClassDetail, bookingPtSlot]);

  // Check if session is already booked
  const isBooked = (sessionName: string, date: string, startTime: string) => {
    return mySessions.some(
      (s) =>
        s.name.includes(sessionName) &&
        s.date === date &&
        s.startTime === startTime &&
        s.status !== "đã hủy"
    );
  };

  // Handle Book Group Class
  const handleBookGroupClass = (item: any) => {
    if (item.registeredCount >= item.capacity) {
      alert("Lớp đã đủ chỗ!");
      return;
    }
    if (isBooked(item.name, selectedDate, item.startTime)) {
      alert("Bạn đã đặt chỗ buổi học này rồi!");
      return;
    }

    const newSession: MemberSessionItem = {
      id: `booked-${Date.now()}`,
      name: item.name,
      sport: item.sport,
      level: item.level,
      type: "group",
      date: selectedDate,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      coachId: "coach-01",
      coachName: item.coachName,
      capacity: item.capacity,
      registeredCount: item.registeredCount + 1,
      status: "sắp diễn ra",
      attendanceStatus: "chưa điểm danh",
    };

    const updated = [newSession, ...mySessions];
    setMySessions(updated);
    saveMemberData(storageKey, updated);
    setSelectedClassDetail(null);
    setFeedback(`Đã đăng ký thành công lớp "${item.name}" ngày ${selectedDate} lúc ${item.startTime}!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Cancel Group Class
  const handleCancelBooking = (sessionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy giữ chỗ buổi học này không?")) return;
    const updated = mySessions.map((s) =>
      s.id === sessionId ? { ...s, status: "đã hủy" as const, cancelReason: "Học viên tự hủy trước giờ tập" } : s
    );
    setMySessions(updated);
    saveMemberData(storageKey, updated);
    setSelectedClassDetail(null);
    setFeedback("Đã hủy đặt chỗ thành công. Chỗ đã được nhường lại cho học viên khác.");
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Book PT Slot
  const handleConfirmPtBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPtSlot) return;

    const userStr = localStorage.getItem("user");
    const u = userStr ? JSON.parse(userStr) : null;
    const currentUserName = u?.fullName || u?.name || "Hội viên";
    const currentUserId = u?.id || "";
    const currentUserPhone = u?.phoneNumber || u?.phone || "";
    const currentUserEmail = u?.email || "";

    const booked = scheduleSync.bookPtSlot({
      slotId: bookingPtSlot.id,
      memberId: currentUserId,
      memberName: currentUserName,
      memberPhone: currentUserPhone,
      memberEmail: currentUserEmail,
      goal: ptGoal,
      userNote: ptNote.trim(),
    });

    const newSession: MemberSessionItem = {
      id: booked.id,
      name: booked.className,
      sport: booked.sport,
      level: "1-1 PT",
      type: "pt",
      date: booked.date,
      startTime: booked.startTime,
      endTime: booked.endTime,
      room: booked.room,
      coachId: booked.coachId,
      coachName: booked.coachName,
      capacity: 1,
      registeredCount: 1,
      status: "sắp diễn ra",
      attendanceStatus: "chưa điểm danh",
      coachNote: booked.coachNote,
    };

    const updatedSessions = [newSession, ...mySessions];
    setMySessions(updatedSessions);
    saveMemberData(storageKey, updatedSessions);

    // Mark slot as booked in local list
    const updatedSlots = ptSlots.map((s) =>
      s.id === bookingPtSlot.id ? { ...s, isBooked: true } : s
    );
    setPtSlots(updatedSlots);

    setBookingPtSlot(null);
    setPtNote("");
    setFeedback(`Đã đặt lịch tập kèm 1-1 với ${bookingPtSlot.coachName} lúc ${bookingPtSlot.startTime} ngày ${bookingPtSlot.date} thành công!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered Group Classes
  const filteredGroupClasses = useMemo(() => {
    return CATALOG_GROUP_CLASSES.filter((c) => {
      const matchSport = selectedSport === "all" || c.sport.toLowerCase() === selectedSport.toLowerCase();
      const matchQuery =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.coachName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSport && matchQuery;
    });
  }, [selectedSport, searchQuery]);

  // Filtered PT Slots
  const filteredPtSlots = useMemo(() => {
    return ptSlots.filter((s) => {
      const matchSport = selectedSport === "all" || s.sport.toLowerCase() === selectedSport.toLowerCase();
      const matchQuery =
        !searchQuery ||
        s.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sport.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSport && matchQuery;
    });
  }, [ptSlots, selectedSport, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER & TABS SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Khám phá & Đặt lịch tập
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chọn lớp nhóm sôi động hoặc đặt lịch tập kèm riêng 1-1 với Huấn luyện viên
          </p>
        </div>

        {/* 2 TABS */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-center border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("group")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "group"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lớp nhóm (Group Classes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pt"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Kèm riêng 1–1 (PT)</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        {/* Date filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Ngày học:</span>
          <DateInput
            value={selectedDate}
            onChange={setSelectedDate}
            className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          />
        </div>

        {/* Sport Filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Bộ môn:</span>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-800">Tất cả bộ môn</option>
            <option value="Gym" className="bg-white dark:bg-slate-800">Gym & Thể lực</option>
            <option value="Yoga" className="bg-white dark:bg-slate-800">Yoga</option>
            <option value="Boxing" className="bg-white dark:bg-slate-800">Boxing</option>
            <option value="Pilates" className="bg-white dark:bg-slate-800">Pilates</option>
            <option value="Zumba" className="bg-white dark:bg-slate-800">Zumba</option>
            <option value="Bơi lội" className="bg-white dark:bg-slate-800">Bơi lội</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === "group" ? "Tìm theo tên lớp, HLV..." : "Tìm HLV hoặc môn tập..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TAB CONTENT: GROUP CLASSES */}
      {activeTab === "group" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroupClasses.map((item) => {
            const booked = isBooked(item.name, selectedDate, item.startTime);
            const isFull = item.registeredCount >= item.capacity;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                      {item.sport} • {item.level}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isFull
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {isFull ? "Đã hết chỗ" : `Còn ${item.capacity - item.registeredCount} chỗ`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.coachName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClassDetail(item)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Xem chi tiết
                  </button>

                  {booked ? (
                    <button
                      type="button"
                      onClick={() => {
                        const s = mySessions.find((x) => x.name.includes(item.name) && x.date === selectedDate);
                        if (s) handleCancelBooking(s.id);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 font-semibold text-xs transition-colors border border-rose-200 dark:border-rose-800"
                    >
                      Hủy đặt
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => handleBookGroupClass(item)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-xs ${
                        isFull
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                      }`}
                    >
                      Đặt chỗ ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: 1-ON-1 PT SLOTS */}
      {activeTab === "pt" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <p className="font-bold">Lịch kèm riêng 1-1 do Huấn luyện viên trực tiếp mở</p>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                Các ca trống dưới đây được đồng bộ thời gian thực từ lịch mở ca của các HLV. Bạn có thể giữ chỗ tập riêng 1-1 với HLV yêu thích.
              </p>
            </div>
          </div>

          {filteredPtSlots.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa có ca tập 1-1 nào đang mở trong ngày đã chọn
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Vui lòng chọn ngày khác trên thanh lọc hoặc liên hệ trực tiếp HLV qua tin nhắn để đặt lịch riêng.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPtSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                        {slot.sport} • PT 1-1
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          slot.isBooked
                            ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {slot.isBooked ? "Đã có người đặt" : "Ca trống sẵn sàng"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {slot.coachName}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                      "{slot.note}"
                    </p>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => setBookingPtSlot(slot)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        slot.isBooked
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{slot.isBooked ? "Đã được đăng ký" : "Đặt lịch kèm 1–1 ngay"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CHI TIẾT LỚP HỌC (PORTAL TO DOCUMENT.BODY) */}
      {selectedClassDetail &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {selectedClassDetail.sport} • {selectedClassDetail.level}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedClassDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">{selectedClassDetail.description}</p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedClassDetail.startTime} - {selectedClassDetail.endTime} (Ngày {selectedDate})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Địa điểm:</span>
                    <strong>{selectedClassDetail.room}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Huấn luyện viên:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{selectedClassDetail.coachName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sĩ số lớp:</span>
                    <strong>{selectedClassDetail.registeredCount}/{selectedClassDetail.capacity} người</strong>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Về Huấn luyện viên</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {selectedClassDetail.coachBio}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold">Lưu ý khi tham gia:</p>
                  <p className="text-[11px] mt-0.5">
                    Hội viên vui lòng có mặt trước giờ tập 5-10 phút để khởi động và ổn định vị trí. Hủy lịch trước tối thiểu 2 giờ nếu bận đột xuất.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleBookGroupClass(selectedClassDetail)}
                  className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 rounded-lg shadow-sm transition-colors"
                >
                  Xác nhận đặt lớp
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 2: ĐẶT LỊCH KÈM 1-1 (PORTAL TO DOCUMENT.BODY) */}
      {bookingPtSlot &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Đặt lịch kèm riêng 1-1
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Buổi tập với {bookingPtSlot.coachName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingPtSlot(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleConfirmPtBooking} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                  {/* Slot summary card */}
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Thời gian:</span>
                      <span className="text-purple-700 dark:text-purple-300">
                        {bookingPtSlot.startTime} - {bookingPtSlot.endTime} • Ngày {bookingPtSlot.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bộ môn & Phòng:</span>
                      <span>{bookingPtSlot.sport} • {bookingPtSlot.room}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mục tiêu trọng tâm buổi tập: *
                    </label>
                    <select
                      value={ptGoal}
                      onChange={(e) => setPtGoal(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-medium"
                    >
                      <option>Tăng cơ & Siết nét (Hypertrophy)</option>
                      <option>Giảm mỡ & Đốt calo cường độ cao</option>
                      <option>Cải thiện kỹ thuật động tác chuẩn</option>
                      <option>Giãn cơ sâu & Phục hồi thể lực</option>
                      <option>Tập sức mạnh tối đa (Strength)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ghi chú / Nhắn gửi Huấn luyện viên:
                    </label>
                    <textarea
                      rows={3}
                      value={ptNote}
                      onChange={(e) => setPtNote(e.target.value)}
                      placeholder="VD: Em hơi đau mỏi vai nhẹ, hôm nay thầy tập trung cho em phần thân dưới nhé..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setBookingPtSlot(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-colors"
                  >
                    Xác nhận đặt lịch PT
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
