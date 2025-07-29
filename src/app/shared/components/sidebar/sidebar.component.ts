import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';
import { CLIENT_RENEG_LIMIT } from 'tls';

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
  previewUrlReel: string | ArrayBuffer | null = null;
  isNextStep: boolean = false;
  isNextStepStory: boolean = false;
  isNextStepReel: boolean = false;
  caption: string = '';
  selectedFile!: File;
  selectedFileStory!: File;
  selectedFileReel!: File;
  isCompletedLoading = false;
  isCompletedLoadingStory = false;
  isCompletedLoadingReel = false;
  postShared = false;
  postSharedStory = false;
  postSharedReel = false;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  @ViewChild('storyModal') storyModal!: ElementRef<HTMLInputElement>; 
  @ViewChild('reelModal') reelModal!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPost') fileInputPost!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputStory') fileInputStory!: ElementRef<HTMLInputElement>; 
  @ViewChild('fileInputReel') fileInputReel!: ElementRef<HTMLInputElement>;
  descripton : string = ""
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
  handleFileUploadReel(event: Event) {
    console.log("Relll upload ");
    
    const fData = new FormData();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) { 
      fData.append('file', file); 
      console.log(fData);

      console.log(file);


      if (file) {
        this.selectedFileReel = file; // ✅ Save file for later use in upload
        // const reader = new FileReader();

        // ✅ This callback is called *after* file is fully read
        // reader.onload = () => {
        //   console.log(reader.result);

          this.previewUrlReel = "a";  // ✅ base64 image preview 
        // };

        // reader.readAsDataURL(file); // Start reading the file
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
  triggerFileInputReel() {
    console.log("sidebar Reel");
    this.fileInputReel.nativeElement.click();
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
  closeReel() {
    this.reelModal.nativeElement.click();
  }
  NextModalReel() {
    this.isNextStepReel = true;
  }

  ResetModalReel() {
    this.isNextStepReel = false;
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
    this.caption = ""
  }
  ClearPreviewStory() {
    this.previewUrlStory = null; 
    this.isNextStepStory = false;
    this.selectedFileStory = null!;
    this.fileInputStory.nativeElement.value = ''; // ✅ Reset file input
    this.postSharedStory = false;
  }
  ClearPreviewReel() {
    this.previewUrlReel = null; 
    this.isNextStepReel = false;
    this.selectedFileReel = null!;
    this.fileInputReel.nativeElement.value = ''; // ✅ Reset file input
    this.postSharedReel = false;
    this.descripton = ""
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
    fData.append('file', this.selectedFileStory);

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
  UploadFinalReel() {
    this.isCompletedLoadingReel = true;
    if (!this.selectedFileReel) {
      alert('Please provide an image and caption.');
      return;
    }

    const fData = new FormData(); 
    fData.append('username', this.username);
    fData.append('description', this.descripton);
    fData.append('file', this.selectedFileReel);

    this.Service.postReel(fData).subscribe({
      next: (res :any) => {
        console.log(res);
        this.ClearPreviewReel();
        this.postSharedReel = true;
        this.isCompletedLoadingReel = false;
      },
      error: (err:any) => {
        console.error(err);
        this.closeReel();
        this.isCompletedLoadingReel = false;
      }
    });
  }
} 
