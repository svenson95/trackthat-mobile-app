import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import type { OverlayEventDetail } from '@ionic/core';

import { ContentContainerComponent } from '../../components';

import { WorkoutsComponent } from './components';
import { AddWorkoutDialog } from './dialogs';
import type { WorkoutData } from './models';
import { WorkoutsService } from './services';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonModal,
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
          <ion-button>
            <ion-icon slot="icon-only" ios="ellipsis-horizontal" md="ellipsis-vertical"></ion-icon>
          </ion-button>
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
    </ion-content>
  `,
})
export class TrainingPage {
  private router = inject(Router);
  private workoutsService = inject(WorkoutsService);

  onAddWorkoutSubmit(event: CustomEvent<OverlayEventDetail>): void {
    const { data } = event.detail;
    if (!data) return;

    const workouts = this.workoutsService.workoutsResource.value()?.workouts;
    if (!workouts) throw new Error('Workouts not loaded');
    const workoutId = workouts.length === 0 ? 1 : Math.max(...workouts.map((e) => e.workoutId)) + 1;
    const workoutData: WorkoutData = {
      workoutId,
      lastUpdated: Date.now(),
      name: data,
      list: [],
    };

    this.workoutsService.addWorkout(workoutData).subscribe({
      next: (response) => this.router.navigate(['tabs', 'training', response.workoutId]),
      error: (error) => console.error('Error saving workout:', error),
    });
  }
}
