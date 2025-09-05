import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { filter, map } from 'rxjs';

import { ContentContainerComponent } from '../../../../components';
import type { WorkoutDoc } from '../../../../models';
import { WorkoutsService } from '../../services';

import { WorkoutUnitsComponent } from './components';

const ANGULAR_MODULES = [FormsModule];

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonTitle,
  IonContent,
];

@Component({
  selector: 'app-workout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ANGULAR_MODULES,
    ...ION_COMPONENTS,
    ContentContainerComponent,
    WorkoutUnitsComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="Pläne" defaultHref="/tabs/training"></ion-back-button>
        </ion-buttons>

        <ion-title> {{ pageTitle() }} </ion-title>

        <ion-buttons slot="primary">
          <ion-button>
            <ion-icon slot="icon-only" ios="ellipsis-horizontal" md="ellipsis-vertical"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <app-content-container>
        <app-workout-units [workout]="selectedWorkout()" />
      </app-content-container>
    </ion-content>
  `,
})
export class WorkoutPage {
  private route = inject(ActivatedRoute);
  private service = inject(WorkoutsService);

  pageTitle = computed<string>(() => this.selectedWorkout().name);

  workoutId = toSignal<number>(
    this.route.paramMap.pipe(
      map((params) => params.get('workoutId')),
      filter((id): id is string => id !== null),
      map((id) => Number(id)),
    ),
  );

  selectedWorkout = computed<WorkoutDoc>(() => {
    const workouts = this.service.workoutsResource.value();
    if (!workouts) throw new Error('Workouts not loaded');
    const workout = workouts.find((w) => w.workoutId === this.workoutId());
    if (!workout) throw new Error('Workout not found');
    return workout;
  });
}
