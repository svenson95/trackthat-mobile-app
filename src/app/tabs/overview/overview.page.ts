import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';
import { AuthService } from '../../services';

import { HelloBoxComponent, LoginBoxComponent } from './components';

@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, ContentContainerComponent, LoginBoxComponent, HelloBoxComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Überblick </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Überblick</ion-title>
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
  user = this.authService.user;
}
