import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { type ItemReorderEventDetail } from '@ionic/angular';
import {
  IonIcon,
  IonItem,
  IonItemSliding,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import type { Workout } from '../../../../../models';
import { IsEditingService } from '../../../services';

import { ExerciseItemComponent } from './exercise-item.component';

const ION_COMPONENTS = [
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonReorder,
  IonReorderGroup,
  IonItemSliding,
];

@Component({
  selector: 'app-workout-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, ExerciseItemComponent],
  styles: `
    .exercise-image {
      margin-right: 0.75rem;
    }
    .label-item {
      font-weight: 700;
    }
  `,
  template: `
    @let list = workout().list;
    <ion-list [inset]="true">
      <ion-reorder-group [disabled]="!isEditing()" (ionItemReorder)="handleReorder($event)">
        @if (list.length === 0) {
          <ion-item>
            <ion-label>
              <p>{{ 'tabs.training.workout.empty-list' | translate }}</p>
            </ion-label>
          </ion-item>
        } @else {
          @for (item of list; track item.name) {
            <ion-item-sliding [disabled]="!isEditing()">
              @if (item.type === 'HEADER') {
                <ion-item>
                  <ion-label class="label-item">{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'EXERCISE') {
                <ion-item [button]="!isEditing()">
                  <app-exercise-item [exerciseName]="item.name!" />
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'SPACER') {
                <ion-item>
                  <ion-icon aria-hidden="true" slot="start"></ion-icon>
                  <ion-label></ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              }
            </ion-item-sliding>
          }
        }
      </ion-reorder-group>
    </ion-list>
  `,
})
export class WorkoutListComponent {
  workout = input.required<Workout>();

  private editService = inject(IsEditingService);
  isEditing = this.editService.isEditing;
  workoutList = viewChild.required(IonList);

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;

    const items = [...this.editService.workoutListIds()];
    const moved = items.splice(from, 1)[0];
    items.splice(to, 0, moved);
    this.editService.workoutListIds.set(items);

    event.detail.complete();
  }
}
