import { useState } from 'react';
import {
  CheckSquare, Plus, Trash2, X, Download, ChevronRight,
  Sparkles, Loader2, Edit3, Save, ChevronUp, ChevronDown,
  CheckCheck, Square, RotateCcw, FolderOpen,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Checklist, ChecklistItem, Phase } from '../types';
import { saveAs } from 'file-saver';
import { RESOURCES } from '../data/resources';
import { useClaudeAI, getApiKey, getProvider } from '../hooks/useClaudeAI';

const PHASE_CFG: Record<Phase, { text: string; bar: string; bg: string }> = {
  discovery: { text:'text-blue-400',   bar:'bg-blue-500',   bg:'bg-blue-950/30 border-blue-800/30' },
  planning:  { text:'text-purple-400', bar:'bg-purple-500', bg:'bg-purple-950/30 border-purple-800/30' },
  pilot:     { text:'text-amber-400',  bar:'bg-amber-500',  bg:'bg-amber-950/30 border-amber-800/30' },
  scaling:   { text:'text-green-400',  bar:'bg-green-500',  bg:'bg-green-950/30 border-green-800/30' },
  optimize:  { text:'text-red-400',    bar:'bg-red-500',    bg:'bg-red-950/30 border-red-800/30' },
};
const PHASES: Phase[] = ['discovery','planning','pilot','scaling','optimize'];

// ── SVG Ring ─────────────────────────────────────────────────────────────────
function Ring({ pct, size=48, stroke=4, color='#a855f7' }: { pct:number; size?:number; stroke?:number; color?:string }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 0.4s ease'}}/>
    </svg>
  );
}

