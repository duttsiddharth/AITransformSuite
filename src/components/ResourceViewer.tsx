import { useState, useRef } from 'react';
import { Search, Download, Upload, Plus, X, Tag, Filter, FileText, Eye, Edit3, Save, Trash2, Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Resource, ResourceType, Phase } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveAs } from 'file-saver';

interface Props {
  category: ResourceType | 'all';
  title: string;
}

const CATEGORY_LABELS: Record<ResourceType, string> = {
  template: 'Template',
  checklist: 'Checklist',
  guide: 'Guide',
  risk: 'Risk Register',
  communication: 'Communication Plan',
  governance: 'Governance',
  training: 'Training',
  metrics: 'Metrics & KPIs',
  decision: 'Decision Framework',
};

const PHASE_COLORS: Record<Phase, string> = {
  discovery: 'bg-blue-900/40 text-blue-300',
  planning: 'bg-purple-900/40 text-purple-300',
  pilot: 'bg-amber-900/40 text-amber-300',
  scaling: 'bg-green-900/40 text-green-300',
  optimize: 'bg-red-900/40 text-red-300',
};

export default function ResourceViewer({ category, title }: Props) {
  const {
    resources, activeDocument, setActiveDocument,
    addResource, updateResource, deleteResource,
    importResources, searchQuery, setSearchQuery,
    filterPhase, setFilterPhase,
  } = useStore();

  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '', category: category === 'all' ? 'guide' as ResourceType : category, phase: 'discovery' as Phase });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = resources.filter((r) => {
    const matchCat = category === 'all' || r.category === category;
    const matchPhase = filterPhase === 'all' || r.phase.includes(filterPhase as Phase);
    const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.tags.some(t => t.includes(searchQuery.toLowerCase()));
    return matchCat && matchPhase && matchSearch;
  });

  const handleExport = (resource: Resource) => {
    const blob = new Blob([resource.content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${resource.title.replace(/\s+/g, '-').toLowerCase()}.md`);
  };

  const handleExportAll = () => {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'ai-transform-resources.json');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) importResources(data);
        } else {
          // Markdown import
          const content = ev.target?.result as string;
          const title = file.name.replace('.md', '').replace(/-/g, ' ');
          addResource({
            id: `imported-${Date.now()}`,
            title,
            category: 'guide',
            phase: ['discovery'],
            scope: 'both',
            tags: ['imported'],
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch {
        alert('Import failed. Please use a valid JSON or Markdown file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleStartEdit = (resource: Resource) => {
    setEditContent(resource.content);
    setEditTitle(resource.title);
    setViewMode('edit');
  };

  const handleSaveEdit = () => {
    if (activeDocument) {
      updateResource(activeDocument.id, { content: editContent, title: editTitle });
      setActiveDocument({ ...activeDocument, content: editContent, title: editTitle });
    }
    setViewMode('preview');
  };

  const handleCopy = () => {
    if (activeDocument) {
      navigator.clipboard.writeText(activeDocument.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddNew = () => {
    if (!newDoc.title) return;
    addResource({
      id: `custom-${Date.now()}`,
      title: newDoc.title,
      category: newDoc.category,
      phase: [newDoc.phase],
      scope: 'both',
      tags: ['custom'],
      content: newDoc.content || `# ${newDoc.title}\n\nStart writing your content here...`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowNewForm(false);
    setNewDoc({ title: '', content: '', category: category === 'all' ? 'guide' : category, phase: 'discovery' });
  };

  return (
    <div className="flex-1 flex min-h-screen bg-gray-950">
      {/* Left Panel */}
      <div className="w-72 flex-shrink-0 border-r border-gray-800 flex flex-col">
        {/* Search + Actions */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">{title}</h2>
            <span className="text-gray-500 text-xs">{filtered.length} items</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-gray-400 text-xs focus:outline-none focus:border-purple-600"
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value as Phase | 'all')}
            >
              <option value="all">All Phases</option>
              <option value="discovery">Discovery</option>
              <option value="planning">Planning</option>
              <option value="pilot">Pilot</option>
              <option value="scaling">Scaling</option>
              <option value="optimize">Optimize</option>
            </select>
            <button
              onClick={() => setShowNewForm(true)}
              className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              title="New Document"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportAll}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              <Download className="w-3 h-3" /> Export All
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              <Upload className="w-3 h-3" /> Import
            </button>
            <input ref={fileInputRef} type="file" accept=".json,.md,.txt" className="hidden" onChange={handleImport} />
          </div>
        </div>

        {/* New Doc Form */}
        {showNewForm && (
          <div className="p-3 border-b border-gray-800 bg-gray-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium">New Document</span>
              <button onClick={() => setShowNewForm(false)}><X className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-purple-600"
              placeholder="Document title..."
              value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
            />
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-400 text-xs focus:outline-none"
              value={newDoc.category}
              onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as ResourceType })}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              onClick={handleAddNew}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors"
            >
              Create
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((resource) => (
            <button
              key={resource.id}
              onClick={() => { setActiveDocument(resource); setViewMode('preview'); }}
              className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                activeDocument?.id === resource.id
                  ? 'bg-gray-800 border border-gray-700'
                  : 'hover:bg-gray-900 border border-transparent'
              }`}
            >
              <div className="text-sm text-gray-200 font-medium truncate mb-1">{resource.title}</div>
              <div className="flex items-center gap-2 flex-wrap">
                {category === 'all' && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded capitalize">{resource.category}</span>
                )}
                {resource.phase.slice(0, 2).map((p) => (
                  <span key={p} className={`text-xs px-1.5 py-0.5 rounded capitalize ${PHASE_COLORS[p]}`}>{p}</span>
                ))}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No documents found
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Content */}
      {activeDocument ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Doc Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
            <div className="flex-1 min-w-0">
              {viewMode === 'edit' ? (
                <input
                  className="bg-transparent text-white text-lg font-bold w-full focus:outline-none border-b border-gray-700 pb-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <h1 className="text-white text-lg font-bold truncate">{activeDocument.title}</h1>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded capitalize">{activeDocument.category}</span>
                {activeDocument.phase.map((p) => (
                  <span key={p} className={`text-xs px-2 py-0.5 rounded capitalize ${PHASE_COLORS[p]}`}>{p}</span>
                ))}
                {activeDocument.tags.map((tag) => (
                  <span key={tag} className="text-xs flex items-center gap-1 text-gray-500">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {viewMode === 'preview' ? (
                <>
                  <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-gray-200 bg-gray-800 rounded-lg transition-colors" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleExport(activeDocument)} className="p-2 text-gray-400 hover:text-gray-200 bg-gray-800 rounded-lg transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleStartEdit(activeDocument)} className="p-2 text-gray-400 hover:text-gray-200 bg-gray-800 rounded-lg transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this document?')) {
                        deleteResource(activeDocument.id);
                        setActiveDocument(null);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 bg-gray-800 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setViewMode('preview')} className="p-2 text-gray-400 hover:text-gray-200 bg-gray-800 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={handleSaveEdit} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors">
                    <Save className="w-4 h-4" /> Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'preview' ? (
              <div className="p-8 max-w-4xl">
                <div className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-800 prose-h1:pb-3 prose-h1:mb-6
                  prose-h2:text-xl prose-h2:text-purple-300 prose-h2:mt-8
                  prose-h3:text-base prose-h3:text-gray-200
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-li:text-gray-300
                  prose-strong:text-white
                  prose-code:text-purple-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
                  prose-blockquote:border-l-purple-500 prose-blockquote:text-gray-400
                  prose-table:w-full
                  prose-th:text-gray-200 prose-th:bg-gray-800 prose-th:px-3 prose-th:py-2
                  prose-td:text-gray-300 prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-gray-800
                  prose-a:text-purple-400
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeDocument.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="p-4 h-full">
                <textarea
                  className="w-full h-full min-h-96 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 text-sm font-mono focus:outline-none focus:border-purple-600 resize-none"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write markdown content..."
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Select a document to view</p>
            <p className="text-gray-600 text-sm mt-1">Choose from the list on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
