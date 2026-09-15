import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

import { LogsWorkoutService, WorkoutsService } from './services';

export const TRAINING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    providers: [WorkoutsService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/workouts/workouts.page').then((m) => m.WorkoutsPage),
      },
      {
        path: ':workoutId',
        loadComponent: () => import('./pages/workout/workout.page').then((m) => m.WorkoutPage),
      },
      {
        path: ':workoutId/:itemId/:exercise/log',
        providers: [LogsWorkoutService],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
          {
            path: ':logId',
            loadComponent: () =>
              import('./pages/log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
        ],
      },
    ],
  },
];
