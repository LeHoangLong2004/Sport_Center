import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { DateInput } from "../../../components/DateInput";

interface Props {
  isRequestModalOpen: any;
  setIsRequestModalOpen: any;
  handleSubmitRequest: any;
  selectedSessionForRequest: any;
  setSelectedSessionForRequest: any;
  allUnifiedSessions: Array<{ id: string; date: string; startTime: string; endTime: string; className: string }>;
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
}

export default function CoachScheduleRequestModal(props: Props) {
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
  } = props;

  return (
    <>
      {/* REQUEST MODAL - CHUẨN GIỐNG 'TẠO GIÁO ÁN MỚI' */}
      {isRequestModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Gửi yêu cầu điều chỉnh ca dạy
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Chọn ca dạy cần điều chỉnh: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedSessionForRequest}
                      onChange={(e) => setSelectedSessionForRequest(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {allUnifiedSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.date} ({s.startTime} - {s.endTime}) • {s.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Loại yêu cầu:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["dời lịch", "dạy thay", "báo vắng"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setRequestType(t)}
                          className={`p-2.5 rounded-lg border text-center font-semibold capitalize transition-all ${
                            requestType === t
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {requestType === "dạy thay" && (
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Huấn luyện viên thay thế đề xuất:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: HLV Trần Minh Tuấn..."
                        value={substituteCoach}
                        onChange={(e) => setSubstituteCoach(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                      />
                    </div>
                  )}

                  {requestType === "dời lịch" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Ngày mới đề xuất:
                        </label>
                        <DateInput
                          value={newDate}
                          onChange={setNewDate}
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Khung giờ mới:
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 08:00 - 09:30"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Lý do cụ thể: <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Điền lý do cụ thể gửi tới ban quản lý..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submittingRequest ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

    </>
  );
}

