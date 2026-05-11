import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, X } from 'lucide-react';
import { useStore } from '../store/useStore';

// Avatar colours cycle
const COLORS = ['bg-purple-500','bg-blue-500','bg-green-500','bg-amber-500','bg-red-500','bg-pink-500','bg-indigo-500','bg-cyan-500'];
export const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'xs'|'sm'|'md' }) {
  if (!name) return null;
  const sz = size==='xs'?'w-5 h-5 text-xs':size==='sm'?'w-7 h-7 text-xs':'w-9 h-9 text-sm';
  return (
    <div className={`${sz} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
    </div>
  );
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function OwnerPicker({ value, onChange, placeholder='Assign owner', className='' }: Props) {
  const { team } = useStore();
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = team.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.role.toLowerCase().includes(query.toLowerCase())
  );

  const selected = team.find(m => m.name === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-2.5 py-2 text-sm text-left transition-colors hover:border-gray-600">
        {selected
          ? <><Avatar name={selected.name} size="xs"/><span className="flex-1 text-gray-200 text-sm">{selected.name}</span></>
          : <><User className="w-4 h-4 text-gray-600 flex-shrink-0"/><span className="flex-1 text-gray-600 text-sm">{value || placeholder}</span></>}
        {value
          ? <button type="button" onClick={e=>{e.stopPropagation();onChange('');}} className="text-gray-600 hover:text-gray-300 flex-shrink-0"><X className="w-3.5 h-3.5"/></button>
          : <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0"/>}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2">
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Search team..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-purple-500"/>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {/* Free-text option if no match */}
            {query && !filtered.find(m=>m.name.toLowerCase()===query.toLowerCase()) && (
              <button onClick={()=>{onChange(query);setOpen(false);setQuery('');}}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 text-left transition-colors border-b border-gray-800">
                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-gray-400"/>
                </div>
                <span className="text-gray-300 text-xs">Use "<strong>{query}</strong>"</span>
              </button>
            )}
            {filtered.length === 0 && !query && (
              <div className="px-3 py-4 text-center text-gray-600 text-xs">
                No team members yet —<br/>add them in the Team section
              </div>
            )}
            {filtered.map(m => (
              <button key={m.id} onClick={()=>{onChange(m.name);setOpen(false);setQuery('');}}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-800 text-left transition-colors ${value===m.name?'bg-gray-800':''}`}>
                <Avatar name={m.name} size="xs"/>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 text-xs font-medium">{m.name}</div>
                  <div className="text-gray-500 text-xs">{m.role}</div>
                </div>
                {value===m.name && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
