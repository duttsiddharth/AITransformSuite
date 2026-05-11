import { useState } from 'react';
import { Users, Plus, Trash2, Edit3, Save, X, CheckSquare, Square, ChevronDown, ChevronUp, Sparkles, Loader2, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MeetingRecord, ActionItem } from '../types';
import { useClaudeAI, getApiKey, getProvider } from '../hooks/useClaudeAI';
import { OwnerPicker } from './OwnerPicker';

const PHASES = ['discovery','planning','pilot','scaling','optimize','general'];
const EMPTY: Omit<MeetingRecord,'id'> = { title:'', date: new Date().toISOString().split('T')[0], attendees:'', phase:'general', agenda:'', notes:'', decisions:'', actionItems:[] };

export default function MeetingTracker() {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, toggleActionItem } = useStore();
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm]           = useState<Omit<MeetingRecord,'id'>>(EMPTY);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [filterPhase, setFilterPhase] = useState('all');
  const [newAction, setNewAction] = useState<Record<string,{text:string,owner:string,due:string}>>({});

  const { run, loading: aiLoading } = useClaudeAI();
  const [aiError, setAiError]       = useState('');
  const hasKey = !!getApiKey(getProvider());

  const filtered = meetings.filter(m => filterPhase === 'all' || m.phase === filterPhase)
    .sort((a,b) => b.date.localeCompare(a.date));

  const handleSave = () => {
    if (!form.title) return;
    if (editingId) updateMeeting(editingId, form);
    else addMeeting({ ...form, id:`mtg-${Date.now()}` });
    setForm(EMPTY); setEditingId(null); setShowForm(false);
  };

  const handleEdit = (m: MeetingRecord) => {
    setForm({ title:m.title, date:m.date, attendees:m.attendees, phase:m.phase, agenda:m.agenda, notes:m.notes, decisions:m.decisions, actionItems:m.actionItems });
    setEditingId(m.id); setShowForm(true);
  };

  const addActionItem = (meetingId: string) => {
    const na = newAction[meetingId];
    if (!na?.text) return;
    const item: ActionItem = { id:`ai-${Date.now()}`, text:na.text, owner:na.owner||'', dueDate:na.due||'', done:false };
    const m = meetings.find(x=>x.id===meetingId)!;
    updateMeeting(meetingId, { actionItems:[...m.actionItems, item] });
    setNewAction(prev=>({...prev,[meetingId]:{text:'',owner:'',due:''}}));
  };

  const handleAIExtract = async (m: MeetingRecord) => {
    setAiError('');
    const sys = `You are an expert meeting facilitator. Return ONLY a JSON array of action items, no markdown.`;
    const user = `Extract action items from this meeting.\nNotes: ${m.notes}\nDecisions: ${m.decisions}\n\nReturn: [{"text":"...","owner":"...","dueDate":""}]`;
    try {
      const raw = await run(sys, user);
      const items: {text:string,owner:string,dueDate:string}[] = JSON.parse(raw);
      const newItems: ActionItem[] = items.map((it,i)=>({ id:`ai-${Date.now()}-${i}`, text:it.text, owner:it.owner||'', dueDate:it.dueDate||'', done:false }));
      updateMeeting(m.id, { actionItems:[...m.actionItems, ...newItems] });
    } catch(e:any) { setAiError(e.message==='NO_API_KEY'?'Configure API key in sidebar settings':e.message); }
  };

  const openActions = meetings.flatMap(m=>m.actionItems.filter(a=>!a.done).map(a=>({...a,meetingTitle:m.title,meetingId:m.id})));

  return (
    <div className="flex-1 flex flex-col bg-gray-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-3"><Users className="w-6 h-6 text-blue-400"/>Meeting Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">{meetings.length} meetings · {openActions.length} open actions</p>
        </div>
        <button onClick={()=>{setForm(EMPTY);setEditingId(null);setShowForm(true)}}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> Log Meeting
        </button>
      </div>

      {aiError && <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-red-300 text-sm flex justify-between"><span>{aiError}</span><button onClick={()=>setAiError('')}><X className="w-4 h-4"/></button></div>}

      {/* Open Actions Summary */}
      {openActions.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4">
          <div className="text-amber-300 font-medium text-sm mb-3 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Open Action Items ({openActions.length})</div>
          <div className="space-y-2">
            {openActions.slice(0,5).map(a=>(
              <div key={a.id} className="flex items-center gap-3 bg-gray-900/60 rounded-lg px-3 py-2">
                <button onClick={()=>toggleActionItem(a.meetingId,a.id)} className="text-gray-600 hover:text-green-400 transition-colors flex-shrink-0"><Square className="w-4 h-4"/></button>
                <span className="text-gray-300 text-sm flex-1 min-w-0 truncate">{a.text}</span>
                {a.owner && <span className="text-xs text-gray-500 flex-shrink-0">{a.owner}</span>}
                {a.dueDate && <span className="text-xs text-amber-400 flex-shrink-0">{a.dueDate}</span>}
              </div>
            ))}
            {openActions.length > 5 && <div className="text-xs text-gray-500 pl-7">+{openActions.length-5} more</div>}
          </div>
        </div>
      )}

      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap">
        {['all',...PHASES].map(p=>(
          <button key={p} onClick={()=>setFilterPhase(p)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${filterPhase===p?'bg-blue-600 text-white':'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-white font-semibold">{editingId?'Edit Meeting':'Log New Meeting'}</h3><button onClick={()=>{setShowForm(false);setEditingId(null)}}><X className="w-4 h-4 text-gray-500"/></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Meeting Title *</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phase</label>
              <select value={form.phase} onChange={e=>setForm({...form,phase:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                {PHASES.map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Attendees</label>
              <input value={form.attendees} onChange={e=>setForm({...form,attendees:e.target.value})} placeholder="John, Sarah, Mike..." className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
            </div>
          </div>
          {[['agenda','Agenda / Purpose'],['notes','Notes & Discussion'],['decisions','Decisions Made']].map(([field,label])=>(
            <div key={field}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <textarea value={(form as any)[field]} onChange={e=>setForm({...form,[field]:e.target.value})} rows={3}
                className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"><Save className="w-4 h-4"/>Save Meeting</button>
            <button onClick={()=>{setShowForm(false);setEditingId(null)}} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm transition-colors hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Meeting list */}
      {filtered.length === 0 && !showForm && (
        <div className="text-center py-20"><Users className="w-12 h-12 text-gray-700 mx-auto mb-3"/><p className="text-gray-500 text-sm">No meetings logged yet</p></div>
      )}

      <div className="space-y-3">
        {filtered.map(m=>{
          const isExpanded = expandedId===m.id;
          const openCount  = m.actionItems.filter(a=>!a.done).length;
          const doneCount  = m.actionItems.filter(a=>a.done).length;
          const na = newAction[m.id] || {text:'',owner:'',due:''};
          return (
            <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950/40 text-blue-400 capitalize">{m.phase}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/>{m.date}</span>
                    {openCount>0 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400">{openCount} open actions</span>}
                    {doneCount>0 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-950/40 text-green-400">{doneCount} done</span>}
                  </div>
                  <h3 className="text-white font-semibold text-sm">{m.title}</h3>
                  {m.attendees && <p className="text-gray-500 text-xs mt-0.5">👥 {m.attendees}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {hasKey && <button onClick={()=>handleAIExtract(m)} disabled={aiLoading} title="AI: Extract actions" className="p-1.5 hover:bg-purple-900/30 text-gray-600 hover:text-purple-400 rounded-lg transition-colors disabled:opacity-40"><Sparkles className="w-3.5 h-3.5"/></button>}
                  <button onClick={()=>handleEdit(m)} className="p-1.5 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>deleteMeeting(m.id)} className="p-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>setExpandedId(isExpanded?null:m.id)} className="p-1.5 hover:bg-gray-800 text-gray-500 rounded-lg transition-colors">
                    {isExpanded?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  {m.agenda    && <div><div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Agenda</div><p className="text-gray-300 text-sm whitespace-pre-wrap">{m.agenda}</p></div>}
                  {m.notes     && <div><div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Notes</div><p className="text-gray-300 text-sm whitespace-pre-wrap">{m.notes}</p></div>}
                  {m.decisions && <div><div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Decisions</div><p className="text-gray-300 text-sm whitespace-pre-wrap">{m.decisions}</p></div>}

                  {/* Action items */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Action Items</div>
                    <div className="space-y-1.5 mb-3">
                      {m.actionItems.map(a=>(
                        <div key={a.id} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                          <button onClick={()=>toggleActionItem(m.id,a.id)} className={`flex-shrink-0 transition-colors ${a.done?'text-green-400':'text-gray-600 hover:text-green-400'}`}>
                            {a.done?<CheckSquare className="w-4 h-4"/>:<Square className="w-4 h-4"/>}
                          </button>
                          <span className={`text-sm flex-1 ${a.done?'line-through text-gray-600':'text-gray-300'}`}>{a.text}</span>
                          {a.owner && <span className="text-xs text-gray-500">{a.owner}</span>}
                          {a.dueDate && <span className="text-xs text-amber-400">{a.dueDate}</span>}
                        </div>
                      ))}
                    </div>
                    {/* Add action */}
                    <div className="flex gap-2 flex-wrap">
                      <input value={na.text} onChange={e=>setNewAction(p=>({...p,[m.id]:{...na,text:e.target.value}}))} placeholder="Action item..." className="flex-1 min-w-32 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-blue-500"/>
                      <div className="w-36"><OwnerPicker value={na.owner} onChange={v=>setNewAction(p=>({...p,[m.id]:{...na,owner:v}}))} placeholder="Owner" className="text-xs"/></div>
                      <input type="date" value={na.due} onChange={e=>setNewAction(p=>({...p,[m.id]:{...na,due:e.target.value}}))} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-400 text-xs outline-none w-32"/>
                      <button onClick={()=>addActionItem(m.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors"><Plus className="w-3 h-3"/></button>
                    </div>
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
