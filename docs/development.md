# Continuing development

## Feature workflow

1. Read README.md, AGENTS.md and architecture notes. Inspect relevant source and tests.
2. State user-visible behavior and acceptance criteria. Identify HTTP, bridge lifecycle and configuration changes.
3. Implement a focused change with existing tools. Keep credentials server-side and mock external clients in tests.
4. Add meaningful behavior tests and run `npm run check`. Inspect the running UI for frontend changes; lint/build alone do not verify interactions.
5. Update examples and docs. Report changes, check results and unresolved gaps.

## Suggested next increments

1. Agree the product goal: bridge administration, live vessel display or another learning feature. Define the first useful UI and its data source.
2. Add a health/status endpoint with a documented response and HTTP tests. Distinguish app liveness from stream/broker readiness.
3. Connect one React feature through a Vite development proxy and a small typed API module. Add loading, success and failure states with Vitest and React Testing Library tests.
4. Decide streaming transport, persistence, auth and deployment from actual requirements.

## Example AI task

> Read AGENTS.md and docs/architecture.md. Add a backend liveness endpoint and React status panel. Keep GET / compatible. Use a Vite development proxy, keep credentials on the server, and provide loading and failure states. Add HTTP and frontend behavior tests, update setup docs and run npm run check. Do not enable live AIS/MQTT or deploy.

Prefer concrete feature tasks over unspecified production architecture. Record significant agreed tradeoffs in docs when relevant.
