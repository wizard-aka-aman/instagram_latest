import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplaySavedComponent } from './display-saved/display-saved.component';

const routes: Routes = [
  {
    path:"",
    component:DisplaySavedComponent
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SavedRoutingModule { }
