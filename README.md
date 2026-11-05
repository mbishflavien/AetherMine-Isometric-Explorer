# AetherMine Isometric Explorer

An interactive isometric "layer-cake" cross-section of a high-tech mine site. Explore the
geology layer by layer in a cyber-noir visual style, with ground-penetrating radar (GPR)
grids, a live dashboard, machine-learning-assisted mine planning, and a verifiable
chain-of-custody ledger.

## Features

- **Exploded 3D strata** — five survey layers stacked in CSS 3D, with adjustable exploded
  distance, yaw, pitch, and a frame-synced auto-orbit.
- **Focus inspection** — click any layer to zoom into a labelled cross-section with
  radiometric, GPR, and thermal lens filters plus interactive hotspots.
- **Sensor telemetry** — five spectra bands (LiDAR, hyperspectral, gamma-ray, GPR,
  EM-mag) that can be toggled and detuned; confidence and grade estimates update live.
- **Excavation protocol** — drill a target block, watch the progress telemetry, and get a
  new signed ledger receipt appended to the chain of custody.
- **Ledger tooling** — search by ID, hash, or custody party, filter by grade, and reset to
  the genesis state without reloading the page.
- **Sound** — synthesized click, sonar, laser, drill, and transaction cues with a mute
  preference that survives page loads.
- **Accessibility** — labelled controls, dialog semantics, keyboard dismissal, focus
  handling, and `prefers-reduced-motion` support.

## Keyboard and preferences

- `Escape` closes the diagnostics dialog and returns from a focused layer to the stack.
- `L` cycles through the lens filters.
- The 3D camera (explode distance, pitch, yaw, orbit) and the selected lens are stored
  in `localStorage` and restored on the next visit. Reset View writes the defaults back.
- The dashboard reopens on the last used tab, and the sound mute preference persists.
- Ledger receipts can copy their hash or export the filtered view as CSV, and the used
  grade filter is remembered between visits.

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000
```

Requires Node.js 20 or newer.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` / `npm run typecheck` | Run the TypeScript compiler without emitting |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run clean` | Remove `dist/` and stale server bundles |

## Architecture

```
src/
  App.tsx                 app shell, drill state machine, ledger state
  main.tsx                React root + error boundary
  types.ts                shared domain types
  data/seed.ts            initial streams, blocks, and ledger receipts
  data/layers.ts          layer catalogue and the LayerId union
  lib/
    geology.ts            confidence score and grade rules
    ledger.ts             receipt ids, hashes, timestamps, totals, sorting
    streams.ts            active band counts
    storage.ts            guarded localStorage reader/writer
    viewPrefs.ts          camera and lens preferences
    dashboardPrefs.ts     active dashboard tab
    ledgerPrefs.ts        grade filter and sort order
    lens.ts               lens modes and filter classes
    time.ts               UTC parsing and relative ages
    format.ts             hotspot metric splitting
    drill.ts              drill timing helpers
    csv.ts                ledger CSV export
    clipboard.ts          guarded clipboard writer
    *.test.ts             unit tests for the above
  hooks/useUtcClock.ts    one-second UTC clock
  components/
    MiningCanvas.tsx      isometric stack, focus view, 3D controls
    Dashboard.tsx         sensor console, ML metrics, ledger tab
    StreamIcon.tsx        per-band sensor icon
    DiagnosticsModal.tsx  in-app manual and keyboard handling
    AudioEngine.ts        Web Audio synthesizer singleton
    ErrorBoundary.tsx     render-failure fallback
```

## Testing

The pure logic lives in `src/lib` so it can be tested without a DOM:

```bash
npm test
```

CI runs the type checker, the tests, and a production build on every push to `main` and
every pull request.

## Environment

| Variable | Used for |
|---|---|
| `GEMINI_API_KEY` | Reserved for future Gemini features (unused today) |
| `APP_URL` | Public URL of the app when deployed |
| `DISABLE_HMR` | Set to `true` to disable HMR and file watching |

Both are optional for local development; see `.env.example`.

## Deployment

`npm run build` emits a static bundle in `dist/` that can be served by any static host.
Layer textures are imported through Vite, so the production build fingerprints and
serves them correctly.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a summary of notable changes.

## License

Apache-2.0. See [LICENSE](LICENSE).
