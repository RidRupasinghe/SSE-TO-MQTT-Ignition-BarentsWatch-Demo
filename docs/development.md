# Continuing development

1. Read README.md, AGENTS.md and architecture notes before changes.
2. Keep bridge-specific behavior in the `sse-to-mqtt-node` package; this repository is its minimal runtime wrapper and deployment configuration.
3. Change saved connection filters or topics only for explicit requirements. Preserve existing credentials and do not print `.env` values.
4. Run `npm run check` for offline validation. Test networking changes with local SSE/OAuth and MQTT fixtures rather than live BarentsWatch credentials.
5. Update documentation and report check results. Bridge startup is live (`npm start`); no application build step is needed.

For a fresh checkout, copy `bridge/.env.example` to `bridge/.env` with `cp -n` so an existing environment file is not overwritten. Replace the BarentsWatch and MQTT credential placeholders locally. See the [BarentsWatch credential guide](../README.md#get-barentswatch-credentials-and-ais-data) for AIS-client registration. When updating the example, preserve useful non-secret settings and replace client IDs, secrets and MQTT credentials with placeholders. Never copy real credentials into tracked files.
