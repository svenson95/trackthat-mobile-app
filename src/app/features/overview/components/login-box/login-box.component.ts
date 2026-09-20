import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList } from '@ionic/angular';

import { LoginFormComponent } from './login-form.component';

const IONIC_COMPONENTS = [IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList];

@Component({
  selector: 'app-login-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, LoginFormComponent],
  template: `
    <ion-list [inset]="true" lines="none">
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Hallo!</ion-label>
        </ion-item-divider>

        <ion-item>
          <ion-label>
            <h2>Einloggen</h2>
            <p>Melde dich an, um TrackThat zu verwenden.</p>
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
