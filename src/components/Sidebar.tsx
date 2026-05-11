import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Map, CheckSquare, FileText, AlertTriangle,
  MessageSquare, BookOpen, Shield, GraduationCap, BarChart2,
  Brain, ChevronRight, Cpu, StickyNote, ChevronDown, ChevronUp,
  Plus, Check, Trash2, FolderOpen, Settings, Zap, FileJson,
  Users, BookMarked, ShoppingBag, Users2, HelpCircle, Sun, Moon,
  Bell, FileBarChart2, Calendar,
} from 'lucide-react';
import AISettings from './AISettings';
import ExportImport from './ExportImport';
import StatusReport from './StatusReport';
import { NotificationBell } from './NotificationPanel';
import { getApiKey, getProvider } from '../hooks/useClaudeAI';
import type { Role } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'dayplan',       label: 'Daily Plan',          icon: Map },
  { id: 'checklists',    label: 'Checklists',          icon: CheckSquare },
  { id: 'templates',     label: 'Templates',           icon: FileText },
  { id: 'risk',          label: 'Risk Register',       icon: AlertTriangle },
  { id: 'communication', label: 'Communication Plan',  icon: MessageSquare },
  { id: 'guides',        label: 'Resources & Guides',  icon: BookOpen },
  { id: 'governance',    label: 'Governance',          icon: Shield },
  { id: 'training',      label: 'Training',            icon: GraduationCap },
  { id: 'metrics',       label: 'Metrics & KPIs',      icon: BarChart2 },
  { id: 'notes',         label: 'My Notes',            icon: StickyNote },
  { id: 'meetings',      label: 'Meeting Tracker',     icon: Users },
  { id: 'decisions',     label: 'Decision Log',        icon: BookMarked },
  { id: 'vendors',       label: 'Vendor Comparison',   icon: ShoppingBag },
  { id: 'team',          label: 'Team',                icon: Users2 },
  { id: 'timeline',      label: 'Timeline',            icon: Calendar },
];

const CATEGORY_MAP: Record<string, string> = {
  checklists: 'checklist', templates: 'template', risk: 'risk',
  communication: 'communication', guides: 'guide', governance: 'governance',
  training: 'training', metrics: 'metrics',
};

const PHASE_COLORS: Record<string, string> = {
  discovery: 'bg-blue-500', planning: 'bg-purple-500',
  pilot: 'bg-amber-500',   scaling: 'bg-green-500', optimize: 'bg-red-500',
};

