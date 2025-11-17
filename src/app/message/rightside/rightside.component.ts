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
}


