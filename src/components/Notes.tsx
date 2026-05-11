import { useState } from 'react';
import { StickyNote, Plus, Trash2, Download, Save, Sparkles, Loader2, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { saveAs } from 'file-saver';
import { useClaudeAI, getApiKey, getProvider } from '../hooks/useClaudeAI';

const AI_ACTIONS = [
  { id: 'summarize',    label: '📋 Summarize',          prompt: (text: string) => `Summarize these notes concisely in 3-5 bullet points:\n\n${text}` },
  { id: 'actions',      label: '✅ Extract Action Items', prompt: (text: string) => `Extract all action items from these notes as a numbered list with owners if mentioned:\n\n${text}` },
  { id: 'expand',       label: '✏️ Expand & Polish',     prompt: (text: string) => `Expand and professionally polish these raw notes while preserving all key information:\n\n${text}` },
  { id: 'email',        label: '📧 Draft Follow-up Email', prompt: (text: string) => `Draft a professional follow-up email based on these meeting/stakeholder notes:\n\n${text}` },
];

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [selectedId, setSelectedId]   = useState<string | null>(notes[0]?.id || null);
  const [editContent, setEditContent] = useState(notes[0]?.content || '');
  const [isDirty, setIsDirty]         = useState(false);

  // AI
  const { stream, loading: aiLoading } = useClaudeAI();
  const [showAIPanel, setShowAIPanel]   = useState(false);
  const [aiResult, setAiResult]         = useState('');
  const [aiStreaming, setAiStreaming]    = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [aiError, setAiError]           = useState<string | null>(null);

  const hasKey = !!getApiKey(getProvider());

  const selectedNote = notes.find((n) => n.id === selectedId);

  const handleSelectNote = (id: string) => {
    if (isDirty && selectedId) updateNote(selectedId, editContent);
    const note = notes.find((n) => n.id === id);
    setSelectedId(id);
    setEditContent(note?.content || '');
    setIsDirty(false);
    setShowAIPanel(false);
    setAiResult('');
  };

  const handleNewNote = () => {
    if (isDirty && selectedId) updateNote(selectedId, editContent);
    const note = { id:`note-${Date.now()}`, title:`Note ${notes.length + 1}`, content:'', createdAt:new Date().toISOString() };
    addNote(note);
    setSelectedId(note.id);
    setEditContent('');
    setIsDirty(false);
  };

  const handleSave = () => {
    if (selectedId) { updateNote(selectedId, editContent); setIsDirty(false); }
  };

  const handleExport = () => {
    if (selectedNote) saveAs(new Blob([editContent], { type:'text/plain;charset=utf-8' }), `${selectedNote.title}.txt`);
  };

  // ── AI Assist ─────────────────────────────────────────────────────────────
  const handleAIAction = async (actionId: string) => {
    if (!editContent.trim()) return;
    const action = AI_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;

    setAiError(null);
    setAiResult('');
    setActiveAction(actionId);
    setShowAIPanel(true);
    setAiStreaming(true);

    const sys = `You are an expert AI transformation consultant helping with IT ops notes. Be concise, professional, and actionable.`;

    try {
      await stream(sys, action.prompt(editContent), (chunk) => {
        setAiResult((prev) => prev + chunk);
      });
    } catch (e: any) {
      if (e.message === 'NO_API_KEY') setAiError('no_key');
      else setAiError(e.message ?? 'Unknown error');
    } finally {
      setAiStreaming(false);
    }
  };

  const handleInsertResult = () => {
    const separator = '\n\n---\n\n';
    const label = AI_ACTIONS.find((a) => a.id === activeAction)?.label ?? 'AI Result';
    setEditContent((prev) => prev + separator + `**${label}**\n\n` + aiResult);
    setIsDirty(true);
    setShowAIPanel(false);
    setAiResult('');
  };

  const handleReplaceWithResult = () => {
    setEditContent(aiResult);
    setIsDirty(true);
    setShowAIPanel(false);
    setAiResult('');
  };

  const NOTE_STARTERS = [
    '# Stakeholder Notes\n\n## Key Contacts\n\n## Concerns Raised\n\n## Action Items\n',
    '# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n\n## Decisions\n\n## Actions\n',
    '# Discovery Findings\n\n## Pain Points\n\n## Quick Wins Identified\n\n## Risks Found\n',
    '# Use Case Analysis\n\n## Problem Statement\n\n## Data Available\n\n## Proposed Solution\n\n## KPIs\n',
  ];

  return (
    <div className="flex-1 flex min-h-screen bg-gray-950">

      {/* Left: Note List */}
      <div className="w-64 flex-shrink-0 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">My Notes</h2>
          <button onClick={handleNewNote} className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {notes.length === 0 && (
          <div className="p-3 border-b border-gray-800">
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-medium">Quick Start</div>
            <div className="space-y-1">
              {['Stakeholder Notes','Meeting Notes','Discovery Findings','Use Case Analysis'].map((name, i) => (
                <button key={name} onClick={() => {
                  const note = { id:`note-${Date.now()}-${i}`, title:name, content:NOTE_STARTERS[i], createdAt:new Date().toISOString() };
                  addNote(note); setSelectedId(note.id); setEditContent(NOTE_STARTERS[i]); setIsDirty(false);
                }} className="w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          {notes.map((note) => (
            <button key={note.id} onClick={() => handleSelectNote(note.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${
                selectedId === note.id ? 'bg-gray-800 text-white border border-gray-700' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}>
              <div className="font-medium text-sm truncate">{note.title}</div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{note.content?.slice(0,40) || 'Empty note'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Editor */}
      {selectedNote ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-wrap gap-2">
            <input
              value={selectedNote.title}
              onChange={(e) => { updateNote(selectedNote.id, editContent); useStore.getState().notes.find(n=>n.id===selectedNote.id) && (selectedNote.title = e.target.value); }}
              className="bg-transparent text-white font-semibold text-sm outline-none border-b border-transparent hover:border-gray-700 focus:border-purple-500 transition-colors px-1 py-0.5"
            />
            <div className="flex items-center gap-2">
              {/* AI Assist dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAIPanel((v) => !v)}
                  disabled={!editContent.trim()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    hasKey
                      ? 'bg-purple-950/40 border-purple-700/50 text-purple-300 hover:bg-purple-900/50 disabled:opacity-40'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-purple-700/40 hover:text-purple-400 disabled:opacity-40'}`}>
                  <Sparkles className="w-4 h-4" />
                  AI Assist
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showAIPanel && !aiResult && !aiStreaming && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-10 w-52">
                    {!hasKey ? (
                      <div className="p-3 text-xs text-gray-400 text-center">
                        Configure AI key in sidebar settings first
                      </div>
                    ) : (
                      AI_ACTIONS.map((action) => (
                        <button key={action.id} onClick={() => handleAIAction(action.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800/50 last:border-0">
                          {action.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {isDirty && (
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              )}
              <button onClick={handleExport} className="p-1.5 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-lg transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => { deleteNote(selectedNote.id); setSelectedId(notes.filter(n=>n.id!==selectedNote.id)[0]?.id || null); setEditContent(''); }}
                className="p-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Text Editor */}
            <textarea
              value={editContent}
              onChange={(e) => { setEditContent(e.target.value); setIsDirty(true); }}
              placeholder="Start writing... Markdown is supported."
              className="flex-1 bg-transparent text-gray-200 text-sm leading-relaxed p-5 outline-none resize-none font-mono placeholder-gray-700"
            />

            {/* AI Result Panel */}
            {(aiStreaming || aiResult) && (
              <div className="w-80 flex-shrink-0 border-l border-gray-800 flex flex-col bg-gray-900/50">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    {aiStreaming
                      ? <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                      : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    <span className="text-xs text-purple-300 font-medium">
                      {AI_ACTIONS.find(a=>a.id===activeAction)?.label ?? 'AI Result'}
                    </span>
                  </div>
                  <button onClick={() => { setShowAIPanel(false); setAiResult(''); }}
                    className="text-gray-600 hover:text-gray-400"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {aiResult}
                  {aiStreaming && <span className="inline-block w-1.5 h-3.5 bg-purple-400 ml-0.5 animate-pulse" />}
                </div>
                {!aiStreaming && aiResult && (
                  <div className="p-3 border-t border-gray-800 flex gap-2">
                    <button onClick={handleInsertResult}
                      className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors">
                      Insert Below
                    </button>
                    <button onClick={handleReplaceWithResult}
                      className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-lg font-medium transition-colors">
                      Replace All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <StickyNote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Select a note or create a new one</p>
            <button onClick={handleNewNote} className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">
              New Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
