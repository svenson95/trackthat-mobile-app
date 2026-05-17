import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { map } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../../../components';
import type { ListItemExercise } from '../../../../models';
import {
  WORKOUT_LIST_ITEM_HEADER,
  WORKOUT_LIST_ITEM_SPACER,
  type WorkoutDoc,
} from '../../../../models';
import { IsEditingService, WorkoutsService } from '../../services';

import { WorkoutListComponent } from './components';
import { AddExerciseDialog } from './dialogs';

const ANGULAR_MODULES = [FormsModule];

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
  IonTitle,
  IonContent,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
];

@Component({
  selector: 'app-workout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ANGULAR_MODULES,
    ...ION_COMPONENTS,
    TranslateModule,
    ContentContainerComponent,
    WorkoutListComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (isEditing()) {
            <ion-button (click)="abortEditing(workoutComp.workoutList())">
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
          {{ workout().name }}
        </ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button (click)="saveEdit()"> {{ 'general.save' | translate }} </ion-button>
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
        <app-workout-list [workout]="workout()" #workoutComp />
      </app-content-container>

      <!-- <app-add-item-dialog></app-add-item-dialog> -->

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item [button]="true" [detail]="false" (click)="startEditing()">
              {{ 'general.edit' | translate }}
            </ion-item>

            <ion-item-group>
              <ion-item-divider>
                <ion-label>Hinzufügen</ion-label>
              </ion-item-divider>

              <ion-item [button]="true" [detail]="false" (click)="addText(workout())">
                {{ 'tabs.training.workout.more-menu.text' | translate }}
              </ion-item>

              <ion-item [button]="true" [detail]="false" (click)="addExercise(workout())">
                {{ 'tabs.training.workout.more-menu.exercise' | translate }}
              </ion-item>

              <ion-item [button]="true" [detail]="false" (click)="addSpacer(workout())">
                {{ 'tabs.training.workout.more-menu.spacer' | translate }}
              </ion-item>
            </ion-item-group>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class WorkoutPage {
  workoutId = input.required<string>();

  private loadingCtrl = inject(LoadingController);
  private modalCtrl = inject(ModalController);
  private translate = inject(TranslateService);

  private editService = inject(IsEditingService);
  isEditing = this.editService.isEditing;

  private workoutsService = inject(WorkoutsService);
  private moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  isMoreMenuOpen = signal<boolean>(false);

  private route = inject(ActivatedRoute);

  resolvedWorkout = toSignal(this.route.data.pipe(map((data) => data['workout'] as WorkoutDoc)), {
    initialValue: {} as WorkoutDoc,
  });

  workout = computed<WorkoutDoc>(() => {
    const resolved = this.resolvedWorkout();

    return this.workoutsService.workoutsResource
      .value()!
      .find((w) => w.workoutId === resolved.workoutId)!;
  });

  workoutEffect = effect(() => {
    const workout = this.workout();
    const ids = workout.list.map((i) => i.listId);
    this.editService.workoutListIds.set(ids);
  });

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  async startEditing(): Promise<void> {
    this.isEditing.set(true);
    await this.moreMenu().dismiss();
  }

  async abortEditing(list: IonList): Promise<void> {
    await list.closeSlidingItems();
    this.isEditing.set(false);
  }

  async saveEdit(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Sortierung wird gespeichert ...',
      spinner: 'circles',
    });
    await loading.present();

    this.isEditing.set(false);
    void loading.dismiss();

    const workout = this.workout();
    const sortedList = this.editService.workoutListIds().map((item) => {
      return workout.list.find((i) => i.listId === item)!;
    });
    const updatedWorkout = {
      ...workout,
      list: sortedList,
    };

    this.workoutsService.updateWorkoutList(updatedWorkout).subscribe({
      next: () => {
        this.isEditing.set(false);
        void loading.dismiss();
      },
      error: (err) => {
        console.error('Unexpected fail during update user.workoutIds', err);
        this.isEditing.set(false);
        void loading.dismiss();
      },
    });
  }

  async addText(workout: WorkoutDoc): Promise<void> {
    const updatedWorkout: WorkoutDoc = {
      ...workout,
      list: [...workout.list, { ...WORKOUT_LIST_ITEM_HEADER }],
    };

    await this.updateDatabase(
      updatedWorkout,
      this.translate.instant('tabs.training.workout.actions.add-text-process'),
    );
  }

  async addExercise(workout: WorkoutDoc): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddExerciseDialog,
      componentProps: {
        title: this.translate.instant('tabs.training.workout.actions.add-exercise'),
        value: workout.name,
        currentList: this.workout().list,
      },
    });
    await modal.present();
    this.isMoreMenuOpen.set(false);

    const { data } = await modal.onDidDismiss<ListItemExercise>();
    if (!data) return;

    const updatedWorkout: WorkoutDoc = {
      ...workout,
      list: [...workout.list, { ...data }],
    };
    await this.updateDatabase(
      updatedWorkout,
      this.translate.instant('tabs.training.workout.actions.add-exercise-process'),
    );
  }

  async addSpacer(workout: WorkoutDoc): Promise<void> {
    const updatedWorkout: WorkoutDoc = {
      ...workout,
      list: [...workout.list, { ...WORKOUT_LIST_ITEM_SPACER }],
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

    const updatedWorkout = {
      ...workout,
      list: workout.list.map((item, index) => ({
        ...item,
        listId: index,
      })),
    };

    this.workoutsService.updateWorkoutList(updatedWorkout).subscribe({
      next: () => {
        this.isEditing.set(false);
        void loading.dismiss();
      },
      error: (err) => {
        this.isEditing.set(false);
        void loading.dismiss();
        console.error('Unexpected fail during update user.workoutIds', err);
      },
    });
    this.isMoreMenuOpen.set(false);
  }
}
