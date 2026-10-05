# BarentsWatch AIS to MQTT and Ignition

This repository streams BarentsWatch AIS vessel data to MQTT using the `sse-to-mqtt-node` CLI in `bridge`. Docker Compose also provides an authenticated Mosquitto broker and an Ignition Gateway with a saved Perspective ship-map project.

```sh
npm run setup
npm start
# Equivalent: npm run start:bridge
```

Starting the bridge connects to the configured live SSE source and MQTT broker. The package loads `bridge/.env` automatically, validates the connection configuration and handles SIGINT/SIGTERM shutdown. Run commands from the repository root using the scripts above, or run `npm start` inside `bridge`.

Local settings belong in the ignored `bridge/.env`. Saved stream filters and topic patterns are in `bridge/config/connections.json`. `CONNECTIONS_CONFIG=config/connections.json` in `.env` selects it. A process environment value overrides `.env`. CLI `--config` overrides `CONNECTIONS_CONFIG` if passed explicitly.

Required values: `STREAMING_ENDPOINT`, `MQTT_BROKER_URL`, `MQTT_TOPIC`; BarentsWatch OAuth also needs `AUTHENTICATION_URL`, `CLIENT_ID`, `CLIENT_SECRET` and `CLIENT_SCOPE=ais`. MQTT username/password are optional for the CLI, but required by this repository's Compose broker. `LOG_LEVEL` is optional (`info` by default; `debug`, `warn` and `error` are also supported). On a fresh checkout, use [bridge/.env.example](bridge/.env.example), which follows the local configuration with client IDs, secrets and MQTT credentials replaced by placeholders.

### Configure a fresh checkout

Use Node 24 and npm. From the repository root:

```sh
npm run setup
# Copy only if bridge/.env does not already exist; preserve existing credentials.
cp -n bridge/.env.example bridge/.env
```

Edit `bridge/.env` to replace the credential placeholders before starting the bridge. Set `MQTT_USERNAME` and `MQTT_PASSWORD` for your broker; Compose uses these same values for its local Mosquitto broker. Native `npm start` uses `MQTT_BROKER_URL` from `.env`; Compose overrides that URL with `mqtt://mqtt:1883`. For native use of the Compose broker, use `mqtt://localhost:1883` (or your configured host port). Keep `CONNECTIONS_CONFIG=config/connections.json` to use the existing saved filters and topic patterns.

Keep real credentials only in the ignored `bridge/.env`; the example is safe to share. `.env` loads from the bridge working directory, so root startup scripts select it with `--prefix bridge`. Shell environment values take precedence over the file.

### Get BarentsWatch credentials and AIS data

