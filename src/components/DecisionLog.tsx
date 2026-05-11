import { useState } from 'react';
import { BookMarked, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { OwnerPicker } from './OwnerPicker';
import { DecisionRecord, DecisionStatus } from '../types';

const PHASES = ['discovery','planning','pilot','scaling','optimize','general'];
const STATUS_META: Record<DecisionStatus,{label:string,color:string,dot:string}> = {
  proposed:  { label:'Proposed',  color:'bg-blue-950/40 text-blue-400',   dot:'bg-blue-400' },
  approved:  { label:'Approved',  color:'bg-green-950/40 text-green-400', dot:'bg-green-400' },
  deferred:  { label:'Deferred',  color:'bg-amber-950/40 text-amber-400', dot:'bg-amber-400' },
  reversed:  { label:'Reversed',  color:'bg-red-950/40 text-red-400',     dot:'bg-red-400' },
};
const EMPTY: Omit<DecisionRecord,'id'> = {
  title:'', date:new Date().toISOString().split('T')[0], owner:'',
  status:'proposed', phase:'general', rationale:'', alternatives:'', impact:'', reviewDate:'',
};

export default function DecisionLog() {
  const { decisions, addDecision, updateDecision, deleteDecision } = useStore();
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string|null>(null);
  const [form, setForm]             = useState<Omit<DecisionRecord,'id'>>(EMPTY);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [filterStatus, setFilterStatus] = useState<DecisionStatus|'all'>('all');
  const [filterPhase, setFilterPhase]   = useState('all');

  const filtered = decisions
    .filter(d => (filterStatus==='all' || d.status===filterStatus) && (filterPhase==='all' || d.phase===filterPhase))
    .sort((a,b) => b.date.localeCompare(a.date));

  const handleSave = () => {
    if (!form.title) return;
    if (editingId) updateDecision(editingId, form);
    else addDecision({ ...form, id:`dec-${Date.now()}` });
    setForm(EMPTY); setEditingId(null); setShowForm(false);
  };

  const handleEdit = (d: DecisionRecord) => {
    setForm({ title:d.title, date:d.date, owner:d.owner, status:d.status, phase:d.phase, rationale:d.rationale, alternatives:d.alternatives, impact:d.impact, reviewDate:d.reviewDate });
    setEditingId(d.id); setShowForm(true);
  };

  const counts = Object.keys(STATUS_META).reduce((acc,s) => ({
    ...acc, [s]: decisions.filter(d=>d.status===s).length
  }), {} as Record<string,number>);

  return (
    <div className="flex-1 flex flex-col bg-gray-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-3"><BookMarked className="w-6 h-6 text-emerald-400"/>Decision Log</h1>
          <p className="text-gray-400 text-sm mt-1">Capture decisions, rationale, and review dates for audit trails</p>
        </div>
        <button onClick={()=>{setForm(EMPTY);setEditingId(null);setShowForm(true)}}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> Log Decision
        </button>
      </div>

      {/* Status summary pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(STATUS_META) as [DecisionStatus, typeof STATUS_META[DecisionStatus]][]).map(([s,m])=>(
          <button key={s} onClick={()=>setFilterStatus(filterStatus===s?'all':s)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${filterStatus===s?'border-gray-600 bg-gray-800':'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.dot}`}/>
            <div>
              <div className="text-gray-400 text-xs">{m.label}</div>
              <div className="text-white font-bold text-lg">{counts[s]||0}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap">
        {['all',...PHASES].map(p=>(
          <button key={p} onClick={()=>setFilterPhase(p)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${filterPhase===p?'bg-emerald-600 text-white':'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-white font-semibold">{editingId?'Edit Decision':'Log New Decision'}</h3><button onClick={()=>{setShowForm(false);setEditingId(null)}}><X className="w-4 h-4 text-gray-500"/></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="text-xs text-gray-400 mb-1 block">Decision Title *</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
            </div>
            {[['date','Date','date'],['reviewDate','Review Date','date'],].map(([f,l,t])=>(
              <div key={f}>
                <label className="text-xs text-gray-400 mb-1 block">{l}</label>
                <input type={t} value={(form as any)[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value as DecisionStatus})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                {Object.entries(STATUS_META).map(([s,m])=><option key={s} value={s}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Owner</label>
              <OwnerPicker value={form.owner} onChange={(v)=>setForm({...form,owner:v})} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phase</label>
              <select value={form.phase} onChange={e=>setForm({...form,phase:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                {PHASES.map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          {[['rationale','Rationale / Why this decision'],['alternatives','Alternatives Considered'],['impact','Expected Impact']].map(([f,l])=>(
            <div key={f}>
              <label className="text-xs text-gray-400 mb-1 block">{l}</label>
              <textarea value={(form as any)[f]} onChange={e=>setForm({...form,[f]:e.target.value})} rows={2}
                className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"><Save className="w-4 h-4"/>Save Decision</button>
            <button onClick={()=>{setShowForm(false);setEditingId(null)}} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length===0 && !showForm && (
        <div className="text-center py-20"><BookMarked className="w-12 h-12 text-gray-700 mx-auto mb-3"/><p className="text-gray-500 text-sm">{decisions.length===0?'No decisions logged yet':'No decisions match the current filter'}</p></div>
      )}

      {/* Decision list */}
      <div className="space-y-3">
        {filtered.map(d=>{
          const isExpanded = expandedId===d.id;
          const meta = STATUS_META[d.status];
          return (
            <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${meta.dot}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">{d.phase}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/>{d.date}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{d.title}</h3>
                    {d.owner && <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1"><User className="w-3 h-3"/>{d.owner}</p>}
                    {d.reviewDate && <p className="text-gray-600 text-xs mt-0.5">Review: {d.reviewDate}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Quick status change */}
                  <select value={d.status} onChange={e=>updateDecision(d.id,{status:e.target.value as DecisionStatus})}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 text-xs outline-none mr-1">
                    {Object.entries(STATUS_META).map(([s,m])=><option key={s} value={s}>{m.label}</option>)}
                  </select>
                  <button onClick={()=>handleEdit(d)} className="p-1.5 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>deleteDecision(d.id)} className="p-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>setExpandedId(isExpanded?null:d.id)} className="p-1.5 hover:bg-gray-800 text-gray-500 rounded-lg transition-colors">
                    {isExpanded?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
                  {[['rationale','Rationale'],['alternatives','Alternatives Considered'],['impact','Expected Impact']].map(([f,l])=>
                    (d as any)[f] ? (
                      <div key={f}>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{l}</div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{(d as any)[f]}</p>
                      </div>
                    ) : null
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
