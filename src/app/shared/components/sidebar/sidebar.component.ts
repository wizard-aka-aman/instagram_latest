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
  previewUrl: string | ArrayBuffer | null = null;
  isNextStep: boolean = false;
  caption: string = '';
  selectedFile!: File;
  isCompletedLoading = false;
  postShared = false;
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
      const fData = new FormData(); 
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      fData.append('Caption', "asdasd"); // must match parameter name in backend 
      fData.append('UserName', this.username); // must match parameter name in backend 
      fData.append('imageFile', file); // must match parameter name in backend 
      console.log(fData);
    
      console.log(file);


      if (file) {
         this.selectedFile = file; // ✅ Save file for later use in upload
        const reader = new FileReader();

        // ✅ This callback is called *after* file is fully read
        reader.onload = () => {
          this.previewUrl ="data:image/jpeg;base64,"+ reader.result;  // ✅ base64 image preview 
        };

        reader.readAsDataURL(file); // Start reading the file
      } 
    }
  }
  triggerFileInputPost() {
    console.log("sidebar post");
    this.fileInputPost.nativeElement.click();
  }
  close() {
    this.closeModal.nativeElement.click();
  }
 NextModal() {
  this.isNextStep = true;
}

ResetModal() {
  this.isNextStep = false;
  // this.previewUrl = null
}
 ClearPreview() {
    this.previewUrl = null;
    this.caption = '';
    this.isNextStep = false;
    this.selectedFile = null!;
    this.fileInputPost.nativeElement.value = ''; // ✅ Reset file input
    this.postShared = false;
  }

UploadFinalPost() {     
  this.isCompletedLoading = true;
  if (!this.selectedFile ) {
    alert('Please provide an image and caption.');
    return;
  }
  
  const fData = new FormData();
  fData.append('Caption', this.caption);
  fData.append('UserName', this.username);
  fData.append('imageFile', this.selectedFile);
  
  this.Service.UploadPost(fData).subscribe({
    next: (res) => {
      console.log(res);
      this.ClearPreview();
      this.postShared = true;
      this.Service.emitPostRefresh(); // Notify post component
      this.isCompletedLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.close();
      this.isCompletedLoading = false;
      }
    });
  }
} 
