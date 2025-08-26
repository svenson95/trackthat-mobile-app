import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { importProvidersFrom, isDevMode } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { appRoutes } from './app.routes';

const BASE_PROVIDERS = [
  // provideZonelessChangeDetection(), // TODO: run migration
  provideRouter(
    appRoutes,
    withPreloading(PreloadAllModules),
    withComponentInputBinding(),
    withInMemoryScrolling({
      scrollPositionRestoration: 'enabled',
    }),
  ),
  provideHttpClient(withInterceptorsFromDi()),
];

const IONIC_ROUTE_REUSE_STRATEGY_PROVIDER = {
  provide: RouteReuseStrategy,
  useClass: IonicRouteStrategy,
};

const PWA_PROVIDER = provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerImmediately',
});

export const appConfig: ApplicationConfig = {
  providers: [
    ...BASE_PROVIDERS,
    PWA_PROVIDER,
    importProvidersFrom(IonicModule.forRoot()),
    IONIC_ROUTE_REUSE_STRATEGY_PROVIDER,
  ],
};
