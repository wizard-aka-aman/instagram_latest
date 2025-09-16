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
  singlepost = {
    caption: '',
    imageUrl: '',
    commentsCount: '',
    likesCount: '',
    createdAt: '',
    postId: 0
  };
  likeAndUnLike = {
    postUsername: '',
    likedBy: '',
    postId: 0
  }
  formAddComment={
    CommentText :'',
    UserName : '',
    PostId : 0
  }
  isLikedByMe = false;
  zeroLike = true;
  zeroComment = true;
  ListLike: any[] = []
  ListComment :any[]= []
  isSavedPost =false;
    searchText: string = '';
    searchQuery = '';
  searchResults: any[] = []; 
  showDropdown = false;
  debounceTimer: any;
   AllFollowingResults :any[]=[]
   setPostId :number=0
  @ViewChild('comment') comment!: ElementRef<HTMLInputElement>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService,
    private location: Location,
    private toastr : ToastrService
  ) { }

  ngOnInit(): void {
    
    this.LoggedInUser = this.service.getUserName();
    this.route.paramMap.subscribe((params: any) => {
      this.username = params.get('username')!;
      this.postid = Number(params.get('postid'));
      this.getPostById(this.postid);

    });
    this.service.GetFollowing(this.LoggedInUser).subscribe({
      next: (data:any) => {
         this.AllFollowingResults = data
      },
      error: (error) => {
        console.error(error);
        }
    })
  }

  getPostById(id: number) {
    this.service.IsSaved(this.LoggedInUser,this.postid).subscribe({
      next: (res: any) => {
        this.isSavedPost = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
      this.service.GetPostByIdWithUserNameAsync(id, this.username,this.LoggedInUser).subscribe({
      next: (data: any) => {
        console.log(data);
        this.user.userName = data.userName
        this.user.profilePicture =  data.profilePicture
        this.singlepost.caption = data.caption
        this.singlepost.commentsCount = data.commentsCount
        this.singlepost.imageUrl = data.imageUrl
        this.singlepost.likesCount = data.likesCount
        this.singlepost.createdAt = data.createdAt
        this.singlepost.postId = data.postId
        this.ListComment = data.comments
        if (data.likes.length == 0) {
          this.zeroLike = true;
        }
        else {
          this.zeroLike = false;
        }
        if (data.comments.length == 0) {
          this.zeroComment = true;
        }
        else {
          this.zeroComment = false;
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
    this.formAddComment.CommentText = this.newComment;
    this.formAddComment.PostId = this.postid;
    this.formAddComment.UserName = this.LoggedInUser; 
    this.service.AddComment(this.formAddComment).subscribe({
      next: (data: any) => {
        console.log(data);
        this.newComment = ""
        this.getPostById(this.postid)
      },
      error: (err: any) => {
        console.log(err);
      }        
    }) 
    }
  

  closePost() {
    this.location.back();
  }
  Like() {
    console.log("like");
    this.likeAndUnLike.postId = this.postid;
    this.likeAndUnLike.likedBy = this.LoggedInUser;
    this.likeAndUnLike.postUsername = this.username;
    console.log(this.likeAndUnLike);

    this.service.LikePost(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getPostById(this.postid);
        // this.isLikedByMe = true;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  UnLike() {
    console.log("unlike");
    this.likeAndUnLike.postId = this.postid;
    this.likeAndUnLike.likedBy = this.LoggedInUser;
    this.likeAndUnLike.postUsername = this.username;
    console.log(this.likeAndUnLike);
    this.service.UnLikePost(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getPostById(this.postid);
        // this.isLikedByMe = false;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  FocusComment(){
      setTimeout(() => {
    this.comment.nativeElement.focus();
  }, 0);
  }
  AddSaved(){
    const savedform = {
      postId: this.postid,
      UserName: this.LoggedInUser,
    }; 
    console.log(savedform);
    
    this.service.AddedToSaved(savedform).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getPostById(this.postid);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  RemoveSaved(){
   const savedform = {
      postId: this.postid,
      UserName: this.LoggedInUser,
    }; 
    console.log(savedform);
    
    this.service.RemovedFromSaved(savedform).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getPostById(this.postid);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
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
  SendPost(user:string, ){
    const sendform= {
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
  AddPostId(){
    this.setPostId = this.singlepost.postId;
     this.searchResults =this.AllFollowingResults
  }
}
