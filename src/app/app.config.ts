import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { inject, isDevMode, provideAppInitializer, type ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { serverStartupInterceptor, StartupService } from './core';

import { appRoutes } from './app.routes';

const APP_INITIALIZER_PROVIDER = provideAppInitializer(() => {
  inject(StartupService);
});

const ROUTER_PROVIDERS = [
  provideRouter(appRoutes, withPreloading(PreloadAllModules), withComponentInputBinding()),
];

const HTTP_PROVIDERS = [
  provideHttpClient(
    withXhr(),
    withInterceptors([serverStartupInterceptor]),
    withInterceptorsFromDi(),
  ),
];

const IONIC_PROVIDERS = [
  provideIonicAngular({
    mode: 'ios',
  }),
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
    APP_INITIALIZER_PROVIDER,
    ...ROUTER_PROVIDERS,
    ...HTTP_PROVIDERS,
    ...IONIC_PROVIDERS,
    ...PWA_PROVIDERS,
    ...I18N_PROVIDERS,
  ],
};
