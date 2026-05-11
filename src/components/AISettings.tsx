import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle, Cpu, Zap, ExternalLink } from 'lucide-react';
import { getApiKey, setApiKey, getProvider, saveProvider, AIProvider } from '../hooks/useClaudeAI';

interface Props { onClose: () => void; }

export default function AISettings({ onClose }: Props) {
  const [provider, setProvider]       = useState<AIProvider>(getProvider());
  const [anthropicKey, setAnthropicKey] = useState(getApiKey('anthropic'));
  const [openaiKey, setOpenaiKey]     = useState(getApiKey('openai'));
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showOpenAI, setShowOpenAI]   = useState(false);
  const [saved, setSaved]             = useState(false);

  const handleSave = () => {
    saveProvider(provider);
    setApiKey('anthropic', anthropicKey.trim());
    setApiKey('openai', openaiKey.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const hasActiveKey = provider === 'anthropic' ? !!anthropicKey.trim() : !!openaiKey.trim();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">AI Assistant Settings</h2>
              <p className="text-gray-500 text-xs">Keys stored locally only — never sent to any server</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Provider Toggle */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'anthropic', label: 'Claude (Anthropic)', icon: '🟣', model: 'claude-sonnet-4' },
                { id: 'openai',    label: 'ChatGPT (OpenAI)',   icon: '🟢', model: 'gpt-4o' },
              ] as const).map((p) => (
                <button key={p.id} onClick={() => setProvider(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? 'border-purple-500 bg-purple-950/40 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                  <span className="text-xl">{p.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.model}</div>
                  </div>
                  {provider === p.id && <CheckCircle className="w-4 h-4 text-purple-400 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Anthropic Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Anthropic API Key
                {provider === 'anthropic' && <span className="ml-1.5 text-purple-400">(active)</span>}
              </label>
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-purple-400 flex items-center gap-1 transition-colors">
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showAnthropic ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none pr-10 transition-colors font-mono"
              />
              <button onClick={() => setShowAnthropic(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {anthropicKey && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" /> Key entered
              </div>
            )}
          </div>

          {/* OpenAI Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                OpenAI API Key
                {provider === 'openai' && <span className="ml-1.5 text-green-400">(active)</span>}
              </label>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors">
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenAI ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none pr-10 transition-colors font-mono"
              />
              <button onClick={() => setShowOpenAI(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {openaiKey && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" /> Key entered
              </div>
            )}
          </div>

          {/* Status bar */}
          {!hasActiveKey && (
            <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              No key for the selected provider. AI features will show a prompt to add one.
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-400">
            <Cpu className="w-4 h-4 flex-shrink-0 text-gray-500" />
            Keys are saved to <span className="text-gray-300 font-mono mx-1">localStorage</span> only — they never leave your browser.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
