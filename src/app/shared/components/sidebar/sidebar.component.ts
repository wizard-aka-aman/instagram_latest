import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  username: string = "";

  fullDetailPost: any;
  posts: any[] = [];
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
  constructor(private Service: ServiceService) {
    this.username = this.Service.getUserName();
  }

  ngOnInit(): void {
  }
  logout() {
    const pakka = confirm("Sure you want to Logout?");
    if (pakka) {
      localStorage.removeItem('jwt');
      window.location.reload()
    }
  }

  handleFileUploadPost(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const fData = new FormData();
      fData.append('Caption', "asdasd"); // must match parameter name in backend 
      fData.append('UserName', this.username); // must match parameter name in backend 
      fData.append('imageFile', file); // must match parameter name in backend 
      console.log(fData);

      // TODO: Upload logic here (send to backend, etc.)
      this.Service.UploadPost(fData).subscribe({
        next: (res: any) => {
          console.log(res);
          this.close();
          this.Service.emitPostRefresh(); // Notify DisplayComponent
        },
        error: (err) => {
          console.log(err);
          this.close();
        }
      })
    }
  } 
  triggerFileInputPost() {
     console.log("sidebar post");
    this.fileInputPost.nativeElement.click();
  }
  close() {
    this.closeModal.nativeElement.click();
  }
}
