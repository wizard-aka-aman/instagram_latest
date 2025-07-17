import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
 
import { SidebarComponent } from './components/sidebar/sidebar.component'; 
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule ,
    RouterModule ,
    FormsModule
  ],
  exports:[
    SidebarComponent
  ]
})
export class SharedModule { }
