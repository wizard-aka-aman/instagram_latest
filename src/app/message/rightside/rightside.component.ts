import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ServiceService } from 'src/app/service.service';
import { ChatService } from 'src/app/chatservice.service';
import { EventEmitter } from '@angular/core';
import { MessageServiceService } from 'src/app/message-service.service';
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

  constructor(private router: ActivatedRoute, private location: Location, private ServiceSrv: ServiceService, private chatService: ChatService ,private route :Router , private MessageService : MessageServiceService) {
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
    if (this.newMessage.trim()) {
      const DateTime = new Date(); 
      this.chatService.sendMessage(this.user, this.groupName, this.newMessage, DateTime.toLocaleString(),postlink, profilepicture, usernameofpostreel,postid,publicid ,reelurl);
      this.FunctionGetSaveRecentMessage(); 
      this.newMessage = '';
      this.shouldScrollToBottom = true; 
      
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
}


