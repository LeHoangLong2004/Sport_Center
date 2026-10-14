import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import CoachScheduleRequestModal from "./CoachScheduleRequestModal";
interface Props {
  isRequestModalOpen: any;
  setIsRequestModalOpen: any;
  handleSubmitRequest: any;
  selectedSessionForRequest: any;
  setSelectedSessionForRequest: any;
  allUnifiedSessions: any;
  requestType: any;
  setRequestType: any;
  substituteCoach: any;
  setSubstituteCoach: any;
  newDate: any;
  setNewDate: any;
  newTime: any;
  setNewTime: any;
  reason: any;
  setReason: any;
  submittingRequest: any;
  isOpenSlotModalOpen: any;
  setIsOpenSlotModalOpen: any;
  handleCreateOpenSlot: any;
  openSlotDate: any;
  setOpenSlotDate: any;
  openSlotStartTime: any;
  setOpenSlotStartTime: any;
  openSlotEndTime: any;
  setOpenSlotEndTime: any;
  TIME_ROWS: string[];
  openSlotSport: any;
  setOpenSlotSport: any;
  openSlotRoom: any;
  setOpenSlotRoom: any;
  openSlotNote: any;
  setOpenSlotNote: any;
  selectedOpenSlot: any;
  setSelectedOpenSlot: any;
  handleDeleteOpenSlot: any;
}
export default function CoachScheduleModals(props: Props) {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    handleSubmitRequest,
    selectedSessionForRequest,
    setSelectedSessionForRequest,
    allUnifiedSessions,
    requestType,
    setRequestType,
    substituteCoach,
    setSubstituteCoach,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    reason,
    setReason,
    submittingRequest,
    isOpenSlotModalOpen,
    setIsOpenSlotModalOpen,
    handleCreateOpenSlot,
    openSlotDate,
    setOpenSlotDate,
    openSlotStartTime,
    setOpenSlotStartTime,
    openSlotEndTime,
    setOpenSlotEndTime,
    TIME_ROWS,
    openSlotSport,
    setOpenSlotSport,
    openSlotRoom,
    setOpenSlotRoom,
    openSlotNote,
    setOpenSlotNote,
    selectedOpenSlot,
    setSelectedOpenSlot,
    handleDeleteOpenSlot,
  } = props;
  return (
    <>
      <CoachScheduleRequestModal
        isRequestModalOpen={isRequestModalOpen}
        setIsRequestModalOpen={setIsRequestModalOpen}
        handleSubmitRequest={handleSubmitRequest}
        selectedSessionForRequest={selectedSessionForRequest}
        setSelectedSessionForRequest={setSelectedSessionForRequest}
        allUnifiedSessions={allUnifiedSessions}
        requestType={requestType}
        setRequestType={setRequestType}
        substituteCoach={substituteCoach}
        setSubstituteCoach={setSubstituteCoach}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        reason={reason}
        setReason={setReason}
        submittingRequest={submittingRequest}
      />
      {/* MODAL 1: ĐĂNG LỊCH TRỐNG 1-1 - CHUẨN GIỐNG 'TẠO GIÁO ÁN MỚI' */}
      {isOpenSlotModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Đăng lịch trống 1–1 (Mở nhận HV)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpenSlotModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateOpenSlot} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ngày mở ca trống: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={openSlotDate}
                      onChange={(e) => setOpenSlotDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Giờ bắt đầu:
                      </label>
                      <select
                        value={openSlotStartTime}
                        onChange={(e) => setOpenSlotStartTime(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {TIME_ROWS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Giờ kết thúc:
                      </label>
                      <select
                        value={openSlotEndTime}
                        onChange={(e) => setOpenSlotEndTime(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {["07:30", "08:30", "09:30", "10:30", "15:30", "16:30", "18:30", "19:30", "20:30"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Bộ môn nhận dạy:
                      </label>
                      <select
                        value={openSlotSport}
                        onChange={(e) => setOpenSlotSport(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {["Gym", "Boxing", "Yoga", "Swimming", "Pilates", "Zumba", "Fitness"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Phòng / Khu vực:
                      </label>
                      <select
                        value={openSlotRoom}
                        onChange={(e) => setOpenSlotRoom(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {["Khu PT 1-1", "Võ Đài", "Studio 1", "Studio 2", "Hồ Bơi", "Khu Thể Lực", "Khu Tạ Tự Do"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ghi chú / Thông điệp gửi học viên:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="VD: Nhận kèm cá nhân tập trung siết cơ, giảm mỡ nhanh hoặc cải thiện thể lực..."
                      value={openSlotNote}
                      onChange={(e) => setOpenSlotNote(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsOpenSlotModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
                  >
                    Đăng lịch trống
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      {/* MODAL 2: CHI TIẾT & HỦY / ĐÓNG LỊCH TRỐNG 1-1 */}
      {selectedOpenSlot &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Lịch trống 1–1 (Đang mở nhận HV)
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedOpenSlot(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-3 text-xs">
                <div className="space-y-2.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Bộ môn:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedOpenSlot.sport} (1–1)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Ngày dạy:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOpenSlot.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Khung giờ:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOpenSlot.startTime} – {selectedOpenSlot.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Phòng / Khu vực:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOpenSlot.room}</span>
                  </div>
                  {selectedOpenSlot.note && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-400 font-medium block mb-1">Ghi chú cho hội viên:</span>
                      <p className="italic text-slate-600 dark:text-slate-300">"{selectedOpenSlot.note}"</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => handleDeleteOpenSlot(selectedOpenSlot.id)}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hủy ca trống này
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOpenSlot(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
