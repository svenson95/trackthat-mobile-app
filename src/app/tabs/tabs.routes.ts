import type { Routes } from '@angular/router';

import { AuthGuard } from '../services';

import { TabsPage } from './tabs.page';

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
              import('./training/pages/workouts/workouts.page').then((m) => m.WorkoutsPage),
          },
          {
            path: ':workoutId',
            loadComponent: () =>
              import('./training/pages/workout/workout.page').then((m) => m.WorkoutPage),
          },
          {
            path: ':workoutId/:itemId/:exercise/log',
            loadComponent: () =>
              import('./training/pages/log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
          },
          {
            path: ':workoutId/:itemId/:exercise/log/:logId',
            loadComponent: () =>
              import('./training/pages/log-workout/log-workout.page').then((m) => m.LogWorkoutPage),
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
