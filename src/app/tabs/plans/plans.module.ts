import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { UserService } from '../../services';
import { PlansPageRoutingModule } from './plans-routing.module';
import { PlansPage } from './plans.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    PlansPageRoutingModule
  ],
  declarations: [PlansPage],
  providers: [UserService]
})
export class PlansPageModule {}
