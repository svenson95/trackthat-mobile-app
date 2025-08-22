import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { ActivityPageRoutingModule } from './activity-routing.module';
import { ActivityPage } from './activity.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    ActivityPageRoutingModule,
  ],
  declarations: [ActivityPage],
})
export class ActivityPageModule {}
