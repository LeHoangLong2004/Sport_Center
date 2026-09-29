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
    <div className="cp-shell">
      <CoachSidebar screen={screen} onNavigate={onNavigate} />
      <div className="cp-main">
        <CoachTopbar screen={screen} />
        <div className="cp-content">{children}</div>
      </div>
    </div>
  )
}