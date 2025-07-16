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
  numberposts: number = 1;
  followers: number = 0;
  following: number = 29;
  bio: string = "";
  avatarUrl: string = 'assets/avatar.png';
  plusIconUrl: string = 'assets/plus.png';
  activeTab = 'posts';

posts = [
  // { imageUrl: 'assets/avatar.png' },
  // { imageUrl: 'assets/default.png' },
  // { imageUrl: 'assets/plus.png' }, 
];
  constructor(private Service: ServiceService , private route : ActivatedRoute) {
    // this.username = this.Service.getUserName();
    this.email = this.Service.getEmail();
    this.fullname = this.Service.getFullName();
    console.log(this.username + this.email + this.fullname);

  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.username =(String) (params.get('username'));
      if (this.username) {
        this.getProfile(this.username);
      }
    });
  }
  getProfile(username: string) {
 this.Service.GetProfileByUserName(username).subscribe({
  next: (data:any) => {
    console.log(data); 
    this.email = data.email;
    this.fullname = data.fullName;
    this.bio = data.bio;
 },
 error: (error: any) => {
  console.error(error);
  }
});
}

}
