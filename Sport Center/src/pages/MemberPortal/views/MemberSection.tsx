import React, { useState, useMemo, FormEvent } from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';
import MemberShell from '../components/MemberShell';
import Progress from '../components/Progress';

export function MemberSection({
  page,
  onNavigate,
}: {
  page: keyof typeof memberSections
  onNavigate: (page: MemberPage) => void
}) {
  const content = memberSections[page]

  return (
    <MemberShell page={page} onNavigate={onNavigate}>
      <section className="mp-overview-content">
        <div className="mp-page-heading">
          <div>
            <span className="mp-kicker">{content.kicker}</span>
            <p>{content.title}</p>
            <small>{content.description}</small>
          </div>
        </div>

        <div className="mp-dashboard-column">
          <div className="mp-stat-grid">
            {content.stats.map(([label, value, detail], index) => (
              <div
                className={`mp-stat-card ${index === 0 ? "blue" : index === 1 ? "green" : ""}`}
                key={label}
              >
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </div>
            ))}
          </div>

          <div className="mp-card">
            <strong className="mp-card-label">
              {page === "users" ? "THÔNG TIN CHI TIẾT" : "HOẠT ĐỘNG GẦN ĐÂY"}
            </strong>
            <div className="mp-schedule-table">
              {content.rows.map(([primary, secondary, meta]) => (
                <div className="mp-schedule-row" key={primary}>
                  <strong>{primary}</strong>
                  <span>{secondary}</span>
                  <span>{meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MemberShell>
  )
}
