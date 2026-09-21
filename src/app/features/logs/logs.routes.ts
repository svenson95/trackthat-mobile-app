import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

import { LogsWorkoutService } from './data-access';

export const LOGS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    providers: [LogsWorkoutService],
    loadComponent: () => import('./logs.page').then((m) => m.LogsPage),
  },
];
