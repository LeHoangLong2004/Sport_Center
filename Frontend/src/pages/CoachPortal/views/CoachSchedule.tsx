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

export type { UnifiedScheduleItem } from "./schedule/types";

interface Props {
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export default function CoachSchedule({ navigateTo }: Props) {
  const [activeTab] = useState<MainTab>("schedule");
  const [view, setView] = useState<ViewMode>("week");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [weekOffset, setWeekOffset] = useState(0);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSessionForRequest, setSelectedSessionForRequest] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [isOpenSlotModalOpen, setIsOpenSlotModalOpen] = useState(false);
  const [selectedOpenSlot, setSelectedOpenSlot] = useState<UnifiedScheduleItem | null>(null);
  const [selectedPtSession, setSelectedPtSession] = useState<UnifiedScheduleItem | null>(null);

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
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (sportFilter !== "all" && s.sport !== sportFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [allUnifiedSessions, typeFilter, sportFilter, statusFilter]);

  const byDate = useMemo(() => {
    const map = new Map<string, UnifiedScheduleItem[]>();
    for (const s of filteredSessions) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSessions]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleCreateOpenSlotSuccess = (newItem: UnifiedScheduleItem) => {
    addOpenSlot(newItem);
    setFeedbackMsg(`Đã tạo lịch trống 1–1 thành công: ${newItem.date} (${newItem.startTime} - ${newItem.endTime})!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDeleteOpenSlot = (id: string) => {
    removeOpenSlot(id);
    setSelectedOpenSlot(null);
    setFeedbackMsg("Đã đóng/hủy ca trống thành công.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

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
              onOpenRequestModal={(sid) => {
                if (sid) setSelectedSessionForRequest(sid);
                setIsRequestModalOpen(true);
              }}
              navigateTo={navigateTo}
            />
          )}
        </div>
      )}

      {activeTab === "availability" && (
        <CoachAvailabilityTab availabilitySlots={availabilitySlots} onToggleSlot={toggleSlot} />
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
