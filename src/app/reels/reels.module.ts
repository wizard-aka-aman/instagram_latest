import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReelsRoutingModule } from './reels-routing.module';
import { DisplayReelComponent } from './display-reel/display-reel.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DisplayReelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReelsRoutingModule
  ]
})
export class ReelsModule { }
