import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageRoutingModule } from './message-routing.module';
import { DisplaymessageComponent } from './displaymessage/displaymessage.component';
import { ChatwindowComponent } from './chatwindow/chatwindow.component'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RightsideComponent } from './rightside/rightside.component'; 


@NgModule({
  declarations: [
    DisplaymessageComponent,
    ChatwindowComponent,
    RightsideComponent 
  ],
  imports: [
    CommonModule,
    MessageRoutingModule,
    FormsModule,
    RouterModule, 
  ]
})
export class MessageModule { }
