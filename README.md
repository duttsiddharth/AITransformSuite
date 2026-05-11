# AI IT Ops Transformation Toolkit

**Crafted by Siddharth Dutt**

A comprehensive, standalone AI IT Ops Transformation Toolkit — fully offline, installable as a PWA, and packed with 25+ features to plan, execute, and track your AI transformation journey.

## 🚀 Quick Start

### Option 1 — Single HTML file (offline, no server needed)
```bash
npm install
npm run build
# Open dist/index.html in any browser
```

### Option 2 — Live dev server
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### Option 3 — GitHub Pages / Netlify / Vercel
Push this repo and deploy — the build output is a single `index.html` file.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📅 90-Day Plan | Full day-by-day transformation plan across 5 phases |
| ✅ Checklists | Project-scoped with AI generation (Claude + ChatGPT) |
| ⚠️ Risk Register | AI-suggested risks & mitigation improvements |
| 📊 Metrics & KPIs | Sparkline charts, actuals logging, progress tracking |
| 👥 Meeting Tracker | Action items, AI extraction, overdue tracking |
| 📖 Decision Log | Status tracking, rationale, review dates |
| 🛒 Vendor Comparison | Weighted scoring matrix |
| 🤝 Team | Ownership assignment, workload view |
| 📅 Timeline | Gantt-style project timeline |
| 👔 Role Views | CIO / IT Manager / Change Lead dashboards |
| 🔔 Notifications | Reminders for overdue actions & review dates |
| 📄 Status Report | PDF & print-ready stakeholder report |
| 💾 Export/Import | Full JSON backup & restore |
| 🌓 Dark/Light mode | Theme toggle with persistence |
| 📱 PWA | Installable as desktop app |
| 🎓 Onboarding Tour | 14-step guided walkthrough |
| 🤖 AI Assistant | Claude (Anthropic) + ChatGPT (OpenAI) integration |

---

## 📁 Project Structure

```
src/
├── App.tsx                  # Router
├── components/              # 21 UI components
├── data/                    # Day plans, resources, use cases
├── hooks/                   # AI, notifications, theme hooks
├── store/                   # Zustand state management
├── types/                   # TypeScript types
└── index.css                # Tailwind + CSS variables
public/
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker
└── icons/                   # App icons
```

---

## 🔧 Tech Stack

- **React 19** + TypeScript
- **Tailwind CSS v4**
- **Zustand** (state + localStorage persistence)
- **Vite** + `vite-plugin-singlefile` (single HTML output)
- **jsPDF** + html2canvas (PDF export)
- **Anthropic Claude API** + **OpenAI GPT-4o** (AI features)

---

## 📄 Licence

Built by **Siddharth Dutt** — AI IT Ops Transformation Toolkit © 2025
