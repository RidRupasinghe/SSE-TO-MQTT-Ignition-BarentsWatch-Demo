import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BridgeService } from './bridge.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeEnabled = process.env.OBSERVE_ENABLED ?? 'false';
if (observeEnabled !== 'true' && observeEnabled !== 'false') {
  throw new Error('OBSERVE_ENABLED must be true or false');
}
export const observationEnabled = observeEnabled === 'true';
if (
  observationEnabled &&
  (!process.env.OBSERVE_APP_KEY || !process.env.OBSERVE_APP_SECRET)
) {
  throw new Error(
    'OBSERVE_APP_KEY and OBSERVE_APP_SECRET are required when OBSERVE_ENABLED=true',
  );
}

@Module({
  imports: observationEnabled
    ? [
        ObserveModule.forRoot({
          appKey: process.env.OBSERVE_APP_KEY!,
          appSecret: process.env.OBSERVE_APP_SECRET!,
          serviceId: 'nest-js-demo',
        }),
      ]
    : [],
  controllers: [AppController],
  providers: [AppService, BridgeService],
})
export class AppModule {}
