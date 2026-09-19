import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

import { WorkoutsService } from './data-access';
import { LogWorkoutService } from './log-workout/log-workout.service';

export const TRAINING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    providers: [WorkoutsService],
    children: [
      {
        path: '',
        loadComponent: () => import('./workouts/workouts.page').then((m) => m.WorkoutsPage),
      },
      {
        path: ':workoutId',
        loadComponent: () => import('./workout/workout.page').then((m) => m.WorkoutPage),
      },
      {
        path: ':workoutId/:itemId/:exercise/log',
        providers: [LogWorkoutService],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
          {
            path: ':logId',
            loadComponent: () =>
              import('./log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
        ],
      },
    ],
  },
];
