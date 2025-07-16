import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';

const routes: Routes = [
  {
    path: '',
    component: DisplayComponent,
  },
  {
    path: 'saved',
    loadChildren: () => import('./saved/saved.module').then(e => e.SavedModule)
  },
  {
    path: 'tagged',
    loadChildren: () => import('./tagged/tagged.module').then(e => e.TaggedModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
