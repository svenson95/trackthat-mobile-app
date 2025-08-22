import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { EatPageRoutingModule } from './eat-routing.module';
import { EatPage } from './eat.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    EatPageRoutingModule,
  ],
  declarations: [EatPage],
})
export class EatPageModule {}
