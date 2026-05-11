import { useState } from 'react';
import { AlertTriangle, Plus, Trash2, Edit3, Save, X, Download, Sparkles, Loader2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RiskItem, Perspective } from '../types';
import { saveAs } from 'file-saver';
import { useClaudeAI, getApiKey, getProvider } from '../hooks/useClaudeAI';
import { OwnerPicker } from './OwnerPicker';

const IMPACT_COLORS = { high: 'text-red-400 bg-red-950/40', medium: 'text-amber-400 bg-amber-950/40', low: 'text-green-400 bg-green-950/40' };
const STATUS_COLORS = { open: 'text-red-400 bg-red-950/40', mitigated: 'text-amber-400 bg-amber-950/40', closed: 'text-green-400 bg-green-950/40' };
const PERSPECTIVE_COLORS: Record<Perspective, string> = {
  people: 'text-blue-400 bg-blue-950/40',
  process: 'text-amber-400 bg-amber-950/40',
  technology: 'text-green-400 bg-green-950/40',
};

const EMPTY_RISK: Omit<RiskItem, 'id'> = {
  risk: '', impact: 'medium', probability: 'medium',
  mitigation: '', owner: '', status: 'open', perspective: 'technology',
};

interface AISuggestedRisk {
  risk: string; impact: 'high'|'medium'|'low'; probability: 'high'|'medium'|'low';
  mitigation: string; owner: string; perspective: 'people'|'process'|'technology';
}

