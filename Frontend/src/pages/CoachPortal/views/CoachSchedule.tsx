import { useState, useMemo } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import { Send, CalendarPlus, CheckCircle2 } from "lucide-react";
import {
  type MainTab,
  type ViewMode,
  type TypeFilter,
  type SportFilter,
  type StatusFilter,
  type UnifiedScheduleItem,
} from "./schedule/types";
import ScheduleFilterBar from "./schedule/ScheduleFilterBar";
import ScheduleWeekGrid from "./schedule/ScheduleWeekGrid";
import ScheduleListView from "./schedule/ScheduleListView";
import CoachAvailabilityTab from "./schedule/CoachAvailabilityTab";
import CoachRequestsTab from "./schedule/CoachRequestsTab";
import ScheduleRequestModal from "./schedule/ScheduleRequestModal";
import OpenPtSlotModal from "./schedule/OpenPtSlotModal";
import OpenPtDetailModal from "./schedule/OpenPtDetailModal";
import PtSessionDetailModal from "./schedule/PtSessionDetailModal";
import { useCoachScheduleData } from "./schedule/useCoachScheduleData";
import { CreateClassModal } from "../../AdminDashboard/components/CreateClassModal";

export type { UnifiedScheduleItem } from "./schedule/types";

interface Props {
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export default function CoachSchedule({ navigateTo }: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>("schedule");
  const [view, setView] = useState<ViewMode>("week");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [weekOffset, setWeekOffset] = useState(0);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSessionForRequest, setSelectedSessionForRequest] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [isOpenSlotModalOpen, setIsOpenSlotModalOpen] = useState(false);
  const [isClassProposalModalOpen, setIsClassProposalModalOpen] = useState(false);
  const [selectedOpenSlot, setSelectedOpenSlot] = useState<UnifiedScheduleItem | null>(null);
  const [selectedPtSession, setSelectedPtSession] = useState<UnifiedScheduleItem | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const weekDates = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const distanceToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [weekOffset]);

  const {
    requests,
    availabilitySlots,
    allUnifiedSessions,
    loading,
    addOpenSlot,
    removeOpenSlot,
    toggleSlot,
    addRequest,
  } = useCoachScheduleData(weekDates);

  const SPORT_OPTIONS = useMemo(() => {
    const list = Array.from(new Set(allUnifiedSessions.map((s) => s.sport).filter(Boolean)));
    return ["all", ...list];
  }, [allUnifiedSessions]);

  const filteredSessions = useMemo(() => {
    return allUnifiedSessions.filter((s) => {
      if (sportFilter !== "all" && s.sport !== sportFilter) return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [allUnifiedSessions, sportFilter, typeFilter, statusFilter]);

  const byDate = useMemo(() => {
    const map = new Map<string, UnifiedScheduleItem[]>();
    for (const s of filteredSessions) {
      const arr = map.get(s.date) || [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)) as [string, UnifiedScheduleItem[]][];
  }, [filteredSessions]);

  const handleSubmitRequest = async (data: any) => {
    try {
      const res = await CoachAPI.createScheduleRequest(data);
      if (res?.data) addRequest(res.data);
      setFeedbackMsg(`Yêu cầu ${data.requestType} đã được gửi tới Ban Quản Lý!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOpenSlotSuccess = async (newItem: UnifiedScheduleItem) => {
    await addOpenSlot(newItem);
    setFeedbackMsg(`Đã đăng lịch trống 1-1 (${newItem.sport} ngày ${newItem.date}) thành công!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDeleteOpenSlot = async (slotId: string) => {
    await removeOpenSlot(slotId);
    setSelectedOpenSlot(null);
    setFeedbackMsg("Đã đóng/hủy lịch trống 1-1 này.");
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleSlot = async (slotId: string) => {
    toggleSlot(slotId);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">HLV / LỊCH DẠY</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Lịch dạy & Ca làm việc
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsClassProposalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <CalendarPlus className="w-4 h-4" />
            Đề xuất lớp học
          </button>

          <button
            type="button"
            onClick={() => setIsOpenSlotModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <CalendarPlus className="w-4 h-4" />
            Đăng lịch trống 1–1
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedSessionForRequest(allUnifiedSessions[0]?.id || "");
              setIsRequestModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Yêu cầu ca dạy / Dạy thay
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {isClassProposalModalOpen && (
        <CreateClassModal
          mode="coach"
          onSuccess={() => {
            setFeedbackMsg("Đề xuất lớp học đã được gửi để Manager duyệt.");
            setTimeout(() => setFeedbackMsg(null), 4000);
          }}
          onClose={() => {
            setIsClassProposalModalOpen(false);
          }}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "schedule"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Lịch dạy & PT 1–1
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "availability"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Khung giờ rảnh
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "requests"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Yêu cầu ca dạy ({requests.length})
        </button>
      </div>

      {activeTab === "schedule" && (
        <div className="flex flex-col gap-5">
          <ScheduleFilterBar
            sportFilter={sportFilter}
            setSportFilter={setSportFilter}
            sportOptions={SPORT_OPTIONS}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            view={view}
            setView={setView}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
          />

          {view === "week" && (
            <ScheduleWeekGrid
              weekDates={weekDates}
              todayStr={todayStr}
              filteredSessions={filteredSessions}
              onSelectOpenSlot={setSelectedOpenSlot}
              onSelectPtSession={setSelectedPtSession}
              navigateTo={navigateTo}
            />
          )}

          {view === "list" && (
            <ScheduleListView
              byDate={byDate}
              todayStr={todayStr}
              loading={loading}
              onSelectOpenSlot={setSelectedOpenSlot}
              onSelectPtSession={setSelectedPtSession}
              onOpenRequestModal={(sessionId) => {
                setSelectedSessionForRequest(sessionId || allUnifiedSessions[0]?.id || "");
                setIsRequestModalOpen(true);
              }}
              navigateTo={navigateTo}
            />
          )}
        </div>
      )}

      {activeTab === "availability" && (
        <CoachAvailabilityTab
          availabilitySlots={availabilitySlots}
          onToggleSlot={handleToggleSlot}
        />
      )}

      {activeTab === "requests" && (
        <CoachRequestsTab
          requests={requests}
          onOpenCreateRequest={() => {
            setSelectedSessionForRequest(allUnifiedSessions[0]?.id || "");
            setIsRequestModalOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <ScheduleRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        sessions={allUnifiedSessions}
        initialSessionId={selectedSessionForRequest}
        onSubmit={handleSubmitRequest}
      />

      <OpenPtSlotModal
        isOpen={isOpenSlotModalOpen}
        onClose={() => setIsOpenSlotModalOpen(false)}
        onSuccess={handleCreateOpenSlotSuccess}
      />

      <OpenPtDetailModal
        slot={selectedOpenSlot}
        onClose={() => setSelectedOpenSlot(null)}
        onDelete={handleDeleteOpenSlot}
      />

      <PtSessionDetailModal
        session={selectedPtSession}
        onClose={() => setSelectedPtSession(null)}
        onRequestReschedule={(sid) => {
          setSelectedSessionForRequest(sid);
          setIsRequestModalOpen(true);
        }}
        navigateTo={navigateTo}
      />
    </div>
  );
}
