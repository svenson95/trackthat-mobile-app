import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPopover,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  ContentContainerComponent,
  HelperService,
  TextInputDialog,
  WORKOUT_LIST_ITEM_HEADER,
  WORKOUT_LIST_ITEM_SPACER,
  type ListItem,
  type ListItemExercise,
  type WorkoutDoc,
} from '../../../../shared';
import { IsEditingService, WorkoutsService } from '../../services';

import { WorkoutListComponent } from './components';
import { AddExerciseDialog } from './dialogs';

const ION_COMPONENTS = [
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPopover,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
];

@Component({
  selector: 'app-workout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ION_COMPONENTS,
    FormsModule,
    TranslateModule,
    ContentContainerComponent,
    WorkoutListComponent,
  ],
  styles: `
    .workout-skeleton-list {
      margin-top: 1rem;
    }

    .rounded-skeleton {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      margin-inline-end: 1rem;
    }

    .label-skeleton {
      height: 1rem;
      border-radius: 999px;
    }

    .state-text {
      padding: 1rem;
      text-align: center;
    }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (isEditing()) {
            <ion-button (click)="abortEditing()">
              {{ 'general.abort' | translate }}
            </ion-button>
          } @else {
            <ion-back-button
              [text]="'tabs.training.workout.plans' | translate"
              defaultHref="/tabs/training"
            ></ion-back-button>
          }
        </ion-buttons>

        <ion-title>
          {{ titleTrimmed() }}
        </ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button
              (click)="saveEdit({ message: 'tabs.training.workout.actions.update-list.process' })"
            >
              {{ 'general.save' | translate }}
            </ion-button>
          } @else {
            <ion-button (click)="presentPopover($event)">
              <ion-icon
                slot="icon-only"
                ios="ellipsis-horizontal"
                md="ellipsis-vertical"
              ></ion-icon>
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <app-content-container>
        @if (isLoading()) {
          <ion-list inset="true" class="workout-skeleton-list">
            @for (item of skeletonItems; track $index) {
              <ion-item lines="full">
                @if (item.type === 'EXERCISE') {
                  <ion-skeleton-text
                    animated
                    slot="start"
                    class="rounded-skeleton"
                  ></ion-skeleton-text>
                }

                <ion-label>
                  <ion-skeleton-text
                    animated
                    class="label-skeleton"
                    [style.width]="item.width"
                  ></ion-skeleton-text>
                </ion-label>
              </ion-item>
            }
          </ion-list>
        } @else if (workout(); as currentWorkout) {
          <app-workout-list [workout]="currentWorkout" (save)="saveEdit($event)" />
        }
      </app-content-container>

      <!-- <app-add-item-dialog></app-add-item-dialog> -->

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item button lines="none" [detail]="false" (click)="startEditing()">
              {{ 'general.edit' | translate }}
            </ion-item>

            <ion-item-group>
              <ion-item-divider>
                <ion-label>Hinzufügen</ion-label>
              </ion-item-divider>

              @if (workout(); as currentWorkout) {
                <ion-item button [detail]="false" (click)="addText(currentWorkout)">
                  {{ 'tabs.training.workout.more-menu.text' | translate }}
                </ion-item>

                <ion-item button [detail]="false" (click)="addExercise(currentWorkout)">
                  {{ 'tabs.training.workout.more-menu.exercise' | translate }}
                </ion-item>

                <ion-item
                  lines="none"
                  [button]="true"
                  [detail]="false"
                  (click)="addSpacer(currentWorkout)"
                >
                  {{ 'tabs.training.workout.more-menu.spacer' | translate }}
                </ion-item>
              }
            </ion-item-group>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class WorkoutPage {
  readonly workoutId = input<string | undefined>();

  private readonly loadingCtrl = inject(LoadingController);
  private readonly modalCtrl = inject(ModalController);
  private readonly translate = inject(TranslateService);

  private readonly moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  private readonly workoutListComp = viewChild.required(WorkoutListComponent);

  private readonly workoutsService = inject(WorkoutsService);
  private readonly helperService = inject(HelperService);
  private readonly editService = inject(IsEditingService);

  readonly isEditing = this.editService.isEditing;
  readonly isMoreMenuOpen = signal<boolean>(false);

  readonly skeletonItems = [
    { type: 'HEADER', width: '65%' },
    { type: 'EXERCISE', width: '70%' },
    { type: 'EXERCISE', width: '62%' },
    { type: 'SPACER', width: '0' },
    { type: 'HEADER', width: '50%' },
    { type: 'EXERCISE', width: '75%' },
    { type: 'EXERCISE', width: '58%' },
  ];

  readonly isLoading = computed(() => {
    return this.workoutsService.workoutsResource.isLoading();
  });

  readonly hasError = computed(() => {
    return !!this.workoutsService.workoutsResource.error();
  });

  readonly workout = computed<WorkoutDoc | undefined>(() => {
    const workoutId = Number(this.workoutId());
    const workouts = this.workoutsService.workoutsResource.value();

    if (!Number.isFinite(workoutId)) return undefined;
    if (!workouts) return undefined;

    const currentWorkout = workouts.find((w) => Number(w.workoutId) === workoutId);
    if (!currentWorkout) return undefined;

    const editedList = this.editService.editedList();
    const isEditing = this.editService.isEditing();

    return {
      ...currentWorkout,
      list: isEditing && editedList ? editedList : currentWorkout.list,
    };
  });

  readonly titleTrimmed = computed<string>(() => {
    const MAX = 20;
    if (this.isLoading()) return '';

    const name = this.workout()?.name ?? '';
    return name.length > MAX ? `${name.slice(0, MAX - 2)}...` : name;
  });

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  async startEditing(): Promise<void> {
    const currentWorkout = this.workout();
    if (!currentWorkout) return;

    this.editService.editedList.set(structuredClone(currentWorkout.list));
    this.isEditing.set(true);
    await this.moreMenu().dismiss();
  }

  async abortEditing(): Promise<void> {
    const list = this.workoutListComp().workoutList();
    await list.closeSlidingItems();
    this.editService.editedList.set(null);
    this.isEditing.set(false);
  }

  async saveEdit({ message, data }: { message: string; data?: ListItem }): Promise<void> {
    const currentWorkout = this.workout();
    if (!currentWorkout) return;

    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'circles',
    });
    await loading.present();

    const editedList = this.editService.editedList();
    const list = editedList ?? currentWorkout.list;
    const changedName = data ? list.map((i) => (i.listId === data.listId ? data : i)) : list;
    const normalized = this.workoutsService.normalizeWorkoutList(changedName);

    const updatedWorkout = {
      ...currentWorkout,
      list: normalized,
    };

    this.workoutsService.updateWorkoutList(updatedWorkout).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.editService.editedList.set(null);
        void loading.dismiss();
      },
      error: async (err) => {
        console.error('Unexpected fail during update user.workoutIds', err);
        this.isEditing.set(false);
        this.editService.editedList.set(null);
        void loading.dismiss();
        const message = data
          ? 'tabs.training.workout.actions.change-text.error'
          : 'tabs.training.workout.actions.update-list.error';
        await this.helperService.showError(message);
      },
    });
  }

  async addText(workout: WorkoutDoc): Promise<void> {
    try {
      const modal = await this.modalCtrl.create({
        component: TextInputDialog,
        componentProps: {
          title: this.translate.instant('tabs.training.workout.actions.add-text.title'),
          label: 'Text',
          placeholder: this.translate.instant('tabs.training.workout.actions.add-text.placeholder'),
          value: '',
        },
      });
      await modal.present();

      const { data } = await modal.onDidDismiss<string>();
      if (!data || !data.trim() || data.trim() === '') return;

      const added = [...workout.list, { ...WORKOUT_LIST_ITEM_HEADER, name: data }];
      const updatedWorkout: WorkoutDoc = {
        ...workout,
        list: added,
      };
      await this.updateDatabase(
        updatedWorkout,
        this.translate.instant('tabs.training.workout.actions.add-text.loading'),
      );
    } catch (error) {
      console.error('Change text modal could not be opened:', error);
    }
  }

  async addExercise(workout: WorkoutDoc): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddExerciseDialog,
      componentProps: {
        title: this.translate.instant('tabs.training.workout.actions.add-exercise'),
        value: workout.name,
        currentList: workout.list,
      },
    });
    await modal.present();
    this.isMoreMenuOpen.set(false);

    const { data } = await modal.onDidDismiss<ListItemExercise>();
    if (!data) return;

    const added = [...workout.list, { ...data }];
    const updatedWorkout: WorkoutDoc = {
      ...workout,
      list: added,
    };
    await this.updateDatabase(
      updatedWorkout,
      this.translate.instant('tabs.training.workout.actions.add-exercise-process'),
    );
  }

  async addSpacer(workout: WorkoutDoc): Promise<void> {
    const added = [...workout.list, { ...WORKOUT_LIST_ITEM_SPACER }];
    const updatedWorkout: WorkoutDoc = {
      ...workout,
      list: added,
    };

    await this.updateDatabase(
      updatedWorkout,
      this.translate.instant('tabs.training.workout.actions.add-spacer-process'),
    );
  }

  private async updateDatabase(workout: WorkoutDoc, loadMessage: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: loadMessage,
      spinner: 'circles',
    });
    await loading.present();

    const normalized = this.workoutsService.normalizeWorkoutList(workout.list);
    const updatedWorkout = {
      ...workout,
      list: normalized,
    };

    this.workoutsService.updateWorkoutList(updatedWorkout).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isEditing.set(false);
      },
      error: async (err) => {
        console.error('Unexpected fail during update user.workoutIds', err);
        await loading.dismiss();
        this.isEditing.set(false);
        await this.helperService.showError('tabs.training.workout.actions.update-list.error');
      },
    });
    this.isMoreMenuOpen.set(false);
  }
}
