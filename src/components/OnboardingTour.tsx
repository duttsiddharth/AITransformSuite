import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const TOUR_KEY = 'ai-toolkit-tour-done';

export function useTour() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      // Small delay so the app renders first
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const start  = () => setActive(true);
  const finish = () => { setActive(false); localStorage.setItem(TOUR_KEY, '1'); };

  return { active, start, finish };
}

interface Step {
  title: string;
  body: string;
  emoji: string;
  targetId?: string;          // DOM id to spotlight
  position?: 'center' | 'right' | 'left' | 'bottom';
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: 'Welcome to your AI IT Ops Toolkit',
    body: 'Built by Siddharth Dutt — this toolkit helps you plan, execute, and track your AI IT Ops transformation. Let\'s take a 2-minute tour of everything it can do.',
    position: 'center',
  },
  {
    emoji: '🏠',
    title: 'Dashboard',
    body: 'Your command centre. Shows live stats — 90-day progress, open risks, action items, KPIs, and a phase timeline. Everything updates in real time as you work.',
    targetId: 'nav-dashboard',
    position: 'right',
  },
  {
    emoji: '📁',
    title: 'Multi-Project Support',
    body: 'Run multiple AI initiatives in parallel. The project switcher at the top of the sidebar lets you create, switch, and delete projects. Each project has its own progress, risks, and notes.',
    targetId: 'project-switcher',
    position: 'right',
  },
  {
    emoji: '📅',
    title: '90-Day Transformation Plan',
    body: 'A structured day-by-day plan across 5 phases: Discovery → Planning → Pilot → Scaling → Optimize. Mark days complete and watch your phase progress bars fill up.',
    targetId: 'nav-dayplan',
    position: 'right',
  },
  {
    emoji: '✅',
    title: 'Checklists',
    body: 'Project-scoped checklists with progress tracking. Import from built-in templates, or use AI to generate a custom checklist — just describe your topic and the AI writes it.',
    targetId: 'nav-checklists',
    position: 'right',
  },
  {
    emoji: '⚠️',
    title: 'Risk Register',
    body: 'Log risks across People, Process, and Technology. AI can suggest 5 tailored risks based on your project context, and improve individual mitigations with one click.',
    targetId: 'nav-risk',
    position: 'right',
  },
  {
    emoji: '📊',
    title: 'Metrics & KPIs',
    body: 'Track KPI actuals over time with sparklines. Log a value + date and the sparkline updates instantly. Progress bars show how close each metric is to its target.',
    targetId: 'nav-metrics',
    position: 'right',
  },
  {
    emoji: '👥',
    title: 'Meetings, Decisions & Vendors',
    body: 'Log meetings with AI-extracted action items. Maintain a decision log with rationale and review dates. Compare AI vendors with a weighted scoring matrix.',
    targetId: 'nav-meetings',
    position: 'right',
  },
  {
    emoji: '🤝',
    title: 'Team & Ownership',
    body: 'Add team members and assign them as owners of risks, decisions, and action items. The workload view shows who is carrying what — and flags unassigned items.',
    targetId: 'nav-team',
    position: 'right',
  },
  {
    emoji: '👔',
    title: 'Role-Based Views',
    body: 'Switch between CIO, IT Manager, and Change Lead views from the sidebar. Each shows a curated dashboard with the most relevant data and quick-links for that role.',
    targetId: 'role-switcher',
    position: 'right',
  },
  {
    emoji: '🔔',
    title: 'Reminders & Notifications',
    body: 'The bell at the bottom of the sidebar alerts you to overdue actions, upcoming decision reviews, stale KPIs, and high-impact risks with no mitigation. Dismiss or click through to fix.',
    targetId: 'notification-bell',
    position: 'right',
  },
  {
    emoji: '⚡',
    title: 'AI Assistant',
    body: 'Configure Claude or ChatGPT API keys via the AI settings button. Then use AI suggestions in Risk Register, Notes, and Checklists — or generate a full status report in one click.',
    targetId: 'ai-settings-btn',
    position: 'right',
  },
  {
    emoji: '💾',
    title: 'Export, Import & Reports',
    body: 'Export your full project state as a JSON backup and restore it anytime. Generate a branded PDF status report — with your name, project data, KPIs, risks, and action items — ready for stakeholders.',
    targetId: 'export-btn',
    position: 'right',
  },
  {
    emoji: '🎉',
    title: 'You\'re ready!',
    body: 'That\'s the full toolkit. Start by creating a project on the Dashboard, then log your first risk or day plan task. You can replay this tour anytime via the ? button at the bottom of the sidebar.',
    position: 'center',
  },
];

