import { DayPlan } from '../types';

export const DAY_PLANS: DayPlan[] = [
  // WEEK 1 - Discovery
  {
    day: 1,
    week: 1,
    title: 'Orientation & Stakeholder Mapping',
    phase: 'discovery',
    objectives: [
      'Understand the organization landscape and existing IT ops structure',
      'Identify key stakeholders and sponsors',
      'Set up your transformation workspace and tools',
    ],
    tasks: {
      people: [
        'Schedule 1:1 with CIO/CITO and direct manager',
        'Map stakeholder ecosystem: champions, resistors, neutrals',
        'Identify your AI transformation core team candidates',
        'Review org chart and reporting lines',
      ],
      process: [
        'Request access to ITSM tool (ServiceNow, Jira, etc.)',
        'Obtain last 12 months of incident/ticket data',
        'Review existing SLAs and KPIs dashboards',
        'Document current process flows (high level)',
      ],
      technology: [
        'Audit current toolchain: monitoring, ITSM, CMDB, alerting',
        'Identify existing automation scripts or bots',
        'Review cloud/infra architecture diagrams',
        'Set up your local toolkit environment (this tool)',
      ],
    },
    deliverables: [
      'Stakeholder Map v0.1',
      'Access Request List',
      'Initial Org & Tool Inventory',
    ],
    resources: ['stakeholder-map', 'org-assessment', 'day1-checklist'],
    challenges: [
      {
        issue: 'Resistance from existing team leads who feel threatened',
        resolution: 'Position yourself as enabler, not disruptor. Use language: "How can AI help your team do less firefighting?" Schedule coffee chats before formal meetings.',
        perspective: 'people',
      },
      {
        issue: 'Cannot get access to systems on Day 1',
        resolution: 'Document access requirements formally via IT ticket. Use interim period to do stakeholder interviews and whiteboard sessions.',
        perspective: 'technology',
      },
    ],
  },
  {
    day: 2,
    week: 1,
    title: 'Current State Assessment – People & Culture',
    phase: 'discovery',
    objectives: [
      'Deep dive into team culture, skills, and AI readiness',
      'Identify change champions and resistors',
      'Document skills gaps and training needs',
    ],
    tasks: {
      people: [
        'Conduct AI Readiness Survey with team leads (use template)',
        'Interview 5-8 frontline ops engineers about pain points',
        'Identify "hidden experts" – people already using scripts/tools creatively',
        'Assess existing change management maturity',
      ],
      process: [
        'Document team structure, shift patterns, escalation paths',
        'Identify knowledge silos and documentation gaps',
        'Review onboarding processes for new ops members',
        'Map who does what in incident lifecycle',
      ],
      technology: [
        'Survey team on tools they wish they had',
        'Document shadow IT and workarounds being used',
        'Assess comfort level with AI/ML concepts in team',
      ],
    },
    deliverables: [
      'AI Readiness Survey Results',
      'Skills Gap Analysis v0.1',
      'Change Champion Candidates List',
    ],
    resources: ['ai-readiness-survey', 'skills-gap-template', 'change-mgmt-guide'],
    challenges: [
      {
        issue: 'Team members are skeptical about AI replacing their jobs',
        resolution: 'Share "AI as Co-pilot" narrative. Show examples where AI helped teams get promoted by focusing on higher-value work. Use data: teams with AI tools grow headcount for strategic work.',
        perspective: 'people',
      },
      {
        issue: 'Low survey response rate',
        resolution: 'Make surveys anonymous. Get manager sponsorship message first. Keep survey under 10 minutes. Follow up personally.',
        perspective: 'process',
      },
    ],
  },
  {
    day: 3,
    week: 1,
    title: 'Current State Assessment – Process & Pain Points',
    phase: 'discovery',
    objectives: [
      'Map key IT ops processes and identify automation opportunities',
      'Quantify pain points with data',
      'Identify quick wins vs strategic initiatives',
    ],
    tasks: {
      people: [
        'Run a "Day in the Life" shadowing session with L1/L2 team',
        'Interview NOC/SOC leads about top recurring issues',
        'Conduct process walkthrough with service desk manager',
      ],
      process: [
        'Map Incident Management process end-to-end (BPMN or swimlane)',
        'Map Change Management process',
        'Map Problem Management process',
        'Identify top 10 ticket categories by volume',
        'Calculate current MTTR, MTTD, FCR metrics',
      ],
      technology: [
        'Extract ticket data: volume, category, resolution time, assignee',
        'Review existing runbooks and their automation status',
        'Identify repetitive tasks with highest manual effort',
      ],
    },
    deliverables: [
      'Current State Process Maps (Incident, Change, Problem)',
      'Top 10 Pain Points Register',
      'Quick Wins Backlog v0.1',
    ],
    resources: ['process-map-template', 'pain-points-register', 'quick-wins-matrix'],
    challenges: [
      {
        issue: 'Processes are undocumented or inconsistently followed',
        resolution: 'Document what ACTUALLY happens (not what policy says). Use process mining tools or manual observation. This gap itself is a finding and an AI opportunity.',
        perspective: 'process',
      },
      {
        issue: 'Data quality is poor – tickets missing fields, wrong categorization',
        resolution: 'Flag as Risk. Start data quality improvement as immediate quick win. Use AI for retroactive categorization of historical tickets.',
        perspective: 'technology',
      },
    ],
  },
  {
    day: 4,
    week: 1,
    title: 'Technology Landscape Assessment',
    phase: 'discovery',
    objectives: [
      'Complete technology inventory and integration mapping',
      'Assess data availability and quality for AI',
      'Identify technical debt and blockers',
    ],
    tasks: {
      people: [
        'Interview infrastructure architects and platform engineers',
        'Meet with data engineering/analytics team if exists',
        'Understand vendor relationships and existing contracts',
      ],
      process: [
        'Document data flows between systems',
        'Review API availability for key platforms',
        'Assess integration patterns (event-driven, batch, real-time)',
      ],
      technology: [
        'Complete Tool & Technology Inventory (ITSM, Monitoring, CMDB, Cloud)',
        'Assess data volumes: logs, metrics, events per day',
        'Evaluate compute infrastructure (on-prem, cloud, hybrid)',
        'Review security and compliance constraints for AI/data',
        'Assess existing AI/ML tool licenses (if any)',
      ],
    },
    deliverables: [
      'Technology Landscape Map',
      'Data Availability Assessment',
      'Technical Debt Register',
      'Integration Architecture Sketch',
    ],
    resources: ['tech-landscape-template', 'data-assessment', 'tech-debt-register'],
    challenges: [
      {
        issue: 'Systems are siloed with no standard APIs',
        resolution: 'Prioritize integration layer as foundational investment. Consider an event bus (Kafka) or API gateway. This becomes part of the AI data pipeline architecture.',
        perspective: 'technology',
      },
      {
        issue: 'Security team blocks data access for AI initiatives',
        resolution: 'Engage CISO early with a Data Governance & AI Ethics framework. Show PII controls, data anonymization approach. Align with existing compliance frameworks.',
        perspective: 'process',
      },
    ],
  },
  {
    day: 5,
    week: 1,
    title: 'Use Case Identification & Prioritization',
    phase: 'discovery',
    objectives: [
      'Generate comprehensive AI use case backlog',
      'Prioritize use cases using value vs effort matrix',
      'Align top use cases with business strategy',
    ],
    tasks: {
      people: [
        'Run Use Case Ideation Workshop with key stakeholders',
        'Facilitate voting/ranking session on use cases',
        'Get executive sponsor validation on top 3 use cases',
      ],
      process: [
        'Apply Use Case Prioritization Matrix (Value/Effort/Risk/Feasibility)',
        'Map use cases to business outcomes and KPIs',
        'Identify dependencies between use cases',
        'Create Use Case Canvas for top 3',
      ],
      technology: [
        'Assess data readiness for each top use case',
        'Identify technology enablers needed per use case',
        'Review build vs buy vs partner options',
      ],
    },
    deliverables: [
      'AI Use Case Register (20+ use cases)',
      'Use Case Prioritization Matrix',
      'Top 3 Use Case Canvases',
      'Week 1 Discovery Summary Report',
    ],
    resources: ['usecase-canvas', 'prioritization-matrix', 'discovery-report-template'],
    challenges: [
      {
        issue: 'Too many use cases – stakeholders cannot agree on priority',
        resolution: 'Use weighted scoring matrix with pre-agreed criteria. Get exec sponsor to set top-level priority filters (cost reduction vs risk reduction vs experience). Run dot-voting exercise.',
        perspective: 'people',
      },
      {
        issue: 'Use cases are too ambitious for current data/tech maturity',
        resolution: 'Use the AI Maturity Ladder framework. Start with descriptive analytics → predictive → prescriptive → autonomous. Set realistic phase gates.',
        perspective: 'technology',
      },
    ],
  },
  // WEEK 2 - Planning
  {
    day: 6,
    week: 2,
    title: 'Strategy & Vision Development',
    phase: 'planning',
    objectives: [
      'Develop AI Transformation Vision and Mission statement',
      'Define transformation guiding principles',
      'Create compelling "North Star" narrative',
    ],
    tasks: {
      people: [
        'Co-create vision statement with exec leadership',
        'Define AI Transformation team structure and roles',
        'Identify skill acquisition plan: hire, train, partner',
        'Draft Change Management Strategy',
      ],
      process: [
        'Define AI Transformation Operating Model',
        'Establish governance structure (AI Steering Committee)',
        'Draft AI Principles & Ethics Policy',
        'Create Communication Plan framework',
      ],
      technology: [
        'Define reference architecture for AI/ML platform',
        'Identify strategic technology partners/vendors',
        'Draft Technology Roadmap v0.1',
      ],
    },
    deliverables: [
      'AI Transformation Vision Document',
      'AI Principles & Ethics Policy Draft',
      'AI Transformation Operating Model',
      'Governance Charter Draft',
    ],
    resources: ['vision-template', 'ai-ethics-policy', 'governance-charter', 'operating-model'],
    challenges: [
      {
        issue: 'Executive team has different visions for AI transformation',
        resolution: 'Facilitate structured visioning workshop. Use pre-read materials with industry benchmarks. Focus first on shared outcomes (cost, risk, experience) before discussing technology.',
        perspective: 'people',
      },
    ],
  },
  {
    day: 7,
    week: 2,
    title: 'Roadmap & Business Case Development',
    phase: 'planning',
    objectives: [
      'Build phased transformation roadmap (12-24 months)',
      'Develop business case with ROI projections',
      'Secure initial budget approval',
    ],
    tasks: {
      people: [
        'Present roadmap to leadership for input',
        'Identify budget owner and approval process',
        'Engage finance partner for ROI modeling',
      ],
      process: [
        'Build Transformation Roadmap (now/next/later format)',
        'Create Business Case with NPV, ROI, payback period',
        'Define success metrics and OKRs for Year 1',
        'Establish program governance calendar',
      ],
      technology: [
        'Create TCO model for proposed technology investments',
        'Identify CapEx vs OpEx spend categorization',
        'Build vendor evaluation criteria',
      ],
    },
    deliverables: [
      'AI Transformation Roadmap (18-month)',
      'Business Case with ROI Model',
      'Year 1 OKRs',
      'Budget Request Document',
    ],
    resources: ['roadmap-template', 'business-case-template', 'roi-calculator', 'okr-template'],
    challenges: [
      {
        issue: 'Cannot quantify ROI without historical baseline data',
        resolution: 'Use industry benchmarks as proxy (Gartner, Forrester). Apply conservative estimates. Show range: conservative/base/optimistic scenarios. Focus on cost of inaction.',
        perspective: 'process',
      },
    ],
  },
  {
    day: 8,
    week: 2,
    title: 'Team Building & Operating Model',
    phase: 'planning',
    objectives: [
      'Define AI transformation team structure',
      'Begin recruitment/assignment process',
      'Establish team rituals and ways of working',
    ],
    tasks: {
      people: [
        'Define roles: AI Product Owner, Data Engineer, ML Engineer, Change Manager, Scrum Master',
        'Post job descriptions or internal transfer requests',
        'Identify training programs for existing staff',
        'Establish RACI for transformation program',
      ],
      process: [
        'Define Agile/Scrum working model for AI delivery',
        'Set up sprint cadence, ceremonies, tooling (Jira, Confluence)',
        'Create team charter and working agreements',
        'Establish stakeholder communication rhythm',
      ],
      technology: [
        'Set up development environments for AI team',
        'Establish code repositories (GitHub/GitLab)',
        'Configure CI/CD pipelines for AI model deployment',
        'Set up collaboration tools (Slack/Teams AI channels)',
      ],
    },
    deliverables: [
      'Team Structure & RACI',
      'Job Descriptions (5 key roles)',
      'Team Charter',
      'Ways of Working Guide',
    ],
    resources: ['team-structure-template', 'raci-template', 'job-descriptions', 'team-charter'],
    challenges: [
      {
        issue: 'Cannot hire externally – budget frozen or HR backlog',
        resolution: 'Start with internal secondments. Identify 2-3 engineers with aptitude and give them AI training. Build skills in parallel. Use contractors for specialized ML roles.',
        perspective: 'people',
      },
    ],
  },
  {
    day: 9,
    week: 2,
    title: 'Data Foundation & Architecture Planning',
    phase: 'planning',
    objectives: [
      'Design data architecture for AI/ML workloads',
      'Establish data governance framework',
      'Create data pipeline design for pilot use cases',
    ],
    tasks: {
      people: [
        'Engage data engineering team/lead',
        'Align with CISO on data security for AI',
        'Identify data stewards per domain',
      ],
      process: [
        'Define Data Governance Policy for AI',
        'Create data dictionary for IT ops data domains',
        'Map data lineage for top use cases',
        'Define data quality standards and SLAs',
      ],
      technology: [
        'Design data architecture: ingestion → storage → processing → serving',
        'Select data platform tools (Databricks, Snowflake, BigQuery, etc.)',
        'Design feature store architecture for ML',
        'Plan data lake/lakehouse structure',
        'Define observability data model (logs, metrics, traces, events)',
      ],
    },
    deliverables: [
      'Data Architecture Design Document',
      'Data Governance Framework',
      'Data Dictionary v0.1',
      'Data Pipeline Design for Pilot',
    ],
    resources: ['data-architecture-template', 'data-governance-framework', 'data-dictionary'],
    challenges: [
      {
        issue: 'Data is in too many disparate systems with no unified access',
        resolution: 'Prioritize a lightweight data mesh or data lake as foundational investment. Start with a virtual unified layer (query federation) while building physical data platform in parallel.',
        perspective: 'technology',
      },
    ],
  },
  {
    day: 10,
    week: 2,
    title: 'Pilot Planning & Kick-off',
    phase: 'planning',
    objectives: [
      'Finalize pilot use case selection and scope',
      'Create detailed pilot project plan',
      'Kick off pilot with core team',
    ],
    tasks: {
      people: [
        'Confirm pilot team (data scientist, data engineer, ops SME, product owner)',
        'Schedule pilot kick-off meeting with stakeholders',
        'Define pilot communication cadence',
        'Agree pilot success criteria with sponsors',
      ],
      process: [
        'Create pilot project plan with milestones',
        'Define pilot scope: in/out of scope',
        'Create Pilot Risk Register',
        'Establish pilot retrospective cadence',
      ],
      technology: [
        'Set up pilot environment (dev/staging)',
        'Begin data extraction and profiling for pilot',
        'Set up experiment tracking (MLflow, W&B)',
        'Configure model development environment',
      ],
    },
    deliverables: [
      'Pilot Project Charter',
      'Pilot Project Plan (30-day)',
      'Pilot Risk Register',
      'Pilot Environment Setup Checklist',
    ],
    resources: ['pilot-charter', 'pilot-project-plan', 'pilot-risk-register', 'experiment-tracking-guide'],
    challenges: [
      {
        issue: 'Stakeholders want immediate results before pilot is complete',
        resolution: 'Set clear expectations: pilot = learning. Define interim milestones to show progress (data pipeline live, first model trained, accuracy benchmarks). Share weekly updates proactively.',
        perspective: 'people',
      },
    ],
  },
  // WEEK 3-4 - Pilot Execution
  {
    day: 11,
    week: 3,
    title: 'Data Engineering Sprint 1',
    phase: 'pilot',
    objectives: [
      'Begin data ingestion pipeline development',
      'Validate data quality and completeness',
      'Establish data processing baseline',
    ],
    tasks: {
      people: [
        'Daily stand-up with pilot team',
        'Check-in with ops SME for domain expertise',
        'Stakeholder progress email (weekly cadence starts)',
      ],
      process: [
        'Execute Sprint 1 backlog',
        'Daily blocker review and resolution',
        'Begin data profiling documentation',
        'Track velocity and burndown',
      ],
      technology: [
        'Build data ingestion connectors (ITSM, monitoring tools)',
        'Implement data quality checks and validation rules',
        'Set up data pipeline orchestration (Airflow, Prefect)',
        'Profile ticket/incident data: completeness, accuracy, timeliness',
        'Create feature engineering scripts for ML',
      ],
    },
    deliverables: [
      'Data Ingestion Pipeline v0.1',
      'Data Quality Report',
      'Sprint 1 Demo',
    ],
    resources: ['data-pipeline-guide', 'data-quality-checklist', 'sprint-template'],
    challenges: [
      {
        issue: 'Data pipeline fails due to API rate limits or schema changes',
        resolution: 'Implement circuit breaker patterns, retry logic, and schema validation. Use event-driven architecture to handle rate limits. Document upstream API dependencies as risks.',
        perspective: 'technology',
      },
      {
        issue: 'Data is too sparse for ML model training',
        resolution: 'Use data augmentation techniques, transfer learning, or synthetic data generation. Lower initial scope to simpler rule-based models first, layer ML on top.',
        perspective: 'technology',
      },
    ],
  },
  {
    day: 15,
    week: 3,
    title: 'Model Development & Experimentation',
    phase: 'pilot',
    objectives: [
      'Begin ML model development for pilot use case',
      'Run initial experiments and baseline models',
      'Validate model approach with stakeholders',
    ],
    tasks: {
      people: [
        'Review model approach with ops SME (domain validation)',
        'Explain model outputs to non-technical stakeholders (XAI)',
        'Collect feedback on model usability and trust',
      ],
      process: [
        'Define model evaluation metrics (precision, recall, F1, MTTR delta)',
        'Establish model experiment governance (MLflow tracking)',
        'Create model documentation template',
        'Run Sprint 2 planning',
      ],
      technology: [
        'Train baseline models (NLP for ticket classification, etc.)',
        'Run hyperparameter tuning experiments',
        'Implement model explainability (SHAP, LIME)',
        'Build model evaluation pipeline',
        'Set up A/B testing framework for model comparison',
      ],
    },
    deliverables: [
      'Baseline Model Results',
      'Model Experiment Log',
      'Model Card v0.1',
    ],
    resources: ['model-development-guide', 'model-card-template', 'mlops-checklist'],
    challenges: [
      {
        issue: 'Model accuracy is below target threshold',
        resolution: 'Analyze confusion matrix. Collect more labeled data. Try ensemble methods. Adjust class weights for imbalanced data. Revisit feature engineering. Consider rule-based fallback.',
        perspective: 'technology',
      },
    ],
  },
  {
    day: 20,
    week: 4,
    title: 'Pilot Integration & User Testing',
    phase: 'pilot',
    objectives: [
      'Integrate AI model into existing workflows',
      'Run User Acceptance Testing (UAT)',
      'Measure pilot KPIs and collect feedback',
    ],
    tasks: {
      people: [
        'Train pilot users on new AI-assisted workflow',
        'Collect user feedback via structured interviews',
        'Manage resistance and concerns from ops team',
        'Celebrate early wins publicly',
      ],
      process: [
        'Execute UAT test plan',
        'Document defects and model errors',
        'Run feedback collection sessions',
        'Prepare pilot results presentation',
      ],
      technology: [
        'Deploy model to staging environment',
        'Integrate with ITSM tool (API integration)',
        'Implement model monitoring and drift detection',
        'Set up alerting for model degradation',
        'Performance test under production-like load',
      ],
    },
    deliverables: [
      'UAT Results Report',
      'Pilot KPI Dashboard',
      'User Feedback Summary',
      'Go/No-Go Decision Document',
    ],
    resources: ['uat-plan-template', 'pilot-metrics-dashboard', 'feedback-template', 'go-nogo-checklist'],
    challenges: [
      {
        issue: 'Users do not trust model recommendations',
        resolution: 'Implement "Human in the Loop" design – model suggests, human confirms. Show confidence scores. Share model accuracy stats. Run training sessions on "AI as assistant".',
        perspective: 'people',
      },
      {
        issue: 'Integration with legacy ITSM tool is blocked',
        resolution: 'Use middleware/ETL as interim solution. Work with vendor for API access. Consider screen-scraping as last resort. Escalate to vendor account team.',
        perspective: 'technology',
      },
    ],
  },
  // WEEK 5-6 - Scaling
  {
    day: 25,
    week: 5,
    title: 'Pilot Review & Scaling Decision',
    phase: 'scaling',
    objectives: [
      'Present pilot results to leadership',
      'Make Go/Scale decision',
      'Plan scaling roadmap and resource allocation',
    ],
    tasks: {
      people: [
        'Present pilot results to exec steering committee',
        'Gather executive commitment for scaling investment',
        'Communicate success story across organization',
        'Identify scaling team resource needs',
      ],
      process: [
        'Document lessons learned from pilot',
        'Update risk register with pilot insights',
        'Create Scaling Project Plan',
        'Update business case with actual pilot data',
      ],
      technology: [
        'Architecture review for production readiness',
        'Capacity planning for production scale',
        'Security review and penetration testing',
        'Disaster recovery and backup planning',
      ],
    },
    deliverables: [
      'Pilot Results Presentation',
      'Lessons Learned Document',
      'Scaling Project Plan',
      'Updated Business Case',
    ],
    resources: ['pilot-results-template', 'lessons-learned', 'scaling-plan', 'production-readiness-checklist'],
    challenges: [
      {
        issue: 'Pilot results are marginal – not clear enough to justify scaling',
        resolution: 'Analyze root cause: data quality, model quality, adoption, or wrong use case. Run extended pilot with fixes. Consider adjacent use case that shows clearer ROI. Reframe metrics.',
        perspective: 'process',
      },
    ],
  },
  {
    day: 30,
    week: 5,
    title: 'Production Deployment & Change Management',
    phase: 'scaling',
    objectives: [
      'Deploy AI solution to production',
      'Execute change management plan for full team adoption',
      'Establish production operations procedures',
    ],
    tasks: {
      people: [
        'Run all-hands communication about AI deployment',
        'Execute training program for all affected staff',
        'Activate change champions network',
        'Set up feedback/support channel for users',
      ],
      process: [
        'Execute production deployment runbook',
        'Update incident management procedures for AI-assisted ops',
        'Publish new SLAs reflecting AI capabilities',
        'Create AI operations runbook',
      ],
      technology: [
        'Deploy to production environment',
        'Configure production monitoring and alerting',
        'Enable model drift monitoring',
        'Set up automated retraining pipeline',
        'Configure audit logging for AI decisions',
      ],
    },
    deliverables: [
      'Production Deployment Record',
      'AI Operations Runbook',
      'Training Completion Records',
      'Updated SLAs & KPIs',
    ],
    resources: ['deployment-runbook', 'ai-ops-runbook', 'training-plan', 'change-management-plan'],
    challenges: [
      {
        issue: 'Production deployment causes service disruption',
        resolution: 'Use canary/blue-green deployment strategy. Have rollback plan ready. Deploy during low-traffic window. Keep manual fallback active for 2 weeks post-deployment.',
        perspective: 'technology',
      },
    ],
  },
  // Optimize
  {
    day: 45,
    week: 7,
    title: 'Continuous Improvement & Next Use Case',
    phase: 'optimize',
    objectives: [
      'Review production performance against KPIs',
      'Identify continuous improvement opportunities',
      'Plan next use case from roadmap',
    ],
    tasks: {
      people: [
        'Run 30-day retrospective with full team',
        'Recognize and reward adoption champions',
        'Share success story with broader organization',
        'Begin next use case team mobilization',
      ],
      process: [
        'Analyze production KPI performance vs targets',
        'Identify model drift or performance degradation',
        'Update transformation roadmap based on learnings',
        'Conduct stakeholder satisfaction survey',
      ],
      technology: [
        'Review model performance dashboards',
        'Execute model retraining if needed',
        'Optimize data pipelines for efficiency',
        'Evaluate new AI capabilities to incorporate',
        'Technical debt review and remediation plan',
      ],
    },
    deliverables: [
      '30-Day Production KPI Report',
      'Model Performance Dashboard',
      'Next Use Case Kick-off Document',
      'Retrospective Action Items',
    ],
    resources: ['kpi-report-template', 'model-monitoring-guide', 'retrospective-template', 'continuous-improvement'],
    challenges: [
      {
        issue: 'Model performance degrades over time in production',
        resolution: 'Implement automated drift detection and retraining triggers. Set up data quality monitoring. Create model maintenance SLA. Schedule regular model reviews.',
        perspective: 'technology',
      },
      {
        issue: 'Stakeholder interest wanes after initial deployment',
        resolution: 'Share regular value metrics. Run lunch-and-learn sessions. Connect AI outcomes to individual team OKRs. Celebrate milestones publicly. Keep communication frequent.',
        perspective: 'people',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE 90-DAY PLAN — MISSING DAYS ADDED
// Days 12–14 (Pilot Phase Week 3), 16–19 (Week 3-4), 21–24 (Week 4-5),
// 26–29 (Week 5-6), 31–44 (Scaling), 46–90 (Optimize)
// ─────────────────────────────────────────────────────────────────────────────

// ── PILOT PHASE: Days 12-14 (Week 3) ─────────────────────────────────────────
const PILOT_EXTRA: DayPlan[] = [
  {
    day: 12, week: 3, phase: 'pilot',
    title: 'Pilot Environment Setup & Data Pipeline Validation',
    objectives: [
      'Validate the end-to-end data pipeline feeding the AI model',
      'Confirm pilot environment mirrors production configuration',
      'Run data quality checks on training dataset',
    ],
    tasks: {
      people: [
        'Brief pilot team on their roles and responsibilities during testing',
        'Assign a dedicated pilot support contact for engineers',
        'Run short Q&A session on what AI will and won\'t do during pilot',
        'Confirm escalation path if pilot surfaces unexpected behaviour',
      ],
      process: [
        'Execute data pipeline end-to-end test with sample payload',
        'Validate data schema matches model expectations',
        'Document any data transformation steps applied',
        'Run data quality report: completeness, accuracy, consistency',
      ],
      technology: [
        'Deploy AI model to pilot environment',
        'Validate API connectivity: ITSM ↔ AI platform',
        'Test model inference with 100 sample incidents',
        'Confirm logging and monitoring is active on AI service',
      ],
    },
    deliverables: ['Pilot Environment Checklist', 'Data Quality Report', 'API Connectivity Test Results'],
    resources: [],
    challenges: [
      { issue: 'Data pipeline fails in pilot due to schema differences', resolution: 'Run schema validation script before every deployment. Maintain a data contract document between source systems and AI platform.', perspective: 'technology' },
      { issue: 'Pilot team anxious about AI making wrong decisions', resolution: 'Remind team that pilot runs in shadow mode — AI suggests, humans decide. Share confidence thresholds and explain fallback logic.', perspective: 'people' },
    ],
  },
  {
    day: 13, week: 3, phase: 'pilot',
    title: 'Shadow Mode Activation — AI Runs Alongside Humans',
    objectives: [
      'Activate AI in shadow mode — AI processes live tickets without acting on them',
      'Collect AI predictions vs human decisions for comparison',
      'Establish baseline accuracy measurement framework',
    ],
    tasks: {
      people: [
        'Run 30-min briefing with service desk team on shadow mode operation',
        'Assign two agents as "AI observers" who log discrepancies',
        'Set up daily shadow mode debrief — 15 mins at end of each shift',
        'Communicate that no jobs are at risk during this phase',
      ],
      process: [
        'Enable shadow mode flag in AI platform configuration',
        'Start logging AI predictions alongside human categorisations',
        'Create comparison spreadsheet: AI vs Human decision per ticket',
        'Define accuracy threshold for passing pilot (e.g. >80% agreement)',
      ],
      technology: [
        'Monitor AI service health: latency, error rate, throughput',
        'Confirm shadow mode audit log is capturing all predictions',
        'Set up real-time accuracy dashboard for pilot team',
        'Test fallback: ensure system works if AI service is unavailable',
      ],
    },
    deliverables: ['Shadow Mode Activation Sign-off', 'Accuracy Tracking Dashboard', 'Daily Debrief Template'],
    resources: [],
    challenges: [
      { issue: 'Agents ignore shadow mode predictions entirely', resolution: 'Make AI predictions visible but non-intrusive in ITSM UI. Run short demo showing cases where AI was right when agent was wrong. Celebrate AI accuracy wins.', perspective: 'people' },
      { issue: 'AI latency adds delay to ticket processing', resolution: 'Set async mode so AI prediction arrives within 10s without blocking agent workflow. Optimise model inference endpoint.', perspective: 'technology' },
    ],
  },
  {
    day: 14, week: 3, phase: 'pilot',
    title: 'First Pilot Review — Accuracy Analysis & Tuning',
    objectives: [
      'Review first 48 hours of shadow mode data',
      'Identify misclassification patterns and root causes',
      'Tune model or prompt based on early findings',
    ],
    tasks: {
      people: [
        'Hold first pilot review meeting with service desk lead and AI team',
        'Ask agents: what did AI get right? What surprised them?',
        'Document qualitative feedback from observers',
        'Recognise and thank agents participating in pilot',
      ],
      process: [
        'Run accuracy analysis: correct / incorrect / borderline predictions',
        'Classify misclassifications by category to find patterns',
        'Update known issues log with recurring misclassification types',
        'Decide: continue shadow mode or adjust confidence threshold',
      ],
      technology: [
        'Export misclassified tickets for retraining analysis',
        'Adjust category mapping if misalignment found with ITSM taxonomy',
        'Tune confidence threshold based on day-1 data',
        'Update model if retraining is needed — else adjust prompts/rules',
      ],
    },
    deliverables: ['Pilot Day-2 Accuracy Report', 'Misclassification Analysis', 'Model Tuning Log'],
    resources: [],
    challenges: [
      { issue: 'Accuracy below target threshold on first review', resolution: 'Do not panic — shadow mode exists precisely for this. Analyse top 10 misclassification patterns. Apply targeted retraining or rule overrides. Communicate findings to stakeholders transparently.', perspective: 'process' },
      { issue: 'Agents starting to distrust AI based on a few wrong predictions', resolution: 'Present accuracy statistics rather than individual errors. Remind team that humans also miscategorise 25% of tickets. Show improvement trajectory.', perspective: 'people' },
    ],
  },
];

// ── PILOT PHASE: Days 16-19 (Week 3-4) ───────────────────────────────────────
const PILOT_MID: DayPlan[] = [
  {
    day: 16, week: 3, phase: 'pilot',
    title: 'User Acceptance Testing — Service Desk Scenarios',
    objectives: [
      'Run structured UAT scenarios with service desk team',
      'Validate AI handles edge cases and unusual ticket types correctly',
      'Collect structured agent feedback on AI recommendations',
    ],
    tasks: {
      people: [
        'Run UAT session with 4-6 agents using predefined test scenarios',
        'Collect UAT feedback form from each participant',
        'Identify power users who want deeper AI feature access',
        'Address concerns raised during UAT in same-day follow-up',
      ],
      process: [
        'Execute 20 predefined UAT test cases covering all ticket categories',
        'Test edge cases: multi-category tickets, VIP escalations, outages',
        'Document pass/fail for each UAT scenario',
        'Update UAT sign-off document with results',
      ],
      technology: [
        'Test AI behaviour on tickets with missing fields',
        'Validate AI confidence score display in ITSM UI',
        'Test "override AI" workflow — agent rejects suggestion',
        'Confirm override feedback loop feeds back to model improvement',
      ],
    },
    deliverables: ['UAT Results Document', 'Agent Feedback Summary', 'Edge Case Log'],
    resources: [],
    challenges: [
      { issue: 'UAT reveals AI fails on multi-language tickets', resolution: 'Scope pilot to English-only tickets first. Add language detection to pre-processing layer. Plan multilingual support for Phase 2.', perspective: 'technology' },
      { issue: 'Agents find AI suggestion UI confusing', resolution: 'Work with ITSM admin to improve UI placement and labelling. Run 15-min UX feedback session. Implement quick UI changes before go-live.', perspective: 'process' },
    ],
  },
  {
    day: 17, week: 4, phase: 'pilot',
    title: 'Integration Testing — End-to-End Workflow Validation',
    objectives: [
      'Validate the full end-to-end workflow from alert to resolution with AI in the loop',
      'Test all integration points under realistic load',
      'Confirm fallback procedures work when AI is unavailable',
    ],
    tasks: {
      people: [
        'Brief infrastructure and app support teams on integration test plan',
        'Assign integration test observer from each team',
        'Communicate test window and expected disruption (if any)',
        'Confirm escalation contacts during test period',
      ],
      process: [
        'Execute integration test: simulate 50 tickets through full workflow',
        'Validate alert → auto-ticket → AI classification → routing → assignment',
        'Test fallback: disable AI service, confirm ITSM continues without it',
        'Document all integration failures and latency metrics',
      ],
      technology: [
        'Run load test: 500 tickets/hour through AI classification API',
        'Monitor API error rates, p95 latency, memory usage',
        'Test circuit breaker: AI fails gracefully under load',
        'Validate CMDB enrichment is appended to ticket context correctly',
      ],
    },
    deliverables: ['Integration Test Report', 'Load Test Results', 'Fallback Test Sign-off'],
    resources: [],
    challenges: [
      { issue: 'AI API latency spikes under load, causing ticket processing delays', resolution: 'Implement async classification — fire-and-forget, AI updates ticket within 30s. This removes AI from the critical path entirely.', perspective: 'technology' },
      { issue: 'Integration test discovers undocumented ITSM workflow that bypasses AI', resolution: 'Map all ticket creation paths in ITSM. Ensure AI is invoked from all entry points — not just the main form.', perspective: 'process' },
    ],
  },
  {
    day: 18, week: 4, phase: 'pilot',
    title: 'Stakeholder Pilot Demo & Progress Presentation',
    objectives: [
      'Present pilot progress to executive sponsors and key stakeholders',
      'Demonstrate AI in action with live or recorded scenarios',
      'Secure continued support and confirm go-live approval pathway',
    ],
    tasks: {
      people: [
        'Prepare 20-minute pilot progress presentation for executives',
        'Run live demo of AI classification in shadow mode',
        'Present accuracy metrics, agent feedback, and quick win results',
        'Open Q&A — address concerns about AI autonomy and risk',
      ],
      process: [
        'Compile pilot metrics: accuracy, ticket volume processed, agent feedback score',
        'Create before/after comparison: manual vs AI-assisted classification time',
        'Document decisions and approvals from stakeholder presentation',
        'Update risk register with any new risks raised by stakeholders',
      ],
      technology: [
        'Prepare live demo environment with real (anonymised) ticket data',
        'Create visualisation of AI accuracy trend over pilot period',
        'Prepare technical FAQ for CTO/IT Director questions',
        'Capture demo recording for teams not present',
      ],
    },
    deliverables: ['Pilot Progress Presentation', 'Accuracy & Impact Report', 'Go-Live Approval Request'],
    resources: [],
    challenges: [
      { issue: 'Executives ask "what happens if AI is wrong?"', resolution: 'Explain human-in-the-loop design: AI suggests, agent confirms. Show override rate and feedback loop. Present liability and governance framework.', perspective: 'people' },
      { issue: 'Demo environment fails during live presentation', resolution: 'Always prepare a recorded backup demo. Have screenshots of key metrics ready. Practice demo at least twice before the meeting.', perspective: 'technology' },
    ],
  },
  {
    day: 19, week: 4, phase: 'pilot',
    title: 'Pilot Retrospective & Go/No-Go Decision',
    objectives: [
      'Conduct formal pilot retrospective with the full team',
      'Make go/no-go decision for production deployment',
      'Document lessons learned and outstanding risks',
    ],
    tasks: {
      people: [
        'Run retrospective: What went well? What didn\'t? What would we change?',
        'Acknowledge and celebrate the pilot team\'s contribution',
        'Communicate go/no-go decision to all stakeholders same day',
        'Discuss any team concerns about moving to production',
      ],
      process: [
        'Complete go/no-go checklist against all pilot success criteria',
        'Document retrospective action items with owners and dates',
        'Update the project risk register with lessons from pilot',
        'Prepare production deployment plan if go decision is made',
      ],
      technology: [
        'Complete technical go-live readiness checklist',
        'Sign off on monitoring, alerting, and on-call runbook for AI service',
        'Confirm production infrastructure sizing and scaling plan',
        'Verify rollback procedure tested and documented',
      ],
    },
    deliverables: ['Pilot Retrospective Report', 'Go/No-Go Decision Document', 'Production Deployment Plan v0.1'],
    resources: [],
    challenges: [
      { issue: 'Team is split — some want more testing, others want to go live', resolution: 'Use objective criteria in go/no-go checklist. If >80% of criteria met, go. Document outstanding items as post-launch watch items with owners.', perspective: 'process' },
      { issue: 'Key technical team member leaves before go-live', resolution: 'Ensure all knowledge is documented before go-live. Run knowledge transfer session. Identify a backup technical lead.', perspective: 'people' },
    ],
  },
];

// ── SCALING PHASE: Days 21-24 (Week 4-5) ─────────────────────────────────────
const SCALING_EARLY: DayPlan[] = [
  {
    day: 21, week: 4, phase: 'scaling',
    title: 'Production Go-Live — Day 1',
    objectives: [
      'Deploy AI classification to production for all new incidents',
      'Monitor system health and AI performance in real-time',
      'Ensure all teams are aware and supported on go-live day',
    ],
    tasks: {
      people: [
        'Send go-live announcement to all IT Ops teams',
        'Station change champions at desks to answer colleague questions',
        'Confirm dedicated on-call support rota for first 48 hours',
        'Send comms to end users explaining the change (if applicable)',
      ],
      process: [
        'Execute production deployment runbook step by step',
        'Enable AI classification for 100% of new incidents at 09:00',
        'Run hourly health checks for first 8 hours',
        'Log all go-live issues in real-time issues tracker',
      ],
      technology: [
        'Deploy AI service to production with blue-green deployment',
        'Monitor: API latency, error rate, classification volume, accuracy',
        'Keep rollback procedure ready — execute if error rate >5%',
        'Confirm monitoring alerts are active and going to right people',
      ],
    },
    deliverables: ['Go-Live Execution Log', 'Day-1 Health Report', 'Go-Live Comms (sent)'],
    resources: [],
    challenges: [
      { issue: 'Unexpected ticket volume spike on go-live day overloads AI API', resolution: 'Implement rate limiting and queuing. Fall back to manual classification for excess volume. Scale up AI service compute immediately.', perspective: 'technology' },
      { issue: 'Agents panic when AI makes early visible error', resolution: 'Remind team errors are expected and monitored. Show real-time accuracy metric. Use change champions to calm concerns. Review error publicly in afternoon debrief.', perspective: 'people' },
    ],
  },
  {
    day: 22, week: 5, phase: 'scaling',
    title: 'Post Go-Live Stabilisation & First Production Metrics',
    objectives: [
      'Stabilise AI service after go-live',
      'Collect and share first 24-hour production metrics',
      'Address any immediate issues from day 1',
    ],
    tasks: {
      people: [
        'Morning standup: what happened yesterday? Any concerns?',
        'Share Day-1 metrics with team and celebrate early wins',
        'Collect agent feedback on first day of AI-assisted work',
        'Check in with change champions — any escalations from the floor?',
      ],
      process: [
        'Review Day-1 issues log — categorise and assign owners',
        'Compare Day-1 AI accuracy vs pilot benchmark',
        'Update risk register with any new production risks observed',
        'Confirm SLA compliance was maintained during go-live day',
      ],
      technology: [
        'Review Day-1 AI service metrics: volume, accuracy, latency, errors',
        'Apply any quick configuration fixes identified from Day-1',
        'Confirm model performance matches pilot expectations in production',
        'Set up weekly model performance review cadence',
      ],
    },
    deliverables: ['Day-1 Production Metrics Report', 'Issues Log (Day 1)', 'Stabilisation Action Plan'],
    resources: [],
    challenges: [
      { issue: 'Production accuracy lower than pilot — different ticket distribution', resolution: 'Analyse distribution shift. Run targeted retraining on production ticket sample. Adjust confidence thresholds. This is normal — production data always differs slightly.', perspective: 'technology' },
      { issue: 'Agents routing around AI — manually overriding everything', resolution: 'Review override rates by agent and team. Discuss with team leads. Identify root cause — UI issue, trust issue, or training gap. Address specifically.', perspective: 'people' },
    ],
  },
  {
    day: 23, week: 5, phase: 'scaling',
    title: 'Alert Noise Reduction — AI Use Case #2 Activation',
    objectives: [
      'Activate the second AI use case: alert noise reduction / event correlation',
      'Reduce false positive alert volume by 30%+ in first week',
      'Ensure monitoring team is trained and confident with new behaviour',
    ],
    tasks: {
      people: [
        'Run 1-hour training session with infrastructure and monitoring team',
        'Explain how AI event correlation works and what changes in their workflow',
        'Assign two infrastructure engineers as "correlation pilots"',
        'Set clear expectation: some alerts they used to see will now be suppressed',
      ],
      process: [
        'Enable AI alert correlation rules in monitoring platform',
        'Set suppression thresholds conservatively (start at low sensitivity)',
        'Define escalation path if a suppressed alert was actually critical',
        'Agree daily review of suppressed alerts for first 2 weeks',
      ],
      technology: [
        'Deploy alert correlation AI module to monitoring platform',
        'Configure integration: monitoring tool → AI correlation engine',
        'Set up dashboard: alerts received vs alerts suppressed vs incidents created',
        'Test: simulate known false positive pattern — confirm AI suppresses it',
      ],
    },
    deliverables: ['Alert Correlation Activation Report', 'Monitoring Team Training Sign-off', 'Noise Reduction Baseline'],
    resources: [],
    challenges: [
      { issue: 'AI suppresses a real alert that should have created a P1 incident', resolution: 'This is the #1 risk. Mitigate by starting with low sensitivity. Have daily review of suppressed alerts. Implement immediate escalation path for anything touching production services.', perspective: 'technology' },
      { issue: 'Infrastructure team insists on seeing all alerts — doesn\'t trust suppression', resolution: 'Create "suppressed alerts" view in dashboard they can review at will. Start with low-risk alert categories only. Build trust incrementally over 4 weeks.', perspective: 'people' },
    ],
  },
  {
    day: 24, week: 5, phase: 'scaling',
    title: 'Knowledge AI — Self-Service & Agent Assist Activation',
    objectives: [
      'Activate AI-powered knowledge recommendation for agents and self-service',
      'Reduce Level 1 ticket volume by surfacing right KB articles at first contact',
      'Establish knowledge quality review cycle',
    ],
    tasks: {
      people: [
        'Train service desk on how to use AI knowledge recommendations',
        'Recruit 3 "knowledge champions" to drive KB quality improvement',
        'Run workshop: how to write KB articles AI can effectively retrieve',
        'Communicate to end users: new intelligent search in self-service portal',
      ],
      process: [
        'Enable AI knowledge recommendation on ITSM new ticket form',
        'Enable semantic search on self-service portal',
        'Define KB quality metrics: article usage rate, deflection rate, rating',
        'Schedule monthly KB review — retire, update, or create articles',
      ],
      technology: [
        'Deploy vector database with KB article embeddings',
        'Integrate semantic search API into ITSM and self-service portal',
        'Test: submit 20 common issues — verify relevant KB articles surface',
        'Monitor: recommendation click-through rate and ticket deflection',
      ],
    },
    deliverables: ['Knowledge AI Activation Report', 'KB Quality Baseline', 'Self-Service Deflection Dashboard'],
    resources: [],
    challenges: [
      { issue: 'KB articles are outdated — AI recommends wrong resolutions', resolution: 'Run emergency KB audit before activation. Retire or flag articles older than 12 months. Use AI-assisted KB gap analysis to identify what\'s missing.', perspective: 'process' },
      { issue: 'Agents ignore knowledge recommendations — prefer tribal knowledge', resolution: 'Gamify: show agents their "knowledge utilisation score". Share stories where KB recommendation saved 30 minutes. Integrate KB rating into agent scorecard.', perspective: 'people' },
    ],
  },
];

// ── SCALING PHASE: Days 26-29 (Week 5-6) ─────────────────────────────────────
const SCALING_MID: DayPlan[] = [
  {
    day: 26, week: 6, phase: 'scaling',
    title: 'Change Management — AI-Assisted Risk Scoring for Changes',
    objectives: [
      'Activate AI risk scoring for change requests',
      'Reduce CAB meeting time by pre-scoring standard and low-risk changes',
      'Maintain change governance rigour while improving speed',
    ],
    tasks: {
      people: [
        'Brief Change Advisory Board (CAB) on AI risk scoring',
        'Run workshop: how AI assesses change risk and what factors it considers',
        'Confirm CAB will review AI scores but retain final approval authority',
        'Assign change manager as AI-assisted change champion',
      ],
      process: [
        'Enable AI risk scoring on all new change requests',
        'Define scoring thresholds: auto-approve (score <20), fast-track (20-50), full CAB (>50)',
        'Test with 10 historical changes — compare AI score vs CAB decision',
        'Update change policy to reference AI risk score as advisory input',
      ],
      technology: [
        'Deploy change risk scoring model to ITSM platform',
        'Validate model trained on historical changes and CI failure rates',
        'Test: submit 5 change scenarios — review AI risk reasoning',
        'Confirm audit trail: AI score and reasoning stored in change record',
      ],
    },
    deliverables: ['Change AI Risk Scoring Activation', 'CAB Process Update Document', 'Change Risk Model Validation Report'],
    resources: [],
    challenges: [
      { issue: 'CAB members feel AI undermines their expertise and authority', resolution: 'Frame AI as "pre-read" — gives CAB more time to focus on genuinely complex changes. AI score is advisory only. Run CAB with and without AI scores to demonstrate value.', perspective: 'people' },
      { issue: 'AI scores high-risk for a change that CAB knows is safe', resolution: 'Track override frequency. Use overrides as training data to improve model. Publish "AI accuracy vs CAB decisions" monthly to build confidence.', perspective: 'process' },
    ],
  },
  {
    day: 27, week: 6, phase: 'scaling',
    title: 'SLA Prediction & Proactive Escalation AI',
    objectives: [
      'Deploy predictive SLA breach model — warn agents before SLA is missed',
      'Reduce SLA breaches by 30% through proactive intervention',
      'Integrate predictions with team lead escalation workflow',
    ],
    tasks: {
      people: [
        'Train service desk team leads on interpreting SLA prediction alerts',
        'Define response protocol: what to do when breach predicted >30 min ahead',
        'Run tabletop exercise: "AI says this ticket will breach in 20 mins — what now?"',
        'Confirm team leads have authority to reassign tickets based on predictions',
      ],
      process: [
        'Enable SLA prediction model — triggers alert when breach probability >70%',
        'Define prediction alert routing: auto-notify ticket owner + team lead',
        'Create SLA intervention playbook: standard responses to prediction alerts',
        'Set up SLA performance dashboard: predicted vs actual breach rate',
      ],
      technology: [
        'Deploy SLA prediction model with real-time ticket feature extraction',
        'Integrate prediction alert with ITSM notification engine',
        'Test: submit ticket designed to breach — confirm prediction fires correctly',
        'Monitor prediction accuracy: false positive / false negative rate',
      ],
    },
    deliverables: ['SLA Prediction Model Activation', 'Intervention Playbook', 'SLA Prediction Accuracy Baseline'],
    resources: [],
    challenges: [
      { issue: 'Too many prediction alerts — agents get alert fatigue', resolution: 'Tune prediction threshold higher (>80% probability). Add time filter: only alert if breach within 30 min. Batch low-urgency predictions into digest format.', perspective: 'process' },
      { issue: 'Prediction model unreliable for certain ticket categories', resolution: 'Disable predictions for categories with <80% accuracy. Run targeted data collection and retraining. Use rule-based escalation as fallback for those categories.', perspective: 'technology' },
    ],
  },
  {
    day: 28, week: 6, phase: 'scaling',
    title: 'Automation Expansion — Runbook Automation for Top 5 Incident Types',
    objectives: [
      'Deploy automated remediation runbooks for the top 5 recurring incident types',
      'Reduce mean time to resolve (MTTR) for in-scope incidents by 40%',
      'Ensure human approval gates are in place for high-risk actions',
    ],
    tasks: {
      people: [
        'Review automated runbooks with the engineers who currently handle these incidents',
        'Confirm engineers comfortable with automation taking first-response actions',
        'Define override: how an engineer stops an automated runbook mid-execution',
        'Communicate to team: automation handles routine steps, engineers handle exceptions',
      ],
      process: [
        'Deploy runbook automation for: password resets, disk space cleanup, service restarts, certificate renewals, user provisioning',
        'Define approval gates: high-risk actions require human sign-off before executing',
        'Test each runbook in staging with simulated incident trigger',
        'Set up runbook execution dashboard: triggered / completed / failed / overridden',
      ],
      technology: [
        'Integrate runbook automation engine with ITSM incident trigger',
        'Deploy runbooks: review each one for idempotency and rollback capability',
        'Implement execution audit log: who / what / when / outcome for every automated action',
        'Test rollback: confirm runbook can be halted and reversed if needed',
      ],
    },
    deliverables: ['Runbook Automation Activation Report', 'Automation Coverage Map', 'MTTR Before/After Comparison'],
    resources: [],
    challenges: [
      { issue: 'Automated runbook takes wrong action on edge-case incident', resolution: 'Build strict pre-condition checks before each runbook step. Use dry-run mode for first 7 days. Add confidence checks — if uncertain, stop and notify engineer.', perspective: 'technology' },
      { issue: 'Engineers worried automation will make their role redundant', resolution: 'Show data: automation handles repetitive steps, freeing engineers for high-value problem solving. Share stories. Map new AI-era roles for current engineers.', perspective: 'people' },
    ],
  },
  {
    day: 29, week: 6, phase: 'scaling',
    title: 'User Sentiment & Adoption Health Check',
    objectives: [
      'Measure AI adoption rates across all teams',
      'Identify and address adoption blockers before they become cultural resistance',
      'Celebrate wins and visible progress to sustain momentum',
    ],
    tasks: {
      people: [
        'Run pulse survey: 5 questions on AI tool confidence, usefulness, concerns',
        'Hold focus groups with Service Desk, Infrastructure, and App Support (separate sessions)',
        'Review change champion feedback: what are they hearing on the floor?',
        'Identify any pockets of significant resistance — plan targeted intervention',
      ],
      process: [
        'Analyse AI usage metrics by team: override rates, recommendation acceptance, feedback given',
        'Calculate AI adoption score per team: target >60% recommendation acceptance',
        'Compare current metrics with Day-1 baseline',
        'Update change management plan based on adoption health findings',
      ],
      technology: [
        'Run adoption analytics report from AI platform: usage by team, feature, time of day',
        'Identify which AI features are underused and why',
        'Check model feedback loop: are agent overrides being captured and used for retraining?',
        'Review AI platform error rate — any patterns of failure that explain low adoption?',
      ],
    },
    deliverables: ['Adoption Health Report', 'Pulse Survey Results', 'Change Intervention Plan (if needed)'],
    resources: [],
    challenges: [
      { issue: 'Adoption metrics look good on paper but culture hasn\'t changed', resolution: 'Look beyond acceptance rates. Run observational shadowing. Talk to frontline agents. Vanity metrics (override rate) hide cultural reality. Use qualitative data.', perspective: 'people' },
      { issue: 'One team is consistently low on adoption — dragging overall metric', resolution: 'Arrange 1:1 with team lead. Understand the specific barrier. Run targeted intervention: demo, retraining, or peer influence from change champion in that team.', perspective: 'process' },
    ],
  },
];

// ── SCALING PHASE: Days 31-44 ─────────────────────────────────────────────────
const SCALING_LATE: DayPlan[] = [
  {
    day: 31, week: 7, phase: 'scaling',
    title: 'Second Use Case Expansion Planning',
    objectives: ['Plan the next AI use case based on pilot learnings and backlog prioritisation', 'Secure resources and approval for use case #3', 'Establish delivery timeline for next 30 days'],
    tasks: {
      people: ['Present use case #3 proposal to IT leadership', 'Assign use case lead and core delivery team', 'Identify subject matter experts needed from operations teams', 'Run kick-off meeting for use case #3 team'],
      process: ['Score next use case against: value, data readiness, effort, risk', 'Create 30-day delivery plan for use case #3', 'Update overall transformation roadmap', 'Communicate expansion plan to all stakeholders'],
      technology: ['Assess technical dependencies for use case #3', 'Confirm data availability and quality for new use case', 'Identify reusable components from previous use cases', 'Draft technical architecture for use case #3'],
    },
    deliverables: ['Use Case #3 Proposal', 'Expanded Delivery Plan', 'Updated Transformation Roadmap'],
    resources: [],
    challenges: [
      { issue: 'Team bandwidth stretched across live use cases and new development', resolution: 'Allocate 60% of team to run/maintain, 40% to build. Consider temporary contractor to support expansion.', perspective: 'people' },
      { issue: 'Stakeholders want to rush to use case #3 before use case #1 is stable', resolution: 'Enforce stability gate: use case must run 2 weeks with <5% error rate before building next. Quality over speed.', perspective: 'process' },
    ],
  },
  {
    day: 35, week: 7, phase: 'scaling',
    title: 'AI Governance Framework — Policies, Ethics & Oversight',
    objectives: ['Establish formal AI governance for all live AI use cases', 'Define bias monitoring, explainability, and human oversight requirements', 'Create AI incident response playbook'],
    tasks: {
      people: ['Form AI Ethics & Governance Working Group (AI Lead, Legal, HR, IT Director)', 'Run AI ethics workshop: what could go wrong? How do we catch it?', 'Define human oversight requirements for each AI decision type', 'Assign AI Responsible Officer (ongoing role)'],
      process: ['Publish AI Policy: acceptable use, prohibited actions, human override rights', 'Define bias monitoring: what metrics to track, frequency, escalation path', 'Create AI incident response playbook: what to do if AI causes harm or significant error', 'Establish model change management process: how AI models are updated in production'],
      technology: ['Implement model explainability: every AI decision must have a logged reason', 'Deploy bias monitoring dashboard: performance by department, priority, ticket type', 'Set up AI model version control and change log', 'Test AI incident response: simulate AI failure and run playbook'],
    },
    deliverables: ['AI Governance Policy', 'Bias Monitoring Dashboard', 'AI Incident Response Playbook', 'AI Responsible Officer Charter'],
    resources: [],
    challenges: [
      { issue: 'Legal team concerned about AI liability — wants to block live use', resolution: 'Human-in-the-loop design means AI is advisory. Present liability framework. Get legal sign-off on governance policy before expansion. Bring in external AI legal counsel if needed.', perspective: 'people' },
      { issue: 'Bias detected in AI routing — certain departments consistently get slower service', resolution: 'Pause routing feature for affected segments. Investigate training data for historical bias. Retrain with balanced dataset. Implement fairness metrics as ongoing KPI.', perspective: 'technology' },
    ],
  },
  {
    day: 38, week: 8, phase: 'scaling',
    title: 'Training & Reskilling Programme — AI Literacy for All IT Ops',
    objectives: ['Launch formal AI literacy training programme for all IT Ops staff', 'Ensure every team member understands AI in their specific role', 'Build internal AI capability that reduces external dependency'],
    tasks: {
      people: ['Launch mandatory AI Fundamentals module (2 hours, all staff)', 'Run role-specific sessions: agents, engineers, team leads, managers', 'Identify 5 internal "AI practitioners" for advanced training', 'Create AI learning pathway with badges and certification tracking'],
      process: ['Publish training schedule and completion deadlines', 'Track training completion by team and role', 'Incorporate AI literacy into new staff onboarding', 'Add AI skills to role profiles and performance objectives'],
      technology: ['Deploy AI fundamentals e-learning on LMS', 'Create hands-on lab: agents practice with AI tools in safe environment', 'Record all live training sessions for async access', 'Set up AI community of practice: Teams channel, monthly meetup'],
    },
    deliverables: ['AI Training Programme Launch', 'Training Completion Dashboard', 'AI Practitioner Development Plan'],
    resources: [],
    challenges: [
      { issue: 'Training attendance low — ops teams too busy for training', resolution: 'Make training mandatory with manager accountability. Offer micro-learning (15-min modules). Run sessions at shift changeover. Record everything for async catch-up.', perspective: 'people' },
      { issue: 'Training content too generic — not relevant to their specific AI tools', resolution: 'Co-develop training with frontline agents. Use real scenarios from your own environment. Have change champions deliver peer-to-peer sessions.', perspective: 'process' },
    ],
  },
  {
    day: 42, week: 9, phase: 'scaling',
    title: 'ROI Measurement & Business Case Validation',
    objectives: ['Calculate actual ROI from live AI use cases', 'Compare delivered value against original business case', 'Secure funding approval for next phase of transformation'],
    tasks: {
      people: ['Present ROI report to CFO / IT Director', 'Run value realisation workshop with team leads', 'Recognise team members who contributed to measurable wins', 'Prepare ROI narrative for board / executive committee presentation'],
      process: ['Calculate: MTTR improvement, SLA compliance change, ticket volume handled by AI, FTE hours saved', 'Compare against original business case projections', 'Document ROI methodology for auditability', 'Prepare next-phase business case with ROI evidence from phase 1'],
      technology: ['Extract metrics from AI platform, ITSM, and monitoring tool', 'Build ROI visualisation dashboard for ongoing tracking', 'Calculate total cost of ownership: platform + people + ongoing maintenance', 'Project 12-month and 36-month ROI trajectory'],
    },
    deliverables: ['ROI Report', 'ROI Dashboard', 'Next Phase Business Case', 'Board Presentation'],
    resources: [],
    challenges: [
      { issue: 'ROI lower than projected due to slower adoption than planned', resolution: 'Be transparent. Show trajectory and acceleration plan. Reforecast with realistic adoption curve. Propose specific interventions to accelerate adoption in next 30 days.', perspective: 'process' },
      { issue: 'Finance team disputes attribution — "MTTR improvement was due to team not AI"', resolution: 'Use A/B comparison: AI-assisted vs non-AI-assisted tickets. Use statistical evidence. Show correlation between AI adoption rate and MTTR improvement.', perspective: 'process' },
    ],
  },
  {
    day: 44, week: 9, phase: 'scaling',
    title: 'Scaling Architecture Review & Next 45-Day Planning',
    objectives: ['Review AI architecture for scalability as use cases grow', 'Identify technical bottlenecks before they impact performance', 'Plan the Optimize phase: continuous improvement, new use cases, MLOps maturity'],
    tasks: {
      people: ['Run architecture review with Tech Lead, AI Lead, and Infrastructure Lead', 'Present scaling plan to IT Director', 'Identify skills gaps for Optimize phase — AI Ops, MLOps, DataOps', 'Confirm team structure for Optimize phase'],
      process: ['Document all current AI use cases, their volumes, and growth trajectory', 'Identify shared platform components that need scaling', 'Create Optimize phase roadmap: Days 46-90', 'Update transformation programme plan with Optimize phase milestones'],
      technology: ['Assess AI platform capacity: current load vs maximum capacity', 'Identify single points of failure in AI architecture', 'Plan MLOps maturity uplift: automated retraining, drift detection, A/B testing', 'Evaluate AI platform vendor roadmap — upcoming features relevant to use cases'],
    },
    deliverables: ['Architecture Scaling Review', 'Optimize Phase Roadmap', 'MLOps Maturity Plan'],
    resources: [],
    challenges: [
      { issue: 'AI platform showing signs of performance degradation as ticket volume grows', resolution: 'Scale AI service horizontally. Implement caching for common classification patterns. Review and optimise model inference performance.', perspective: 'technology' },
      { issue: 'Different AI use cases using different data pipelines — becoming unmanageable', resolution: 'Design unified data platform: single feature store, shared data quality layer, common monitoring. This is the right time to consolidate before Optimize phase.', perspective: 'technology' },
    ],
  },
];

// ── OPTIMIZE PHASE: Days 46-90 ────────────────────────────────────────────────
const OPTIMIZE_PHASE: DayPlan[] = [
  {
    day: 46, week: 10, phase: 'optimize',
    title: 'Optimize Phase Kick-off — Continuous Improvement Framework',
    objectives: ['Launch formal continuous improvement programme for AI in IT Ops', 'Establish MLOps practices: automated monitoring, retraining, deployment', 'Set Optimize phase goals and KPIs'],
    tasks: {
      people: ['Run Optimize phase kick-off with full transformation team', 'Introduce "AI Improvement Sprints" — 2-week cycles of AI enhancement', 'Assign MLOps engineer as AI platform owner going forward', 'Set 90-day Optimize phase goals with each team lead'],
      process: ['Define continuous improvement backlog: model improvements, new features, process tweaks', 'Establish AI sprint cadence: plan → build → test → deploy → measure (2 weeks)', 'Create AI performance review meeting: weekly, 30 mins, all stakeholders', 'Document AI system of record: all active models, versions, owners, performance'],
      technology: ['Deploy automated model performance monitoring with drift alerts', 'Implement A/B testing framework for model improvements', 'Automate model retraining pipeline when drift detected', 'Set up automated regression testing for model deployments'],
    },
    deliverables: ['Optimize Phase Plan', 'MLOps Maturity Baseline', 'AI Improvement Backlog', 'Continuous Improvement Framework'],
    resources: [],
    challenges: [
      { issue: 'Team exhausted after 45 days of intense delivery — momentum risks dropping', resolution: 'Acknowledge the achievement publicly. Allow brief consolidation week. Reframe Optimize as "making what we\'ve built excellent" not "more new things". Celebrate wins before starting.', perspective: 'people' },
      { issue: 'No clear owner for ongoing AI operations post-transformation', resolution: 'Define AI Operations role: who owns model performance, retraining, incidents, improvements. Integrate into existing IT Ops structure. Don\'t leave AI as a project — make it BAU.', perspective: 'process' },
    ],
  },
  {
    day: 50, week: 10, phase: 'optimize',
    title: 'MLOps Maturity — Automated Retraining & Model Registry',
    objectives: ['Implement automated model retraining pipeline triggered by performance drift', 'Deploy model registry for version control and rollback', 'Establish model deployment standards'],
    tasks: {
      people: ['Train AI team on MLOps toolchain and practices', 'Define model change management process — who approves model updates?', 'Create on-call rota for AI platform (now production critical)', 'Brief IT leadership on MLOps investment and why it matters'],
      process: ['Define drift thresholds: when does model performance trigger retraining?', 'Document model release process: develop → test → staging → production', 'Create model rollback runbook — how to revert to previous version in <15 min', 'Set up model performance SLAs — what is acceptable model uptime and accuracy?'],
      technology: ['Deploy model registry (MLflow, SageMaker, Vertex AI)', 'Implement automated retraining pipeline: data extraction → training → validation → staging', 'Deploy shadow deployment for model updates — new model runs alongside before replacing', 'Set up model performance dashboards with automated alerts'],
    },
    deliverables: ['MLOps Pipeline Documentation', 'Model Registry Setup', 'Model Change Management Process', 'Model SLA Definition'],
    resources: [],
    challenges: [
      { issue: 'Automated retraining produces worse model than existing one', resolution: 'Never auto-deploy retrained models without validation gate. Implement automated regression testing: new model must beat current model by >2% on hold-out set before promoting.', perspective: 'technology' },
      { issue: 'Model registry adds bureaucracy — engineers resist the process', resolution: 'Automate as much of the process as possible. Make model promotion a 2-click operation. Show engineers how registry protects them from accidental bad deployments.', perspective: 'people' },
    ],
  },
  {
    day: 55, week: 11, phase: 'optimize',
    title: 'Advanced Analytics — AI Performance & Business Intelligence Dashboard',
    objectives: ['Deploy comprehensive AI performance and business intelligence dashboard', 'Connect AI metrics to business outcomes (cost, SLA, customer satisfaction)', 'Enable self-service reporting for stakeholders'],
    tasks: {
      people: ['Run dashboard walkthrough with all stakeholder groups', 'Train team leads on self-service reporting capabilities', 'Identify additional metrics stakeholders want to track', 'Create executive summary view for board-level reporting'],
      process: ['Define KPI hierarchy: business KPIs → operational KPIs → AI model KPIs', 'Establish monthly AI performance review with executives', 'Create quarterly AI impact report for board', 'Set up automated KPI alerts: notify owners when KPI moves out of range'],
      technology: ['Build unified AI performance dashboard (BI tool + AI platform data)', 'Integrate: ITSM metrics, AI model metrics, business KPIs in single view', 'Enable drill-down: from business KPI → operational metric → AI model behaviour', 'Deploy self-service query interface for non-technical stakeholders'],
    },
    deliverables: ['AI Performance Dashboard (live)', 'Executive KPI Summary View', 'Self-Service Reporting Guide'],
    resources: [],
    challenges: [
      { issue: 'Dashboard has too many metrics — stakeholders don\'t know what to look at', resolution: 'Apply "3-3-3 rule": 3 strategic KPIs for executives, 3 operational KPIs for managers, 3 model KPIs for AI team. Create role-based views.', perspective: 'people' },
      { issue: 'Data from different systems is inconsistent — dashboard shows contradictory numbers', resolution: 'Implement single source of truth for each metric. Document metric definitions. Run data reconciliation exercise. Assign metric owners who validate monthly.', perspective: 'process' },
    ],
  },
  {
    day: 60, week: 12, phase: 'optimize',
    title: '60-Day Review — Mid-Optimize Milestone & Strategy Refresh',
    objectives: ['Conduct formal 60-day programme review', 'Validate transformation is on track for 90-day targets', 'Refresh strategy based on learnings and new AI capabilities available'],
    tasks: {
      people: ['Run 60-day programme review with executive sponsors', 'Hold all-hands: celebrate progress, share metrics, preview next 30 days', 'Conduct 360-degree feedback on transformation leadership', 'Review and refresh change management approach for final stretch'],
      process: ['Compare 60-day actuals vs original 90-day plan', 'Identify any milestones at risk in final 30 days', 'Update risk register and mitigation plans', 'Refresh transformation communication plan for Days 61-90'],
      technology: ['Run 60-day technical debt review: what accumulated during fast delivery?', 'Assess AI platform reliability: uptime, incident count, MTTR for AI itself', 'Review security posture of all AI components', 'Plan technical improvements for Days 61-90'],
    },
    deliverables: ['60-Day Programme Review Report', 'Updated 90-Day Plan', 'All-Hands Presentation', 'Risk Register Update'],
    resources: [],
    challenges: [
      { issue: 'Behind schedule on one major use case — threatens 90-day targets', resolution: 'Be transparent. Negotiate scope: deliver core features by Day 90, defer enhancements to BAU roadmap. Reforecast with confidence — better to under-promise and over-deliver.', perspective: 'process' },
      { issue: 'Team showing signs of burnout at 60-day mark', resolution: 'Mandatory recovery time — no weekend work for next 2 weeks. Celebrate achievements. Reassign workload. Bring in support resource. Programme health is a risk item.', perspective: 'people' },
    ],
  },
  {
    day: 65, week: 13, phase: 'optimize',
    title: 'Problem Management AI — Proactive Issue Detection',
    objectives: ['Deploy AI-powered proactive problem detection — identify incidents before they happen', 'Reduce recurring incidents by 30% through predictive problem management', 'Integrate AI insights into the problem management process'],
    tasks: {
      people: ['Brief problem management team on AI-assisted problem detection', 'Run workshop: how to investigate AI-flagged potential problems', 'Assign AI problem detection owner within problem management team', 'Set expectation: AI flags, humans investigate and decide'],
      process: ['Enable AI pattern detection: flag CIs with recurring incident correlation', 'Define problem investigation trigger: AI flags CI → problem record auto-created → assigned for investigation', 'Set weekly "AI problem review" meeting: review AI-flagged patterns', 'Update problem management KPIs to include proactive vs reactive ratio'],
      technology: ['Deploy correlation engine: link incidents to CIs, identify recurring patterns', 'Implement anomaly detection on CI health metrics (CPU, memory, disk, error rates)', 'Build "problem radar" view: CIs at risk ranked by AI confidence score', 'Integrate problem detection with CMDB for relationship context'],
    },
    deliverables: ['Proactive Problem Detection Activation', 'Problem Radar Dashboard', 'Problem Management Process Update'],
    resources: [],
    challenges: [
      { issue: 'Too many false positives from AI problem detection overwhelm problem managers', resolution: 'Tune detection sensitivity. Start with only high-confidence flags (>85%). Focus on top 10 CIs by incident frequency. Build trust before expanding scope.', perspective: 'technology' },
      { issue: 'Problem managers investigate AI flags but find nothing — lose confidence', resolution: 'AI flags are probabilistic signals, not certainties. Educate on false positive rate. Track hit rate: what % of AI flags led to real problem records? Use data to improve.', perspective: 'people' },
    ],
  },
  {
    day: 70, week: 14, phase: 'optimize',
    title: 'Capacity Planning AI — Predictive Infrastructure Demand',
    objectives: ['Deploy AI-driven capacity planning to predict infrastructure demand 30 days ahead', 'Reduce capacity-related incidents by right-sizing infrastructure proactively', 'Integrate capacity predictions into change and procurement processes'],
    tasks: {
      people: ['Brief infrastructure team on AI capacity predictions', 'Run workshop with capacity planners on interpreting and acting on predictions', 'Define responsibility: who acts on a capacity prediction alert?', 'Agree SLA for capacity remediation when AI flags risk'],
      process: ['Enable AI capacity prediction for top 20 critical infrastructure components', 'Define prediction → action workflow: AI flags → capacity review → change raised → approved → implemented', 'Update capacity management process to reference AI predictions as primary input', 'Create capacity planning calendar integrated with AI prediction refresh cycle'],
      technology: ['Deploy time-series forecasting model on infrastructure metrics', 'Integrate predictions with ITSM change management for capacity change requests', 'Build capacity planning dashboard: current utilisation, predicted peak, recommended action', 'Implement automated capacity alert: email to infra lead when utilisation predicted to exceed 80%'],
    },
    deliverables: ['Capacity Prediction Model Live', 'Capacity Planning Dashboard', 'Updated Capacity Management Process'],
    resources: [],
    challenges: [
      { issue: 'Capacity prediction model gives different forecast from manual capacity plan', resolution: 'Don\'t fight the model — investigate the discrepancy. AI may have spotted a growth trend humans missed. Or AI may lack context about planned migrations. Use both as inputs.', perspective: 'process' },
      { issue: 'Infrastructure team over-provisions based on AI predictions "just in case"', resolution: 'Train team on prediction confidence intervals. Over-provisioning has cost. Set governance: any capacity increase >20% beyond prediction requires additional justification.', perspective: 'people' },
    ],
  },
  {
    day: 75, week: 15, phase: 'optimize',
    title: 'AI-Augmented Service Desk — Virtual Agent Phase 2',
    objectives: ['Expand virtual agent to handle 15+ service request types autonomously', 'Achieve 30% ticket deflection via self-service AI', 'Launch AI agent for Teams/Slack integration'],
    tasks: {
      people: ['Run user acceptance testing for expanded virtual agent with end users', 'Train service desk team on escalation from virtual agent to human', 'Launch internal marketing campaign for virtual agent adoption', 'Collect user satisfaction scores on virtual agent interactions'],
      process: ['Expand virtual agent scope: 15 additional service request types', 'Define fallback: when does virtual agent hand off to human agent?', 'Implement sentiment detection: if user frustrated, escalate immediately to human', 'Update service catalogue to reflect AI-handled vs human-handled requests'],
      technology: ['Deploy virtual agent v2 with expanded intent recognition', 'Integrate virtual agent with Teams and Slack for multichannel support', 'Implement conversational context: agent remembers conversation history', 'Deploy analytics: intent recognition rate, deflection rate, user satisfaction per intent'],
    },
    deliverables: ['Virtual Agent v2 Launch', 'Deflection Rate Dashboard', 'Teams/Slack Integration Live'],
    resources: [],
    challenges: [
      { issue: 'Virtual agent frustrates users with incorrect responses — damages trust', resolution: 'Implement graceful fallback: after 2 failed attempts, offer immediate human handoff. Monitor user abandonment rate as proxy for frustration. Prioritise accuracy over coverage.', perspective: 'people' },
      { issue: 'Teams/Slack integration causes unexpected notification volume', resolution: 'Give users control: opt-in for proactive notifications. Default to request-only (no unsolicited messages). Review notification volume weekly during launch period.', perspective: 'technology' },
    ],
  },
  {
    day: 80, week: 16, phase: 'optimize',
    title: 'Vendor & Contract AI — Procurement Optimisation Insights',
    objectives: ['Use AI to analyse vendor performance data and contract value', 'Identify underperforming vendors and cost optimisation opportunities', 'Produce AI-driven vendor scorecard for next contract renewal cycle'],
    tasks: {
      people: ['Brief IT procurement and vendor management team on AI insights', 'Review AI-generated vendor scorecard with each vendor relationship owner', 'Set expectation: AI provides insights, humans make vendor decisions', 'Plan vendor performance review meetings informed by AI analysis'],
      process: ['Run AI analysis on: vendor SLA adherence, support response times, incident contribution rate, cost per service unit', 'Generate vendor scorecard: rank all vendors by value delivered vs cost', 'Identify top 3 optimisation opportunities from AI analysis', 'Update vendor management process to include AI scorecard in renewal conversations'],
      technology: ['Extract vendor performance data from ITSM and monitoring tools', 'Run AI analysis: correlation between vendor and incident frequency, cost trends, SLA compliance', 'Build vendor intelligence dashboard with drill-down by vendor, service, and time period', 'Set up automated vendor performance alerts: notify owner when SLA drops below threshold'],
    },
    deliverables: ['AI Vendor Scorecard', 'Vendor Intelligence Dashboard', 'Top 3 Optimisation Recommendations'],
    resources: [],
    challenges: [
      { issue: 'Vendors push back on AI-generated performance data', resolution: 'Ensure data methodology is transparent and documented. Share scorecard with vendors before finalising. Give vendors opportunity to provide context. Use data as conversation starter, not verdict.', perspective: 'people' },
      { issue: 'Data quality issues make AI vendor analysis unreliable', resolution: 'Only include vendors with sufficient data coverage (>3 months, >100 incidents). Flag data gaps clearly in report. Invest in data completeness before next cycle.', perspective: 'process' },
    ],
  },
  {
    day: 85, week: 17, phase: 'optimize',
    title: 'Centre of Excellence — AI CoE Foundation',
    objectives: ['Establish a formal AI Centre of Excellence (CoE) to sustain and grow AI capability beyond Day 90', 'Define CoE mandate, governance, and team structure', 'Ensure transformation outcomes are embedded in BAU operations'],
    tasks: {
      people: ['Present AI CoE proposal to IT Director and executive sponsors', 'Define CoE team: AI Lead, Data Engineer, MLOps Engineer, Change Lead (part-time)', 'Appoint formal AI CoE Lead (could be Siddharth Dutt or nominated successor)', 'Create CoE charter: mission, scope, decision-making authority, reporting line'],
      process: ['Define CoE responsibilities: model governance, new use case pipeline, training, standards', 'Create AI use case intake process: how new AI ideas get evaluated and prioritised', 'Establish CoE community of practice: monthly meetup, shared learnings, external speakers', 'Integrate CoE into IT governance structure alongside architecture and security boards'],
      technology: ['Document AI platform as shared service: access policy, request process, SLAs', 'Create AI standards library: approved tools, frameworks, deployment patterns', 'Set up CoE knowledge base: all learnings, decisions, patterns from transformation', 'Plan CoE first-year roadmap: 3 new use cases, MLOps maturity uplift, training programme'],
    },
    deliverables: ['AI CoE Charter', 'CoE Team Structure', 'AI Use Case Intake Process', 'CoE First-Year Roadmap'],
    resources: [],
    challenges: [
      { issue: 'Leadership doesn\'t want to fund a permanent CoE — "the project is done"', resolution: 'Present ROI: AI requires ongoing governance, model maintenance, and evolution. Cost of CoE < cost of model degradation and missed opportunities. Show comparable industry benchmarks.', perspective: 'people' },
      { issue: 'CoE becomes an ivory tower disconnected from operations reality', resolution: 'Embed CoE members in operational teams 1 day/week. Require CoE to include frontline staff in all design decisions. Measure CoE success by operational adoption, not model sophistication.', perspective: 'process' },
    ],
  },
  {
    day: 88, week: 18, phase: 'optimize',
    title: '90-Day Final Preparation — Documentation, Handover & Celebration',
    objectives: ['Complete all documentation for handover to BAU operations', 'Prepare 90-day achievement report for executive presentation', 'Celebrate the team\'s achievements and transition to ongoing AI operations'],
    tasks: {
      people: ['Write personal thank-you notes to every key contributor', 'Plan 90-day celebration event — acknowledge the journey and the people', 'Run formal knowledge transfer sessions with all teams who will run AI in BAU', 'Conduct exit interviews / lessons learned with transformation team members'],
      process: ['Complete all handover documentation: run books, process guides, escalation paths, vendor contacts', 'Sign off all open actions and risks with clear BAU owners', 'Archive transformation project artefacts in shared knowledge base', 'Create "Day 91 operations guide": what does normal AI operations look like?'],
      technology: ['Complete technical handover: platform admin credentials, architecture docs, recovery procedures', 'Run final security review of all AI components', 'Complete DR test: simulate AI platform outage, run recovery', 'Ensure all AI monitoring alerts are configured with correct BAU owners'],
    },
    deliverables: ['Handover Documentation Pack', '90-Day Achievement Report', 'Day 91 Operations Guide', 'Celebration Event'],
    resources: [],
    challenges: [
      { issue: 'BAU team doesn\'t feel ready to own the AI platform', resolution: 'Extend knowledge transfer by 1 week if needed. Shadow support from transformation team for first 2 weeks of BAU. Create "break glass" escalation to AI Lead for first 90 days of BAU.', perspective: 'people' },
      { issue: 'Outstanding technical debt from fast delivery during transformation', resolution: 'Document all known debt items with risk rating. Create BAU remediation backlog with priorities. Ensure CoE has this in their first-year roadmap. Don\'t let perfect be the enemy of good.', perspective: 'technology' },
    ],
  },
  {
    day: 90, week: 18, phase: 'optimize',
    title: 'Day 90 — Executive Review, ROI Declaration & Programme Close',
    objectives: ['Present full 90-day transformation results to executive leadership', 'Declare ROI achieved vs business case', 'Formally close the transformation programme and transition to BAU + CoE'],
    tasks: {
      people: ['Deliver 90-day executive presentation: journey, achievements, ROI, and future', 'Receive formal executive sign-off on programme completion', 'Recognise the transformation team publicly — all-hands or company-wide communication', 'Share personal reflection: what would you do differently? What are you proud of?'],
      process: ['Present: KPIs delivered, quick wins achieved, use cases live, adoption rates, ROI', 'Formally hand over programme to CoE and BAU operations', 'Close all programme governance: steering committee, working groups, risk register', 'Publish 90-day transformation retrospective as internal case study'],
      technology: ['Present technical architecture: before and after', 'Demonstrate live AI use cases to executive audience', 'Show AI platform health: uptime, performance, and scalability headroom', 'Outline technology roadmap for next 12 months under CoE ownership'],
    },
    deliverables: ['90-Day Executive Presentation', 'Final ROI Report', 'Programme Closure Document', 'Internal Case Study', 'Transformation Retrospective'],
    resources: [],
    challenges: [
      { issue: 'Not all original targets were met by Day 90', resolution: 'Be honest and transparent. Show what was delivered, what is in progress, and the trajectory. A 70% delivery with strong foundation is better than 100% on paper with hidden technical debt. Present the realistic path to full delivery.', perspective: 'process' },
      { issue: 'Executive team asks "what\'s next?" before programme is even closed', resolution: 'This is a good problem. Have the CoE first-year roadmap ready. Present 3 next use cases with business cases. Show transformation as an ongoing journey, not a one-time project.', perspective: 'people' },
    ],
  },
];

// Merge all new days into the exported array
DAY_PLANS.push(
  ...PILOT_EXTRA,
  ...PILOT_MID,
  ...SCALING_EARLY,
  ...SCALING_MID,
  ...SCALING_LATE,
  ...OPTIMIZE_PHASE,
);

// Sort by day number for consistent display
DAY_PLANS.sort((a, b) => a.day - b.day);
