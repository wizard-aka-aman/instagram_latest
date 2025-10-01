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
  totalPages: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  observer!: IntersectionObserver;
  @ViewChildren('NotificationList') NotificationList!: QueryList<ElementRef>;
  loading = false
  constructor(private serviceSrv: ServiceService) {
    this.loggedInUser = this.serviceSrv.getUserName();
  }

  ngOnInit(): void {

    this.serviceSrv.SeenNotification(this.loggedInUser).subscribe({
      next: (data: any) => {
      },
      error: (err: any) => {
        console.log(err);
      }
    })
    this.AllNoti();
  }
  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // check if element visible
        if (entry.isIntersecting) {
          const index = Number((entry.target as HTMLElement).getAttribute('data-index'));
          // agar last ya second-last visible hai
          if (index >= this.notifications.length - 2) {
            if (this.totalPages != this.notifications.length) {
              this.AllNoti();
            }
          }
        }
      });
    }, { threshold: 0.5 }); // 50% visible hone par trigger

    // attach observer
    this.NotificationList.changes.subscribe((cards: QueryList<ElementRef>) => {
      cards.forEach((card, i) => {
        card.nativeElement.setAttribute('data-index', i.toString());
        this.observer.observe(card.nativeElement);
      });
    });
  }
  AllNoti() {
    if (this.loading) return; // multiple calls avoid karo
    this.loading = true;

    this.serviceSrv.GetAllNotifications(this.loggedInUser, this.pageNumber, this.pageSize).subscribe({
      next: (data: any) => {
        this.totalPages = data.total
        if (this.pageNumber === 1) {
          this.notifications = data.item1; // first time replace
        } else {
          this.notifications = [...this.notifications, ...data.item1]; // baaki append
        }
        this.pageNumber++; // next page
        this.loading = false;
        this.serviceSrv.setNoti(data.item1.every((e: any) => e.isSeen))
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;

      },
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
  ConfirmFollow(username: string, n: any) {
    const followForm = {
      followerUsername: '',
      followingUsername: ''
    };
    followForm.followerUsername = username
    followForm.followingUsername = this.loggedInUser;
    this.serviceSrv.FollowPost(followForm).subscribe({
      next: (res: any) => {
        this.notifications = this.notifications.filter(e => e.id != n.id)
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  RemoveRequest(username: string, n: any) {
    this.serviceSrv.DeleteRequest(username, this.loggedInUser).subscribe({
      next: (data: any) => {
        this.notifications = this.notifications.filter(e => e.id != n.id)
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

}
