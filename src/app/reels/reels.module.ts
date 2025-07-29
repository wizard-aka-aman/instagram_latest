import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReelsRoutingModule } from './reels-routing.module';
import { DisplayReelComponent } from './display-reel/display-reel.component';


@NgModule({
  declarations: [
    DisplayReelComponent
  ],
  imports: [
    CommonModule,
    ReelsRoutingModule
  ]
})
export class ReelsModule { }
