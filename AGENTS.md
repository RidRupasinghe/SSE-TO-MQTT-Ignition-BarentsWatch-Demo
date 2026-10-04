# Working in this repository

Read README.md and docs/architecture.md before changing behavior. This local learning repository has two independent npm projects: NestJS in `nest-js` and React/Vite in `vite-react`. Root scripts orchestrate them; preserve separate lockfiles. Do not migrate package managers or introduce workspaces without a task requiring it.

## Development rules

- Use Node 24 and npm. Run `npm run setup` when dependencies need installing; use committed lockfiles.
- Keep changes focused on the requested feature. Follow each app's existing style; do not reformat unrelated code.
- Preserve existing README content. Add new information without removing or replacing existing sections unless the user explicitly requests it.
- Backend uses NodeNext ESM, explicit `.js` suffixes on relative imports, Nest dependency injection and lifecycle hooks. Put new domain behavior in feature modules; controllers handle HTTP and services handle domain work.
- Frontend uses functional components, TypeScript and React Compiler. When introduced, keep requests in feature API modules and model loading, error and empty states. Avoid speculative routing, state libraries or manual memoization.
- External integrations are opt-in. Default development and checks must work without credentials or network services. Mock SSE/MQTT clients in tests; never enable live integrations for routine checks.
- Secrets belong in ignored `.env` files or the process environment. This project uses `nest-js/.env` directly and has no `.env.example`; preserve existing values when adding missing settings. Document configuration names and defaults without exposing secrets. Never expose server credentials through `VITE_*`, browser code, fixtures, logs or docs.
- Keep `GET /` returning `Hello World!` until explicitly asked to change that contract. React currently has no backend API client; do not assume integration.
- Add meaningful tests for behavior changes where test infrastructure exists. The frontend currently has no test runner; report missing coverage honestly.
- Run `npm run check` at the root before handoff. It checks backend types, lint, unit/e2e tests and build, then frontend lint and build/typecheck. Report failures and unrun checks accurately.
- Update setup and architecture docs when behavior changes. Finish with changes, verification and limitations. Do not commit, push, deploy or contact external services unless requested.

## Commands

Run `npm run dev:api` and `npm run dev:web` in separate terminals. Root `build`, `lint`, `test` and `check` scripts orchestrate checks. Scoped commands use `npm run <script> --prefix nest-js` or `--prefix vite-react`.

Use docs/development.md when planning the next feature.
