import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';
import { StoryTransferService } from 'src/app/story-transfer.service';

@Component({
  selector: 'app-displaystories',
  templateUrl: './displaystories.component.html',
  styleUrls: ['./displaystories.component.scss']
})
export class DisplaystoriesComponent implements OnInit {

  usersWithStories: any[] = []; // this should be fetched from API  ;
  currentUserIndex: number = 0;
  currentUserStories: any[] = [];
  currentStoryIndex: number = 0;
  currentUser: any = null;
  showModal: boolean = false;
  storyInterval: any;
  loggedInUser: string = ""
  urlUsername: string = ""
  progress: number = 0;
  progressInterval: any;
  progressStartTime: number = 0;
  remainingTime: number = 5000; // initially full
  isTimerStoped = false;
  myPersonalStories: any;
  isMyPersonalStories = false;
  personalcurrentStoryIndex: number = 0;
  personalisTimerStoped: boolean = false;
  personalprogress: number = 0;


  constructor(private serviceSrv: ServiceService, private route: ActivatedRoute,private router : Router , private storyTransfer : StoryTransferService,    private location: Location,) {
    this.loggedInUser = this.serviceSrv.getUserName();
  }
  ngOnInit() {
     
     const story = this.storyTransfer.getStory();
     if (story) {
    this.isMyPersonalStories = false;
    this.usersWithStories = [
      {
        username: story.username,
        displayStories: story.mediaUrls.map((url: string) => ({
          imageUrl: url,
          createdAt: this.TimeSincePost(story.createdAt as string),
          storyId: story.id
        }))
      }
    ];

    this.openStory(this.usersWithStories[0]);
    this.storyTransfer.clearStory();
    return;
  }

    this.route.paramMap.subscribe({
      next: (params) => {
        this.urlUsername = (String)(params.get('username'));
      }
    })
    if (this.loggedInUser == this.urlUsername) {
      console.log("self");
      this.serviceSrv.GetPersonalStories(this.loggedInUser).subscribe({
        next: (data: any) => {
          this.isMyPersonalStories = true;
          this.myPersonalStories = data;
          console.log(data);
        },
        error: (error) => {
          console.error(error);
        }
      })
    }
    else {
      this.serviceSrv.GetStoryByUsername(this.loggedInUser).subscribe({
        next: (data: any) => {
          console.log(data);
          this.usersWithStories = data;
          this.isMyPersonalStories = false;
          this.openStory(this.usersWithStories.filter(e => e.username == this.urlUsername)[0]);
          console.log(this.usersWithStories);
        },
        error: (error) => {
          console.error(error);
        }
      })
    }
  }
  nextUser() {
    this.isTimerStoped = false
    if (this.currentUserIndex < this.usersWithStories.length - 1) {
      const nextUser = this.usersWithStories[this.currentUserIndex + 1];
      console.log([nextUser][0]);
      this.openStory([nextUser][0]);
      console.log("next user if");
    }else{
     console.log("next user else");
    }
  }

  prevUser() {
    this.isTimerStoped = false
    if (this.currentUserIndex > 0) {
      const prevUser = this.usersWithStories[this.currentUserIndex - 1];
      console.log([prevUser][0]);
      this.openStory([prevUser][0]);
    }
  }


  openStory(user: any) {
    this.currentUser = user;
    this.currentUserStories = user.displayStories;
    this.currentStoryIndex = 0;
    this.showModal = true;
    // Set the index of current user
    this.currentUserIndex = this.usersWithStories.findIndex(u => u.username === user.username);
    console.log(this.usersWithStories[this.currentUserIndex]?.username);
    this.markStoryAsSeen(this.currentUserStories[this.currentStoryIndex].storyId);


    this.autoPlay();
  }

  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }

  markStoryAsSeen(storyId: number) {
    const payload = {
      storyId: storyId,
      seenByUsername: this.loggedInUser
    };

    this.serviceSrv.postStorySeen(payload).subscribe({
      next: () => console.log("Story marked as seen."),
      error: (err) => console.error("Error marking seen", err)
    });
  }

  hoursSincePost(postDateTimeString: string): number {
    const postTime = new Date(postDateTimeString);
    const currentTime = new Date();

    const diffInMs = currentTime.getTime() - postTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours.toFixed(1) as unknown as number;
  }
   TimeSincePost(postDateTimeString: string): string {
    const postTime = new Date(postDateTimeString);
    const currentTime = new Date();
    const diffMs = currentTime.getTime() - postTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) {
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes < 1) { return 'Just now'; }
      else if (diffMinutes < 60) { return `${Math.floor(diffMinutes)} min ago` }
      else { return `${Math.floor(diffHours)} hr ago` }
    }
    else { return postTime.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }); }
  }

  autoPlay() {
    clearInterval(this.storyInterval);
    clearInterval(this.progressInterval);

    this.progress = 0;
    this.progressStartTime = Date.now();
    this.remainingTime = 5000;

    // Start progress bar
    this.progressInterval = setInterval(() => {
      this.progress += 1;
      if (this.progress >= 100) {
        clearInterval(this.progressInterval);
      }
    }, 50);

    // Set story timeout
    this.storyInterval = setTimeout(() => {
      this.nextStory();
    }, this.remainingTime);
  }

  stoptime() {
    this.isTimerStoped = true
    clearInterval(this.storyInterval);
    clearInterval(this.progressInterval);

    const elapsed = Date.now() - this.progressStartTime;
    this.remainingTime = this.remainingTime - elapsed;
  }
  playtime() {
    this.isTimerStoped = false
    this.progressStartTime = Date.now();

    // Resume progress bar
    this.progressInterval = setInterval(() => {
      this.progress += 1;
      if (this.progress >= 100) {
        clearInterval(this.progressInterval);
      }
    }, this.remainingTime / (100 - this.progress)); // dynamic step

    // Resume story timeout
    this.storyInterval = setTimeout(() => {
      this.nextStory();
    }, this.remainingTime);
  }

  nextStory() {
    this.isTimerStoped = false
    if (this.currentStoryIndex < this.currentUserStories.length - 1) {
      this.currentStoryIndex++;
      this.autoPlay(); // reset timer when new story shown
      this.markStoryAsSeen(this.currentUserStories[this.currentStoryIndex].storyId);
    } else {
      this.nextUser();
    }
  }

  prevStory() {
    this.isTimerStoped = false
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.autoPlay(); // reset timer when going back
    }
  }

  closeStory() {
    this.isTimerStoped = true
    this.showModal = false;
    clearInterval(this.storyInterval);
    clearInterval(this.progressInterval);

       this.location.back();
  }


  //personal


  personalnextStory() {
    if (this.personalcurrentStoryIndex < this.myPersonalStories[0].displayStories.length - 1) {
      this.personalcurrentStoryIndex++;

    }
  }

  personalprevStory() {
    if (this.personalcurrentStoryIndex > 0) {
      this.personalcurrentStoryIndex--;

    }
  }

}