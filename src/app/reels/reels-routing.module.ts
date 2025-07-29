import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayReelComponent } from './display-reel/display-reel.component';

const routes: Routes = [
  {
    path: '',
    component: DisplayReelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReelsRoutingModule { }
