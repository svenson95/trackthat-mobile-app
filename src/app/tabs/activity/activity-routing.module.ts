import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

import { ActivityPage } from './activity.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityPageRoutingModule {}
