import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  LoadingController,
  ModalController,
  type ItemReorderEventDetail,
} from '@ionic/angular';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import type { PostWorkoutBody, WorkoutDoc } from '../../../../core';
import { IonicUiService, TextInputDialog } from '../../../../shared';

import { WORKOUT_NAME_MAX_LENGTH } from '../../data';
import { WorkoutsService } from '../../data-access';

import { WorkoutsEditorState } from '../workouts-editor.state';

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
  selector: 'app-workouts-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, RouterLink],
  template: `
    <ion-list [inset]="true">
      <ion-reorder-group [disabled]="!isEditing()" (ionItemReorder)="handleReorder($event)">
        @if (isInitialLoading()) {
          <ion-item>
            <ion-label>
              <p>{{ 'tabs.training.workouts.loading' | translate }}</p>
            </ion-label>
          </ion-item>
        } @else if (hasError()) {
          <ion-item>
            <ion-label>
              <p>{{ 'general.error' | translate }}</p>
            </ion-label>
          </ion-item>
        } @else {
          @let workouts = displayedWorkouts();

          @if (workouts.length === 0) {
            <ion-item>
              <ion-label>
                <p>{{ 'tabs.training.workouts.no-plans' | translate }}</p>
              </ion-label>
            </ion-item>
          } @else {
            @for (workout of workouts; track workout.workoutId) {
              <ion-item-sliding #slidingItem [disabled]="!isEditing()">
                <ion-item-options side="start">
                  <ion-item-option
                    color="medium"
                    (click)="openChangeNameModal(workout, slidingItem)"
                  >
                    {{ 'tabs.training.workouts.actions.change-name.title' | translate }}
                  </ion-item-option>
                </ion-item-options>

                <ion-item
                  button
                  [routerLink]="isEditing() ? null : ['/tabs/training/', workout.workoutId]"
                  [detail]="!isEditing()"
                >
                  <ion-icon aria-hidden="true" name="list-outline" slot="start" />
                  <ion-label>{{ workout.name }}</ion-label>
                  <ion-reorder slot="end" />
                </ion-item>

                <ion-item-options side="end">
                  <ion-item-option color="danger" (click)="deleteWorkout(workout.id, slidingItem)">
                    {{ 'general.delete' | translate }}
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
export class WorkoutsListComponent {
  private readonly loadingCtrl = inject(LoadingController);
  private readonly modalCtrl = inject(ModalController);
  private readonly translate = inject(TranslateService);

  private readonly ionicUiService = inject(IonicUiService);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly editorState = inject(WorkoutsEditorState);

  public readonly workoutsList = viewChild.required(IonList);

  protected readonly isEditing = this.editorState.isEditing;

  protected readonly displayedWorkouts = computed<WorkoutDoc[]>(
    () => this.editorState.draft() ?? this.workoutsService.sortedWorkouts(),
  );

  protected readonly hasError = computed<boolean>(
    () => this.workoutsService.workoutsResource.status() === 'error',
  );

  protected readonly hasWorkoutsValue = computed<boolean>(
    () => this.workoutsService.workoutsResource.value() !== undefined,
  );

  protected readonly isInitialLoading = computed<boolean>(
    () => this.workoutsService.workoutsResource.status() === 'loading' && !this.hasWorkoutsValue(),
  );

  protected handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const workouts = this.editorState.draft();

    if (!workouts) {
      event.detail.complete();
      return;
    }

    const reorderedWorkouts = [...workouts];

    const [movedWorkout] = reorderedWorkouts.splice(event.detail.from, 1);
    reorderedWorkouts.splice(event.detail.to, 0, movedWorkout);

    this.editorState.update(
      reorderedWorkouts.map((workout, index) => ({
        ...workout,
        listId: index,
      })),
    );

    event.detail.complete();
  }

  protected async openChangeNameModal(
    workout: PostWorkoutBody,
    slidingItem: IonItemSliding,
  ): Promise<void> {
    try {
      await slidingItem.close();

      const modal = await this.modalCtrl.create({
        component: TextInputDialog,
        componentProps: {
          title: this.translate.instant('tabs.training.workouts.actions.change-name.title'),
          label: 'Name',
          placeholder: 'Name',
          value: workout.name,
          maxLength: WORKOUT_NAME_MAX_LENGTH,
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss<string>();

      if (!data || data === workout.name) {
        return;
      }

      const loading = await this.loadingCtrl.create({
        message: this.translate.instant('tabs.training.workouts.actions.change-name.process'),
        spinner: 'circles',
      });

      await loading.present();

      this.workoutsService
        .changeWorkoutName({
          ...workout,
          name: data,
        })
        .subscribe({
          next: async () => {
            await loading.dismiss();
          },
          error: async (error) => {
            await loading.dismiss();

            if (
              typeof error === 'object' &&
              error !== null &&
              'status' in error &&
              error.status === 409
            ) {
              await this.ionicUiService.showError(
                'tabs.training.workouts.actions.add-workout.already-exists',
              );
              return;
            }

            console.error('Unexpected fail during change name user.workoutId', error);

            await this.ionicUiService.showError('tabs.training.workouts.actions.change-name.error');
          },
        });
    } catch (error) {
      console.error('Change workout name modal could not be opened:', error);
    }
  }

  protected async deleteWorkout(id: string, slidingItem: IonItemSliding): Promise<void> {
    await slidingItem.close();

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.delete.process'),
      spinner: 'circles',
    });

    await loading.present();

    this.workoutsService.deleteWorkout(id).subscribe({
      next: async (filtered) => {
        await loading.dismiss();
        this.editorState.update(filtered);
      },
      error: async (error) => {
        console.error('Unexpected fail during delete user.workoutId', error);

        await loading.dismiss();

        await this.ionicUiService.showError('tabs.training.workouts.actions.delete.error');
      },
    });
  }
}
