import React from "react";
import type { CoachScreen } from "../../types";
import type { UnifiedScheduleItem } from "./types";
import ScheduleRequestModal from "./ScheduleRequestModal";
import OpenPtSlotModal from "./OpenPtSlotModal";
import OpenPtDetailModal from "./OpenPtDetailModal";
import PtSessionDetailModal from "./PtSessionDetailModal";
import { CreateClassModal } from "../../../AdminDashboard/components/CreateClassModal";

interface Props {
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  isOpenSlotModalOpen: boolean;
  setIsOpenSlotModalOpen: (open: boolean) => void;
  isClassProposalModalOpen: boolean;
  setIsClassProposalModalOpen: (open: boolean) => void;
  selectedSessionForRequest: string;
  setSelectedSessionForRequest: (id: string) => void;
  selectedOpenSlot: UnifiedScheduleItem | null;
  setSelectedOpenSlot: (slot: UnifiedScheduleItem | null) => void;
  selectedPtSession: UnifiedScheduleItem | null;
  setSelectedPtSession: (session: UnifiedScheduleItem | null) => void;
  allUnifiedSessions: UnifiedScheduleItem[];
  sportOptions: string[];
  roomOptions: string[];
  onSubmitRequest: (data: any) => Promise<void>;
  onCreateOpenSlotSuccess: (newItem: UnifiedScheduleItem) => Promise<void>;
  onDeleteOpenSlot: (slotId: string) => Promise<void>;
  onClassProposalSuccess: () => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export function CoachScheduleModals({
  isRequestModalOpen,
  setIsRequestModalOpen,
  isOpenSlotModalOpen,
  setIsOpenSlotModalOpen,
  isClassProposalModalOpen,
  setIsClassProposalModalOpen,
  selectedSessionForRequest,
  setSelectedSessionForRequest,
  selectedOpenSlot,
  setSelectedOpenSlot,
  selectedPtSession,
  setSelectedPtSession,
  allUnifiedSessions,
  sportOptions,
  roomOptions,
  onSubmitRequest,
  onCreateOpenSlotSuccess,
  onDeleteOpenSlot,
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
        initialSessionId={selectedSessionForRequest}
        onSubmit={onSubmitRequest}
      />

      <OpenPtSlotModal
        isOpen={isOpenSlotModalOpen}
        onClose={() => setIsOpenSlotModalOpen(false)}
        onSuccess={onCreateOpenSlotSuccess}
        sportOptions={sportOptions}
        roomOptions={roomOptions}
      />

      <OpenPtDetailModal
        slot={selectedOpenSlot}
        onClose={() => setSelectedOpenSlot(null)}
        onDelete={onDeleteOpenSlot}
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
    </>
  );
}
