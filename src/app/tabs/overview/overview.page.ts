import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { LoginBoxComponent } from './components';

@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, ContentContainerComponent, LoginBoxComponent],
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
        <app-login-box />
      </app-content-container>
    </ion-content>
  `,
})
export class OverviewPage {}
