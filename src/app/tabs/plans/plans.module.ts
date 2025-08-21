import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../../components';

import { PlansPageRoutingModule } from './plans-routing.module';
import { PlansPage } from './plans.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    PlansPageRoutingModule
  ],
  declarations: [PlansPage]
})
export class PlansPageModule {}
