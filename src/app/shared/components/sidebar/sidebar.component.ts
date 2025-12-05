import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/chatservice.service';
import { MessageServiceService } from 'src/app/message-service.service';
import { NotificationServiceService } from 'src/app/notification-service.service';
import { ServiceService } from 'src/app/service.service';
import { CLIENT_RENEG_LIMIT } from 'tls';

// Interface for tagged users
interface TaggedUser {
  userId: string;
  username: string;
  fullName?: string;
  profilePic?: string;
  x: number; // X coordinate as percentage
  y: number; // Y coordinate as percentage
  imageIndex: number; // Which image in the carousel
}

// Interface for user search results
interface User {
  userId: string;
  username: string;
  fullName?: string;
  profilePic?: string;
}


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
  @ViewChild('taggableImage') taggableImage!: ElementRef<HTMLImageElement>;
  descripton: string = ""
  isSeen: boolean = false;
  totalPages = 0;
  pageNumber = 1;
  pageSize = 10;
  latitude = 0
  longitude = 0
  selectedPlaceName = ""
  LocationLatitude = 0
  LocationLongitude = 0
  locationName: any[] = []
  locationEnter: string = ""
  previewUrls: any[] = []
  selectedFiles: any = []

  // Tagging properties
  isTaggingMode: boolean = false;
  taggedUsers: TaggedUser[] = [];
  currentImageIndex: number = 0;
  userSearchQuery: string = '';
  searchResults: User[] = [];
  selectedUserForTagging: User | null = null;

  //debouncing 
  debounceTimer: any;

  constructor(
    private Service: ServiceService, 
    private route: Router, 
    private notiService: NotificationServiceService, 
    private chatService: ChatService, 
    private sanitizer: DomSanitizer, 
    private MessageService: MessageServiceService, 
    private toastr: ToastrService
  ) {
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

    this.Service.isSeenNoti$.subscribe({
      next: (data: any) => {
        console.log(data);
        this.isSeen = data;
      },
    })
    
    this.Service.GetAllNotifications(this.username, this.pageNumber, this.pageSize).subscribe({
      next: (data: any) => {
        console.log(data);
        this.isSeen = data.item1.every((e: any) => e.isSeen)
        console.log(this.isSeen);
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error(err.error.message, "Error Occured")
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

      // this.Service.GetRecentMessage(this.username).subscribe({
      //   next: (data: any) => {
      //     console.log(data);
      //     this.Service.setChatList(data);
      //     const existing = this.Service.getChatList()?.find((c: any) => c.username === sender);
      //     console.log(existing);
      //     if (!existing && this.username !== messageGroup) {
      //       const recentForm = {
      //         SenderUsername: this.username,
      //         ReceiverUsername: messageGroup,
      //         Message: message
      //       };
      //       console.log(recentForm);
      //       console.log("sidebar");

      //       this.Service.SaveRecentMessage(recentForm).subscribe({
      //         next: () => {
      //           this.Service.GetRecentMessage(this.username).subscribe({
      //             next: (data: any) => {
      //               this.Service.setChatList(data);
      //               this.Service.chatListRefreshSubject.next(true);
      //             },
      //             error: (err) => console.error(err)
      //           });
      //         },
      //         error: (err) => console.error(err)
      //       });
      //     }
      //   },
      //   error: (error: any) => {
      //     console.error(error);
      //   }
      // })
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
      this.Service.logout();
      localStorage.clear()
      setTimeout(() => {
        window.location.reload()
      }, 200);
    }
  }

  handleFileUploadPost(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const fData = new FormData();

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        this.toastr.warning(`File ${file.name} is not a valid image.`);
        return;
      }

      fData.append('Caption', 'asdasd');
      fData.append('UserName', this.username);
      fData.append('imageFile', file);

      this.selectedFiles = [...(this.selectedFiles || []), file];

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
        this.selectedFileStory = file;
        const reader = new FileReader();

        reader.onload = () => {
          this.previewUrlStory = reader.result;
        };

        reader.readAsDataURL(file);
      }
    }
  }

  handleFileUploadReel(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('video/')) {
      this.toastr.warning(`File ${file.name} is not a valid video.`);
      return;
    }

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

    this.selectedFileReel = file;

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
  }

  closeReel() {
    this.reelModal.nativeElement.click();
  }

  NextModalReel() {
    this.isNextStepReel = true;
  }

  ResetModalReel() {
    this.isNextStepReel = false;
  }

  closeStory() {
    this.storyModal.nativeElement.click();
  }

  NextModalStory() {
    this.isNextStepStory = true;
  }

  ResetModalStory() {
    this.isNextStepStory = false;
  }

  ClearPreview() {
    this.previewUrl = null;
    this.caption = '';
    this.isNextStep = false;
    this.selectedFile = null!;
    this.fileInputPost.nativeElement.value = '';
    this.postShared = false;
    this.caption = ""
    this.previewUrls = []
    this.selectedFiles = []
    // Clear tagging data
    this.taggedUsers = [];
    this.isTaggingMode = false;
    this.currentImageIndex = 0;
    this.userSearchQuery = '';
    this.searchResults = [];
    this.selectedUserForTagging = null;
  }

  ClearPreviewStory() {
    this.previewUrlStory = null;
    this.isNextStepStory = false;
    this.selectedFileStory = null!;
    this.fileInputStory.nativeElement.value = '';
    this.postSharedStory = false;
  }

  ClearPreviewReel() {
    this.previewUrlReel = null;
    this.isNextStepReel = false;
    this.selectedFileReel = null!;
    this.fileInputReel.nativeElement.value = '';
    this.postSharedReel = false;
    this.descripton = ""
  }

  UploadFinalPost() {
    if (!this.selectedFiles) {
      this.toastr.error('Please provide an image and caption.');
      return;
    }
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
      fData.append('imageFile', this.selectedFiles[i]);
    }
    fData.append('Location', this.selectedPlaceName);
    fData.append('Latitude', this.LocationLatitude.toString());
    fData.append('Longitude', this.LocationLongitude.toString());
    
    // Add tagged users data
   if (this.taggedUsers.length > 0) {
  // Group tags by image index
  const groupedTags: { [key: number]: any[] } = {};

  this.taggedUsers.forEach(tag => {
    if (!groupedTags[tag.imageIndex]) groupedTags[tag.imageIndex] = [];
    groupedTags[tag.imageIndex].push({
      Username: tag.username,
      X: tag.x,
      Y: tag.y
    });
  });

  // Convert grouped tags into MediaWithTags array format
  const mediaWithTags = Object.keys(groupedTags).map(index => ({
    TaggedUsers: groupedTags[+index]
  }));

  // Append as JSON string to FormData
  fData.append('TaggedUsers', JSON.stringify(mediaWithTags));
}


    console.log(fData);
    console.log('Tagged Users:', this.taggedUsers);

    this.Service.UploadPost(fData).subscribe({
      next: (res) => {
        console.log(res);
        this.ClearPreview();
        this.postShared = true;
        this.Service.emitPostRefresh();
        this.isCompletedLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.close();
        this.isCompletedLoading = false;
      }
    });
  }

  FindLocation() {
    this.Service.GetLocationByOpenStreetMap(this.locationEnter).subscribe({
      next: (data: any) => {
        this.locationName = data.map((user: any) => ({
          lat: user.lat,
          lon: user.lon,
          name: user.name,
          display_name: user.display_name
        }));

        console.log(this.locationName);
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error(err.error.message, "Error Occured")
        this.isCompletedLoading = false;
      }
    })
  }

  SelectedLocation(item: any) {
    console.log(item);
    this.selectedPlaceName = item.display_name;
    this.LocationLatitude = item.lat;
    this.LocationLongitude = item.lon;
    this.locationEnter = ""
    this.locationName = []
  }

  UploadFinalStory(isCloseFriend: boolean) {
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
    if (isCloseFriend) {
      fData.append('IsCloseFriendStory', true.toString());
    }

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
    if (this.descripton.trim() == "") {
      this.toastr.error("Give decription first")
      return;
    }
    if (!this.selectedFileReel) {
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

  // ==================== TAGGING METHODS ====================

  EnterTaggingMode(): void {
    this.isTaggingMode = true;
    this.currentImageIndex = 0;
  }

  ExitTaggingMode(): void {
    this.isTaggingMode = false;
    this.selectedUserForTagging = null;
    this.userSearchQuery = '';
    this.searchResults = [];
  }

  SearchUsers(): void {
    if (!this.userSearchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    // Call your API to search users by username
    // Replace this with your actual service method
    this.Service.SearchUsers(this.userSearchQuery).subscribe({
      next: (data: any) => {
        this.searchResults = data.map((user: any) => ({
          userId: user.userId || user.id,
          username: user.userName,
          fullName: user.fullName || user.name,
          profilePic:  user.profilePicture
        }));
        console.log('Search results:', this.searchResults);
      },
      error: (err: any) => {
        console.error('Error searching users:', err);
        this.searchResults = [];
      }
    });
  }

  SelectUserForTag(user: any): void {
    this.selectedUserForTagging = user;
    console.log('Selected user for tagging:', user.username);
    this.toastr.info(`Click on the image to tag ${user.username}`);
  }

  OnImageClick(event: MouseEvent): void {
    if (!this.selectedUserForTagging) {
      this.toastr.warning('Please select a user first!');
      return;
    }

    const img = this.taggableImage.nativeElement;
    const rect = img.getBoundingClientRect();

    // Calculate click position relative to image as percentage
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Check if user is already tagged on this image
    const existingTag = this.taggedUsers.find(
      tag => tag.username === this.selectedUserForTagging!.username &&
        tag.imageIndex === this.currentImageIndex
    );

    if (existingTag) {
      this.toastr.warning('This user is already tagged on this image!');
      return;
    }

    // Add tag
    const newTag: any = {
      userId: this.selectedUserForTagging.userId,
      username: this.selectedUserForTagging.username,
      fullName: this.selectedUserForTagging.fullName,
      profilePic: this.selectedUserForTagging.profilePic,
      x: x,
      y: y,
      imageIndex: this.currentImageIndex
    };

    this.taggedUsers.push(newTag);
    this.toastr.success(`Tagged ${this.selectedUserForTagging.username}!`);

    // Clear selection and search
    this.selectedUserForTagging = null;
    this.userSearchQuery = '';
    this.searchResults = [];
  }

  getCurrentImageTags(): any {
    return this.taggedUsers.filter(tag => tag.imageIndex === this.currentImageIndex);
  }

  RemoveTag(index: number): void {
    const removedTag = this.taggedUsers[index];
    this.taggedUsers.splice(index, 1);
    this.toastr.info(`Removed tag for ${removedTag.username}`);
  }

  RemoveTagFromImage(index: number): void {
    const currentTags = this.getCurrentImageTags();
    const tagToRemove = currentTags[index];
    const globalIndex = this.taggedUsers.indexOf(tagToRemove);

    if (globalIndex > -1) {
      this.taggedUsers.splice(globalIndex, 1);
      this.toastr.info(`Removed tag for ${tagToRemove.username}`);
    }
  }
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
  DeBounce() { 
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => { 
      this.SearchUsers();
      // 🔍 API Call or logic here
    }, 300); // ⏱ 300ms delay
  }
} 
