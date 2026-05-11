import { useState, useRef, useEffect } from 'react';
import {
  Calendar, Users, Settings, Cpu, CheckCircle, Target,
  AlertTriangle, ChevronDown, ChevronUp, BookOpen, Zap,
  CheckCheck, Circle, RotateCcw, Trophy, Plus, Trash2,
  Edit3, Save, X, RotateCcwIcon,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DAY_PLANS } from '../data/dayplans';
import { USE_CASES } from '../data/usecases';
import { Phase, DayPlan as DayPlanType } from '../types';

const PHASE_COLORS: Record<Phase, string> = {
  discovery:'bg-blue-500', planning:'bg-purple-500', pilot:'bg-amber-500', scaling:'bg-green-500', optimize:'bg-red-500',
};
const PHASE_TEXT: Record<Phase, string> = {
  discovery:'text-blue-400', planning:'text-purple-400', pilot:'text-amber-400', scaling:'text-green-400', optimize:'text-red-400',
};
const PHASE_BG: Record<Phase, string> = {
  discovery:'bg-blue-950/40', planning:'bg-purple-950/40', pilot:'bg-amber-950/40', scaling:'bg-green-950/40', optimize:'bg-red-950/40',
};
const PHASE_BAR: Record<Phase, string> = {
  discovery:'bg-blue-500', planning:'bg-purple-500', pilot:'bg-amber-500', scaling:'bg-green-500', optimize:'bg-red-500',
};

function ProgressRing({ pct, size=56, stroke=5 }: { pct:number; size?:number; stroke?:number }) {
  const r=((size-stroke)/2), circ=2*Math.PI*r, offset=circ-(pct/100)*circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#a855f7" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 0.4s ease'}}/>
    </svg>
  );
}

