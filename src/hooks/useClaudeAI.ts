import { useState, useCallback } from 'react';

const ANTHROPIC_KEY_STORAGE = 'ai-transform-toolkit-apikey-anthropic';
const OPENAI_KEY_STORAGE    = 'ai-transform-toolkit-apikey-openai';
const PROVIDER_STORAGE      = 'ai-transform-toolkit-provider';

export type AIProvider = 'anthropic' | 'openai';

export function getApiKey(provider: AIProvider): string {
  return localStorage.getItem(provider === 'anthropic' ? ANTHROPIC_KEY_STORAGE : OPENAI_KEY_STORAGE) ?? '';
}
export function setApiKey(provider: AIProvider, key: string) {
  const k = provider === 'anthropic' ? ANTHROPIC_KEY_STORAGE : OPENAI_KEY_STORAGE;
  if (key) localStorage.setItem(k, key); else localStorage.removeItem(k);
}
export function getProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_STORAGE) as AIProvider) ?? 'anthropic';
}
export function saveProvider(p: AIProvider) { localStorage.setItem(PROVIDER_STORAGE, p); }

function stripFences(raw: string): string {
  return raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
}

interface UseAIReturn {
  loading: boolean;
  error: string | null;
  provider: AIProvider;
  run: (sys: string, user: string) => Promise<string>;
  stream: (sys: string, user: string, onChunk: (t: string) => void) => Promise<void>;
}

export function useClaudeAI(): UseAIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const provider = getProvider();

  const run = useCallback(async (sys: string, user: string): Promise<string> => {
    const key = getApiKey(provider);
    if (!key) throw new Error('NO_API_KEY');
    setLoading(true); setError(null);
    try {
      if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'x-api-key': key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
          body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1500, system:sys, messages:[{role:'user',content:user}] }),
        });
        if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message??`Error ${res.status}`); }
        const d = await res.json();
        return stripFences(d.content?.[0]?.text ?? '');
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
          body: JSON.stringify({ model:'gpt-4o', max_tokens:1500, messages:[{role:'system',content:sys},{role:'user',content:user}] }),
        });
        if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message??`Error ${res.status}`); }
        const d = await res.json();
        return stripFences(d.choices?.[0]?.message?.content ?? '');
      }
    } finally { setLoading(false); }
  }, [provider]);

  const stream = useCallback(async (sys: string, user: string, onChunk: (t: string) => void): Promise<void> => {
    const key = getApiKey(provider);
    if (!key) throw new Error('NO_API_KEY');
    setLoading(true); setError(null);
    try {
      const res = provider === 'anthropic'
        ? await fetch('https://api.anthropic.com/v1/messages', {
            method:'POST',
            headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
            body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,stream:true,system:sys,messages:[{role:'user',content:user}]}),
          })
        : await fetch('https://api.openai.com/v1/chat/completions', {
            method:'POST',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
            body:JSON.stringify({model:'gpt-4o',max_tokens:1500,stream:true,messages:[{role:'system',content:sys},{role:'user',content:user}]}),
          });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message??`Error ${res.status}`); }
      const reader = res.body!.getReader();
      const dec    = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const p = line.slice(6).trim();
          if (p === '[DONE]') continue;
          try {
            const evt = JSON.parse(p);
            if (provider === 'anthropic') {
              if (evt.type==='content_block_delta' && evt.delta?.type==='text_delta') onChunk(evt.delta.text);
            } else {
              const c = evt.choices?.[0]?.delta?.content;
              if (c) onChunk(c);
            }
          } catch { /* skip */ }
        }
      }
    } finally { setLoading(false); }
  }, [provider]);

  return { loading, error, provider, run, stream };
}
