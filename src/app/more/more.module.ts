import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoreRoutingModule } from './more-routing.module';
import { MoreDisplayComponent } from './more-display/more-display.component';


@NgModule({
  declarations: [
    MoreDisplayComponent
  ],
  imports: [
    CommonModule,
    MoreRoutingModule
  ]
})
export class MoreModule { }
