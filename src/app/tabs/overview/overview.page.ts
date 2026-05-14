import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../components';
import { AuthService, UserService } from '../../services';

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
        @if (isLoggedIn()) {
          <app-hello-box [user]="user()" />
        } @else {
          <app-login-box />
        }
      </app-content-container>
    </ion-content>
  `,
})
export class OverviewPage {
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;

  private userService = inject(UserService);
  user = this.userService.user;
}
