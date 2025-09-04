import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';

import { WORKOUTS_TEMPLATES } from './workouts.data';

@Component({
  selector: 'app-workouts-templates',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonList, IonItem, IonIcon, IonLabel],
  styles: ``,
  template: `
    <ion-list>
      @for (plan of templates; track plan.name) {
        <ion-item>
          <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
          <ion-label>{{ plan.name }}</ion-label>
          <ion-icon aria-hidden="true" name="create-outline" slot="end"></ion-icon>
        </ion-item>
      }
    </ion-list>
  `,
})
export class WorkoutsTemplatesComponent {
  readonly templates = WORKOUTS_TEMPLATES;
}
