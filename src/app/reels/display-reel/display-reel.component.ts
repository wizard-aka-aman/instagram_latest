import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/service.service';
import Swal from 'sweetalert2';
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
  searchText: string = '';
  searchQuery = '';
  searchResults: any[] = []; 
  showDropdown = false;
  debounceTimer: any;
  setReelPublicId:string =""
  AllFollowingResults:any[]=[]
  selectedLikes :any[]=[]
  constructor(private serviceSrv: ServiceService, private route: ActivatedRoute, private eRef: ElementRef ,private toastr : ToastrService) {
    this.LoggedInUser = this.serviceSrv.getUserName();

    this.route.paramMap.subscribe((params: any) => {
      this.publicid = params.get('publicid');
      this.fivereel();
    });
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Corrected to check the element clicked instead of a hardcoded ID
    this.reels.forEach((reel, i) => {
      const commentBox = document.getElementById('comment-box-' + i); // Use index 'i' for the ID
      if (reel.showComments && commentBox && !commentBox.contains(event.target as Node)) {
        reel.showComments = false;
      }
    });
  }

  ngOnInit(): void {
     this.serviceSrv.GetFollowing(this.LoggedInUser).subscribe({
      next: (data:any) => {
        // this.searchResults = data;
        this.AllFollowingResults = data;
      },
      error: (error) => {
        console.error(error);
        }
    })
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
    return  image;
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
  HandleLike(reel: any, isLikedLoggedInUser: boolean,isForLike:boolean) {
    if (isForLike) {
      this.likeAndUnLike.Publicid = this.publicid;
      this.likeAndUnLike.LikedBy = this.LoggedInUser;
      this.serviceSrv.LikeReel(this.likeAndUnLike).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    } else {
      this.likeAndUnLike.Publicid = this.publicid;
      this.likeAndUnLike.LikedBy = this.LoggedInUser;
      this.serviceSrv.UnLikeReel(this.likeAndUnLike).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    }
  }
  deBounceTimeForLike :any;
  Like(reel: any,isLikedLoggedInUser:boolean,isForLike:boolean) {
    clearTimeout(this.deBounceTimeForLike);
    if(isForLike){
      reel.isLikedLoggedInUser = true;
      reel.likesCount += 1;
    }else{
      reel.isLikedLoggedInUser = false;
      reel.likesCount -= 1;
    }
    this.deBounceTimeForLike = setTimeout(() => {
      this.HandleLike(reel,isLikedLoggedInUser,isForLike);
    }, 300);
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
        if (this.chatContainer) {
          const el = this.chatContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
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
        reel.comments.push({
          ...commentPayload,
          profilePicture: this.profilePicture
        });
        reel.newComment = '';
        reel.commentsCount += 1;
        setTimeout(() => {
          if (this.chatContainer) {
            const el = this.chatContainer.nativeElement;
            el.scrollTop = el.scrollHeight;
          }
        }, 150);
    this.serviceSrv.CommentReel(commentPayload).subscribe({
      next: (data: any) => {
      },
      error: (err: any) => {
        console.error(err);
        reel.comments.pop();
        reel.newComment = '';
        reel.commentsCount -= 1;
        setTimeout(() => {
          if (this.chatContainer) {
            const el = this.chatContainer.nativeElement;
            el.scrollTop = el.scrollHeight;
          }
        }, 150);
      }
    });
  }
  Follow(reel:any){
    if(reel.isPublic){
      const followForm = {
    followerUsername: '',
    followingUsername: ''
  };
   followForm.followerUsername = this.LoggedInUser
    followForm.followingUsername = reel.userName;
    console.log(followForm);
    reel.alreadyFollowing = true ;
    this.serviceSrv.FollowPost(followForm).subscribe({
      next: (res: any) => {
        console.log(res); 
      },
      error: (err) => {
        console.log(err);
        reel.alreadyFollowing = false ;
      }
    })
    }else{
      const addreq = {
        userNameOfReqFrom: this.LoggedInUser,
        userNameOfReqTo: reel.userName
      }
      reel.isRequested = true;
      this.serviceSrv.AddRequested(addreq).subscribe({
        next: (res: any) => {
          console.log(res);
        },
        error: (err) => {
          reel.isRequested = false;
          console.log(err);
        }
      })
      
    }
  }

  UnFollow(reel:any){
     if(!reel.isPublic){
       Swal.fire({
         title: 'Unfollow User?',
         html: `<p style="color: #999; margin-top: 10px; line-height: 1.6;">If you change your mind, you'll need to send a follow request to <strong style="color: #fff;">${reel.userName}</strong> again.</p>`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: 'Unfollow',
         cancelButtonText: 'Cancel',
         reverseButtons: true,
         background: '#000000',
         color: '#ffffff',
         iconColor: '#ffffff',
         backdrop: 'rgba(0, 0, 0, 0.95)',
         confirmButtonColor: '#ffffff',
         cancelButtonColor: '#000000',
         customClass: {
           popup: 'black-white-popup',
           confirmButton: 'black-white-confirm-btn',
           cancelButton: 'black-white-cancel-btn'
         }
       }).then((result) => {
         if (result.isConfirmed) {
           this.followForm.followerUsername = this.LoggedInUser
           this.followForm.followingUsername = reel.userName;
           console.log(this.followForm);
           reel.alreadyFollowing = false;
           reel.isRequested = false;
           this.serviceSrv.UnFollowPost(this.followForm).subscribe({
             next: (res: any) => {
               console.log(res);

             },
             error: (err) => {
               console.log(err);
               reel.alreadyFollowing = true;
               reel.isRequested = true;
             }
           })
         }
       });
  }
  else{
     this.followForm.followerUsername = this.LoggedInUser
    this.followForm.followingUsername = reel.userName;
    console.log(this.followForm);
      reel.alreadyFollowing = false;
        reel.isRequested = false;
    this.serviceSrv.UnFollowPost(this.followForm).subscribe({
      next: (res: any) => {
        console.log(res);
      
      },
      error: (err) => {
        console.log(err);
          reel.alreadyFollowing = true;
        reel.isRequested = true;
      }
    })
  }
  }
  RemoveRequest(reel:any){
      reel.isRequested = false;
      this.serviceSrv.DeleteRequest(this.LoggedInUser,reel.userName).subscribe({
        next: (data:any) => {
          console.log(data);
        },
        error: (error) => {
        reel.isRequested = true;
        console.error(error);
      }
    })
  }
  DisableDownload(event:any){
    event.preventDefault();
    
  }
  AddPublicId(reel:any){
 this.setReelPublicId = reel.publicid;
 this.searchResults =this.AllFollowingResults
  }
   performSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    this.serviceSrv.SearchUsers(query).subscribe({
      next: (res: any) => {
        this.searchResults = res;
        this.showDropdown = true;
      },
      error: (err) => {
        console.error(err);
        this.searchResults = [];
        this.showDropdown = false;
      }
    });
  }
   DeBounce() { 
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => { 
      this.performSearch(this.searchQuery);
    }, 300); // ⏱ 300ms delay
  }
  ClearSearchQuery() {
    this.searchQuery = ""; 
    this.searchResults = [];
    this.showDropdown = false;
  }
  SendPost( user:string){
    const sendform= {
      "groupName": this.LoggedInUser,
      "user": user, 
      "reelPublicId": this.setReelPublicId
    }
    this.serviceSrv.SendPost(sendform).subscribe({
      next: (data: any) => {
        console.log(data);
        this.toastr.success(data.message)
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error("Error Occured!!")
      }
    })
  }
  ToogleLike(reel:any){ 
    this.selectedLikes = reel.likes;
    
  }
  // Add these properties to your existing DisplayReelComponent class
