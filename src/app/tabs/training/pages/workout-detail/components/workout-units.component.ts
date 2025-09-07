import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';

import type { Workout } from '../../../../../models';

const ION_COMPONENTS = [IonList, IonItem, IonIcon, IonLabel, IonListHeader];

@Component({
  selector: 'app-workout-units',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS],
  template: `
    @let units = workout().units;
    @if (units.length === 0) {
      <ion-list [inset]="true">
        <ion-item disabled>
          <ion-label>
            <p>Keine Trainingseinheiten</p>
          </ion-label>
        </ion-item>
      </ion-list>
    } @else {
      @for (unit of units; track unit.name) {
        <ion-list [inset]="true">
          <ion-list-header lines="inset">
            <ion-label>{{ unit.name }}</ion-label>
          </ion-list-header>

          @for (exercise of unit.exercises; track exercise.name) {
            <ion-item button>
              <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
              <ion-label>{{ exercise.name }}</ion-label>
            </ion-item>
          }
        </ion-list>
      }
    }
  `,
})
export class WorkoutUnitsComponent {
  workout = input.required<Workout>();
}
