import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ServiceService } from 'src/app/service.service';
import { ChatService } from 'src/app/chatservice.service';
import { EventEmitter } from '@angular/core';
import { MessageServiceService } from 'src/app/message-service.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-rightside',
  templateUrl: './rightside.component.html',
  styleUrls: ['./rightside.component.scss']
})
export class RightsideComponent implements AfterViewChecked, OnInit {
  // hubConnection!: signalR.HubConnection;
  newMessage: string = "";
  preventAutoScroll = false;
  username!: string;
  profilePicture: any;
  fullName: string = ""
  messages: any[] = [];
  groupName: string = '';
  user = '';
  message = '';
  emojis: string[] = ['😀', '😂', '😍', '😢', '👍', '🔥', "remove"];
  emojisWithoutRemove: string[] = ['😀', '😂', '😍', '😢', '👍', '🔥'];
  shouldScrollToBottom: boolean = true;
  noUserSelected = true;
  menuOpenId: string | null = null;
  messageId: number = 0;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  emojiPickerIndex: number | null = null;
  @HostListener('document:click', ['$event'])
  handleGlobalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // 👇 Close emoji picker if clicked outside emoji elements
    const isEmojiButton = target.closest('.overlay');
    const isEmojiPicker = target.closest('.emoji-picker-container');
    if (!isEmojiButton && !isEmojiPicker) {
      this.emojiPickerIndex = null;
    }