private touchStartY: number = 0;
private touchCurrentY: number = 0;
private isDragging: boolean = false;
private commentsPanelElement: HTMLElement | null = null;
private currentDraggingReel: any = null;

// Add this method to handle drag start
onDragStart(event: TouchEvent | MouseEvent, reel: any): void {
  this.isDragging = true;
  this.currentDraggingReel = reel;
  
  if (event instanceof TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  } else {
    this.touchStartY = event.clientY;
  }
  
  this.commentsPanelElement = (event.target as HTMLElement).closest('.comments-panel');
  
  if (this.commentsPanelElement) {
    this.commentsPanelElement.style.transition = 'none';
  }
}

// Add this method to handle dragging
onDragMove(event: TouchEvent | MouseEvent, reel: any): void {
  if (!this.isDragging || !this.commentsPanelElement || this.currentDraggingReel !== reel) return;
  
  if (event instanceof TouchEvent) {
    this.touchCurrentY = event.touches[0].clientY;
  } else {
    this.touchCurrentY = event.clientY;
  }
  
  const deltaY = this.touchCurrentY - this.touchStartY;
  
  // Only allow dragging down (positive deltaY)
  if (deltaY > 0) {
    this.commentsPanelElement.style.transform = `translateY(${deltaY}px)`;
  }
}

// Add this method to handle drag end
onDragEnd(event: TouchEvent | MouseEvent, reel: any): void {
  if (!this.isDragging || !this.commentsPanelElement || this.currentDraggingReel !== reel) return;
  
  const deltaY = this.touchCurrentY - this.touchStartY;
  const threshold = 150; // Distance to trigger close
  
  this.commentsPanelElement.style.transition = 'transform 0.3s ease';
  
  if (deltaY > threshold) {
    // Close comments
    this.commentsPanelElement.style.transform = 'translateY(100%)';
    setTimeout(() => {
      reel.showComments = false;
      if (this.commentsPanelElement) {
        this.commentsPanelElement.style.transform = '';
        this.commentsPanelElement.style.transition = '';
      }
    }, 300);
  } else {
    // Snap back
    this.commentsPanelElement.style.transform = 'translateY(0)';
    setTimeout(() => {
      if (this.commentsPanelElement) {
        this.commentsPanelElement.style.transition = '';
      }
    }, 300);
  }
  
  this.isDragging = false;
  this.touchStartY = 0;
  this.touchCurrentY = 0;
  this.commentsPanelElement = null;
  this.currentDraggingReel = null;
}

// Prevent scrolling when dragging from header
onHeaderTouchStart(event: TouchEvent, reel: any): void {
  this.onDragStart(event, reel);
}

onHeaderTouchMove(event: TouchEvent, reel: any): void {
  if (this.isDragging && this.currentDraggingReel === reel) {
    event.preventDefault(); // Prevent scroll when dragging from header
  }
  this.onDragMove(event, reel);
}
}