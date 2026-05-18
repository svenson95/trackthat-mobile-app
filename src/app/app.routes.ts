import type { Routes } from '@angular/router';

import { AuthGuard } from './services';
import { TabsPage } from './tabs/tabs.page';

export const appRoutes: Routes = [
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
              import('./tabs/training/pages/workouts/workouts.page').then((m) => m.WorkoutsPage),
          },
          {
            path: ':workoutId',
            loadComponent: () =>
              import('./tabs/training/pages/workout/workout.page').then((m) => m.WorkoutPage),
          },
          {
            path: ':workoutId/:itemId/:exercise/log',
            loadComponent: () =>
              import('./tabs/training/pages/log-workout/log-workout.page').then(
                (m) => m.LogWorkoutPage,
              ),
          },
          {
            path: ':workoutId/:itemId/:exercise/log/:logId',
            loadComponent: () =>
              import('./tabs/training/pages/log-workout/log-workout.page').then(
                (m) => m.LogWorkoutPage,
              ),
          },
        ],
      },
      {
        path: 'eat',
        canActivate: [AuthGuard],
        loadComponent: () => import('./tabs/eat/eat.page').then((m) => m.EatPage),
      },
      {
        path: 'overview',
        loadComponent: () => import('./tabs/overview/overview.page').then((m) => m.OverviewPage),
      },
      {
        path: 'logs',
        canActivate: [AuthGuard],
        loadComponent: () => import('./tabs/logs/logs.page').then((m) => m.LogsPage),
      },
      {
        path: 'more',
        canActivate: [AuthGuard],
        loadComponent: () => import('./tabs/more/more.page').then((m) => m.MorePage),
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
