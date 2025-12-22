import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit, AfterViewInit {
  notifications: any[] = [];
  loggedInUser: string = "";
  totalPages: number = 0; // The total number of notifications available on the server
  pageSize: number = 10;
  pageNumber: number = 1;
  observer!: IntersectionObserver;
  // Note: The template now uses 'let i = index' to set 'data-index' directly on the <li>.
  @ViewChildren('NotificationList') NotificationList!: QueryList<ElementRef>;
  loading = false
  constructor(private serviceSrv: ServiceService) {
    this.loggedInUser = this.serviceSrv.getUserName();
  }

  ngOnInit(): void {

    // Send request to mark all existing notifications as seen
    this.serviceSrv.SeenNotification(this.loggedInUser).subscribe({
      next: (data: any) => {
        // Success: Notifications marked as seen
      },
      error: (err: any) => {
        console.log("Error marking notifications as seen:", err);
      }
    })
    this.AllNoti();
  }
  
  ngAfterViewInit() {
    // Setup Intersection Observer for infinite scrolling
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // check if element visible
        if (entry.isIntersecting) {
          const index = Number((entry.target as HTMLElement).getAttribute('data-index'));
          // Trigger load if the last or second-last item is visible
          if (index >= this.notifications.length - 2) {
            // Check if there are more total pages to load (total is the total count, not pages)
            // It should be totalPages > this.notifications.length
            if (this.notifications.length < this.totalPages) {
              this.AllNoti();
            }
          }
        }
      });
    }, { threshold: 0.5 }); // 50% visible होने पर trigger

    // Attach observer to new elements when the list changes (i.e., new items are loaded)
    this.NotificationList.changes.subscribe((cards: QueryList<ElementRef>) => {
      // Disconnect observer from old elements if necessary (optional cleanup)
      // this.observer.disconnect(); 
      cards.forEach((card, i) => {
        // Data index is now set in the template
        // card.nativeElement.setAttribute('data-index', i.toString()); // Removed, now in template
        this.observer.observe(card.nativeElement);
      });
    });
  }

  AllNoti() {
    if (this.loading) return; // Prevent multiple calls
    this.loading = true;

    this.serviceSrv.GetAllNotifications(this.loggedInUser, this.pageNumber, this.pageSize).subscribe({
      next: (data: any) => {
        this.totalPages = data.total // Assuming 'total' is the total count of all notifications
        if (this.pageNumber === 1) {
          this.notifications = data.item1; // First load replaces the array
        } else {
          this.notifications = [...this.notifications, ...data.item1]; // Append to the existing array
        }
        this.pageNumber++; // Prepare for the next page
        this.loading = false;
        
        // Update service/state about unread notifications
        this.serviceSrv.setNoti(data.item1.every((e: any) => e.isSeen))
      },
      error: (err: any) => {
        console.log("Error fetching notifications:", err);
        this.loading = false;
      },
    })
  }
  
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return  image;
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
        return `${Math.floor(diffMinutes)}m`; // Instagram uses 'm' for minutes
      } else {
        return `${Math.floor(diffHours)}h`; // Instagram uses 'h' for hours
      }
    } else {
      // If > 24 hr, use a concise date format (e.g., Nov 19)
      return postTime.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    }
  }

  ConfirmFollow(username: string, n: any) {
    const followForm = {
      followerUsername: username,
      followingUsername: this.loggedInUser
    };
    
    this.serviceSrv.FollowPost(followForm).subscribe({
      next: (res: any) => {
        // Remove the notification item from the list upon success
        this.notifications = this.notifications.filter(e => e.id != n.id)
      },
      error: (err) => {
        console.log("Error confirming follow:", err);
      }
    })
  }

  RemoveRequest(username: string, n: any) {
    this.serviceSrv.DeleteRequest(username, this.loggedInUser).subscribe({
      next: (data: any) => {
        // Remove the notification item from the list upon success
        this.notifications = this.notifications.filter(e => e.id != n.id)
      },
      error: (error) => {
        console.error("Error removing request:", error);
      }
    })
  }
}