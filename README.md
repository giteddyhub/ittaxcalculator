This is a Next.js app providing an Italian tax calculator with an Untitled UI–inspired design.

Tech stack: Next.js 15 (App Router) + TypeScript + Tailwind CSS.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Build

```bash
npm run build && npm run start
```

## Notes on methodology

- IRPEF 2025 brackets: 23% up to €28k, 35% up to €50k, 43% above.
- Regional and municipal addizionali are input-driven using presets; you can override rates by editing code.
- INPS rates vary by category; defaults are provided per employment type and can be overridden in the UI.
- Employee credit and trattamento integrativo are modeled approximately for estimation only.
- This tool provides estimates and is not tax advice.
