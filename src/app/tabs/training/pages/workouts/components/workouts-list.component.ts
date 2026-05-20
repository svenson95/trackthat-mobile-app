import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
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

import type { PostWorkoutBody } from '../../../../../models';
import { HelperService } from '../../../../../services';
import { TextInputDialog } from '../../../../../shared';
import { IsEditingService, WorkoutsService } from '../../../services';

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
        @if (isLoading()) {
          <ion-item>
            <ion-label>
              <p>{{ 'general.loading' | translate }} ...</p>
            </ion-label>
          </ion-item>
        } @else if (hasError()) {
          <ion-item>
            <ion-label>
              <p>{{ 'general.error' | translate }}</p>
            </ion-label>
          </ion-item>
        } @else {
          @let workouts = sortedWorkouts();
          @if (workouts?.length === 0) {
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
                  <ion-icon aria-hidden="true" name="list-outline" slot="start"></ion-icon>
                  <ion-label>{{ workout.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
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

  readonly workoutsList = viewChild.required(IonList);

  private readonly helperService = inject(HelperService);
  private readonly workoutsService = inject(WorkoutsService);
  readonly sortedWorkouts = this.workoutsService.sortedWorkouts;

  private readonly editService = inject(IsEditingService);
  readonly isEditing = this.editService.isEditing;

  readonly isLoading = computed(() => this.workoutsService.workoutsResource.status() === 'loading');
  readonly hasError = computed(() => this.workoutsService.workoutsResource.status() === 'error');

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;

    const workouts = [...this.editService.editedWorkouts()!];
    const moved = workouts.splice(from, 1)[0];
    workouts.splice(to, 0, moved);
    this.editService.editedWorkouts.set(
      workouts.map((workout, index) => ({
        ...workout,
        listId: index,
      })),
    );

    event.detail.complete();
  }

  async openChangeNameModal(workout: PostWorkoutBody, slidingItem: IonItemSliding): Promise<void> {
    try {
      await slidingItem.close();
      const modal = await this.modalCtrl.create({
        component: TextInputDialog,
        componentProps: {
          title: this.translate.instant('tabs.training.workouts.actions.change-name.title'),
          label: 'Name',
          placeholder: 'Name',
          value: workout.name,
        },
      });
      await modal.present();

      const { data } = await modal.onDidDismiss<string>();
      if (!data || data === workout.name) return;

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
          next: async () => await loading.dismiss(),
          error: async (err) => {
            console.error('Unexpected fail during change name user.workoutId', err);
            await loading.dismiss();
            await this.helperService.showError('tabs.training.workouts.actions.change-name.error');
          },
        });
    } catch (error) {
      console.error('Add workout modal could not be opened:', error);
    }
  }

  async deleteWorkout(id: string, slidingItem: IonItemSliding): Promise<void> {
    await slidingItem.close();
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.delete.process'),
      spinner: 'circles',
    });
    await loading.present();

    this.workoutsService.deleteWorkout(id).subscribe({
      next: async (filtered) => {
        await loading.dismiss();
        this.editService.editedWorkouts.set(filtered);
      },
      error: async (err) => {
        console.error('Unexpected fail during delete user.workoutId', err);
        await loading.dismiss();
        this.editService.editedWorkouts.set(null);
        await this.helperService.showError('tabs.training.workouts.actions.delete.error');
      },
    });
  }
}
