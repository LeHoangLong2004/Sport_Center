import React, { useState } from 'react';
import { breadcrumbs, Page, avatarByPage } from './shared';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CheckInPage } from './views/CheckInPage';
import { RegisterPage } from './views/RegisterPage';
import { SchedulePage } from './views/SchedulePage';
import { PosPage } from './views/PosPage';
import { LookupPage } from './views/LookupPage';
import { DetailPage } from './views/DetailPage';
import { ProfileSettings } from '../../components/ProfileSettings';

export default function ReceptionistPortal({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState<Page>("checkin")

  const { bc, title, shift } = breadcrumbs[page]

  return (
    <div className="flex w-full h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans text-slate-900 dark:text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      <Sidebar page={page} onNavigate={setPage} onLogout={onExit} />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar breadcrumb={bc} title={title} shiftLabel={shift} onProfileClick={() => setPage("profile")} />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {page === "checkin" && <CheckInPage />}
          {page === "register" && <RegisterPage />}
          {page === "schedule" && <SchedulePage />}
          {page === "pos" && <PosPage />}
          {page === "lookup" && <LookupPage onDetail={() => setPage("detail")} />}
          {page === "detail" && <DetailPage onBack={() => setPage("lookup")} />}
          {page === "profile" && (
            <ProfileSettings 
              roleLabel="Lễ tân" 
              initialData={{ fullName: "Ngọc Mai", email: "mai.ngoc@sportcenter.com", phone: "0888 123 456", avatarUrl: avatarByPage.profile }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
