import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SavedRoutingModule } from './saved-routing.module';
import { DisplaySavedComponent } from './display-saved/display-saved.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DisplaySavedComponent
  ],
  imports: [
    CommonModule,
    SavedRoutingModule
  ],
  exports: [ DisplaySavedComponent]
})
export class SavedModule { }