export default function ChecklistManager() {
  const {
    checklists, addChecklist, updateChecklistItem, addChecklistItem,
    deleteChecklist, updateChecklist, activeProjectId, currentProject,
  } = useStore() as any;

  const [selectedId, setSelectedId]   = useState<string|null>(checklists[0]?.id ?? null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string|null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [filterPhase, setFilterPhase] = useState<Phase|'all'>('all');
  const [filterProject, setFilterProject] = useState<'mine'|'all'>('mine');
  const [newForm, setNewForm]         = useState({ title:'', phase:'discovery' as Phase });

  // AI
  const { run, loading: aiLoading } = useClaudeAI();
  const [aiTopic, setAiTopic]       = useState('');
  const [aiPhase, setAiPhase]       = useState<Phase>('discovery');
  const [showAIForm, setShowAIForm] = useState(false);
  const [aiError, setAiError]       = useState('');
  const hasKey = !!getApiKey(getProvider());

  const templateChecklists = RESOURCES.filter(r => r.category === 'checklist');

  // Filter checklists
  const visibleChecklists = checklists.filter((cl: Checklist) => {
    const phaseOk   = filterPhase === 'all' || cl.phase === filterPhase;
    const projectOk = filterProject === 'all' || !cl.projectId || cl.projectId === activeProjectId;
    return phaseOk && projectOk;
  });

  const selected   = checklists.find((cl: Checklist) => cl.id === selectedId) ?? null;
  const getProgress = (cl: Checklist) =>
    cl.items.length === 0 ? 0 : Math.round((cl.items.filter(i=>i.checked).length/cl.items.length)*100);

  // Phase summary
  const phaseSummary = PHASES.map(phase => {
    const phaseCls = checklists.filter((cl: Checklist) => cl.phase === phase);
    const items    = phaseCls.flatMap((cl: Checklist) => cl.items);
    const done     = items.filter((i:ChecklistItem) => i.checked).length;
    return { phase, total: items.length, done, pct: items.length>0?Math.round((done/items.length)*100):0, clCount: phaseCls.length };
  }).filter(p => p.clCount > 0);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleImportTemplate = (resourceId: string) => {
    const resource = RESOURCES.find(r => r.id === resourceId);
    if (!resource) return;
    const items: ChecklistItem[] = [];
    resource.content.split('\n').forEach((line: string, i: number) => {
      const match = line.match(/^- \[( |x)\] (.+)/);
      if (match) items.push({ id:`item-${Date.now()}-${i}`, text:match[2], checked:match[1]==='x' });
    });
    const cl: Checklist = { id:`cl-${Date.now()}`, title:resource.title, phase:resource.phase[0]||'discovery', scope:'both', items, createdAt:new Date().toISOString(), projectId:activeProjectId||undefined };
    addChecklist(cl); setSelectedId(cl.id);
  };

  const handleCreateNew = () => {
    if (!newForm.title) return;
    const cl: Checklist = { id:`cl-${Date.now()}`, title:newForm.title, phase:newForm.phase, scope:'both', items:[], createdAt:new Date().toISOString(), projectId:activeProjectId||undefined };
    addChecklist(cl); setSelectedId(cl.id); setShowNewForm(false); setNewForm({title:'',phase:'discovery'});
  };

  const handleAddItem = () => {
    if (!newItemText || !selectedId) return;
    addChecklistItem(selectedId, { id:`item-${Date.now()}`, text:newItemText, checked:false });
    setNewItemText('');
  };

  const handleBulkCheck = (check: boolean) => {
    if (!selected) return;
    selected.items.forEach((item: ChecklistItem) => {
      if (item.checked !== check) updateChecklistItem(selected.id, item.id, check);
    });
  };

  const handleDeleteDone = () => {
    if (!selected) return;
    const remaining = selected.items.filter((i: ChecklistItem) => !i.checked);
    // update via store — replace all items
    if (updateChecklist) updateChecklist(selected.id, { items: remaining });
  };

  const handleReorder = (itemId: string, dir: 'up'|'down') => {
    if (!selected || !updateChecklist) return;
    const items = [...selected.items];
    const idx   = items.findIndex((i: ChecklistItem) => i.id === itemId);
    const target = dir==='up' ? idx-1 : idx+1;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    updateChecklist(selected.id, { items });
  };

  const handleSaveEdit = (itemId: string) => {
    if (!selected || !editingItemText.trim() || !updateChecklist) return;
    const items = selected.items.map((i: ChecklistItem) => i.id===itemId?{...i,text:editingItemText.trim()}:i);
    updateChecklist(selected.id, { items });
    setEditingItemId(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selected || !updateChecklist) return;
    updateChecklist(selected.id, { items: selected.items.filter((i: ChecklistItem) => i.id !== itemId) });
  };

  const handleExport = (cl: Checklist) => {
    const md = [`# ${cl.title}`,``,`**Phase:** ${cl.phase}  **Progress:** ${getProgress(cl)}%  **Created:** ${new Date(cl.createdAt).toLocaleDateString()}`,``,
      ...cl.items.map((i: ChecklistItem) => `- [${i.checked?'x':' '}] ${i.text}`)].join('\n');
    saveAs(new Blob([md],{type:'text/markdown;charset=utf-8'}), `${cl.title.replace(/\s+/g,'-').toLowerCase()}.md`);
  };

  // ── AI Generate ───────────────────────────────────────────────────────────
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiError('');
    const sys = `You are an expert AI IT transformation consultant. Return ONLY a valid JSON array of strings — no markdown, no explanation.`;
    const user = `Generate a comprehensive checklist for: "${aiTopic}" (${aiPhase} phase of an AI IT Ops transformation).
Return 10-15 specific, actionable items as a JSON array of strings: ["Item 1", "Item 2", ...]`;
    try {
      const raw   = await run(sys, user);
      const items: string[] = JSON.parse(raw);
      const clItems: ChecklistItem[] = items.map((text,i) => ({ id:`item-${Date.now()}-${i}`, text, checked:false }));
      const cl: Checklist = {
        id:`cl-${Date.now()}`, title:aiTopic, phase:aiPhase, scope:'both',
        items:clItems, createdAt:new Date().toISOString(), projectId:activeProjectId||undefined,
      };
      addChecklist(cl); setSelectedId(cl.id); setShowAIForm(false); setAiTopic('');
    } catch(e:any) {
      setAiError(e.message==='NO_API_KEY'?'Configure API key in sidebar settings first':e.message??'AI error');
    }
  };

  const doneCount = selected?.items.filter((i:ChecklistItem)=>i.checked).length ?? 0;
  const pct       = selected ? getProgress(selected) : 0;
  const barColor  = pct===100?'#22c55e':pct>=50?'#a855f7':'#6366f1';

  return (
    <div className="flex-1 flex min-h-screen bg-gray-950">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-800 flex flex-col">

        {/* Header + controls */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Checklists</h2>
            <div className="flex items-center gap-1.5">
              {hasKey && (
                <button onClick={()=>setShowAIForm(v=>!v)}
                  className="p-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 text-purple-400 rounded-lg transition-colors" title="AI Generate">
                  <Sparkles className="w-3.5 h-3.5"/>
                </button>
              )}
              <button onClick={()=>setShowNewForm(v=>!v)}
                className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* Project scope toggle */}
          {currentProject && (
            <div className="flex gap-1">
              {[{id:'mine',label:'This project'},{id:'all',label:'All projects'}].map(f=>(
                <button key={f.id} onClick={()=>setFilterProject(f.id as any)}
                  className={`flex-1 py-1 text-xs rounded-lg transition-all ${filterProject===f.id?'bg-purple-600 text-white':'bg-gray-800 text-gray-500 hover:text-gray-300'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* AI Generate form */}
          {showAIForm && (
            <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-3 space-y-2">
              <div className="text-xs text-purple-300 font-medium flex items-center gap-1.5"><Sparkles className="w-3 h-3"/>AI Generate Checklist</div>
              <input value={aiTopic} onChange={e=>setAiTopic(e.target.value)}
                placeholder="e.g. Stakeholder readiness assessment"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"/>
              <select value={aiPhase} onChange={e=>setAiPhase(e.target.value as Phase)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-300 text-xs outline-none">
                {PHASES.map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
              {aiError && <div className="text-red-400 text-xs">{aiError}</div>}
              <div className="flex gap-2">
                <button onClick={handleAIGenerate} disabled={aiLoading||!aiTopic.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs rounded-lg transition-colors">
                  {aiLoading?<><Loader2 className="w-3 h-3 animate-spin"/>Generating…</>:<><Sparkles className="w-3 h-3"/>Generate</>}
                </button>
                <button onClick={()=>setShowAIForm(false)} className="p-1.5 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          )}

          {/* New checklist form */}
          {showNewForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 space-y-2">
              <input value={newForm.title} onChange={e=>setNewForm({...newForm,title:e.target.value})}
                placeholder="Checklist title..."
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"/>
              <select value={newForm.phase} onChange={e=>setNewForm({...newForm,phase:e.target.value as Phase})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-300 text-xs outline-none">
                {PHASES.map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleCreateNew} className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg">Create</button>
                <button onClick={()=>setShowNewForm(false)} className="p-1.5 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          )}
        </div>

        {/* Phase summary */}
        {phaseSummary.length > 0 && (
          <div className="px-3 py-2 border-b border-gray-800 space-y-1.5">
            {phaseSummary.map(p=>(
              <button key={p.phase} onClick={()=>setFilterPhase(filterPhase===p.phase?'all':p.phase)}
                className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${filterPhase===p.phase?PHASE_CFG[p.phase as Phase].bg+' border':'hover:bg-gray-800/50'}`}>
                <span className={`text-xs font-medium capitalize w-16 text-left ${PHASE_CFG[p.phase as Phase].text}`}>{p.phase}</span>
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${PHASE_CFG[p.phase as Phase].bar} transition-all`} style={{width:`${p.pct}%`}}/>
                </div>
                <span className="text-gray-600 text-xs w-7 text-right">{p.pct}%</span>
              </button>
            ))}
          </div>
        )}

        {/* Template import */}
        <div className="px-3 pt-3 pb-1 border-b border-gray-800">
          <div className="text-gray-600 text-xs uppercase tracking-wider font-medium mb-1.5">Import Templates</div>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {templateChecklists.map(r=>(
              <button key={r.id} onClick={()=>handleImportTemplate(r.id)}
                className="w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-900 rounded-lg transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-gray-700 flex-shrink-0"/>
                <span className="truncate">{r.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Checklist list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {visibleChecklists.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-xs">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30"/>
              <p>No checklists yet</p>
              <p className="mt-1">{hasKey?'AI generate or import a template':'Import a template or create new'}</p>
            </div>
          )}
          {visibleChecklists.map((cl: Checklist)=>{
            const p = getProgress(cl);
            const cfg = PHASE_CFG[cl.phase];
            return (
              <button key={cl.id} onClick={()=>setSelectedId(cl.id)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all ${selectedId===cl.id?'bg-gray-800 border border-gray-700':'hover:bg-gray-900 border border-transparent'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-200 font-medium truncate pr-2">{cl.title}</span>
                  {cl.projectId && <FolderOpen className="w-3 h-3 text-gray-600 flex-shrink-0" title="Project-scoped"/>}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{width:`${p}%`}}/>
                  </div>
                  <span className={`text-xs font-semibold ${p===100?'text-green-400':cfg.text}`}>{p}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs capitalize ${cfg.text}`}>{cl.phase}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-600 text-xs">{cl.items.filter(i=>i.checked).length}/{cl.items.length}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Checklist detail ───────────────────────────────────────── */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Progress ring */}
              <div className="relative flex-shrink-0">
                <Ring pct={pct} size={56} stroke={5} color={barColor}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{pct}%</span>
                </div>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">{selected.title}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs capitalize ${PHASE_CFG[selected.phase].text}`}>{selected.phase} phase</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-500 text-xs">{doneCount}/{selected.items.length} done</span>
                  {selected.projectId && <><span className="text-gray-700">·</span><span className="text-gray-600 text-xs flex items-center gap-1"><FolderOpen className="w-3 h-3"/>Project</span></>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={()=>handleBulkCheck(true)} title="Check all"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors">
                <CheckCheck className="w-3.5 h-3.5"/>Check all
              </button>
              <button onClick={()=>handleBulkCheck(false)} title="Uncheck all"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors">
                <RotateCcw className="w-3.5 h-3.5"/>Reset
              </button>
              {doneCount>0 && (
                <button onClick={handleDeleteDone}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/>Remove done
                </button>
              )}
              <button onClick={()=>handleExport(selected)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors">
                <Download className="w-3.5 h-3.5"/>Export
              </button>
              <button onClick={()=>{deleteChecklist(selected.id);setSelectedId(null);}}
                className="p-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg border border-gray-700 transition-colors">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{width:`${pct}%`, background:`linear-gradient(90deg, #6366f1, ${barColor})`}}/>
          </div>

          {/* Completion banner */}
          {pct===100 && (
            <div className="flex items-center gap-3 p-4 bg-green-950/30 border border-green-800/40 rounded-2xl mb-4">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="text-green-300 font-semibold text-sm">Checklist complete!</div>
                <div className="text-gray-400 text-xs mt-0.5">All {selected.items.length} items checked off</div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2 mb-6">
            {selected.items.length===0 && (
              <div className="text-center py-12 text-gray-600">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                <p className="text-sm">No items yet — add one below</p>
              </div>
            )}
            {selected.items.map((item: ChecklistItem, idx: number)=>(
              <div key={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${item.checked?'bg-green-950/20 border-green-900/30':'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>

                {/* Checkbox */}
                <button onClick={()=>updateChecklistItem(selected.id,item.id,!item.checked)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.checked?'bg-green-500 border-green-500':'border-gray-600 hover:border-purple-500'}`}>
                  {item.checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                </button>

                {/* Text / edit */}
                {editingItemId===item.id ? (
                  <input value={editingItemText} onChange={e=>setEditingItemText(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter')handleSaveEdit(item.id);if(e.key==='Escape')setEditingItemId(null);}}
                    autoFocus
                    className="flex-1 bg-gray-800 border border-purple-500 rounded-lg px-2 py-1 text-white text-sm outline-none"/>
                ) : (
                  <span className={`flex-1 text-sm leading-relaxed ${item.checked?'text-gray-500 line-through':'text-gray-200'}`}>{item.text}</span>
                )}

                {/* Item actions — visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {editingItemId===item.id ? (
                    <button onClick={()=>handleSaveEdit(item.id)} className="p-1 text-green-400 hover:text-green-300"><Save className="w-3.5 h-3.5"/></button>
                  ) : (
                    <button onClick={()=>{setEditingItemId(item.id);setEditingItemText(item.text);}} className="p-1 text-gray-500 hover:text-gray-300 transition-colors"><Edit3 className="w-3.5 h-3.5"/></button>
                  )}
                  <button onClick={()=>handleReorder(item.id,'up')} disabled={idx===0} className="p-1 text-gray-600 hover:text-gray-400 disabled:opacity-20 transition-colors"><ChevronUp className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>handleReorder(item.id,'down')} disabled={idx===selected.items.length-1} className="p-1 text-gray-600 hover:text-gray-400 disabled:opacity-20 transition-colors"><ChevronDown className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>handleDeleteItem(item.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="flex gap-2">
            <input value={newItemText} onChange={e=>setNewItemText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleAddItem()}
              placeholder="Add checklist item... (Enter to add)"
              className="flex-1 bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-purple-500 rounded-xl px-4 py-2.5 text-gray-300 text-sm outline-none placeholder-gray-600 transition-colors"/>
            <button onClick={handleAddItem} disabled={!newItemText.trim()}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-sm rounded-xl flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4"/>Add
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CheckSquare className="w-16 h-16 text-gray-700 mx-auto mb-4"/>
            <p className="text-gray-400 font-medium">No checklist selected</p>
            <p className="text-gray-600 text-sm mt-1">{hasKey?'AI-generate, import a template, or create new':'Import a template or create a new checklist'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
