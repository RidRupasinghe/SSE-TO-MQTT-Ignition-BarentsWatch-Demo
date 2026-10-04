# Ignition project files

The `projects` directory is bind-mounted into the Ignition container at `/usr/local/bin/ignition/data/projects`. Projects and resources saved from the Ignition Designer appear here on the host and survive container replacement.

Ignition Gateway runtime state, installed modules, configuration, licensing data, logs, and temporary files remain in the Docker-managed `ignition-data` volume. Do not delete that volume unless you intend to reset the Gateway.

Open the Gateway at `http://localhost:9088`. Install and configure MQTT Engine, then connect it to `tcp://mqtt:1883` with the `MQTT_USERNAME` and `MQTT_PASSWORD` stored in `bridge/.env`. Configure a custom namespace for the bridge topic and enable JSON payload parsing before building the ship map.
