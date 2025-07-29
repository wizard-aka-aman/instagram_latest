import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { DisplayComponent } from './display/display.component';
import { FormsModule } from '@angular/forms';
import { PostViewComponent } from './post-view/post-view.component';
import { RouterModule } from '@angular/router';
import { ReelViewComponent } from './reel-view/reel-view.component'; 


@NgModule({
  declarations: [
    DisplayComponent,
    PostViewComponent,
    ReelViewComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FormsModule ,
    RouterModule
  ]
})
export class ProfileModule { }
