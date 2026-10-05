# Current architecture

## Standalone bridge

`bridge/package.json` runs the `sse-to-mqtt-node` CLI directly. The package is the only direct dependency and owns the streaming implementation. Node 24 is the repository runtime.

The package loads `.env` from the working directory, creates an OAuth client-credentials token provider when `AUTHENTICATION_URL` is present, reads `CONNECTIONS_CONFIG`, starts SSE connections and republishes to MQTT. It owns token refresh, retries, logging and SIGINT/SIGTERM shutdown. Process environment overrides `.env`; CLI `--config` overrides the environment config path.

Local credentials are stored in the ignored `bridge/.env`. `bridge/config/connections.json` contains the current Kristiansand–Hirtshals POST filter and topic pattern `{name}/{imoNumber}`. The package expands `{name}` to the connection name and `{imoNumber}` to the message field, beneath `MQTT_TOPIC`. BarentsWatch requires OAuth credentials and `CLIENT_SCOPE=ais`.

`bridge/.env.example` provides a sanitized version of the local configuration for fresh checkouts. Client IDs, secrets and MQTT credentials are placeholders; the real `.env` remains unchanged and ignored. BarentsWatch credentials come from registering an AIS-client on MyPage, as described in the [setup guide](../README.md#get-barentswatch-credentials-and-ais-data). MQTT authentication is optional in the CLI but required by the Compose broker.

`npm start` deliberately starts live streaming. Offline checks only validate the saved connection definitions and CLI availability. The runner has no compile step, application unit tests or HTTP e2e tests because it delegates behavior to the package.

## Repository tools

The bridge has its own committed lockfile. Root setup installs its dependencies; root check validates connection configuration and CLI availability offline. No build step is needed.

## Containers

Root `compose.yaml` runs the bridge and Mosquitto 2.0.22. The bridge image installs the locked package on Node 24 Alpine and runs its CLI directly as user `node`. Build context excludes credentials; Compose supplies `.env` at runtime and overrides the broker URL to `mqtt://mqtt:1883` and config path to `/app/config/connections.json`. The config directory is mounted read-only.

Mosquitto requires authentication inside the Compose network and publishes a localhost-only host port 1883 (configurable through `MQTT_HOST_PORT` in the shell or Compose interpolation environment), with stdout logs and a named persistence volume. An authenticated MQTT publish healthcheck gates bridge startup. Both containers restart unless stopped; the bridge receives signals through Docker init with a 20-second shutdown window.

Mosquitto rejects anonymous clients. Both services read `MQTT_USERNAME` and `MQTT_PASSWORD` from `bridge/.env`. The broker entrypoint creates a hashed, temporary password file at container startup, and the authenticated healthcheck gates bridge startup.

## Ignition Gateway

Compose runs Ignition 8.3.9 on host ports 9088 and 9043. The `ignition-data` named volume holds Gateway state and installed modules. The host directory `ignition/projects` overlays the Gateway projects directory, keeping Perspective map resources outside the image and container writable layer while allowing Designer saves.

Ignition depends on the healthy broker for startup ordering. MQTT Engine must be installed and configured inside the Gateway to connect to `tcp://mqtt:1883` using the shared broker credentials. A custom JSON namespace converts the bridge's non-Sparkplug AIS topics and payloads into tags for visualization.

The mounted `BarentsWatch` project contains a Perspective Map view routed to `/`. Its script browses `[MQTT Engine]AIS/ais` every second, groups vessel fields by route and IMO folder, and omits positions older than 300 seconds. The project mount does not configure MQTT Engine or supply Gateway tags; those require the [Gateway setup](../ignition/README.md).
