import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import type { UserDoc } from '../../../shared/models';

@Component({
  selector: 'app-hello-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, TranslateModule],
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
