import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-display-tagged',
  templateUrl: './display-tagged.component.html',
  styleUrls: ['./display-tagged.component.scss']
})
export class DisplayTaggedComponent implements OnInit {
username: string = "";
  email: string = "";
  fullname: string = "";
  //   username: string = 'username_here';
  //  fullname: string = 'Full Name';
  numberposts: number = 1;
  followers: number = 0;
  following: number = 29;
  bio: string = `This is bio\nThis is another line\nMore lines`;
  avatarUrl: string = 'assets/avatar.png';
  plusIconUrl: string = 'assets/plus.png';
  activeTab = 'tagged';

posts = [
  // { imageUrl: 'assets/avatar.png' },
  // { imageUrl: 'assets/default.png' },
  // { imageUrl: 'assets/plus.png' }, 
];
  constructor(private route: ActivatedRoute) { 
    this.route.paramMap.subscribe(params => {
      this.username =(String) (params.get('username'));
      // if (this.username) {
      //   this.getProfile(this.username);
      // }
    });
  }

  ngOnInit(): void {
  }

}