    // 👇 Close 3-dot menu if clicked outside
    const isMenu = target.closest('.menu');
    const isDropdown = target.closest('.dropdown-menu-custom');
    if (!isMenu && !isDropdown) {
      this.menuOpenId = null;
    }
  }

  constructor(private router: ActivatedRoute, private location: Location, private ServiceSrv: ServiceService, private chatService: ChatService ,private route :Router , private MessageService : MessageServiceService,
    private toastr:ToastrService,private sanitizer: DomSanitizer
  ) {
    this.user = this.ServiceSrv.getUserName();
    this.router.paramMap.subscribe(params => {
      this.groupName = String(params.get('groupname'));
      if (this.groupName == "null") {
        this.noUserSelected = true;
      } else {
        this.noUserSelected = false;
      }
    });

  }


  addEmojiToMessage(msgId: number, emoji: string | null) {
    if (emoji == "remove") {
      emoji = null;
    }
    const reactionform = {
      messageid: msgId,
      reaction: emoji
    }
    // 👇 Immediately set emoji reaction locally for instant feedback
    const msg = this.messages.find(m => m.id === msgId);
    if (msg) {
      msg.reaction = emoji;
    }

    this.emojiPickerIndex = null;
    this.shouldScrollToBottom = false; // Reaction added, don't scroll
    console.log("Trying to send reaction:", { msgId, groupName: this.groupName, emoji });
    this.chatService.sendReaction(msgId, this.groupName, emoji)
    console.log(reactionform);

    this.chatService.saveReaction(reactionform).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (error: any) => {
        console.error(error);
      }

    });
  }

  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      this.shouldScrollToBottom = false;
    }
  }



  goBack() {
    // this.location.back();
    this.route.navigate(['/messages/t']);
  }
  ngOnInit() {
    this.MessageService.SetIsMessage(false);
    this.router.paramMap.subscribe(params => {
      this.groupName = String(params.get('groupname'));
      this.loadChatData();
    });

    this.user = this.ServiceSrv.getUserName();

    const conn = this.chatService.connection;
  if (conn) {
    conn.on("ReceiveMessage", (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl) => {
      // yaha pe sirf messages ko push karna hai
      if (messageGroup === this.groupName || sender === this.groupName) {
       this.messages.push({
          id: messageId,
          groupName: messageGroup,
          sender,
          message,
          postLink : postlink,
          profilePicture:profilepicture,
          usernameOfPostReel:usernameofpostreel,
          postId : postid,
          reelPublicId:publicid,
          mediaUrl:reelurl,
          sentAt: new Date()
        });
        this.shouldScrollToBottom = true;
      }
    });
  }



    /*this.chatService.startConnection(this.user, (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl) => {
      const isForThisChat = messageGroup === this.groupName || sender === this.groupName;
      console.log({
        id: messageId,
        groupName: messageGroup,
        sender,
        message,
        postlink,
        profilepicture,
        usernameofpostreel,
        postid,
        publicid,
        reelurl
      });
      if(sender == this.user){
      this.MessageService.SetIsMessage(true);
    } 

      if (isForThisChat) {        
        this.messageId = messageId;
        this.messages.push({
          id: messageId,
          groupName: messageGroup,
          sender,
          message,
          postLink : postlink,
          profilePicture:profilepicture,
          usernameOfPostReel:usernameofpostreel,
          postId : postid,
          reelPublicId:publicid,
          mediaUrl:reelurl,
          sentAt: new Date()
        });
        this.shouldScrollToBottom = true;
      }
    }); */
 
  }
  loadChatData() {
  this.newMessage = '';
    if(this.groupName != null &&this.groupName!= undefined && this.groupName != "null" ){
      this.ServiceSrv.GetProfileByUserName(this.groupName).subscribe({
          next: (data: any) => {
            console.log(data);
            this.profilePicture = data.profilePicture;
            this.username = data.userName
            this.fullName = data.fullName
          },
          error: (error: any) => {
            console.log(error);
          }
        })
    // 👇 Load chat messages
    this.chatService.PersonalChat(this.groupName, this.user).subscribe((msgs: any) => {
      this.messages = msgs;
      console.log(msgs);
      this.shouldScrollToBottom = true; // Scroll on initial load
      const conn = this.chatService.connection;
      if (conn) {
        conn.off("ReceiveReaction"); // Remove previous handler
        conn.on("ReceiveReaction", (messageId: number, reaction: string) => {
          const msg = this.messages.find(m => m.id === messageId);
          if (msg) msg.reaction = reaction;
        });

        // ✅ Listen for real-time unsend
        conn.off("RecieveUnSend");
        conn.on("RecieveUnSend", (messageId: number) => {
          this.messages = this.messages.filter(m => m.id !== messageId);
        });
      }
    });
     }
  }



  toggleEmojiPicker(index: number): void {
    this.preventAutoScroll = true; // Prevent scroll after emoji picker toggle
    this.emojiPickerIndex = this.emojiPickerIndex === index ? null : index;
  }

  send(postlink?: string, profilepicture?: string, usernameofpostreel?: string,postid? :number,publicid?:string ,reelurl?:string) {
    if (this.isUploadingFile) {
    return;
  }
  if (this.selectedFile) {
    this.SendFileFunction();
  } else if (this.newMessage.trim()) { 
      const DateTime = new Date(); 
      this.chatService.sendMessage(this.user, this.groupName, this.newMessage, DateTime.toLocaleString(),postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl);
      this.FunctionGetSaveRecentMessage(); 
      this.newMessage = '';
      this.shouldScrollToBottom = true; 
      setTimeout(() => {
    const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  }, 0);
  }

  }
  toggleMenu(msgId: string): void {
    if (this.menuOpenId === msgId) {
      this.menuOpenId = null; // Close if already open
    } else {
      this.menuOpenId = msgId; // Open selected
    }
  }

  unsendMessage(msgId: number) {
    // Logic to remove the message
    console.log("unsend");
    this.messages = this.messages.filter(m => m.id !== msgId);
    this.menuOpenId = null; // Close menu after action
    this.ServiceSrv.DeleteChat(msgId).subscribe({
      next: (res) => {
        console.log(res);
        this.chatService.unsendMessage(msgId, this.groupName);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  FunctionGetSaveRecentMessage() {
    if(this.user !== this.groupName){
    const recentform = {
        SenderUsername: this.user,
        ReceiverUsername: this.groupName,
        Message: this.newMessage
      }
    this.ServiceSrv.SaveRecentMessage(recentform).subscribe({
      next: (data: any) => {
        this.ServiceSrv.GetRecentMessage(this.user).subscribe({
          next: (data: any) => {
            this.ServiceSrv.setChatList(data);
          },
          error: (error: any) => console.error(error)
        });
      },
      error: (error: any) => {
        console.log(error)
      }
    })
    }
  }
  selectedFile: File | null = null;
  selectedFileUrl: any = null;   // Images/videos ke liye
  selectedFileName: string = '';
  MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  isUploadingFile: boolean = false;
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > this.MAX_SIZE) {
      this.toastr.error(file.name + " file must be less than 10MB");
      this.clearSelectedFile();
      this.selectedFile = undefined as any;
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;

    const fileType = file.type;

    // IMAGE / VIDEO preview
    if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
      const reader = new FileReader();

      reader.onload = () => {
        this.selectedFileUrl = reader.result;
      };

      reader.readAsDataURL(file);
    } else {
      // TXT / ZIP / PDF / DOCX → No preview, only file name
      this.selectedFileUrl = null;
    }
  }
  clearSelectedFile() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFileUrl = null;
  }
  SendFileFunction() {
    const fData = new FormData();
    if (this.selectedFile && !this.isUploadingFile) {
      this.isUploadingFile = true;

      fData.append('GroupName', this.user);
      fData.append('User', this.username);
      fData.append('file', this.selectedFile);

      this.ServiceSrv.SendFile(fData).subscribe({
        next: (data: any) => {
          console.log(data);
          this.clearSelectedFile();
          // Upload complete - enable button
          this.isUploadingFile = false;
        },
        error: (error: any) => {
          this.toastr.error(error.error);
          this.clearSelectedFile();
          console.error(error);
          this.isUploadingFile = false;
        }
      });
    }
  }
  isImage(url: string) {
  return url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
}

isVideo(url: string) {
  return url?.match(/\.(mp4|mov|webm|avi|mkv)$/i);
}

getFileName(url: string) {
  return url?.split('/').pop() || 'file';
}
downloadFile(msg: any) {
  if (!msg.mediaUrl) return;

// Force download via Cloudinary transformation
const downloadUrl = msg.mediaUrl.replace('/upload/', '/upload/fl_attachment/');

const link = document.createElement('a');
link.href = downloadUrl;
link.target = '_blank';
link.click();
}
copyMessage(msg: any): void {
  let textToCopy = '';
    textToCopy = msg.message
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.toastr.success('copied!');
    }).catch(err => {
      console.error('Failed to copy message:', err);
    });
  }
  this.menuOpenId = null;
}
formatMessageWithLinks(message: string): SafeHtml {
  if (!message) return '';
  
  // Escape HTML special characters first to prevent XSS
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  
  // Replace URLs with clickable links
  const formatted = escaped.replace(urlRegex, (url) => {
    let href = url;
    
    // Add https:// if the URL starts with www. or doesn't have a protocol
    if (url.startsWith('www.')) {
      href = 'https://' + url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      href = 'https://' + url;
    }
    
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #8bf7ffff; text-decoration: underline;">${url}</a>`;
  });
  
  return this.sanitizer.bypassSecurityTrustHtml(formatted);
}
// Handle Enter key press
handleEnterKey(event: any): void {
  if (!event.shiftKey) {
    event.preventDefault();
    if (this.newMessage && this.newMessage.trim()) {
      this.send();
    }
  }
}
autoResize(event: any): void {
  const textarea = event.target;
  textarea.style.height = 'auto';
  const newHeight = Math.min(textarea.scrollHeight, 150);
  textarea.style.height = newHeight + 'px';
}
isRecording = false;
mediaRecorder: any;
audioChunks: any[] = [];
audioBlob: Blob | null = null;
audioUrl: any = null;
recordStartTime: number = 0;
recordingDuration: number = 0;
recordingInterval: any;

