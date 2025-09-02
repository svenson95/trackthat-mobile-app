import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

@Component({
  selector: 'app-logs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, ContentContainerComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Logs </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Logs</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container name="Logs page"></app-content-container>
    </ion-content>
  `,
})
export class LogsPage {}
