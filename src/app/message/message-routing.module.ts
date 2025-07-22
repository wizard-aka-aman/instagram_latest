import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplaymessageComponent } from './displaymessage/displaymessage.component';
import { ChatwindowComponent } from './chatwindow/chatwindow.component'; 
import { RightsideComponent } from './rightside/rightside.component';



const routes: Routes = [
  {
    path :"t",
    component: DisplaymessageComponent,
     children: [
      {
        path: ':groupname',
        component: RightsideComponent
      },
      {
        path: '',
        component: RightsideComponent // optional "Select a chat" page
      }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
