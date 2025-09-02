import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

@Component({
  selector: 'app-eat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, ContentContainerComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Eat </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">Eat</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container></app-content-container>
    </ion-content>
  `,
})
export class EatPage {}
