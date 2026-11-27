import React from "react";
import type { CoachScreen } from "../../types";
import type { UnifiedScheduleItem } from "./types";
import ScheduleRequestModal from "./ScheduleRequestModal";
import PtSessionDetailModal from "./PtSessionDetailModal";
import { CreateClassModal } from "../../../AdminDashboard/components/CreateClassModal";

interface Props {
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  isClassProposalModalOpen: boolean;
  setIsClassProposalModalOpen: (open: boolean) => void;
  selectedPtSession: UnifiedScheduleItem | null;
  setSelectedPtSession: (session: UnifiedScheduleItem | null) => void;
  allUnifiedSessions: UnifiedScheduleItem[];
  onSubmitRequest: (data: any) => Promise<void>;
  onRespondAppointment: (id: string, status: "Đã xác nhận" | "Coach từ chối") => void;
  onClassProposalSuccess: () => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export function CoachScheduleModals({
  isRequestModalOpen,
  setIsRequestModalOpen,
  isClassProposalModalOpen,
  setIsClassProposalModalOpen,
  selectedPtSession,
  setSelectedPtSession,
  allUnifiedSessions,
  onSubmitRequest,
  onRespondAppointment,
  onClassProposalSuccess,
  navigateTo,
}: Props) {
  return (
    <>
      {isClassProposalModalOpen && (
        <CreateClassModal
          mode="coach"
          onSuccess={onClassProposalSuccess}
          onClose={() => setIsClassProposalModalOpen(false)}
        />
      )}

      <ScheduleRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        sessions={allUnifiedSessions}
        onSubmit={onSubmitRequest}
      />

      <PtSessionDetailModal
        session={selectedPtSession}
        onClose={() => setSelectedPtSession(null)}
        onRequestReschedule={() => {
          setIsRequestModalOpen(true);
        }}
        onRespondAppointment={onRespondAppointment}
        navigateTo={navigateTo}
      />
    </>
  );
}
