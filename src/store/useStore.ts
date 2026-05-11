import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource, Checklist, ChecklistItem, RiskItem, Project, Phase, ResourceType, KPIItem, MeetingRecord, DecisionRecord, VendorRecord, VendorCriterion, ActionItem, Role, TeamMember } from '../types';
import { RESOURCES } from '../data/resources';

type Note = { id: string; title: string; content: string; createdAt: string; projectId?: string };

interface AppState {
  // Navigation
  activeSection: string;
  setActiveSection: (section: string) => void;

  // Role-based view
  activeRole: Role;
  setActiveRole: (role: Role) => void;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  currentProject: Project | null; // kept in sync with projects[activeProjectId]
  createProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void; // compat: upserts into projects

  // Resources
  resources: Resource[];
  userResources: Resource[];
  addResource: (resource: Resource) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  importResources: (resources: Resource[]) => void;

  // Checklists (projectId-scoped)
  checklists: Checklist[];
  addChecklist: (checklist: Checklist) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  updateChecklistItem: (checklistId: string, itemId: string, checked: boolean) => void;
  addChecklistItem: (checklistId: string, item: ChecklistItem) => void;
  deleteChecklist: (checklistId: string) => void;

  // Risk Items (projectId-scoped)
  riskItems: RiskItem[];
  addRiskItem: (item: RiskItem) => void;
  updateRiskItem: (id: string, updates: Partial<RiskItem>) => void;
  deleteRiskItem: (id: string) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPhase: Phase | 'all';
  setFilterPhase: (phase: Phase | 'all') => void;
  filterCategory: ResourceType | 'all';
  setFilterCategory: (cat: ResourceType | 'all') => void;

  // Active Document
  activeDocument: Resource | null;
  setActiveDocument: (doc: Resource | null) => void;

  // Notes (projectId-scoped)
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;

  // Metrics / KPIs
  kpis: KPIItem[];
  setKpis: (kpis: KPIItem[]) => void;
  addKpi: (kpi: KPIItem) => void;
  updateKpi: (id: string, updates: Partial<KPIItem>) => void;
  deleteKpi: (id: string) => void;
  logKpiActual: (id: string, value: number, date: string) => void;

