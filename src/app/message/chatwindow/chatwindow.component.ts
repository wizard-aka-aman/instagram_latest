import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageServiceService } from 'src/app/message-service.service';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-chatwindow',
  templateUrl: './chatwindow.component.html',
  styleUrls: ['./chatwindow.component.scss']
})
export class ChatwindowComponent implements OnInit {

  chatList: any;
  loggedInUser: string = ""
//search
  searchQuery = '';
  searchResults: any[] = []; 
  showDropdown = false;
  debounceTimer: any;
  constructor(private route: ActivatedRoute, private service: ServiceService) { 

   
  }

  ngOnInit() {
    this.loggedInUser = this.service.getUserName()
    
     this.service.chatListRefresh$.subscribe({
      next : (data:any)=>{
        console.log(data);
        
        this.service.GetRecentMessage(this.loggedInUser).subscribe({
          next: (data: any) => {
            console.log(data); 
            this.chatList = data;
            this.service.setChatList(data);
          },
          error: (error: any) => {
            console.error(error);
          }
    })
      },
      error:(error:any)=>{
        console.log(error);
      }

    })
  }
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return  image;
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
   DeBounce() { 
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => { 
      this.performSearch(this.searchQuery);
    
    }, 300); // ⏱ 300ms delay
  }
}
