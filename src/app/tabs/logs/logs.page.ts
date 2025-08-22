import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-logs',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Logs </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Logs</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container name="Logs page"></app-content-container>
    </ion-content>
  `,
})
export class LogsPage {
  constructor() {}
}
