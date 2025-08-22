import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

import { LogsPage } from './logs.page';

const routes: Routes = [
  {
    path: '',
    component: LogsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogsPageRoutingModule {}
