import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList } from '@ionic/angular';

import { LoginFormComponent } from './login-form.component';

const IONIC_COMPONENTS = [IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList];

@Component({
  selector: 'app-login-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, LoginFormComponent],
  styles: `
    .login-label {
      margin-block: 0.75rem;
    }
  `,
  template: `
    <ion-list [inset]="true" lines="none">
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Hallo</ion-label>
        </ion-item-divider>

        <ion-item>
          <ion-label class="login-label">
            <h2>Einloggen</h2>
            <p>Für die Anmeldung benötigst du ein Google-Konto.</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <app-login-form />
        </ion-item>
      </ion-item-group>
    </ion-list>
  `,
})
export class LoginBoxComponent {}
