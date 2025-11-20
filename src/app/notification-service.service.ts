import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'; 

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService { private hubConnection!: signalR.HubConnection;
  private baseUrl = 'https://xatavop939.bsite.net'; // online server as needed
  // private baseUrl = 'https://localhost:7246'; // local server as needed
  // private baseUrl = 'https://10.0.0.204:5000'; // local server as needed

  constructor( ) {}

  public async startConnection(groupName: string, onReceive: ( sender :string,user: string, message: string) => void): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/notification`,{
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();
  
    // this.hubConnection.on("ReceiveMessage", onReceive);
    this.hubConnection.on("ReceiveMessage", (sender: string, groupName: string, message: string) => {
      onReceive(sender, groupName, message);
      console.log(sender, groupName, message);
      
    });
    
    
    
  
    try {
      await this.hubConnection.start();
      console.log("SignalR Connected.");
      await this.hubConnection.invoke("JoinGroup", groupName);
    } catch (err) {
      console.error("SignalR Connection Error:", err);
    }
  }
  
  public sendMessage(groupName: string, user: string, message: string , DateTime:any ) { 
      
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendMessage", groupName, user, message);
    } else {
      console.warn("SignalR not connected. Message not sent.");
    } 
    // console.log({ groupName, sender: user, message , sentAt : DateTime });
    
  }
  
  
 

}
