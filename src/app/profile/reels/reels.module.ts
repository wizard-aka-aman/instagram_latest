import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReelsRoutingModule } from './reels-routing.module';
import { DisplayreelsComponent } from './displayreels/displayreels.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DisplayreelsComponent
  ],
  imports: [
    CommonModule,
    ReelsRoutingModule,
    FormsModule
  ]
})
export class ReelsModule { }
