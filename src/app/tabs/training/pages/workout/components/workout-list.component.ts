import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { LoadingController, ModalController, type ItemReorderEventDetail } from '@ionic/angular';
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

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import type { GetWorkoutsDTO, ListItem, Workout, WorkoutListId } from '../../../../../models';
import { TextInputDialog } from '../../../../../shared';
import { IsEditingService, WorkoutsService } from '../../../services';

import { ExerciseItemComponent } from './exercise-item.component';

const ION_COMPONENTS = [
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
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
                <ion-item-options side="start">
                  <ion-item-option
                    color="medium"
                    (click)="openChangeNameModal(item.name!, item.listId)"
                  >
                    {{ 'tabs.training.workout.actions.change-text' | translate }}
                  </ion-item-option>
                </ion-item-options>

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
              <ion-item-options side="end">
                <ion-item-option color="danger" (click)="deleteItem(item)">
                  {{ 'general.delete' | translate }}
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          }
        }
      </ion-reorder-group>
    </ion-list>
  `,
})
export class WorkoutListComponent {
  workout = input.required<Workout>();
  save = output<string>();

  private editService = inject(IsEditingService);
  isEditing = this.editService.isEditing;
  private workoutsService = inject(WorkoutsService);

  workoutList = viewChild.required(IonList);
  modalCtrl = inject(ModalController);
  loadingCtrl = inject(LoadingController);
  translate = inject(TranslateService);

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;

    const items = [...this.editService.workoutListIds()];
    const moved = items.splice(from, 1)[0];
    items.splice(to, 0, moved);
    this.editService.workoutListIds.set(items);

    event.detail.complete();
  }

  async openChangeNameModal(item: string, listId: number): Promise<void> {
    try {
      await this.workoutList().closeSlidingItems();
      const modal = await this.modalCtrl.create({
        component: TextInputDialog,
        componentProps: {
          title: this.translate.instant('tabs.training.workout.actions.change-text'),
          label: 'Text',
          placeholder: 'Text',
          value: item,
        },
      });
      await modal.present();

      const { data } = await modal.onDidDismiss<string>();
      if (!data || data === item) return;

      const workouts = this.workoutsService.workoutsResource.value() ?? [];
      const updatedWorkouts = this.updatedWorkouts(workouts, listId, data);
      this.workoutsService.workoutsResource.set(updatedWorkouts);
      this.save.emit('tabs.training.workout.actions.change-text-process');
    } catch (error) {
      console.error('Change text modal could not be opened:', error);
    }
  }

  private updatedWorkouts(
    workouts: GetWorkoutsDTO,
    listId: WorkoutListId,
    data: string,
  ): GetWorkoutsDTO {
    return workouts.map((workout) => {
      if (workout.workoutId !== this.workout().workoutId) {
        return workout;
      }

      return {
        ...workout,
        list: workout.list.map((listItem) =>
          listItem.listId === listId
            ? {
                ...listItem,
                name: data,
              }
            : listItem,
        ),
      };
    });
  }

  async deleteItem(item: ListItem): Promise<void> {
    await this.workoutList().closeSlidingItems();
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workout.actions.delete-item-process'),
      spinner: 'circles',
    });
    await loading.present();

    const workout = this.workout();
    const updatedWorkout = {
      ...workout,
      list: workout.list.filter((listItem) => listItem.listId !== item.listId),
    };

    this.workoutsService.updateWorkoutList(updatedWorkout).subscribe({
      next: async () => {
        await loading.dismiss();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Unexpected fail during delete user.workoutId', err);
      },
    });
  }
}
