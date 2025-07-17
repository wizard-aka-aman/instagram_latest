import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
  username: string = "";
  email: string = "";
  fullname: string = "";
  //   username: string = 'username_here';
  //  fullname: string = 'Full Name';
  numberposts: number = 0;
  followers: number = 0;
  following: number = 0;
  bio: string = "";
  avatarUrl: string = '';
  plusIconUrl: string = 'assets/plus.png';
  activeTab = 'posts';
  isPostAvailable = false;
  fullDetailPost: any;
 

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
  constructor(private Service: ServiceService, private route: ActivatedRoute) {
    this.email = this.Service.getEmail();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.username = (String)(params.get('username'));
      if (this.username) {
        this.getProfile(this.username);
      }
    });

    this.GetPost();
    
      // 👇 Subscribe to refresh signal
  this.Service.postRefresh$.subscribe(refresh => {
    if (refresh) {
      this.fullDetailPost = []; // Clear old posts
      this.GetPost();
    }
  });
  }
  GetPost(){
    this.Service.GetAllPostByUsername(this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        if(data.length == 0){
          this.isPostAvailable = false;
        }else{
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
        if (data.profilePicture == null) {
          this.avatarUrl = 'assets/avatar.png';
        } else {
          this.avatarUrl = data.profilePicture;
        }
      },
      error: (error: any) => {
        console.error(error);
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

}
