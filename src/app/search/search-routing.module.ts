import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplaysearchComponent } from './displaysearch/displaysearch.component';

const routes: Routes = [
  {
    path : '',
    component : DisplaysearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
