import { NgModule } from '@angular/core'; 
import { HomeRoutingModule } from './home-routing.module';
import { DisplayComponent } from './display/display.component';   
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DisplayComponent , 
  ],
  imports: [  
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
