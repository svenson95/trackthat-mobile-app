import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { OverviewPageRoutingModule } from './overview-routing.module';
import { OverviewPage } from './overview.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    OverviewPageRoutingModule,
  ],
  declarations: [OverviewPage],
})
export class OverviewPageModule {}
