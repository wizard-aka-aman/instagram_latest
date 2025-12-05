import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ServiceService } from 'src/app/service.service';
import { ChatService } from 'src/app/chatservice.service';
import { EventEmitter } from '@angular/core';
import { MessageServiceService } from 'src/app/message-service.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EncryptionService } from 'src/app/encryption.service';
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
    private toastr:ToastrService,private sanitizer: DomSanitizer,private encryptionService :EncryptionService
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
  // async ngOnInit() {
  //   await this.initializeEncryption();
  //   this.MessageService.SetIsMessage(false);
  //   this.router.paramMap.subscribe(params => {
  //     this.groupName = String(params.get('groupname'));
  //     this.loadChatData();
  //   });

  //   this.user = this.ServiceSrv.getUserName();

  //   const conn = this.chatService.connection;
  // if (conn) {
  //   conn.on("ReceiveMessage", async (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl) => {
  //     // yaha pe sirf messages ko push karna hai
  //     // Decrypt message if it's a text message and has IV
  //         let decryptedMessage = message;
  //         const iv = usernameofpostreel.split(',')[1];
  //         if (iv && postlink === null) {  // Only decrypt text messages
  //           // Determine the other user (sender if we're receiver, or groupName if we're sender)
  //           const currentUser = this.ServiceSrv.getUserName();
  //           const otherUser = sender === currentUser ? this.groupName : sender;
            
  //           decryptedMessage = await this.encryptionService.decryptMessage(
  //             message,
  //             iv,
  //             otherUser
  //           );
  //         }
  //     if (messageGroup === this.groupName || sender === this.groupName) {
  //      this.messages.push({
  //         id: messageId,
  //         groupName: messageGroup,
  //         sender,
  //         message:decryptedMessage,
  //         postLink : postlink,
  //         profilePicture:profilepicture,
  //         usernameOfPostReel:usernameofpostreel,
  //         postId : postid,
  //         reelPublicId:publicid,
  //         mediaUrl:reelurl,
  //         sentAt: new Date()
  //       });
  //       this.shouldScrollToBottom = true;
  //     }
  //   });
  // }



  //   /*this.chatService.startConnection(this.user, (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl) => {
  //     const isForThisChat = messageGroup === this.groupName || sender === this.groupName;
  //     console.log({
  //       id: messageId,
  //       groupName: messageGroup,
  //       sender,
  //       message,
  //       postlink,
  //       profilepicture,
  //       usernameofpostreel,
  //       postid,
  //       publicid,
  //       reelurl
  //     });
  //     if(sender == this.user){
  //     this.MessageService.SetIsMessage(true);
  //   } 

  //     if (isForThisChat) {        
  //       this.messageId = messageId;
  //       this.messages.push({
  //         id: messageId,
  //         groupName: messageGroup,
  //         sender,
  //         message,
  //         postLink : postlink,
  //         profilePicture:profilepicture,
  //         usernameOfPostReel:usernameofpostreel,
  //         postId : postid,
  //         reelPublicId:publicid,
  //         mediaUrl:reelurl,
  //         sentAt: new Date()
  //       });
  //       this.shouldScrollToBottom = true;
  //     }
  //   }); */
 
  // }
  // rightside.component.ts

async ngOnInit() {
  // ✅ FIRST: Initialize encryption and WAIT for it
  console.log("onintionintionintionintionintionintioninti");
  
  await this.initializeEncryption();
  
  this.MessageService.SetIsMessage(false);
  
  this.router.paramMap.subscribe(async params => {
    this.groupName = String(params.get('groupname'));
    
    // ✅ When route changes, generate shared secret again
    if (this.groupName && this.groupName !== 'null') {
      await this.generateSharedSecretForUser(this.groupName);
    }
    
    this.loadChatData();
  });

  this.user = this.ServiceSrv.getUserName();

  const conn = this.chatService.connection;
  if (conn) {
    conn.on("ReceiveMessage", async (messageId, sender, messageGroup, message, postlink, profilepicture, usernameofpostreel, postid, publicid, reelurl) => {
      let decryptedMessage = message;
      const ivData = usernameofpostreel?.split(',');
      const iv = ivData?.[1];
      
      if (iv && postlink === null) {
        const currentUser = this.ServiceSrv.getUserName();
        const otherUser = sender === currentUser ? messageGroup : sender;
        
        try {
          decryptedMessage = await this.encryptionService.decryptMessage(
            message,
            iv,
            otherUser
          );
        } catch (error) {
          console.error('Decryption failed:', error);
          decryptedMessage = '[Encrypted Message]';
        }
      }
      
      if (messageGroup === this.groupName || sender === this.groupName) {
        this.messages.push({
          id: messageId,
          groupName: messageGroup,
          sender,
          message: decryptedMessage,
          postLink: postlink,
          profilePicture: profilepicture,
          usernameOfPostReel: ivData?.[0], // Original username without IV
          postId: postid,
          reelPublicId: publicid,
          mediaUrl: reelurl,
          sentAt: new Date()
        });
        this.shouldScrollToBottom = true;
      }
    });
  }
}

