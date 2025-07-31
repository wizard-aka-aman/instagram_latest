import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

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
    createdAt: ''
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
  @ViewChild('comment') comment!: ElementRef<HTMLInputElement>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService
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
    this.service.IsSaved(this.LoggedInUser,this.postid).subscribe({
      next: (res: any) => {
        this.isSavedPost = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
      this.service.GetPostByIdWithUserNameAsync(id, this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.user.userName = data.userName
        if (data.profilePicture == null) {
          this.user.profilePicture = 'assets/avatar.png';
        } else {
          this.user.profilePicture = "data:image/jpeg;base64," + data.profilePicture
        }
        this.singlepost.caption = data.caption
        this.singlepost.commentsCount = data.commentsCount
        if (data.imageUrl == null) {
          this.singlepost.imageUrl = 'assets/avatar.png';
        } else {
          this.singlepost.imageUrl = "data:image/jpeg;base64," + data.imageUrl
        }
        this.singlepost.likesCount = data.likesCount
        this.singlepost.createdAt = data.createdAt
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
    this.router.navigate([`/${this.username}`]);
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

}
