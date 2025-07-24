import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  previewUrlStory: string | ArrayBuffer | null = null;
  isNextStep: boolean = false;
  isNextStepStory: boolean = false;
  caption: string = '';
  selectedFile!: File;
  selectedFileStory!: File;
  isCompletedLoading = false;
  isCompletedLoadingStory = false;
  postShared = false;
  postSharedStory = false;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('storyModal') storyModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputStory') fileInputStory!: ElementRef<HTMLInputElement>;
  constructor(private Service: ServiceService, private route: Router) {
    this.username = this.Service.getUserName();
  }

  ngOnInit(): void {
  }
  logout() {
    const pakka = confirm("Sure you want to Logout?");
    if (pakka) {
      localStorage.removeItem('jwt');
      this.route.navigateByUrl("/")
      setTimeout(() => {
        window.location.reload()
      }, 200);
    }
  }

  handleFileUploadPost(event: Event) {
    const fData = new FormData();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      fData.append('Caption', "asdasd"); 
      fData.append('UserName', this.username); 
      fData.append('imageFile', file); 
      console.log(fData);

      console.log(file);


      if (file) {
        this.selectedFile = file; // ✅ Save file for later use in upload
        const reader = new FileReader();

        // ✅ This callback is called *after* file is fully read
        reader.onload = () => {
          // console.log(reader.result);

          this.previewUrl = reader.result;  // ✅ base64 image preview 
        };

        reader.readAsDataURL(file); // Start reading the file
      }
    }
  }

  handleFileUploadStory(event: Event) {
    console.log("strorrryrrryryy");
    
    const fData = new FormData();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      fData.append('Caption', "asdasd");  
      fData.append('UserName', this.username);  
      fData.append('imageFile', file); 
      console.log(fData);

      console.log(file);


      if (file) {
        this.selectedFileStory = file; // ✅ Save file for later use in upload
        const reader = new FileReader();

        // ✅ This callback is called *after* file is fully read
        reader.onload = () => {
          // console.log(reader.result);

          this.previewUrlStory = reader.result;  // ✅ base64 image preview 
        };

        reader.readAsDataURL(file); // Start reading the file
      }
    }
  }
  triggerFileInputPost() {
    console.log("sidebar post");
    this.fileInputPost.nativeElement.click();
  }
  triggerFileInputStory() {
    console.log("sidebar Story");
    this.fileInputStory.nativeElement.click();
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
  closeStory() {
    this.storyModal.nativeElement.click();
  }
  NextModalStory() {
    this.isNextStepStory = true;
  }

  ResetModalStory() {
    this.isNextStepStory = false;
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
  ClearPreviewStory() {
    this.previewUrlStory = null; 
    this.isNextStepStory = false;
    this.selectedFileStory = null!;
    this.fileInputStory.nativeElement.value = ''; // ✅ Reset file input
    this.postSharedStory = false;
  }

  UploadFinalPost() {
    this.isCompletedLoading = true;
    if (!this.selectedFile) {
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
  UploadFinalStory() {
    this.isCompletedLoadingStory = true;
    if (!this.selectedFileStory) {
      alert('Please provide an image and caption.');
      return;
    }

    const fData = new FormData(); 
    fData.append('Username', this.username);
    fData.append('imageFile', this.selectedFileStory);

    this.Service.PostStory(fData).subscribe({
      next: (res) => {
        console.log(res);
        this.ClearPreviewStory();
        this.postSharedStory = true;
        this.isCompletedLoadingStory = false;
      },
      error: (err) => {
        console.error(err);
        this.closeStory();
        this.isCompletedLoadingStory = false;
      }
    });
  }
} 
