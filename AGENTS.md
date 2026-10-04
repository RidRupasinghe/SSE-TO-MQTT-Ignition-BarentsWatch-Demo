# Working in this repository

Read README.md and docs/architecture.md before changing behavior. The application is a standalone SSE-to-MQTT runner in `bridge`. Preserve its package lockfile. Docker Compose also provides a Mosquitto broker.

## Development rules

- Use Node 24 and npm; `npm run setup` installs from committed lockfiles.
- Keep the bridge minimal. It runs the `sse-to-mqtt-node` package CLI directly; do not add NestJS, an HTTP server, telemetry, compilation or a custom streaming implementation without an explicit requirement.
- Preserve existing README content; add new information without removing sections unless explicitly requested. Clearly mark historical instructions when behavior changes.
- Preserve `bridge/config/connections.json` and existing `bridge/.env` values. `.env` stays ignored and no `.env.example` is used. Never print credentials or expose them in fixtures, logs or docs.
- Starting the bridge intentionally connects to live services. Routine checks must stay offline; do not use real credentials for verification unless requested. Use local fixtures or mocks for networking tests.
- The CLI reads `.env` from its working directory. Root startup scripts use `--prefix bridge` to select that directory. `CONNECTIONS_CONFIG` selects the JSON file; CLI `--config` overrides it.
- Keep changes focused and follow existing style. Update docs for changed commands/configuration. Run `npm run check` before handoff and report limitations accurately.
- Do not commit, push, deploy or contact live services unless requested.

## Commands

`npm start` or `npm run start:bridge` runs the bridge. `npm run setup` installs the locked bridge dependencies. `npm run check` validates bridge configuration and CLI availability offline; the bridge needs no build. Scoped commands use `--prefix bridge`. `docker compose up -d --build` runs the bridge and broker containers.
