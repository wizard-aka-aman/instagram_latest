import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display-reel',
  templateUrl: './display-reel.component.html',
  styleUrls: ['./display-reel.component.scss']
})
export class DisplayReelComponent implements OnInit {
reels: any[] = [];
  publicid: string = "";
  LoggedInUser: string = "";

  // Reference to all video elements
  @ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(private serviceSrv: ServiceService, private route: ActivatedRoute) {
    this.LoggedInUser = this.serviceSrv.getUserName();

    this.route.paramMap.subscribe((params: any) => {
      this.publicid = params.get('publicid');
      this.fivereel(this.publicid);
    });
  }

  ngOnInit(): void {}

  fivereel(publicid: string) {
    this.serviceSrv.GetFiveReel().subscribe({
      next: (res: any ) => {
        this.reels = res;
        console.log(this.reels);
        
      },
      error: (err: any) => {
        console.error(err);
      }
    }); 
  }

  // Play only the selected video, pause the rest
  pauseOtherVideos(currentIndex: number) {
    this.videoPlayers.forEach((player, index) => {
      const video = player.nativeElement;
      if (index !== currentIndex && !video.paused) {
        video.pause();
      }
    });
  }
}