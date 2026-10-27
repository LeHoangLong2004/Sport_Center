import { useState, useMemo, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
import { CoachScheduleHeader } from "./schedule/CoachScheduleHeader";
import { CoachScheduleModals } from "./schedule/CoachScheduleModals";
import { useCoachScheduleData } from "./schedule/useCoachScheduleData";

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
  const [sportOptions, setSportOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([CoachAPI.getSports(), CoachAPI.getFacilities()])
      .then(([sports, facilities]) => {
        setSportOptions(sports.map((sport) => sport.name));
        setRoomOptions(facilities.map((facility) => facility.name));
      })
      .catch(() => {
        setSportOptions([]);
        setRoomOptions([]);
      });
  }, []);

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
    invitations,
    availabilitySlots,
    allUnifiedSessions,
    loading,
    addOpenSlot,
    removeOpenSlot,
    toggleSlot,
    addRequest,
    respondInvitation,
  } = useCoachScheduleData(weekDates);

  const pendingInvitationsCount = useMemo(
    () =>
      invitations.filter(
        (inv) => inv.status === "pending" || inv.status === "waiting_substitute",
      ).length,
    [invitations],
  );

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
      const msg = `Yêu cầu ${data.requestType} đã được gửi tới Ban Quản Lý!`;
      setFeedbackMsg(msg);
      toast.success(msg);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Không thể gửi yêu cầu điều chỉnh ca dạy.");
    }
  };

  const handleCreateOpenSlotSuccess = async (newItem: UnifiedScheduleItem) => {
    await addOpenSlot(newItem);
    const msg = `Đã đăng lịch trống 1-1 (${newItem.sport} ngày ${newItem.date}) thành công!`;
    setFeedbackMsg(msg);
    toast.success(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDeleteOpenSlot = async (slotId: string) => {
    await removeOpenSlot(slotId);
    setSelectedOpenSlot(null);
    setFeedbackMsg("Đã đóng/hủy lịch trống 1-1 này.");
    toast.info("Đã đóng/hủy lịch trống 1-1 này.");
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <CoachScheduleHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingInvitationsCount={pendingInvitationsCount}
        requestsCount={requests.length}
        onOpenClassProposal={() => setIsClassProposalModalOpen(true)}
        onOpenSlotModal={() => setIsOpenSlotModalOpen(true)}
        onOpenRequestModal={() => {
          setSelectedSessionForRequest(allUnifiedSessions[0]?.id || "");
          setIsRequestModalOpen(true);
        }}
      />

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
          onToggleSlot={toggleSlot}
        />
      )}

      {activeTab === "requests" && (
        <CoachRequestsTab
          requests={requests}
          invitations={invitations}
          onRespondInvitation={respondInvitation}
          onOpenCreateRequest={() => {
            setSelectedSessionForRequest(allUnifiedSessions[0]?.id || "");
            setIsRequestModalOpen(true);
          }}
        />
      )}

      <CoachScheduleModals
        isRequestModalOpen={isRequestModalOpen}
        setIsRequestModalOpen={setIsRequestModalOpen}
        isOpenSlotModalOpen={isOpenSlotModalOpen}
        setIsOpenSlotModalOpen={setIsOpenSlotModalOpen}
        isClassProposalModalOpen={isClassProposalModalOpen}
        setIsClassProposalModalOpen={setIsClassProposalModalOpen}
        selectedSessionForRequest={selectedSessionForRequest}
        setSelectedSessionForRequest={setSelectedSessionForRequest}
        selectedOpenSlot={selectedOpenSlot}
        setSelectedOpenSlot={setSelectedOpenSlot}
        selectedPtSession={selectedPtSession}
        setSelectedPtSession={setSelectedPtSession}
        allUnifiedSessions={allUnifiedSessions}
        sportOptions={sportOptions}
        roomOptions={roomOptions}
        onSubmitRequest={handleSubmitRequest}
        onCreateOpenSlotSuccess={handleCreateOpenSlotSuccess}
        onDeleteOpenSlot={handleDeleteOpenSlot}
        onClassProposalSuccess={() => {
          setFeedbackMsg("Đề xuất lớp học đã được gửi để Manager duyệt.");
          setTimeout(() => setFeedbackMsg(null), 4000);
        }}
        navigateTo={navigateTo}
      />
    </div>
  );
}
