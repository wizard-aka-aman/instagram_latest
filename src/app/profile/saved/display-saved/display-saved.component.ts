import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-saved',
  templateUrl: './display-saved.component.html',
  styleUrls: ['./display-saved.component.scss']
})
export class DisplaySavedComponent implements OnInit {
  username: string = "";
  email: string = "";
  fullname: string = "";
  //   username: string = 'username_here';
  //  fullname: string = 'Full Name';
  numberposts: number = 0;
  followers: number = 0;
  following: number = 0;
  bio: string = "";
  avatarUrl: string = 'assets/avatar.png';
  plusIconUrl: string = 'assets/plus.png';
  activeTab = 'saved';

  posts = [
    // { imageUrl: 'assets/avatar.png' },
    // { imageUrl: 'assets/default.png' },
    // { imageUrl: 'assets/plus.png' }, 
  ];
  constructor(private route: ActivatedRoute, private Service: ServiceService) {
    // this.username = this.Service.getUserName();
    this.email = this.Service.getEmail();
    // this.fullname = this.Service.getFullName();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.username = (String)(params.get('username'));
      if (this.username) {
        this.getProfile(this.username);
      }
    });
  }
  getProfile(username: string) {
    this.Service.GetProfileByUserName(username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.fullname = data.fullName;
        this.bio = data.bio;
        if (data.profilePicture == null) {
          this.avatarUrl = 'assets/avatar.png';
        } else {
          this.avatarUrl = data.profilePicture;
        }
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

}
