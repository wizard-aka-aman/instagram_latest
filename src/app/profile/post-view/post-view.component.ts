import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss']
})
export class PostViewComponent implements OnInit {

  post: any;
  username!: string;
  LoggedInUser: string = "";
  postid!: number;
  newComment = '';
  user: any = {
    userName: '',
    profilePicture: '',
  };
  multiplePost : any[]=[]
  singlepost = {
    caption: '',
    imageUrl: '',
    commentsCount: 0,
    likesCount: 0,
    createdAt: '',
    postId: 0,
  };
  likeAndUnLike = {
    postUsername: '',
    likedBy: '',
    postId: 0
  }
  formAddComment = {
    CommentText: '',
    UserName: '',
    PostId: 0
  }
  isLikedByMe = false;
  zeroLike = true;
  ListLike: any[] = []
  ListComment: any[] = []
  isSavedPost = false;
  searchText: string = '';
  searchQuery = '';
  searchResults: any[] = [];
  showDropdown = false;
  debounceTimer: any;
  AllFollowingResults: any[] = []
  setPostId: number = 0
  loggedInUsernameProfile: string = ""
  // In your component.ts 
taggedUsers: any[] = [];
showTags: boolean = false;
mediaWithTags: any[] = []; // holds the parsed JSON
currentImageIndex: number = 0; // track current carousel index

// When carousel slides, update index
onCarouselSlide(event: any) {
  this.currentImageIndex = event.to;
}

// Get tags for current image
getTagsForCurrentImage() {
  if (!this.mediaWithTags || !this.mediaWithTags[this.currentImageIndex]) return [];
  return this.mediaWithTags[this.currentImageIndex].TaggedUsers || [];
}