minRecordDuration = 500; // 0.5 sec
maxAudioDuration = 60000; // 60 sec

async startHoldRecording() {
  // Prevent multiple recordings
  if (this.isRecording) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);

    this.audioChunks = [];
    this.isRecording = true;
    this.recordStartTime = Date.now();
    this.recordingDuration = 0;

    // Update recording duration every 100ms
    this.recordingInterval = setInterval(() => {
      this.recordingDuration = (Date.now() - this.recordStartTime) / 1000;
    }, 100);

    this.mediaRecorder.ondataavailable = (event: any) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.start();

    // Auto-stop after 60 seconds
    setTimeout(() => {
      if (this.isRecording) {
        this.stopHoldRecording();
        this.toastr.info("Maximum recording duration reached (60s)");
      }
    }, this.maxAudioDuration);

  } catch (err) {
    console.error("Microphone error:", err);
    this.toastr.error("Microphone permission denied or not available");
    this.isRecording = false;
  }
}

stopHoldRecording() {
  if (!this.isRecording) return;

  this.isRecording = false;
  this.isProcessingAudio = true; // Show loader
  
  // Clear the recording interval
  if (this.recordingInterval) {
    clearInterval(this.recordingInterval);
    this.recordingInterval = null;
  }

  // Stop all media tracks
  if (this.mediaRecorder && this.mediaRecorder.stream) {
    this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
  }

  this.mediaRecorder.stop();

  this.mediaRecorder.onstop = () => {
    const duration = Date.now() - this.recordStartTime;

    // Check minimum duration
    if (duration < this.minRecordDuration) {
      this.toastr.warning("Recording too short. Hold for at least 0.5 seconds.");
      this.audioBlob = null;
      this.audioUrl = null;
      this.recordingDuration = 0;
      this.isProcessingAudio = false; // Hide loader
      return;
    }

    // Valid recording → process audio
    this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

    const unsafeUrl = URL.createObjectURL(this.audioBlob);
    this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeUrl);
    
    this.recordingDuration = 0;
    this.isProcessingAudio = false; // Hide loader after processing
    this.toastr.success("Voice message recorded successfully!");
  };
}


