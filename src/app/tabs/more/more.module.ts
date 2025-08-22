import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';
import { UserService } from '../../services';

import { MorePageRoutingModule } from './more-routing.module';
import { MorePage } from './more.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ContentContainerComponent,
    MorePageRoutingModule,
  ],
  declarations: [MorePage],
  providers: [UserService],
})
export class MorePageModule {}
