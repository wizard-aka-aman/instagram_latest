import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-displaysearch',
  templateUrl: './displaysearch.component.html',
  styleUrls: ['./displaysearch.component.scss']
})
export class DisplaysearchComponent implements OnInit {
  searchQuery = '';
  searchResults: any[] = []; 
  showDropdown = false;
  debounceTimer: any;
   constructor(private service: ServiceService) { 
   
  }
  ngOnInit(): void { 
  } 

  performSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    this.service.SearchUsers(query).subscribe({
      next: (res: any) => {
        this.searchResults = res;
        this.showDropdown = true;
      },
      error: (err) => {
        console.error(err);
        this.searchResults = [];
        this.showDropdown = false;
      }
    });
  } 
  getProfileImage(image: string | null): string {
    return !image || image === 'null' ? 'assets/avatar.png' : 'data:image/jpeg;base64,' + image;
  }
   DeBounce() { 
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => { 
      this.performSearch(this.searchQuery);
      // 🔍 API Call or logic here
    }, 300); // ⏱ 300ms delay
  }
}
