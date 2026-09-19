import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { AuthService, UserService } from '../../core';

import { HelloBoxComponent, LoginBoxComponent } from './components';

const IONIC_COMPONENTS = [IonContent, IonHeader, IonTitle, IonToolbar];

@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, TranslateModule, LoginBoxComponent, HelloBoxComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> {{ 'tabs.overview.tab-title' | translate }} </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ 'tabs.overview.tab-title' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="page-content">
        @let user = userData();
        @if (isLoggedIn() && user) {
          <app-hello-box [user]="user" />
        } @else {
          <app-login-box />
        }
      </div>
    </ion-content>
  `,
})
export class OverviewPage {
  private readonly authService = inject(AuthService);
  readonly isLoggedIn = this.authService.isLoggedIn;

  private readonly userService = inject(UserService);
  readonly userData = this.userService.userData;
}
