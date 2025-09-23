import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoreDisplayComponent } from './more-display/more-display.component';

const routes: Routes = [
  {
    path: '',
    component: MoreDisplayComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoreRoutingModule { }
