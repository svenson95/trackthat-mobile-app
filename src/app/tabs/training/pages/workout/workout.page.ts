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
import { LoadingController } from '@ionic/angular';
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

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../../../components';
import {
  WORKOUT_LIST_ITEM_HEADER,
  WORKOUT_LIST_ITEM_SPACER,
  type WorkoutDoc,
} from '../../../../models';
import { IsEditingService, WorkoutsService } from '../../services';

import { UserService } from 'src/app/services';
import { WorkoutUnitsComponent } from './components';

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
    WorkoutUnitsComponent,
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
          <ion-button>
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
          </ion-button>
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

              <ion-item [button]="true" [detail]="false">
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
  private userService = inject(UserService);
  private editService = inject(IsEditingService);
  isEditing = this.editService.isEditing;

  private workoutsService = inject(WorkoutsService);
  private loadingCtrl = inject(LoadingController);

  private moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  isMoreMenuOpen = signal<boolean>(false);

  workout = computed<WorkoutDoc>(() => {
    const workouts = this.workoutsService.workoutsResource.value();
    const id = this.workoutId();
    return workouts!.find((w) => w.workoutId === Number(id))!;
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
    this.workoutsService.updateWorkoutList(this.workout()).subscribe({
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

  async addSpacer(workout: WorkoutDoc): Promise<void> {
    const spacerItem = {
      ...WORKOUT_LIST_ITEM_SPACER,
    };
    workout.list = [...workout.list, spacerItem].map((listItem, index) => ({
      ...listItem,
      itemId: index,
    }));

    await this.updateDatabase(workout);
  }

  async addText(workout: WorkoutDoc): Promise<void> {
    const textItem = {
      ...WORKOUT_LIST_ITEM_HEADER,
    };
    workout.list = [...workout.list, textItem].map((listItem, index) => ({
      ...listItem,
      itemId: index,
    }));

    await this.updateDatabase(workout);
  }

  private async updateDatabase(workout: WorkoutDoc): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Sortierung wird gespeichert ...',
      spinner: 'circles',
    });
    await loading.present();
    this.workoutsService.updateWorkoutList(workout).subscribe({
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
