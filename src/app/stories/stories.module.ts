import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoriesRoutingModule } from './stories-routing.module';
import { DisplaystoriesComponent } from './displaystories/displaystories.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DisplaystoriesComponent
  ],
  imports: [
    CommonModule,
    StoriesRoutingModule,
    FormsModule
  ]
})
export class StoriesModule { }
