import React, { useState, useEffect, useMemo, useCallback } from "react";
import { iChevron } from "../shared";
import { CreateClassModal } from "../components/CreateClassModal";
import { ClassDetailModal } from "../components/ClassDetailModal";
import { ScheduleFilters } from "./ScheduleFilters";
import { ScheduleBookings } from "./ScheduleBookings";
import { ScheduleHeader } from "./ScheduleHeader";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const START_HOUR = 6;
const END_HOUR = 21;
const ROW_PX = 60;
const TIME_COL_PX = 56;
const FACILITIES = [
  'Studio 1 (Yoga/Pilates)',
  'Studio 2 (Dance)',
  'Studio 3 (Cycling)',
  'Gym Area',
];

const PALETTE = [
  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', text: '#1E40AF' },
  { bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', text: '#064E3B' },
  { bg: '#F5F3FF', border: '#DDD6FE', accent: '#7C3AED', text: '#4C1D95' },
  { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', text: '#7C2D12' },
  { bg: '#FFF1F2', border: '#FECDD3', accent: '#E11D48', text: '#881337' },
];
const CANCELLED_COLOR = { bg: '#F8FAFC', border: '#CBD5E1', accent: '#94A3B8', text: '#64748B' };

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalEvent {
  id: string;
  name: string;
  room: string;
  coach: string;
  enrolled: string;
  day: number;
  startHour: number;
  endHour: number;
  color: typeof PALETTE[0];
  rawStart: Date;
  isCancelled: boolean;
  col: number;
  totalCols: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d);
  m.setDate(diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function fmtDay(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function layout(events: CalEvent[]): CalEvent[] {
  if (!events.length) return [];
  const sorted = [...events].sort((a, b) => a.startHour - b.startHour);
  const colEnd: number[] = [];
  const withCol = sorted.map((ev) => {
    let c = colEnd.findIndex((e) => e <= ev.startHour);
    if (c === -1) {
      c = colEnd.length;
      colEnd.push(ev.endHour);
    } else {
      colEnd[c] = ev.endHour;
    }
    return { ...ev, col: c, totalCols: 0 };
  });

  withCol.forEach((ev) => {
    let maxC = ev.col;
    withCol.forEach((o) => {
      if (o.startHour < ev.endHour && o.endHour > ev.startHour) {
        maxC = Math.max(maxC, o.col);
      }
    });
    ev.totalCols = maxC + 1;
  });
  return withCol;
}

// ─── DayColumn Component ──────────────────────────────────────────────────────
function DayColumn({ events, onSelect }: { events: CalEvent[]; onSelect: (id: string) => void }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {events.map((ev) => {
        const top = (ev.startHour - START_HOUR) * ROW_PX + 1;
        const h = Math.max((ev.endHour - ev.startHour) * ROW_PX - 3, 18);
        const w = `calc(${100 / ev.totalCols}% - 3px)`;
        const left = `calc(${(ev.col / ev.totalCols) * 100}% + 1px)`;
        return (
          <div
            key={ev.id}
            onClick={() => onSelect(String(ev.id))}
            style={{
              position: 'absolute',
              top,
              left,
              width: w,
              height: h,
              background: ev.color.bg,
              borderRadius: 7,
              border: `1px solid ${ev.color.border}`,
              borderLeft: `3px solid ${ev.color.accent}`,
              padding: '4px 6px',
              boxSizing: 'border-box',
              cursor: 'pointer',
              zIndex: 5,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              opacity: ev.isCancelled ? 0.6 : 1,
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'translateY(-1px)';
              el.style.boxShadow = '0 4px 14px rgba(0,0,0,.12)';
              el.style.zIndex = '15';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = '';
              el.style.boxShadow = '';
              el.style.zIndex = '5';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 10.5,
                  lineHeight: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  color: ev.color.text,
                  textDecoration: ev.isCancelled ? 'line-through' : 'none',
                }}
              >
                {ev.name}
              </p>
              <span
                style={{
                  background: 'rgba(255,255,255,.85)',
                  border: '1px solid rgba(0,0,0,.07)',
                  borderRadius: 3,
                  padding: '1px 3px',
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: '#475569',
                  flexShrink: 0,
                  lineHeight: '11px',
                }}
              >
                {ev.enrolled}
              </span>
            </div>
            {h > 34 && (
              <span style={{ fontSize: 9, color: ev.color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                📍 {ev.room}
              </span>
            )}
            {h > 50 && (
              <span style={{ fontSize: 9, color: ev.color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                👤 {ev.coach}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export function SchedulePage() {
  const [rawClasses, setRawClasses] = useState<CalEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [editClassData, setEditClassData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings'>('calendar');
  const [bookings, setBookings] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const handleRoomChange = (room: string) => {
    if (room === 'Tất cả') {
      setSelectedRooms([]);
    } else {
      setSelectedRooms((prev) =>
        prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
      );
    }
  };

  // ── Fetch dữ liệu ───────────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes/all');
      if (!res.ok) return;
      const data: any[] = await res.json();
      setRawClasses(
        data.map((c, i) => {
          const start = new Date(c.scheduleTime);
          const end = new Date(start.getTime() + (c.durationMinutes || 60) * 60000);
          const day = start.getDay() === 0 ? 6 : start.getDay() - 1;
          const startHour = start.getHours() + start.getMinutes() / 60;
          const endHour = end.getHours() + end.getMinutes() / 60;
          const color = c.status === false ? CANCELLED_COLOR : PALETTE[i % PALETTE.length];
          return {
            id: c.id,
            name: c.className,
            room: c.facilityName || 'Studio',
            coach: c.coachName || '—',
            enrolled: `${c.currentEnrolled || 0}/${c.capacity || 0}`,
            day,
            startHour,
            endHour,
            color,
            rawStart: start,
            isCancelled: c.status === false,
            col: 0,
            totalCols: 1,
          };
        })
      );
    } catch (e) {
      console.error('Failed to fetch classes:', e);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBookings(await res.json());
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchBookings();
  }, [fetchClasses, fetchBookings]);

  // ── Thao tác duyệt/từ chối ───────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) fetchBookings();
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) fetchBookings();
    } catch (e) {
      console.error('Reject failed:', e);
    }
  };

  // ── Derived Filtered Values ─────────────────────────────────────────────────
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [weekStart]);

  const weekLabel = useMemo(() => {
    const e = new Date(weekStart);
    e.setDate(e.getDate() + 6);
    return `${fmtDay(weekStart)} – ${fmtDay(e)}, ${e.getFullYear()}`;
  }, [weekStart]);

  const filtered = useMemo(() => {
    let list = rawClasses.filter((c) => c.rawStart >= weekStart && c.rawStart <= weekEnd);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.coach && c.coach.toLowerCase().includes(q))
      );
    }
    if (selectedRooms.length > 0) {
      list = list.filter((c) =>
        selectedRooms.some((r) => c.room.includes(r.split(' (')[0]))
      );
    }
    return list;
  }, [rawClasses, weekStart, weekEnd, searchQuery, selectedRooms]);

  const columnEvents = useMemo(
    () => DAYS.map((_, di) => layout(filtered.filter((c) => c.day === di))),
    [filtered]
  );

  const totalH = (END_HOUR - START_HOUR) * ROW_PX;

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto bg-slate-50">
      <ScheduleHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreate={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateClassModal
          onClose={() => {
            setShowCreateModal(false);
            fetchClasses();
          }}
        />
      )}

      {editClassData && (
        <CreateClassModal
          editData={editClassData}
          onClose={() => {
            setEditClassData(null);
            fetchClasses();
          }}
        />
      )}

      {selectedClassId && (
        <ClassDetailModal
          classId={selectedClassId}
          onClose={() => {
            setSelectedClassId(null);
            fetchClasses();
          }}
          onEdit={(data: any) => {
            setEditClassData(data);
            setSelectedClassId(null);
          }}
        />
      )}

      {activeTab === 'calendar' ? (
        <div className="flex gap-4 pt-2 flex-1 min-h-0">
          <ScheduleFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            facilities={FACILITIES}
            selectedRooms={selectedRooms}
            onRoomChange={handleRoomChange}
          />

          {/* Calendar Panel */}
          <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl drop-shadow-sm flex flex-col min-w-0 overflow-hidden">
            {/* Top Bar chuyển tuần */}
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setWeekStart((p) => {
                      const d = new Date(p);
                      d.setDate(d.getDate() - 7);
                      return d;
                    })
                  }
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <img src={iChevron} alt="" className="size-5 rotate-90 opacity-60" />
                </button>
                <p className="font-bold text-[#0f172a] text-base">{weekLabel}</p>
                <button
                  onClick={() =>
                    setWeekStart((p) => {
                      const d = new Date(p);
                      d.setDate(d.getDate() + 7);
                      return d;
                    })
                  }
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <img src={iChevron} alt="" className="size-5 -rotate-90 opacity-60" />
                </button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="bg-white drop-shadow-sm px-4 py-1.5 rounded-md text-sm font-semibold text-[#0f172a]">
                  Tuần
                </button>
                <button className="px-4 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a]">
                  Tháng
                </button>
              </div>
            </div>

            {/* Day Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `${TIME_COL_PX}px repeat(7, 1fr)`,
                borderBottom: '2px solid #E2E8F0',
                background: '#FAFBFD',
              }}
              className="flex-shrink-0"
            >
              <div />
              {DAYS.map((d, i) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={d} style={{ textAlign: 'center', padding: '10px 4px', borderLeft: '1px solid #E2E8F0' }}>
                    <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {d}
                    </p>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isToday ? '#2563EB' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '4px auto 0',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? '#FFF' : '#334155' }}>
                        {date.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scrollable Grid Body */}
            <div className="flex-1 overflow-y-auto">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `${TIME_COL_PX}px repeat(7, 1fr)`,
                  height: totalH,
                  position: 'relative',
                  minWidth: 700,
                }}
              >
                {/* Time Labels & Grid Lines */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
                    const hour = START_HOUR + i;
                    return (
                      <React.Fragment key={hour}>
                        <div style={{ position: 'absolute', top: i * ROW_PX, left: 0, right: 0, display: 'flex', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              width: TIME_COL_PX,
                              textAlign: 'right',
                              paddingRight: 10,
                              fontSize: 10.5,
                              color: '#94A3B8',
                              fontWeight: 500,
                              lineHeight: '1',
                              marginTop: -6,
                              flexShrink: 0,
                            }}
                          >
                            {hour < END_HOUR ? `${String(hour).padStart(2, '0')}:00` : ''}
                          </span>
                          {hour < END_HOUR && <div style={{ flex: 1, borderTop: '1px solid #E2E8F0' }} />}
                        </div>
                        {hour < END_HOUR && (
                          <div
                            style={{
                              position: 'absolute',
                              top: i * ROW_PX + ROW_PX / 2,
                              left: TIME_COL_PX,
                              right: 0,
                              borderTop: '1px dashed #F1F5F9',
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Day Columns with Events */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: TIME_COL_PX,
                    right: 0,
                    bottom: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                  }}
                >
                  {DAYS.map((_, di) => (
                    <div key={di} style={{ position: 'relative', borderLeft: '1px solid #E2E8F0', height: '100%' }}>
                      <DayColumn events={columnEvents[di]} onSelect={setSelectedClassId} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ScheduleBookings
          bookings={bookings}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}