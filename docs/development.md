# Continuing development

1. Read README.md, AGENTS.md and architecture notes before changes.
2. Keep bridge-specific behavior in the `sse-to-mqtt-node` package; this repository is its minimal runtime wrapper and deployment configuration.
3. Change saved connection filters or topics only for explicit requirements. Preserve existing credentials and do not print `.env` values.
4. Run `npm run check` for offline validation. Test networking changes with local SSE/OAuth and MQTT fixtures rather than live BarentsWatch credentials.
5. Update documentation and report check results. Bridge startup is live (`npm start`); no NestJS server, telemetry or build step is needed.
