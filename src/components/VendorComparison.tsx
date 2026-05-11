import { useState } from 'react';
import { ShoppingBag, Plus, Trash2, Edit3, Save, X, Star, Trophy, Settings, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import { VendorRecord, VendorCriterion } from '../types';

const CATEGORIES = ['AIOps Platform','ITSM Tool','Observability','Automation','Analytics','LLM Provider','Other'];
const EMPTY_VENDOR: Omit<VendorRecord,'id'|'scores'> = { name:'', category:'AIOps Platform', website:'', notes:'' };

function ScoreDot({ score, max=5 }: { score:number; max?:number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({length:max}).map((_,i)=>(
        <div key={i} className={`w-2 h-2 rounded-full ${i<score?'bg-purple-400':'bg-gray-700'}`}/>
      ))}
    </div>
  );
}

export default function VendorComparison() {
  const { vendors, criteria, addVendor, updateVendor, deleteVendor, setCriteria, setVendorScore } = useStore();
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showCriteriaEdit, setShowCriteriaEdit] = useState(false);
  const [editingId, setEditingId]             = useState<string|null>(null);
  const [form, setForm]                       = useState<Omit<VendorRecord,'id'|'scores'>>(EMPTY_VENDOR);
  const [localCriteria, setLocalCriteria]     = useState<VendorCriterion[]>(criteria);
  const [filterCat, setFilterCat]             = useState('all');

  const getWeightedScore = (vendor: VendorRecord) => {
    const totalWeight = criteria.reduce((s,c)=>s+c.weight,0);
    if (totalWeight===0) return 0;
    const weightedSum = criteria.reduce((s,c)=>{
      const sc = vendor.scores.find(x=>x.criterionId===c.id);
      return s + (sc?.score||0)*c.weight;
    },0);
    return Math.round((weightedSum/(totalWeight*5))*100);
  };

  const filtered = vendors.filter(v=>filterCat==='all'||v.category===filterCat)
    .sort((a,b)=>getWeightedScore(b)-getWeightedScore(a));

  const winner = filtered[0];

  const handleSaveVendor = () => {
    if (!form.name) return;
    if (editingId) updateVendor(editingId, form);
    else addVendor({ ...form, id:`v-${Date.now()}`, scores:[] });
    setForm(EMPTY_VENDOR); setEditingId(null); setShowVendorForm(false);
  };

  const handleEditVendor = (v: VendorRecord) => {
    setForm({ name:v.name, category:v.category, website:v.website, notes:v.notes });
    setEditingId(v.id); setShowVendorForm(true);
  };

  const handleSaveCriteria = () => {
    setCriteria(localCriteria);
    setShowCriteriaEdit(false);
  };

  const addCriterion = () => {
    setLocalCriteria(prev=>[...prev,{id:`c-${Date.now()}`,name:'New Criterion',weight:3}]);
  };

  const usedCategories = [...new Set(vendors.map(v=>v.category))];

  return (
    <div className="flex-1 flex flex-col bg-gray-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-3"><ShoppingBag className="w-6 h-6 text-orange-400"/>Vendor Comparison</h1>
          <p className="text-gray-400 text-sm mt-1">Score vendors across weighted criteria to find the best fit</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{setLocalCriteria(criteria);setShowCriteriaEdit(true)}}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700 transition-colors">
            <Settings className="w-4 h-4"/> Criteria
          </button>
          <button onClick={()=>{setForm(EMPTY_VENDOR);setEditingId(null);setShowVendorForm(true)}}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4"/> Add Vendor
          </button>
        </div>
      </div>

      {/* Winner banner */}
      {winner && getWeightedScore(winner)>0 && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-800/40 rounded-2xl">
          <Trophy className="w-6 h-6 text-amber-400 flex-shrink-0"/>
          <div>
            <div className="text-amber-300 text-xs font-medium uppercase tracking-wider">Top Ranked Vendor</div>
            <div className="text-white font-bold text-lg">{winner.name}</div>
            <div className="text-gray-400 text-xs">{winner.category} · Weighted score: {getWeightedScore(winner)}%</div>
          </div>
          <div className="ml-auto text-4xl font-black text-amber-400/30">{getWeightedScore(winner)}%</div>
        </div>
      )}

      {/* Criteria editor modal */}
      {showCriteriaEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Edit Scoring Criteria</h3>
              <button onClick={()=>setShowCriteriaEdit(false)}><X className="w-4 h-4 text-gray-500"/></button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {localCriteria.map((c,i)=>(
                <div key={c.id} className="flex items-center gap-2">
                  <input value={c.name} onChange={e=>setLocalCriteria(prev=>prev.map((x,j)=>j===i?{...x,name:e.target.value}:x))}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none"/>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 text-xs">Weight:</span>
                    <select value={c.weight} onChange={e=>setLocalCriteria(prev=>prev.map((x,j)=>j===i?{...x,weight:+e.target.value}:x))}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none w-14">
                      {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button onClick={()=>setLocalCriteria(prev=>prev.filter((_,j)=>j!==i))} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-800 flex gap-2">
              <button onClick={addCriterion} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"><Plus className="w-3.5 h-3.5"/>Add</button>
              <button onClick={handleSaveCriteria} className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">Save Criteria</button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor form */}
      {showVendorForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-white font-semibold">{editingId?'Edit Vendor':'Add Vendor'}</h3><button onClick={()=>{setShowVendorForm(false);setEditingId(null)}}><X className="w-4 h-4 text-gray-500"/></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[['name','Vendor Name *'],['website','Website']].map(([f,l])=>(
              <div key={f}>
                <label className="text-xs text-gray-400 mb-1 block">{l}</label>
                <input value={(form as any)[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2}
              className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"/>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveVendor} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"><Save className="w-4 h-4"/>Save</button>
            <button onClick={()=>{setShowVendorForm(false);setEditingId(null)}} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Category filter */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {['all',...usedCategories].map(c=>(
            <button key={c} onClick={()=>setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterCat===c?'bg-orange-600 text-white':'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {vendors.length===0 && !showVendorForm && (
        <div className="text-center py-20"><ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3"/><p className="text-gray-500 text-sm">Add vendors to start comparing</p></div>
      )}

      {/* Comparison table */}
      {filtered.length>0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 text-xs font-medium uppercase tracking-wider w-48">Criterion <span className="text-gray-600">(weight)</span></th>
                  {filtered.map((v,i)=>(
                    <th key={v.id} className="p-4 text-center min-w-36">
                      <div className="flex flex-col items-center gap-1">
                        {i===0 && getWeightedScore(v)>0 && <Trophy className="w-3.5 h-3.5 text-amber-400"/>}
                        <div className="text-white font-semibold text-sm">{v.name}</div>
                        <div className="text-xs text-gray-500">{v.category}</div>
                        {v.website && (
                          <a href={v.website.startsWith('http')?v.website:`https://${v.website}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-0.5 transition-colors">
                            <ExternalLink className="w-2.5 h-2.5"/>site
                          </a>
                        )}
                        <div className="text-xs font-bold text-orange-400">{getWeightedScore(v)}%</div>
                        <div className="flex gap-1">
                          <button onClick={()=>handleEditVendor(v)} className="text-gray-600 hover:text-gray-400 transition-colors"><Edit3 className="w-3 h-3"/></button>
                          <button onClick={()=>deleteVendor(v.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3"/></button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((c,ci)=>(
                  <tr key={c.id} className={`border-b border-gray-800/50 ${ci%2===0?'bg-gray-900':'bg-gray-900/50'}`}>
                    <td className="p-3 pl-4">
                      <div className="text-gray-300 text-sm">{c.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({length:c.weight}).map((_,i)=><Star key={i} className="w-2.5 h-2.5 fill-orange-400 text-orange-400"/>)}
                        {Array.from({length:5-c.weight}).map((_,i)=><Star key={i} className="w-2.5 h-2.5 text-gray-700"/>)}
                      </div>
                    </td>
                    {filtered.map(v=>{
                      const sc  = v.scores.find(s=>s.criterionId===c.id);
                      const val = sc?.score||0;
                      const best = Math.max(...filtered.map(vv=>(vv.scores.find(s=>s.criterionId===c.id)?.score||0)));
                      return (
                        <td key={v.id} className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <select value={val} onChange={e=>setVendorScore(v.id,c.id,+e.target.value)}
                              className={`bg-gray-800 border rounded-lg px-2 py-1 text-sm outline-none w-16 text-center transition-colors ${val===best&&val>0?'border-orange-500 text-orange-300':'border-gray-700 text-white'}`}>
                              {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n||'–'}</option>)}
                            </select>
                            <ScoreDot score={val}/>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-gray-800/60 border-t-2 border-gray-700">
                  <td className="p-3 pl-4 text-gray-300 text-sm font-semibold">Weighted Score</td>
                  {filtered.map((v,i)=>(
                    <td key={v.id} className="p-3 text-center">
                      <div className={`text-lg font-bold ${i===0?'text-amber-400':'text-white'}`}>{getWeightedScore(v)}%</div>
                      {i===0 && <div className="text-xs text-amber-500">🏆 Top</div>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {/* Notes row */}
          {filtered.some(v=>v.notes) && (
            <div className="border-t border-gray-800 p-4 grid gap-3" style={{gridTemplateColumns:`12rem repeat(${filtered.length},1fr)`}}>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium pt-1">Notes</div>
              {filtered.map(v=>(
                <div key={v.id} className="text-gray-400 text-xs leading-relaxed">{v.notes||'—'}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
