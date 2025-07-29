import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayreelsComponent } from './displayreels/displayreels.component';

const routes: Routes = [
  {
    path:"",
    component : DisplayreelsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReelsRoutingModule { }
