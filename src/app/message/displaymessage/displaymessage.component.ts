import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-displaymessage',
  templateUrl: './displaymessage.component.html',
  styleUrls: ['./displaymessage.component.scss']
})
export class DisplaymessageComponent implements OnInit { 
 @ViewChild('myDiv') myDiv!: ElementRef;
  width: number = 0;
  isChatOpen: boolean = false; 

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngAfterViewInit() {
    this.updateWidth(); // initial width
  }

  ngOnInit(): void { 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfChatOpen();
      });

    // Initial check
    this.checkIfChatOpen();
  }

  checkIfChatOpen() {
    this.route.firstChild?.paramMap.subscribe(params => {
      const groupName = params.get('groupname');
      this.isChatOpen = !!groupName && groupName !== 'null' && groupName !== 't';
    });
  }

  // Listen to window resize
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.updateWidth();
  }

  updateWidth() {
    this.width = this.myDiv.nativeElement.offsetWidth; 
  }
   
}
