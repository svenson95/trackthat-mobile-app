import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadingController, type ItemReorderEventDetail } from '@ionic/angular';
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';

import { SortingWorkoutsService, WorkoutsService } from '../services';

const ION_COMPONENTS = [
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonReorder,
  IonReorderGroup,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
];

@Component({
  selector: 'app-workouts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, RouterLink],
  template: `
    <ion-list [inset]="true">
      <ion-reorder-group [disabled]="!isEditing()" (ionItemReorder)="handleReorder($event)">
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
          @let workouts = sortedWorkouts();
          @if (workouts?.length === 0) {
            <ion-item disabled>
              <ion-label>
                <p>Keine aktiven Pläne</p>
              </ion-label>
            </ion-item>
          } @else {
            @for (workout of workouts; track workout.name) {
              <ion-item-sliding [disabled]="!isEditing()">
                <ion-item-options side="start">
                  <ion-item-option color="success">Name ändern</ion-item-option>
                </ion-item-options>

                <ion-item
                  button
                  [routerLink]="isEditing() ? null : ['/tabs/training/', workout.workoutId]"
                  [detail]="!isEditing()"
                >
                  <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
                  <ion-label>{{ workout.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>

                <ion-item-options side="end">
                  <ion-item-option color="danger" (click)="deleteWorkout(workout.id)">
                    Löschen
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            }
          }
        }
      </ion-reorder-group>
    </ion-list>
  `,
})
export class WorkoutsComponent {
  private loadingCtrl = inject(LoadingController);
  private service = inject(WorkoutsService);
  private editService = inject(SortingWorkoutsService);

  sortedWorkouts = this.service.sortedWorkouts;
  isEditing = this.editService.isEditing;

  isLoading = computed(() => this.service.workoutsResource.status() === 'loading');
  hasError = computed(() => this.service.workoutsResource.status() === 'error');

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;

    const workouts = [...this.editService.workoutIds()];
    const moved = workouts.splice(from, 1)[0];
    workouts.splice(to, 0, moved);
    this.editService.workoutIds.set(workouts);

    event.detail.complete();
  }

  async deleteWorkout(id: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Trainingsplan wird gelöscht ...',
      spinner: 'circles',
    });
    await loading.present();

    this.service.deleteWorkout(id).subscribe({
      next: () => {
        this.service.workoutsResource.update((list) => list!.filter((w) => w.id !== id));
        this.isEditing.set(false);
      },
      error: (err) => console.error('Unexpected delete workout fail: ', err),
    });

    await loading.dismiss();
  }
}
