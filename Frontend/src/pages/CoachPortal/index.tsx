import { useState, useEffect, type ReactNode } from "react";
import type { CoachScreen } from "./types";
import CoachShell from "./components/CoachShell";
import CoachDashboard from "./views/CoachDashboard";
import CoachSchedule from "./views/CoachSchedule";
import CoachClassDetail from "./views/CoachClassDetail";
import CoachAttendance from "./views/CoachAttendance";
import CoachMembers from "./views/CoachMembers";
import CoachMemberProfile from "./views/CoachMemberProfile";
import CoachCurriculum from "./views/CoachCurriculum";
import CoachChat from "./views/CoachChat";
import CoachReviews from "./views/CoachReviews";
import CoachNotifications from "./views/CoachNotifications";
import CoachAI from "./views/CoachAI";
import CoachProfile from "./views/CoachProfile";
import CoachSettings from "./views/CoachSettings";


export default function CoachPortal() {
  const getInitialScreen = (): CoachScreen => {
    const hash = window.location.hash.replace("#coach-", "");
    const validScreens: CoachScreen[] = [
      "dashboard",
      "schedule",
      "class-detail",
      "attendance",
      "members",
      "member-profile",
      "curriculum",
      "chat",
      "reviews",
      "notifications",
      "ai",
      "profile",
      "settings",
    ];
    if (hash === "portal") return "dashboard";
    return validScreens.includes(hash as CoachScreen) ? (hash as CoachScreen) : "dashboard";
  };

  const [screen, setScreen] = useState<CoachScreen>(getInitialScreen());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Sync hashchange with screen state
  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash.replace("#coach-", "");
      if (raw === "portal") {
        setScreen("dashboard");
      } else if (raw && ["dashboard", "schedule", "class-detail", "attendance", "members", "member-profile", "curriculum", "chat", "reviews", "notifications", "ai", "profile", "settings"].includes(raw)) {
        setScreen(raw as CoachScreen);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => {
    setScreen(s);
    window.location.hash = "#coach-" + (s === "dashboard" ? "portal" : s);
    if (extra?.sessionId !== undefined) setSelectedSessionId(extra.sessionId);
    if (extra?.memberId !== undefined) setSelectedMemberId(extra.memberId);
    else if (s === "chat") setSelectedMemberId(null);
  };

  const screenNode: Record<CoachScreen, ReactNode> = {
    dashboard: <CoachDashboard navigateTo={navigateTo} />,
    schedule: <CoachSchedule navigateTo={navigateTo} />,
    "class-detail": <CoachClassDetail sessionId={selectedSessionId} navigateTo={navigateTo} />,
    attendance: <CoachAttendance initialSessionId={selectedSessionId} navigateTo={navigateTo} />,
    members: <CoachMembers navigateTo={navigateTo} />,
    "member-profile": <CoachMemberProfile memberId={selectedMemberId} navigateTo={navigateTo} />,
    curriculum: <CoachCurriculum />,
    chat: <CoachChat initialMemberId={selectedMemberId} />,
    reviews: <CoachReviews />,
    notifications: <CoachNotifications />,
    ai: <CoachAI />,
    profile: <CoachProfile navigateTo={navigateTo} />,
    settings: <CoachSettings />,
  };

  return (
    <div className="theme-coach flex w-full h-full min-h-screen">
      <CoachShell screen={screen} onNavigate={(s) => navigateTo(s)}>
        {screenNode[screen]}
      </CoachShell>
    </div>
  );
}