  // Team
  team: TeamMember[];
  addTeamMember: (m: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // Meetings
  meetings: MeetingRecord[];
  addMeeting: (m: MeetingRecord) => void;
  updateMeeting: (id: string, updates: Partial<MeetingRecord>) => void;
  deleteMeeting: (id: string) => void;
  toggleActionItem: (meetingId: string, actionId: string) => void;

  // Decisions
  decisions: DecisionRecord[];
  addDecision: (d: DecisionRecord) => void;
  updateDecision: (id: string, updates: Partial<DecisionRecord>) => void;
  deleteDecision: (id: string) => void;

  // Vendors
  vendors: VendorRecord[];
  criteria: VendorCriterion[];
  addVendor: (v: VendorRecord) => void;
  updateVendor: (id: string, updates: Partial<VendorRecord>) => void;
  deleteVendor: (id: string) => void;
  setCriteria: (c: VendorCriterion[]) => void;
  setVendorScore: (vendorId: string, criterionId: string, score: number) => void;

  // Custom Day Plan overrides (user edits layered on top of built-in data)
  customDayPlans: Record<number, { tasks?: { people?: string[]; process?: string[]; technology?: string[] }; objectives?: string[]; deliverables?: string[]; challenges?: { issue:string; resolution:string; perspective:string }[] }>;
  updateDayPlanField: (day: number, field: 'people'|'process'|'technology'|'objectives'|'deliverables', items: string[]) => void;
  updateDayPlanChallenges: (day: number, challenges: { issue:string; resolution:string; perspective:string }[]) => void;
  resetDayPlanDay: (day: number) => void;

  // Day Progress (per-project)
  completedDaysByProject: Record<string, number[]>;
  completedDays: number[]; // synced to completedDaysByProject[activeProjectId]
  toggleDayComplete: (day: number) => void;
  resetProgress: () => void;
}

const mergeResources = (userResources: Resource[]): Resource[] => [
  ...RESOURCES,
  ...userResources.filter((ur) => !RESOURCES.find((r) => r.id === ur.id)),
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeSection: 'dashboard',
      setActiveSection: (section) => set({ activeSection: section }),

      activeRole: 'all',
      setActiveRole: (role) => set({ activeRole: role }),

      // Projects
      projects: [],
      activeProjectId: null,
      currentProject: null,

      createProject: (project) =>
        set((state) => {
          const projects = [...state.projects, project];
          return {
            projects,
            activeProjectId: project.id,
            currentProject: project,
            completedDays: state.completedDaysByProject[project.id] ?? [],
          };
        }),

      updateProject: (id, updates) =>
        set((state) => {
          const projects = state.projects.map((p) => p.id === id ? { ...p, ...updates } : p);
          const currentProject = state.activeProjectId === id
            ? (projects.find((p) => p.id === id) ?? null)
            : state.currentProject;
          return { projects, currentProject };
        }),

      deleteProject: (id) =>
        set((state) => {
          const projects = state.projects.filter((p) => p.id !== id);
          const needsSwitch = state.activeProjectId === id;
          const newActive = needsSwitch ? (projects[0] ?? null) : null;
          const newActiveId = needsSwitch ? (newActive?.id ?? null) : state.activeProjectId;
          return {
            projects,
            activeProjectId: newActiveId,
            currentProject: needsSwitch ? newActive : state.currentProject,
            completedDays: needsSwitch
              ? (newActiveId ? (state.completedDaysByProject[newActiveId] ?? []) : [])
              : state.completedDays,
          };
        }),

      switchProject: (id) =>
        set((state) => {
          const project = state.projects.find((p) => p.id === id) ?? null;
          return {
            activeProjectId: id,
            currentProject: project,
            completedDays: state.completedDaysByProject[id] ?? [],
          };
        }),

      // Backward-compat: upserts the project into projects[], sets it active
      setCurrentProject: (project) =>
        set((state) => {
          if (!project) return { currentProject: null, activeProjectId: null };
          const exists = state.projects.find((p) => p.id === project.id);
          const projects = exists
            ? state.projects.map((p) => p.id === project.id ? project : p)
            : [...state.projects, project];
          return {
            projects,
            activeProjectId: project.id,
            currentProject: project,
            completedDays: state.completedDaysByProject[project.id] ?? [],
          };
        }),

      // Resources
      userResources: [],
      resources: RESOURCES,
      addResource: (resource) =>
        set((state) => {
          const userResources = [...state.userResources, resource];
          return { userResources, resources: mergeResources(userResources) };
        }),
      updateResource: (id, updates) =>
        set((state) => {
          const isUserOwned = state.userResources.some((r) => r.id === id);
          if (isUserOwned) {
            const userResources = state.userResources.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            );
            return { userResources, resources: mergeResources(userResources) };
          }
          return {
            resources: state.resources.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            ),
          };
        }),
      deleteResource: (id) =>
        set((state) => {
          const userResources = state.userResources.filter((r) => r.id !== id);
          return { userResources, resources: mergeResources(userResources) };
        }),
      importResources: (newResources) =>
        set((state) => {
          const userResources = [
            ...state.userResources,
            ...newResources.filter(
              (nr) =>
                !RESOURCES.find((r) => r.id === nr.id) &&
                !state.userResources.find((r) => r.id === nr.id)
            ),
          ];
          return { userResources, resources: mergeResources(userResources) };
        }),

      // Checklists
      checklists: [],
      addChecklist: (checklist) =>
        set((state) => ({ checklists: [...state.checklists, checklist] })),
      updateChecklistItem: (checklistId, itemId, checked) =>
        set((state) => ({
          checklists: state.checklists.map((cl) =>
            cl.id === checklistId
              ? { ...cl, items: cl.items.map((item) => item.id === itemId ? { ...item, checked } : item) }
              : cl
          ),
        })),
      addChecklistItem: (checklistId, item) =>
        set((state) => ({
          checklists: state.checklists.map((cl) =>
            cl.id === checklistId ? { ...cl, items: [...cl.items, item] } : cl
          ),
        })),
      deleteChecklist: (checklistId) =>
        set((state) => ({ checklists: state.checklists.filter((cl) => cl.id !== checklistId) })),

      // Risk Items
      riskItems: [],
      addRiskItem: (item) => set((state) => ({ riskItems: [...state.riskItems, item] })),
      updateRiskItem: (id, updates) =>
        set((state) => ({ riskItems: state.riskItems.map((r) => r.id === id ? { ...r, ...updates } : r) })),
      deleteRiskItem: (id) =>
        set((state) => ({ riskItems: state.riskItems.filter((r) => r.id !== id) })),

      // Search & Filter
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      filterPhase: 'all',
      setFilterPhase: (phase) => set({ filterPhase: phase }),
      filterCategory: 'all',
      setFilterCategory: (cat) => set({ filterCategory: cat }),

      // Active Document
      activeDocument: null,
      setActiveDocument: (doc) => set({ activeDocument: doc }),

      // Notes
      notes: [],
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, content) =>
        set((state) => ({ notes: state.notes.map((n) => n.id === id ? { ...n, content } : n) })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      // Metrics / KPIs
      kpis: [],
      setKpis: (kpis) => set({ kpis }),
      addKpi: (kpi) => set((state) => ({ kpis: [...state.kpis, kpi] })),
      updateKpi: (id, updates) =>
        set((state) => ({ kpis: state.kpis.map((k) => k.id === id ? { ...k, ...updates } : k) })),
      deleteKpi: (id) =>
        set((state) => ({ kpis: state.kpis.filter((k) => k.id !== id) })),
      logKpiActual: (id, value, date) =>
        set((state) => ({
          kpis: state.kpis.map((k) =>
            k.id === id
              ? {
                  ...k,
                  current: String(value),
                  history: [...(k.history ?? []), { date, value }].slice(-24), // keep last 24 entries
                  trend: k.history && k.history.length > 0
                    ? value > parseFloat(k.current) ? 'up' : value < parseFloat(k.current) ? 'down' : 'stable'
                    : k.trend,
                }
              : k
          ),
        })),

      // Team
      team: [],
      addTeamMember: (m) => set((s) => ({ team: [...s.team, m] })),
      updateTeamMember: (id, updates) =>
        set((s) => ({ team: s.team.map((m) => m.id === id ? { ...m, ...updates } : m) })),
      deleteTeamMember: (id) =>
        set((s) => ({ team: s.team.filter((m) => m.id !== id) })),

      // Meetings
      meetings: [],
      addMeeting: (m) => set((s) => ({ meetings: [...s.meetings, m] })),
      updateMeeting: (id, updates) =>
        set((s) => ({ meetings: s.meetings.map((m) => m.id === id ? { ...m, ...updates } : m) })),
      deleteMeeting: (id) =>
        set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) })),
      toggleActionItem: (meetingId, actionId) =>
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId
              ? { ...m, actionItems: m.actionItems.map((a) => a.id === actionId ? { ...a, done: !a.done } : a) }
              : m
          ),
        })),

      // Decisions
      decisions: [],
      addDecision: (d) => set((s) => ({ decisions: [...s.decisions, d] })),
      updateDecision: (id, updates) =>
        set((s) => ({ decisions: s.decisions.map((d) => d.id === id ? { ...d, ...updates } : d) })),
      deleteDecision: (id) =>
        set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) })),

      // Vendors
      vendors: [],
      criteria: [
        { id: 'c1', name: 'Functionality',    weight: 5 },
        { id: 'c2', name: 'Integration Ease', weight: 4 },
        { id: 'c3', name: 'Cost / Value',     weight: 4 },
        { id: 'c4', name: 'Vendor Support',   weight: 3 },
        { id: 'c5', name: 'Scalability',      weight: 4 },
        { id: 'c6', name: 'Security',         weight: 5 },
      ],
      addVendor: (v) => set((s) => ({ vendors: [...s.vendors, v] })),
      updateVendor: (id, updates) =>
        set((s) => ({ vendors: s.vendors.map((v) => v.id === id ? { ...v, ...updates } : v) })),
      deleteVendor: (id) =>
        set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) })),
      setCriteria: (c) => set({ criteria: c }),
      setVendorScore: (vendorId, criterionId, score) =>
        set((s) => ({
          vendors: s.vendors.map((v) => {
            if (v.id !== vendorId) return v;
            const existing = v.scores.find((sc) => sc.criterionId === criterionId);
            const scores = existing
              ? v.scores.map((sc) => sc.criterionId === criterionId ? { ...sc, score } : sc)
              : [...v.scores, { criterionId, score }];
            return { ...v, scores };
          }),
        })),

      // Custom Day Plan overrides
      customDayPlans: {},
      updateDayPlanField: (day, field, items) =>
        set((s) => {
          const existing = s.customDayPlans[day] ?? {};
          if (field === 'objectives' || field === 'deliverables') {
            return { customDayPlans: { ...s.customDayPlans, [day]: { ...existing, [field]: items } } };
          }
          const tasks = { ...(existing.tasks ?? {}) };
          tasks[field] = items;
          return { customDayPlans: { ...s.customDayPlans, [day]: { ...existing, tasks } } };
        }),
      updateDayPlanChallenges: (day, challenges) =>
        set((s) => ({
          customDayPlans: { ...s.customDayPlans, [day]: { ...(s.customDayPlans[day]??{}), challenges } },
        })),
      resetDayPlanDay: (day) =>
        set((s) => {
          const next = { ...s.customDayPlans };
          delete next[day];
          return { customDayPlans: next };
        }),

      // Day Progress
      completedDaysByProject: {},
      completedDays: [],
      toggleDayComplete: (day) =>
        set((state) => {
          const projectId = state.activeProjectId ?? '__global__';
          const current = state.completedDaysByProject[projectId] ?? [];
          const updated = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
          return {
            completedDaysByProject: { ...state.completedDaysByProject, [projectId]: updated },
            completedDays: updated,
          };
        }),
      resetProgress: () =>
        set((state) => {
          const projectId = state.activeProjectId ?? '__global__';
          return {
            completedDaysByProject: { ...state.completedDaysByProject, [projectId]: [] },
            completedDays: [],
          };
        }),
    }),
    {
      name: 'ai-transform-toolkit',
      partialize: (state) => ({
        activeSection: state.activeSection,
        activeRole: state.activeRole,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        currentProject: state.currentProject,
        checklists: state.checklists,
        riskItems: state.riskItems,
        notes: state.notes,
        userResources: state.userResources,
        completedDaysByProject: state.completedDaysByProject,
        kpis: state.kpis,
        customDayPlans: state.customDayPlans,
        team: state.team,
        meetings: state.meetings,
        decisions: state.decisions,
        vendors: state.vendors,
        criteria: state.criteria,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resources = mergeResources(state.userResources ?? []);
          // Ensure activeRole always has a safe default after rehydration
          if (!state.activeRole) state.activeRole = 'all';
          // Sync completedDays with active project
          const pid = state.activeProjectId;
          state.completedDays = pid
            ? (state.completedDaysByProject?.[pid] ?? [])
            : [];
        }
      },
    }
  )
);
