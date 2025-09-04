import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';

import { WorkoutsService } from '../services';

@Component({
  selector: 'app-workouts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonList, IonItem, IonIcon, IonLabel, RouterLink],
  template: `
    <ion-list>
      @if (isLoading()) {
        <ion-item disabled>
          <ion-label>
            <p>loading ...</p>
          </ion-label>
        </ion-item>
      } @else if (hasError()) {
        <ion-item disabled>
          <ion-label>
            <p>Fehler aufgetreten</p>
          </ion-label>
        </ion-item>
      } @else {
        @let workouts = workoutsResource.value();
        @if (!workouts) {
          <ion-item disabled>
            <ion-label>
              <p>Keine aktiven Pläne</p>
            </ion-label>
          </ion-item>
        } @else {
          @for (workout of workouts; track workout.name) {
            <ion-item [routerLink]="['/tabs/training/', workout.workoutId]">
              <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
              <ion-label>{{ workout.name }}</ion-label>
            </ion-item>
          }
        }
      }
    </ion-list>
  `,
})
export class WorkoutsComponent {
  service = inject(WorkoutsService);
  workoutsResource = this.service.workoutsResource;
  isLoading = computed(() => this.workoutsResource.status() === 'loading');
  hasError = computed(() => this.workoutsResource.status() === 'error');
}
