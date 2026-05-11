import { useState, useRef } from 'react';
import {
  X, Download, Upload, CheckCircle, AlertCircle,
  FileJson, ShieldCheck, Clock, FolderOpen, RefreshCw,
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props { onClose: () => void; }

const EXPORT_VERSION = '1.0';

export default function ExportImport({ onClose }: Props) {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<
    'idle' | 'parsing' | 'preview' | 'success' | 'error'
  >('idle');
  const [importError, setImportError]   = useState('');
  const [preview, setPreview]           = useState<any>(null);
  const [mergeMode, setMergeMode]       = useState<'replace' | 'merge'>('replace');

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const payload = {
      _meta: {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        exportedBy: 'Siddharth Dutt – AI IT Ops Transformation Toolkit',
        projectCount: store.projects.length,
      },
      projects:              store.projects,
      activeProjectId:       store.activeProjectId,
      currentProject:        store.currentProject,
      checklists:            store.checklists,
      riskItems:             store.riskItems,
      notes:                 store.notes,
      userResources:         store.userResources,
      completedDaysByProject: store.completedDaysByProject,
      kpis:                  store.kpis,
    };

    const json     = JSON.stringify(payload, null, 2);
    const blob     = new Blob([json], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const dateTag  = new Date().toISOString().split('T')[0];
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `ai-it-ops-toolkit-backup-${dateTag}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import: parse & preview ─────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('parsing');
    setImportError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw  = ev.target?.result as string;
        const data = JSON.parse(raw);

        // Basic validation
        if (!data.projects || !Array.isArray(data.projects)) {
          throw new Error('Invalid backup file — "projects" array missing.');
        }

        setPreview(data);
        setImportStatus('preview');
      } catch (err: any) {
        setImportError(err.message ?? 'Could not parse file.');
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  // ── Import: apply ───────────────────────────────────────────────────────────
  const handleApplyImport = () => {
    if (!preview) return;

    if (mergeMode === 'replace') {
      // Full replace — wipe current state and load from backup
      store.setKpis(preview.kpis ?? []);
      // Projects
      const projects = preview.projects ?? [];
      projects.forEach((p: any, i: number) => {
        if (i === 0) store.setCurrentProject(p); // creates first, sets active
        else store.createProject(p);
      });
      // Checklists
      (preview.checklists ?? []).forEach((c: any) => store.addChecklist(c));
      // Risks
      (preview.riskItems ?? []).forEach((r: any) => store.addRiskItem(r));
      // Notes
      (preview.notes ?? []).forEach((n: any) => store.addNote(n));
      // User resources
      store.importResources(preview.userResources ?? []);
    } else {
      // Merge — add only items that don't exist yet (by id)
      const existingProjectIds = new Set(store.projects.map((p: any) => p.id));
      (preview.projects ?? [])
        .filter((p: any) => !existingProjectIds.has(p.id))
        .forEach((p: any) => store.createProject(p));

      const existingChecklistIds = new Set(store.checklists.map((c: any) => c.id));
      (preview.checklists ?? [])
        .filter((c: any) => !existingChecklistIds.has(c.id))
        .forEach((c: any) => store.addChecklist(c));

      const existingRiskIds = new Set(store.riskItems.map((r: any) => r.id));
      (preview.riskItems ?? [])
        .filter((r: any) => !existingRiskIds.has(r.id))
        .forEach((r: any) => store.addRiskItem(r));

      const existingNoteIds = new Set(store.notes.map((n: any) => n.id));
      (preview.notes ?? [])
        .filter((n: any) => !existingNoteIds.has(n.id))
        .forEach((n: any) => store.addNote(n));

      store.importResources(preview.userResources ?? []);

      // KPIs — merge by id
      const existingKpiIds = new Set(store.kpis.map((k: any) => k.id));
      const newKpis = (preview.kpis ?? []).filter((k: any) => !existingKpiIds.has(k.id));
      if (newKpis.length > 0) store.setKpis([...store.kpis, ...newKpis]);
    }

    setImportStatus('success');
    setTimeout(() => onClose(), 1400);
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const stat = (label: string, value: number, color = 'text-white') => (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );

  // Current state summary
  const currentStats = {
    projects:   store.projects.length,
    checklists: store.checklists.length,
    risks:      store.riskItems.length,
    notes:      store.notes.length,
    kpis:       store.kpis.length,
    dayProgress: Object.values(store.completedDaysByProject).reduce((s: number, v: any) => s + v.length, 0),
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Export / Import</h2>
              <p className="text-gray-500 text-xs">Backup your full toolkit state as JSON</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* ── EXPORT ── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-medium text-sm">Export Backup</div>
                <div className="text-gray-500 text-xs mt-0.5">Downloads a dated JSON file with everything</div>
              </div>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>

            {/* Current state snapshot */}
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Current snapshot
              </div>
              {stat('Projects',        currentStats.projects)}
              {stat('Checklists',      currentStats.checklists)}
              {stat('Risk items',      currentStats.risks,      currentStats.risks   > 0 ? 'text-amber-400' : 'text-white')}
              {stat('Notes',           currentStats.notes)}
              {stat('KPIs tracked',    currentStats.kpis,       'text-purple-400')}
              {stat('Days completed',  currentStats.dayProgress, 'text-green-400')}
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              File stays on your device — never uploaded anywhere
            </div>
          </div>

          {/* ── IMPORT ── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="text-white font-medium text-sm mb-1">Import Backup</div>
            <div className="text-gray-500 text-xs mb-3">Load a previously exported JSON backup file</div>

            {/* Merge mode toggle */}
            <div className="flex gap-2 mb-3">
              {([
                { id: 'replace', label: 'Replace All',  desc: 'Wipe current data and load from file' },
                { id: 'merge',   label: 'Merge',        desc: 'Add items that don\'t exist yet' },
              ] as const).map((m) => (
                <button key={m.id} onClick={() => setMergeMode(m.id)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-left transition-all ${
                    mergeMode === m.id
                      ? 'border-blue-500 bg-blue-950/40 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  <div className="text-xs font-medium">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>

            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

            {importStatus === 'idle' || importStatus === 'error' ? (
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-xl text-sm transition-all">
                <Upload className="w-4 h-4" /> Choose JSON file
              </button>
            ) : null}

            {importStatus === 'error' && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {importError}
              </div>
            )}

            {importStatus === 'parsing' && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                <RefreshCw className="w-4 h-4 animate-spin" /> Parsing file...
              </div>
            )}

            {/* Preview */}
            {importStatus === 'preview' && preview && (
              <div className="mt-3 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800 bg-gray-900">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-gray-300 font-medium">File preview</span>
                  {preview._meta?.exportedAt && (
                    <span className="text-xs text-gray-600 ml-auto">
                      {new Date(preview._meta.exportedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {stat('Projects',   (preview.projects ?? []).length)}
                  {stat('Checklists', (preview.checklists ?? []).length)}
                  {stat('Risk items', (preview.riskItems ?? []).length)}
                  {stat('Notes',      (preview.notes ?? []).length)}
                  {stat('KPIs',       (preview.kpis ?? []).length)}
                </div>

                {mergeMode === 'replace' && (
                  <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      This will replace your current data. Export first if you want to keep it.
                    </div>
                  </div>
                )}

                <div className="flex gap-2 p-3 border-t border-gray-800">
                  <button onClick={handleApplyImport}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors">
                    {mergeMode === 'replace' ? 'Replace & Load' : 'Merge & Load'}
                  </button>
                  <button onClick={() => { setImportStatus('idle'); setPreview(null); }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-green-950/30 border border-green-800/40 rounded-lg text-sm text-green-300">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Import successful! Closing...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
