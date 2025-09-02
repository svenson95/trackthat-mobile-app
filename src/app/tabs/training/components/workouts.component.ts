import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';

import type { Workouts } from '../models';

const EXAMPLE_DATA = {
  plans: [
    {
      id: 0,
      userId: 123,
      name: '5er Split Home',
      lastUpdated: 815350254,
    },
    {
      id: 1,
      userId: 123,
      name: '4er Split Home',
      lastUpdated: 1756804801,
    },
    {
      id: 3,
      userId: 123,
      name: 'Ganzkörper-Plan',
      lastUpdated: 1756804801,
    },
    {
      id: 2,
      userId: 123,
      name: '2er Split Home',
      lastUpdated: 1756804801,
    },
  ],
  sorting: [0, 1, 3, 2],
};

@Component({
  selector: 'app-workouts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonList, IonItem, IonIcon, IonLabel],
  styles: ``,
  template: `
    <ion-list>
      @for (plan of data.plans; track plan.name) {
        <ion-item>
          <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
          <ion-label>{{ plan.name }}</ion-label>
          <ion-icon aria-hidden="true" name="create-outline" slot="end"></ion-icon>
        </ion-item>
      }
    </ion-list>
  `,
})
export class WorkoutsComponent {
  data: Workouts = EXAMPLE_DATA;
}