// ✅ NEW: Helper function to generate shared secret
private async generateSharedSecretForUser(username: string): Promise<void> {
  try {
    console.log(`🔍 Fetching public key for: ${username}`);
    
    const response: any = await this.ServiceSrv
      .getPublicKey(username)
      .toPromise();
    
    console.log(`📥 Response for ${username}:`, response);
    
    if (response?.publicKey) {
      await this.encryptionService.generateSharedSecret(
        response.publicKey,
        username
      );
      console.log(`✅ Shared secret generated for ${username}`);
    } else {
      console.warn(`⚠️ No public key in response for ${username}`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to generate shared secret for ${username}:`, error);
    
    if (error.status === 404) {
      console.warn(`⚠️ ${username} hasn't set up encryption yet`);
      // Don't show error - just log
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// ✅ UPDATE: Initialize encryption properly
private async initializeEncryption() {
  try {
    let privateKey = localStorage.getItem('privateKey');
    let publicKey = localStorage.getItem('publicKey');

    // SCENARIO 1: Keys Local Storage me hain (Normal flow)
    if (privateKey && publicKey) {
      console.log('✅ Keys found in LocalStorage');
      await this.encryptionService.loadKeys(privateKey);
    } 
    // SCENARIO 2: Local Storage khali hai (Clear kar diya ya new device)
    else {
      console.log('🔍 Checking server for backup keys...');
      
      try {
        // Server se keys mango
        const serverResponse: any = await this.ServiceSrv.getPublicKey(this.user).toPromise();

        // Check karo ki server ke paas Private Key hai ya nahi
        if (serverResponse && serverResponse.publicKey && serverResponse.privateKey) {
          console.log('📥 Keys found on server. Restoring...');
          
          privateKey = serverResponse.privateKey;
          publicKey = serverResponse.publicKey;

          // Wapas Local Storage me daal do
          if (privateKey && publicKey) {
             localStorage.setItem('privateKey', privateKey);
             localStorage.setItem('publicKey', publicKey);
             
             // Load kar lo taaki decryption chalu ho jaye
             await this.encryptionService.loadKeys(privateKey);
             console.log('✅ Keys restored successfully!');
          }
        } 
        else {
          // Server pe bhi nahi hai -> Matlab bilkul naya user hai
          throw new Error("No keys on server");
        }
      } catch (err) {
        // SCENARIO 3: First Time Setup (Generate & Save to Server)
        console.log('🆕 Generating NEW key pair...');
        
        const keys = await this.encryptionService.generateKeyPair();

        // Server par Public Key + Private Key dono save karo
        await this.ServiceSrv.savePublicKey(
            this.user,
            keys.publicKey,
            keys.privateKey // Private key bhej rahe hain backup ke liye
        ).toPromise();

        localStorage.setItem('privateKey', keys.privateKey);
        localStorage.setItem('publicKey', keys.publicKey);
        
        await this.encryptionService.loadKeys(keys.privateKey);
        console.log('✅ New Encryption setup complete!');
      }
    }

    // Shared Secret generate karo current chat ke liye
    if (this.groupName && this.groupName !== 'null') {
      await this.generateSharedSecretForUser(this.groupName);
    }

  } catch (error) {
    console.error('❌ Encryption initialization failed:', error);
    this.toastr.error('Failed to initialize encryption');
  }
}

// ✅ UPDATE: loadChatData with decryption
loadChatData() {
  this.newMessage = '';
  
  if (this.groupName != null && this.groupName != undefined && this.groupName != "null") {
    this.ServiceSrv.GetProfileByUserName(this.groupName).subscribe({
      next: (data: any) => {
        console.log(data);
        this.profilePicture = data.profilePicture;
        this.username = data.userName;
        this.fullName = data.fullName;
      },
      error: (error: any) => {
        console.log(error);
      }
    });

    // Load chat messages
    this.chatService.PersonalChat(this.groupName, this.user).subscribe(async (msgs: any) => {
      // ✅ Decrypt all messages safely
      const decryptedMessages = await Promise.all(
        msgs.map(async (msg: any) => {
          // Only try to decrypt if IV exists and it's a text message
          if (msg.iv && msg.messageType === 'text' && msg.message) {
            const otherUser = msg.sender === this.ServiceSrv.getUserName()
              ? msg.groupName
              : msg.sender;
            
            try {
              // Check if shared secret exists
              const hasSharedSecret = this.encryptionService.hasSharedSecret(otherUser);
              
              if (!hasSharedSecret) {
                console.warn(`⚠️ No shared secret for ${otherUser}, trying to generate...`);
                await this.generateSharedSecretForUser(otherUser);
              }
              
              // Try to decrypt
              msg.message = await this.encryptionService.decryptMessage(
                msg.message,
                msg.iv,
                otherUser
              );
              console.log('✅ Message decrypted');
            } catch (error) {
              console.error('❌ Failed to decrypt message:', error);
              msg.message = '[Encrypted Message]';
            }
          }
          return msg;
        })
      );

      this.messages = decryptedMessages;
      console.log(`✅ Loaded ${msgs.length} messages`);
      this.shouldScrollToBottom = true;
      
      // Setup SignalR listeners
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

// ✅ UPDATE: send function with fallback for non-encrypted users
async send(postlink?: string, profilepicture?: string, usernameofpostreel?: string, postid?: number, publicid?: string, reelurl?: string) {
  if (this.isUploadingFile) {
    return;
  }
  
  if (this.selectedFile) {
    this.SendFileFunction();
  } else if (this.newMessage.trim()) {
    try {
      let messageToSend = this.newMessage;
      let ivToSend: string | undefined = undefined;

      // ✅ Try to encrypt if shared secret exists
      const hasSharedSecret = this.encryptionService.hasSharedSecret(this.groupName);
      
      if (hasSharedSecret) {
        try {
          const { encryptedMessage, iv } = await this.encryptionService.encryptMessage(
            this.newMessage,
            this.groupName
          );
          messageToSend = encryptedMessage;
          ivToSend = iv;
          console.log('✅ Message encrypted');
        } catch (encryptError) {
          console.error('❌ Encryption failed, sending unencrypted:', encryptError);
          // Fall back to unencrypted message
        }
      } else {
        console.warn(`⚠️ No shared secret for ${this.groupName}, sending unencrypted`);
        // Try to generate shared secret for next time
        await this.generateSharedSecretForUser(this.groupName);
      }

      const DateTime = new Date();
      this.chatService.sendMessage(
        this.user,
        this.groupName,
        messageToSend, // Could be encrypted or plain
        DateTime.toLocaleString(),
        postlink,
        profilepicture,
        usernameofpostreel,
        postid,
        publicid,
        reelurl,
        ivToSend // null if not encrypted
      );

      this.newMessage = '';
      this.shouldScrollToBottom = true;
      
      setTimeout(() => {
        const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
      }, 0);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      this.toastr.error('Failed to send message. Please try again.');
    }
  }
}
  // loadChatData() {
  // this.newMessage = '';
  //   if(this.groupName != null &&this.groupName!= undefined && this.groupName != "null" ){
  //     this.ServiceSrv.GetProfileByUserName(this.groupName).subscribe({
  //         next: (data: any) => {
  //           console.log(data);
  //           this.profilePicture = data.profilePicture;
  //           this.username = data.userName
  //           this.fullName = data.fullName
  //         },
  //         error: (error: any) => {
  //           console.log(error);
  //         }
  //       })
  //   // 👇 Load chat messages
  //   this.chatService.PersonalChat(this.groupName, this.user).subscribe((msgs: any) => { 
  //       msgs.map(async (msg: any) => {
  //         if (msg.iv && msg.messageType === 'text') {
  //           const otherUser = msg.sender === this.ServiceSrv.getUserName()
  //             ? msg.groupName 
  //             : msg.sender;
            
  //           msg.message = await this.encryptionService.decryptMessage(
  //             msg.message,
  //             msg.iv,
  //             otherUser
  //           );
  //         }
  //         return msg;
  //       })
      
  //     this.messages = msgs;
  //     console.log(msgs);
  //     this.shouldScrollToBottom = true; // Scroll on initial load
  //     const conn = this.chatService.connection;
  //     if (conn) {
  //       conn.off("ReceiveReaction"); // Remove previous handler
  //       conn.on("ReceiveReaction", (messageId: number, reaction: string) => {
  //         const msg = this.messages.find(m => m.id === messageId);
  //         if (msg) msg.reaction = reaction;
  //       });

  //       // ✅ Listen for real-time unsend
  //       conn.off("RecieveUnSend");
  //       conn.on("RecieveUnSend", (messageId: number) => {
  //         this.messages = this.messages.filter(m => m.id !== messageId);
  //       });
  //     }
  //   });
  //    }
  // }



  toggleEmojiPicker(index: number): void {
    this.preventAutoScroll = true; // Prevent scroll after emoji picker toggle
    this.emojiPickerIndex = this.emojiPickerIndex === index ? null : index;
  }

//  async send(postlink?: string, profilepicture?: string, usernameofpostreel?: string,postid? :number,publicid?:string ,reelurl?:string) {
//     if (this.isUploadingFile) {
//     return;
//   }
//   if (this.selectedFile) {
//     this.SendFileFunction();
//   } else if (this.newMessage.trim()) 
//     { 
//        const { encryptedMessage, iv } = await this.encryptionService.encryptMessage(
//         this.newMessage,
//         this.groupName  // recipient username
//       );

//       const DateTime = new Date(); 
//       this.chatService.sendMessage(this.user, this.groupName, this.newMessage, DateTime.toLocaleString(),postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl,iv);
//       // this.FunctionGetSaveRecentMessage(); 
//       this.newMessage = '';
//       this.shouldScrollToBottom = true; 
//       setTimeout(() => {
//     const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
//     if (textarea) {
//       textarea.style.height = 'auto';
//     }
//   }, 0);
//   }

//   }
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
    this.audioBlob = new Blob(this.audioChunks, { type: "audio/aac" });

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
    // window.open("chrome://settings/content/microphone");
    this.route.navigateByUrl("/chrome//settings/content/microphone")
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
// Add this to your component TypeScript file

// Helper function to format time (e.g., "5:14 PM")
formatMessageTime(sentAt: string): string {
  const date = new Date(sentAt);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Helper function to format date for separator (e.g., "Today", "Yesterday", "12/03/2024")
formatDateSeparator(sentAt: string): string {
  const messageDate = new Date(sentAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time to midnight for comparison
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  }
}

// Helper function to check if we need to show date separator
shouldShowDateSeparator(currentMsg: any, previousMsg: any): boolean {
  if (!previousMsg) return true;
  
  const currentDate = new Date(currentMsg.sentAt);
  const previousDate = new Date(previousMsg.sentAt);
  
  return currentDate.toDateString() !== previousDate.toDateString();
}
// Initialize encryption keys
  // private async initializeEncryption() {
  //   try {
  //     // Check if keys exist in localStorage
  //     let privateKey = localStorage.getItem('privateKey');
  //     let publicKey = localStorage.getItem('publicKey');

  //     if (!privateKey || !publicKey) {
  //       // Generate new key pair
  //       const keys = await this.encryptionService.generateKeyPair();
  //       privateKey = keys.privateKey;
  //       publicKey = keys.publicKey;

  //       // Save to localStorage
  //       localStorage.setItem('privateKey', privateKey);
  //       localStorage.setItem('publicKey', publicKey);

  //       // Save public key to server
  //       await this.ServiceSrv
  //         .savePublicKey(this.user, publicKey).subscribe({
  //           next:()=>{

  //           }
  //         })
  //     }

  //     // Load private key
  //     await this.encryptionService.loadKeys(privateKey);

  //     // Get recipient's public key and generate shared secret
  //       await this.ServiceSrv
  //       .getPublicKey(this.groupName).subscribe({
  //         next:async (response:any)=>{
  //         if (response?.publicKey) {
  //             await this.encryptionService.generateSharedSecret(
  //               response.publicKey,
  //               this.groupName
  //             );
  //           }
  //         }
  //       })

     
  //   } catch (error) {
  //     console.error('Encryption initialization failed:', error);
  //   }
  // }
}


