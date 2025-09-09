import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';

import type { Workout } from '../../../../../models';

const ION_COMPONENTS = [IonList, IonItem, IonIcon, IonLabel, IonListHeader];

@Component({
  selector: 'app-workout-units',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS],
  template: `
    @let list = workout().list;
    @if (list.length === 0) {
      <ion-list [inset]="true">
        <ion-item disabled>
          <ion-label>
            <p>Keine Trainingseinheiten</p>
          </ion-label>
        </ion-item>
      </ion-list>
    } @else {
      <ion-list [inset]="true">
        @for (item of list; track item.name) {
          @if (item.type === 'HEADER') {
            <ion-list-header lines="inset">
              <ion-label>{{ item.name }}</ion-label>
            </ion-list-header>
          } @else if (item.type === 'EXERCISE') {
            <ion-item button>
              <ion-icon aria-hidden="true" slot="start"></ion-icon>
              <ion-label>{{ item.name }}</ion-label>
            </ion-item>
          } @else if (item.type === 'LABEL') {
            <ion-item button>
              <ion-icon aria-hidden="true" slot="start"></ion-icon>
              <ion-label>{{ item.name }}</ion-label>
            </ion-item>
          } @else if (item.type === 'SPACER') {
            <ion-item button>
              <ion-icon aria-hidden="true" slot="start"></ion-icon>
              <ion-label></ion-label>
            </ion-item>
          }
        }
      </ion-list>
    }
  `,
})
export class WorkoutUnitsComponent {
  workout = input.required<Workout>();
}
