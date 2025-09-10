import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExploreRoutingModule } from './explore-routing.module';
import { DisplayExploreComponent } from './display-explore/display-explore.component';


@NgModule({
  declarations: [
    DisplayExploreComponent
  ],
  imports: [
    CommonModule,
    ExploreRoutingModule
  ]
})
export class ExploreModule { }
