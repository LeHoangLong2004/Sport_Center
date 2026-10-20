import React, { useState, useEffect } from "react"; import { CreateClassModal } from "../components/CreateClassModal"; import { ClassDetailModal } from "../components/ClassDetailModal"; import { ScheduleFilters } from "./ScheduleFilters"; import { ScheduleBookings } from "./ScheduleBookings"; import { ScheduleHeader, type ScheduleTab } from "./ScheduleHeader";
import { ScheduleCalendarView } from "./ScheduleCalendarView"; export function SchedulePage({ initialTab = "calendar" }: { initialTab?: ScheduleTab } = {}) { const days = [ "Thứ 2", "Thứ 3", "Thứ 4",
"Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật", ]; const hours = Array.from({ length: 15 }, (_, index) =>
`${String(index + 6).padStart(2, "0")}:00`, ); const [classes, setClasses] = useState<any[]>([]); const [showCreateModal, setShowCreateModal] = useState(false); const [selectedClassId, setSelectedClassId] = useState<string | null>(null); const [editClassData, setEditClassData] = useState<any>(null);
const [searchQuery, setSearchQuery] = useState(""); const [selectedRooms, setSelectedRooms] = useState<string[]>([]); const [activeTab, setActiveTab] = useState<ScheduleTab>(initialTab); const [bookings, setBookings] = useState<any[]>([]); const [facilities, setFacilities] = useState<string[]>([]); const [proposalSearch, setProposalSearch] = useState("");
useEffect(() => { setActiveTab(initialTab); }, [initialTab]); const handleRoomChange = (room: string) => { if (!room || room === "Tất cả") { setSelectedRooms([]);
} else { setSelectedRooms([room]); } };
// Lấy ngày bắt đầu của tuần hiện tại (Thứ 2)
const [currentWeekStart, setCurrentWeekStart] = useState(() => { const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const monday = new Date(d.setDate(diff)); monday.setHours(0, 0, 0, 0);
return monday; }); const getWeekString = () => { const end = new Date(currentWeekStart); end.setDate(end.getDate() + 6); const formatDate = (date: Date) => {
return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`; }; return `${formatDate(currentWeekStart)} - ${formatDate(end)}, ${end.getFullYear()}`; }; const weekDates = days.map((label, index) => { const date = new Date(currentWeekStart);
date.setDate(date.getDate() + index); return { label, date: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1) .toString() .padStart(2, "0")}`,
iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String( date.getDate(), ).padStart(2, "0")}`, }; }); const fetchClasses = async () => {
try { const token = localStorage.getItem("token"); const res = await fetch("/api/classes/all", { headers: token ? { Authorization: `Bearer ${token}` } : {}, }); if (res.ok) {
const data = await res.json(); const formattedClasses = data.map((c: any, i: number) => { const start = new Date(c.scheduleTime); const end = new Date( start.getTime() + (c.durationMinutes || 60) * 60000, );
const day = start.getDay() === 0 ? 6 : start.getDay() - 1; const startHour = start.getHours() + start.getMinutes() / 60; const endHour = end.getHours() + end.getMinutes() / 60; const hourIndex = (startHour - 6) / 2; const durationIndex = (endHour - startHour) / 2; let colorBg = "";
let colorText = ""; if (c.status === false) { colorBg = "bg-gray-100 border-gray-300 border-l-gray-400 opacity-60"; colorText = "text-gray-500 line-through"; } else { const colorOptions = [
{ bg: "bg-blue-50 border-blue-200 border-l-blue-500", text: "text-blue-700" }, { bg: "bg-emerald-50 border-emerald-200 border-l-emerald-500", text: "text-emerald-700" }, { bg: "bg-violet-50 border-violet-200 border-l-violet-500", text: "text-violet-700" }, { bg: "bg-orange-50 border-orange-200 border-l-orange-500", text: "text-orange-700" }, { bg: "bg-rose-50 border-rose-200 border-l-rose-500", text: "text-rose-700" }, ];
const color = colorOptions[i % colorOptions.length]; colorBg = color.bg; colorText = color.text; } return { id: c.id,
name: c.className, sport: c.sportName, room: c.facilityName || "Studio", coach: c.coachName, enrolled: `${c.currentEnrolled || 0}/${c.capacity || 0}`, day: day,
hour: hourIndex, duration: durationIndex, durationMinutes: c.durationMinutes || 60, color: colorBg, text: colorText, rawStart: start,
isCancelled: c.status === false, approvalStatus: c.approvalStatus || "approved", }; }); setClasses(formattedClasses);
// Fallback để dropdown vẫn có dữ liệu nếu endpoint phòng tập tạm thời lỗi.
const roomsFromClasses = Array.from( new Set( formattedClasses .map((item: any) => item.room?.trim()) .filter(Boolean), ),
) as string[]; setFacilities((current) => (current.length ? current : roomsFromClasses)); } } catch (error) { console.error("Failed to fetch classes:", error); }
}; const fetchFacilities = async () => { try { const res = await fetch("/api/facilities"); if (res.ok) { const data = await res.json();
const roomNames = Array.from( new Set( (Array.isArray(data) ? data : []) .map((facility: any) => facility.name?.trim()) .filter(Boolean), ),
) as string[]; if (roomNames.length > 0) { setFacilities(roomNames); } } } catch (error) {
console.error("Failed to fetch facilities:", error); } }; const fetchBookings = async () => { try { const token = localStorage.getItem("token");
const res = await fetch("/api/bookings/all", { headers: { Authorization: `Bearer ${token}` }, }); if (res.ok) { setBookings(await res.json()); }
} catch (error) { console.error("Failed to fetch bookings:", error); } }; useEffect(() => { fetchClasses();
fetchFacilities(); fetchBookings();
// A member can submit a booking from another tab/session while Manager is
// already viewing this page. Keep the approval list in sync without
// requiring a manual navigation or a full-page reload.
const refreshBookings = () => { if (document.visibilityState === "visible") { void fetchBookings(); } }; const interval = window.setInterval(refreshBookings, 15000);
window.addEventListener("focus", refreshBookings); return () => { window.clearInterval(interval); window.removeEventListener("focus", refreshBookings); }; }, []);
const handlePrevWeek = () => { const prev = new Date(currentWeekStart); prev.setDate(prev.getDate() - 7); setCurrentWeekStart(prev); }; const handleNextWeek = () => {
const next = new Date(currentWeekStart); next.setDate(next.getDate() + 7); setCurrentWeekStart(next); }; const handleCurrentWeek = () => { const today = new Date();
const day = today.getDay(); const diff = today.getDate() - day + (day === 0 ? -6 : 1); const monday = new Date(today); monday.setDate(diff); monday.setHours(0, 0, 0, 0); setCurrentWeekStart(monday);
};
// Lọc các lớp trong tuần đang chọn
const weekEnd = new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate() + 6); weekEnd.setHours(23, 59, 59, 999); let classesThisWeek = classes.filter( (c) => c.rawStart >= currentWeekStart && c.rawStart <= weekEnd, );
if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); classesThisWeek = classesThisWeek.filter( (c) => c.name.toLowerCase().includes(q) || (c.coach && c.coach.toLowerCase().includes(q)),
); } if (selectedRooms.length > 0) { classesThisWeek = classesThisWeek.filter((c) => selectedRooms.some((r) => { const classRoom = String(c.room || "").trim().toLowerCase();
const selectedRoom = r.trim().toLowerCase(); const classRoomBase = classRoom.split(" (")[0]; const selectedRoomBase = selectedRoom.split(" (")[0]; return classRoom === selectedRoom || classRoomBase === selectedRoomBase; }), );
} const handleApprove = async (id: string) => { try { const token = localStorage.getItem("token"); const res = await fetch(`/api/bookings/${id}/approve`, { method: "PUT",
headers: { Authorization: `Bearer ${token}` }, }); if (res.ok) { fetchBookings(); } } catch (error) {
console.error("Approve failed:", error); } }; const handleReject = async (id: string) => { try { const token = localStorage.getItem("token");
const res = await fetch(`/api/bookings/${id}/reject`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, }); if (res.ok) { fetchBookings();
} } catch (error) { console.error("Reject failed:", error); } }; const pendingClassProposals = classes.filter(
(item) => item.approvalStatus === "pending", ); const filteredClassProposals = pendingClassProposals.filter((item) => { const query = proposalSearch.trim().toLowerCase(); if (!query) return true; return [item.name, item.sport, item.coach, item.room]
.filter(Boolean) .some((value) => String(value).toLowerCase().includes(query)); }); const handleClassApproval = async (id: string, action: "approve" | "reject"): Promise<boolean> => { try { const token = localStorage.getItem("token");
const res = await fetch(`/api/classes/${id}/${action}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, }); if (!res.ok) { const contentType = res.headers.get("content-type") || "";
const body = contentType.includes("application/json") ? await res.json().catch(() => ({})) : {}; const errorMessage = body.message || body.detail || body.title; throw new Error(errorMessage || `Không thể xử lý đề xuất lớp học (HTTP ${res.status}).`); }
await fetchClasses(); return true; } catch (error) { console.error("Class approval action failed:", error); window.alert(error instanceof Error ? error.message : "Không thể xử lý đề xuất lớp học."); return false;
} }; return ( <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto"> <ScheduleHeader activeTab={activeTab}
onTabChange={setActiveTab} onCreate={() => setShowCreateModal(true)} proposalCount={pendingClassProposals.length} /> {showCreateModal && ( <CreateClassModal
onClose={() => { setShowCreateModal(false); fetchClasses(); }} /> )}
{editClassData && ( <CreateClassModal editData={editClassData} onClose={() => { setEditClassData(null); fetchClasses();
}} /> )} {selectedClassId && ( <ClassDetailModal classId={selectedClassId}
onClose={() => { setSelectedClassId(null); fetchClasses(); }} onEdit={(data) => { setEditClassData(data);
setSelectedClassId(null); }} onApproval={(action) => handleClassApproval(selectedClassId, action)} /> )} {activeTab === "proposals" ? (
<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"> <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5"> <div> <h2 className="text-base font-bold text-slate-900">Lớp học chờ duyệt</h2> <p className="mt-1 text-xs text-slate-600">Các đề xuất từ Coach chưa được công khai cho hội viên.</p> </div>
<span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200"> {pendingClassProposals.length} đề xuất </span> </div> <div className="mb-6 grid gap-3 sm:grid-cols-3"> <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
<p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Chờ duyệt</p> <p className="mt-2 text-2xl font-black text-slate-900">{pendingClassProposals.length}</p> <p className="mt-1 text-xs text-slate-500">Đề xuất cần xử lý</p> </div> <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"> <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tổng lớp</p>
<p className="mt-2 text-2xl font-black text-slate-900">{classes.length}</p> <p className="mt-1 text-xs text-slate-500">Đang có trên hệ thống</p> </div> <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"> <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Đã công khai</p> <p className="mt-2 text-2xl font-black text-slate-900">{classes.filter((item) => item.approvalStatus === "approved").length}</p>
<p className="mt-1 text-xs text-slate-500">Lớp đang hiển thị cho hội viên</p> </div> </div> {pendingClassProposals.length === 0 && ( <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center"> <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-emerald-600 shadow-sm ring-1 ring-slate-200">✓</div>
<p className="text-sm font-semibold text-slate-700">Hiện không có đề xuất chờ duyệt</p> <p className="mt-1 text-xs text-slate-500">Các đề xuất mới từ Coach sẽ hiển thị tại đây.</p> </div> )} {pendingClassProposals.length > 0 && ( <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
<div> <p className="text-sm font-bold text-slate-800">Danh sách đề xuất</p> <p className="text-xs text-slate-500">Bấm vào một dòng để xem đầy đủ thông tin lớp học.</p> </div> <input value={proposalSearch}
onChange={(event) => setProposalSearch(event.target.value)} placeholder="Tìm theo tên lớp, môn, Coach..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs" /> </div> )}
{pendingClassProposals.length > 0 && filteredClassProposals.length === 0 && ( <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">Không tìm thấy đề xuất phù hợp.</div> )} {filteredClassProposals.length > 0 && ( <div className="mb-4 overflow-hidden rounded-xl border border-slate-200"> <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(150px,1fr)_minmax(170px,1fr)_110px_160px] gap-4 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 md:grid">
<span>Lớp học</span><span>Coach</span><span>Thời gian</span><span>Trạng thái</span><span className="text-right">Thao tác</span> </div> <div className="divide-y divide-slate-100 bg-white"> {filteredClassProposals.map((item) => ( <div key={item.id} role="button" tabIndex={0} onClick={() => setSelectedClassId(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedClassId(item.id); }} className="grid cursor-pointer gap-3 px-4 py-4 transition hover:bg-emerald-50/40 md:grid-cols-[minmax(0,1.6fr)_minmax(150px,1fr)_minmax(170px,1fr)_110px_160px] md:items-center md:gap-4"> <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{item.name}</p><p className="mt-1 text-xs text-slate-500">{item.sport} · {item.room}</p></div>
<div className="text-sm text-slate-700">{item.coach || "Chưa phân công"}</div> <div className="text-sm text-slate-700">{item.rawStart.toLocaleString("vi-VN")}</div> <div><span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">Chờ duyệt</span></div> <div className="flex min-w-0 flex-col gap-2" onClick={(event) => event.stopPropagation()}> <button type="button" onClick={() => setSelectedClassId(item.id)} className="w-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">Xem chi tiết</button> <div className="hidden grid grid-cols-2 gap-2">
<button type="button" onClick={() => void handleClassApproval(item.id, "approve")} className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700">Duyệt</button> <button type="button" onClick={() => void handleClassApproval(item.id, "reject")} className="whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100">Từ chối</button> </div> </div> </div> ))}
</div> </div> )} <div className="hidden grid gap-4 xl:grid-cols-2"> {pendingClassProposals.map((item) => ( <div key={item.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
<div className="min-w-0"> <p className="truncate text-base font-bold text-slate-900">{item.name}</p> <p className="mt-1 text-xs text-slate-500">{item.sport} · {item.coach}</p> <p className="mt-1 text-xs text-slate-500">{item.rawStart.toLocaleString("vi-VN")} · {item.room}</p> </div> <div className="flex gap-2 border-t border-slate-100 pt-4">
<button type="button" onClick={() => void handleClassApproval(item.id, "approve")} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Duyệt</button> <button type="button" onClick={() => void handleClassApproval(item.id, "reject")} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50">Từ chối</button> </div> </div> ))} </div>
</section> ) : activeTab === "calendar" ? ( <div className="flex flex-col gap-4 pt-2 min-w-0"> <ScheduleFilters searchQuery={searchQuery} onSearchChange={setSearchQuery}
facilities={facilities} selectedRooms={selectedRooms} onRoomChange={handleRoomChange} currentWeekString={getWeekString()} onPrevWeek={handlePrevWeek} onNextWeek={handleNextWeek}
onToday={handleCurrentWeek} /> <ScheduleCalendarView hours={hours} weekDates={weekDates} classesThisWeek={classesThisWeek}
onSelectClass={(id) => setSelectedClassId(id)} /> </div> ) : ( <ScheduleBookings bookings={bookings}
onApprove={handleApprove} onReject={handleReject} /> )} </div> );
}


