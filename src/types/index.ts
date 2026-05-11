export type Role = 'all' | 'cio' | 'it-manager' | 'change-lead';

export type Phase = 'discovery' | 'planning' | 'pilot' | 'scaling' | 'optimize';
export type Perspective = 'people' | 'process' | 'technology';
export type ResourceType = 'template' | 'checklist' | 'guide' | 'risk' | 'communication' | 'governance' | 'training' | 'metrics' | 'decision';
export type Scope = 'enterprise' | 'usecase' | 'both';

export interface DayPlan {
  day: number;
  week: number;
  title: string;
  phase: Phase;
  objectives: string[];
  tasks: {
    people: string[];
    process: string[];
    technology: string[];
  };
  deliverables: string[];
  resources: string[];
  challenges: Challenge[];
}

export interface Challenge {
  issue: string;
  resolution: string;
  perspective: Perspective;
}

export interface Resource {
  id: string;
  title: string;
  category: ResourceType;
  phase: Phase[];
  scope: Scope;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  perspective?: Perspective;
}

export interface Checklist {
  id: string;
  title: string;
  phase: Phase;
  scope: Scope;
  items: ChecklistItem[];
  createdAt: string;
  projectId?: string;
}

export interface RiskItem {
  id: string;
  risk: string;
  impact: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'closed';
  perspective: Perspective;
  projectId?: string;
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  scope: 'enterprise' | 'usecase';
  category: string;
  kpis: string[];
  phases: Phase[];
}

export interface Project {
  id: string;
  name: string;
  useCase: string;
  scope: Scope;
  currentPhase: Phase;
  currentDay: number;
  startDate: string;
  notes: string;
}

export interface KPIHistoryEntry {
  date: string;   // ISO date string e.g. "2025-05-01"
  value: number;
}

export interface KPIItem {
  id: string;
  name: string;
  category: string;
  baseline: string;
  current: string;
  target: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  goodDirection: 'up' | 'down';
  history: KPIHistoryEntry[];
}

// ── Meeting Tracker ───────────────────────────────────────────────────────────
export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  dueDate: string;
  done: boolean;
}

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  attendees: string;
  phase: string;
  agenda: string;
  notes: string;
  decisions: string;
  actionItems: ActionItem[];
  projectId?: string;
}

// ── Decision Log ──────────────────────────────────────────────────────────────
export type DecisionStatus = 'proposed' | 'approved' | 'deferred' | 'reversed';

export interface DecisionRecord {
  id: string;
  title: string;
  date: string;
  owner: string;
  status: DecisionStatus;
  phase: string;
  rationale: string;
  alternatives: string;
  impact: string;
  reviewDate: string;
  projectId?: string;
}

// ── Vendor Comparison ─────────────────────────────────────────────────────────
export interface VendorCriterion {
  id: string;
  name: string;
  weight: number; // 1–5
}

export interface VendorScore {
  criterionId: string;
  score: number; // 1–5
}

export interface VendorRecord {
  id: string;
  name: string;
  category: string;
  website: string;
  notes: string;
  scores: VendorScore[];
  projectId?: string;
}

// ── Team ─────────────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  color: string; // tailwind bg color class for avatar
}
