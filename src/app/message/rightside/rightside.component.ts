import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ServiceService } from 'src/app/service.service';
import { ChatService } from 'src/app/chatservice.service';
import { AudioCallService } from 'src/app/audio-call.service'; // Import the new service
import { MessageServiceService } from 'src/app/message-service.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-rightside',
  templateUrl: './rightside.component.html',
  styleUrls: ['./rightside.component.scss']
})
export class RightsideComponent implements AfterViewChecked, OnInit, OnDestroy {
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
  @ViewChild('remoteAudio') remoteAudio!: ElementRef<HTMLAudioElement>;
  
  emojiPickerIndex: number | null = null;

  // Audio call properties
  incomingCall: any = null;
  callState: string = 'idle'; // idle, calling, ringing, active, ended
  isInCall: boolean = false;
  isMuted: boolean = false;
  callDuration: string = '00:00';
  private callTimer: any;
  private callStartTime: number = 0;

  // Existing properties
  selectedFile: File | null = null;
  selectedFileUrl: any = null;
  selectedFileName: string = '';
  MAX_SIZE = 10 * 1024 * 1024;
  isUploadingFile: boolean = false;
  isRecording = false;
  mediaRecorder: any;
  audioChunks: any[] = [];
  audioBlob: Blob | null = null;
  audioUrl: any = null;
  recordStartTime: number = 0;
  recordingDuration: number = 0;
  recordingInterval: any;
  minRecordDuration = 500;
  maxAudioDuration = 60000;
  isSendAudio = false;
  isProcessingAudio = false;
  showMicPermissionPopup = false;
  // ✅ NEW: Speaker properties
  isSpeakerOn: boolean = false;
  availableSpeakers: MediaDeviceInfo[] = [];
  showSpeakerMenu: boolean = false;
  @HostListener('document:click', ['$event'])
  handleGlobalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isEmojiButton = target.closest('.overlay');
    const isEmojiPicker = target.closest('.emoji-picker-container');
    if (!isEmojiButton && !isEmojiPicker) {
      this.emojiPickerIndex = null;
    }
    const isMenu = target.closest('.menu');
    const isDropdown = target.closest('.dropdown-menu-custom');
    if (!isMenu && !isDropdown) {
      this.menuOpenId = null;
    }
    const isSpeakerButton = target.closest('.speaker-button');
    const isSpeakerMenu = target.closest('.speaker-menu');
    if (!isSpeakerButton && !isSpeakerMenu) {
      this.showSpeakerMenu = false;
    }
  }

  constructor(
    private router: ActivatedRoute,
    private location: Location,
    private ServiceSrv: ServiceService,
    private chatService: ChatService,
    private audioCallService: AudioCallService, // Inject audio call service
    private route: Router,
    private MessageService: MessageServiceService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
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

  ngOnInit() {
    this.MessageService.SetIsMessage(false);
    this.router.paramMap.subscribe(params => {
      this.groupName = String(params.get('groupname'));
      this.loadChatData();
    });

    this.user = this.ServiceSrv.getUserName();

    // Initialize chat connection
    const conn = this.chatService.connection;
    if (conn) {
      conn.on("ReceiveMessage", (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel, postid, publicid, reelurl) => {
        if (messageGroup === this.groupName || sender === this.groupName) {
          this.messages.push({
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
          this.shouldScrollToBottom = true;
        }
      });
    }

    // Initialize audio call service
    this.initializeAudioCall();
    this.audioCallService.isSpeakerOn$.subscribe(state => {
      this.isSpeakerOn = state;
    });
  }

async initializeAudioCall() {
  try {
    await this.audioCallService.startConnection(this.user, this.ServiceSrv.BaseUrl);

    this.audioCallService.incomingCall$.subscribe(call => {
      if (call) {
        this.incomingCall = call;
      }
    });

    this.audioCallService.callState$.subscribe(state => {
      this.callState = state;
      this.isInCall = (state === 'calling' || state === 'active');

      if (state === 'active') {
        this.startCallTimer();
      } else if (state === 'ended' || state === 'rejected') {
        this.stopCallTimer();
        this.incomingCall = null;
      }
    });

    // ✅ CRITICAL: Proper remote stream handling
    this.audioCallService.remoteStream$.subscribe(stream => {
      console.log('🎵 Remote stream received:', stream);
      
      if (stream && this.remoteAudio) {
        setTimeout(() => {
          try {
            const audioElement = this.remoteAudio.nativeElement;
            
            // Clean up old stream
            if (audioElement.srcObject) {
              const oldStream = audioElement.srcObject as MediaStream;
              oldStream.getTracks().forEach(track => track.stop());
            }
            
            // Set new stream
            audioElement.srcObject = stream;
            audioElement.volume = 1.0;
            audioElement.muted = false;
            audioElement.autoplay = true; 
            
            // Log stream details
            stream.getTracks().forEach(track => {
              console.log('🎵 Track:', track.kind, 'enabled:', track.enabled, 'state:', track.readyState);
            });
            
            // Try to play
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => console.log('✅ Audio playing!'))
                .catch(err => {
                  console.warn('⚠️ Autoplay blocked:', err);
                  
                  // Handle autoplay block
                  const playOnInteraction = () => {
                    audioElement.play()
                      .then(() => {
                        console.log('✅ Audio started after interaction');
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                      })
                      .catch(e => console.error('❌ Play failed:', e));
                  };
                  
                  document.addEventListener('click', playOnInteraction, { once: true });
                  document.addEventListener('touchstart', playOnInteraction, { once: true });
                  
                  this.toastr.info('Tap screen to enable audio');
                });
            }
          } catch (err) {
            console.error('❌ Error attaching stream:', err);
          }
        }, 100);
      }
    });
  } catch (error) {
    console.error('❌ Failed to initialize audio call:', error);
  }
}

async initiateCall() {
  try {
    if (!this.groupName || this.groupName === 'null') {
      this.toastr.error('Select a user to call');
      return;
    }

    const callerName = this.ServiceSrv.getFullName();
    this.ServiceSrv.GetProfileByUserName(this.user).subscribe({
      next: async (data: any) => {
        try {
          const callerProfilePicture = data?.profilePicture ?? '';
          // note: pass normalized groupName to service
          await this.audioCallService.initiateCall(this.groupName.trim().toLowerCase(), callerName, callerProfilePicture);
          this.toastr.info(`Calling ${this.groupName}...`);
        } catch (callError: any) {
          console.error('Call initiation error:', callError);
          this.toastr.error(callError?.message || 'Failed to initiate call. Please check your microphone permissions.');
        }
      },
      error: (error) => {
        console.error('Error getting profile:', error);
        this.toastr.error('Failed to get profile information');
      }
    });
  } catch (error: any) {
    console.error('Error initiating call:', error);
    this.toastr.error('Failed to initiate call');
  }
}
  // Answer call
async answerCall() {
  try {
    if (this.incomingCall) {
      console.log('📞 Answering call...');
      await this.audioCallService.answerCall(this.incomingCall.callId);
      this.toastr.success('Call connected');
      
      // Force audio play after answer
      setTimeout(() => {
        if (this.remoteAudio) {
          const audioElement = this.remoteAudio.nativeElement;
          audioElement.volume = 1.0;
          audioElement.muted = false;
          
          audioElement.play()
            .then(() => console.log('✅ Audio playing after answer'))
            .catch(err => {
              console.warn('⚠️ Audio play blocked:', err);
              this.toastr.info('Tap anywhere to enable audio');
            });
        }
      }, 500);
    }
  } catch (error) {
    console.error('❌ Error answering call:', error);
    this.toastr.error('Failed to answer call');
  }
}
testAudio() {
  if (this.remoteAudio) {
    const audioElement = this.remoteAudio.nativeElement;
    console.log('🔊 Audio status:', {
      srcObject: !!audioElement.srcObject,
      volume: audioElement.volume,
      muted: audioElement.muted,
      paused: audioElement.paused
    });
    
    if (audioElement.srcObject) {
      const stream = audioElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        console.log('Track:', track.kind, track.enabled, track.readyState);
      });
    }
    
    audioElement.play()
      .then(() => this.toastr.success('Audio playing!'))
      .catch(err => this.toastr.error('Audio failed: ' + err.message));
  }
}
  // Reject call
  async rejectCall() {
    try {
      if (this.incomingCall) {
        await this.audioCallService.rejectCall(this.incomingCall.callId);
        this.incomingCall = null;
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }

  // End call
  async endCall() {
    try {
      await this.audioCallService.endCall();
      this.toastr.info('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = this.audioCallService.toggleMute();
  }

  // Start call timer
  private startCallTimer() {
    this.callStartTime = Date.now();
    this.callTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.callDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  // Stop call timer
  private stopCallTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
      this.callDuration = '00:00';
    }
  }

  // Existing methods...
  addEmojiToMessage(msgId: number, emoji: string | null) {
    if (emoji == "remove") {
      emoji = null;
    }
    const reactionform = {
      messageid: msgId,
      reaction: emoji
    }
    const msg = this.messages.find(m => m.id === msgId);
    if (msg) {
      msg.reaction = emoji;
    }
    this.emojiPickerIndex = null;
    this.shouldScrollToBottom = false;
    this.chatService.sendReaction(msgId, this.groupName, emoji)
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
    this.route.navigate(['/messages/t']);
  }

  loadChatData() {
    this.newMessage = '';
    if (this.groupName != null && this.groupName != undefined && this.groupName != "null") {
      this.ServiceSrv.GetProfileByUserName(this.groupName).subscribe({
        next: (data: any) => {
          this.profilePicture = data.profilePicture;
          this.username = data.userName
          this.fullName = data.fullName
        },
        error: (error: any) => {
          console.log(error);
        }
      })
      this.chatService.PersonalChat(this.groupName, this.user).subscribe((msgs: any) => {
        this.messages = msgs;
        this.shouldScrollToBottom = true;
        const conn = this.chatService.connection;
        if (conn) {
          conn.off("ReceiveReaction");
          conn.on("ReceiveReaction", (messageId: number, reaction: string) => {
            const msg = this.messages.find(m => m.id === messageId);
            if (msg) msg.reaction = reaction;
          });
          conn.off("RecieveUnSend");
          conn.on("RecieveUnSend", (messageId: number) => {
            this.messages = this.messages.filter(m => m.id !== messageId);
          });
        }
      });
    }
  }

  toggleEmojiPicker(index: number): void {
    this.preventAutoScroll = true;
    this.emojiPickerIndex = this.emojiPickerIndex === index ? null : index;
  }

  send(postlink?: string, profilepicture?: string, usernameofpostreel?: string, postid?: number, publicid?: string, reelurl?: string) {
    if (this.isUploadingFile) {
      return;
    }
    if (this.selectedFile) {
      this.SendFileFunction();
    } else if (this.newMessage.trim()) {
      const DateTime = new Date();
      this.chatService.sendMessage(this.user, this.groupName, this.newMessage, DateTime.toLocaleString(), postlink, profilepicture, usernameofpostreel, postid, publicid, reelurl);
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
      this.menuOpenId = null;
    } else {
      this.menuOpenId = msgId;
    }
  }

  unsendMessage(msgId: number) {
    this.messages = this.messages.filter(m => m.id !== msgId);
    this.menuOpenId = null;
    this.ServiceSrv.DeleteChat(msgId).subscribe({
      next: (res) => {
        this.chatService.unsendMessage(msgId, this.groupName);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  FunctionGetSaveRecentMessage() {
    if (this.user !== this.groupName) {
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
    if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFileUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
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
          this.clearSelectedFile();
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
    const escaped = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const formatted = escaped.replace(urlRegex, (url) => {
      let href = url;
      if (url.startsWith('www.')) {
        href = 'https://' + url;
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        href = 'https://' + url;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #8bf7ffff; text-decoration: underline;">${url}</a>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

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

  async toggleRecording() {
    if (!this.isRecording) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.toastr.error("Your browser doesn't support audio recording");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.isRecording = true;
        this.isProcessingAudio = false;
        this.recordStartTime = Date.now();
        this.recordingDuration = 0;
        this.recordingInterval = setInterval(() => {
          this.recordingDuration = (Date.now() - this.recordStartTime) / 1000;
        }, 100);
        this.mediaRecorder.ondataavailable = (event: any) => {
          this.audioChunks.push(event.data);
        };
        this.mediaRecorder.start();
        setTimeout(() => {
          if (this.isRecording) {
            this.stopHoldRecording();
            this.toastr.info("Maximum recording duration reached (60s)");
          }
        }, this.maxAudioDuration);
      } catch (error: any) {
        console.error("Microphone error:", error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.showMicPermissionPopup = true;
          this.toastr.error("🎤 Microphone permission denied!", "Permission Required", { timeOut: 5000 });
        } else {
          this.toastr.error("🎤 Failed to access microphone");
        }
        this.isRecording = false;
      }
    } else {
      this.stopHoldRecording();
    }
  }

  stopHoldRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.isProcessingAudio = true;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
    }
    this.mediaRecorder.stop();
    this.mediaRecorder.onstop = () => {
      const duration = Date.now() - this.recordStartTime;
      if (duration < this.minRecordDuration) {
        this.toastr.warning("Recording too short. Hold for at least 0.5 seconds.");
        this.audioBlob = null;
        this.audioUrl = null;
        this.recordingDuration = 0;
        this.isProcessingAudio = false;
        return;
      }
      this.audioBlob = new Blob(this.audioChunks, { type: "audio/aac" });
      const unsafeUrl = URL.createObjectURL(this.audioBlob);
      this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeUrl);
      this.recordingDuration = 0;
      this.isProcessingAudio = false;
      this.toastr.success("Voice message recorded successfully!");
    };
  }

  cancelRecordedAudio() {
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

  sendRecordedAudio() {
    if (!this.audioBlob) {
      this.toastr.error("No audio to send");
      return;
    }
    this.isSendAudio = true
    const formData = new FormData();
    const fileName = this.audioBlob.type.includes('webm') ? 'voiceMessage.webm' : 'voiceMessage.mp3';
    formData.append("file", this.audioBlob, fileName);
    formData.append("GroupName", this.user);
    formData.append("User", this.groupName);
    this.isUploadingFile = true;
    this.ServiceSrv.SendVM(formData).subscribe({
      next: (data: any) => {
        this.isSendAudio = false;
        this.isUploadingFile = false;
        this.cancelRecordedAudio();
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

  closeMicPopup() {
    this.showMicPermissionPopup = false;
  }

  openBrowserSettings() {
    this.showMicPermissionPopup = false;
    if (navigator.userAgent.includes("Chrome")) {
      this.route.navigateByUrl("/chrome//settings/content/microphone")
      return;
    }
    if (navigator.userAgent.includes("Android")) {
      window.open("about:preferences#privacy", "_blank");
      return;
    }
    this.toastr.info("Please go to Settings > Safari > Microphone and Allow");
  }

  ngOnDestroy() {
    // Cleanup audio call
    this.audioCallService.stopConnection();
    
    // Cleanup timers
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
    }
    this.cancelRecordedAudio();
  }
  // ✅ NEW: Toggle speaker on/off
  async toggleSpeaker() {
    try {
      if (this.remoteAudio && this.remoteAudio.nativeElement) {
        const newState = await this.audioCallService.toggleSpeaker(
          this.remoteAudio.nativeElement
        );
        
        if (newState) {
          this.toastr.info('🔊 Loudspeaker ON');
        } else {
          this.toastr.info('🔇 Earpiece mode');
        }
      }
    } catch (error) {
      console.error('Error toggling speaker:', error);
      this.toastr.error('Failed to toggle speaker');
    }
  }

  // ✅ NEW: Show speaker selection menu
  async showSpeakerSelection() {
    try {
      this.availableSpeakers = await this.audioCallService.getAvailableSpeakers();
      this.showSpeakerMenu = !this.showSpeakerMenu;
    } catch (error) {
      console.error('Error getting speakers:', error);
    }
  }

  // ✅ NEW: Select specific speaker
  async selectSpeaker(deviceId: string) {
    try {
      if (this.remoteAudio && this.remoteAudio.nativeElement) {
        await this.audioCallService.setAudioOutputDevice(
          this.remoteAudio.nativeElement,
          deviceId
        );
        this.showSpeakerMenu = false;
        this.toastr.success('Speaker changed');
      }
    } catch (error) {
      console.error('Error selecting speaker:', error);
      this.toastr.error('Failed to change speaker');
    }
  }
}