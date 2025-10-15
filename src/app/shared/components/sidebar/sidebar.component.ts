import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/chatservice.service';
import { MessageServiceService } from 'src/app/message-service.service';
import { NotificationServiceService } from 'src/app/notification-service.service';
import { ServiceService } from 'src/app/service.service';
import { CLIENT_RENEG_LIMIT } from 'tls';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  username: string = "";
  isMessage: boolean = false
  fullDetailPost: any;
  posts: any[] = [];
  previewUrl: string | ArrayBuffer | null = null;
  previewUrlStory: string | ArrayBuffer | null = null;
previewUrlReel: SafeUrl | null = null;
  selectedFileReel: File | null = null;
  isNextStep: boolean = false;
  isNextStepStory: boolean = false;
  isNextStepReel: boolean = false;
  caption: string = '';
  selectedFile!: File;
  selectedFileStory!: File;   
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
  descripton: string = ""
  isSeen: boolean = false;
  totalPages = 0;
  pageNumber = 1;
  pageSize = 10;
  latitude = 0 
  longitude = 0
  constructor(private Service: ServiceService, private route: Router, private notiService: NotificationServiceService, private chatService: ChatService,private sanitizer: DomSanitizer, private MessageService: MessageServiceService , private toastr:ToastrService) {
    this.username = this.Service.getUserName();
  }

  ngOnInit(): void {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          console.log("User location:", this.latitude, this.longitude);
        },
        (error) => {
          console.error('Error getting location', error);
        }
    );

    this.notiService.startConnection(this.username, (sender, messageGroup, message) => {
      console.log(messageGroup, this.username);

    }).then(() => {
      console.log("then wala chala");
    });

    // this.notiService.startConnection(localStorage.getItem('jwt')?? ""); // app load hote hi SignalR connect
    this.Service.isSeenNoti$.subscribe({
      next: (data: any) => {
        console.log(data);

        this.isSeen = data;
      },
    })
    this.Service.GetAllNotifications(this.username,this.pageNumber,this.pageSize).subscribe({
      next: (data: any) => {
        console.log(data);
        this.isSeen = data.item1.every((e: any) => e.isSeen)
        console.log(this.isSeen);
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error(err.error.message , "Error Occured")
      },
    })

    this.Service.isSeenNoti$.subscribe({
      next: (data: any) => {
        this.isSeen = data;
      },
      error: (err: any) => {
        console.log(err);
      },
    })
    this.chatService.startConnection(this.username, (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel, postid, publicid, reelurl) => {
      console.log({
        id: messageId,
        groupName: messageGroup,
        sender,
        message,
        postLink: postlink,
        profilePicture: profilepicture,
        usernameOfPostReel: usernameofpostreel,
        postId: postid,
        reelPublicId: publicid,
        mediaUrl: reelurl,
        sentAt: new Date()
      });
      this.MessageService.SetIsMessage(true);


      
      this.Service.GetRecentMessage(this.username).subscribe({
        next: (data: any) => {
          console.log(data);
          this.Service.setChatList(data);
          // 👇 Check if sender already in chat list
          const existing = this.Service.getChatList()?.find((c: any) => c.username === sender);
          console.log(existing);
          if (!existing && this.username !== messageGroup) {
            // Not in chat list → save to RecentMessages and refresh
            const recentForm = {
              SenderUsername: this.username,
              ReceiverUsername: messageGroup,
              Message: message
            };
            console.log(recentForm);
            console.log("sidebar");
            

            this.Service.SaveRecentMessage(recentForm).subscribe({
              next: () => {
                this.Service.GetRecentMessage(this.username).subscribe({
                  next: (data: any) => {
                    this.Service.setChatList(data); // update global state
                    this.Service.chatListRefreshSubject.next(true); // trigger refresh
                  },
                  error: (err) => console.error(err)
                });
              },
              error: (err) => console.error(err)
            });
          }
        },
        error: (error: any) => {
          console.error(error);
        }
      })
    });



    this.MessageService.isMessage$.subscribe({
      next: (data: any) => {
        this.isMessage = data;
      },
      error: (err: any) => {
        console.log(err);
      },
    })
  }
  markSeen() {
    // this.notiService.markAllSeen();
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
  previewUrls:any[] = []
  selectedFiles:any= []

  handleFileUploadPost(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) return;
 // Limit to 5 files
  
  const fData = new FormData();
  // this.previewUrls = []; // Clear previous previews

  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) {
      this.toastr.warning(`File ${file.name} is not a valid image.`);
      return;
    }

    // Append file and metadata to FormData
    fData.append('Caption', 'asdasd');
    fData.append('UserName', this.username);
    fData.append('imageFile', file);

    // Save the file for later upload if needed
    this.selectedFiles = [...(this.selectedFiles || []), file];

    // Read file as base64 and push to preview array
    const reader = new FileReader();
    console.log(reader);
    
    reader.onload = () => {
      if (reader.result) {
        this.previewUrls.push(reader.result);
        this.previewUrl = reader.result;
      }
    };
    reader.readAsDataURL(file);
  });
  
  console.log('FormData:', fData);
  console.log('Selected Files:', this.selectedFiles);
  console.log(this.previewUrls);
}


  handleFileUploadStory(event: Event) {
    
    console.log("strorrryrrryryy");

    const fData = new FormData();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file!.type.startsWith('image/')) {
        this.toastr.warning(`File ${file!.name} is not a valid image.`);
        return;
      }
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
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // ✅ check only video
    if (!file.type.startsWith('video/')) {
      this.toastr.warning(`File ${file.name} is not a valid video.`);
      return;
    }

    // ✅ check video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 60) {
        this.toastr.warning(`Video ${file.name} is longer than 60 seconds.`);
        this.ClearPreviewReel();
        return;
      }
    };

    // save file for later upload
    this.selectedFileReel = file;

    // generate safe preview url
    const objectUrl = URL.createObjectURL(file);
    this.previewUrlReel = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

    console.log("Video file:", file);
    console.log("Preview URL:", this.previewUrlReel);
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
    this.previewUrls = []
    this.selectedFiles = []
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
    if (!this.selectedFiles) {
      this.toastr.error('Please provide an image and caption.');
      return;
    }
    // Limit to 5 files
  if (this.selectedFiles.length > 5) {
    this.toastr.error('You can only upload up to 5 images.');
    return;
  }
    console.log(this.selectedFiles);
    
    this.isCompletedLoading = true;
    const fData = new FormData();
    fData.append('Caption', this.caption);
    fData.append('UserName', this.username);
      for (let i = 0; i < this.selectedFiles.length; i++) {
    fData.append('imageFile', this.selectedFiles[i]); // append each file
  }
    console.log(fData);
    
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
    fData.append('Latitude', this.latitude.toString());
    fData.append('Longitude', this.longitude.toString());

    this.ClearPreviewStory();
    this.Service.PostStory(fData).subscribe({
      next: (res) => {
        console.log(res);
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
    if(this.descripton.trim() == ""){
      this.toastr.error("Give decription first")
      return;
    }
    if (!this.selectedFileReel ) {
      alert('Please provide an image and caption.');
      return;
    }
    this.isCompletedLoadingReel = true;
    

    const fData = new FormData();
    fData.append('username', this.username);
    fData.append('description', this.descripton);
    fData.append('file', this.selectedFileReel);

    this.Service.postReel(fData).subscribe({
      next: (res: any) => {
        console.log(res);
        this.ClearPreviewReel();
        this.postSharedReel = true;
        this.isCompletedLoadingReel = false;
      },
      error: (err: any) => {
        console.error(err);
        this.closeReel();
        this.isCompletedLoadingReel = false;
      }
    });
  }
} 