interface Props {
  active: boolean;
  onFinish: () => void;
}

export default function OnboardingTour({ active, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast  = step === STEPS.length - 1;
  const pct     = Math.round(((step + 1) / STEPS.length) * 100);

  // Measure target element
  useEffect(() => {
    if (!active) return;
    if (!current.targetId) { setRect(null); return; }
    const el = document.getElementById(current.targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      setRect(null);
    }
  }, [step, active, current.targetId]);

  const handleNext = useCallback(() => {
    if (isLast) { onFinish(); setStep(0); }
    else setStep(s => s + 1);
  }, [isLast, onFinish]);

  const handlePrev = () => setStep(s => Math.max(0, s - 1));
  const handleSkip = () => { onFinish(); setStep(0); };

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, handleNext]);

  if (!active) return null;

  // ── Tooltip position ───────────────────────────────────────────────────────
  const PAD = 16;
  let tooltipStyle: React.CSSProperties = {};

  if (!rect || current.position === 'center') {
    // Centred overlay
    tooltipStyle = {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '420px', maxWidth: 'calc(100vw - 32px)',
      zIndex: 10001,
    };
  } else {
    const top  = Math.max(PAD, Math.min(rect.top, window.innerHeight - 280));
    const left = rect.right + PAD;
    tooltipStyle = {
      position: 'fixed',
      top, left,
      width: '360px', maxWidth: `calc(100vw - ${left + PAD}px)`,
      zIndex: 10001,
    };
  }

  // ── Spotlight clip path ────────────────────────────────────────────────────
  // Uses an SVG overlay with a "hole" cut out around the target element
  const MARGIN = 8;
  const hasSpot = rect && current.position !== 'center';

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{ position:'fixed', inset:0, zIndex:10000, pointerEvents:'all' }}
        onClick={handleNext}
      >
        {hasSpot ? (
          <svg width="100%" height="100%" style={{position:'absolute',inset:0}}>
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white"/>
                <rect
                  x={rect!.left - MARGIN} y={rect!.top - MARGIN}
                  width={rect!.width + MARGIN*2} height={rect!.height + MARGIN*2}
                  rx="10" fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#spotlight-mask)"/>
            {/* Highlight ring around target */}
            <rect
              x={rect!.left - MARGIN} y={rect!.top - MARGIN}
              width={rect!.width + MARGIN*2} height={rect!.height + MARGIN*2}
              rx="10" fill="none" stroke="#a855f7" strokeWidth="2"
              style={{filter:'drop-shadow(0 0 8px #a855f7)'}}
            />
          </svg>
        ) : (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)'}}/>
        )}
      </div>

      {/* Tooltip card */}
      <div style={tooltipStyle} onClick={e => e.stopPropagation()}>
        <div className="bg-gray-900 border border-purple-700/50 rounded-2xl shadow-2xl overflow-hidden"
          style={{boxShadow:'0 0 40px rgba(168,85,247,0.25)'}}>

          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <div className="h-full bg-purple-500 transition-all duration-500" style={{width:`${pct}%`}}/>
          </div>

          <div className="p-5">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{step + 1} of {STEPS.length}</span>
              <button onClick={handleSkip} className="text-gray-600 hover:text-gray-400 transition-colors p-1 rounded-lg hover:bg-gray-800">
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>

            {/* Content */}
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl flex-shrink-0">{current.emoji}</span>
              <div>
                <h3 className="text-white font-bold text-base leading-tight mb-2">{current.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{current.body}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button onClick={handleSkip}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2 py-1">
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button onClick={handlePrev}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                    <ChevronLeft className="w-4 h-4"/> Back
                  </button>
                )}
                <button onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
                  {isLast ? <><Sparkles className="w-4 h-4"/> Let\'s go!</> : <>Next <ChevronRight className="w-4 h-4"/></>}
                </button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="mt-3 text-center text-xs text-gray-700">
              ← → arrow keys · Esc to skip · Click anywhere to advance
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
