import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { TrainingPageRoutingModule } from './training-routing.module';
import { TrainingPage } from './training.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    TrainingPageRoutingModule,
  ],
  declarations: [TrainingPage],
})
export class TrainingPageModule {}
