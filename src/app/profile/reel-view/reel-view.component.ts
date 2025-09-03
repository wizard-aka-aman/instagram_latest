import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { ServiceService } from 'src/app/service.service';
import { CLIENT_RENEG_LIMIT } from 'tls';
import { Location } from '@angular/common';
@Component({
  selector: 'app-reel-view',
  templateUrl: './reel-view.component.html',
  styleUrls: ['./reel-view.component.scss']
})
export class ReelViewComponent implements OnInit {

  post: any;
  username!: string;
  LoggedInUser: string = "";
  publicid!: string;
  newComment = '';
  user: any = {
    userName: '',
    profilePicture: '',
  };
  singlepost = {
    description: '',
    url: '',
    commentsCount: '',
    likesCount: '',
    createdAt: ''
  };
  likeAndUnLike = {
    LikedBy: '',
    Publicid: ""
  }
  formAddComment = {
    CommentText: '',
    UserName: '',
    publicid: ""
  }
  isLikedByMe = false;
  zeroLike = true;
  zeroComment = true;
  ListLike: any[] = []
  ListComment: any[] = []
  isSavedPost = false;
  @ViewChild('comment') comment!: ElementRef<HTMLInputElement>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.LoggedInUser = this.service.getUserName();
    this.route.paramMap.subscribe((params: any) => {
      this.username = params.get('username')!;
      this.publicid = String(params.get('publicid'));
      console.log(this.publicid);
      console.log(this.username);
      
      
      this.getReelById(this.publicid);

    });
  }

  getReelById(id: string) {
    this.service.IsSavedReel(this.LoggedInUser, this.publicid).subscribe({
      next: (res: any) => {
        this.isSavedPost = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    })

    this.service.GetReelByPublicId(id).subscribe({
      next: (data: any) => {
        console.log(data);
        this.user.userName = data.userName
        if (data.profilePicture == null) {
          this.user.profilePicture = 'assets/avatar.png';
        } else {
          this.user.profilePicture = "data:image/jpeg;base64," + data.profilePicture
        }
        this.singlepost.description = data.descripton
        this.singlepost.commentsCount = data.commentsCount
        if (data.url == null) {
          this.singlepost.url = '';
        } else {
          this.singlepost.url = data.url
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
    this.formAddComment.publicid = this.publicid;
    this.formAddComment.UserName = this.LoggedInUser;
    this.service.CommentReel(this.formAddComment).subscribe({
      next: (data: any) => {
        console.log(data);
        this.newComment = ""
        this.getReelById(this.publicid)

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
    this.likeAndUnLike.Publicid = this.publicid;
    this.likeAndUnLike.LikedBy = this.LoggedInUser;
    console.log(this.likeAndUnLike);

    this.service.LikeReel(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getReelById(this.publicid);
        // this.isLikedByMe = true;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  UnLike() {
    console.log("unlike");
    this.likeAndUnLike.Publicid = this.publicid;
    this.likeAndUnLike.LikedBy = this.LoggedInUser;
    console.log(this.likeAndUnLike);
    this.service.UnLikeReel(this.likeAndUnLike).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getReelById(this.publicid);
        // this.isLikedByMe = false;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  FocusComment() {
    setTimeout(() => {
      this.comment.nativeElement.focus();
    }, 0);
  }
  AddSaved() {
    const savedform = {
      publicid: this.publicid,
      UserName: this.LoggedInUser,
    };
    console.log(savedform);

    this.service.AddToSavedReel(savedform).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getReelById(this.publicid);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  RemoveSaved() {
    const savedform = {
      publicid: this.publicid,
      UserName: this.LoggedInUser,
    };
    console.log(savedform);

    this.service.RemoveSavedReel(savedform).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getReelById(this.publicid);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

}
