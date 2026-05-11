import {
  BarChart2, AlertTriangle, CheckSquare, Map, Users, BookMarked,
  ShoppingBag, TrendingUp, TrendingDown, Minus, CheckCircle,
  Clock, ChevronRight, Trophy, Zap, Target, Megaphone,
  GraduationCap, FileText, StickyNote,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DAY_PLANS } from '../data/dayplans';
import { Role } from '../types';

// ── Role meta ─────────────────────────────────────────────────────────────────
const ROLE_META: Record<Exclude<Role,'all'>, {
  label: string; icon: string; color: string; border: string;
  bg: string; textColor: string; tagline: string;
  sections: string[]; priorities: string[];
}> = {
  cio: {
    label: 'CIO', icon: '👔', color: 'from-indigo-600 to-purple-700',
    border: 'border-indigo-700/40', bg: 'bg-indigo-950/20',
    textColor: 'text-indigo-400', tagline: 'Strategic overview · Business outcomes · Executive decisions',
    sections: ['dashboard','metrics','risk','decisions','vendors'],
    priorities: ['KPI performance','Open risks','Approved decisions','Vendor selection','Status report'],
  },
  'it-manager': {
    label: 'IT Manager', icon: '⚙️', color: 'from-blue-600 to-cyan-700',
    border: 'border-blue-700/40', bg: 'bg-blue-950/20',
    textColor: 'text-blue-400', tagline: 'Delivery focus · Day plan · Checklists · Risks',
    sections: ['dayplan','checklists','risk','metrics','notes'],
    priorities: ['Daily tasks','Open risks','Checklist progress','KPI actuals','Technical notes'],
  },
  'change-lead': {
    label: 'Change Lead', icon: '🤝', color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-700/40', bg: 'bg-emerald-950/20',
    textColor: 'text-emerald-400', tagline: 'People & adoption · Meetings · Comms · Training',
    sections: ['meetings','communication','training','notes','checklists'],
    priorities: ['Open actions','Stakeholder meetings','Communication plan','Training status','Change notes'],
  },
};

const SECTION_ICONS: Record<string, any> = {
  dashboard:'🏠', metrics:'📊', risk:'⚠️', decisions:'📖', vendors:'🛒',
  dayplan:'📅', checklists:'✅', notes:'📝', meetings:'👥',
  communication:'📢', training:'🎓',
};

