import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplaystoriesComponent } from './displaystories/displaystories.component';

const routes: Routes = [
  {
    path: ":storyid",
    component: DisplaystoriesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoriesRoutingModule { }
