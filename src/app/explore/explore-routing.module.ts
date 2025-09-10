import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayExploreComponent } from './display-explore/display-explore.component';

const routes: Routes = [{
  path: '',
  component:DisplayExploreComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExploreRoutingModule { }
