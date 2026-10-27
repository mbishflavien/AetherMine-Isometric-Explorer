# AetherMine Isometric Explorer

An interactive isometric "layer-cake" cross-section of a high-tech mine site.
Explore the geology layer by layer in a cyber-noir visual style, with ground-penetrating
radar (GPR) grids, a live dashboard and machine-learning-assisted mine planning.

## Features

- Isometric canvas rendering of the mine cross-section (`MiningCanvas`)
- Dashboard with site readouts (`Dashboard`)
- Generative ambient audio (`AudioEngine`)

## Getting started

```bash
npm install
cp .env.example .env    # optional
npm run dev             # http://localhost:3000
```

| Variable | Used for |
|---|---|
| `GEMINI_API_KEY` | Reserved for Gemini features (not used yet) |
| `APP_URL` | Public URL of the app when deployed |

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Motion.

## Scripts

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint`
