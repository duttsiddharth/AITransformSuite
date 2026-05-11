import { useState } from 'react';
import {
  BarChart2, TrendingUp, TrendingDown, Minus,
  Plus, Save, X, Trash2, ClipboardList, Calendar,
  ChevronDown, ChevronUp, History,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { KPIItem, KPIHistoryEntry } from '../types';

// ── Default KPIs (seeded with baseline history so sparklines show immediately) ─
const today = new Date();
const dateStr = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const DEFAULT_KPIS: KPIItem[] = [
  {
    id: 'kpi-1', name: 'MTTR', category: 'Incident Management',
    baseline: '120', current: '95', target: '60', unit: 'min',
    trend: 'down', goodDirection: 'down',
    history: [
      { date: dateStr(60), value: 120 }, { date: dateStr(50), value: 115 },
      { date: dateStr(40), value: 110 }, { date: dateStr(30), value: 108 },
      { date: dateStr(20), value: 101 }, { date: dateStr(10), value: 95 },
    ],
  },
  {
    id: 'kpi-2', name: 'Auto-Resolution Rate', category: 'Automation',
    baseline: '0', current: '18', target: '30', unit: '%',
    trend: 'up', goodDirection: 'up',
    history: [
      { date: dateStr(60), value: 0 }, { date: dateStr(50), value: 4 },
      { date: dateStr(40), value: 8 }, { date: dateStr(30), value: 11 },
      { date: dateStr(20), value: 15 }, { date: dateStr(10), value: 18 },
    ],
  },
  {
    id: 'kpi-3', name: 'Ticket Routing Accuracy', category: 'AI Model',
    baseline: '0', current: '82', target: '90', unit: '%',
    trend: 'up', goodDirection: 'up',
    history: [
      { date: dateStr(60), value: 0 }, { date: dateStr(50), value: 45 },
      { date: dateStr(40), value: 60 }, { date: dateStr(30), value: 70 },
      { date: dateStr(20), value: 78 }, { date: dateStr(10), value: 82 },
    ],
  },
  {
    id: 'kpi-4', name: 'Alert Noise Reduction', category: 'AIOps',
    baseline: '0', current: '35', target: '60', unit: '%',
    trend: 'up', goodDirection: 'up',
    history: [
      { date: dateStr(60), value: 0 }, { date: dateStr(50), value: 8 },
      { date: dateStr(40), value: 15 }, { date: dateStr(30), value: 22 },
      { date: dateStr(20), value: 29 }, { date: dateStr(10), value: 35 },
    ],
  },
  {
    id: 'kpi-5', name: 'SLA Compliance', category: 'Service',
    baseline: '82', current: '88', target: '95', unit: '%',
    trend: 'up', goodDirection: 'up',
    history: [
      { date: dateStr(60), value: 82 }, { date: dateStr(50), value: 83 },
      { date: dateStr(40), value: 84 }, { date: dateStr(30), value: 85 },
      { date: dateStr(20), value: 87 }, { date: dateStr(10), value: 88 },
    ],
  },
  {
    id: 'kpi-6', name: 'Team CSAT', category: 'People',
    baseline: '3.2', current: '3.8', target: '4.5', unit: '/5',
    trend: 'up', goodDirection: 'up',
    history: [
      { date: dateStr(60), value: 3.2 }, { date: dateStr(50), value: 3.3 },
      { date: dateStr(40), value: 3.4 }, { date: dateStr(30), value: 3.5 },
      { date: dateStr(20), value: 3.7 }, { date: dateStr(10), value: 3.8 },
    ],
  },
];

// ── SVG Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ history, goodDirection, w = 100, h = 36 }: {
  history: KPIHistoryEntry[];
  goodDirection: 'up' | 'down';
  w?: number;
  h?: number;
}) {
  if (history.length < 2) {
    return <div style={{ width: w, height: h }} className="flex items-center justify-center text-gray-700 text-xs">No data</div>;
  }
  const vals = history.map((e) => e.value);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const range = max - min || 1;
  const pad  = 3;

  const points = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  // Color: green if last value moved in good direction vs first
  const improving = goodDirection === 'up'
    ? vals[vals.length - 1] >= vals[0]
    : vals[vals.length - 1] <= vals[0];
  const stroke = improving ? '#22c55e' : '#f59e0b';
  const fill   = improving ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)';

  // Area path: polyline + close at bottom
  const lastX  = pad + ((vals.length - 1) / (vals.length - 1)) * (w - pad * 2);
  const firstX = pad;
  const areaPoints = `${firstX},${h - pad} ${points} ${lastX},${h - pad}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polygon points={areaPoints} fill={fill} />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {(() => {
        const lastPt = points.split(' ').pop()!;
        const [lx, ly] = lastPt.split(',');
        return <circle cx={lx} cy={ly} r="2.5" fill={stroke} />;
      })()}
    </svg>
  );
}

// ── History Tooltip Table ─────────────────────────────────────────────────────
function HistoryTable({ history, unit }: { history: KPIHistoryEntry[]; unit: string }) {
  return (
    <div className="mt-3 border-t border-gray-800 pt-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <History className="w-3 h-3" /> History
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {[...history].reverse().map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{entry.date}</span>
            <span className="text-gray-300 font-mono">{entry.value}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MetricsDashboard() {
  const { resources, setActiveDocument, setActiveSection, kpis, setKpis, addKpi, updateKpi, deleteKpi, logKpiActual } = useStore();

  // Seed defaults on first load
  const effectiveKpis = kpis.length > 0 ? kpis : DEFAULT_KPIS;

  const [showForm, setShowForm]         = useState(false);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [logValues, setLogValues]       = useState<Record<string, string>>({});
  const [logDates, setLogDates]         = useState<Record<string, string>>({});
  const [form, setForm]                 = useState<Omit<KPIItem, 'id' | 'history'>>({
    name: '', category: '', baseline: '', current: '', target: '',
    unit: '', trend: 'up', goodDirection: 'up',
  });

  const getProgress = (kpi: KPIItem) => {
    const base = parseFloat(kpi.baseline);
    const curr = parseFloat(kpi.current);
    const tgt  = parseFloat(kpi.target);
    if (kpi.goodDirection === 'down') {
      if (base <= tgt) return 100;
      return Math.min(100, Math.max(0, Math.round(((base - curr) / (base - tgt)) * 100)));
    }
    if (tgt <= base) return 100;
    return Math.min(100, Math.max(0, Math.round(((curr - base) / (tgt - base)) * 100)));
  };

  const isOnTrack = (kpi: KPIItem) => getProgress(kpi) >= 50;

  const handleSaveKPI = () => {
    if (!form.name) return;
    addKpi({ ...form, id: `kpi-${Date.now()}`, history: [] });
    setForm({ name:'', category:'', baseline:'', current:'', target:'', unit:'', trend:'up', goodDirection:'up' });
    setShowForm(false);
  };

  const handleLogActual = (kpi: KPIItem) => {
    const raw   = logValues[kpi.id];
    const value = parseFloat(raw);
    if (isNaN(value)) return;
    const date = logDates[kpi.id] || new Date().toISOString().split('T')[0];
    logKpiActual(kpi.id, value, date);
    // If store was empty (using defaults), persist them first
    if (kpis.length === 0) setKpis(DEFAULT_KPIS);
    setLogValues((prev) => ({ ...prev, [kpi.id]: '' }));
  };

  const metricsResource = resources.find((r) => r.category === 'metrics');
  const categories = [...new Set(effectiveKpis.map((k) => k.category))];

  const totalOnTrack   = effectiveKpis.filter(isOnTrack).length;
  const avgProgress    = effectiveKpis.length > 0
    ? Math.round(effectiveKpis.reduce((s, k) => s + getProgress(k), 0) / effectiveKpis.length)
    : 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-950 p-6 space-y-6 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Metrics & KPIs</h1>
          <p className="text-gray-400 text-sm mt-1">Log actuals, track trends, and watch sparklines update in real time</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {metricsResource && (
            <button onClick={() => { setActiveDocument(metricsResource); setActiveSection('guides'); }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition-colors">
              KPIs Framework
            </button>
          )}
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add KPI
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total KPIs', value: effectiveKpis.length, color: 'text-white' },
          { label: 'On Track',   value: totalOnTrack,          color: 'text-green-400' },
          { label: 'Watch',      value: effectiveKpis.length - totalOnTrack, color: 'text-amber-400' },
          { label: 'Avg to Target', value: `${avgProgress}%`, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add KPI Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Add New KPI</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['name','KPI Name *','MTTR'],
              ['category','Category','Incident'],
              ['unit','Unit','min / % / /5'],
            ].map(([field, label, ph]) => (
              <div key={field}>
                <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                  placeholder={ph} value={(form as any)[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Good Direction</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                value={form.goodDirection} onChange={(e) => setForm({ ...form, goodDirection: e.target.value as 'up'|'down' })}>
                <option value="up">Higher is better</option>
                <option value="down">Lower is better</option>
              </select>
            </div>
            {['baseline','current','target'].map((field) => (
              <div key={field}>
                <label className="text-gray-400 text-xs mb-1 block capitalize">{field}</label>
                <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                  placeholder="0" value={(form as any)[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <div className="flex items-end">
              <button onClick={handleSaveKPI}
                className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards by Category */}
      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5" /> {cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {effectiveKpis.filter((k) => k.category === cat).map((kpi) => {
              const progress   = getProgress(kpi);
              const onTrack    = isOnTrack(kpi);
              const isExpanded = expandedId === kpi.id;
              const curr       = parseFloat(kpi.current);
              const tgt        = parseFloat(kpi.target);
              const isGood     = kpi.goodDirection === 'up' ? curr >= tgt * 0.9 : curr <= tgt * 1.1;

              return (
                <div key={kpi.id}
                  className={`bg-gray-900 border rounded-2xl p-4 transition-all ${onTrack ? 'border-gray-800' : 'border-amber-900/30'}`}>

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="min-w-0">
                      <div className="text-gray-400 text-xs">{kpi.name}</div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-white text-2xl font-bold">{kpi.current}</span>
                        <span className="text-gray-500 text-sm">{kpi.unit}</span>
                        <span className="ml-1">
                          {kpi.trend === 'up'
                            ? <TrendingUp className={`inline w-4 h-4 ${kpi.goodDirection==='up' ? 'text-green-400':'text-red-400'}`} />
                            : kpi.trend === 'down'
                            ? <TrendingDown className={`inline w-4 h-4 ${kpi.goodDirection==='down' ? 'text-green-400':'text-red-400'}`} />
                            : <Minus className="inline w-4 h-4 text-gray-500" />}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${onTrack ? 'bg-green-950/40 text-green-400' : 'bg-amber-950/40 text-amber-400'}`}>
                        {onTrack ? 'On Track' : 'Watch'}
                      </span>
                      <button onClick={() => deleteKpi(kpi.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="my-2">
                    <Sparkline history={kpi.history ?? []} goodDirection={kpi.goodDirection} w={240} h={40} />
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Baseline {kpi.baseline}{kpi.unit}</span>
                      <span className="text-gray-500 font-medium">{progress}%</span>
                      <span>Target {kpi.target}{kpi.unit}</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${onTrack ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Log Actual row */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder={`Log actual (${kpi.unit})`}
                        value={logValues[kpi.id] ?? ''}
                        onChange={(e) => setLogValues((prev) => ({ ...prev, [kpi.id]: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none transition-colors placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={logDates[kpi.id] ?? new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLogDates((prev) => ({ ...prev, [kpi.id]: e.target.value }))}
                        className="bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2 py-1.5 text-gray-400 text-xs outline-none transition-colors w-32"
                      />
                    </div>
                    <button
                      onClick={() => handleLogActual(kpi)}
                      disabled={!logValues[kpi.id]}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs rounded-lg font-medium transition-all flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" /> Log
                    </button>
                  </div>

                  {/* Expand history */}
                  {(kpi.history?.length ?? 0) > 0 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : kpi.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors w-full">
                      <History className="w-3 h-3" />
                      {isExpanded ? 'Hide' : `Show ${kpi.history.length} entries`}
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                    </button>
                  )}
                  {isExpanded && <HistoryTable history={kpi.history ?? []} unit={kpi.unit} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {effectiveKpis.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <BarChart2 className="w-16 h-16 text-gray-700 mb-4" />
          <div className="text-gray-400 font-medium mb-2">No KPIs tracked yet</div>
          <button onClick={() => setKpis(DEFAULT_KPIS)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">
            Load Default KPIs
          </button>
        </div>
      )}
    </div>
  );
}
