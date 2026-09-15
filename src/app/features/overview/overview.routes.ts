import type { Routes } from '@angular/router';

export const OVERVIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview.page').then((m) => m.OverviewPage),
  },
];
