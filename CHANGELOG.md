# Changelog

All notable changes to this project are documented here.

## Unreleased

### Added

- Persistent 3D camera: explode distance, pitch, yaw, and orbit state survive reloads.
- Escape returns from a focused layer to the stacked view.
- The dashboard reopens on the last used tab.
- Ledger footer totals the hauled tonnage and shows how many receipts the current
  filters match.
- Unit tests for storage, camera preferences, lens filters, metric splitting, drill
  timing, ledger totals, seed data, and the layer catalogue.

### Changed

- Layer catalogue moved to `src/data/layers.ts` with a derived `LayerId` union.
- Lens filter classes extracted to `src/lib/lens.ts`; drill timing to `src/lib/drill.ts`.
- Sensor stream icon extracted into its own component; the ledger list is memoized.
- CI runs with read-only permissions and cancels superseded runs.
- Added Dependabot, `.editorconfig`, `.nvmrc`, `.gitattributes`, and `CONTRIBUTING.md`.

### Fixed

- Hotspot metrics keep values that contain colons instead of truncating them.
- Epoch serial no longer leaks a stray digit outside its highlight.
- Remaining non-existent Tailwind palette and border utilities replaced.
- Screen readers are told about new receipts, and controls have accessible names.

## 1.0.0 - 2026-10-30

### Added

- Isometric exploded layer stack with focus view, hotspots, and lens filters.
- Sensor stream configurator, confidence model, and drilling protocol.
- Chain-of-custody ledger with search, grade filter, and in-place reset.
- Synthesized audio with a persisted mute preference.
- UTC clock, diagnostics dialog, error boundary, and reduced-motion support.
- Apache-2.0 license, README, CI workflow, and Vitest suite.
