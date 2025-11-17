import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-displaysearch',
  templateUrl: './displaysearch.component.html',
  styleUrls: ['./displaysearch.component.scss']
})
export class DisplaysearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: any[] = []; 
  isLoading = false;
  debounceTimer: any;
  width= 0;
  @ViewChild('myDiv') myDiv!: ElementRef;
  constructor(private service: ServiceService) { }

  ngOnInit(): void { }
  ngAfterViewInit() {
    this.updateWidth(); // initial width
  }
  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  performSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.searchResults = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.service.SearchUsers(query).subscribe({
      next: (res: any) => {
        this.searchResults = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.searchResults = [];
        this.isLoading = false;
      }
    });
  }

  DeBounce() { 
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (!this.searchQuery || this.searchQuery.trim().length === 0) {
      this.searchResults = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.debounceTimer = setTimeout(() => { 
      this.performSearch(this.searchQuery);
    }, 300);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isLoading = false;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  getProfileImage(image: string | null): string {
    return !image || image === 'null' 
      ? 'assets/avatar.png' 
      : 'data:image/jpeg;base64,' + image;
  }
    // Listen to window resize
    @HostListener('window:resize', ['$event'])
    onWindowResize() {
      console.log(this.width);
      
      this.updateWidth();
    }
  
    updateWidth() {
      this.width = this.myDiv.nativeElement.offsetWidth; 
    }
}