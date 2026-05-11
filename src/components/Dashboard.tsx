import { useState } from 'react';
import {
  Star, TrendingUp, ChevronRight, Plus, X, Settings,
  AlertTriangle, Map, Target, FileText, BarChart2,
  Users, BookMarked, ShoppingBag, StickyNote, CheckSquare,
  Calendar, Clock, CheckCircle, Zap, Trophy, Activity,
  MessageSquare, Shield, GraduationCap, BookOpen,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { USE_CASES } from '../data/usecases';
import { DAY_PLANS } from '../data/dayplans';
import { Phase } from '../types';

// ── Phase config ──────────────────────────────────────────────────────────────
const PHASES: Phase[] = ['discovery','planning','pilot','scaling','optimize'];
const PHASE_CFG: Record<Phase,{label:string;color:string;text:string;dot:string;border:string;ring:string}> = {
  discovery: { label:'Discovery', color:'bg-blue-950/50',   text:'text-blue-400',   dot:'bg-blue-400',   border:'border-blue-800/40',   ring:'ring-blue-500' },
  planning:  { label:'Planning',  color:'bg-purple-950/50', text:'text-purple-400', dot:'bg-purple-400', border:'border-purple-800/40', ring:'ring-purple-500' },
  pilot:     { label:'Pilot',     color:'bg-amber-950/50',  text:'text-amber-400',  dot:'bg-amber-400',  border:'border-amber-800/40',  ring:'ring-amber-500' },
  scaling:   { label:'Scaling',   color:'bg-green-950/50',  text:'text-green-400',  dot:'bg-green-400',  border:'border-green-800/40',  ring:'ring-green-500' },
  optimize:  { label:'Optimize',  color:'bg-red-950/50',    text:'text-red-400',    dot:'bg-red-400',    border:'border-red-800/40',    ring:'ring-red-500' },
};

// ── Quick launch sections ─────────────────────────────────────────────────────
const QUICK_LAUNCH = [
  { id:'dayplan',      label:'Day Plan',       icon:Map,           color:'text-blue-400',   bg:'bg-blue-950/30 border-blue-800/30' },
  { id:'checklists',   label:'Checklists',     icon:CheckSquare,   color:'text-green-400',  bg:'bg-green-950/30 border-green-800/30' },
  { id:'risk',         label:'Risk Register',  icon:AlertTriangle, color:'text-amber-400',  bg:'bg-amber-950/30 border-amber-800/30' },
  { id:'metrics',      label:'Metrics',        icon:BarChart2,     color:'text-purple-400', bg:'bg-purple-950/30 border-purple-800/30' },
  { id:'meetings',     label:'Meetings',       icon:Users,         color:'text-cyan-400',   bg:'bg-cyan-950/30 border-cyan-800/30' },
  { id:'decisions',    label:'Decisions',      icon:BookMarked,    color:'text-emerald-400',bg:'bg-emerald-950/30 border-emerald-800/30' },
  { id:'vendors',      label:'Vendors',        icon:ShoppingBag,   color:'text-orange-400', bg:'bg-orange-950/30 border-orange-800/30' },
  { id:'notes',        label:'Notes',          icon:StickyNote,    color:'text-pink-400',   bg:'bg-pink-950/30 border-pink-800/30' },
  { id:'templates',    label:'Templates',      icon:FileText,      color:'text-indigo-400', bg:'bg-indigo-950/30 border-indigo-800/30' },
  { id:'communication',label:'Comms Plan',     icon:MessageSquare, color:'text-sky-400',    bg:'bg-sky-950/30 border-sky-800/30' },
  { id:'guides',       label:'Guides',         icon:BookOpen,      color:'text-violet-400', bg:'bg-violet-950/30 border-violet-800/30' },
  { id:'governance',   label:'Governance',     icon:Shield,        color:'text-teal-400',   bg:'bg-teal-950/30 border-teal-800/30' },
  { id:'training',     label:'Training',       icon:GraduationCap, color:'text-lime-400',   bg:'bg-lime-950/30 border-lime-800/30' },
];

// ── SVG progress ring ─────────────────────────────────────────────────────────
function Ring({ pct, size=52, stroke=5, color='#a855f7' }: { pct:number; size?:number; stroke?:number; color?:string }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 0.5s ease'}}/>
    </svg>
  );
}

