import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
  username: string = "";
  email: string = "";
  fullname: string = "";
  //   username: string = 'username_here';
  //  fullname: string = 'Full Name';
  posts: number = 1;
  followers: number = 0;
  following: number = 29;
  bio: string = `This is bio\nThis is another line\nMore lines`;
  avatarUrl: string = 'assets/avatar.png';
  plusIconUrl: string = 'assets/plus.png';
  constructor(private Service: ServiceService , private route : ActivatedRoute) {
    this.username = this.Service.getUserName();
    this.email = this.Service.getEmail();
    this.fullname = this.Service.getFullName();
    console.log(this.username + this.email + this.fullname);

  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.getProfile(username);
      }
    });
  }
  getProfile(username: string) {
  // this.http.get(`https://localhost:7071/api/users/profile/${username}`)
  //   .subscribe(user => {
  //     this.user = user;
  //   }, err => {
  //     // handle user not found
  //   });
}

}
