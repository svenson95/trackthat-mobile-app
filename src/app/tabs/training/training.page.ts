import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonPopover,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import type { OverlayEventDetail } from '@ionic/core';

import { ContentContainerComponent } from '../../components';
import type { WorkoutDoc } from '../../models';
import { AuthService, UserService } from '../../services';

import { WorkoutsComponent } from './components';
import { AddWorkoutDialog } from './dialogs';
import { SortingWorkoutsService } from './services';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonModal,
  IonPopover,
  IonList,
  IonItem,
];

@Component({
  selector: 'app-training-page',
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
          <ion-button id="add-workout-dialog">
            <ion-icon slot="icon-only" ios="add" md="add"></ion-icon>
          </ion-button>
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
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">Trainingspläne</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container>
        <app-workouts />
      </app-content-container>

      <ion-modal
        trigger="add-workout-dialog"
        (willDismiss)="onAddWorkoutSubmit($event)"
        #newWorkoutModal
      >
        <ng-template>
          <app-add-workout-dialog [modal]="newWorkoutModal"></app-add-workout-dialog>
        </ng-template>
      </ion-modal>

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item [button]="true" [detail]="false" lines="none" (click)="toggleEditMode()">
              Bearbeiten
            </ion-item>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class TrainingPage {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  private moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  isMoreMenuOpen = signal<boolean>(false);

  private sortService = inject(SortingWorkoutsService);
  isEditing = this.sortService.isEditing;

  onAddWorkoutSubmit(event: CustomEvent<OverlayEventDetail<WorkoutDoc>>): void {
    const workoutId = event.detail.data!.workoutId;
    void this.router.navigate(['tabs', 'training', workoutId]);
  }

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  toggleEditMode(): void {
    const current = this.isEditing();
    this.isEditing.set(!current);
    void this.moreMenu().dismiss();
  }

  saveEdit(): void {
    const ids = this.sortService.workoutIds();
    const userId = this.authService.user()?.id;
    if (!userId) throw new Error('Unexpected userId not defined');

    this.userService.updateUserWorkoutList(userId, ids).subscribe({
      next: (user) => {
        this.authService.setUserData(user);
        this.sortService.isEditing.set(false);
      },
      error: (err) => console.error('Update failed', err),
    });
  }
}
