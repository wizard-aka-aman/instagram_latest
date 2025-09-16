import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/service.service';
@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit, OnDestroy ,AfterViewInit {
  storiesGroupedByUser: any[] = []; 
  loggedInUserStory : any;
  loggedInUser : string = ""  
  currentUserStories: any[] = [];
  currentStoryIndex: number = 0;
  currentUser: any = null;
  showModal: boolean = false;
  storyInterval: any; 
  isStoryAvailable : boolean = false;
  posts : any;
  isLikedByMe = false;
  ListLike: any[] = []
  ListComment :any[]= []
  isSavedPost =false;
   likeAndUnLike = {
    postUsername: '',
    likedBy: '',
    postId: 0
  }
  newComment:string = "";
  formAddComment={
    CommentText :'',
    UserName : '',
    PostId : 0
  }
   newComments: { [postId: string]: string } = {}; // Har post ke liye alag comment
   private scrollPosition = 0;
  setPostId :number=0
  @ViewChildren('commentInput') commentInputs!: QueryList<ElementRef>;
  @ViewChild('comment') comment!: ElementRef<HTMLInputElement>;
  searchText: string = '';
    searchQuery = '';
  searchResults: any[] = []; 
  showDropdown = false;
  debounceTimer: any;
   AllFollowingResults :any[]=[]
  constructor(private serviceSrv : ServiceService,private toastr : ToastrService) {
    this.loggedInUser = this.serviceSrv.getUserName();
   }
  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrollPosition = window.scrollY; // save scroll position
  }
  ngOnInit(): void {
    this.serviceSrv.GetFollowing(this.loggedInUser).subscribe({
      next: (data:any) => {
         this.AllFollowingResults = data
      },
      error: (error) => {
        console.error(error);
        }
    })
    this.serviceSrv.GetLoggedInUserStory(this.loggedInUser).subscribe({
      next: (data:any) => { 
        this.loggedInUserStory = data;
        console.log(data);
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

    this.serviceSrv.DisplayPostHome(this.loggedInUser).subscribe({
      next: (data:any) => { 
        data.forEach((post: any) => {
          post.isLikedByMe =this.isLike(post.likes); 
        })
        this.posts = data; 
        console.log(this.posts);
      },
      error: (error) => {
        console.log(error);
        }
    })
     // Restore saved scroll position when component initializes
    setTimeout(() => {
      window.scrollTo({ top: this.scrollPosition, behavior: 'auto' });
    }, 0);
     const saved = localStorage.getItem('homeScroll');
     console.log(saved);
     
  if (saved) {
    setTimeout(() => {
      window.scrollTo({ top: +saved, behavior: 'auto' });
    }, 0);
  }
    this.serviceSrv.GetAllNotifications(this.loggedInUser).subscribe({
      next:(data:any)=>{
        console.log(data);
         this.serviceSrv.setNoti(data.every((e:any)=> e.isSeen))
      },
      error:(err:any)=>{
        console.log(err);
      },
    })
  } 


    ngOnDestroy(): void {
    // Save position before leaving
    localStorage.setItem('homeScroll', this.scrollPosition.toString());
  }


 getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }


  ngAfterViewInit() {
    window.scrollBy({ 
      top: 200, 
      left: 0, 
      behavior: 'smooth'   // optional for smooth scrolling
    });
 
  }


  TimeSincePost(postDateTimeString: string): string {
  const postTime = new Date(postDateTimeString);
  const currentTime = new Date();

  const diffMs = currentTime.getTime() - postTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${Math.floor(diffMinutes)} min ago`;
    } else {
      return `${Math.floor(diffHours)} hr ago`;
    }
  } else {
    // Agar 24 hr se jyada ho to date/time format
    return postTime.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

isLike(data: any): boolean { 
    this.ListLike = data
    for (let index = 0; index < this.ListLike.length; index++) {
      if (this.ListLike[index].userName == this.loggedInUser) {
        return true;
      }
    }
    return false;
  }
    Like(post:any) {
    console.log("like");
    this.likeAndUnLike.postId = post.postId;
    this.likeAndUnLike.likedBy = this.loggedInUser;
    this.likeAndUnLike.postUsername = post.userName;
    console.log(this.likeAndUnLike);

    this.serviceSrv.LikePost(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
         this.posts.forEach((postt: any) => {
          if(post.postId==postt.postId){
            post.isLikedByMe = true
            post.likesCount = post.likesCount+1
          } 
        }) 
        // this.isLikedByMe = true;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  UnLike(post:any) {
    console.log("unlike");
    this.likeAndUnLike.postId = post.postId;
    this.likeAndUnLike.likedBy = this.loggedInUser;
    this.likeAndUnLike.postUsername = post.userName;
    console.log(this.likeAndUnLike);
    this.serviceSrv.UnLikePost(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        this.posts.forEach((postt: any) => {
          if(post.postId==postt.postId){
            post.isLikedByMe = false
             post.likesCount = post.likesCount-1
          } 
        }) 
        // this.isLikedByMe = false;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
    addComment(post: any) {
    const commentText = this.newComments[post.postId]?.trim();
    if (!commentText) return;
    post.comments.push({
      userName: this.loggedInUser,
      commentText: commentText
    });

    this.formAddComment.CommentText = commentText;
    this.formAddComment.PostId = post.postId;
    this.formAddComment.UserName = this.loggedInUser; 
    console.log(this.formAddComment);
    
    this.serviceSrv.AddComment(this.formAddComment).subscribe({
      next: (postt: any) => {
        console.log(postt);
        this.posts.forEach((postt: any) => {
          if(post.postId==postt.postId){
              post.commentsCount++;
              this.newComments[post.postId] = ''; // Reset input 
          } 
        }) 
      },
      error: (err: any) => {
        console.log(err);
      }        
    }) 
  }
    
      AddSaved(post:any){
    const savedform = {
      postId: post.postId,
      UserName: this.loggedInUser,
    }; 
    console.log(savedform);
    
    this.serviceSrv.AddedToSaved(savedform).subscribe({
      next: (data: any) => {
        console.log(data); 
        this.posts.forEach((postt: any) => {
          if(post.postId==postt.postId){
            post.isSaved = true
          } 
        }) 
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  RemoveSaved(post:any){
   const savedform = {
      postId: post.postId,
      UserName: this.loggedInUser,
    }; 
    console.log(savedform);
    
    this.serviceSrv.RemovedFromSaved(savedform).subscribe({
      next: (data: any) => {
        console.log(data);
        this.posts.forEach((postt: any) => {
          if(post.postId==postt.postId){
            post.isSaved = false
          } 
        })  
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  FocusComment(post: any) {
    setTimeout(() => {
      const index = this.posts.findIndex((p:any) => p.postId === post.postId);
      const input = this.commentInputs.toArray()[index];
      if (input) input.nativeElement.focus();
    }, 0);
  }

  selectedLikes: any[] = [];

openLikesModal(post: any) {
  this.selectedLikes = post.likes;
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
  SendPost(user:string, ){
    const sendform= {
      "groupName": this.loggedInUser,
      "user": user,
      "postId": this.setPostId
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
  AddPostId(post:any){
    this.setPostId = post.postId;
     this.searchResults =this.AllFollowingResults
  }
  
}
