import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
  storiesGroupedByUser: any[] = []; 
  loggedInUserStory : any;
  loggedInUser : string = ""  
  currentUserStories: any[] = [];
  currentStoryIndex: number = 0;
  currentUser: any = null;
  showModal: boolean = false;
  storyInterval: any; 
  isStoryAvailable : boolean = false;
  
  constructor(private serviceSrv : ServiceService) {
    this.loggedInUser = this.serviceSrv.getUserName();
   }

  ngOnInit(): void {
    this.serviceSrv.GetLoggedInUserStory(this.loggedInUser).subscribe({
      next: (data:any) => { 
        this.loggedInUserStory = data;
        console.log();
        if(this.loggedInUserStory.displayStories.length >0){
          this.isStoryAvailable = true;
        }
        console.log(data);
      },
      error: (error) => {
        console.error(error);
        }
    })
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
 getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
  
  openStory(user: any) {
    this.currentUser = user;
    this.currentUserStories = user.displayStories;
    this.currentStoryIndex = 0;
    this.showModal = true;

    // this.autoPlay();
  }

  closeStory() {
    this.showModal = false;
    clearInterval(this.storyInterval);
  }

  nextStory() {
    if (this.currentStoryIndex < this.currentUserStories.length - 1) {
      this.currentStoryIndex++;
    } else {
      
      this.closeStory();
    }
  }

  prevStory() {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
    }
  }

  autoPlay() {
    clearInterval(this.storyInterval);
    this.storyInterval = setInterval(() => {
      this.nextStory();
    }, 5000);
  }
 stories = [
    {
      storyId: 9,
      imageUrl: "iVBORw0KGgoAAmiwAAAABJRU5ErkJggg==",
      createdAt: 22,
      expirationTime: "2025-07-25T16:48:15.4076724",
      isSeen: false,
      likedBy: [
        { username: "john_doe", profilePicture: "Ukl4A" },
        { username: "jane_smith", profilePicture: "Ukl5B" }
      ]
    },
    {
      storyId: 10,
      imageUrl: "iVBORw0KGgoAAmiwAAAAXYZERkJggg==",
      createdAt: 25,
      expirationTime: "2025-08-01T18:30:00.0000000",
      isSeen: true,
      likedBy: [
        { username: "alex", profilePicture: "Ukl6C" },
        { username: "sam", profilePicture: "Ukl7D" }
      ]
    }
  ];

  selectedLikes: any[] = [];
  selectedStoryId: number | null = null;

  openLikesModal(storyId: number): void {
    const story = this.stories.find(s => s.storyId === storyId);
    if (story) {
      this.selectedLikes = story.likedBy;
      this.selectedStoryId = storyId;
    }
  }
  
}
