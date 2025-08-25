import type { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const tabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'training',
        loadComponent: () => import('./training/training.page').then((m) => m.TrainingPage),
      },
      {
        path: 'eat',
        loadComponent: () => import('./eat/eat.page').then((m) => m.EatPage),
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.page').then((m) => m.OverviewPage),
      },
      {
        path: 'logs',
        loadComponent: () => import('./logs/logs.page').then((m) => m.LogsPage),
      },
      {
        path: 'more',
        loadComponent: () => import('./more/more.page').then((m) => m.MorePage),
      },
      {
        path: '',
        redirectTo: '/tabs/overview',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/overview',
    pathMatch: 'full',
  },
];
