import { HttpClientModule } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

const PWA_MODULE = ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000',
});

const IONIC_ROUTE_REUSE_STRATEGY_PROVIDER = {
  provide: RouteReuseStrategy,
  useClass: IonicRouteStrategy,
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, PWA_MODULE, IonicModule.forRoot(), AppRoutingModule],
  providers: [IONIC_ROUTE_REUSE_STRATEGY_PROVIDER],
  bootstrap: [AppComponent],
})
export class AppModule {}
