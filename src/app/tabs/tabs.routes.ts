import type { Routes } from '@angular/router';

import { AuthGuard } from '../services';

import { TabsPage } from './tabs.page';
import { WorkoutResolver } from './training/services';

export const tabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'training',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./training/pages/workout-list/workout-list.page').then(
                (m) => m.WorkoutListPage,
              ),
          },
          {
            path: ':workoutId',
            loadComponent: () =>
              import('./training/pages/workout-detail/workout-detail.page').then(
                (m) => m.WorkoutDetailPage,
              ),
            resolve: {
              workout: WorkoutResolver,
            },
          },
        ],
      },
      {
        path: 'eat',
        canActivate: [AuthGuard],
        loadComponent: () => import('./eat/eat.page').then((m) => m.EatPage),
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.page').then((m) => m.OverviewPage),
      },
      {
        path: 'logs',
        canActivate: [AuthGuard],
        loadComponent: () => import('./logs/logs.page').then((m) => m.LogsPage),
      },
      {
        path: 'more',
        canActivate: [AuthGuard],
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