export default function RiskRegister() {
  const { riskItems, addRiskItem, updateRiskItem, deleteRiskItem, currentProject } = useStore();
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [form, setForm]               = useState<Omit<RiskItem, 'id'>>(EMPTY_RISK);
  const [filterPerspective, setFilterPerspective] = useState<Perspective | 'all'>('all');

  // AI
  const { run, loading: aiLoading } = useClaudeAI();
  const [aiSuggestions, setAiSuggestions]     = useState<AISuggestedRisk[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiError, setAiError]                 = useState<string | null>(null);
  const [improvingId, setImprovingId]         = useState<string | null>(null);

  const hasKey = !!getApiKey(getProvider());

  const filtered = riskItems.filter((r) => filterPerspective === 'all' || r.perspective === filterPerspective);

  const getRiskScore  = (impact: string, prob: string) => ({ high:4,medium:3,low:2 }[impact as 'high'|'medium'|'low'] ?? 0) * ({ high:4,medium:3,low:2 }[prob as 'high'|'medium'|'low'] ?? 0);
  const getRiskLevel  = (score: number) => {
    if (score >= 12) return { label:'Critical', color:'text-red-400 bg-red-950/60 border-red-800' };
    if (score >= 9)  return { label:'High',     color:'text-orange-400 bg-orange-950/60 border-orange-800' };
    if (score >= 6)  return { label:'Medium',   color:'text-amber-400 bg-amber-950/60 border-amber-800' };
    return { label:'Low', color:'text-green-400 bg-green-950/60 border-green-800' };
  };

  const handleSave = () => {
    if (!form.risk) return;
    if (editingId) { updateRiskItem(editingId, form); setEditingId(null); }
    else addRiskItem({ ...form, id: `risk-${Date.now()}` });
    setForm(EMPTY_RISK); setShowForm(false);
  };

  const handleEdit = (item: RiskItem) => {
    setForm({ risk:item.risk, impact:item.impact, probability:item.probability, mitigation:item.mitigation, owner:item.owner, status:item.status, perspective:item.perspective });
    setEditingId(item.id); setShowForm(true);
  };

  const handleExport = () => {
    const csv = ['Risk,Impact,Probability,Score,Level,Perspective,Owner,Status,Mitigation',
      ...riskItems.map((r) => {
        const score = getRiskScore(r.impact, r.probability);
        const level = getRiskLevel(score);
        return `"${r.risk}","${r.impact}","${r.probability}","${score}","${level.label}","${r.perspective}","${r.owner}","${r.status}","${r.mitigation}"`;
      })].join('\n');
    saveAs(new Blob([csv], { type:'text/csv;charset=utf-8' }), 'risk-register.csv');
  };

  // ── AI: Suggest new risks ─────────────────────────────────────────────────
  const handleAISuggest = async () => {
    setAiError(null);
    const existingRisks = riskItems.map((r) => r.risk).join(', ');
    const projectCtx = currentProject
      ? `Project: "${currentProject.name}", Use case: ${currentProject.useCase}, Phase: ${currentProject.currentPhase}, Scope: ${currentProject.scope}.`
      : 'General AI IT transformation project.';

    const sys = `You are an expert IT transformation risk analyst. Return ONLY a valid JSON array, no markdown, no explanation.`;
    const user = `${projectCtx}
Existing risks already logged (do NOT repeat these): ${existingRisks || 'none'}.
Generate 5 realistic, distinct risks for this AI transformation. Return a JSON array:
[{"risk":"...","impact":"high|medium|low","probability":"high|medium|low","mitigation":"...","owner":"...","perspective":"people|process|technology"}]`;

    try {
      const raw = await run(sys, user);
      const parsed: AISuggestedRisk[] = JSON.parse(raw);
      setAiSuggestions(parsed);
      setShowSuggestions(true);
    } catch (e: any) {
      if (e.message === 'NO_API_KEY') setAiError('no_key');
      else setAiError(e.message ?? 'Unknown error');
    }
  };

  // ── AI: Improve single mitigation ────────────────────────────────────────
  const handleImproveMitigation = async (item: RiskItem) => {
    setAiError(null);
    setImprovingId(item.id);
    const sys = `You are an expert IT risk manager. Return ONLY improved mitigation text, 1-2 sentences, no preamble.`;
    const user = `Risk: "${item.risk}" (${item.impact} impact, ${item.probability} probability, ${item.perspective} perspective).
Current mitigation: "${item.mitigation}".
Write a more specific, actionable mitigation strategy.`;
    try {
      const improved = await run(sys, user);
      updateRiskItem(item.id, { mitigation: improved.replace(/^"|"$/g,'').trim() });
    } catch (e: any) {
      if (e.message === 'NO_API_KEY') setAiError('no_key');
      else setAiError(e.message ?? 'Unknown error');
    } finally { setImprovingId(null); }
  };

  const addSuggestedRisk = (r: AISuggestedRisk) => {
    addRiskItem({ ...r, id: `risk-${Date.now()}`, status: 'open' });
    setAiSuggestions((prev) => prev.filter((s) => s.risk !== r.risk));
  };

  const PRESET_RISKS: Omit<RiskItem, 'id'>[] = [
    { risk:'Key AI talent leaves during transformation', impact:'high', probability:'medium', mitigation:'Retention plan, knowledge documentation, succession planning', owner:'HR / AI Lead', status:'open', perspective:'people' },
    { risk:'Executive sponsor change', impact:'high', probability:'low', mitigation:'Multiple sponsors, board-level alignment, documented commitments', owner:'AI Lead', status:'open', perspective:'people' },
    { risk:'Staff resistance to AI tools', impact:'high', probability:'high', mitigation:'Change management program, early wins communication, training investment', owner:'Change Manager', status:'open', perspective:'people' },
    { risk:'Data quality insufficient for AI models', impact:'high', probability:'high', mitigation:'Data audit, cleansing sprint, governance framework', owner:'Data Engineer', status:'open', perspective:'technology' },
    { risk:'Integration complexity with legacy systems', impact:'high', probability:'medium', mitigation:'API-first architecture, phased integration, fallback procedures', owner:'Tech Lead', status:'open', perspective:'technology' },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <h1 className="text-white text-2xl font-bold">Risk Register</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{riskItems.length} risks</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Suggest button */}
          <button onClick={handleAISuggest} disabled={aiLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              hasKey
                ? 'bg-purple-950/40 border-purple-700/50 text-purple-300 hover:bg-purple-900/50 hover:text-purple-200'
                : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-purple-700/40 hover:text-purple-400'}`}>
            {aiLoading && !improvingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Suggest Risks
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setForm(EMPTY_RISK); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Risk
          </button>
        </div>
      </div>

      {/* No-key notice */}
      {!hasKey && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-purple-950/20 border border-purple-800/30 rounded-lg text-sm text-purple-300">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          Configure an API key in <span className="font-medium mx-1">AI Assistant Settings</span> (bottom of sidebar) to enable AI risk suggestions.
        </div>
      )}

      {/* AI error */}
      {aiError && aiError !== 'no_key' && (
        <div className="mb-4 flex items-center justify-between gap-2 p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-sm text-red-300">
          <span>AI error: {aiError}</span>
          <button onClick={() => setAiError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* AI Suggestions Panel */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <div className="mb-6 bg-purple-950/20 border border-purple-800/40 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-800/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200 font-medium text-sm">AI Suggested Risks</span>
              <span className="text-xs text-purple-500 bg-purple-900/50 px-2 py-0.5 rounded-full">{aiSuggestions.length} remaining</span>
            </div>
            <button onClick={() => setShowSuggestions(false)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="flex items-start justify-between gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium mb-1">{s.risk}</div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${IMPACT_COLORS[s.impact]}`}>Impact: {s.impact}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${IMPACT_COLORS[s.probability]}`}>Prob: {s.probability}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PERSPECTIVE_COLORS[s.perspective]}`}>{s.perspective}</span>
                  </div>
                  <div className="text-gray-400 text-xs">{s.mitigation}</div>
                  <div className="text-gray-500 text-xs mt-1">Owner: {s.owner}</div>
                </div>
                <button onClick={() => addSuggestedRisk(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium flex-shrink-0 transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all','people','process','technology'] as const).map((p) => (
          <button key={p} onClick={() => setFilterPerspective(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filterPerspective === p ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
            {p === 'all' ? 'All' : p}
          </button>
        ))}
      </div>

      {/* Risk Form */}
      {showForm && (
        <div className="mb-6 bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">{editingId ? 'Edit Risk' : 'Add New Risk'}</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Risk Description *</label>
              <textarea value={form.risk} onChange={(e) => setForm({...form, risk:e.target.value})} rows={2}
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['impact','Impact'],['probability','Probability']].map(([field,label]) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <select value={form[field as 'impact'|'probability']} onChange={(e) => setForm({...form,[field]:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors">
                    <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Perspective</label>
                <select value={form.perspective} onChange={(e) => setForm({...form, perspective:e.target.value as Perspective})}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none">
                  <option value="people">People</option><option value="process">Process</option><option value="technology">Technology</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status:e.target.value as RiskItem['status']})}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none">
                  <option value="open">Open</option><option value="mitigated">Mitigated</option><option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Owner</label>
              <OwnerPicker value={form.owner} onChange={(v) => setForm({...form, owner:v})} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Mitigation</label>
              <textarea value={form.mitigation} onChange={(e) => setForm({...form, mitigation:e.target.value})} rows={2}
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none transition-colors" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Save className="w-4 h-4" /> Save Risk
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_RISK); }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {riskItems.length === 0 && !showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center mb-6">
          <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">No risks logged yet</h3>
          <p className="text-gray-500 text-sm mb-4">Add risks manually, use AI suggestions, or load presets.</p>
          <button onClick={() => PRESET_RISKS.forEach((r) => addRiskItem({ ...r, id:`risk-${Date.now()}-${Math.random()}` }))}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
            Load Preset Risks
          </button>
        </div>
      )}

      {/* Risk Table */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item) => {
            const score = getRiskScore(item.impact, item.probability);
            const level = getRiskLevel(score);
            const isImproving = improvingId === item.id;
            return (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${level.color}`}>{level.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${IMPACT_COLORS[item.impact]}`}>Impact: {item.impact}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${IMPACT_COLORS[item.probability]}`}>Prob: {item.probability}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PERSPECTIVE_COLORS[item.perspective]}`}>{item.perspective}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                    </div>
                    <p className="text-white text-sm font-medium mb-2">{item.risk}</p>
                    <div className="flex items-start gap-1.5">
                      <div className="flex-1">
                        <span className="text-gray-500 text-xs">Mitigation: </span>
                        <span className="text-gray-400 text-xs">{item.mitigation || '—'}</span>
                      </div>
                      {/* AI improve mitigation */}
                      {hasKey && (
                        <button onClick={() => handleImproveMitigation(item)} disabled={isImproving || aiLoading}
                          title="AI: Improve mitigation"
                          className="flex-shrink-0 p-1 rounded hover:bg-purple-900/30 text-gray-600 hover:text-purple-400 transition-colors disabled:opacity-40">
                          {isImproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    {item.owner && <div className="text-gray-600 text-xs mt-1">Owner: {item.owner}</div>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteRiskItem(item.id)} className="p-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
