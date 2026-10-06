import React from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';

import { MemberSidebar } from './MemberSidebar';
import { MemberTopbar } from './MemberTopbar';

export default function MemberShell({
  page,
  onNavigate,
  children,
}: {
  page: MemberPage
  onNavigate: (page: MemberPage) => void
  children: React.ReactNode
}) {
  return (
    <main className="mp-shell">
      <MemberSidebar page={page} onNavigate={onNavigate} />
      <div className="mp-workspace">
        <MemberTopbar page={page} onNavigate={onNavigate} />
        {children}
      </div>
    </main>
  )
}
