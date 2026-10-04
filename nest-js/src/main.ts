import { NestFactory } from '@nestjs/core';

// Load .env if present (Node's built-in loader; real environment variables take precedence)
try {
  process.loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error;
  }
}

// Import after loading .env so module configuration sees local settings.
const { AppModule, ObserveInstrument, observationEnabled } =
  await import('./app.module.js');

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    observationEnabled ? { instrument: ObserveInstrument } : {},
  );
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
