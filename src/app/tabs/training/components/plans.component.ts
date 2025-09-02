import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';

import type { TrainingPlan } from '../models';

@Component({
  selector: 'app-training-plans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonList, IonItem, IonIcon, IonLabel],
  styles: ``,
  template: `
    <ion-list>
      @for (plan of plans; track plan.name) {
        <ion-item>
          <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
          <ion-label>{{ plan.name }}</ion-label>
          <ion-icon aria-hidden="true" name="create-outline" slot="end"></ion-icon>
        </ion-item>
      }
    </ion-list>
  `,
})
export class TrainingPlansComponent {
  plans: Array<TrainingPlan> = [
    {
      name: '5er Split Home',
      lastUpdated: 815350254,
      sortIndex: 0,
    },
    {
      name: '4er Split Home',
      lastUpdated: 1756804801,
      sortIndex: 1,
    },
    {
      name: 'Ganzkörper-Plan',
      lastUpdated: 1756804801,
      sortIndex: 3,
    },
    {
      name: '2er Split Home',
      lastUpdated: 1756804801,
      sortIndex: 2,
    },
  ];
}
