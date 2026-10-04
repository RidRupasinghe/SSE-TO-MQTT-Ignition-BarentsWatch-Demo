# Current architecture and analysis

## Backend

NestJS 12, TypeScript 6 and NodeNext ESM. `main.ts` loads optional environment configuration before importing the root module, creates the HTTP app, enables shutdown hooks and listens on `PORT` (default 3000). Missing `.env` is allowed; other loading errors are surfaced.

`AppController` delegates `GET /` to `AppService`, which returns a plain string. There are no domain HTTP endpoints, authentication, database or persistence.

`BridgeService` owns the lifecycle of `sse-to-mqtt-node`. With `BRIDGE_ENABLED=true`, it creates an OAuth client-credentials token provider, loads connection definitions and starts the bridge. The library implements streaming and publishing. Nest logs publications at debug level and errors at error level; shutdown stops the bridge. Connection JSON contains POST filters for two geographic polygons and the topic pattern `{name}/{imoNumber}`.

Observe registration and instrumentation require `OBSERVE_ENABLED=true` and both credentials. Bridge and telemetry default to disabled.

## Frontend

React 19, Vite 8 and TypeScript 6, with React Compiler enabled. The screen is the starter counter. There are no routes, API layer, domain UI, auth or browser tests. No proxy or CORS configuration links React to NestJS, and no path delivers MQTT messages to the browser.

## Development foundation

Independent npm projects retain lockfiles and tools: backend uses Oxlint and Vitest; frontend uses ESLint. Root scripts orchestrate installation and checks without a workspace migration. Node 24 is the documented runtime.

Initial inspection found both builds, both linters and the starter backend unit test passing. The original HTTP e2e test failed because initialization required live credentials. Integrations now default to disabled; tests explicitly disable them. Mocked bridge lifecycle tests cover offline mode, invalid enable flags, missing configuration and start/stop delegation.

## Gaps and future decisions

- The HTTP root is a smoke check, not integration readiness. Bridge health and operational status have no API today.
- Required environment values are checked for presence, not full URL/config schema validity. Extend validation as domain requirements become clear.
- Enabled bridge startup precedes the HTTP listener. Decide whether HTTP must remain available during integration failures before changing that behavior.
- Introduce domain modules and API contracts with the first agreed product feature. Choose a browser delivery mechanism before live AIS UI work.
- Add frontend behavior tests with the first functional UI feature. Database, auth, deployment and shared contract packages remain product decisions.
