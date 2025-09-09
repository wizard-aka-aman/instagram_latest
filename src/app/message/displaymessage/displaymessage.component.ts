import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-displaymessage',
  templateUrl: './displaymessage.component.html',
  styleUrls: ['./displaymessage.component.scss']
})
export class DisplaymessageComponent implements OnInit { 
  constructor() { }
 @ViewChild('myDiv') myDiv!: ElementRef;
  width: number = 0;

  ngAfterViewInit() {
    this.updateWidth(); // initial width
  }

  // Listen to window resize
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.updateWidth();
  }

  updateWidth() {
    this.width = this.myDiv.nativeElement.offsetWidth; 
    
  }
  ngOnInit(): void { 
  }
   
}
