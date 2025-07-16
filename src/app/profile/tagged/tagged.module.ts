import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaggedRoutingModule } from './tagged-routing.module';
import { DisplayTaggedComponent } from './display-tagged/display-tagged.component';


@NgModule({
  declarations: [
    DisplayTaggedComponent
  ],
  imports: [
    CommonModule,
    TaggedRoutingModule
  ]
})
export class TaggedModule { }
