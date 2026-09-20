import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

export const HEALTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./health.page').then((m) => m.HealthPage),
  },
];
