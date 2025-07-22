import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-chatwindow',
  templateUrl: './chatwindow.component.html',
  styleUrls: ['./chatwindow.component.scss']
})
export class ChatwindowComponent implements OnInit {

  chatList: any;
  loggedInUser: string = ""

  constructor(private route: ActivatedRoute, private service: ServiceService) { }

  ngOnInit() {
    this.loggedInUser = this.service.getUserName()
    this.service.GetFollowing(this.loggedInUser).subscribe({
      next: (data: any) => {
        console.log(data); 
        this.chatList = data;
        this.service.setChatList(data);
      },
      error: (error: any) => {
        console.error(error);
      }

    })
  }
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }

}
