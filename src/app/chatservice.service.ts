import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;

  private baseUrl = 'https://xatavop939.bsite.net'; // online server as needed
  // public baseUrl: string = 'https://localhost:7246';
  
  constructor(private http: HttpClient,private service : ServiceService) { }

  public async startConnection(groupName: string, onReceive: (messageId: number, sender: string, user: string, message: string) => void): Promise<void> {
  const sender = this.service.getUserName(); // helper method if needed
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${this.baseUrl}/chatHub`, { withCredentials: true })
    .withAutomaticReconnect()
    .build();

  this.hubConnection.on("ReceiveMessage", (messageId: number, sender: string, groupName: string, message: string) => {
    onReceive(messageId, sender, groupName, message);
  });

  try {
    await this.hubConnection.start();
    console.log("SignalR Connected.");
    await this.hubConnection.invoke("JoinGroup", groupName); // recipient
    await this.hubConnection.invoke("JoinGroup", sender);    // self
  } catch (err) {
    console.error("SignalR Connection Error:", err);
  }
}



  public sendMessage(groupName: string, user: string, message: string, DateTime: any) {

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendMessage", groupName, user, message);
    } else {
      console.warn("SignalR not connected. Message not sent.");
    }
    // this.saveMessage({ groupName, sender: user, message });
    // console.log({ groupName, sender: user, message , sentAt : DateTime });

  }
  public get connection(): signalR.HubConnection {
    return this.hubConnection;
  }

  private saveMessage(message: any) {
    return this.http.post(`${this.baseUrl}/api/chat`, message).subscribe();
  }

  public getMessages(groupName: string) {
    return this.http.get(`${this.baseUrl}/api/chat/${groupName}`);
  }
  sendReaction(messageId: number, groupName: string, reaction: string | null) {
    console.log("Invoking SendReaction with:", { messageId, groupName, reaction });

    this.hubConnection.invoke("SendReaction", messageId, groupName, reaction)
      .catch(err => console.error("SignalR SendReaction failed:", err));
  }

  saveReaction(reaction: any) {
    return this.http.post(`${this.baseUrl}/api/Chat/reaction`, reaction);
  }

  public PersonalChat(groupName: string, sender: string) {
    return this.http.get(`${this.baseUrl}/api/Chat/` + groupName + '/' + sender);
  }
  unsendMessage(messageId: number, groupName: string) {
    if (this.connection) {
      this.connection.invoke("UnSend", messageId, groupName).catch(err => console.error(err));
    }
  }

}
