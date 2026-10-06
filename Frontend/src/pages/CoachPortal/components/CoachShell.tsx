import React from "react";
import { CoachScreen } from "../types";
import CoachSidebar from "./CoachSidebar";
import CoachTopbar from "./CoachTopbar";

export default function CoachShell({
  screen,
  onNavigate,
  children,
}: {
  screen: CoachScreen
  onNavigate: (s: CoachScreen) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans text-slate-900 dark:text-white selection:bg-orange-500 selection:text-white">
      <CoachSidebar screen={screen} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1 min-w-0">
        <CoachTopbar screen={screen} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}