import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { iSearch2, iChevron } from '../shared';
import { CreateClassModal } from '../components/CreateClassModal';
import { ClassDetailModal } from '../components/ClassDetailModal';
import { BookingRow } from '../components/BookingRow';
// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS        = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const START_HOUR  = 6;
const END_HOUR    = 21;
const ROW_PX      = 60;   // px per 1 hour
const TIME_COL_PX = 56;   // px for time-label column
const FACILITIES  = ['Studio 1 (Yoga/Pilates)', 'Studio 2 (Dance)', 'Studio 3 (Cycling)', 'Gym Area'];
const PALETTE     = [
  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', text: '#1E40AF' },
  { bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', text: '#064E3B' },
  { bg: '#F5F3FF', border: '#DDD6FE', accent: '#7C3AED', text: '#4C1D95' },
  { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', text: '#7C2D12' },
  { bg: '#FFF1F2', border: '#FECDD3', accent: '#E11D48', text: '#881337' },
];
const CANCELLED_COLOR = { bg: '#F8FAFC', border: '#CBD5E1', accent: '#94A3B8', text: '#64748B' };
// ─── Types ────────────────────────────────────────────────────────────────────
interface CalEvent {
  id: string; name: string; room: string; coach: string; enrolled: string;
  day: number; startHour: number; endHour: number;
  color: typeof PALETTE[0]; rawStart: Date; isCancelled: boolean;
  // layout
  col: number; totalCols: number;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonday(d: Date): Date {
  const day  = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m    = new Date(d); m.setDate(diff); m.setHours(0, 0, 0, 0); return m;
}
function fmtDay(d: Date) { return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
// Greedy overlap layout – returns events with col/totalCols assigned
function layout(events: CalEvent[]): CalEvent[] {
  if (!events.length) return [];
  const sorted = [...events].sort((a, b) => a.startHour - b.startHour);
  const colEnd: number[] = [];
  const withCol = sorted.map(ev => {
    let c = colEnd.findIndex(e => e <= ev.startHour);
    if (c === -1) { c = colEnd.length; colEnd.push(ev.endHour); }
    else colEnd[c] = ev.endHour;
    return { ...ev, col: c, totalCols: 0 };
  });
  // assign totalCols per event = max col among overlapping events +1
  withCol.forEach(ev => {
    let maxC = ev.col;
    withCol.forEach(o => {
      if (o.startHour < ev.endHour && o.endHour > ev.startHour) maxC = Math.max(maxC, o.col);
    });
    ev.totalCols = maxC + 1;
  });
  return withCol;
}
// ─── DayColumn ────────────────────────────────────────────────────────────────
function DayColumn({ events, onSelect }: { events: CalEvent[]; onSelect: (id: string) => void }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {events.map(ev => {
        const top  = (ev.startHour - START_HOUR) * ROW_PX + 1;
        const h    = Math.max((ev.endHour - ev.startHour) * ROW_PX - 3, 18);
        const w    = `calc(${100 / ev.totalCols}% - 3px)`;
        const left = `calc(${(ev.col / ev.totalCols) * 100}% + 1px)`;
        return (
          <div
            key={ev.id}
            onClick={() => onSelect(String(ev.id))}
            style={{
              position: 'absolute', top, left, width: w, height: h,
              background: ev.color.bg, borderRadius: 7,
              border: `1px solid ${ev.color.border}`,
              borderLeft: `3px solid ${ev.color.accent}`,
              padding: '4px 6px', boxSizing: 'border-box',
              cursor: 'pointer', zIndex: 5, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', gap: 2,
              opacity: ev.isCancelled ? 0.6 : 1,
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform='translateY(-1px)'; el.style.boxShadow='0 4px 14px rgba(0,0,0,.12)'; el.style.zIndex='15'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform=''; el.style.boxShadow=''; el.style.zIndex='5'; }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:3 }}>
              <p style={{ margin:0, fontWeight:700, fontSize:10.5, lineHeight:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, color: ev.color.text, textDecoration: ev.isCancelled ? 'line-through' : 'none' }}>{ev.name}</p>
              <span style={{ background:'rgba(255,255,255,.85)', border:'1px solid rgba(0,0,0,.07)', borderRadius:3, padding:'1px 3px', fontSize:8.5, fontWeight:700, color:'#475569', flexShrink:0, lineHeight:'11px' }}>{ev.enrolled}</span>
            </div>
            {h > 34 && <span style={{ fontSize:9, color: ev.color.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', opacity:.85 }}>📍 {ev.room}</span>}
            {h > 50 && <span style={{ fontSize:9, color: ev.color.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', opacity:.85 }}>👤 {ev.coach}</span>}
          </div>
        );
      })}
    </div>
  );
}
// ─── SchedulePage ─────────────────────────────────────────────────────────────
export function SchedulePage() {
  const [rawClasses,       setRawClasses]       = useState<any[]>([]);
  const [showCreate,       setShowCreate]       = useState(false);
  const [selectedClassId,  setSelectedClassId]  = useState<string | null>(null);
  const [editData,         setEditData]         = useState<any>(null);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedRooms,    setSelectedRooms]    = useState<string[]>([]);
  const [activeTab,        setActiveTab]        = useState<'calendar'|'bookings'>('calendar');
  const [bookings,         setBookings]         = useState<any[]>([]);
  const [weekStart,        setWeekStart]        = useState(() => getMonday(new Date()));
  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes/all');
      if (!res.ok) return;
      const data: any[] = await res.json();
      setRawClasses(data.map((c, i) => {
        const start     = new Date(c.scheduleTime);
        const end       = new Date(start.getTime() + (c.durationMinutes || 60) * 60000);
        const day       = start.getDay() === 0 ? 6 : start.getDay() - 1;
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour   = end.getHours()   + end.getMinutes()   / 60;
        const color     = c.status === false ? CANCELLED_COLOR : PALETTE[i % PALETTE.length];
        return { id: c.id, name: c.className, room: c.facilityName || 'Studio',
          coach: c.coachName || '—', enrolled: `${c.currentEnrolled||0}/${c.capacity||0}`,
          day, startHour, endHour, color, rawStart: start, isCancelled: c.status === false,
          col: 0, totalCols: 1 };
      }));
    } catch (e) { console.error(e); }
  }, []);
  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings/all', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setBookings(await res.json());
    } catch (e) { console.error(e); }
  }, []);
  useEffect(() => { fetchClasses(); fetchBookings(); }, [fetchClasses, fetchBookings]);
  // ── Derived values ─────────────────────────────────────────────────────────
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart); d.setDate(d.getDate()+6); d.setHours(23,59,59,999); return d;
  }, [weekStart]);
  const weekLabel = useMemo(() => {
    const e = new Date(weekStart); e.setDate(e.getDate()+6);
    return `${fmtDay(weekStart)} – ${fmtDay(e)}, ${e.getFullYear()}`;
  }, [weekStart]);
  const filtered = useMemo(() => {
    let list = rawClasses.filter(c => c.rawStart >= weekStart && c.rawStart <= weekEnd);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.coach.toLowerCase().includes(q));
    }
    if (selectedRooms.length) {
      list = list.filter(c => selectedRooms.some(r => c.room.includes(r.split(' (')[0])));
    }
    return list;
  }, [rawClasses, weekStart, weekEnd, searchQuery, selectedRooms]);
  const columnEvents = useMemo(() =>
    DAYS.map((_, di) => layout(filtered.filter(c => c.day === di) as CalEvent[])),
  [filtered]);
  const totalH = (END_HOUR - START_HOUR) * ROW_PX;
  const coaches = useMemo(() =>
    [...new Set(rawClasses.map(c => c.coach).filter(Boolean))].slice(0, 8),
  [rawClasses]);
  const toggleRoom = (r: string) => {
    if (r === 'Tất cả') { setSelectedRooms([]); return; }
    setSelectedRooms(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);
  };
  const handleApprove = async (id: string) => { try { const t = localStorage.getItem('token'); await fetch(`/api/bookings/${id}/approve`, { method:'PUT', headers:{ Authorization:`Bearer ${t}` } }); fetchBookings(); } catch(e){ console.error(e); }};
  const handleReject  = async (id: string) => { try { const t = localStorage.getItem('token'); await fetch(`/api/bookings/${id}/reject`,  { method:'PUT', headers:{ Authorization:`Bearer ${t}` } }); fetchBookings(); } catch(e){ console.error(e); }};
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, padding:'24px 28px', gap:18, overflowY:'auto', background:'#F8FAFC' }}>
      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #E2E8F0', paddingBottom:16 }}>
        <div>
          <h1 style={{ margin:0, fontWeight:800, fontSize:26, color:'#0F172A' }}>Lịch trình &amp; Lớp học</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748B' }}>Sắp xếp thời khóa biểu và phân công HLV cho các lớp Group-X.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', background:'#F1F5F9', padding:3, borderRadius:10 }}>
            {(['calendar','bookings'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'7px 18px', borderRadius:8, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background: activeTab===tab ? '#FFF' : 'transparent', color: activeTab===tab ? '#0F172A' : '#64748B', boxShadow: activeTab===tab ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition:'all .15s' }}>
                {tab === 'calendar' ? 'Lịch trình' : 'Đặt chỗ'}
              </button>
            ))}
          </div>
          {activeTab === 'calendar' && (
            <button onClick={() => setShowCreate(true)}
              style={{ display:'flex', alignItems:'center', gap:7, background:'#2563EB', color:'#FFF', border:'none', borderRadius:9, padding:'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(37,99,235,.35)', transition:'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background='#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.background='#2563EB')}
            >
              <span style={{ fontSize:16, lineHeight:1 }}>＋</span> Thêm lớp học mới
            </button>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreate       && <CreateClassModal onClose={() => { setShowCreate(false); fetchClasses(); }} />}
      {editData         && <CreateClassModal editData={editData} onClose={() => { setEditData(null); fetchClasses(); }} />}
      {selectedClassId  && <ClassDetailModal classId={selectedClassId} onClose={() => { setSelectedClassId(null); fetchClasses(); }} onEdit={(d:any) => { setEditData(d); setSelectedClassId(null); }} />}

      {activeTab === 'calendar' ? (
        <div style={{ display:'flex', gap:16, flex:1, minHeight:0 }}>

          {/* ─── Filter Sidebar ─── */}
          <div style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }}>
            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FFF', border:'1px solid #CBD5E1', borderRadius:10, padding:'9px 12px' }}>
              <img src={iSearch2} alt="" style={{ width:15, height:15, flexShrink:0, opacity:.6 }} />
              <input placeholder="Tìm lớp, HLV..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ flex:1, border:'none', outline:'none', fontSize:13, color:'#0F172A', background:'transparent' }} />
            </div>

            {/* Room filter */}
            <div style={{ background:'#FFF', border:'1px solid #E2E8F0', borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
              <p style={{ margin:'0 0 12px', fontWeight:700, fontSize:13, color:'#0F172A' }}>Bộ lọc Phòng tập</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {['Tất cả', ...FACILITIES].map(r => (
                  <label key={r} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                    <input type="checkbox"
                      checked={r === 'Tất cả' ? selectedRooms.length === 0 : selectedRooms.includes(r)}
                      onChange={() => toggleRoom(r)}
                      style={{ width:14, height:14, accentColor:'#2563EB', cursor:'pointer' }}
                    />
                    <span style={{ fontSize:13, color:'#475569' }}>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Coach workload */}
            <div style={{ background:'#FFF', border:'1px solid #E2E8F0', borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
              <p style={{ margin:'0 0 10px', fontWeight:700, fontSize:13, color:'#0F172A' }}>Huấn luyện viên</p>
              {coaches.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {coaches.map(coach => (
                    <div key={coach} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#2563EB' }}>
                        {String(coach).split(' ').pop()?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize:12, color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{coach}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, background:'#F8FAFC', border:'1px dashed #E2E8F0' }}>
                  <span style={{ fontSize:12, color:'#94A3B8' }}>Chưa có dữ liệu</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Calendar Panel ─── */}
          <div style={{ flex:1, minWidth:0, background:'#FFF', border:'1px solid #E2E8F0', borderRadius:14, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,.06)' }}>

            {/* Top bar */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={() => setWeekStart(p => { const d=new Date(p); d.setDate(d.getDate()-7); return d; })}
                  style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #E2E8F0', background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={iChevron} alt="" style={{ width:16, height:16, transform:'rotate(90deg)', opacity:.55 }} />
                </button>
                <span style={{ fontWeight:700, fontSize:14, color:'#0F172A', minWidth:170, textAlign:'center' }}>{weekLabel}</span>
                <button onClick={() => setWeekStart(p => { const d=new Date(p); d.setDate(d.getDate()+7); return d; })}
                  style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #E2E8F0', background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={iChevron} alt="" style={{ width:16, height:16, transform:'rotate(-90deg)', opacity:.55 }} />
                </button>
              </div>
              <div style={{ display:'flex', background:'#F1F5F9', padding:3, borderRadius:8 }}>
                <button style={{ padding:'5px 16px', borderRadius:6, background:'#FFF', border:'none', fontSize:12, fontWeight:600, color:'#0F172A', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,.09)' }}>Tuần</button>
                <button style={{ padding:'5px 16px', border:'none', background:'transparent', fontSize:12, fontWeight:500, color:'#64748B', cursor:'pointer' }}>Tháng</button>
              </div>
            </div>

            {/* Day header row */}
            <div style={{ display:'grid', gridTemplateColumns:`${TIME_COL_PX}px repeat(7,1fr)`, borderBottom:'2px solid #E2E8F0', flexShrink:0, background:'#FAFBFD' }}>
              <div />
              {DAYS.map((d, i) => {
                const date = new Date(weekStart); date.setDate(date.getDate() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={d} style={{ textAlign:'center', padding:'10px 4px', borderLeft:'1px solid #E2E8F0' }}>
                    <p style={{ margin:0, fontSize:10.5, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:.5 }}>{d}</p>
                    <div style={{ width:28, height:28, borderRadius:'50%', background: isToday ? '#2563EB' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', margin:'4px auto 0' }}>
                      <span style={{ fontSize:13, fontWeight:700, color: isToday ? '#FFF' : '#334155' }}>{date.getDate()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scrollable grid body */}
            <div style={{ flex:1, overflowY:'auto' }}>
              <div style={{ display:'grid', gridTemplateColumns:`${TIME_COL_PX}px repeat(7,1fr)`, height: totalH, position:'relative', minWidth:620 }}>

                {/* Time labels + horizontal lines */}
                <div style={{ gridColumn:'1 / -1', gridRow:'1', position:'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none' }}>
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
                    const hour = START_HOUR + i;
                    return (
                      <React.Fragment key={hour}>
                        {/* full hour line */}
                        <div style={{ position:'absolute', top: i * ROW_PX, left:0, right:0, display:'flex', alignItems:'flex-start' }}>
                          <span style={{ width: TIME_COL_PX, textAlign:'right', paddingRight:10, fontSize:10.5, color:'#94A3B8', fontWeight:500, lineHeight:'1', marginTop:-6, flexShrink:0 }}>
                            {hour < END_HOUR ? `${String(hour).padStart(2,'0')}:00` : ''}
                          </span>
                          {hour < END_HOUR && <div style={{ flex:1, borderTop:'1px solid #E2E8F0' }} />}
                        </div>
                        {/* half-hour dashed */}
                        {hour < END_HOUR && (
                          <div style={{ position:'absolute', top: i * ROW_PX + ROW_PX / 2, left: TIME_COL_PX, right:0, borderTop:'1px dashed #F1F5F9' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Day columns with events */}
                <div style={{ position:'absolute', top:0, left:TIME_COL_PX, right:0, bottom:0, display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
                  {DAYS.map((_, di) => (
                    <div key={di} style={{ position:'relative', borderLeft:'1px solid #E2E8F0', height:'100%' }}>
                      <DayColumn events={columnEvents[di]} onSelect={setSelectedClassId} />
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Bookings Tab ── */
        <div style={{ background:'#FFF', border:'1px solid #E2E8F0', borderRadius:14, flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ display:'flex', fontWeight:700, fontSize:12, color:'#64748B', padding:'14px 24px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
            <span style={{ flex:1 }}>HỘI VIÊN</span>
            <span style={{ width:180 }}>LỚP HỌC</span>
            <span style={{ width:160 }}>THỜI GIAN</span>
            <span style={{ width:160 }}>ĐẶT LÚC</span>
            <span style={{ width:120 }}>TRẠNG THÁI</span>
            <span style={{ width:80, textAlign:'right' }}>THAO TÁC</span>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {bookings.map(b => <BookingRow key={b.id} booking={b} handleApprove={handleApprove} handleReject={handleReject} />)}
            {bookings.length === 0 && <div style={{ padding:48, textAlign:'center', color:'#94A3B8', fontSize:14 }}>Chưa có dữ liệu đặt chỗ</div>}
          </div>
        </div>
      )}
    </div>
  );
}
