import { useState, useMemo } from "react";
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
import CoachRequestsTab from "./schedule/CoachRequestsTab";
import { CoachScheduleHeader } from "./schedule/CoachScheduleHeader";
import { CoachScheduleModals } from "./schedule/CoachScheduleModals";
import { useCoachScheduleData } from "./schedule/useCoachScheduleData";
import { AppointmentService } from "../../../services/appointmentService";

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
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [isClassProposalModalOpen, setIsClassProposalModalOpen] = useState(false);
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
    invitations,
    allUnifiedSessions,
    loading,
    addRequest,
  } = useCoachScheduleData(weekDates);

  const pendingInvitationsCount = useMemo(
    () =>
      invitations.filter(
        (inv) => ["approved", "đã duyệt"].includes(String(inv.status).trim().toLowerCase()),
      ).length,
    [invitations],
  );

  const SPORT_OPTIONS = useMemo(() => {
    const set = new Set<string>();
    allUnifiedSessions.forEach((s) => {
      if (s.sport) set.add(s.sport);
    });
    return ["all", ...Array.from(set)];
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

  // Tìm tuần gần nhất có ca dạy nếu tuần hiện tại trống
  const nearestSessionInfo = useMemo(() => {
    const hasCurrent = filteredSessions.some((s) => weekDates.includes(s.date));
    if (hasCurrent || filteredSessions.length === 0) return null;

    const midWeekMs = new Date(weekDates[3] || weekDates[0]).getTime();
    let closest = filteredSessions[0];
    let minDiff = Math.abs(new Date(filteredSessions[0].date).getTime() - midWeekMs);

    for (const s of filteredSessions) {
      const diff = Math.abs(new Date(s.date).getTime() - midWeekMs);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    if (!closest) return null;

    const now = new Date();
    const day = now.getDay();
    const distanceToMonday = (day + 6) % 7;
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - distanceToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    const targetDate = new Date(closest.date);
    const targetDay = targetDate.getDay();
    const targetMonday = new Date(targetDate);
    targetMonday.setDate(targetDate.getDate() - ((targetDay + 6) % 7));
    targetMonday.setHours(0, 0, 0, 0);

    const diffWeeks = Math.round((targetMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 3600 * 1000));
    return {
      offset: diffWeeks,
      date: closest.date,
      className: closest.className,
    };
  }, [filteredSessions, weekDates]);

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

  const handleAppointmentResponse = async (id: string, status: "Đã xác nhận" | "Coach từ chối") => {
    const response = await AppointmentService.updateStatus(id, status);
    if (!response.success) {
      toast.error(response.error || "Không thể phản hồi lịch hẹn.");
      return;
    }
    setSelectedPtSession(null);
    toast.success(status === "Đã xác nhận" ? "Bạn đã xác nhận lịch hẹn." : "Bạn đã từ chối lịch hẹn.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <CoachScheduleHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingInvitationsCount={pendingInvitationsCount}
        requestsCount={requests.length}
      />

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
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
            weekDates={weekDates}
          />

          {view === "week" && (
            <ScheduleWeekGrid
              weekDates={weekDates}
              todayStr={todayStr}
              filteredSessions={filteredSessions}
              onSelectPtSession={setSelectedPtSession}
              navigateTo={navigateTo}
              onSwitchToList={() => setView("list")}
              nearestSessionInfo={nearestSessionInfo}
              onJumpToWeek={(offset) => setWeekOffset(offset)}
            />
          )}

          {view === "list" && (
            <ScheduleListView
              byDate={byDate}
              todayStr={todayStr}
              loading={loading}
              onSelectPtSession={setSelectedPtSession}
              onOpenRequestModal={() => {
                setIsRequestModalOpen(true);
              }}
              navigateTo={navigateTo}
            />
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <CoachRequestsTab
          requests={requests}
          invitations={invitations}
          onOpenCreateRequest={() => {
            setIsRequestModalOpen(true);
          }}
          onOpenClassProposal={() => setIsClassProposalModalOpen(true)}
        />
      )}

      <CoachScheduleModals
        isRequestModalOpen={isRequestModalOpen}
        setIsRequestModalOpen={setIsRequestModalOpen}
        isClassProposalModalOpen={isClassProposalModalOpen}
        setIsClassProposalModalOpen={setIsClassProposalModalOpen}
        selectedPtSession={selectedPtSession}
        setSelectedPtSession={setSelectedPtSession}
        allUnifiedSessions={allUnifiedSessions}
        onSubmitRequest={handleSubmitRequest}
        onRespondAppointment={handleAppointmentResponse}
        onClassProposalSuccess={() => {
          setFeedbackMsg("Đề xuất lớp học đã được gửi để Manager duyệt.");
          setTimeout(() => setFeedbackMsg(null), 4000);
        }}
        navigateTo={navigateTo}
      />
    </div>
  );
}
