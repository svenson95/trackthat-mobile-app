import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../shared/components';
import { AuthService, UserService } from '../../shared/services';

import { HelloBoxComponent, LoginBoxComponent } from './components';

@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    TranslateModule,
    ContentContainerComponent,
    LoginBoxComponent,
    HelloBoxComponent,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> {{ 'tabs.overview.tab-title' | translate }} </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">{{ 'tabs.overview.tab-title' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container>
        @let user = userData();
        @if (isLoggedIn() && user) {
          <app-hello-box [user]="user" />
        } @else {
          <app-login-box />
        }
      </app-content-container>
    </ion-content>
  `,
})
export class OverviewPage {
  private readonly authService = inject(AuthService);
  readonly isLoggedIn = this.authService.isLoggedIn;

  private readonly userService = inject(UserService);
  readonly userData = this.userService.userData;
}
