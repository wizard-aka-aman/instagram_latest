import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { MapDisplayComponent } from './map-display/map-display.component';


@NgModule({
  declarations: [
    MapDisplayComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule
  ]
})
export class MapModule { }
