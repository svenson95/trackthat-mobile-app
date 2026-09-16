import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add,
  bicycle,
  bicycleOutline,
  calendar,
  calendarOutline,
  chevronDown,
  ellipsisHorizontal,
  ellipsisVertical,
  listOutline,
  person,
  personOutline,
} from 'ionicons/icons';

import {
  AppInitializerService,
  AppUpdateService,
  AuthSessionService,
  BackendConnectionToastComponent,
  LanguageService,
} from './core';

const registerAppIcons = (): void => {
  addIcons({
    add,
    bicycle,
    bicycleOutline,
    calendar,
    calendarOutline,
    chevronDown,
    ellipsisHorizontal,
    ellipsisVertical,
    listOutline,
    person,
    personOutline,
  });
};

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet, BackendConnectionToastComponent],
  template: `
    <ion-app>
      <ion-router-outlet (activate)="onInitialRouteActivated()"></ion-router-outlet>

      <app-backend-connection-toast />
    </ion-app>
  `,
})
export class AppComponent {
  private readonly appInitializerService = inject(AppInitializerService);
  private readonly appUpdateService = inject(AppUpdateService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly languageService = inject(LanguageService);

  private routeActivated = false;

  constructor() {
    registerAppIcons();

    this.appUpdateService.watchForUpdates();
    this.authSessionService.verifySession();
    this.languageService.initialize();
  }

  onInitialRouteActivated(): void {
    if (this.routeActivated) {
      return;
    }

    this.routeActivated = true;
    this.appInitializerService.hideOverlay();
  }
}
