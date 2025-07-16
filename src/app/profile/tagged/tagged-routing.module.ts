import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayTaggedComponent } from './display-tagged/display-tagged.component';

const routes: Routes = [
  {
    path:"",
    component: DisplayTaggedComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaggedRoutingModule {


  constructor() { }
}
