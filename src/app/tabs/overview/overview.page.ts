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

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">Überblick</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container>
        @let data = user();
        @if (isLoggedIn() && data !== undefined) {
          <app-hello-box [user]="data" />
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
