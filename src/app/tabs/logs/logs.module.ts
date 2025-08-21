import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../../components';

import { LogsPageRoutingModule } from './logs-routing.module';
import { LogsPage } from './logs.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    LogsPageRoutingModule
  ],
  declarations: [LogsPage]
})
export class LogsPageModule {}
