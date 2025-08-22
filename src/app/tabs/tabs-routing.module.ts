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
        path: 'activity',
        loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityPageModule),
      },
      {
        path: 'eat',
        loadChildren: () => import('./eat/eat.module').then((m) => m.EatPageModule),
      },
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
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
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
