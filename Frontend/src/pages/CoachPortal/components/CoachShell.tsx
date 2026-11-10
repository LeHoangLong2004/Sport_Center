import React from "react";
import { CoachScreen } from "../types";
import CoachSidebar from "./CoachSidebar";
import CoachTopbar from "./CoachTopbar";

export default function CoachShell({
  screen,
  onNavigate,
  onExit,
  children,
}: {
  screen: CoachScreen
  onNavigate: (s: CoachScreen) => void
  onExit?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans text-slate-900 dark:text-white selection:bg-emerald-500 selection:text-white">
      <CoachSidebar screen={screen} onNavigate={onNavigate} onLogout={onExit} />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <CoachTopbar screen={screen} onProfileClick={() => onNavigate("profile")} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}