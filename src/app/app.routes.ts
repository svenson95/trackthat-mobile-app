import type { Routes } from '@angular/router';

import { TabsPage } from './core';

export const appRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'training',
        loadChildren: () =>
          import('./features/training/training.routes').then((m) => m.TRAINING_ROUTES),
      },
      {
        path: 'overview',
        loadChildren: () =>
          import('./features/overview/overview.routes').then((m) => m.OVERVIEW_ROUTES),
      },
      {
        path: 'logs',
        loadChildren: () => import('./features/logs/logs.routes').then((m) => m.LOGS_ROUTES),
      },
      {
        path: 'more',
        loadChildren: () => import('./features/more/more.routes').then((m) => m.MORE_ROUTES),
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/overview',
    pathMatch: 'full',
  },
];
