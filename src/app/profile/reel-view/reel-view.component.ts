import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

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
    commentsCount: 0,
    likesCount: 0,
    createdAt: '',
    publicid: ''
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
  searchQuery = '';
  searchResults: any[] = [];
  showDropdown = false;
  debounceTimer: any;
  AllFollowingResults: any[] = []
  setReelPublicId: string = ''
  loggedInUsernameProfile: string = ''
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
      this.publicid = String(params.get('publicid'));
      this.getReelById(this.publicid);


    });
  }

  getReelById(id: string) {

    this.service.GetReelByPublicId(id, this.LoggedInUser).subscribe({
      next: (data: any) => {
        console.log(data);

        this.user.userName = data.userName;
        this.user.profilePicture = data.profilePicture
          ? "data:image/jpeg;base64," + data.profilePicture
          : 'assets/avatar.png';

        this.singlepost.description = data.descripton;
        this.singlepost.commentsCount = data.commentsCount;
        this.singlepost.url = data.url ?? '';
        this.singlepost.likesCount = data.likesCount;
        this.singlepost.createdAt = data.createdAt;
        this.singlepost.publicid = data.publicid;
        this.isSavedPost = data.isSaved;
        this.loggedInUsernameProfile = data.loggedInUsernameProfile
        this.ListComment = data.comments;
        this.zeroLike = data.likes.length == 0;
        this.zeroComment = data.comments.length == 0;
        this.isLikedByMe = this.isLike(data.likes);
      },
      error: (err: any) => console.log(err)
    });
  }

  isLike(data: any): boolean {
    this.ListLike = data;
    return this.ListLike.some((like: any) => like.userName == this.LoggedInUser);
  }

  getProfileImage(image: string | null): string {
    return (!image || image === 'null')
      ? 'assets/avatar.png'
      : 'data:image/jpeg;base64,' + image;
  }

  // ✅ Optimistic Comment
  addComment() {
    if (!this.newComment.trim()) return;

    const tempComment = {
      userName: this.LoggedInUser,
      profilePicture: this.loggedInUsernameProfile,
      commentText: this.newComment,
      commentedAt: new Date().toISOString()
    };

    this.ListComment.unshift(tempComment);
    this.singlepost.commentsCount++;
    this.zeroComment = false;

    const oldComment = this.newComment;
    this.newComment = "";

    this.formAddComment.CommentText = oldComment;
    this.formAddComment.publicid = this.publicid;
    this.formAddComment.UserName = this.LoggedInUser;

    this.service.CommentReel(this.formAddComment).subscribe({
      next: () => { /* already updated */ },
      error: () => {
        this.ListComment.shift();
        this.singlepost.commentsCount--;
        this.newComment = oldComment;
        if (this.ListComment.length == 0) this.zeroComment = true;
      }
    });
  }

  closePost() {
    this.location.back();
  }

  // ✅ Optimistic Like
  Like() {
    if (this.isLikedByMe) return;

    this.isLikedByMe = true;
    this.singlepost.likesCount++;
    this.zeroLike = false;

    this.likeAndUnLike.Publicid = this.publicid;
    this.likeAndUnLike.LikedBy = this.LoggedInUser;

    this.service.LikeReel(this.likeAndUnLike).subscribe({
      next: () => { /* already updated */ },
      error: () => {
        this.isLikedByMe = false;
        this.singlepost.likesCount--;
        if (this.singlepost.likesCount == 0) this.zeroLike = true;
      }
    });
  }

  // ✅ Optimistic UnLike
  UnLike() {
    if (!this.isLikedByMe) return;

    this.isLikedByMe = false;
    this.singlepost.likesCount--;
    if (this.singlepost.likesCount == 0) this.zeroLike = true;

    this.likeAndUnLike.Publicid = this.publicid;
    this.likeAndUnLike.LikedBy = this.LoggedInUser;

    this.service.UnLikeReel(this.likeAndUnLike).subscribe({
      next: () => { /* already updated */ },
      error: () => {
        this.isLikedByMe = true;
        this.singlepost.likesCount++;
        this.zeroLike = false;
      }
    });
  }

  FocusComment() {
    setTimeout(() => this.comment.nativeElement.focus(), 0);
  }

  // ✅ Optimistic Save
  AddSaved() {
    if (this.isSavedPost) return;
    this.isSavedPost = true;

    const savedform = { publicid: this.publicid, UserName: this.LoggedInUser };
    this.service.AddToSavedReel(savedform).subscribe({
      next: () => { /* already updated */ },
      error: () => this.isSavedPost = false
    });
  }

  // ✅ Optimistic UnSave
  RemoveSaved() {
    if (!this.isSavedPost) return;
    this.isSavedPost = false;

    const savedform = { publicid: this.publicid, UserName: this.LoggedInUser };
    this.service.RemoveSavedReel(savedform).subscribe({
      next: () => { /* already updated */ },
      error: () => this.isSavedPost = true
    });
  }

  performSearch(query: string) {
    if (!query.trim()) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    this.service.SearchUsers(query).subscribe({
      next: (res: any) => {
        this.searchResults = res;
        this.showDropdown = true;
      },
      error: () => {
        this.searchResults = [];
        this.showDropdown = false;
      }
    });
  }

  DeBounce() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.performSearch(this.searchQuery), 300);
  }

  ClearSearchQuery() {
    this.searchQuery = "";
    this.searchResults = [];
    this.showDropdown = false;
  }

  SendPost(user: string) {
    const sendform = {
      groupName: this.LoggedInUser,
      user: user,
      reelPublicId: this.setReelPublicId
    };
    this.service.SendPost(sendform).subscribe({
      next: (data: any) => this.toastr.success(data.message),
      error: () => this.toastr.error("Error Occured!!")
    });
  }

  AddPostId() {
    if (this.AllFollowingResults.length == 0) {

      this.service.GetFollowing(this.LoggedInUser).subscribe({
        next: (data: any) => {
          this.AllFollowingResults = data
          this.setReelPublicId = this.singlepost.publicid;
          this.searchResults = this.AllFollowingResults;
        },

        error: (error) => {
          this.setReelPublicId = this.singlepost.publicid;
          this.searchResults = this.AllFollowingResults;
          console.error(error)
        }
      });
    } else {
      this.setReelPublicId = this.singlepost.publicid;
      this.searchResults = this.AllFollowingResults;
    }

  }
  DeletePost(){
    if (confirm("Are you sure you want to delete this reel?")) {
    this.service.DeleteReel(this.singlepost.publicid).subscribe({
      next: (data: any) => {
        console.log(data);
        this.closePost();
        this.toastr.success("Reel Deleted Successfully")
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error("Error Occured!!")
    }})
    }

  }
}
