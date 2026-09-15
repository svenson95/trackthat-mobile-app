import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

export const MORE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./more.page').then((m) => m.MorePage),
  },
];
