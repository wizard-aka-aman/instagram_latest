import { NgModule } from '@angular/core'; 
import { HomeRoutingModule } from './home-routing.module';
import { DisplayComponent } from './display/display.component';   
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DisplayComponent , 
  ],
  imports: [  
    HomeRoutingModule,
    SharedModule,
    CommonModule,
    FormsModule
  ]
})
export class HomeModule { }
