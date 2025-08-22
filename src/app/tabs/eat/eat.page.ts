import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-eat-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Eat </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Eat</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container></app-content-container>
    </ion-content>
  `,
})
export class EatPage {}
