import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
notifications: any;
  loggedInUser:string = "";
  constructor(private serviceSrv : ServiceService) {
    this.loggedInUser = this.serviceSrv.getUserName();
   }

  ngOnInit(): void {
    this.serviceSrv.GetAllNotifications(this.loggedInUser).subscribe({
      next:(data:any)=>{
        this.notifications = data
        console.log(data);
        
      },
      error:(err:any)=>{
        console.log(err);
        
      },
    })

    this.serviceSrv.SeenNotification(this.loggedInUser).subscribe({
      next:(data:any)=>{
        console.log(data);
      },
      error:(err:any)=>{
        console.log(err); 
      }
    })
  }

  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }

  TimeSincePost(postDateTimeString: string): string {
  const postTime = new Date(postDateTimeString);
  const currentTime = new Date();

  const diffMs = currentTime.getTime() - postTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${Math.floor(diffMinutes)} min ago`;
    } else {
      return `${Math.floor(diffHours)} hr ago`;
    }
  } else {
    // Agar 24 hr se jyada ho to date/time format
    return postTime.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

}
