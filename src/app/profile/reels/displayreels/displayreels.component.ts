import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Console } from 'console';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-displayreels',
  templateUrl: './displayreels.component.html',
  styleUrls: ['./displayreels.component.scss']
})
export class DisplayreelsComponent implements OnInit {

  activeTab = 'reels';
  reels: any;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @Input() isPublic: boolean = false;
  @Input() alreadyFollowing: boolean = false;
  @Input() loggedInUserName: string = "";
  @Input() username: string = "";
  isPostAvailable = false
  constructor(private Service: ServiceService, private route: ActivatedRoute, private router: Router) {
  }
  ngOnInit(): void {
    this.loggedInUserName = this.Service.getUserName();

    this.route.paramMap.subscribe(params => {
      if (this.username) {
        if (this.Service.ReelsRefreshSubject.value.length === 0) {
          this.GetAllReels();
        }
      }
    });
    if(this.loggedInUserName == this.username){
      this.Service.ReelsRefresh$.subscribe((reels: any[]) => {
        this.reels = reels;
        if (reels.length == 0) {
          this.isPostAvailable = false;
        }
        else {
          this.isPostAvailable = true;
        }
      })
    }else{
      this.GetAllReels();
    }

    // 👇 Subscribe to refresh signal
    this.Service.postRefresh$.subscribe(refresh => {
      if (refresh) {
        this.GetAllReels();
      }
    });
  }
  GetAllReels() {
    this.reels = []
    this.Service.GetReelsByUsername(this.username).subscribe({
      next: (data: any) => {
        console.log(data);
        this.reels = data;
        if(this.loggedInUserName == this.username){
          this.Service.ReelsRefreshSubject.next(data);
        }
        if (data.length == 0) {
          this.isPostAvailable = false;
        }
        else {
          this.isPostAvailable = true;
        }
      },
      error: (error) => {
        console.log(error);
      }
    })

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
        },
        error: (err) => {
          console.log(err);
          this.close();
        }
      })
    }
  }
  OpenReelPage(publicId: string) {
    this.router.navigate([`/${this.username}/reel/${publicId}`])
  }
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
}