// ── Inline editable task list ─────────────────────────────────────────────────
function EditableList({
  items, color, onSave,
}: {
  items: string[];
  color: string;
  onSave: (items: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<string[]>(items);
  const [newItem, setNewItem] = useState('');
  const inputRef              = useRef<HTMLInputElement>(null);

  // Sync when parent changes (day switch)
  useEffect(() => { setDraft(items); setEditing(false); setNewItem(''); }, [items]);

  const handleSave = () => { onSave(draft.filter(t=>t.trim())); setEditing(false); };
  const handleCancel = () => { setDraft(items); setEditing(false); setNewItem(''); };

  const addItem = () => {
    if (!newItem.trim()) return;
    setDraft(d=>[...d, newItem.trim()]); setNewItem('');
    setTimeout(()=>inputRef.current?.focus(), 50);
  };

  const updateItem = (i:number, val:string) => setDraft(d=>d.map((t,idx)=>idx===i?val:t));
  const removeItem = (i:number) => setDraft(d=>d.filter((_,idx)=>idx!==i));
  const moveItem   = (i:number, dir:-1|1) => {
    const d=[...draft]; const j=i+dir;
    if(j<0||j>=d.length) return;
    [d[i],d[j]]=[d[j],d[i]]; setDraft(d);
  };

  if (!editing) {
    return (
      <div className="group/list">
        <ul className="space-y-1.5 mb-1">
          {items.map((task,i) => (
            <li key={i} className={`flex items-start gap-2 text-gray-300 text-sm`}>
              <div className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0 mt-2`}/>
              {task}
            </li>
          ))}
          {items.length===0 && <li className="text-gray-600 text-sm italic">No tasks — click Edit to add</li>}
        </ul>
        <button onClick={()=>setEditing(true)}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors mt-1 opacity-0 group-hover/list:opacity-100">
          <Edit3 className="w-3 h-3"/> Edit tasks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {draft.map((task,i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={task}
            onChange={e=>updateItem(i,e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addItem();} }}
            className="flex-1 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none"
          />
          <button onClick={()=>moveItem(i,-1)} disabled={i===0} className="p-1 text-gray-600 hover:text-gray-400 disabled:opacity-20"><ChevronUp className="w-3 h-3"/></button>
          <button onClick={()=>moveItem(i, 1)} disabled={i===draft.length-1} className="p-1 text-gray-600 hover:text-gray-400 disabled:opacity-20"><ChevronDown className="w-3 h-3"/></button>
          <button onClick={()=>removeItem(i)} className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3"/></button>
        </div>
      ))}

      {/* Add new */}
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={newItem}
          onChange={e=>setNewItem(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addItem();} }}
          placeholder="Add task… (Enter)"
          className="flex-1 bg-gray-800 border border-dashed border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-gray-400 text-sm outline-none placeholder-gray-600"
        />
        <button onClick={addItem} className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"><Plus className="w-3 h-3"/></button>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
          <Save className="w-3 h-3"/> Save
        </button>
        <button onClick={handleCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
          <X className="w-3 h-3"/> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Editable simple list (objectives, deliverables) ───────────────────────────
function EditableSimpleList({
  items, icon: Icon, iconColor, label, onSave, pill=false,
}: {
  items:string[]; icon:any; iconColor:string; label:string; onSave:(i:string[])=>void; pill?:boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<string[]>(items);
  const [newItem, setNewItem] = useState('');
  useEffect(()=>{setDraft(items);setEditing(false);setNewItem('');},[items]);

  const save   = ()=>{ onSave(draft.filter(t=>t.trim())); setEditing(false); };
  const cancel = ()=>{ setDraft(items); setEditing(false); };
  const add    = ()=>{ if(!newItem.trim()) return; setDraft(d=>[...d,newItem.trim()]); setNewItem(''); };
  const remove = (i:number)=>setDraft(d=>d.filter((_,idx)=>idx!==i));
  const update = (i:number,v:string)=>setDraft(d=>d.map((t,idx)=>idx===i?v:t));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`}/>
          <span className="text-white font-medium text-sm">{label}</span>
        </div>
        {!editing && (
          <button onClick={()=>setEditing(true)} className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors">
            <Edit3 className="w-3 h-3"/> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-1.5">
          {draft.map((item,i)=>(
            <div key={i} className="flex items-center gap-1.5">
              <input value={item} onChange={e=>update(i,e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none"/>
              <button onClick={()=>remove(i)} className="p-1 text-gray-600 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
            </div>
          ))}
          <div className="flex gap-1.5">
            <input value={newItem} onChange={e=>setNewItem(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&add()}
              placeholder={`Add ${label.toLowerCase()}… (Enter)`}
              className="flex-1 bg-gray-800 border border-dashed border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-gray-400 text-sm outline-none"/>
            <button onClick={add} className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"><Plus className="w-3 h-3"/></button>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg"><Save className="w-3 h-3"/> Save</button>
            <button onClick={cancel} className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded-lg hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      ) : pill ? (
        <div className="flex flex-wrap gap-2">
          {items.map((d,i)=>(
            <span key={i} className="text-sm px-3 py-1.5 bg-purple-950/40 border border-purple-800/40 text-purple-300 rounded-lg">{d}</span>
          ))}
          {items.length===0 && <span className="text-gray-600 text-sm italic">None — click Edit to add</span>}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((obj,i)=>(
            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/>
              {obj}
            </li>
          ))}
          {items.length===0 && <li className="text-gray-600 text-sm italic">None — click Edit to add</li>}
        </ul>
      )}
    </div>
  );
}


// ── Challenges Editor ─────────────────────────────────────────────────────────
const PERSPECTIVES_LIST = ['people','process','technology'] as const;
const PERSPECTIVE_STYLES: Record<string,{bg:string;text:string;border:string}> = {
  people:     { bg:'bg-blue-950/40',   text:'text-blue-400',   border:'border-blue-800/40' },
  process:    { bg:'bg-amber-950/40',  text:'text-amber-400',  border:'border-amber-800/40' },
  technology: { bg:'bg-green-950/40',  text:'text-green-400',  border:'border-green-800/40' },
};

interface ChallengeItem { issue:string; resolution:string; perspective:string; }

function ChallengesEditor({
  challenges, expandedChallenge, setExpandedChallenge, onSave,
}: {
  challenges: ChallengeItem[];
  expandedChallenge: number|null;
  setExpandedChallenge: (i:number|null)=>void;
  onSave: (c:ChallengeItem[])=>void;
}) {
  const [editingIdx, setEditingIdx] = useState<number|null>(null);
  const [draft, setDraft]           = useState<ChallengeItem[]>(challenges);
  const [adding, setAdding]         = useState(false);
  const [newEntry, setNewEntry]     = useState<ChallengeItem>({ issue:'', resolution:'', perspective:'people' });

  useEffect(()=>{ setDraft(challenges); setEditingIdx(null); setAdding(false); }, [challenges]);

  const save = (idx:number, updated:ChallengeItem) => {
    const next=[...draft]; next[idx]=updated; setDraft(next); onSave(next); setEditingIdx(null);
  };
  const remove = (idx:number) => {
    if(!confirm('Remove this challenge?')) return;
    const next=draft.filter((_,i)=>i!==idx); setDraft(next); onSave(next);
  };
  const saveNew = () => {
    if(!newEntry.issue.trim()) return;
    const next=[...draft,newEntry]; setDraft(next); onSave(next);
    setNewEntry({issue:'',resolution:'',perspective:'people'}); setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400"/>
          <span className="text-white font-medium text-sm">Challenges & Resolutions</span>
        </div>
        <button onClick={()=>setAdding(v=>!v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors">
          <Plus className="w-3 h-3"/> Add
        </button>
      </div>

      {/* Add new challenge form */}
      {adding && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 mb-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">Challenge / Issue *</label>
            <textarea value={newEntry.issue} onChange={e=>setNewEntry({...newEntry,issue:e.target.value})} rows={2}
              placeholder="Describe the challenge..."
              className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">Resolution / Mitigation</label>
            <textarea value={newEntry.resolution} onChange={e=>setNewEntry({...newEntry,resolution:e.target.value})} rows={2}
              placeholder="How to resolve or mitigate..."
              className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">Perspective</label>
            <div className="flex gap-2">
              {PERSPECTIVES_LIST.map(p=>{
                const s=PERSPECTIVE_STYLES[p];
                return (
                  <button key={p} onClick={()=>setNewEntry({...newEntry,perspective:p})}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize border transition-all ${newEntry.perspective===p?`${s.bg} ${s.text} ${s.border}`:'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded-lg transition-colors">
              <Save className="w-3 h-3"/> Add Challenge
            </button>
            <button onClick={()=>{setAdding(false);setNewEntry({issue:'',resolution:'',perspective:'people'});}}
              className="px-3 py-2 bg-gray-800 text-gray-400 text-xs rounded-lg hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Challenge list */}
      <div className="space-y-3">
        {draft.length===0 && !adding && (
          <div className="text-center py-6 text-gray-600 text-sm bg-gray-900 border border-gray-800 rounded-xl">
            No challenges logged — click <strong>Add</strong> to document one
          </div>
        )}
        {draft.map((challenge,i)=>{
          const s = PERSPECTIVE_STYLES[challenge.perspective]??PERSPECTIVE_STYLES.people;
          const isEditing = editingIdx===i;
          const isExpanded = expandedChallenge===i;

          if(isEditing) {
            return (
              <EditChallengeForm key={i} challenge={challenge}
                onSave={updated=>save(i,updated)}
                onCancel={()=>setEditingIdx(null)}/>
            );
          }

          return (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors group">
              <div className="flex items-start justify-between gap-2 p-4">
                <button onClick={()=>setExpandedChallenge(isExpanded?null:i)}
                  className="flex items-start gap-3 text-left flex-1 min-w-0">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"/>
                  <div className="min-w-0">
                    <div className="text-gray-200 text-sm font-medium leading-snug">{challenge.issue}</div>
                    <span className={`text-xs mt-1 capitalize px-2 py-0.5 rounded inline-block ${s.bg} ${s.text}`}>
                      {challenge.perspective}
                    </span>
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>setEditingIdx(i)} title="Edit"
                    className="p-1.5 hover:bg-gray-800 text-gray-600 hover:text-gray-300 rounded-lg transition-colors">
                    <Edit3 className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={()=>remove(i)} title="Remove"
                    className="p-1.5 hover:bg-red-950/40 text-gray-600 hover:text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={()=>setExpandedChallenge(isExpanded?null:i)}
                    className="p-1.5 text-gray-600 hover:text-gray-300 rounded-lg transition-colors">
                    {isExpanded?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                  <div className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Resolution</div>
                  <div className="text-gray-300 text-sm leading-relaxed">
                    {challenge.resolution || <span className="text-gray-600 italic">No resolution documented yet — click edit to add one.</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Inline edit form for a single challenge ───────────────────────────────────
function EditChallengeForm({
  challenge, onSave, onCancel,
}: {
  challenge: ChallengeItem;
  onSave: (c:ChallengeItem)=>void;
  onCancel: ()=>void;
}) {
  const [form, setForm] = useState<ChallengeItem>({...challenge});
  return (
    <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">Challenge / Issue</label>
        <textarea value={form.issue} onChange={e=>setForm({...form,issue:e.target.value})} rows={2}
          className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">Resolution</label>
        <textarea value={form.resolution} onChange={e=>setForm({...form,resolution:e.target.value})} rows={3}
          className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">Perspective</label>
        <div className="flex gap-2">
          {PERSPECTIVES_LIST.map(p=>{
            const s=PERSPECTIVE_STYLES[p];
            return (
              <button key={p} onClick={()=>setForm({...form,perspective:p})}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize border transition-all ${form.perspective===p?`${s.bg} ${s.text} ${s.border}`:'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'}`}>
                {p}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>onSave(form)}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
          <Save className="w-3 h-3"/> Save Changes
        </button>
        <button onClick={onCancel}
          className="px-3 py-2 bg-gray-800 text-gray-400 text-xs rounded-lg hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DayPlan() {
  const {
    currentProject, completedDays, toggleDayComplete, resetProgress,
    customDayPlans, updateDayPlanField, resetDayPlanDay, updateDayPlanChallenges,
  } = useStore();

  const [selectedDay, setSelectedDay] = useState<DayPlanType | null>(DAY_PLANS[0]);
  const [expandedChallenge, setExpandedChallenge] = useState<number | null>(null);
  const [expandedSection, setExpandedSection]     = useState<string>('all');
  const [showResetConfirm, setShowResetConfirm]   = useState(false);

  const selectedUseCase = currentProject?.useCase
    ? USE_CASES.find((u) => u.id === currentProject.useCase) : null;

  const filteredDayPlans = selectedUseCase
    ? DAY_PLANS.filter((dp) => selectedUseCase.phases.includes(dp.phase))
    : DAY_PLANS;

  const phases = ['discovery','planning','pilot','scaling','optimize'] as Phase[];
  const daysByPhase = phases.reduce((acc,phase) => {
    acc[phase] = filteredDayPlans.filter(dp=>dp.phase===phase); return acc;
  }, {} as Record<Phase,DayPlanType[]>);

  const totalDays      = filteredDayPlans.length;
  const totalCompleted = completedDays.filter(d=>filteredDayPlans.some(fp=>fp.day===d)).length;
  const overallPct     = totalDays>0?Math.round((totalCompleted/totalDays)*100):0;
  const allDone        = totalCompleted===totalDays&&totalDays>0;
  const isDayComplete  = (day:number)=>completedDays.includes(day);

  // Merge built-in + custom overrides for selected day
  const mergedDay = selectedDay ? {
    ...selectedDay,
    objectives:  customDayPlans[selectedDay.day]?.objectives  ?? selectedDay.objectives,
    deliverables:customDayPlans[selectedDay.day]?.deliverables?? selectedDay.deliverables,
    challenges:  customDayPlans[selectedDay.day]?.challenges  ?? selectedDay.challenges,
    tasks: {
      people:     customDayPlans[selectedDay.day]?.tasks?.people     ?? selectedDay.tasks.people,
      process:    customDayPlans[selectedDay.day]?.tasks?.process    ?? selectedDay.tasks.process,
      technology: customDayPlans[selectedDay.day]?.tasks?.technology ?? selectedDay.tasks.technology,
    },
  } : null;

  const hasCustomisations = selectedDay ? !!customDayPlans[selectedDay.day] : false;

  const PERSPECTIVES = [
    { key:'people',     label:'People',     icon:Users,    dot:'bg-blue-400',  text:'text-blue-400',  bg:'bg-blue-950/60' },
    { key:'process',    label:'Process',    icon:Settings, dot:'bg-amber-400', text:'text-amber-400', bg:'bg-amber-950/60' },
    { key:'technology', label:'Technology', icon:Cpu,      dot:'bg-green-400', text:'text-green-400', bg:'bg-green-950/60' },
  ] as const;

  return (
    <div className="flex-1 flex min-h-screen bg-gray-950">

      {/* ── Left sidebar ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-800 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm mb-3">Daily Transformation Plan</h2>
          {selectedUseCase && (
            <div className="text-xs text-purple-400 bg-purple-950/40 px-2 py-1 rounded mb-3">{selectedUseCase.name}</div>
          )}
          <div className="flex items-center gap-3 bg-gray-900 rounded-xl p-3">
            <div className="relative flex-shrink-0">
              <ProgressRing pct={overallPct}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{overallPct}%</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold">{totalCompleted} / {totalDays} days</div>
              <div className="text-gray-400 text-xs mt-0.5">{allDone?'🎉 Plan complete!':`${totalDays-totalCompleted} remaining`}</div>
              {totalCompleted>0 && (
                <button onClick={()=>setShowResetConfirm(true)} className="mt-1.5 text-xs text-gray-600 hover:text-red-400 flex items-center gap-1 transition-colors">
                  <RotateCcw className="w-3 h-3"/> Reset
                </button>
              )}
            </div>
          </div>
          {showResetConfirm && (
            <div className="mt-2 bg-red-950/30 border border-red-800/40 rounded-lg p-3 text-xs">
              <p className="text-red-300 mb-2">Reset all progress?</p>
              <div className="flex gap-2">
                <button onClick={()=>{resetProgress();setShowResetConfirm(false);}} className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs">Yes, reset</button>
                <button onClick={()=>setShowResetConfirm(false)} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 space-y-4 flex-1">
          {phases.map(phase=>{
            const days=daysByPhase[phase];
            if(days.length===0) return null;
            const phaseCompleted=days.filter(d=>isDayComplete(d.day)).length;
            const phasePct=Math.round((phaseCompleted/days.length)*100);
            return (
              <div key={phase}>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${PHASE_TEXT[phase]}`}>{phase}</span>
                    <span className="text-xs text-gray-500">{phaseCompleted}/{days.length}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${PHASE_BAR[phase]}`} style={{width:`${phasePct}%`}}/>
                  </div>
                </div>
                <div className="space-y-1">
                  {days.map(day=>{
                    const done=isDayComplete(day.day);
                    const isSelected=selectedDay?.day===day.day;
                    const hasCustom=!!customDayPlans[day.day];
                    return (
                      <button key={day.day} onClick={()=>setSelectedDay(day)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${isSelected?'bg-gray-800 text-white border border-gray-700':'text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          {done
                            ? <CheckCircle className={`w-4 h-4 flex-shrink-0 ${PHASE_TEXT[phase]}`}/>
                            : <Circle className="w-4 h-4 flex-shrink-0 text-gray-700"/>}
                          <span className={`font-medium ${done?'line-through text-gray-500':''}`}>Day {day.day}</span>
                          <span className="text-gray-600 text-xs">Wk {day.week}</span>
                          {hasCustom && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" title="Customised"/>}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 ml-6 truncate">{day.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Day Detail ── */}
      {mergedDay ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PHASE_TEXT[mergedDay.phase as Phase]} bg-gray-800`}>{mergedDay.phase} Phase</span>
              <span className="text-gray-500 text-xs flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>Day {mergedDay.day} · Week {mergedDay.week}</span>
              {hasCustomisations && (
                <span className="text-xs px-2 py-0.5 bg-purple-950/40 text-purple-400 rounded-full flex items-center gap-1">
                  <Edit3 className="w-2.5 h-2.5"/> Customised
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasCustomisations && (
                <button onClick={()=>{ if(confirm('Reset this day to built-in defaults?')) resetDayPlanDay(mergedDay.day); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-700/40 transition-all">
                  <RotateCcw className="w-3.5 h-3.5"/> Reset day
                </button>
              )}
              <button onClick={()=>toggleDayComplete(mergedDay.day)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDayComplete(mergedDay.day)
                    ?'bg-green-900/40 border border-green-700/50 text-green-400 hover:bg-red-900/20 hover:border-red-700/40 hover:text-red-400'
                    :'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-green-900/30 hover:border-green-700/40 hover:text-green-400'}`}>
                {isDayComplete(mergedDay.day)
                  ? <><CheckCheck className="w-4 h-4"/> Completed</>
                  : <><Circle className="w-4 h-4"/> Mark Complete</>}
              </button>
            </div>
          </div>

          {isDayComplete(mergedDay.day) && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${PHASE_BG[mergedDay.phase as Phase]} border border-green-800/30`}>
              <Trophy className="w-4 h-4 text-green-400 flex-shrink-0"/>
              <span className="text-green-300">Day {mergedDay.day} marked as complete — great work!</span>
            </div>
          )}

          <h1 className="text-white text-2xl font-bold">{mergedDay.title}</h1>

          {/* Objectives */}
          <EditableSimpleList
            items={mergedDay.objectives} icon={Target} iconColor="text-purple-400" label="Today's Objectives"
            onSave={items=>updateDayPlanField(mergedDay.day,'objectives',items)}/>

          {/* People / Process / Technology */}
          <div>
            {/* Perspective filter tabs */}
            <div className="flex gap-2 mb-4">
              {['all','people','process','technology'].map(s=>(
                <button key={s} onClick={()=>setExpandedSection(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${expandedSection===s?'bg-purple-600 text-white':'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                  {s==='all'?'All Tasks':s}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {PERSPECTIVES.filter(p=>expandedSection==='all'||expandedSection===p.key).map(p=>(
                <div key={p.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${p.bg} flex items-center justify-center`}>
                      <p.icon className={`w-4 h-4 ${p.text}`}/>
                    </div>
                    <span className="text-white font-medium text-sm">{p.label}</span>
                    <span className="text-gray-500 text-xs">{mergedDay.tasks[p.key].length} tasks</span>
                  </div>
                  <EditableList
                    items={mergedDay.tasks[p.key]}
                    color={p.dot}
                    onSave={items=>updateDayPlanField(mergedDay.day, p.key as any, items)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <EditableSimpleList
            items={mergedDay.deliverables} icon={BookOpen} iconColor="text-purple-400" label="Deliverables for Today"
            onSave={items=>updateDayPlanField(mergedDay.day,'deliverables',items)} pill/>

          {/* Challenges — fully editable */}
          <ChallengesEditor
            challenges={mergedDay.challenges}
            expandedChallenge={expandedChallenge}
            setExpandedChallenge={setExpandedChallenge}
            onSave={challenges => updateDayPlanChallenges(mergedDay.day, challenges)}
          />

          {/* Phase completion */}
          {(()=>{
            const phase=mergedDay.phase as Phase;
            const phaseDays=daysByPhase[phase];
            const phaseCompleted=phaseDays.filter(d=>isDayComplete(d.day)).length;
            if(phaseCompleted===phaseDays.length&&phaseDays.length>0){
              return (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${PHASE_BG[phase]} border border-gray-700/40`}>
                  <Trophy className={`w-5 h-5 flex-shrink-0 ${PHASE_TEXT[phase]}`}/>
                  <div>
                    <div className={`text-sm font-semibold capitalize ${PHASE_TEXT[phase]}`}>{phase} phase complete!</div>
                    <div className="text-gray-400 text-xs mt-0.5">All {phaseDays.length} days done. Time to move to the next phase.</div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30"/>
            <p>Select a day to view the plan</p>
          </div>
        </div>
      )}
    </div>
  );
}