// ── Sparkline (reused from MetricsDashboard) ──────────────────────────────────
function MiniSparkline({ history, goodDirection }: { history: {value:number}[]; goodDirection: 'up'|'down' }) {
  if (history.length < 2) return <div className="w-16 h-6 bg-gray-800 rounded" />;
  const vals = history.map(e => e.value);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const w = 64, h = 24, pad = 2;
  const pts = vals.map((v,i) => `${pad+(i/(vals.length-1))*(w-pad*2)},${h-pad-((v-min)/range)*(h-pad*2)}`).join(' ');
  const improving = goodDirection === 'up' ? vals[vals.length-1] >= vals[0] : vals[vals.length-1] <= vals[0];
  return (
    <svg width={w} height={h}><polyline points={pts} fill="none" stroke={improving?'#22c55e':'#f59e0b'} strokeWidth="1.5" strokeLinecap="round"/></svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RoleDashboard() {
  const { activeRole, setActiveRole, setActiveSection, currentProject,
    riskItems, kpis, meetings, decisions, checklists, completedDays } = useStore();

  if (activeRole === 'all') return null; // rendered by App router only when role active

  const meta = ROLE_META[activeRole];

  // ── Shared data ───────────────────────────────────────────────────────────
  const allDays      = DAY_PLANS;
  const completedSet = new Set(completedDays);
  const totalDone    = completedDays.length;
  const totalDays    = allDays.length;
  const overallPct   = totalDays > 0 ? Math.round((totalDone/totalDays)*100) : 0;

  const openRisks    = riskItems.filter(r => r.status==='open');
  const critRisks    = openRisks.filter(r => r.impact==='high' && r.probability==='high');

  const openActions  = meetings.flatMap(m =>
    m.actionItems.filter(a=>!a.done).map(a=>({...a,meeting:m.title,meetingId:m.id}))
  );

  const getProgress = (kpi: any) => {
    const base=parseFloat(kpi.baseline),curr=parseFloat(kpi.current),tgt=parseFloat(kpi.target);
    if (kpi.goodDirection==='down') return base<=tgt?100:Math.min(100,Math.max(0,Math.round(((base-curr)/(base-tgt))*100)));
    return tgt<=base?100:Math.min(100,Math.max(0,Math.round(((curr-base)/(tgt-base))*100)));
  };

  const onTrackKpis  = kpis.filter(k=>getProgress(k)>=50);
  const approvedDecs = decisions.filter(d=>d.status==='approved');

  // Today's day plan tasks
  const nextDay = allDays.find(d => !completedSet.has(d.day));

  // Checklist completion
  const totalItems  = checklists.flatMap(c=>c.items);
  const doneItems   = totalItems.filter(i=>i.checked);
  const checkPct    = totalItems.length>0?Math.round((doneItems.length/totalItems.length)*100):0;

  // ── Role-specific widgets ─────────────────────────────────────────────────
  const renderCIOWidgets = () => (
    <div className="space-y-5">
      {/* KPI summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-indigo-400"/>KPI Scorecard</h3>
          <button onClick={()=>setActiveSection('metrics')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all<ChevronRight className="w-3 h-3"/></button>
        </div>
        {kpis.length===0 ? (
          <div className="text-center py-6 text-gray-600 text-sm bg-gray-900 rounded-xl border border-gray-800">No KPIs tracked yet</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {kpis.slice(0,6).map(k=>{
              const pct=getProgress(k);
              const ok=pct>=50;
              return (
                <div key={k.id} className={`bg-gray-900 border rounded-xl p-3 ${ok?'border-gray-800':'border-amber-900/30'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-gray-400 text-xs leading-tight">{k.name}</span>
                    {k.trend==='up'?<TrendingUp className={`w-3.5 h-3.5 flex-shrink-0 ${k.goodDirection==='up'?'text-green-400':'text-red-400'}`}/>
                      :k.trend==='down'?<TrendingDown className={`w-3.5 h-3.5 flex-shrink-0 ${k.goodDirection==='down'?'text-green-400':'text-red-400'}`}/>
                      :<Minus className="w-3.5 h-3.5 flex-shrink-0 text-gray-600"/>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-lg font-bold">{k.current}</span>
                    <span className="text-gray-500 text-xs">{k.unit}</span>
                    <span className="text-gray-600 text-xs ml-auto">→{k.target}{k.unit}</span>
                  </div>
                  <MiniSparkline history={k.history??[]} goodDirection={k.goodDirection}/>
                  <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ok?'bg-green-500':'bg-amber-500'}`} style={{width:`${pct}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Risk summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/>Risk Summary</h3>
          <button onClick={()=>setActiveSection('risk')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">View register<ChevronRight className="w-3 h-3"/></button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[{label:'Critical',value:critRisks.length,color:'text-red-400',bg:'bg-red-950/30 border-red-900/40'},
            {label:'Open',value:openRisks.length,color:'text-amber-400',bg:'bg-amber-950/30 border-amber-900/40'},
            {label:'Mitigated',value:riskItems.filter(r=>r.status==='mitigated').length,color:'text-green-400',bg:'bg-green-950/30 border-green-900/40'},
          ].map(s=>(
            <div key={s.label} className={`border rounded-xl p-3 text-center ${s.bg}`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
        {critRisks.slice(0,3).map(r=>(
          <div key={r.id} className="flex items-start gap-2 bg-gray-900 border border-red-900/20 rounded-lg px-3 py-2 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5"/>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{r.risk}</div>
              <div className="text-gray-500 text-xs truncate">{r.mitigation||'No mitigation'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Decisions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><BookMarked className="w-4 h-4 text-emerald-400"/>Key Decisions</h3>
          <button onClick={()=>setActiveSection('decisions')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">View log<ChevronRight className="w-3 h-3"/></button>
        </div>
        {approvedDecs.length===0
          ? <div className="text-center py-4 text-gray-600 text-sm bg-gray-900 rounded-xl border border-gray-800">No approved decisions yet</div>
          : approvedDecs.slice(0,4).map(d=>(
            <div key={d.id} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{d.title}</div>
                <div className="text-gray-500 text-xs">{d.date} · {d.owner||'—'}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderITManagerWidgets = () => (
    <div className="space-y-5">
      {/* Today's tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Map className="w-4 h-4 text-blue-400"/>Next Day Plan Task</h3>
          <button onClick={()=>setActiveSection('dayplan')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Open plan<ChevronRight className="w-3 h-3"/></button>
        </div>
        {nextDay ? (
          <div className="bg-gray-900 border border-blue-900/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950/40 text-blue-400 capitalize">{nextDay.phase}</span>
              <span className="text-gray-500 text-xs">Day {nextDay.day} · Week {nextDay.week}</span>
            </div>
            <div className="text-white font-semibold text-sm mb-3">{nextDay.title}</div>
            <div className="space-y-1.5">
              {nextDay.objectives.slice(0,3).map((obj,i)=>(
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <Target className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5"/>
                  {obj}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Overall: {overallPct}% complete ({totalDone}/{totalDays} days)
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-green-400 text-sm bg-green-950/20 border border-green-900/30 rounded-xl">
            <Trophy className="w-8 h-8 mx-auto mb-2"/>All days completed!
          </div>
        )}
      </div>

      {/* Checklist progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><CheckSquare className="w-4 h-4 text-blue-400"/>Checklist Progress</h3>
          <button onClick={()=>setActiveSection('checklists')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all<ChevronRight className="w-3 h-3"/></button>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{doneItems.length}/{totalItems.length} items done</span>
            <span className="text-blue-400 font-bold">{checkPct}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${checkPct}%`}}/>
          </div>
          {checklists.slice(0,4).map(cl=>{
            const done=cl.items.filter(i=>i.checked).length;
            const pct=cl.items.length>0?Math.round((done/cl.items.length)*100):0;
            return (
              <div key={cl.id} className="flex items-center justify-between mt-2.5 text-xs">
                <span className="text-gray-400 truncate flex-1 min-w-0 mr-2">{cl.title}</span>
                <span className={`font-medium ${pct===100?'text-green-400':pct>50?'text-blue-400':'text-gray-500'}`}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open risks by perspective */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/>Tech & Process Risks</h3>
          <button onClick={()=>setActiveSection('risk')} className="text-xs text-amber-400 flex items-center gap-1">View register<ChevronRight className="w-3 h-3"/></button>
        </div>
        {openRisks.filter(r=>r.perspective==='technology'||r.perspective==='process').slice(0,4).map(r=>(
          <div key={r.id} className="flex items-start gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 mb-1.5">
            <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${r.perspective==='technology'?'bg-green-950/40 text-green-400':'bg-amber-950/40 text-amber-400'}`}>{r.perspective}</span>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium">{r.risk}</div>
              <div className="text-gray-500 text-xs capitalize">{r.impact} impact · {r.status}</div>
            </div>
          </div>
        ))}
        {openRisks.filter(r=>r.perspective==='technology'||r.perspective==='process').length===0 && (
          <div className="text-center py-4 text-gray-600 text-sm bg-gray-900 rounded-xl border border-gray-800">No tech/process risks open</div>
        )}
      </div>
    </div>
  );

  const renderChangeLeadWidgets = () => (
    <div className="space-y-5">
      {/* Open actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400"/>Open Action Items</h3>
          <button onClick={()=>setActiveSection('meetings')} className="text-xs text-emerald-400 flex items-center gap-1">View meetings<ChevronRight className="w-3 h-3"/></button>
        </div>
        {openActions.length===0
          ? <div className="text-center py-4 text-gray-600 text-sm bg-gray-900 rounded-xl border border-gray-800">No open actions 🎉</div>
          : (
            <div className="space-y-1.5">
              {openActions.slice(0,6).map((a,i)=>(
                <div key={i} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"/>
                  <span className="text-gray-300 text-xs flex-1 min-w-0 truncate">{a.text}</span>
                  {a.owner && <span className="text-gray-500 text-xs flex-shrink-0">{a.owner}</span>}
                  {a.dueDate && <span className="text-amber-400 text-xs flex-shrink-0">{a.dueDate}</span>}
                </div>
              ))}
              {openActions.length>6 && <div className="text-xs text-gray-600 pl-4">+{openActions.length-6} more</div>}
            </div>
          )}
      </div>

      {/* Recent meetings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400"/>Recent Meetings</h3>
          <button onClick={()=>setActiveSection('meetings')} className="text-xs text-emerald-400 flex items-center gap-1">All meetings<ChevronRight className="w-3 h-3"/></button>
        </div>
        {meetings.length===0
          ? <div className="text-center py-4 text-gray-600 text-sm bg-gray-900 rounded-xl border border-gray-800">No meetings logged yet</div>
          : meetings.slice(0,4).map(m=>(
            <div key={m.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{m.title}</div>
                <div className="text-gray-500 text-xs">{m.date} · {m.actionItems.filter(a=>!a.done).length} open actions</div>
              </div>
            </div>
          ))}
      </div>

      {/* People risks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/>People Risks</h3>
          <button onClick={()=>setActiveSection('risk')} className="text-xs text-amber-400 flex items-center gap-1">View register<ChevronRight className="w-3 h-3"/></button>
        </div>
        {openRisks.filter(r=>r.perspective==='people').slice(0,4).map(r=>(
          <div key={r.id} className="flex items-start gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5"/>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium">{r.risk}</div>
              <div className="text-gray-500 text-xs capitalize">{r.impact} impact · {r.owner||'—'}</div>
            </div>
          </div>
        ))}
        {openRisks.filter(r=>r.perspective==='people').length===0 && (
          <div className="text-center py-4 text-gray-600 text-sm bg-gray-900 rounded-xl border border-gray-800">No people risks open</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-y-auto">

      {/* Role header banner */}
      <div className={`bg-gradient-to-r ${meta.color} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="text-white font-bold text-lg">{meta.label} View</div>
            <div className="text-white/70 text-xs">{meta.tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentProject && (
            <span className="text-white/70 text-xs bg-white/10 px-3 py-1 rounded-full">
              {currentProject.name}
            </span>
          )}
          <button onClick={()=>setActiveRole('all')}
            className="text-white/60 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
            Exit role view
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: role widgets */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeRole === 'cio'          && renderCIOWidgets()}
          {activeRole === 'it-manager'   && renderITManagerWidgets()}
          {activeRole === 'change-lead'  && renderChangeLeadWidgets()}
        </div>

        {/* Right: quick nav panel */}
        <div className="w-56 flex-shrink-0 border-l border-gray-800 p-4 overflow-y-auto">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Priority Sections</div>
          <div className="space-y-1">
            {meta.priorities.map((label, i) => {
              const section = meta.sections[i];
              return (
                <button key={section} onClick={() => setActiveSection(section)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left group">
                  <span className="text-base">{SECTION_ICONS[section] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">{label}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors"/>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Switch Role</div>
          <div className="space-y-1.5">
            {(Object.entries(ROLE_META) as [Exclude<Role,'all'>, typeof ROLE_META[keyof typeof ROLE_META]][]).map(([id, m]) => (
              <button key={id} onClick={()=>setActiveRole(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-xs ${
                  activeRole===id
                    ? `${m.bg} ${m.border} ${m.textColor} font-semibold`
                    : 'border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
            <button onClick={()=>setActiveRole('all')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all text-left text-xs">
              🌐 All sections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
