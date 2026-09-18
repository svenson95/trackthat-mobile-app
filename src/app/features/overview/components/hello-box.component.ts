import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import type { UserDoc } from '../../../core';

const IONIC_COMPONENTS = [IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle];

@Component({
  selector: 'app-hello-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, TranslateModule],
  styles: `
    ion-card {
      margin: 16px;
      border-radius: var(--app-radius-1);
    }
  `,
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ user().name }}</ion-card-title>
        <ion-card-subtitle> {{ 'tabs.overview.hello' | translate }}! </ion-card-subtitle>
      </ion-card-header>

      <ion-card-content> ... </ion-card-content>
    </ion-card>
  `,
})
export class HelloBoxComponent {
  user = input.required<UserDoc>();
}
