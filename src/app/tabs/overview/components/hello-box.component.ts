import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import type { GoogleUser } from '../../../models';

@Component({
  selector: 'app-hello-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ user().name }}</ion-card-title>
        <ion-card-subtitle>Hallo!</ion-card-subtitle>
      </ion-card-header>

      <ion-card-content> ... </ion-card-content>
    </ion-card>
  `,
})
export class HelloBoxComponent {
  user = input.required<GoogleUser>();
}
