# NestJS + React learning project

The NestJS backend contains an optional AIS SSE-to-MQTT bridge. React currently shows the Vite starter screen and does not call the backend. This repository provides a local foundation for continued AI-assisted development.

## Start locally

Use Node 24 (`nvm use` if available) and npm. From this directory:

Setup update: `nest-js/.env` now holds the local settings directly, and `.env.example` has been deleted. Run `npm run setup`; skip the historical copy command retained below. On a fresh checkout, create `nest-js/.env` with `PORT=3000`, `BRIDGE_ENABLED=false` and `OBSERVE_ENABLED=false`. Supply integration credentials only when enabling them.

```sh
npm run setup
cp nest-js/.env.example nest-js/.env
```

Run these in separate terminals:

```sh
npm run dev:api
npm run dev:web
```

The backend serves `GET http://localhost:3000/` with `Hello World!`. Vite prints its local URL (normally `http://localhost:5173`). Default startup needs no live integrations. The apps retain separate lockfiles; there are no root dependencies to install.

## Verify changes

```sh
npm run check
```

This runs backend typecheck, lint, unit tests, HTTP e2e tests and build, plus frontend lint and build/typecheck. Tests disable bridge and telemetry even if your shell enables them. There is no frontend test runner yet. Root `build`, `lint` and `test` (backend tests) commands are also available.

For the compiled backend: `npm run build --prefix nest-js`, then `npm run start:prod --prefix nest-js`.

## Enable live integrations

In `nest-js/.env`, set `BRIDGE_ENABLED=true` and supply `AUTHENTICATION_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `STREAMING_ENDPOINT`, `MQTT_BROKER_URL` and `MQTT_TOPIC`. `CLIENT_SCOPE` defaults to `ais`; MQTT username/password are optional. `CONNECTIONS_CONFIG` defaults to `config/connections.json`, relative to the backend working directory. The provided polygons cover Flakk–Rørvik and Moss–Horten.

Bridge startup validates required values and starts the external clients; errors can prevent HTTP startup. Shutdown hooks stop the bridge. A working HTTP endpoint does not prove stream or broker health.

Telemetry is separately opt-in: set `OBSERVE_ENABLED=true`, `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET`. Process environment variables take precedence over `.env`. Only the backend entrypoint loads `.env`; tests and module imports do not. Do not commit `.env` or put credentials in the frontend.

## Continue with AI assistance

[AGENTS.md](AGENTS.md) supplies coding-agent instructions. [Architecture](docs/architecture.md) explains the current system and gaps. [Development guide](docs/development.md) provides a feature workflow and next steps. Give the assistant concrete behavior, acceptance criteria and constraints, and ask it to read these documents first.
