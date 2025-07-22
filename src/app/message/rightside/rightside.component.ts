import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ServiceService } from 'src/app/service.service';
import { ChatService } from 'src/app/chatservice.service';
import * as signalR from '@microsoft/signalr';
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
  chatList: any;
  profilePicture: any;
  fullName: string = ""
  messages: any[] = [];
  groupName: string = '';
  user = '';
  message = '';
  emojis: string[] = ['😀', '😂', '😍', '😢', '👍', '🔥'];
  shouldScrollToBottom: boolean = true;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  emojiPickerIndex: number | null = null;


  constructor(private router: ActivatedRoute, private location: Location, private ServiceSrv: ServiceService, private chatService: ChatService) {
    this.user = this.ServiceSrv.getUserName();
    this.router.paramMap.subscribe(params => {
      this.groupName = String(params.get('groupname'));
      this.chatList = this.ServiceSrv.getChatList();
      for (let index = 0; index < this.chatList.length; index++) {
        if (this.chatList[index].userName === this.groupName) {
          this.profilePicture = this.chatList[index].profilePicture;
          this.fullName = this.chatList[index].fullName
          break;
        }
      }
      if (!this.chatList || this.chatList.length === 0) {
        this.ServiceSrv.GetFollowing(this.user).subscribe({
          next: (data: any) => {
            this.ServiceSrv.setChatList(data);
            this.chatList = data;
            for (let index = 0; index < this.chatList.length; index++) {
              if (this.chatList[index].userName === this.groupName) {
                this.profilePicture = this.chatList[index].profilePicture;
                this.fullName = this.chatList[index].fullName
                break;
              }
            }
          },
          error: (error: any) => {
            console.error(error);
          }
        })
      }


    });
    console.log("groupname : " + this.groupName);
    console.log("user : " + this.user);

  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isEmojiButton = target.closest('.overlay');
    const isEmojiPicker = target.closest('.emoji-picker-container');

    if (!isEmojiButton && !isEmojiPicker) {
      this.emojiPickerIndex = null; // close emoji picker if clicked outside
    }
  }

  addEmojiToMessage(msgId: number, emoji: string) {
    const reactionform = {
      messageid: msgId,
      reaction: emoji
    }

    this.emojiPickerIndex = null;
this.shouldScrollToBottom = false; // Reaction added, don't scroll
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
    this.location.back();
  }
  ngOnInit() {
    this.router.paramMap.subscribe(params => {
      this.groupName = String(params.get('groupname'));
      this.loadChatData();
    });

    this.user = this.ServiceSrv.getUserName();

    this.chatService.startConnection(this.user, (sender, messageGroup, message) => {
      if (messageGroup === this.groupName) {
        this.messages.push({ groupName: messageGroup, sender, message, sentAt: Date() });
        this.shouldScrollToBottom = true;
      }
    });
  }
  loadChatData() {
    this.chatList = this.ServiceSrv.getChatList();

    for (let index = 0; index < this.chatList.length; index++) {
      if (this.chatList[index].userName === this.groupName) {
        this.profilePicture = this.chatList[index].profilePicture;
        this.fullName = this.chatList[index].fullName;
        break;
      }
    }

    if (!this.chatList || this.chatList.length === 0) {
      this.ServiceSrv.GetFollowing(this.user).subscribe({
        next: (data: any) => {
          this.ServiceSrv.setChatList(data);
          this.chatList = data;
          for (let index = 0; index < this.chatList.length; index++) {
            if (this.chatList[index].userName === this.groupName) {
              this.profilePicture = this.chatList[index].profilePicture;
              this.fullName = this.chatList[index].fullName;
              break;
            }
          }
        },
        error: (error: any) => console.error(error)
      });
    }

    // 👇 Load chat messages
    this.chatService.PersonalChat(this.groupName, this.user).subscribe((msgs: any) => {
      this.messages = msgs;
this.shouldScrollToBottom = true; // Scroll on initial load
      const conn = this.chatService.connection;
      if (conn) {
        conn.off("ReceiveReaction"); // Remove previous handler
        conn.on("ReceiveReaction", (messageId: number, reaction: string) => {
          const msg = this.messages.find(m => m.id === messageId);
          if (msg) msg.reaction = reaction;
        });
      }
    });
  }



  toggleEmojiPicker(index: number): void {
    this.preventAutoScroll = true; // Prevent scroll after emoji picker toggle
    this.emojiPickerIndex = this.emojiPickerIndex === index ? null : index;
  }

  send() {
    const DateTime = new Date();
    console.log(DateTime);

    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.user, this.groupName, this.newMessage, DateTime.toLocaleString());

      // Show message locally for sender
      this.messages.push({
        groupName: this.user,
        sender: this.groupName,
        message: this.newMessage,
        sentAt: DateTime.toLocaleString()
      });
      this.newMessage = '';
      this.shouldScrollToBottom = true;

    }

    // setTimeout(() => {
    //   const el = this.chatContainer.nativeElement;
    // el.scrollTop = el.scrollHeight;
    // }, 50);
  }
}
