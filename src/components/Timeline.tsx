import { useState, useRef, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, CheckCircle, Circle,
  Users, BookMarked, AlertTriangle, Map, ZoomIn, ZoomOut, X,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DAY_PLANS } from '../data/dayplans';
import { Phase } from '../types';

// ── Config ────────────────────────────────────────────────────────────────────
const PHASE_CFG: Record<Phase, { label:string; bg:string; border:string; text:string; bar:string }> = {
  discovery: { label:'Discovery', bg:'bg-blue-950/40',   border:'border-blue-800/40',   text:'text-blue-400',   bar:'#3b82f6' },
  planning:  { label:'Planning',  bg:'bg-purple-950/40', border:'border-purple-800/40', text:'text-purple-400', bar:'#a855f7' },
  pilot:     { label:'Pilot',     bg:'bg-amber-950/40',  border:'border-amber-800/40',  text:'text-amber-400',  bar:'#f59e0b' },
  scaling:   { label:'Scaling',   bg:'bg-green-950/40',  border:'border-green-800/40',  text:'text-green-400',  bar:'#22c55e' },
  optimize:  { label:'Optimize',  bg:'bg-red-950/40',    border:'border-red-800/40',    text:'text-red-400',    bar:'#ef4444' },
};

const PHASES: Phase[] = ['discovery','planning','pilot','scaling','optimize'];

// Phase day ranges in the 90-day plan
const PHASE_RANGES: Record<Phase, [number,number]> = {
  discovery: [1,  5],
  planning:  [6,  10],
  pilot:     [11, 21],
  scaling:   [22, 45],
  optimize:  [46, 90],
};

type ZoomLevel = 'week' | 'month' | 'full';
const ZOOM_DAYS: Record<ZoomLevel,number> = { week:7, month:30, full:90 };

interface MarkerItem {
  type: 'dayplan' | 'meeting' | 'decision' | 'risk';
  day: number;
  label: string;
  phase?: Phase;
  done?: boolean;
  color: string;
  data: any;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function dateToDay(startDate: string, eventDate: string): number {
  const start = new Date(startDate);
  const event = new Date(eventDate);
  return Math.round((event.getTime() - start.getTime()) / 86_400_000) + 1;
}

function dayToDate(startDate: string, day: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + day - 1);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
}

