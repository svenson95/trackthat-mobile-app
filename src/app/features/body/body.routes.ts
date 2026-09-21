import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

export const BODY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./body.page').then((m) => m.HealthPage),
  },
];
