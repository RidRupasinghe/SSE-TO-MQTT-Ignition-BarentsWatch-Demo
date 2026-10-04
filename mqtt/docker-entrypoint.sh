#!/bin/sh
set -eu

: "${MQTT_USERNAME:?MQTT_USERNAME is required}"
: "${MQTT_PASSWORD:?MQTT_PASSWORD is required}"

password_file=/tmp/mosquitto.passwd
umask 077
printf '%s:%s\n' "$MQTT_USERNAME" "$MQTT_PASSWORD" > "$password_file"
mosquitto_passwd -U "$password_file"
chown mosquitto:mosquitto "$password_file"

exec mosquitto -c /mosquitto/config/mosquitto.conf
