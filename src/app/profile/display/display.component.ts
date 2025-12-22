import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PagenotfoundComponent } from 'src/app/pagenotfound/pagenotfound.component';
import { ServiceService } from 'src/app/service.service';
import { StoryTransferService } from 'src/app/story-transfer.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
  username: string = "";
  fullname: string = "";
  numberposts: number = 0;
  followers: number = 0;
  following: number = 0;
  bio: string = "";
  avatarUrl: string = '';
  plusIconUrl: string = 'assets/plus.png';
  activeTab = 'posts';
  isPostAvailable = false;
  fullDetailPost: any;
  selectedPost: any = null;
  newComment: string = '';
  loggedInUserName: string = "";
  followForm = {
    followerUsername: '',
    followingUsername: ''
  }
  follower: any;
  followingdata: any;
  alreadyFollowing = false;
  isPublic: boolean = false;
  isRequested: boolean = false;
  isSeenUserFollwingMeVariable: boolean = false;
  mutualFriends: any[] = [];
  highlight: any[] = [];
  selectedImageTitle:string=""
  selectedImageID:any;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;

  constructor(private Service: ServiceService, private route: ActivatedRoute, private router: Router , private toastr : ToastrService , private storyTransfer : StoryTransferService) {
  }
  ngOnInit(): void {
    this.loggedInUserName = this.Service.getUserName();

    this.route.paramMap.subscribe(params => {
      this.username = String(params.get('username'));

      if (this.username) {
        this.getProfile(this.username);
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
  isFollowing() {
    this.Service.isFollowing(this.loggedInUserName, this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.alreadyFollowing = data;
        if(data || this.isPublic){
        this.GetHighlight();
        }
        if (!this.alreadyFollowing) {
          this.Service.IsRequested(this.loggedInUserName, this.username).subscribe({
            next: (data: any) => {
              console.log("Requested : " + data);
              this.isRequested = data;
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
        this.GetPost(); // ✅ Add this line to fetch posts again
      },
      error: (error) => {
        console.error(error);
      }

    })
  }
  isSeenUserFollwingMe() {
    this.Service.isFollowing(this.username, this.loggedInUserName).subscribe({
      next: (data: any) => {
        console.log(data);
        this.isSeenUserFollwingMeVariable = data;
      },
      error: (error) => {
        console.error(error);
      }

    })
  }
  RemoveRequest() {
    this.Service.DeleteRequest(this.loggedInUserName, this.username).subscribe({
      next: (data: any) => {
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
    if (this.loggedInUserName != this.username && !(this.alreadyFollowing || this.isPublic)) {
    }
    else {
      if (this.Service.PostRefreshSubject.value.length === 0 || this.loggedInUserName != this.username) {
        this.Service.GetAllPostByUsername(this.username).subscribe({
          next: (data: any) => {
            console.log(data);
            if (data.length == 0) {
              this.isPostAvailable = false;
              this.numberposts = data.length;
            } else {
              this.numberposts = data.length;
              this.isPostAvailable = true;
              this.fullDetailPost = data;
              console.log(this.fullDetailPost.mediaUrl);
              
              if(this.loggedInUserName == this.username){
                this.Service.PostRefreshSubject.next(data);
              }
            }
          },
          error: (error) => {
            console.log(error);
          }
        })
      } else {
        this.Service.PostRefresh$.subscribe((data: any) => {
          if (data.length == 0) {
            this.isPostAvailable = false;
            this.numberposts = data.length;
          } else {
            this.numberposts = data.length;

            this.isPostAvailable = true;
            this.fullDetailPost = data
          }
        });
      }

      // this.Service.GetAllPostByUsername(this.username).subscribe({
      //   next: (data: any) => {
      //     console.log(data);
      //     if (data.length == 0) {
      //       this.isPostAvailable = false;
      //       this.numberposts = data.length;
      //     } else {
      //       this.numberposts = data.length;
      //       this.isPostAvailable = true;
      //       this.fullDetailPost = data
      //       this.Service.PostRefreshSubject.next(data);
      //     }
      //   },
      //   error: (error) => {
      //     console.log(error);
      //   }
      // })
    }
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
        this.numberposts = data.postCount;
        if (data.profilePicture == null) {
          this.avatarUrl = 'assets/avatar.png';
        } else {
          this.avatarUrl = data.profilePicture;
        }
        if (this.loggedInUserName != this.username) {
          this.isFollowing();
          this.isSeenUserFollwingMe();
          this.Mutual();
        }
        if (this.loggedInUserName == this.username) {
          this.GetPost();
        this.GetHighlight(); 
      this.mutualFriends = [];
      return; 
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
  GetFollowers() {
    if (this.loggedInUserName != this.username && !(this.isPublic || this.alreadyFollowing)) {
    }
    else {
      this.Service.GetFollower(this.username).subscribe({
        next: (res: any) => {
          console.log(res);
          this.follower = res;
        },
        error: (err: any) => {
          console.log(err);

        }
      })
    }
  }
  GetFollowing() {
    if (this.loggedInUserName != this.username && !(this.isPublic || this.alreadyFollowing)) {
    }
    else {
      this.Service.GetFollowing(this.username).subscribe({
        next: (res: any) => {
          console.log(res);
          this.followingdata = res;
        },
        error: (err: any) => {
          console.log(err);

        }
      })
    }
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
  Follow() {
    if (this.isPublic) {
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
    } else {

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
  UnFollow() {
    if (!this.isPublic) {
Swal.fire({
  title: 'Unfollow User?',
  html: `<p style="color: #999; margin-top: 10px; line-height: 1.6;">If you change your mind, you'll need to send a follow request to <strong style="color: #fff;">${this.username}</strong> again.</p>`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Unfollow',
  cancelButtonText: 'Cancel',
  reverseButtons: true,
  background: '#000000',
  color: '#ffffff',
  iconColor: '#ffffff',
  backdrop: 'rgba(0, 0, 0, 0.66)',
  confirmButtonColor: '#ffffff',
  cancelButtonColor: '#000000',
  customClass: {
    popup: 'black-white-popup',
    confirmButton: 'black-white-confirm-btn',
    cancelButton: 'black-white-cancel-btn'
  }
}).then((result) => {
  if (result.isConfirmed) {
    this.followForm.followerUsername = this.loggedInUserName;
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
        
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#000000',
          color: '#ffffff',
          iconColor: '#ffffff',
          confirmButtonColor: '#ffffff',
          customClass: {
            popup: 'black-white-popup',
            confirmButton: 'black-white-confirm-btn'
          }
        });
      }
    });
  }
});
    }
    else {
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
    return  image;
  }
  Mutual(){
    if(this.loggedInUserName == this.username){
      this.mutualFriends = [];
      return;
    }
    this.Service.GetMutual(this.loggedInUserName,this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.mutualFriends = data;
      },
      error: (error) => {
        console.error(error);
      }

    })
  }
  GetHighlight(){
    this.Service.GetHighLight(this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.highlight = data;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
  selectedImage: string | ArrayBuffer | null |any= null;
  selectedImageFile: string | ArrayBuffer | null |any= null;

onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => (this.selectedImage = reader.result);
    reader.readAsDataURL(file);
  }
 
  if (file) {
    this.selectedImageFile = file;
  }
}


  selectedImageImages: string | ArrayBuffer | null |any= null;
  selectedImageFileImages: string | ArrayBuffer | null |any= null;
onImageSelectedImage(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => (this.selectedImageImages = reader.result);
    reader.readAsDataURL(file);
  }
 
  if (file) {
    this.selectedImageFileImages = file;
  }
}

onSubmit(event :Event,form:any): void {
  // You can handle form submission logic here
  console.log('Form submitted');
   const fData = new FormData();
   console.log(form.value.title);
   console.log(this.username);
   console.log(this.selectedImageFile);
   var title = form.value.title;
   title = title.trim();
   if(title == "" && this.selectedImageFile == null){
    this.toastr.error("title and image can't be empty" , "error");
    return;
   }
   if(title == "" ){
    this.toastr.error("title and can't be empty" , "error");
    return;
   }
   if(this.selectedImageFile == null){
    this.toastr.error("image can't be empty" , "error");
    return;
   }
   
      fData.append('Title', title);
      fData.append('Username', this.username);
      fData.append('imageFile', this.selectedImageFile);
    console.log(fData);
    

  this.Service.CreateHighLight(fData).subscribe({
    next: (data: any) => {
      console.log(data);
      this.GetHighlight();
      this.CloseHightLightModal();
      this.toastr.success("Added Successfully")
    },
    error: (error) => {
      this.CloseHightLightModal();
      console.error(error);
    }
  })
  // Example: send data to backend via service
}

onSubmitImages(event :Event,form:any): void {
  // You can handle form submission logic here
  console.log('Form submitted');
   const fData = new FormData();
   console.log(form.value.title);
   console.log(this.username);
   console.log(this.selectedImageFile);

   if(this.selectedImageFileImages == null){
    this.toastr.error("image can't be empty" , "error");
    return;
   }
      fData.append('Title', this.selectedImageTitle);
      fData.append('Username', this.username);
      fData.append('imageFile', this.selectedImageFileImages);
      fData.append('id', this.selectedImageID);
      
    console.log(fData);
    

  this.Service.AddImagesinHighLight(fData).subscribe({
    next: (data: any) => {
      console.log(data);
      this.GetHighlight();
      this.toastr.success("Added Successfully")
    },
    error: (error) => {
      console.error(error);
      this.toastr.error("Error occur")
    }
  })
  // Example: send data to backend via service
}
onWhichAddImage(highligh :any){
this.selectedImageTitle = highligh.title;
this.selectedImageID = highligh.id;
}

openHighlightStory(story: any) {
  this.storyTransfer.setStory(story);
  
  this.router.navigate(['/stories', story.username]);
}
@ViewChild('highlightForm') highlightForm!: NgForm;
@ViewChild('highlightImagesForm') highlightImagesForm!: NgForm;
  @ViewChild('fileInput') fileInputclear!: ElementRef;
    @ViewChild('fileInputImage') fileInputclearimage!: ElementRef;
CloseHightLightModal(){
  this.selectedImage = null;
  this.selectedImageFile = null;
  this.highlightForm.resetForm();
  if (this.fileInputclear) {
      this.fileInputclear.nativeElement.value = '';
    }
}
CloseHightLightModalImages(){
  this.selectedImageImages = null;
  this.selectedImageFileImages = null;
  this.selectedImageTitle = "";
  this.selectedImageID = "";
  this.highlightImagesForm.resetForm();
  if (this.fileInputclearimage) {
      this.fileInputclearimage.nativeElement.value = '';
    }
}
DeleteHightLightImage(){
  this.Service.DeleteHightlight(this.selectedImageID,this.loggedInUserName).subscribe({
    next: (data: any) => {
      console.log(data);
      this.GetHighlight();
      this.CloseHightLightModalImages();
      this.toastr.success("Deleted Successfully")
    },
    error: (error) => {
      console.error(error);
      this.toastr.error("Error occur")
    }
  })
}
}
