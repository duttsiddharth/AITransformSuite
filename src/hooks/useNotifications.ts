import { useMemo } from 'react';
import { useStore } from '../store/useStore';

export type NotifUrgency = 'overdue' | 'today' | 'soon' | 'info';

export interface Notification {
  id: string;
  urgency: NotifUrgency;
  icon: string;
  title: string;
  subtitle: string;
  section: string;
  daysLeft: number | null; // negative = overdue
}

const today = () => new Date().toISOString().split('T')[0];
const diffDays = (dateStr: string) => {
  const d    = new Date(dateStr);
  const now  = new Date(today());
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
};
const urgency = (diff: number): NotifUrgency =>
  diff < 0 ? 'overdue' : diff === 0 ? 'today' : diff <= 3 ? 'soon' : 'info';

export function useNotifications(snoozed: Set<string>) {
  const { meetings, decisions, kpis, riskItems, completedDays } = useStore();

  return useMemo(() => {
    const notifs: Notification[] = [];

    // ── Action items from meetings ────────────────────────────────────────
    meetings.forEach(m => {
      m.actionItems.filter(a => !a.done && a.dueDate).forEach(a => {
        const id   = `action-${a.id}`;
        if (snoozed.has(id)) return;
        const diff = diffDays(a.dueDate!);
        if (diff > 7) return; // only surface within 7 days
        notifs.push({
          id, urgency: urgency(diff), icon: '✅',
          title: a.text,
          subtitle: `Action · ${m.title}${a.owner ? ` · ${a.owner}` : ''}`,
          section: 'meetings',
          daysLeft: diff,
        });
      });
    });

    // ── Decisions due for review ──────────────────────────────────────────
    decisions.filter(d => d.reviewDate && d.status !== 'reversed').forEach(d => {
      const id   = `decision-review-${d.id}`;
      if (snoozed.has(id)) return;
      const diff = diffDays(d.reviewDate!);
      if (diff > 14) return;
      notifs.push({
        id, urgency: urgency(diff), icon: '📖',
        title: `Review: ${d.title}`,
        subtitle: `Decision · ${d.status} · Owner: ${d.owner || '—'}`,
        section: 'decisions',
        daysLeft: diff,
      });
    });

    // ── KPI actuals overdue (no entry in last 14 days) ────────────────────
    kpis.forEach(k => {
      const id = `kpi-stale-${k.id}`;
      if (snoozed.has(id)) return;
      const last = k.history?.[k.history.length - 1]?.date;
      if (!last) return;
      const diff = diffDays(last); // negative = last entry was N days ago
      if (diff > -14) return; // only flag if 14+ days since last log
      notifs.push({
        id, urgency: 'info', icon: '📊',
        title: `${k.name} not updated`,
        subtitle: `Last logged ${Math.abs(diff)} days ago · Target: ${k.target}${k.unit}`,
        section: 'metrics',
        daysLeft: diff,
      });
    });

    // ── High-impact open risks with no mitigation ─────────────────────────
    riskItems.filter(r => r.status === 'open' && r.impact === 'high' && !r.mitigation).forEach(r => {
      const id = `risk-no-mit-${r.id}`;
      if (snoozed.has(id)) return;
      notifs.push({
        id, urgency: 'overdue', icon: '⚠️',
        title: `High-impact risk needs mitigation`,
        subtitle: r.risk,
        section: 'risk',
        daysLeft: null,
      });
    });

    // ── Sort: overdue → today → soon → info, then by daysLeft ────────────
    const ORDER: Record<NotifUrgency, number> = { overdue:0, today:1, soon:2, info:3 };
    notifs.sort((a, b) => {
      const od = ORDER[a.urgency] - ORDER[b.urgency];
      if (od !== 0) return od;
      return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
    });

    return notifs;
  }, [meetings, decisions, kpis, riskItems, snoozed]);
}
