import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
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

import { AppInitializerService, backendConnectionInterceptor } from './core';

import { appRoutes } from './app.routes';

const APP_INITIALIZER_PROVIDER = provideAppInitializer(() => {
  inject(AppInitializerService);
});

const ROUTER_PROVIDER = provideRouter(
  appRoutes,
  withPreloading(PreloadAllModules),
  withComponentInputBinding(),
);

const HTTP_PROVIDER = provideHttpClient(
  withXhr(),
  withInterceptors([backendConnectionInterceptor]),
);

const IONIC_PROVIDERS = [
  provideIonicAngular({
    mode: 'ios',
  }),
  {
    provide: RouteReuseStrategy,
    useClass: IonicRouteStrategy,
  },
];

const PWA_PROVIDER = provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerImmediately',
});

const I18N_PROVIDER = provideTranslateService({
  fallbackLang: 'de',
  loader: provideTranslateHttpLoader({
    prefix: './assets/i18n/',
    suffix: '.json',
  }),
});

export const appConfig: ApplicationConfig = {
  providers: [
    APP_INITIALIZER_PROVIDER,
    ROUTER_PROVIDER,
    HTTP_PROVIDER,
    ...IONIC_PROVIDERS,
    PWA_PROVIDER,
    I18N_PROVIDER,
  ],
};