export default function Timeline() {
  const { currentProject, completedDays, meetings, decisions, riskItems, setActiveSection } = useStore();

  const [zoom, setZoom]           = useState<ZoomLevel>('full');
  const [startDay, setStartDay]   = useState(1);
  const [selected, setSelected]   = useState<MarkerItem|null>(null);
  const containerRef              = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(800);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      setContainerW(entries[0].contentRect.width);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const projectStart = currentProject?.startDate ?? new Date().toISOString().split('T')[0];
  const todayDay     = dateToDay(projectStart, new Date().toISOString().split('T')[0]);
  const visibleDays  = ZOOM_DAYS[zoom];
  const endDay       = Math.min(startDay + visibleDays - 1, 90);
  const completedSet = new Set(completedDays);

  // ── Build markers ──────────────────────────────────────────────────────────
  const dayPlanMarkers: MarkerItem[] = DAY_PLANS
    .filter(d => d.day >= startDay && d.day <= endDay)
    .map(d => ({
      type: 'dayplan', day: d.day, label: d.title, phase: d.phase as Phase,
      done: completedSet.has(d.day), color: PHASE_CFG[d.phase as Phase].bar, data: d,
    }));

  const meetingMarkers: MarkerItem[] = meetings
    .filter(m => m.date)
    .map(m => ({ type:'meeting', day:dateToDay(projectStart,m.date), label:m.title, color:'#06b6d4', data:m }))
    .filter(m => m.day >= startDay && m.day <= endDay);

  const decisionMarkers: MarkerItem[] = decisions
    .filter(d => d.date)
    .map(d => ({ type:'decision', day:dateToDay(projectStart,d.date), label:d.title, color:'#10b981', data:d }))
    .filter(d => d.day >= startDay && d.day <= endDay);

  const riskMarkers: MarkerItem[] = riskItems
    .filter(r => r.status==='open' && r.impact==='high')
    .slice(0,8)
    .map((r,i) => ({ type:'risk', day:Math.min(startDay + i*3, endDay), label:r.risk, color:'#f59e0b', data:r }))
    .filter(m => m.day >= startDay && m.day <= endDay);

  // ── Layout math ───────────────────────────────────────────────────────────
  const LABEL_W  = 80;
  const chartW   = Math.max(containerW - LABEL_W - 32, 300);
  const dayW     = chartW / visibleDays;

  const dayX = (day: number) => LABEL_W + (day - startDay) * dayW + dayW / 2;
  const todayX = dayX(Math.max(startDay, Math.min(endDay, todayDay)));
  const showToday = todayDay >= startDay && todayDay <= endDay;

  // Navigation
  const canBack = startDay > 1;
  const canFwd  = endDay < 90;
  const goBack  = () => setStartDay(d => Math.max(1, d - visibleDays));
  const goFwd   = () => setStartDay(d => Math.min(90 - visibleDays + 1, d + visibleDays));

  // Row heights
  const PHASE_H  = 52;
  const OVERLAY_H = 32;
  const HEADER_H  = 40;
  const meetingRowY  = HEADER_H;
  const decisionRowY = HEADER_H + OVERLAY_H;
  const phaseStartY  = HEADER_H + OVERLAY_H * 2;
  const totalH       = phaseStartY + PHASES.length * PHASE_H + 20;

  // Day ticks
  const tickDays: number[] = [];
  const tickStep = zoom==='week'?1:zoom==='month'?5:10;
  for (let d = startDay; d <= endDay; d += tickStep) tickDays.push(d);

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 flex-shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400"/> Project Timeline
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {currentProject ? `${currentProject.name} · Start: ${projectStart}` : 'Set up a project to anchor the timeline'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom */}
          <div className="flex rounded-lg overflow-hidden border border-gray-800">
            {(['week','month','full'] as ZoomLevel[]).map(z => (
              <button key={z} onClick={() => { setZoom(z); setStartDay(1); }}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${zoom===z?'bg-purple-600 text-white':'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                {z==='full'?'90-Day':z==='month'?'Month':'Week'}
              </button>
            ))}
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1">
            <button onClick={goBack} disabled={!canBack}
              className="p-1.5 rounded-lg border border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <span className="text-gray-500 text-xs px-2">Day {startDay}–{endDay}</span>
            <button onClick={goFwd} disabled={!canFwd}
              className="p-1.5 rounded-lg border border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Main chart ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto p-5" ref={containerRef}>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { color:'#a855f7', label:'Day plan milestone' },
              { color:'#22c55e', label:'Completed' },
              { color:'#06b6d4', label:'Meeting' },
              { color:'#10b981', label:'Decision' },
              { color:'#f59e0b', label:'High risk' },
              { color:'#ef4444', label:'Today' },
            ].map(l=>(
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:l.color}}/>
                {l.label}
              </div>
            ))}
          </div>

          {/* SVG Gantt */}
          <svg
            width="100%" height={totalH}
            style={{fontFamily:'inherit', overflow:'visible', display:'block'}}
          >
            {/* ── Background grid lines ── */}
            {tickDays.map(d => (
              <line key={d}
                x1={dayX(d)} y1={HEADER_H} x2={dayX(d)} y2={totalH}
                stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3"/>
            ))}

            {/* ── Today line ── */}
            {showToday && (
              <>
                <line x1={todayX} y1={HEADER_H} x2={todayX} y2={totalH}
                  stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8"/>
                <rect x={todayX-14} y={HEADER_H-18} width="28" height="16" rx="4" fill="#ef4444" opacity="0.9"/>
                <text x={todayX} y={HEADER_H-7} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">Today</text>
              </>
            )}

            {/* ── Day tick labels ── */}
            {tickDays.map(d => (
              <text key={d} x={dayX(d)} y={HEADER_H-4} textAnchor="middle" fill="#4b5563" fontSize="10">
                {zoom==='full' ? `D${d}` : dayToDate(projectStart, d)}
              </text>
            ))}

            {/* ── Meeting overlay row ── */}
            <text x={4} y={meetingRowY+20} fill="#4b5563" fontSize="10" fontWeight="600">Meetings</text>
            <rect x={LABEL_W} y={meetingRowY+2} width={chartW} height={OVERLAY_H-6} rx="4" fill="#0e7490" opacity="0.06"/>
            {meetingMarkers.map((m,i) => (
              <g key={i} style={{cursor:'pointer'}} onClick={()=>setSelected(m)}>
                <circle cx={dayX(m.day)} cy={meetingRowY+15} r="6" fill="#06b6d4" opacity="0.85"/>
                <Users x={dayX(m.day)-4} y={meetingRowY+11} width="8" height="8" color="white" strokeWidth="2.5"/>
              </g>
            ))}

            {/* ── Decision overlay row ── */}
            <text x={4} y={decisionRowY+20} fill="#4b5563" fontSize="10" fontWeight="600">Decisions</text>
            <rect x={LABEL_W} y={decisionRowY+2} width={chartW} height={OVERLAY_H-6} rx="4" fill="#065f46" opacity="0.06"/>
            {decisionMarkers.map((d,i) => (
              <g key={i} style={{cursor:'pointer'}} onClick={()=>setSelected(d)}>
                <polygon
                  points={`${dayX(d.day)},${decisionRowY+6} ${dayX(d.day)+7},${decisionRowY+18} ${dayX(d.day)-7},${decisionRowY+18}`}
                  fill="#10b981" opacity="0.85"/>
              </g>
            ))}

            {/* ── Phase swimlanes ── */}
            {PHASES.map((phase, pi) => {
              const [ps, pe] = PHASE_RANGES[phase];
              const cfg      = PHASE_CFG[phase];
              const barX     = dayX(Math.max(ps, startDay)) - dayW/2;
              const barXE    = dayX(Math.min(pe, endDay)) + dayW/2;
              const barW     = Math.max(0, barXE - barX);
              const rowY     = phaseStartY + pi * PHASE_H;
              const inView   = pe >= startDay && ps <= endDay;

              return (
                <g key={phase}>
                  {/* Row label */}
                  <text x={LABEL_W - 6} y={rowY + PHASE_H/2 + 4} textAnchor="end"
                    fill={cfg.bar} fontSize="10" fontWeight="600">
                    {cfg.label}
                  </text>

                  {/* Row background */}
                  <rect x={LABEL_W} y={rowY + 4} width={chartW} height={PHASE_H - 8} rx="6"
                    fill={cfg.bar} opacity="0.04"/>

                  {/* Phase duration bar */}
                  {inView && (
                    <rect x={barX} y={rowY + PHASE_H/2 - 6} width={barW} height="12" rx="6"
                      fill={cfg.bar} opacity="0.3"/>
                  )}

                  {/* Day plan milestones */}
                  {dayPlanMarkers.filter(m=>m.phase===phase).map((m,i) => {
                    const cx = dayX(m.day);
                    const cy = rowY + PHASE_H/2;
                    return (
                      <g key={i} style={{cursor:'pointer'}} onClick={()=>setSelected(m)}>
                        {/* Connector line from bar */}
                        <line x1={cx} y1={cy-6} x2={cx} y2={cy-14} stroke={m.color} strokeWidth="1.5" opacity="0.5"/>
                        {/* Circle */}
                        <circle cx={cx} cy={cy} r="9"
                          fill={m.done ? m.color : '#111827'}
                          stroke={m.color} strokeWidth="2"
                          opacity="0.95"/>
                        {m.done
                          ? <path d={`M${cx-4},${cy} l3,3 l5,-5`} stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                          : <text x={cx} y={cy+4} textAnchor="middle" fill={m.color} fontSize="8" fontWeight="700">{m.day}</text>}

                        {/* Risk markers on this day */}
                        {riskMarkers.filter(r=>r.day===m.day).map((_,ri)=>(
                          <circle key={ri} cx={cx+12} cy={cy-8} r="4" fill="#f59e0b" opacity="0.9"/>
                        ))}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* ── Row dividers ── */}
            {PHASES.map((_,i)=>(
              <line key={i}
                x1={LABEL_W} y1={phaseStartY + i*PHASE_H} x2={LABEL_W+chartW} y2={phaseStartY + i*PHASE_H}
                stroke="#1f2937" strokeWidth="1"/>
            ))}
          </svg>

          {/* Phase summary strips */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {PHASES.map(phase => {
              const days  = DAY_PLANS.filter(d=>d.phase===phase);
              const done  = days.filter(d=>completedSet.has(d.day)).length;
              const pct   = days.length>0?Math.round((done/days.length)*100):0;
              const cfg   = PHASE_CFG[phase];
              const [ps,pe] = PHASE_RANGES[phase];
              const isActive = currentProject?.currentPhase === phase;
              return (
                <div key={phase} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border} ${isActive?'ring-1 ring-purple-500/50':''}`}>
                  <div className={`text-xs font-semibold capitalize mb-1 ${cfg.text}`}>{cfg.label}</div>
                  <div className="text-gray-500 text-xs">Day {ps}–{pe}</div>
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:cfg.bar}}/>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">{done}/{days.length} done · {pct}%</div>
                  {isActive && <div className={`text-xs mt-1 font-medium ${cfg.text}`}>← current</div>}
                </div>
              );
            })}
          </div>

          {/* Empty states */}
          {meetings.length===0 && decisions.length===0 && (
            <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-xl text-center text-gray-600 text-sm">
              Log meetings and decisions to see them plotted on the timeline
            </div>
          )}
        </div>

        {/* ── Detail sidebar ──────────────────────────────────────────────── */}
        {selected && (
          <div className="w-72 flex-shrink-0 border-l border-gray-800 bg-gray-900 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                {selected.type==='dayplan'   && <Map           className="w-4 h-4 text-purple-400"/>}
                {selected.type==='meeting'   && <Users         className="w-4 h-4 text-cyan-400"/>}
                {selected.type==='decision'  && <BookMarked    className="w-4 h-4 text-emerald-400"/>}
                {selected.type==='risk'      && <AlertTriangle className="w-4 h-4 text-amber-400"/>}
                <span className="text-white font-medium text-sm capitalize">{selected.type}</span>
              </div>
              <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <div className="text-white font-semibold text-sm leading-snug">{selected.label}</div>
                <div className="text-gray-500 text-xs mt-1">Day {selected.day} · {dayToDate(projectStart, selected.day)}</div>
              </div>

              {selected.type==='dayplan' && (
                <>
                  {selected.done
                    ? <div className="flex items-center gap-2 text-green-400 text-xs"><CheckCircle className="w-4 h-4"/>Completed</div>
                    : <div className="flex items-center gap-2 text-gray-500 text-xs"><Circle className="w-4 h-4"/>Not yet completed</div>}
                  {selected.data.objectives?.length>0 && (
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1.5">Objectives</div>
                      {selected.data.objectives.slice(0,3).map((o:string,i:number)=>(
                        <div key={i} className="text-gray-300 text-xs mb-1 leading-relaxed">• {o}</div>
                      ))}
                    </div>
                  )}
                  {selected.data.deliverables?.length>0 && (
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1.5">Deliverables</div>
                      <div className="flex flex-wrap gap-1">
                        {selected.data.deliverables.map((d:string,i:number)=>(
                          <span key={i} className="text-xs px-2 py-0.5 bg-purple-950/40 text-purple-300 rounded-full">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={()=>{ setActiveSection('dayplan'); setSelected(null); }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg transition-colors">
                    Open in Day Plan →
                  </button>
                </>
              )}

              {selected.type==='meeting' && (
                <>
                  {selected.data.attendees && <div className="text-gray-400 text-xs">👥 {selected.data.attendees}</div>}
                  {selected.data.agenda    && <div><div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Agenda</div><div className="text-gray-300 text-xs">{selected.data.agenda}</div></div>}
                  {selected.data.decisions && <div><div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Decisions</div><div className="text-gray-300 text-xs">{selected.data.decisions}</div></div>}
                  <div className="text-gray-500 text-xs">{selected.data.actionItems?.filter((a:any)=>!a.done).length ?? 0} open actions</div>
                  <button onClick={()=>{ setActiveSection('meetings'); setSelected(null); }}
                    className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs rounded-lg transition-colors">
                    Open in Meetings →
                  </button>
                </>
              )}

              {selected.type==='decision' && (
                <>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${selected.data.status==='approved'?'bg-green-950/40 text-green-400':selected.data.status==='proposed'?'bg-blue-950/40 text-blue-400':'bg-amber-950/40 text-amber-400'}`}>
                    {selected.data.status}
                  </div>
                  {selected.data.rationale && <div><div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Rationale</div><div className="text-gray-300 text-xs">{selected.data.rationale}</div></div>}
                  {selected.data.owner && <div className="text-gray-400 text-xs">Owner: {selected.data.owner}</div>}
                  <button onClick={()=>{ setActiveSection('decisions'); setSelected(null); }}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded-lg transition-colors">
                    Open in Decisions →
                  </button>
                </>
              )}

              {selected.type==='risk' && (
                <>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${selected.data.impact==='high'?'bg-red-950/40 text-red-400':'bg-amber-950/40 text-amber-400'}`}>
                    {selected.data.impact} impact
                  </div>
                  {selected.data.mitigation && <div><div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Mitigation</div><div className="text-gray-300 text-xs">{selected.data.mitigation}</div></div>}
                  {selected.data.owner && <div className="text-gray-400 text-xs">Owner: {selected.data.owner}</div>}
                  <button onClick={()=>{ setActiveSection('risk'); setSelected(null); }}
                    className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded-lg transition-colors">
                    Open in Risk Register →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
