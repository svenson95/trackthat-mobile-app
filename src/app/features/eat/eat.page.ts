import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

const IONIC_COMPONENTS = [IonContent, IonHeader, IonTitle, IonToolbar];

@Component({
  selector: 'app-eat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, TranslateModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> {{ 'tabs.eat.tab-title' | translate }} </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large"> {{ 'tabs.eat.tab-title' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="page-content"></div>
    </ion-content>
  `,
})
export class EatPage {}
