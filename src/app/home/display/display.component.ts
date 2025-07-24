import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
  storiesGroupedByUser: any[] = [];
  currentUserStories: any[] = [];
  currentStoryIndex: number = 0;
  currentStory: any = null;
  loggedInUser : string = ""

  constructor(private serviceSrv : ServiceService) {
    this.loggedInUser = this.serviceSrv.getUserName();
   }

  ngOnInit(): void {
    this.serviceSrv.GetStoryByUsername(this.loggedInUser).subscribe({
      next: (data:any) => {
        console.log(data);
        this.storiesGroupedByUser = data;
      },
      error: (error) => {
        console.error(error);
        }
    })
  }
  openStory(user: any) {
    this.currentUserStories = user;
    this.currentStoryIndex = 0;
    this.currentStory = this.currentUserStories[0];

    this.autoNext();
  }

  nextStory() {
    this.currentStoryIndex++;
    if (this.currentStoryIndex < this.currentUserStories.length) {
      this.currentStory = this.currentUserStories[this.currentStoryIndex];
    } else {
      this.currentStory = null;
    }
  }

  autoNext() {
    setTimeout(() => {
      this.nextStory();
      if (this.currentStory) {
        this.autoNext();
      }
    }, 5000);
  }
 getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
}
