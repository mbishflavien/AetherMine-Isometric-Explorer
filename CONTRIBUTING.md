# Contributing

Thanks for taking a look at AetherMine. This is a small Vite + React + TypeScript app, and
contributions of any size are welcome.

## Development

```bash
npm install
npm run dev
```

Use Node.js 22 (see `.nvmrc`) or any version allowed by `engines.node`.

## Before opening a pull request

Run the same checks CI runs:

```bash
npm run lint   # tsc --noEmit, strict mode
npm test
npm run build
```

## Conventions

- Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `perf:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`, `a11y:`.
- Keep domain logic in `src/lib` so it stays testable without a DOM.
- New interactive controls need an accessible name and, where relevant, `aria-pressed`.
- Static content belongs in `src/data`; components should read from it rather than
  declare large literal arrays inline.
- Prefer existing helpers in `src/lib` over duplicating math in components.

## Reporting issues

Include the browser, the steps to reproduce, and what you expected to see. Screenshots of
the console panel help for rendering problems.
