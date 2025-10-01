import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-tagged',
  templateUrl: './display-tagged.component.html',
  styleUrls: ['./display-tagged.component.scss']
})
export class DisplayTaggedComponent implements OnInit {
  activeTab = 'tagged';
  isPostAvailable = false;
  fullDetailPost: any;
  selectedPost: any = null;
  newComment: string = '';
  followForm={
    followerUsername : '',
    followingUsername: ''
  }
  follower :any;
  followingdata :any;
  isRequested:boolean = false;
  isSeenUserFollwingMeVariable : boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
   @Input() isPublic: boolean = false;
    @Input() alreadyFollowing: boolean = false;
    @Input() loggedInUserName: string = "";
    @Input() username: string = "";
  constructor(private Service: ServiceService, private route: ActivatedRoute , private router: Router) {
  } 
  ngOnInit(): void {

  this.route.paramMap.subscribe(params => {
    this.username = String(params.get('username'));
    if (this.username) {
    }

  });

  // 👇 Subscribe to refresh signal
  this.Service.postRefresh$.subscribe(refresh => {
    if (refresh) {
      this.fullDetailPost = []; // Clear old posts
    }
  });
}

  

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  close() {
    this.closeModal.nativeElement.click();
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const fData = new FormData();
      fData.append('filecollection', file); // must match parameter name in backend 
      console.log(fData);

      // TODO: Upload logic here (send to backend, etc.)
      this.Service.UploadProfilePicture(this.username, fData).subscribe({
        next: (res: any) => {
          console.log(res);
          this.close();
        },
        error: (err) => {
          console.log(err);
          this.close();
        }
      })
    }
  }

  openPostPage(postId: number) {
    this.router.navigate([`/${this.username}/p/${postId}`]);
  }

    getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
}
