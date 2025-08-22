import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    HomePageRoutingModule,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