  @ViewChild('comment') comment!: ElementRef<HTMLInputElement>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService,
    private location: Location,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.LoggedInUser = this.service.getUserName();
    this.route.paramMap.subscribe((params: any) => {
      this.username = params.get('username')!;
      this.postid = Number(params.get('postid'));
      this.getPostById(this.postid);

    });

  }

  getPostById(id: number) {
    this.service.GetPostByIdWithUserNameAsync(id, this.username, this.LoggedInUser).subscribe({
      next: (data: any) => {
        console.log(data);
        this.user.userName = data.userName
        this.user.profilePicture = data.profilePicture
        this.singlepost.caption = data.caption
        this.singlepost.commentsCount = data.commentsCount
        this.singlepost.imageUrl = data.imageUrl
        this.singlepost.likesCount = data.likesCount
        this.singlepost.createdAt = data.createdAt
        this.singlepost.postId = data.postId
        this.ListComment = data.comments
        this.multiplePost = data.mediaUrl
        this.isSavedPost = data.isSaved
        this.taggedUsers = data.taggedUsers
        this.loggedInUsernameProfile = data.loggedInUsernameProfile
        if (data.likesCount == 0) {
          this.zeroLike = true;
        }
        else {
          this.zeroLike = false;
        }
        this.isLikedByMe = this.isLike(data.likes);
        console.log(this.isLikedByMe);
        console.log(this.ListComment); 
        console.log(this.taggedUsers[0]?.taggedUsers);
        
  // For single image post, still store as array of one
  if (!this.mediaWithTags || !Array.isArray(this.mediaWithTags)) {
    this.mediaWithTags = [];
  }
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
  isLike(data: any): boolean {
    this.ListLike = data


    for (let index = 0; index < this.ListLike.length; index++) {
      if (this.ListLike[index].userName == this.LoggedInUser) {
        return true;
      }
    }
    return false;
  }
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return  image;
  }
  addComment() {
    if (!this.newComment.trim()) return; // empty comment ignore

    const tempComment = {
      userName: this.LoggedInUser,
      profilePicture: this.loggedInUsernameProfile,
      commentText: this.newComment,
      commentedAt: new Date().toISOString()
    };

    // ✅ Pehle UI me add kar do
    this.ListComment.unshift(tempComment);
    this.singlepost.commentsCount++;

    const oldComment = this.newComment;
    this.newComment = ""; // clear input

    this.formAddComment.CommentText = oldComment;
    this.formAddComment.PostId = this.postid;
    this.formAddComment.UserName = this.LoggedInUser;

    this.service.AddComment(this.formAddComment).subscribe({
      next: (data: any) => {
        console.log("Comment added:", data);
        // success: kuch karne ki zarurat nahi (UI already updated)
      },
      error: (err: any) => {
        console.log(err);
        // ❌ rollback
        this.ListComment.shift(); // remove last added temp comment
        this.singlepost.commentsCount--;
      }
    });
  }



  closePost() {
    this.location.back();
  }
  deBounceTimeForLike: any;
  Like(isForLike: boolean) {
    clearTimeout(this.deBounceTimeForLike)
    if (isForLike) {
      this.isLikedByMe = true;
      this.singlepost.likesCount++; // ✅ pehle UI update
    } else {
      this.isLikedByMe = false;
      this.singlepost.likesCount--; // ✅ pehle UI update
    }
    this.deBounceTimeForLike = setTimeout(() => {
      this.HandleLike(isForLike);
    }, 300);

  }

  HandleLike(isForLike: boolean) {
    if (isForLike) {
      this.likeAndUnLike.postId = this.postid;
      this.likeAndUnLike.likedBy = this.LoggedInUser;
      this.likeAndUnLike.postUsername = this.username;
      this.service.LikePost(this.likeAndUnLike).subscribe({
        next: () => {
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      this.likeAndUnLike.postId = this.postid;
      this.likeAndUnLike.likedBy = this.LoggedInUser;
      this.likeAndUnLike.postUsername = this.username;
      this.service.UnLikePost(this.likeAndUnLike).subscribe({
        next: () => {
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }


  FocusComment() {
    setTimeout(() => {
      this.comment.nativeElement.focus();
    }, 0);
  }
  AddSaved() {
    if (this.isSavedPost) return; // already saved hai to dobara mat karo

    this.isSavedPost = true; // ✅ pehle UI update

    const savedform = {
      postId: this.postid,
      UserName: this.LoggedInUser,
    };

    this.service.AddedToSaved(savedform).subscribe({
      next: (data: any) => {
        console.log("Saved:", data);
        if(!data){
          this.isSavedPost = false;
        }
        // success → kuch karne ki zarurat nahi (UI already updated)
      },
      error: (err: any) => {
        console.log(err);
        // ❌ rollback
        this.isSavedPost = false;
      }
    });
  }

  RemoveSaved() {
    if (!this.isSavedPost) return; // agar already unsaved hai to dobara mat karo

    this.isSavedPost = false; // ✅ pehle UI update

    const savedform = {
      postId: this.postid,
      UserName: this.LoggedInUser,
    };

    this.service.RemovedFromSaved(savedform).subscribe({
      next: (data: any) => {
        console.log("Removed from saved:", data);
        if(!data){
          this.isSavedPost = true;
        }
        // success → kuch karne ki zarurat nahi (UI already updated)
      },
      error: (err: any) => {
        console.log(err);
        // ❌ rollback
        this.isSavedPost = true;
      }
    });
  }

  performSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    this.service.SearchUsers(query).subscribe({
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
  SendPost(user: string,) {
    const sendform = {
      "groupName": this.LoggedInUser,
      "user": user,
      "postId": this.setPostId
    }
    this.service.SendPost(sendform).subscribe({
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
  AddPostId() {
    if (this.AllFollowingResults.length == 0) {

      this.service.GetFollowing(this.LoggedInUser).subscribe({
        next: (data: any) => {
          this.AllFollowingResults = data
          this.setPostId = this.singlepost.postId;
          this.searchResults = this.AllFollowingResults
        },
        error: (error) => {
          console.error(error);
          this.setPostId = this.singlepost.postId;
          this.searchResults = this.AllFollowingResults
        }
      })
    } else {
      this.setPostId = this.singlepost.postId;
      this.searchResults = this.AllFollowingResults
    }

  }
  DeletePost(){
 
    Swal.fire({
  title: 'Sure you want to Delete this Post ?',
  html: '<p style="color: #df2020ff; margin-top: 10px; line-height: 1.6;">This action cannot be undone.</p>',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Delete',
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
    this.service.DeletePost(this.singlepost.postId).subscribe({
      next: (data: any) => {
        console.log(data);
        this.closePost();
        this.toastr.success("Post Deleted Successfully")
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error("Error Occured!!")
    }})
  }
});
  }
  toggleTags() {
  this.showTags = !this.showTags;
}
}
