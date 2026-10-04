import { vi } from 'vitest';
import { BridgeService } from './bridge.service.js';

const mocks = vi.hoisted(() => ({
  token: vi.fn(),
  bridge: vi.fn(),
  load: vi.fn(() => []),
  start: vi.fn(async () => {}),
  stop: vi.fn(async () => {}),
  on: vi.fn(),
}));

vi.mock('sse-to-mqtt-node', () => ({
  BodyType: { FormUrlEncoded: 'form' },
  BearerTokenProvider: class {
    constructor(options: unknown) {
      mocks.token(options);
    }
  },
  SseToMqttBridge: class {
    constructor(options: unknown) {
      mocks.bridge(options);
    }
    start = mocks.start;
    stop = mocks.stop;
    on = mocks.on;
  },
  loadConnectionsConfig: mocks.load,
}));

describe('BridgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BRIDGE_ENABLED', 'false');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('starts and shuts down offline without constructing external clients', async () => {
    const service = new BridgeService();
    await service.onModuleInit();
    await service.onApplicationShutdown();
    expect(mocks.token).not.toHaveBeenCalled();
    expect(mocks.bridge).not.toHaveBeenCalled();
    expect(mocks.stop).not.toHaveBeenCalled();
  });

  it('rejects an invalid enable flag', async () => {
    vi.stubEnv('BRIDGE_ENABLED', 'yes');
    await expect(new BridgeService().onModuleInit()).rejects.toThrow(
      'BRIDGE_ENABLED must be true or false',
    );
  });

  it('requires credentials when enabled', async () => {
    vi.stubEnv('BRIDGE_ENABLED', 'true');
    vi.stubEnv('AUTHENTICATION_URL', '');
    await expect(new BridgeService().onModuleInit()).rejects.toThrow(
      'Missing required environment variable AUTHENTICATION_URL',
    );
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('passes configuration to the bridge and starts and stops it', async () => {
    const env = {
      BRIDGE_ENABLED: 'true',
      AUTHENTICATION_URL: 'https://example.test/token',
      CLIENT_ID: 'test-client',
      CLIENT_SECRET: 'test-secret',
      CLIENT_SCOPE: 'ais',
      STREAMING_ENDPOINT: 'https://example.test/stream',
      MQTT_BROKER_URL: 'mqtt://localhost:1883',
      MQTT_TOPIC: 'ais',
      CONNECTIONS_CONFIG: 'config/connections.json',
    };
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    const service = new BridgeService();
    await service.onModuleInit();
    expect(mocks.token).toHaveBeenCalledWith(
      expect.objectContaining({
        url: env.AUTHENTICATION_URL,
        body: expect.objectContaining({
          client_id: env.CLIENT_ID,
          client_secret: env.CLIENT_SECRET,
        }),
      }),
    );
    expect(mocks.load).toHaveBeenCalledWith(env.CONNECTIONS_CONFIG);
    expect(mocks.bridge).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: env.STREAMING_ENDPOINT,
        mqtt: expect.objectContaining({
          brokerUrl: env.MQTT_BROKER_URL,
          baseTopic: env.MQTT_TOPIC,
        }),
      }),
    );
    expect(mocks.start).toHaveBeenCalledOnce();
    await service.onApplicationShutdown();
    expect(mocks.stop).toHaveBeenCalledOnce();
  });
});
