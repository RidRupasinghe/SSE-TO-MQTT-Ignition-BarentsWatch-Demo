import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  BearerTokenProvider,
  BodyType,
  SseToMqttBridge,
  loadConnectionsConfig,
} from 'sse-to-mqtt-node';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

@Injectable()
export class BridgeService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(BridgeService.name);
  private bridge?: SseToMqttBridge;

  async onModuleInit() {
    const enabled = process.env.BRIDGE_ENABLED ?? 'false';
    if (enabled !== 'true' && enabled !== 'false') {
      throw new Error('BRIDGE_ENABLED must be true or false');
    }
    if (enabled === 'false') {
      this.logger.log('AIS-to-MQTT bridge disabled');
      return;
    }
    // BarentsWatch uses OAuth2 client credentials (https://id.barentswatch.no/connect/token, scope "ais")
    const tokenProvider = new BearerTokenProvider({
      url: requireEnv('AUTHENTICATION_URL'),
      bodyType: BodyType.FormUrlEncoded,
      body: {
        grant_type: 'client_credentials',
        client_id: requireEnv('CLIENT_ID'),
        client_secret: requireEnv('CLIENT_SECRET'),
        scope: process.env.CLIENT_SCOPE ?? 'ais',
      },
    });

    this.bridge = new SseToMqttBridge({
      // Connections without a `url` stream from this endpoint directly
      endpoint: requireEnv('STREAMING_ENDPOINT'),
      tokenProvider,
      mqtt: {
        brokerUrl: requireEnv('MQTT_BROKER_URL'),
        baseTopic: requireEnv('MQTT_TOPIC'),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      },
      // Adapt Nest's Logger (which has no `info`) to the library's logger interface
      logger: {
        debug: (message, ...meta) => this.logger.debug(message, ...meta),
        info: (message, ...meta) => this.logger.log(message, ...meta),
        warn: (message, ...meta) => this.logger.warn(message, ...meta),
        error: (message, ...meta) => this.logger.error(message, ...meta),
      },
      connections: loadConnectionsConfig(
        process.env.CONNECTIONS_CONFIG ?? 'config/connections.json',
      ),
    });

    // The AIS stream carries many messages per second, so per-message logs stay at debug level
    this.bridge.on('published', (connection, topic) =>
      this.logger.debug(`${connection} -> ${topic}`),
    );
    this.bridge.on('error', (error, connection) =>
      this.logger.error(`${connection}: ${error.message}`),
    );

    await this.bridge.start();
  }

  async onApplicationShutdown() {
    await this.bridge?.stop();
  }
}
