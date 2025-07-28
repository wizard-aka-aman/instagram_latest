import { NgModule } from '@angular/core'; 
import { HomeRoutingModule } from './home-routing.module';
import { DisplayComponent } from './display/display.component';   
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    DisplayComponent , 
  ],
  imports: [  
    HomeRoutingModule,
    SharedModule,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class HomeModule { }
