import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'training',
        loadChildren: () => import('./training/training.module').then((m) => m.TrainingPageModule),
      },
      {
        path: 'eat',
        loadChildren: () => import('./eat/eat.module').then((m) => m.EatPageModule),
      },
      {
        path: 'overview',
        loadChildren: () => import('./overview/overview.module').then((m) => m.OverviewPageModule),
      },
      {
        path: 'logs',
        loadChildren: () => import('./logs/logs.module').then((m) => m.LogsPageModule),
      },
      {
        path: 'more',
        loadChildren: () => import('./more/more.module').then((m) => m.MorePageModule),
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
