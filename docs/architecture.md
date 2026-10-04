# Current architecture

## Standalone bridge

`bridge/package.json` runs the `sse-to-mqtt-node` CLI directly. The package is the only direct dependency; no custom application source, NestJS, Observe or HTTP listener remains. Node 24 is the repository runtime.

The package loads `.env` from the working directory, creates an OAuth client-credentials token provider when `AUTHENTICATION_URL` is present, reads `CONNECTIONS_CONFIG`, starts SSE connections and republishes to MQTT. It owns token refresh, retries, logging and SIGINT/SIGTERM shutdown. Process environment overrides `.env`; CLI `--config` overrides the environment config path.

The previous environment file and connection JSON were moved byte for byte to `bridge/.env` and `bridge/config/connections.json`. The JSON retains POST filters for Flakk–Rørvik and Moss–Horten and topic pattern `{name}/{imoNumber}`. Credentials remain local and ignored by Git. BarentsWatch requires OAuth credentials and `CLIENT_SCOPE=ais`; broker authentication is optional. Old Nest-only variables in `.env` are ignored.

`npm start` deliberately starts live streaming. Offline checks only validate the saved connection definitions and CLI availability. The runner has no compile step, application unit tests or HTTP e2e tests because it delegates behavior to the package.

## Frontend

React 19, Vite 8 and TypeScript 6 with React Compiler remain unchanged. The screen is the Vite starter counter; there is no API client, domain UI or frontend test runner. There is no server endpoint for React to call and no browser path from MQTT yet.

## Repository tools

Independent npm projects retain separate lockfiles. Root setup installs both; root check validates bridge configuration/CLI, then frontend lint and build/typecheck. Root build/lint apply to React only.

## Containers

Root `compose.yaml` runs the bridge and Mosquitto 2.0.22. The bridge image installs the locked package on Node 24 Alpine and runs its CLI directly as user `node`. Build context excludes credentials; Compose supplies `.env` at runtime and overrides the broker URL to `mqtt://mqtt:1883`, MQTT credentials to empty, and config path to `/app/config/connections.json`. The config directory is mounted read-only.

Mosquitto uses an anonymous listener inside the Compose network, a localhost-only host port 1884 (configurable through `MQTT_HOST_PORT`), stdout logs and a named persistence volume. An MQTT publish healthcheck gates bridge startup. Both containers restart unless stopped; the bridge receives signals through Docker init with a 20-second shutdown window.