export default function Dashboard() {
  const {
    resources, setActiveSection, setActiveDocument,
    currentProject, setCurrentProject, createProject, updateProject,
    riskItems, kpis, meetings, decisions, checklists, completedDays, notes,
  } = useStore();

  const [showProjectModal, setShowProjectModal] = useState(!currentProject);
  const [editingProject, setEditingProject]     = useState<typeof currentProject>(null);
  const [projectForm, setProjectForm]           = useState({
    name: currentProject?.name || '',
    useCase: currentProject?.useCase || '',
    scope: currentProject?.scope || 'both',
    currentPhase: (currentProject?.currentPhase || 'discovery') as Phase,
    startDate: currentProject?.startDate || new Date().toISOString().split('T')[0],
  });

  const handleSaveProject = () => {
    const id = editingProject ? editingProject.id : `project-${Date.now()}`;
    const project = {
      id, name: projectForm.name || 'Siddharth Dutt - AI IT Ops Transformation',
      useCase: projectForm.useCase, scope: projectForm.scope as 'enterprise'|'usecase'|'both',
      currentPhase: projectForm.currentPhase, currentDay: 1,
      startDate: projectForm.startDate, notes: '',
    };
    if (editingProject) updateProject(id, project); else createProject(project);
    setShowProjectModal(false); setEditingProject(null);
  };

  // ── Live data ─────────────────────────────────────────────────────────────
  const allDays      = DAY_PLANS;
  const completedSet = new Set(completedDays);
  const totalDone    = completedDays.length;
  const totalDays    = allDays.length;
  const overallPct   = totalDays > 0 ? Math.round((totalDone/totalDays)*100) : 0;

  const openRisks    = riskItems.filter(r=>r.status==='open');
  const critRisks    = openRisks.filter(r=>r.impact==='high'&&r.probability==='high');

  const openActions  = meetings.flatMap(m=>
    m.actionItems.filter(a=>!a.done).map(a=>({...a,meeting:m.title}))
  );
  const overdueActions = openActions.filter(a=>a.dueDate && a.dueDate < new Date().toISOString().split('T')[0]);

  const getKpiPct = (k:any) => {
    const base=parseFloat(k.baseline),curr=parseFloat(k.current),tgt=parseFloat(k.target);
    if(k.goodDirection==='down') return base<=tgt?100:Math.min(100,Math.max(0,Math.round(((base-curr)/(base-tgt))*100)));
    return tgt<=base?100:Math.min(100,Math.max(0,Math.round(((curr-base)/(tgt-base))*100)));
  };
  const onTrackKpis  = kpis.filter(k=>getKpiPct(k)>=50);
  const pendingDecs  = decisions.filter(d=>d.status==='proposed');
  const checkItems   = checklists.flatMap(c=>c.items);
  const checkPct     = checkItems.length>0 ? Math.round((checkItems.filter(i=>i.checked).length/checkItems.length)*100) : 0;

  // Phase completion
  const phaseStats = PHASES.map(phase=>{
    const days = allDays.filter(d=>d.phase===phase);
    const done  = days.filter(d=>completedSet.has(d.day)).length;
    return { phase, total:days.length, done, pct: days.length>0?Math.round((done/days.length)*100):0 };
  });
  const currentPhaseIdx = currentProject ? PHASES.indexOf(currentProject.currentPhase as Phase) : 0;

  // Activity feed — last 6 items across all sections sorted by date
  const activity = [
    ...meetings.slice(-3).map(m=>({ icon:'👥', label:m.title, sub:`Meeting · ${m.date}`, section:'meetings', date:m.date })),
    ...decisions.slice(-2).map(d=>({ icon:'📖', label:d.title, sub:`Decision · ${d.date}`, section:'decisions', date:d.date })),
    ...riskItems.slice(-2).map(r=>({ icon:'⚠️', label:r.risk, sub:`Risk · ${r.status}`, section:'risk', date:'' })),
    ...notes.slice(-1).map(n=>({ icon:'📝', label:n.title, sub:`Note · ${n.createdAt?.slice(0,10)||''}`, section:'notes', date:n.createdAt||'' })),
  ].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-y-auto">

      {/* ── Project Modal ────────────────────────────────────────────────── */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">{editingProject?'Edit Project':'New Project'}</h2>
                <p className="text-gray-400 text-sm mt-1">Tell us about your transformation</p>
              </div>
              <button onClick={()=>setShowProjectModal(false)} className="text-gray-500 hover:text-gray-300"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">Project Name</label>
                <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Siddharth Dutt - AI IT Ops Transformation"
                  value={projectForm.name} onChange={e=>setProjectForm({...projectForm,name:e.target.value})}/>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">Use Case</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  value={projectForm.useCase} onChange={e=>setProjectForm({...projectForm,useCase:e.target.value})}>
                  <option value="">-- Select a Use Case --</option>
                  {USE_CASES.map(uc=><option key={uc.id} value={uc.id}>{uc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['enterprise','usecase','both'] as const).map(s=>(
                    <button key={s} onClick={()=>setProjectForm({...projectForm,scope:s})}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${projectForm.scope===s?'bg-purple-600 border-purple-500 text-white':'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      {s==='enterprise'?'Enterprise':s==='usecase'?'Use Case':'Both'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Current Phase</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    value={projectForm.currentPhase} onChange={e=>setProjectForm({...projectForm,currentPhase:e.target.value as Phase})}>
                    {PHASES.map(p=><option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Start Date</label>
                  <input type="date" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    value={projectForm.startDate} onChange={e=>setProjectForm({...projectForm,startDate:e.target.value})}/>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button onClick={()=>setShowProjectModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm hover:border-gray-600 transition-colors">Skip</button>
              <button onClick={handleSaveProject} className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
                {editingProject?'Save Changes':'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4c1d95 100%)'}} className="px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs mb-1">
            <Star className="w-3.5 h-3.5"/><span>Crafted by <strong className="text-white">Siddharth Dutt</strong> · AI IT Ops Transformation Toolkit</span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {currentProject ? currentProject.name : 'Welcome, Siddharth 👋'}
          </h1>
          {currentProject && (
            <div className="flex items-center gap-2 mt-1 text-sm text-purple-300/80">
              <span className="capitalize">{currentProject.currentPhase} phase</span>
              {currentProject.useCase && (() => { const uc=USE_CASES.find(u=>u.id===currentProject.useCase); return uc?<><span>·</span><span>{uc.name}</span></>:null; })()}
              {currentProject.startDate && <><span>·</span><span>Since {currentProject.startDate}</span></>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>{ setEditingProject(currentProject); setProjectForm({ name:currentProject?.name||'', useCase:currentProject?.useCase||'', scope:currentProject?.scope||'both', currentPhase:(currentProject?.currentPhase||'discovery') as Phase, startDate:currentProject?.startDate||new Date().toISOString().split('T')[0] }); setShowProjectModal(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg border border-white/20 transition-colors">
            <Settings className="w-3.5 h-3.5"/> {currentProject?'Edit':'Setup'}
          </button>
          <button onClick={()=>{ setEditingProject(null); setProjectForm({name:'',useCase:'',scope:'both',currentPhase:'discovery',startDate:new Date().toISOString().split('T')[0]}); setShowProjectModal(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm rounded-lg font-medium transition-colors">
            <Plus className="w-3.5 h-3.5"/> New Project
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto">

        {/* ── Live stat cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Progress ring */}
          <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Ring pct={overallPct} size={60} stroke={6}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{overallPct}%</span>
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-0.5">90-Day Progress</div>
              <div className="text-white text-xl font-bold">{totalDone}<span className="text-gray-500 text-sm font-normal">/{totalDays}</span></div>
              <button onClick={()=>setActiveSection('dayplan')} className="text-purple-400 text-xs hover:text-purple-300 flex items-center gap-0.5 mt-1">
                View plan <ChevronRight className="w-3 h-3"/>
              </button>
            </div>
          </div>

          {[
            { label:'Open Risks', value:openRisks.length, sub:critRisks.length>0?`${critRisks.length} critical`:'None critical', color:'text-amber-400', ring:'#f59e0b', section:'risk', icon:AlertTriangle, alert:critRisks.length>0 },
            { label:'Action Items', value:openActions.length, sub:overdueActions.length>0?`${overdueActions.length} overdue`:'All on time', color:'text-blue-400', ring:'#3b82f6', section:'meetings', icon:CheckCircle, alert:overdueActions.length>0 },
            { label:'KPIs On Track', value:`${onTrackKpis.length}/${kpis.length}`, sub:kpis.length>0?`${Math.round((onTrackKpis.length/kpis.length)*100)}% healthy`:'No KPIs yet', color:'text-green-400', ring:'#22c55e', section:'metrics', icon:BarChart2, alert:false },
            { label:'Checklist %', value:`${checkPct}%`, sub:`${checkItems.filter(i=>i.checked).length}/${checkItems.length} items`, color:'text-purple-400', ring:'#a855f7', section:'checklists', icon:CheckSquare, alert:false },
          ].map(s=>(
            <button key={s.label} onClick={()=>setActiveSection(s.section)}
              className={`bg-gray-900 border rounded-2xl p-4 text-left hover:border-gray-700 transition-all ${s.alert?'border-amber-900/40':'border-gray-800'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs">{s.label}</span>
                {s.alert && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>}
              </div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-600 text-xs mt-0.5">{s.sub}</div>
            </button>
          ))}

          {/* Decisions pending */}
          <button onClick={()=>setActiveSection('decisions')}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-left hover:border-gray-700 transition-all">
            <div className="text-gray-400 text-xs mb-1">Pending Decisions</div>
            <div className="text-emerald-400 text-xl font-bold">{pendingDecs.length}</div>
            <div className="text-gray-600 text-xs mt-0.5">{decisions.filter(d=>d.status==='approved').length} approved</div>
          </button>
        </div>

        {/* ── Phase timeline ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-400"/>Transformation Phase Timeline</h2>
            <button onClick={()=>setActiveSection('dayplan')} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Open day plan <ChevronRight className="w-3 h-3"/>
            </button>
          </div>

          {/* Phase strip */}
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-800 z-0"/>
            <div className="absolute top-5 left-5 h-0.5 bg-purple-600 z-0 transition-all duration-700"
              style={{ width: currentPhaseIdx >= 0 ? `${(currentPhaseIdx / (PHASES.length-1))*100*(1-2/(PHASES.length*10))}%` : '0%' }}/>

            <div className="relative z-10 grid grid-cols-5 gap-2">
              {phaseStats.map((ps, idx) => {
                const cfg     = PHASE_CFG[ps.phase as Phase];
                const isCurr  = currentProject?.currentPhase === ps.phase;
                const isPast  = idx < currentPhaseIdx;
                const isDone  = ps.pct === 100;
                return (
                  <button key={ps.phase} onClick={()=>setActiveSection('dayplan')}
                    className={`flex flex-col items-center group transition-all`}>
                    {/* Node */}
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                      isCurr ? `${cfg.dot} border-white shadow-lg scale-110 ${cfg.ring} ring-2 ring-offset-2 ring-offset-gray-900`
                      : isDone ? `${cfg.dot} border-transparent`
                      : isPast ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-900 border-gray-700 group-hover:border-gray-500'}`}>
                      {isDone ? <Trophy className="w-4 h-4 text-white"/> :
                       isCurr ? <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"/> :
                       <div className="w-2 h-2 rounded-full bg-gray-600"/>}
                    </div>
                    {/* Label */}
                    <div className={`text-xs font-semibold capitalize mb-1 ${isCurr?cfg.text:isPast?'text-gray-400':'text-gray-600'}`}>
                      {cfg.label}
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${cfg.dot}`} style={{width:`${ps.pct}%`}}/>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{ps.done}/{ps.total}d</div>
                    {isCurr && <div className="text-xs text-purple-400 font-medium">← current</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom 3-column grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Activity feed */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-400"/>Recent Activity
            </h3>
            {activity.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-xs">
                No activity yet — start by logging a meeting or risk
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((a, i) => (
                  <button key={i} onClick={() => setActiveSection(a.section)}
                    className="w-full flex items-center gap-3 hover:bg-gray-800 rounded-lg px-2 py-2 transition-colors text-left">
                    <span className="text-base flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-300 text-xs font-medium truncate">{a.label}</div>
                      <div className="text-gray-600 text-xs">{a.sub}</div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-700 flex-shrink-0"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Overdue / upcoming actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400"/>
              Action Items
              {overdueActions.length > 0 && (
                <span className="ml-auto text-xs bg-red-950/50 text-red-400 border border-red-800/40 px-2 py-0.5 rounded-full">
                  {overdueActions.length} overdue
                </span>
              )}
            </h3>
            {openActions.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-xs">No open action items</div>
            ) : (
              <div className="space-y-1.5">
                {openActions.slice(0, 6).map((a, i) => {
                  const overdue = a.dueDate && a.dueDate < new Date().toISOString().split('T')[0];
                  return (
                    <div key={i} className={`flex items-start gap-2 rounded-lg px-2.5 py-2 ${overdue ? 'bg-red-950/20 border border-red-900/30' : 'bg-gray-800/50'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${overdue ? 'bg-red-400' : 'bg-amber-400'}`}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-300 text-xs truncate">{a.text}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {a.owner && <span className="text-gray-600 text-xs">{a.owner}</span>}
                          {a.dueDate && <span className={`text-xs ${overdue ? 'text-red-400 font-medium' : 'text-gray-600'}`}>{overdue ? '⚠ ' : ''}{a.dueDate}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {openActions.length > 6 && (
                  <button onClick={() => setActiveSection('meetings')} className="text-xs text-blue-400 hover:text-blue-300 pl-4 flex items-center gap-1">
                    +{openActions.length - 6} more <ChevronRight className="w-3 h-3"/>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Top risks */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400"/>Top Risks
              <button onClick={() => setActiveSection('risk')} className="ml-auto text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3"/>
              </button>
            </h3>
            {openRisks.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-xs">No open risks logged</div>
            ) : (
              <div className="space-y-2">
                {openRisks.slice(0, 5).map(r => {
                  const score = ({high:4,medium:3,low:2} as any)[r.impact] * ({high:4,medium:3,low:2} as any)[r.probability];
                  const lvl = score>=12?{l:'Critical',c:'text-red-400 bg-red-950/40'}:score>=9?{l:'High',c:'text-orange-400 bg-orange-950/40'}:score>=6?{l:'Medium',c:'text-amber-400 bg-amber-950/40'}:{l:'Low',c:'text-green-400 bg-green-950/40'};
                  return (
                    <div key={r.id} className="flex items-start gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium mt-0.5 ${lvl.c}`}>{lvl.l}</span>
                      <div className="min-w-0">
                        <div className="text-gray-300 text-xs leading-tight">{r.risk}</div>
                        <div className="text-gray-600 text-xs capitalize">{r.perspective}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick launch grid ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Quick Launch</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
            {QUICK_LAUNCH.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:scale-105 ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`}/>
                  <span className="text-gray-400 text-xs font-medium leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Use case quick select ──────────────────────────────────────── */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-400 text-xs uppercase tracking-wider font-medium">Use Case Library</h2>
            <span className="text-gray-600 text-xs">{USE_CASES.length} available</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {USE_CASES.slice(0, 6).map(uc => (
              <button key={uc.id} onClick={() => { setCurrentProject({ id:`project-${Date.now()}`, name:uc.name, useCase:uc.id, scope:uc.scope==='enterprise'?'enterprise':'usecase', currentPhase:'discovery', currentDay:1, startDate:new Date().toISOString().split('T')[0], notes:'' }); setActiveSection('dayplan'); }}
                className="text-left p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-purple-700/50 hover:bg-gray-800/50 transition-all group">
                <div className={`text-xs font-medium mb-2 px-2 py-0.5 rounded-full inline-block ${uc.scope==='enterprise'?'bg-purple-900/60 text-purple-300':'bg-blue-900/60 text-blue-300'}`}>
                  {uc.scope==='enterprise'?'Enterprise':'Use Case'}
                </div>
                <div className="text-gray-200 font-medium text-sm group-hover:text-white mb-1">{uc.name}</div>
                <div className="text-gray-500 text-xs line-clamp-2">{uc.description}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
