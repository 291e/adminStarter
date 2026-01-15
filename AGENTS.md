# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds all application code. Key entry points: `src/main.tsx` (router + root render) and `src/app.tsx` (global providers).
- Feature areas live under `src/pages/`, `src/routes/sections/`, `src/layouts/`, `src/sections/`, and `src/components/`.
- Styling and theming live in `src/theme/` and `src/global.css`.
- Auth and API utilities live in `src/auth/` and `src/lib/` (notably `src/lib/axios.ts`).
- Static assets live in `public/` and `src/assets/`.

## Build, Test, and Development Commands
Use Yarn (repo is pinned to `yarn@1.22.22`).
- `yarn dev`: run Vite dev server.
- `yarn build`: type-check then build production bundle.
- `yarn start`: preview the built app.
- `yarn lint` / `yarn lint:fix`: run ESLint checks (and fixes).
- `yarn fm:check` / `yarn fm:fix`: run Prettier checks (and fixes).
- `yarn tsc:watch`: TypeScript watch mode without emit.

## Coding Style & Naming Conventions
- Formatting is enforced by Prettier (`tabWidth: 2`, `singleQuote: true`, `semi: true`, `printWidth: 100`).
- Linting uses ESLint (`eslint.config.mjs`); keep imports and hooks compliant.
- Follow existing naming: components in `PascalCase`, hooks as `useX`, files mostly `kebab-case` or `snake-case` as already used in the folder.

## Testing Guidelines
- No automated test runner is configured in this repo.
- Validate changes with `yarn lint`, `yarn fm:check`, and `yarn tsc:watch`.
- If you add tests, document the runner and use a consistent pattern like `*.test.tsx`.

## Commit & Pull Request Guidelines
- Recent commits are short, summary-style messages (often Korean, e.g., “수정”, “추가”, “채팅 개선”); keep messages concise and descriptive.
- PRs should include a brief summary, testing notes (commands run), and screenshots for UI changes.
- Link related issues/tickets when available.

## Environment & Configuration
- Create a `.env` at the repo root for `VITE_SERVER_URL` and optional provider keys (Firebase/Auth0/etc.).
- Keep secrets out of the repo; use `.env` and local overrides only.
