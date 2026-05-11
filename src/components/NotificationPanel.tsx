import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, ChevronRight, Clock, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useNotifications, NotifUrgency, Notification } from '../hooks/useNotifications';
import { useStore } from '../store/useStore';

const URGENCY_CFG: Record<NotifUrgency, { label:string; dot:string; text:string; bg:string; border:string; icon: typeof Bell }> = {
  overdue: { label:'Overdue',   dot:'bg-red-400',    text:'text-red-300',    bg:'bg-red-950/30',    border:'border-red-800/40',    icon: AlertTriangle },
  today:   { label:'Due Today', dot:'bg-amber-400',  text:'text-amber-300',  bg:'bg-amber-950/30',  border:'border-amber-800/40',  icon: Clock },
  soon:    { label:'Due Soon',  dot:'bg-blue-400',   text:'text-blue-300',   bg:'bg-blue-950/30',   border:'border-blue-800/40',   icon: Calendar },
  info:    { label:'Info',      dot:'bg-gray-500',   text:'text-gray-400',   bg:'bg-gray-800/50',   border:'border-gray-700/40',   icon: Info },
};

const SNOOZE_KEY = 'ai-toolkit-snoozed-notifs';

function loadSnoozed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SNOOZE_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function saveSnoozed(s: Set<string>) {
  localStorage.setItem(SNOOZE_KEY, JSON.stringify([...s]));
}

export function NotificationBell() {
  const [open, setOpen]         = useState(false);
  const [snoozed, setSnoozed]   = useState<Set<string>>(loadSnoozed);
  const panelRef                = useRef<HTMLDivElement>(null);
  const { setActiveSection }    = useStore();
  const notifs                  = useNotifications(snoozed);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const snooze = (id: string) => {
    const next = new Set(snoozed); next.add(id); setSnoozed(next); saveSnoozed(next);
  };

  const snoozeAll = () => {
    const next = new Set(snoozed);
    notifs.forEach(n => next.add(n.id));
    setSnoozed(next); saveSnoozed(next);
  };

  const clearSnoozed = () => {
    setSnoozed(new Set()); saveSnoozed(new Set());
  };

  const handleClick = (n: Notification) => {
    setActiveSection(n.section);
    setOpen(false);
  };

  const groups = (['overdue','today','soon','info'] as NotifUrgency[])
    .map(u => ({ urgency: u, items: notifs.filter(n => n.urgency === u) }))
    .filter(g => g.items.length > 0);

  const overdueCount = notifs.filter(n => n.urgency === 'overdue' || n.urgency === 'today').length;

  const dayLabel = (days: number | null) => {
    if (days === null) return '';
    if (days < 0)  return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `${days}d left`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button onClick={() => setOpen(v => !v)}
        className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group ${open ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${overdueCount > 0 ? 'bg-red-900/60' : 'bg-gray-800'}`}>
          <Bell className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-red-400' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-xs text-gray-300 font-medium">Reminders</div>
          <div className={`text-xs ${overdueCount > 0 ? 'text-red-400' : notifs.length > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
            {notifs.length === 0 ? 'All clear' : `${notifs.length} alert${notifs.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        {overdueCount > 0 && (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {overdueCount > 9 ? '9+' : overdueCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ width: '320px', left: '0', maxHeight: '480px' }}>

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">Reminders</span>
              {notifs.length > 0 && (
                <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{notifs.length}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {notifs.length > 0 && (
                <button onClick={snoozeAll} title="Dismiss all"
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
                  <CheckCheck className="w-3 h-3" /> Dismiss all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '390px' }}>
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <span className="text-3xl mb-3">✅</span>
                <div className="text-white font-medium text-sm">All clear!</div>
                <div className="text-gray-500 text-xs mt-1">No overdue items or upcoming deadlines</div>
                {snoozed.size > 0 && (
                  <button onClick={clearSnoozed} className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">
                    Restore {snoozed.size} dismissed
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-4">
                {groups.map(g => {
                  const cfg  = URGENCY_CFG[g.urgency];
                  const Icon = cfg.icon;
                  return (
                    <div key={g.urgency}>
                      {/* Group header */}
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg mb-1 ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.text} flex-shrink-0`} />
                        <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                        <span className="ml-auto text-xs text-gray-600">{g.items.length}</span>
                      </div>

                      {/* Notifications */}
                      <div className="space-y-1 pl-1">
                        {g.items.map(n => (
                          <div key={n.id}
                            className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-800/60 transition-colors group">
                            <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <button onClick={() => handleClick(n)} className="text-left w-full">
                                <div className="text-gray-200 text-xs font-medium leading-snug group-hover:text-white transition-colors">
                                  {n.title}
                                </div>
                                <div className="text-gray-500 text-xs mt-0.5 truncate">{n.subtitle}</div>
                              </button>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              {n.daysLeft !== null && (
                                <span className={`text-xs font-medium ${n.urgency==='overdue'?'text-red-400':n.urgency==='today'?'text-amber-400':n.urgency==='soon'?'text-blue-400':'text-gray-500'}`}>
                                  {dayLabel(n.daysLeft)}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleClick(n)}
                                  className="p-0.5 text-gray-600 hover:text-gray-300 transition-colors" title="Go to section">
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button onClick={() => snooze(n.id)}
                                  className="p-0.5 text-gray-600 hover:text-gray-400 transition-colors" title="Dismiss">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {snoozed.size > 0 && (
                  <div className="px-2 pb-1">
                    <button onClick={clearSnoozed} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                      Restore {snoozed.size} dismissed notification{snoozed.size !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
