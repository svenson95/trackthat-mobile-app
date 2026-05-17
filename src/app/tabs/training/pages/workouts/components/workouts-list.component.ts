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
import { TextInputDialogComponent } from '../../../../../shared';
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
            @for (workout of workouts; track workout.name) {
              <ion-item-sliding [disabled]="!isEditing()">
                <ion-item-options side="start">
                  <ion-item-option color="medium" (click)="changeWorkoutName(workout)">
                    {{ 'tabs.training.workouts.actions.change-name' | translate }}
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
                  <ion-item-option color="danger" (click)="deleteWorkout(workout.id)">
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
export class WorkoutsComponent {
  private loadingCtrl = inject(LoadingController);
  private service = inject(WorkoutsService);
  private translate = inject(TranslateService);
  private modalCtrl = inject(ModalController);

  workoutsList = viewChild.required(IonList);
  sortedWorkouts = this.service.sortedWorkouts;

  private editService = inject(IsEditingService);
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

  async changeWorkoutName(workout: PostWorkoutBody): Promise<void> {
    await this.workoutsList().closeSlidingItems();
    const modal = await this.modalCtrl.create({
      component: TextInputDialogComponent,
      componentProps: {
        title: this.translate.instant('tabs.training.workouts.actions.change-name'),
        label: 'Name',
        placeholder: 'Name',
        value: workout.name,
      },
      breakpoints: [0, 0.35],
      initialBreakpoint: 0.35,
    });
    await modal.present();

    const { data } = await modal.onDidDismiss<string>();
    if (!data || data === workout.name) return;

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.change-name-process'),
      spinner: 'circles',
    });
    await loading.present();

    this.service
      .changeWorkoutName({
        ...workout,
        name: data,
      })
      .subscribe({
        next: async () => await loading.dismiss(),
        error: async (err) => {
          await loading.dismiss();
          console.error('Unexpected fail during change name user.workoutId', err);
        },
      });
  }

  async deleteWorkout(id: string): Promise<void> {
    await this.workoutsList().closeSlidingItems();
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.delete'),
      spinner: 'circles',
    });
    await loading.present();

    this.service.deleteWorkout(id).subscribe({
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
