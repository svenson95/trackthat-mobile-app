import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

import { WorkoutsService } from './data-access';
import { LogWorkoutService } from './subfeatures/log-workout/data-access';

export const TRAINING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    providers: [WorkoutsService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./subfeatures/workouts/workouts.page').then((m) => m.WorkoutsPage),
      },
      {
        path: ':workoutId',
        loadComponent: () =>
          import('./subfeatures/workout/workout.page').then((m) => m.WorkoutPage),
      },
      {
        path: ':workoutId/:itemId/:exercise/log',
        providers: [LogWorkoutService],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./subfeatures/log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
          {
            path: ':logId',
            loadComponent: () =>
              import('./subfeatures/log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
        ],
      },
    ],
  },
];
