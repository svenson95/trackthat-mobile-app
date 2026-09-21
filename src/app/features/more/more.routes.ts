import type { Routes } from '@angular/router';

import { AuthGuard } from '../../core';

import { UsersService } from './data-access';

export const MORE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    providers: [UsersService],
    loadComponent: () => import('./more.page').then((m) => m.MorePage),
  },
];
