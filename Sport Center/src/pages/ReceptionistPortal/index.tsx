import React, { useState } from 'react';
import { breadcrumbs, Page } from './shared';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CheckInPage } from './views/CheckInPage';
import { RegisterPage } from './views/RegisterPage';
import { SchedulePage } from './views/SchedulePage';
import { PosPage } from './views/PosPage';
import { LookupPage } from './views/LookupPage';
import { DetailPage } from './views/DetailPage';

export default function ReceptionistPortal({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState<Page>("checkin")

  const { bc, title, shift } = breadcrumbs[page]

  return (
    <div className="theme-receptionist bg-[#f8fafc] flex items-start" style={{ minHeight: "100dvh" }}>
      <Sidebar page={page} onNavigate={setPage} onLogout={onExit} />
      <div className="flex flex-1 flex-col items-start min-w-0 self-stretch">
        <TopBar breadcrumb={bc} title={title} shiftLabel={shift} />
        <div className="flex flex-1 flex-col items-start min-h-0 w-full overflow-y-auto">
          {page === "checkin" && <CheckInPage />}
          {page === "register" && <RegisterPage />}
          {page === "schedule" && <SchedulePage />}
          {page === "pos" && <PosPage />}
          {page === "lookup" && <LookupPage onDetail={() => setPage("detail")} />}
          {page === "detail" && <DetailPage onBack={() => setPage("lookup")} />}
        </div>
      </div>
    </div>
  )
}