1. Register a BarentsWatch user or sign in at [MyPage / Min side](https://www.barentswatch.no/minside/).
2. Register a client and choose **AIS-client** for this bridge. Use the full issued client ID for `CLIENT_ID` and the client secret you create there for `CLIENT_SECRET`. See the official [application registration and authentication guide](https://developer.barentswatch.no/docs/appreg/).
3. Keep `CLIENT_SCOPE=ais` and `AUTHENTICATION_URL=https://id.barentswatch.no/connect/token`, as specified in the official [Live AIS API guide](https://developer.barentswatch.no/docs/AIS/live-ais-api/).
4. Use the streaming URL in the example with the existing `bridge/config/connections.json` filters. BarentsWatch documents the combined vessel stream at `https://live.ais.barentswatch.no/v1/combined` and filtered POST requests in its [AIS request examples](https://developer.barentswatch.no/docs/AIS/examples/). The saved connection definitions control the requests and MQTT topic patterns.
5. Run `npm run check` for offline configuration validation. When ready to connect to live services, run `npm start` for the native bridge or `docker compose up -d --build` for the full stack.

The CLI obtains and refreshes OAuth access tokens using the client-credentials flow; you do not need to copy an access token into `.env`. BarentsWatch supplies the AIS source and OAuth credentials. MQTT broker settings are configured separately by you.

`npm run check` validates the saved connection file and CLI availability without loading credentials or connecting to services. `npm run setup` installs only the bridge dependencies. No application build step is needed.

## Run the stack with Docker Compose

From the repository root, with Docker running and `bridge/.env` configured:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f bridge
```

This starts the bridge, Mosquitto and Ignition. The bridge waits for the broker healthcheck, connects to `mqtt://mqtt:1883`, uses the MQTT credentials from `bridge/.env`, and mounts `bridge/config` read-only at `/app/config`. Credentials are supplied at startup and excluded from the image build context. The CLI runs as the Node image's unprivileged user with an init process and a 20-second shutdown grace period.

The broker requires `MQTT_USERNAME` and `MQTT_PASSWORD`; anonymous clients are rejected. Its startup script hashes the password into a temporary password file inside the container. MQTT persistence uses the `mqtt-data` named volume, and the authenticated readiness probe publishes to `_healthcheck`.

| Client location | Broker address |
| --- | --- |
| Native bridge or another client on this computer | `mqtt://localhost:1883` |
| Bridge container | `mqtt://mqtt:1883` |
| MQTT Engine inside the Ignition container | `tcp://mqtt:1883` |

The host port binds only to loopback. Override it through the shell, for example `MQTT_HOST_PORT=1884 docker compose up -d --build`; `bridge/.env` does not supply Compose host-port interpolation. Container connections continue to use port 1883.

To watch AIS messages from inside the broker container:

```sh
docker compose exec mqtt sh -c 'mosquitto_sub -h localhost -u "$MQTT_USERNAME" -P "$MQTT_PASSWORD" -t "ais/#" -v'
```

Replace `ais/#` if you change `MQTT_TOPIC`. The saved connection currently filters Kristiansand–Hirtshals and publishes under `<MQTT_TOPIC>/<connection name>/<imoNumber>`. `{name}` in the topic pattern is the connection name; the vessel name is a field in the JSON payload.

After editing bridge settings, recreate the bridge with `docker compose up -d --force-recreate bridge`. After changing MQTT credentials, recreate both broker and bridge with `docker compose up -d --build --force-recreate mqtt bridge` and update the MQTT Engine server credentials in the Gateway. Avoid running the native and container bridges simultaneously unless duplicate publications are intended.

Stop the stack with `docker compose down`. Named volumes and host project files remain. Avoid `docker compose down -v` unless you intend to erase broker persistence and Gateway runtime state.

## Start Ignition and open the saved ship map

To start only the Gateway and its broker, without starting live BarentsWatch streaming:

```sh
docker compose up -d --build mqtt ignition
docker compose ps
docker compose logs -f ignition
```

Open [the Gateway](http://localhost:9088) and complete first-run commissioning, including an administrator account. Compose runs Ignition 8.3.9, exposes HTTPS on port 9043, and sets `ACCEPT_IGNITION_EULA=Y`, accepting the Ignition license when started.

The saved project is [ignition/projects/BarentsWatch](ignition/projects/BarentsWatch). Compose mounts `ignition/projects` at `/usr/local/bin/ignition/data/projects`, so the Gateway can load the project directly and Designer saves persist in this repository. Its title is **BarentsWatch-AIS**, its Map view is assigned to `/`, and the Perspective session URL is [the BarentsWatch map](http://localhost:9088/data/perspective/client/BarentsWatch/).

Follow the [Ignition setup guide](ignition/README.md) to install MQTT Engine, connect it to `tcp://mqtt:1883` with the MQTT credentials in `bridge/.env`, and configure JSON tags under `[MQTT Engine]AIS/ais`. Then launch Designer from the Gateway, open `BarentsWatch`, and select the **MQTT Engine** provider in the Tag Browser. The saved Map view reads these tags automatically.

Project resources are supplied by the folder mount; Gateway configuration, installed modules, tag providers and licensing state live in the `ignition-data` named volume. A fresh Gateway still needs the MQTT Engine and namespace setup described in the guide.

## Verify and continue development

```sh
npm run check
docker compose config --quiet
```

These checks validate the connection file, CLI availability and Compose configuration without starting services. Do not print resolved Compose configuration because it includes credentials. The bridge needs no build step.

[AGENTS.md](AGENTS.md) supplies repository instructions. [Architecture](docs/architecture.md) explains the system, and the [development guide](docs/development.md) describes the workflow.
