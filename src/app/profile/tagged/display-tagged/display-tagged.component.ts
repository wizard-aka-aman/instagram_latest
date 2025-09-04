import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-tagged',
  templateUrl: './display-tagged.component.html',
  styleUrls: ['./display-tagged.component.scss']
})
export class DisplayTaggedComponent implements OnInit {
  username: string = "";
  email: string = "";
  fullname: string = ""; 
  numberposts: number = 0;
  followers: number = 0;
  following: number = 0;
  bio: string = "";
  avatarUrl: string = '';
  plusIconUrl: string = 'assets/plus.png';
  activeTab = 'tagged';
  isPostAvailable = false;
  fullDetailPost: any;
  selectedPost: any = null;
  newComment: string = '';
  loggedInUserName : string ="";
  followForm={
    followerUsername : '',
    followingUsername: ''
  }
  follower :any;
  followingdata :any;
  alreadyFollowing = false;
 isPublic :boolean= false;
  isRequested:boolean = false;
  isSeenUserFollwingMeVariable : boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
  constructor(private Service: ServiceService, private route: ActivatedRoute , private router: Router) {
    this.email = this.Service.getEmail();
  } 
  ngOnInit(): void {
  this.loggedInUserName = this.Service.getUserName();

  this.route.paramMap.subscribe(params => {
    this.username = String(params.get('username'));
    if (this.username) {
      this.getProfile(this.username);
      this.GetPost(); // ✅ Add this line to fetch posts again
    }

    if (this.loggedInUserName != this.username) {
      this.isFollowing();
      this.isSeenUserFollwingMe();
    }
  });

  // 👇 Subscribe to refresh signal
  this.Service.postRefresh$.subscribe(refresh => {
    if (refresh) {
      this.fullDetailPost = []; // Clear old posts
      this.GetPost();
    }
  });
}
  isFollowing(){
     this.Service.isFollowing(this.loggedInUserName,this.username).subscribe({
      next: (data:any) => {
        console.log(data);
        this.alreadyFollowing = data;
        if(!this.alreadyFollowing){
          this.Service.IsRequested(this.loggedInUserName,this.username).subscribe({
            next: (data:any) => {
              console.log("Requested : "+data);
              this.isRequested = data;
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      },
      error: (error) => {
        console.error(error);
      }
        
    })
  }
  isSeenUserFollwingMe(){
    this.Service.isFollowing(this.username,this.loggedInUserName).subscribe({
      next: (data:any) => {
        console.log(data);
        this.isSeenUserFollwingMeVariable = data;
      },
      error: (error) => {
        console.error(error);
      }
        
    })
  }
  RemoveRequest(){
    this.Service.DeleteRequest(this.loggedInUserName,this.username).subscribe({
      next: (data:any) => {
      console.log(data);
      this.isRequested = false;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
  GetPost() {
     this.fullDetailPost = []
    this.Service.GetAllPostByUsername(this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        if (data.length == 0) {
          this.isPostAvailable = false;
          this.numberposts = data.length;
        } else {
          this.numberposts = data.length;

          this.isPostAvailable = true;
          this.fullDetailPost = data
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  getProfile(username: string) {
    this.Service.GetProfileByUserName(username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.fullname = data.fullName;
        this.bio = data.bio;
         this.isPublic = data.isPublic;
        this.following = data.followingCount
        this.followers = data.followersCount;
        if (data.profilePicture == null) {
          this.avatarUrl = 'assets/avatar.png';
        } else {
          this.avatarUrl = "data:image/jpeg;base64,"+data.profilePicture;
        }
      },
      error: (error: any) => {
        console.log(error);
       this.router.navigateByUrl('/not-found', { skipLocationChange: true });
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
          this.getProfile(this.username);
        },
        error: (err) => {
          console.log(err);
          this.close();
        }
      })
    }
  }
  GetFollowers(){
    this.Service.GetFollower(this.username).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.follower = res;   
      },
      error : (err:any)=>{
        console.log(err);
        
      }
    })
    
  }
  GetFollowing(){
    this.Service.GetFollowing(this.username).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.followingdata = res;   
      },
      error : (err:any)=>{
        console.log(err);
        
      }
    })
    
  }
  removePhoto() {
    this.Service.RemoveProfilePicture(this.username).subscribe({
      next: (res: any) => {
        console.log(res);
        this.close();
        this.getProfile(this.username);
      },
      error: (err) => {
        console.log(err);
        this.close();
      }
    })
  }
  openPostPage(postId: number) {
    this.router.navigate([`/${this.username}/p/${postId}`]);
  }
 Follow(){
    if(this.isPublic){
      const followForm = {
    followerUsername: '',
    followingUsername: ''
  };
   followForm.followerUsername = this.loggedInUserName
    followForm.followingUsername = this.username;
    console.log(followForm);
    
    this.Service.FollowPost(followForm).subscribe({
      next: (res: any) => {
        console.log(res); 
        this.alreadyFollowing = true
         this.getProfile(this.username);
         this.isFollowing();
      },
      error: (err) => {
        console.log(err);
      }
    })
    }else{

      const addreq = {
        userNameOfReqFrom: this.loggedInUserName,
        userNameOfReqTo: this.username
      }
      this.Service.AddRequested(addreq).subscribe({
        next: (res: any) => {
          console.log(res);
          this.isRequested = true;
          this.getProfile(this.username);
         this.isFollowing();
        },
        error: (err) => {
          console.log(err);
        }
      })
      
    }
    }
  UnFollow(){
    if(!this.isPublic){
      const isconfirm = confirm("If you change your mind, you'll have to request to follow "+this.username+ " again.");
    
    if(isconfirm){
    this.followForm.followerUsername = this.loggedInUserName
    this.followForm.followingUsername = this.username;
    console.log(this.followForm);
    
    this.Service.UnFollowPost(this.followForm).subscribe({
      next: (res: any) => {
        console.log(res);
        this.getProfile(this.username);
         this.isFollowing();
      },
      error: (err) => {
        console.log(err);
      }
    })
    }
  }
  else{
     this.followForm.followerUsername = this.loggedInUserName
    this.followForm.followingUsername = this.username;
    console.log(this.followForm);
    
    this.Service.UnFollowPost(this.followForm).subscribe({
      next: (res: any) => {
        console.log(res);
        this.getProfile(this.username);
         this.isFollowing();
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  }
    getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
}
