# BarentsWatch SSE-to-MQTT runner

This directory runs the `sse-to-mqtt-node` CLI directly. The package provides environment loading, OAuth token handling, connection validation, streaming reconnection, MQTT publishing, logging and signal shutdown. There is no application build step.

## Setup and start

Use Node 24 and npm. From this directory:

```sh
npm ci
# Copy only if .env does not already exist.
cp -n .env.example .env
# Replace credential placeholders before starting.
npm start
```

The [example](.env.example) follows the local configuration with client IDs, secrets and MQTT credentials replaced by placeholders. Keep real credentials in the ignored `.env` and preserve existing values. Follow the [BarentsWatch credential instructions](../README.md#get-barentswatch-credentials-and-ais-data) to register an AIS-client.

Set `AUTHENTICATION_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `CLIENT_SCOPE=ais`, `STREAMING_ENDPOINT`, `MQTT_BROKER_URL` and `MQTT_TOPIC`. `CONNECTIONS_CONFIG=config/connections.json` selects the saved stream filters. Process environment values override `.env`; CLI `--config` overrides the config path. Optional CLI settings include `MQTT_USERNAME`, `MQTT_PASSWORD` and `LOG_LEVEL` (default `info`). Both MQTT credentials are required by this repository's Compose broker.

Starting the bridge connects to live services. Stop it with Ctrl+C. From the repository root, `npm start` or `npm run start:bridge` selects this working directory automatically.

## Offline verification

`npm run check` validates `config/connections.json` and invokes CLI help without connecting to services. The committed lockfile supplies the installed dependency versions.

## Docker Compose and Ignition

From the repository root, `docker compose up -d --build` starts the bridge, authenticated Mosquitto broker and Ignition Gateway. The bridge container uses `mqtt://mqtt:1883`, reads credentials from `.env` and mounts `config` read-only. Native startup instead uses the broker URL in `.env`.

See the [root README](../README.md#run-the-stack-with-docker-compose) for lifecycle and broker commands, the [Ignition guide](../ignition/README.md) for the saved map and MQTT tags, and [architecture](../docs/architecture.md) for the design.
