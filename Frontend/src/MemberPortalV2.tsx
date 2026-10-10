import { NewMemberPage, Navigate } from "./pages/MemberPortal/views/v2/types";
import { Schedule } from "./pages/MemberPortal/views/v2/ScheduleV2";
import { Success } from "./pages/MemberPortal/views/v2/SuccessV2";
import { Workout } from "./pages/MemberPortal/views/v2/WorkoutV2";
import { AiAssistant } from "./pages/MemberPortal/views/v2/AiAssistantV2";

export type { NewMemberPage, Navigate };

export default function MemberPortalV2({ page, onNavigate, selectedClass }: { page: NewMemberPage; onNavigate: Navigate; selectedClass?: any }) {
  if (page === "schedule") return <Schedule onNavigate={onNavigate} />
  if (page === "success") return <Success onNavigate={onNavigate} selectedClass={selectedClass} />
  if (page === "workout") return <Workout onNavigate={onNavigate} />
  return <AiAssistant onNavigate={onNavigate} />
}
