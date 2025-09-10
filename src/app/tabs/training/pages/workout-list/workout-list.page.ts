import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import type { RefresherCustomEvent } from '@ionic/core';
import { filter, first } from 'rxjs';

import { ContentContainerComponent } from '../../../../components';
import { UserService } from '../../../../services';

import { SortingWorkoutsService, WorkoutsService } from '../../services';

import { WorkoutsComponent } from './components';
import { AddWorkoutDialog } from './dialogs';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonPopover,
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
];

@Component({
  selector: 'app-workout-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ION_COMPONENTS,
    FormsModule,
    ContentContainerComponent,
    WorkoutsComponent,
    AddWorkoutDialog,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (isEditing()) {
            <ion-button (click)="abortEditing(workoutsComp.workoutsList())"> Abbrechen </ion-button>
          } @else {
            <ion-button id="add-workout-modal">
              <ion-icon slot="icon-only" ios="add" md="add"></ion-icon>
            </ion-button>
          }
        </ion-buttons>

        <ion-title> Trainingspläne </ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button (click)="saveEdit()"> Speichern </ion-button>
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
      <ion-refresher slot="fixed" [pullFactor]="1.5" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content
          pullingIcon="chevron-down"
          pullingText="Liste aktualisieren ..."
          refreshingSpinner="circles"
          refreshingText="Wird geladen ..."
        ></ion-refresher-content>
      </ion-refresher>

      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">Trainingspläne</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container>
        <app-workouts #workoutsComp />
      </app-content-container>

      <app-add-workout-modal></app-add-workout-modal>

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item [button]="true" [detail]="false" lines="none" (click)="startEditing()">
              Bearbeiten
            </ion-item>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class WorkoutListPage {
  private injector = inject(Injector);
  private loadingCtrl = inject(LoadingController);

  private userService = inject(UserService);
  private workoutsService = inject(WorkoutsService);

  private moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  isMoreMenuOpen = signal<boolean>(false);

  private sortService = inject(SortingWorkoutsService);
  isEditing = this.sortService.isEditing;

  handleRefresh(event: RefresherCustomEvent): void {
    const res = this.workoutsService.workoutsResource;
    const started = res.reload();

    if (!started && !res.isLoading()) {
      void event.target?.complete();
      return;
    }

    toObservable(res.isLoading, { injector: this.injector })
      .pipe(
        filter((loading) => !loading),
        first(),
      )
      .subscribe(() => event.target.complete());
  }

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  startEditing(): void {
    this.isEditing.set(true);
    void this.moreMenu().dismiss();
  }

  abortEditing(list: IonList): void {
    void list.closeSlidingItems();
    this.isEditing.set(false);
  }

  async saveEdit(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Sortierung wird gespeichert ...',
      spinner: 'circles',
    });
    await loading.present();

    const ids = this.sortService.workoutIds();
    const userId = this.userService.user().id;

    this.userService.updateUserWorkoutList(userId, ids).subscribe({
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
}
