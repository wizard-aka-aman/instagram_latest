import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-reel',
  templateUrl: './display-reel.component.html',
  styleUrls: ['./display-reel.component.scss']
})
export class DisplayReelComponent implements OnInit {
  reels: any[] = [];
  publicid: string = '';
  LoggedInUser: string = '';
  profilePicture: string = ""
  shouldScrollToBottom: boolean = true;
  @ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('scrollContainerRef') scrollContainers!: QueryList<ElementRef>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  private observer!: IntersectionObserver;
  likeAndUnLike = {
    Publicid: '',
    LikedBy: ''
  }
  isLoadingReels = false;
  followForm = {
    followerUsername: '',
    followingUsername: ''
  }
  constructor(private serviceSrv: ServiceService, private route: ActivatedRoute, private eRef: ElementRef) {
    this.LoggedInUser = this.serviceSrv.getUserName();

    this.route.paramMap.subscribe((params: any) => {
      this.publicid = params.get('publicid');
      this.fivereel();
    });
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.reels.forEach(reel => {
      const commentBox = document.getElementById('comment-box-' + reel.id);
      if (reel.showComments && commentBox && !commentBox.contains(event.target as Node)) {
        reel.showComments = false;
      }
    });
  }

  ngOnInit(): void {
    this.serviceSrv.GetProfileByUserName(this.LoggedInUser).subscribe({
      next: (data: any) => {
        console.log(data);
        this.profilePicture = data.profilePicture;

      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  ngAfterViewInit(): void {
    // Wait for videos to be loaded
    this.videoPlayers.changes.subscribe(() => {
      this.setupIntersectionObserver();
    });

  }

  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }

  fivereel() {
    this.serviceSrv.GetFiveReel(this.LoggedInUser).subscribe({
      next: (res: any) => {
        this.reels = [...this.reels, ...res];
        console.log(this.reels);
        this.isLoadingReels = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoadingReels = false;
      }
    });
  }

  // ✅ Pause all other videos except the one in view
  setupIntersectionObserver() {

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video: HTMLVideoElement = entry.target as HTMLVideoElement;
          let index = this.videoPlayers.toArray().findIndex(
            v => v.nativeElement === video
          );
          // console.log(  entry);

          if (entry.isIntersecting) {
            // ✅ Close comments for all other reels
            this.reels.forEach((reel, i) => {
              reel.showComments = i === index ? reel.showComments : false;
            });


            console.log(index);
            if (index == this.reels.length - 3 && !this.isLoadingReels) {
              this.isLoadingReels = true;
              this.fivereel();
              return
            }
            // console.log(video);
            console.log(video.src);
            this.publicid = video.src.split('/')[8 - 1].split('.mp4')[0]
            console.log(video.src.split('/')[8 - 1].split('.mp4')[0]);
            video.play().catch(() => { }); // avoid autoplay error

          } else {
            video.pause();
            video.currentTime = 0; // ✅ Rewind video to start
          }
        });
      },
      {
        threshold: 0.7 // video should be 70% visible to play
      }
    );

    this.videoPlayers.forEach((videoElement) => {
      this.observer.observe(videoElement.nativeElement);
    });
  }

  StopAndPlayVideo(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  Like(reel: any, isLikedLoggedInUser: boolean) {
    if (isLikedLoggedInUser) {
      return;
    }
    console.log("like");
    this.likeAndUnLike.Publicid = this.publicid;
    this.likeAndUnLike.LikedBy = this.LoggedInUser;
    console.log(this.likeAndUnLike);

    this.serviceSrv.LikeReel(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        // ✅ Update local reel immediately
        reel.isLikedLoggedInUser = true;
        reel.likesCount += 1;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  UnLike(reel: any) {
    console.log("unlike");
    this.likeAndUnLike.Publicid = this.publicid;
    this.likeAndUnLike.LikedBy = this.LoggedInUser;
    console.log(this.likeAndUnLike);
    this.serviceSrv.UnLikeReel(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        // ✅ Update local reel immediately
        reel.isLikedLoggedInUser = false;
        reel.likesCount -= 1;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  toggleComments(selectedReel: any, event: MouseEvent) {
    event.stopPropagation();
    this.reels.forEach(reel => {
      if (reel !== selectedReel) {
        reel.showComments = false; // close other reels' comments
      }
    });

    // Toggle selected reel's comment
    selectedReel.showComments = !selectedReel.showComments;
    // Wait for DOM to render comment section, then scroll

    // Scroll after comment box opens
    if (selectedReel.showComments) {
      setTimeout(() => {
        const el = this.chatContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 150);
    }

  }

  postComment(reel: any) {
    if (!reel.newComment || reel.newComment.trim() === '') return;

    const commentPayload = {
      publicId: reel.publicid,
      commentText: reel.newComment,
      userName: this.LoggedInUser
    };

    this.serviceSrv.CommentReel(commentPayload).subscribe({
      next: (data: any) => {
        reel.comments.push({
          ...commentPayload,
          profilePicture: this.profilePicture
        });
        reel.newComment = '';
        reel.commentsCount += 1;
        setTimeout(() => {
          const el = this.chatContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }, 150);

      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
  Follow(reel:any) {
    this.followForm.followerUsername = this.LoggedInUser
    this.followForm.followingUsername = reel.userName;
    console.log(this.followForm);

    this.serviceSrv.FollowPost(this.followForm).subscribe({
      next: (res: any) => {
        console.log(res);
        reel.isLoggedInUserFollow = true
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  UnFollow(reel:any) {
    this.followForm.followerUsername = this.LoggedInUser
    this.followForm.followingUsername = reel.userName;
    console.log(this.followForm);
    
    this.serviceSrv.UnFollowPost(this.followForm).subscribe({
      next: (res: any) => {
        console.log(res);  
        reel.isLoggedInUserFollow = false
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  DisableDownload(event:any){
    event.preventDefault();
    
  }
}