import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { DisplaysearchComponent } from './displaysearch/displaysearch.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExploreModule } from '../explore/explore.module';


@NgModule({
  declarations: [
    DisplaysearchComponent
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    RouterModule,
    FormsModule,
    ExploreModule
  ]
})
export class SearchModule { }