export default function Sidebar() {
  const {
    activeSection, setActiveSection, resources,
    projects, activeProjectId, switchProject, deleteProject,
    activeRole, setActiveRole,
  } = useStore();

  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [showExport, setShowExport]       = useState(false);
  const [showReport, setShowReport]       = useState(false);
  const [toolsOpen, setToolsOpen]         = useState(false); // bottom panel collapsed by default
  const { theme, toggle: toggleTheme }    = useTheme();
  const hasAIKey = !!getApiKey(getProvider());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentProject = projects.find((p) => p.id === activeProjectId) ?? null;
  const getCount = (sectionId: string) => {
    const cat = CATEGORY_MAP[sectionId];
    if (!cat) return null;
    const count = resources.filter((r) => r.category === cat).length;
    return count > 0 ? count : null;
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-950 flex flex-col h-screen sticky top-0 border-r border-gray-800">

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 flex-shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold text-sm leading-tight truncate">Siddharth Dutt</div>
          <div className="text-gray-500 text-xs">AI IT Ops Toolkit</div>
        </div>
      </div>

      {/* ── Project Switcher ──────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-b border-gray-800 flex-shrink-0" ref={dropdownRef}>
        <button
          id="project-switcher"
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all text-left"
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="flex-1 text-xs truncate">
            {currentProject
              ? <span className="text-gray-200">{currentProject.name}</span>
              : <span className="text-gray-500 italic">No project selected</span>}
          </span>
          {projects.length > 0 && (
            <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full flex-shrink-0">{projects.length}</span>
          )}
          <ChevronDown className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 relative">
            {projects.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">No projects yet</div>
            ) : (
              <div className="py-1 max-h-40 overflow-y-auto">
                {projects.map((project) => {
                  const isActive = project.id === activeProjectId;
                  const dot = PHASE_COLORS[project.currentPhase] ?? 'bg-gray-500';
                  return (
                    <div key={project.id} className="group flex items-center px-3 py-2 hover:bg-gray-800 transition-colors">
                      <button className="flex-1 flex items-center gap-2 text-left min-w-0"
                        onClick={() => { switchProject(project.id); setDropdownOpen(false); }}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                        <span className={`text-xs truncate ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>{project.name}</span>
                        {isActive && <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${project.name}"?`)) deleteProject(project.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-gray-600 transition-all flex-shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border-t border-gray-800">
              <button onClick={() => { setActiveSection('dashboard'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-gray-800 transition-colors">
                <Plus className="w-3 h-3" /> New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Role switcher (compact) ───────────────────────────────────────── */}
      <div id="role-switcher" className="px-3 py-2 border-b border-gray-800 flex-shrink-0">
        <div className="grid grid-cols-3 gap-1">
          {([
            { id:'cio',         label:'CIO',    icon:'👔', active:'bg-indigo-950/60 text-indigo-300 border-indigo-700/50',  hover:'hover:bg-indigo-950/30 hover:text-indigo-400 hover:border-indigo-800/40' },
            { id:'it-manager',  label:'IT Mgr', icon:'⚙️', active:'bg-blue-950/60 text-blue-300 border-blue-700/50',        hover:'hover:bg-blue-950/30 hover:text-blue-400 hover:border-blue-800/40' },
            { id:'change-lead', label:'Change', icon:'🤝', active:'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',hover:'hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-800/40' },
          ] as {id:Role,label:string,icon:string,active:string,hover:string}[]).map((r) => (
            <button key={r.id}
              onClick={() => setActiveRole(activeRole === r.id ? 'all' : r.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                activeRole === r.id ? r.active : `border-gray-800 text-gray-600 ${r.hover}`}`}>
              <span className="text-sm">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
        {activeRole !== 'all' && (
          <button onClick={() => setActiveRole('all')}
            className="w-full mt-1 text-xs text-gray-600 hover:text-gray-400 py-0.5 transition-colors">
            ✕ Exit role view
          </button>
        )}
      </div>

      {/* ── Navigation — gets all remaining space ─────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const count = getCount(item.id);
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                  {count}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* ── Collapsible tools panel ───────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-gray-800">

        {/* Toggle handle */}
        <button
          onClick={() => setToolsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-900 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {/* Mini icon row preview */}
              <Bell     className={`w-3 h-3 ${toolsOpen ? 'text-gray-600' : 'text-gray-500'}`} />
              <FileBarChart2 className={`w-3 h-3 ${toolsOpen ? 'text-gray-600' : 'text-gray-500'}`} />
              <FileJson className={`w-3 h-3 ${toolsOpen ? 'text-gray-600' : 'text-gray-500'}`} />
              <Zap      className={`w-3 h-3 ${toolsOpen ? 'text-gray-600' : 'text-gray-500'}`} />
            </div>
            <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
              {toolsOpen ? 'Hide tools' : 'Tools & Settings'}
            </span>
          </div>
          {toolsOpen
            ? <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            : <ChevronUp   className="w-3.5 h-3.5 text-gray-600" />}
        </button>

        {/* Expanded tools */}
        {toolsOpen && (
          <div className="px-2 pb-2 space-y-0.5 border-t border-gray-800/60">
            {/* Notification bell */}
            <div id="notification-bell" className="pt-1"><NotificationBell /></div>

            {/* Status Report */}
            <button onClick={() => setShowReport(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
              <div className="w-6 h-6 rounded-md bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <FileBarChart2 className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs text-gray-300 font-medium">Status Report</div>
                <div className="text-xs text-gray-600">PDF · Print-ready</div>
              </div>
            </button>

            {/* Export / Import */}
            <button id="export-btn" onClick={() => setShowExport(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
              <div className="w-6 h-6 rounded-md bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <FileJson className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs text-gray-300 font-medium">Export / Import</div>
                <div className="text-xs text-gray-600">Backup & restore</div>
              </div>
            </button>

            {/* AI Assistant */}
            <button id="ai-settings-btn" onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${hasAIKey ? 'bg-purple-900/60' : 'bg-gray-800'}`}>
                <Zap className={`w-3.5 h-3.5 ${hasAIKey ? 'text-purple-400' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs text-gray-300 font-medium">AI Assistant</div>
                <div className={`text-xs ${hasAIKey ? 'text-purple-400' : 'text-gray-600'}`}>
                  {hasAIKey ? `${getProvider() === 'anthropic' ? 'Claude' : 'GPT-4o'} · Active` : 'Click to configure'}
                </div>
              </div>
              <Settings className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </button>
          </div>
        )}

        {/* ── Footer: copyright + tour + theme ── */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800/60">
          <span className="text-gray-700 text-xs truncate">© Siddharth Dutt</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => { localStorage.removeItem('ai-toolkit-tour-done'); window.dispatchEvent(new Event('restart-tour')); }}
              title="Replay tour"
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-600 hover:text-gray-400 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-600 hover:text-gray-400 transition-colors">
              {theme === 'dark'
                ? <Sun  className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      {showSettings && <AISettings onClose={() => setShowSettings(false)} />}
      {showExport   && <ExportImport onClose={() => setShowExport(false)} />}
      {showReport   && <StatusReport  onClose={() => setShowReport(false)} />}
    </aside>
  );
}
