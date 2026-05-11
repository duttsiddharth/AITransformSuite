import { useRef, useState } from 'react';
import { X, Download, Printer, Loader2, FileText, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DAY_PLANS } from '../data/dayplans';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props { onClose: () => void; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  discovery: '#3b82f6', planning: '#a855f7', pilot: '#f59e0b',
  scaling: '#22c55e', optimize: '#ef4444', general: '#6b7280',
};
const STATUS_COLORS: Record<string, string> = {
  proposed: '#3b82f6', approved: '#22c55e', deferred: '#f59e0b', reversed: '#ef4444',
};
const RISK_LEVEL = (impact: string, prob: string) => {
  const score = ({ high:4,medium:3,low:2 } as any)[impact] * ({ high:4,medium:3,low:2 } as any)[prob];
  if (score >= 12) return { label:'Critical', color:'#ef4444' };
  if (score >= 9)  return { label:'High',     color:'#f97316' };
  if (score >= 6)  return { label:'Medium',   color:'#f59e0b' };
  return { label:'Low', color:'#22c55e' };
};

export default function StatusReport({ onClose }: Props) {
  const store = useStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const project      = store.currentProject;
  const today        = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
  const phases       = ['discovery','planning','pilot','scaling','optimize'];
  const allDays      = DAY_PLANS;
  const completedSet = new Set(store.completedDays);

  // KPI progress
  const effectiveKpis = store.kpis;
  const getProgress = (kpi: any) => {
    const base = parseFloat(kpi.baseline), curr = parseFloat(kpi.current), tgt = parseFloat(kpi.target);
    if (kpi.goodDirection === 'down') return base <= tgt ? 100 : Math.min(100, Math.max(0, Math.round(((base-curr)/(base-tgt))*100)));
    return tgt <= base ? 100 : Math.min(100, Math.max(0, Math.round(((curr-base)/(tgt-base))*100)));
  };

  // Risks - top open by score
  const openRisks = store.riskItems
    .filter(r => r.status === 'open')
    .sort((a,b) => {
      const sc = (x:string) => ({high:4,medium:3,low:2} as any)[x] ?? 0;
      return sc(b.impact)*sc(b.probability) - sc(a.impact)*sc(a.probability);
    }).slice(0, 8);

  // Decisions - approved
  const approvedDecisions = store.decisions.filter(d => d.status === 'approved').slice(0, 6);

  // Open action items
  const openActions = store.meetings
    .flatMap(m => m.actionItems.filter(a => !a.done).map(a => ({ ...a, meeting: m.title })))
    .slice(0, 8);

  // Phase completion
  const phaseStats = phases.map(phase => {
    const days = allDays.filter(d => d.phase === phase);
    const done  = days.filter(d => completedSet.has(d.day)).length;
    return { phase, total: days.length, done, pct: days.length > 0 ? Math.round((done/days.length)*100) : 0 };
  });
  const totalDone  = store.completedDays.length;
  const totalDays  = allDays.length;
  const overallPct = totalDays > 0 ? Math.round((totalDone/totalDays)*100) : 0;

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const el     = reportRef.current;
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        windowWidth: 900, width: 900,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW    = pdf.internal.pageSize.getWidth();
      const pdfH    = pdf.internal.pageSize.getHeight();
      const imgW    = pdfW;
      const imgH    = (canvas.height * imgW) / canvas.width;
      let  yPos     = 0;

      // Slice into A4 pages
      while (yPos < imgH) {
        if (yPos > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
        yPos += pdfH;
      }
      const dateTag = new Date().toISOString().split('T')[0];
      pdf.save(`status-report-${project?.name?.toLowerCase().replace(/\s+/g,'-') ?? 'toolkit'}-${dateTag}.pdf`);
    } finally { setGenerating(false); }
  };

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = reportRef.current?.innerHTML ?? '';
    const win     = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Status Report — ${project?.name ?? 'AI IT Ops'}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#fff; color:#111; }
        @media print { @page { size: A4; margin: 15mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  // ── Inline style helpers ────────────────────────────────────────────────────
  const S = {
    page:    { background:'#fff', color:'#111', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', padding:'40px', maxWidth:'860px', margin:'0 auto' },
    header:  { background:'linear-gradient(135deg,#1e1b4b 0%,#4c1d95 60%,#6d28d9 100%)', color:'#fff', padding:'32px 40px', borderRadius:'12px', marginBottom:'28px' },
    section: { marginBottom:'24px' },
    h2:      { fontSize:'13px', fontWeight:'700', textTransform:'uppercase' as const, letterSpacing:'0.08em', color:'#6b21a8', borderBottom:'2px solid #ede9fe', paddingBottom:'6px', marginBottom:'14px' },
    card:    { background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'14px 16px', marginBottom:'10px' },
    grid2:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' },
    grid3:   { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' },
    statBox: { background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'8px', padding:'12px 16px', textAlign:'center' as const },
    badge:   (color:string) => ({ display:'inline-block', fontSize:'11px', padding:'2px 8px', borderRadius:'99px', background:`${color}20`, color, fontWeight:'600', marginRight:'6px' }),
    bar:     (color:string, pct:number) => ({
      height:'8px', background:'#e5e7eb', borderRadius:'4px',
      position:'relative' as const, overflow:'hidden' as const, marginTop:'4px',
    }),
    barFill: (color:string, pct:number) => ({
      position:'absolute' as const, left:0, top:0, bottom:0, width:`${pct}%`,
      background:color, borderRadius:'4px', transition:'width 0.3s',
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col z-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">Stakeholder Status Report</span>
          <span className="text-gray-500 text-xs">· Preview before export</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownloadPDF} disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? 'Generating…' : 'Download PDF'}
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div ref={reportRef} style={S.page}>

          {/* ── Cover header ── */}
          <div style={S.header}>
            <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'6px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              AI IT Ops Transformation Toolkit
            </div>
            <div style={{ fontSize:'26px', fontWeight:'800', marginBottom:'4px' }}>
              Stakeholder Status Report
            </div>
            <div style={{ fontSize:'15px', opacity:0.85, marginBottom:'16px' }}>
              {project?.name ?? 'AI Transformation Programme'}
            </div>
            <div style={{ display:'flex', gap:'24px', fontSize:'12px', opacity:0.75 }}>
              <span>📅 {today}</span>
              <span>📌 Phase: <strong style={{textTransform:'capitalize'}}>{project?.currentPhase ?? '—'}</strong></span>
              <span>🎯 Scope: <strong style={{textTransform:'capitalize'}}>{project?.scope ?? '—'}</strong></span>
            </div>
            <div style={{ marginTop:'16px', fontSize:'12px', opacity:0.6 }}>
              Prepared by <strong>Siddharth Dutt</strong>
            </div>
          </div>

          {/* ── Executive summary stats ── */}
          <div style={S.section}>
            <div style={S.h2}>Executive Summary</div>
            <div style={S.grid3}>
              {[
                { label:'Days Completed', value:`${totalDone}/${totalDays}`, sub:`${overallPct}% of 90-day plan`, color:'#7c3aed' },
                { label:'Open Risks', value:store.riskItems.filter(r=>r.status==='open').length, sub:`${store.riskItems.filter(r=>r.status==='mitigated').length} mitigated`, color:'#dc2626' },
                { label:'KPIs Tracked', value:effectiveKpis.length, sub:`${effectiveKpis.filter(k=>getProgress(k)>=50).length} on track`, color:'#059669' },
                { label:'Decisions Made', value:store.decisions.filter(d=>d.status==='approved').length, sub:`${store.decisions.filter(d=>d.status==='proposed').length} pending`, color:'#2563eb' },
                { label:'Meetings Held', value:store.meetings.length, sub:`${openActions.length} open actions`, color:'#d97706' },
                { label:'Projects', value:store.projects.length, sub:'active initiatives', color:'#7c3aed' },
              ].map((s,i) => (
                <div key={i} style={S.statBox}>
                  <div style={{ fontSize:'28px', fontWeight:'800', color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:'12px', fontWeight:'600', marginTop:'2px' }}>{s.label}</div>
                  <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 90-day progress ── */}
          <div style={S.section}>
            <div style={S.h2}>90-Day Transformation Progress</div>
            <div style={S.card}>
              {/* Overall bar */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'600', marginBottom:'4px' }}>
                <span>Overall Progress</span><span style={{ color:'#7c3aed' }}>{overallPct}%</span>
              </div>
              <div style={S.bar('#7c3aed', overallPct)}><div style={S.barFill('#7c3aed', overallPct)} /></div>
              <div style={{ marginTop:'14px', display:'flex', flexDirection:'column' as const, gap:'8px' }}>
                {phaseStats.map(p => (
                  <div key={p.phase}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'3px' }}>
                      <span style={{ textTransform:'capitalize', fontWeight:'600', color: PHASE_COLORS[p.phase] }}>{p.phase}</span>
                      <span style={{ color:'#6b7280' }}>{p.done}/{p.total} days · {p.pct}%</span>
                    </div>
                    <div style={S.bar(PHASE_COLORS[p.phase], p.pct)}>
                      <div style={S.barFill(PHASE_COLORS[p.phase], p.pct)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── KPIs ── */}
          {effectiveKpis.length > 0 && (
            <div style={S.section}>
              <div style={S.h2}>KPI Performance</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {effectiveKpis.slice(0,8).map(k => {
                  const pct      = getProgress(k);
                  const onTrack  = pct >= 50;
                  const barColor = onTrack ? '#22c55e' : '#f59e0b';
                  return (
                    <div key={k.id} style={{ ...S.card, padding:'10px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                        <span style={{ fontSize:'11px', color:'#6b7280' }}>{k.name}</span>
                        <span style={{ fontSize:'11px', fontWeight:'700', color: onTrack?'#16a34a':'#d97706' }}>{pct}%</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:'4px', margin:'2px 0' }}>
                        <span style={{ fontSize:'20px', fontWeight:'800' }}>{k.current}</span>
                        <span style={{ fontSize:'11px', color:'#9ca3af' }}>{k.unit}</span>
                        <span style={{ fontSize:'10px', color:'#9ca3af', marginLeft:'auto' }}>→ {k.target}{k.unit}</span>
                      </div>
                      <div style={S.bar(barColor, pct)}><div style={S.barFill(barColor, pct)} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Top risks ── */}
          {openRisks.length > 0 && (
            <div style={S.section}>
              <div style={S.h2}>Top Open Risks</div>
              <div style={{ display:'flex', flexDirection:'column' as const, gap:'6px' }}>
                {openRisks.map(r => {
                  const lvl = RISK_LEVEL(r.impact, r.probability);
                  return (
                    <div key={r.id} style={{ ...S.card, padding:'10px 14px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                      <div style={{ width:'60px', flexShrink:0 }}>
                        <span style={{ ...S.badge(lvl.color), fontSize:'10px' }}>{lvl.label}</span>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'12px', fontWeight:'600', marginBottom:'2px' }}>{r.risk}</div>
                        <div style={{ fontSize:'11px', color:'#6b7280' }}>{r.mitigation || 'No mitigation defined'}</div>
                      </div>
                      <div style={{ fontSize:'10px', color:'#9ca3af', flexShrink:0, textTransform:'capitalize' as const }}>{r.perspective} · {r.owner||'—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Approved decisions ── */}
          {approvedDecisions.length > 0 && (
            <div style={S.section}>
              <div style={S.h2}>Key Decisions Made</div>
              <div style={{ display:'flex', flexDirection:'column' as const, gap:'6px' }}>
                {approvedDecisions.map(d => (
                  <div key={d.id} style={{ ...S.card, padding:'10px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                      <div>
                        <div style={{ fontSize:'12px', fontWeight:'600', marginBottom:'3px' }}>{d.title}</div>
                        {d.rationale && <div style={{ fontSize:'11px', color:'#6b7280' }}>{d.rationale}</div>}
                      </div>
                      <div style={{ fontSize:'10px', color:'#9ca3af', flexShrink:0 }}>{d.date}<br/>{d.owner}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Open actions ── */}
          {openActions.length > 0 && (
            <div style={S.section}>
              <div style={S.h2}>Open Action Items</div>
              <div style={{ display:'flex', flexDirection:'column' as const, gap:'5px' }}>
                {openActions.map((a,i) => (
                  <div key={i} style={{ ...S.card, padding:'8px 14px', display:'flex', gap:'10px', alignItems:'center' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#f59e0b', flexShrink:0 }} />
                    <div style={{ flex:1, fontSize:'12px' }}>{a.text}</div>
                    <div style={{ fontSize:'10px', color:'#9ca3af', flexShrink:0 }}>{a.owner||'—'}</div>
                    {a.dueDate && <div style={{ fontSize:'10px', color:'#d97706', flexShrink:0 }}>{a.dueDate}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:'16px', marginTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#9ca3af' }}>
            <span>AI IT Ops Transformation Toolkit · Prepared by <strong>Siddharth Dutt</strong></span>
            <span>Generated {today} · Confidential</span>
          </div>

        </div>
      </div>
    </div>
  );
}
