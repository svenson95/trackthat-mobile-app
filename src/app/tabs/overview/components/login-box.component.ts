import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { LoginForm } from '../forms';

@Component({
  selector: 'app-login-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, LoginForm],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Einloggen</ion-card-title>
        <ion-card-subtitle>Hallo!</ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        <app-login-form />
      </ion-card-content>
    </ion-card>
  `,
})
export class LoginBoxComponent {}
