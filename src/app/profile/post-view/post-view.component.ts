import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
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
    postId: 0
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
    return 'data:image/jpeg;base64,' + image;
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
  Like() {
    if (this.isLikedByMe) return; // agar already like hai to dobara call na kare

    this.isLikedByMe = true;
    this.singlepost.likesCount++; // ✅ pehle UI update

    this.likeAndUnLike.postId = this.postid;
    this.likeAndUnLike.likedBy = this.LoggedInUser;
    this.likeAndUnLike.postUsername = this.username;

    this.service.LikePost(this.likeAndUnLike).subscribe({
      next: () => {
        // ✅ success → kuch karne ki zarurat nahi (UI already updated)
      },
      error: () => {
        // ❌ fail → rollback
        this.isLikedByMe = false;
        this.singlepost.likesCount--;
      }
    });
  }

  UnLike() {
    if (!this.isLikedByMe) return; // agar already unlike hai to dobara call na kare

    this.isLikedByMe = false;
    this.singlepost.likesCount--; // ✅ pehle UI update

    this.likeAndUnLike.postId = this.postid;
    this.likeAndUnLike.likedBy = this.LoggedInUser;
    this.likeAndUnLike.postUsername = this.username;

    this.service.UnLikePost(this.likeAndUnLike).subscribe({
      next: () => {
        // ✅ success → kuch karne ki zarurat nahi (UI already updated)
      },
      error: () => {
        // ❌ fail → rollback
        this.isLikedByMe = true;
        this.singlepost.likesCount++;
      }
    });
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
    if (confirm("Are you sure you want to delete this post?")) {
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

  }
}
