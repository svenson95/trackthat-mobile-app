import type { Routes } from '@angular/router';

import { LogWorkoutService } from './data-access';

export const LOG_WORKOUT_ROUTES: Routes = [
  {
    path: '',
    providers: [LogWorkoutService],
    children: [
      {
        path: '',
        loadComponent: () => import('./log-workout.page').then((m) => m.LogWorkoutPage),
      },
      {
        path: ':logId',
        loadComponent: () => import('./log-workout.page').then((m) => m.LogWorkoutPage),
      },
    ],
  },
];
