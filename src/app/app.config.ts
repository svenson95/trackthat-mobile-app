import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { importProvidersFrom, isDevMode } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { appRoutes } from './app.routes';

const ROUTER_PROVIDERS = [
  provideRouter(appRoutes, withPreloading(PreloadAllModules), withComponentInputBinding()),
];

const HTTP_PROVIDERS = [provideHttpClient(withInterceptorsFromDi())];

const IONIC_PROVIDERS = [
  importProvidersFrom(IonicModule.forRoot()),
  {
    provide: RouteReuseStrategy,
    useClass: IonicRouteStrategy,
  },
];

const PWA_PROVIDERS = [
  provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),
    registrationStrategy: 'registerImmediately',
  }),
];

const I18N_PROVIDERS = [
  provideTranslateService({
    fallbackLang: 'de',
    loader: provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
  }),
];

export const appConfig: ApplicationConfig = {
  providers: [
    ...ROUTER_PROVIDERS,
    ...HTTP_PROVIDERS,
    ...IONIC_PROVIDERS,
    ...PWA_PROVIDERS,
    ...I18N_PROVIDERS,
  ],
};
