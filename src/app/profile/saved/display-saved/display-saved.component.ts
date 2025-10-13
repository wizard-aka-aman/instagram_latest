import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-saved',
  templateUrl: './display-saved.component.html',
  styleUrls: ['./display-saved.component.scss']
})
export class DisplaySavedComponent implements OnInit {
  activeTab = 'saved';
  isSavedAvailable = false;
savedReels :any[]=[]; 
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
  @Input() isPublic: boolean = false;
  @Input() alreadyFollowing: boolean = false;
  @Input() loggedInUserName: string = "";
  @Input() username: string = "";
  fullDetailPost: any[] = [];
  constructor(private Service: ServiceService, private route: ActivatedRoute , private router: Router) {
  } 
  ngOnInit(): void {

  this.route.paramMap.subscribe(params => {
    if (this.username) {
      if(this.Service.SavedPostRefreshSubject.value.length ===0){
        this.GetSaved();
      }
    }
  });
  if(this.loggedInUserName == this.username){

    this.Service.SavedPostRefresh$.subscribe(data => {
      this.fullDetailPost = data;
    });
    this.Service.SavedReelRefresh$.subscribe(data => {
      this.savedReels = data;

      this.AllSaved = [...this.fullDetailPost,...this.savedReels];
       this.AllSaved = this.AllSaved.sort(
            (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
          );
          this.AllSaved = this.AllSaved.map(e => {
            if(e.posts){
                e.type = "post"
            }else{
                e.type = "reel"
            }
            return e;
          })
      if(this.savedReels.length +this.fullDetailPost.length ==0){
        this.isSavedAvailable = false;
      }else{
        this.isSavedAvailable = true;
      }
    });
  }else{
    this.GetSaved();
  }
  
}
AllSaved:any []=[];
  GetSaved() {
     this.fullDetailPost = []
    this.Service.GetAllSavedByUserName(this.username).subscribe({
      next: (data: any) => {
          this.fullDetailPost = data
          if(this.loggedInUserName == this.username){
            this.Service.SavedPostRefreshSubject.next(this.fullDetailPost);
          }
          console.log(this.fullDetailPost);
          
           this.Service.GetAllSavedReel(this.username).subscribe({
      next: (data: any) => {
          this.savedReels = data ;
          if(this.loggedInUserName == this.username){
            this.Service.SavedReelRefreshSubject.next(this.savedReels);
          }
          console.log(data);
          this.AllSaved = [...this.fullDetailPost,...this.savedReels];
           this.AllSaved = this.AllSaved.sort(
            (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
          );
          this.AllSaved = this.AllSaved.map(e => {
            if(e.posts){
                e.type = "post"
            }else{
                e.type = "reel"
            }
            return e;
          })
          console.log(this.AllSaved);
          
          if(this.savedReels.length +this.fullDetailPost.length ==0){
            this.isSavedAvailable = false;
          }else{
            this.isSavedAvailable = true;
          }
      },
      error: (error) => {
        console.log(error);
      }
    })
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

  openPostPage(postId: number,username:string) {
    this.router.navigate([`/${username}/p/${postId}`]);
  }
  openReelPage(publicid: string , username:string) {
    this.router.navigate([`/${username}/reel/${publicid}`]);
  }
    getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
}
