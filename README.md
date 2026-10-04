## Current setup: standalone SSE-to-MQTT bridge

The NestJS server has been removed. The Node application is now `bridge`, a minimal npm runner for the existing `sse-to-mqtt-node` CLI. It has one direct dependency, no custom server, no HTTP listener, no TypeScript build and no telemetry integration.

```sh
npm run setup
npm start
# Equivalent: npm run start:bridge
```

Starting the bridge connects to the configured live SSE source and MQTT broker. The package loads `bridge/.env` automatically, validates the connection configuration and handles SIGINT/SIGTERM shutdown. Run commands from the repository root using the scripts above, or run `npm start` inside `bridge`.

The previous `.env` has been moved unchanged to `bridge/.env`; its existing credentials are preserved and it remains ignored by Git. The connection file has been moved unchanged to `bridge/config/connections.json`. `CONNECTIONS_CONFIG=config/connections.json` in `.env` selects it. A process environment value overrides `.env`. CLI `--config` overrides `CONNECTIONS_CONFIG` if passed explicitly.

Required values: `STREAMING_ENDPOINT`, `MQTT_BROKER_URL`, `MQTT_TOPIC`; BarentsWatch OAuth also needs `AUTHENTICATION_URL`, `CLIENT_ID`, `CLIENT_SECRET` and `CLIENT_SCOPE=ais`. MQTT username/password remain optional. `LOG_LEVEL` is optional (`info` by default; `debug`, `warn` and `error` are also supported). No `.env.example` is used. On a fresh checkout, create `bridge/.env` with these values and `CONNECTIONS_CONFIG=config/connections.json`.

Old `PORT`, `BRIDGE_ENABLED` and `OBSERVE_*` settings may remain in the preserved `.env`; the CLI ignores them. `npm start` always runs the bridge. No Observe credentials are needed.

`npm run check` validates the saved connection file and CLI availability without loading credentials or connecting to services, then runs frontend lint and build/typecheck. `npm run build` and `npm run lint` apply to React only. React remains independent and starts with `npm run dev:web`.

### Historical foundation notes

The README content below is preserved for reference. Its NestJS, HTTP, Observe, `dev:api`, backend test/build and `.env.example` instructions are superseded by the standalone setup above.

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

## Run the bridge and MQTT broker with Docker Compose

From the repository root, with Docker running:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f bridge
```

Compose builds the Node bridge and starts a Mosquitto broker. The bridge waits for the broker healthcheck, uses `mqtt://mqtt:1883` on the Compose network, and receives the existing BarentsWatch credentials and topic from `bridge/.env`. Its local broker username/password are cleared because this development broker permits anonymous clients. These container overrides do not change `.env` or native `npm start` behavior.

Connection configuration is mounted read-only at `/app/config`, with `CONNECTIONS_CONFIG=/app/config/connections.json`. Credentials are supplied at container startup and excluded from the image build context. The CLI runs directly as the Node image's unprivileged user, with an init process and a 20-second shutdown grace period.

The broker is reachable from this computer at `mqtt://localhost:1884` (override with `MQTT_HOST_PORT`); its published port binds only to host loopback. Its container listener permits anonymous clients on the Compose network. MQTT persistence uses the `mqtt-data` named volume, and broker logs go to container stdout. The readiness probe publishes to `_healthcheck`; AIS messages use your existing `MQTT_TOPIC` and connection topic patterns.

To watch all topics from inside the broker container:

```sh
docker compose exec mqtt mosquitto_sub -h localhost -t '#' -v
```

Stop the stack with `docker compose down`. Broker data remains in its volume. To rebuild after dependency changes, rerun `docker compose up -d --build`. After editing `.env`, recreate the bridge with `docker compose up -d --force-recreate bridge`. Do not run the native bridge simultaneously unless duplicate publications are intended.

Validate Compose without starting services using `docker compose config --quiet`. Avoid printing the resolved Compose configuration because it includes environment credentials.