cancelRecordedAudio() {
  // Revoke the object URL to free memory
  if (this.audioUrl) {
    const url = this.audioUrl.changingThisBreaksApplicationSecurity || this.audioUrl;
    if (typeof url === 'string') {
      URL.revokeObjectURL(url);
    }
  }
  
  this.audioBlob = null;
  this.audioUrl = null;
  this.audioChunks = [];
}
isSendAudio = false;
sendRecordedAudio() {
  if (!this.audioBlob) {
    this.toastr.error("No audio to send");
    return;
  }
  this.isSendAudio = true
  
  const formData = new FormData();
  
  // Use appropriate file extension based on blob type
  const fileName = this.audioBlob.type.includes('webm') 
  ? 'voiceMessage.webm' 
  : 'voiceMessage.mp3';
  
  formData.append("file", this.audioBlob, fileName);
  formData.append("GroupName", this.user);
  formData.append("User", this.groupName);
  
  this.isUploadingFile = true;
  
  this.ServiceSrv.SendVM(formData).subscribe({
    next: (data: any) => {
      this.isSendAudio = false;
      this.isUploadingFile = false;
      this.cancelRecordedAudio(); // Clean up
      this.toastr.success("Voice message sent!");
    },
    error: (error) => {
      this.isUploadingFile = false;
      this.isSendAudio = false;
      this.toastr.error("Failed to send voice message");
      console.error("Upload error:", error);
    }
  });
}

// Optional: Clean up on component destroy
ngOnDestroy() {
  if (this.recordingInterval) {
    clearInterval(this.recordingInterval);
  }
  if (this.mediaRecorder && this.mediaRecorder.stream) {
    this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
  }
  this.cancelRecordedAudio();
}

async toggleRecording() {
  if (!this.isRecording) {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.toastr.error("Your browser doesn't support audio recording");
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted - start recording
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;
      this.isProcessingAudio = false; // Reset processing state
      this.recordStartTime = Date.now();
      this.recordingDuration = 0;

      // Update recording duration every 100ms
      this.recordingInterval = setInterval(() => {
        this.recordingDuration = (Date.now() - this.recordStartTime) / 1000;
      }, 100);

      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (this.isRecording) {
          this.stopHoldRecording();
          this.toastr.info("Maximum recording duration reached (60s)");
        }
      }, this.maxAudioDuration);

    } catch (error: any) {
      // Handle different types of errors
      console.error("Microphone error:", error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showMicPermissionPopup = true;
        this.toastr.error("🎤 Microphone permission denied! Please allow microphone access in your browser settings.", 
          "Permission Required", 
          { timeOut: 5000 });
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        this.toastr.error("🎤 No microphone found on your device!", 
          "Microphone Not Found");
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        this.toastr.error("🎤 Microphone is already in use by another application", 
          "Microphone Busy");
      } else if (error.name === 'OverconstrainedError') {
        this.toastr.error("🎤 Audio recording not supported on this device", 
          "Not Supported");
      } else if (error.name === 'SecurityError') {
        this.toastr.error("🎤 Microphone access requires HTTPS connection", 
          "Security Error");
      } else {
        this.toastr.error("🎤 Failed to access microphone: " + error.message, 
          "Microphone Error");
      }
      
      this.isRecording = false;
    }
  } else {
    // Stop recording
    this.stopHoldRecording();
  }
}
showMicPermissionPopup = false;
closeMicPopup() {
  this.showMicPermissionPopup = false;
}

// Browser settings open karne ka try
openBrowserSettings() {
  this.showMicPermissionPopup = false;

  // Chrome mobile & desktop
  if (navigator.userAgent.includes("Chrome")) {
    window.open("chrome://settings/content/microphone");
    return;
  }

  // Android WebView / Samsung
  if (navigator.userAgent.includes("Android")) {
    window.open("about:preferences#privacy", "_blank");
    return;
  }

  // Safari iPhone
  this.toastr.info("Please go to Settings > Safari > Microphone and Allow");
}
isProcessingAudio = false;


}


