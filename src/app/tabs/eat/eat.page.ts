import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../shared/components';

const IONIC_COMPONENTS = [IonContent, IonHeader, IonTitle, IonToolbar];

@Component({
  selector: 'app-eat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, TranslateModule, ContentContainerComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> {{ 'tabs.eat.tab-title' | translate }} </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large"> {{ 'tabs.eat.tab-title' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container></app-content-container>
    </ion-content>
  `,
})
export class EatPage {}
