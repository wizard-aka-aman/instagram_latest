import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent  {
  username: string = "";

  constructor(private Service : ServiceService) {
    this.username = this.Service.getUserName();
   }

  ngOnInit(): void {
  }
  logout(){
    const pakka  = confirm("Sure you want to Logout?");
    if(pakka){
      localStorage.removeItem('jwt');
      window.location.reload()
    }
  }
}
