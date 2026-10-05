# Ignition Gateway, MQTT tags and ship map

This folder contains the saved Ignition projects. The AIS project is [projects/BarentsWatch](projects/BarentsWatch), titled **BarentsWatch-AIS**. Its [Map view](projects/BarentsWatch/com.inductiveautomation.perspective/views/Map/view.json) displays vessels from MQTT Engine tags. `samplequickstart` is a separate sample project and is not required for the AIS map.

## Start the Gateway

Configure `bridge/.env` first, including `MQTT_USERNAME` and `MQTT_PASSWORD`. With Docker running, execute from the repository root:

```sh
# Starts the broker and Gateway without starting the live AIS bridge.
docker compose up -d --build mqtt ignition
docker compose ps
docker compose logs -f ignition
```

Open [http://localhost:9088](http://localhost:9088) and complete first-run commissioning. Create your Gateway administrator account; this account is separate from the MQTT broker credentials. Compose sets `ACCEPT_IGNITION_EULA=Y` and starts Ignition 8.3.9. HTTPS is exposed on host port 9043.

To start live AIS publishing when ready:

```sh
docker compose up -d --build bridge
# Alternatively, start the whole stack with docker compose up -d --build.
```

## Use the files in this folder

Compose bind-mounts `./ignition/projects` at `/usr/local/bin/ignition/data/projects`. The `BarentsWatch` project directory, including `project.json` and the Perspective resources, is already in the Gateway's project location. Use it as a project folder; an individual `view.json` is not a Gateway backup to restore.

Open the existing **BarentsWatch** project in Designer (its display title is **BarentsWatch-AIS**). If it is missing, check that you started Compose from this repository and that `ignition/projects/BarentsWatch/project.json` exists. After adding project files while the Gateway is stopped, start it again; if needed, restart only Ignition with `docker compose restart ignition` and reopen Designer.

Designer saves update these host files directly. Preserve the project mount when changing Compose. Runtime state, installed modules, tag providers, MQTT Engine configuration, licensing data and logs belong to the `ignition-data` named volume. The project folder alone does not supply these settings; configure them on a fresh Gateway.

## Install MQTT Engine

The Compose image does not automatically install MQTT Engine. Download a Cirrus Link MQTT Engine module compatible with Ignition 8.3 from the [official module downloads](https://inductiveautomation.com/downloads/third-party-modules). In the Gateway module management page, install the `.modl` file and follow the installation prompts. Confirm MQTT Engine and Perspective are running and licensed or in an active trial. See the official [module installation instructions](https://www.sdk-docs.inductiveautomation.com/docs/8.3/getting-started/create-a-module/install-a-module/). Menu labels can differ by Gateway and module version.

Mosquitto already provides the broker in this stack; MQTT Engine receives its messages into Ignition.

## Connect MQTT Engine to Mosquitto

In the Gateway's **MQTT Engine → Settings → Servers** page, add an enabled server:

| Setting | Value |
| --- | --- |
| Name | `Local Mosquitto` |
| URL | `tcp://mqtt:1883` |
| Username | `MQTT_USERNAME` from `bridge/.env` |
| Password | `MQTT_PASSWORD` from `bridge/.env` |
| Server Set | An available set, also used by the AIS namespace |
| Client ID | Leave generated, or choose a unique ID |

Save and confirm the status is **Connected**. These fields are described in the [MQTT Engine configuration guide](https://docs.chariot.io/display/CLD80/ME%3A%2BConfiguration). If your module exposes a server-type option, select its third-party broker option.

Use `mqtt` as the hostname because MQTT Engine runs inside the Ignition container. `localhost` there refers to Ignition itself. Clients on your computer use host port 1883, or the `MQTT_HOST_PORT` override; that override does not change the container address.

## Convert AIS JSON into tags

The bridge publishes ordinary JSON. In **MQTT Engine → Settings → Namespaces → Custom**, add a namespace with:

| Setting | Value for the saved map |
| --- | --- |
| Name | `AIS` |
| Subscriptions | `ais/#` |
| Root Tag Folder | `AIS` |
| Tag Name | Leave blank |
| JSON Payload | Enabled |
| Server Set association, if offered | The set containing `Local Mosquitto` |

Save the namespace. Ensure MQTT Engine is enabled and this namespace is not filtered out on the server. If this Gateway only consumes AIS, disable its unused default Sparkplug B namespace. See [custom namespace JSON parsing](https://docs.chariot.io/display/CLD80/MQTT%2BEngine%2BCustom%2BNamespace) and [server-set associations](https://docs.chariot.io/display/CLD80/MQTT%2BEngine%2BSets%2C%2BServers%2C%2BNamespaces%2Band%2BFilters).

These values match the example's `MQTT_TOPIC=ais` and the saved map's source `[MQTT Engine]AIS/ais`. JSON properties become tags beneath each topic's vessel folder. For the current connection, expect this structure after messages arrive:

```text
[MQTT Engine]AIS/ais/Kristiansand NO-Hirtshals DK/<imoNumber>/latitude
[MQTT Engine]AIS/ais/Kristiansand NO-Hirtshals DK/<imoNumber>/longitude
[MQTT Engine]AIS/ais/Kristiansand NO-Hirtshals DK/<imoNumber>/msgtime
[MQTT Engine]AIS/ais/Kristiansand NO-Hirtshals DK/<imoNumber>/mmsi
[MQTT Engine]AIS/ais/Kristiansand NO-Hirtshals DK/<imoNumber>/name
```

`<imoNumber>` is replaced by the incoming vessel's IMO number. The bridge skips a message if that required topic field is missing. Tags appear as new publications arrive; the current bridge configuration does not retain MQTT messages, so an empty initial browse can be normal. Null JSON fields may not create tags until a value arrives.

If you change the MQTT base topic or root tag folder, update the namespace subscription and the Map script's `SOURCE` to match. Avoid adding an extra payload folder: the saved script expects exactly `route/vessel/field` below its source.

## Open Designer and use the tags

1. Download and install the **Designer Launcher** from the Gateway home page. Add `http://localhost:9088`, launch Designer and sign in with your Gateway account. Open the `BarentsWatch` project. See the official [Designer guide](https://docs.inductiveautomation.com/docs/8.3/platform/designer).
2. In the **Tag Browser**, select the **MQTT Engine** provider. Expand `AIS → ais → Kristiansand NO-Hirtshals DK → <imoNumber>`. Check that `latitude`, `longitude`, `mmsi` and `msgtime` have good quality and current values. The tags are supplied by the Gateway provider and can be browsed directly in Designer.
3. Open **Perspective → Views → Map**, then select its Map component. Its existing `custom.vessales` binding polls every second and reads `[MQTT Engine]AIS/ais`. The spelling `vessales` is the saved property name. The `props.layers.ui.marker` binding uses the resulting vessel markers; no manual tag bindings are needed for the supplied map.
4. To use a tag in another component, add a Tag binding to the relevant component property and select its full path from the Tag Browser. Save project changes in Designer.
5. Open [the Perspective map](http://localhost:9088/data/perspective/client/BarentsWatch/). The saved page configuration maps `/` to the `Map` view. The URL uses the project directory name `BarentsWatch`.

The map omits positions older than 300 seconds, future timestamps, invalid coordinates and vessels without MMSI. It can therefore show no markers even while older tag values remain visible. MQTT Engine and Perspective trials or licenses must remain active for the data and view to work.

## Check common problems

- **Broker disconnected:** confirm the `mqtt` container is healthy, the URL is `tcp://mqtt:1883`, and the Gateway credentials match `bridge/.env`. After changing MQTT credentials, recreate broker and bridge and update the Gateway server password.
- **Connected, but no AIS tags:** check the bridge is running, its configured filter has vessel traffic, the subscription matches `MQTT_TOPIC`, JSON Payload is enabled, and the namespace uses the correct server set. Look at `docker compose logs -f bridge` for connection errors; do not share credentials in logs or screenshots.
- **Tags present, map empty:** compare the actual tag paths with `[MQTT Engine]AIS/ais` and confirm position timestamps are less than five minutes old. A single string payload tag indicates JSON parsing is not configured as expected.
- **Project absent or view unavailable:** check the host project mount, the project is enabled, and the Perspective module is running.

Stop just the Gateway with `docker compose stop ignition`; start it again with `docker compose up -d ignition`. `docker compose down` removes stack containers while preserving host project files and named volumes. Avoid `docker compose down -v` unless you intend to erase Gateway runtime state and broker persistence.
