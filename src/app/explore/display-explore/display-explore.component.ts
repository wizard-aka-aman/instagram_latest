import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-explore',
  templateUrl: './display-explore.component.html',
  styleUrls: ['./display-explore.component.scss']
})
export class DisplayExploreComponent implements OnInit {
  loggedInUser :string =""
  posts : any[] = [];
  constructor(private serviceSrv: ServiceService , private router : Router) {
    this.loggedInUser = this.serviceSrv.getUserName();
   }
  ngOnInit(): void {
    this.serviceSrv.ExploreRefreshFetched$.subscribe({
      next: (res: boolean) => {
        if (!res) {
            this.serviceSrv.Get10Posts(this.loggedInUser).subscribe({
      next: (res: any) => {
        this.posts = res;
        this.serviceSrv.ExploreRefreshSubject.next(this.posts);
        this.serviceSrv.ExploreRefreshSubjectFetched.next(true);
        console.log(res);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
        }else{
          this.serviceSrv.ExploreRefresh$.subscribe({
            next: (res: any) => {
              this.posts = res;
            },
          })
        }
      }
    })
    
  }
   getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
  openPostPage(username:string ,postId: number) {
    this.router.navigate([`/${username}/p/${postId}`]);
  }
  openReelPage(username:string ,publicId: string) {
    this.router.navigate([`/${username}/reel/${publicId}`]);
  }

}
