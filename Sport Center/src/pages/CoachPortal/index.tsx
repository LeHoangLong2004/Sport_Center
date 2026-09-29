import { useState, type ReactNode } from "react";
import { CoachScreen } from "./types";
import CoachShell from "./components/CoachShell";
import CoachDashboard from "./views/CoachDashboard";
import { CoachSchedule } from "./views/CoachSchedule";
import { CoachCurriculum } from "./views/CoachCurriculum";
import { CoachAssessment } from "./views/CoachAssessment";
import { CoachAttendance } from "./views/CoachAttendance";
import CoachProfile from "./views/CoachProfile";
import { CoachAI } from "./views/CoachAI";

export default function CoachPortal() {
  const [screen, setScreen] = useState<CoachScreen>("dashboard")

  const screens: Record<CoachScreen, ReactNode> = {
    dashboard: <CoachDashboard onNavigate={setScreen} />,
    schedule: <CoachSchedule />,
    curriculum: <CoachCurriculum />,
    assessment: <CoachAssessment />,
    attendance: <CoachAttendance />,
    profile: <CoachProfile />,
    ai: <CoachAI />,
  }

  return (
    <div className="theme-coach flex w-full h-full min-h-screen">
      <CoachShell screen={screen} onNavigate={setScreen}>
        {screens[screen]}
      </CoachShell>
    </div>
  )
}
