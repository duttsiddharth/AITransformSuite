import { useState } from 'react';
import {
  Users, Plus, Trash2, Edit3, Save, X, Check,
  AlertTriangle, BookMarked, CheckSquare, ChevronRight,
  Mail, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { TeamMember } from '../types';
import { Avatar, avatarColor } from './OwnerPicker';

const ROLES = [
  'AI Lead','IT Manager','Change Manager','Data Engineer','Tech Lead',
  'Business Analyst','Project Manager','CIO','Scrum Master','Sponsor','Other',
];

const EMPTY: Omit<TeamMember,'id'|'color'> = { name:'', role:'', email:'' };

export default function TeamManager() {
  const {
    team, addTeamMember, updateTeamMember, deleteTeamMember,
    riskItems, decisions, meetings, setActiveSection,
  } = useStore() as any;

  // ── Add form state ─────────────────────────────────────────────────────────
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState<typeof EMPTY>(EMPTY);
  const [addError, setAddError] = useState('');

  // ── Inline edit state (one member at a time) ───────────────────────────────
  const [editingId, setEditingId]     = useState<string|null>(null);
  const [editForm, setEditForm]       = useState<typeof EMPTY>(EMPTY);

  // ── Workload expand ────────────────────────────────────────────────────────
  const [expandedId, setExpandedId]   = useState<string|null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!addForm.name.trim()) { setAddError('Name is required'); return; }
    addTeamMember({ ...addForm, id:`member-${Date.now()}`, color: avatarColor(addForm.name) });
    setAddForm(EMPTY); setShowAdd(false); setAddError('');
  };

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditForm({ name:m.name, role:m.role, email:m.email });
    setExpandedId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.name.trim()) return;
    updateTeamMember(id, { ...editForm, color: avatarColor(editForm.name) });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this team member?')) return;
    deleteTeamMember(id);
    if (expandedId === id) setExpandedId(null);
    if (editingId  === id) setEditingId(null);
  };

  // ── Workload helpers ───────────────────────────────────────────────────────
  const getWorkload = (name: string) => ({
    risks:     (riskItems     as any[]).filter(r => r.owner===name && r.status==='open'),
    decisions: (decisions     as any[]).filter(d => d.owner===name && d.status!=='reversed'),
    actions:   (meetings      as any[]).flatMap((m:any) => m.actionItems.filter((a:any)=>a.owner===name&&!a.done)),
  });

  const totalLoad = (name: string) => {
    const w = getWorkload(name);
    return w.risks.length + w.decisions.length + w.actions.length;
  };

  const unassignedRisks   = (riskItems as any[]).filter(r=>!r.owner&&r.status==='open').length;
  const unassignedActions = (meetings  as any[]).flatMap((m:any)=>m.actionItems.filter((a:any)=>!a.owner&&!a.done)).length;

  return (
    <div className="flex-1 flex flex-col bg-gray-950 p-6 overflow-y-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400"/>Team
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {team.length} member{team.length!==1?'s':''} · assign ownership across risks, decisions &amp; actions
          </p>
        </div>
        <button onClick={()=>{setShowAdd(v=>!v);setAddForm(EMPTY);setAddError('');}}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> Add Member
        </button>
      </div>

      {/* ── Unassigned warning ──────────────────────────────────────────────── */}
      {(unassignedRisks>0||unassignedActions>0) && (
        <div className="flex items-start gap-3 p-4 bg-amber-950/20 border border-amber-800/30 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
          <div className="flex-1">
            <div className="text-amber-300 font-medium text-sm">Unassigned items need owners</div>
            <div className="text-gray-400 text-xs mt-1 flex flex-wrap gap-4">
              {unassignedRisks>0   && <span>{unassignedRisks} open risk{unassignedRisks!==1?'s':''} without owner</span>}
              {unassignedActions>0 && <span>{unassignedActions} action item{unassignedActions!==1?'s':''} without owner</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {unassignedRisks>0   && <button onClick={()=>setActiveSection('risk')}     className="text-xs text-amber-400 hover:text-amber-300 underline">Risks</button>}
            {unassignedActions>0 && <button onClick={()=>setActiveSection('meetings')} className="text-xs text-amber-400 hover:text-amber-300 underline">Actions</button>}
          </div>
        </div>
      )}

      {/* ── Add member form ─────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="bg-gray-900 border border-purple-800/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Add New Team Member</h3>
            <button onClick={()=>setShowAdd(false)} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Full Name *</label>
              <input value={addForm.name} onChange={e=>{setAddForm({...addForm,name:e.target.value});setAddError('');}}
                placeholder="e.g. Sarah Johnson"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"/>
              {addError && <p className="text-red-400 text-xs mt-1">{addError}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Role</label>
              <select value={addForm.role} onChange={e=>setAddForm({...addForm,role:e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2.5 text-gray-300 text-sm outline-none transition-colors">
                <option value="">Select role...</option>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Email</label>
              <input value={addForm.email} onChange={e=>setAddForm({...addForm,email:e.target.value})}
                placeholder="email@company.com" type="email"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors"/>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4"/> Add Member
            </button>
            <button onClick={()=>{setShowAdd(false);setAddForm(EMPTY);setAddError('');}}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {team.length === 0 && !showAdd && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-700 mx-auto mb-4"/>
          <h3 className="text-white font-semibold mb-2">No team members yet</h3>
          <p className="text-gray-500 text-sm mb-4">Add members to assign ownership across risks, decisions and action items</p>
          <button onClick={()=>setShowAdd(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">
            Add First Member
          </button>
        </div>
      )}

      {/* ── Member cards ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {team.map((m: TeamMember) => {
          const isEditing  = editingId  === m.id;
          const isExpanded = expandedId === m.id;
          const load       = totalLoad(m.name);
          const workload   = isExpanded ? getWorkload(m.name) : null;
          const loadColor  = load>=5?'text-red-400 bg-red-950/40':load>=3?'text-amber-400 bg-amber-950/40':'text-green-400 bg-green-950/40';

          return (
            <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">

              {/* ── Card row ── */}
              <div className="flex items-center gap-4 p-4">

                {/* Avatar */}
                <Avatar name={isEditing ? (editForm.name||m.name) : m.name} size="md"/>

                {/* Info / Edit form */}
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                      <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}
                        autoFocus className="w-full bg-gray-800 border border-purple-500 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none"/>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Role</label>
                      <select value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-300 text-sm outline-none">
                        <option value="">Select role...</option>
                        {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Email</label>
                      <input value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})}
                        type="email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none focus:border-purple-500"/>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{m.name}</span>
                      {m.role && <span className="text-xs px-2 py-0.5 bg-purple-950/40 text-purple-400 rounded-full">{m.role}</span>}
                      {load > 0 && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loadColor}`}>{load} item{load!==1?'s':''}</span>}
                    </div>
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="text-gray-500 text-xs hover:text-gray-300 flex items-center gap-1 mt-0.5 w-fit transition-colors">
                        <Mail className="w-3 h-3"/>{m.email}
                      </a>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={()=>handleSaveEdit(m.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors">
                        <Check className="w-3.5 h-3.5"/> Save
                      </button>
                      <button onClick={()=>setEditingId(null)}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>startEdit(m)} title="Edit member"
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-colors">
                        <Edit3 className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={()=>handleDelete(m.id)} title="Remove member"
                        className="p-1.5 bg-gray-800 hover:bg-red-950/60 text-gray-400 hover:text-red-400 rounded-lg border border-gray-700 transition-colors">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                      {load > 0 && (
                        <button onClick={()=>setExpandedId(isExpanded?null:m.id)} title="View workload"
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg border border-gray-700 transition-colors">
                          {isExpanded?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Expanded workload ── */}
              {isExpanded && workload && (
                <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label:'Open Risks',  count: workload.risks.length,     color:'text-amber-400',  section:'risk' },
                      { label:'Decisions',   count: workload.decisions.length,  color:'text-emerald-400',section:'decisions' },
                      { label:'Actions',     count: workload.actions.length,    color:'text-blue-400',   section:'meetings' },
                    ].map(s=>(
                      <button key={s.label} onClick={()=>setActiveSection(s.section)}
                        className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 text-center transition-colors">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                      </button>
                    ))}
                  </div>

                  {workload.risks.length>0 && (
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1.5">Risks</div>
                      {workload.risks.slice(0,3).map((r:any)=>(
                        <div key={r.id} className="flex items-center gap-2 text-xs py-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.impact==='high'?'bg-red-400':r.impact==='medium'?'bg-amber-400':'bg-green-400'}`}/>
                          <span className="text-gray-400 truncate">{r.risk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {workload.actions.length>0 && (
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1.5">Actions</div>
                      {workload.actions.slice(0,3).map((a:any,i:number)=>(
                        <div key={i} className="flex items-center gap-2 text-xs py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"/>
                          <span className="text-gray-400 truncate flex-1">{a.text}</span>
                          {a.dueDate && <span className={`flex-shrink-0 ${a.dueDate<new Date().toISOString().split('T')[0]?'text-red-400':'text-gray-600'}`}>{a.dueDate}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
