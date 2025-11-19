import { Time } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-more-display',
  templateUrl: './more-display.component.html',
  styleUrls: ['./more-display.component.scss']
})
export class MoreDisplayComponent implements OnInit {
  loggedInUser :string = ""; 
  pendingRequests :any; 
  previousStories :any[]=[];
  displayLikeUser :any;
  pageNumber =1;
  pageSize = 5;
  totalItem =0;
  closeFriendList :any[]=[];
  previousCloseFriendList :any[]=[];
  followingdata:any[]=[]
  constructor(private ServiceSrv :ServiceService , private toastr :ToastrService) { 
    this.loggedInUser = this.ServiceSrv.getUserName();
  }

  ngOnInit(): void {
    this.GetAllReq();
    this.FunGetPersonalStories(); 
    this.ServiceSrv.GetFollowing(this.loggedInUser).subscribe({
        next: (res: any) => {
          this.followingdata = res;
          this.GetCloseFriendFunction()
        },
        error: (err: any) => {
          console.error('Error fetching following data:', err);
        }
      })
  }
  
  GetAllReq(){
    this.ServiceSrv.GetAllRequestedDto(this.loggedInUser).subscribe({
      next: (res:any)=>{
        this.pendingRequests = res;
      },
      error: (err:any)=>{
        console.error('Error fetching pending requests:', err);
      }
    })
  } 
  
  // Adjusted for default avatar logic to match SCSS styling
  getProfileImage(image: string | null): string {
    if (!image || image === 'null' || image.length === 0) {
      // Ensure the 'assets/avatar.png' is always returned when no image exists.
      return 'assets/avatar.png'; 
    }
    return 'data:image/jpeg;base64,' + image;
  }
  
  RemoveRequest(request:any){
    this.ServiceSrv.DeleteRequest(this.loggedInUser,request.userNameOfReqTo).subscribe({
      next: (data:any) => {
        this.toastr.success(`Request to ${request.userNameOfReqTo} removed successfully.`);
        this.GetAllReq()
      },
      error: (error) => {
        console.error('Error removing request:', error);
        this.toastr.error("Failed to remove request");
      }
    })
  }
  
  displayLike(Story:any){
    this.displayLikeUser = Story.seenBy
  }
  
  FunGetPersonalStories(){
    this.ServiceSrv.GetAllPersonalStories(this.loggedInUser,this.pageNumber,this.pageSize).subscribe({
      next: (data:any)=>{
        if(!data.item1 || data.item1.length === 0) {
           this.totalItem = data?.total || 0;
           return;
        }
        this.previousStories = [...this.previousStories,...(data.item1[0]?.displayStories || [])];
        this.totalItem = data?.total;
      },
      error: (err:any)=>{
        console.error('Error fetching personal stories:', err);
      }
    })
  }
  
  Next(){
   const totalPages = this.totalPages;
   if(this.pageNumber >= totalPages || totalPages === 0){
    return;
   }
   else{
    this.pageNumber++;
    this.FunGetPersonalStories();
   }
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItem / this.pageSize);
  }

  GetCloseFriendFunction(){
    this.ServiceSrv.GetCloseFriend(this.loggedInUser).subscribe({
      next: (res:any)=>{
        this.closeFriendList = res;
        this.previousCloseFriendList = [...res]; 
        this.followingdata = this.followingdata.map(e =>{
          e.isCF = this.closeFriendList.includes(e.userName);
          return e;
        })
        this.followingdata = this.followingdata.sort((a, b) => {
             return (b.isCF === true ? 1 : 0) - (a.isCF === true ? 1 : 0);
         });
      },
      error: (err:any)=>{
        console.error('Error fetching close friends:', err);
      }
    })
  }

  onCFChange(userName: string, event: any) {
    if (event.target.checked) {
      if (!this.closeFriendList.includes(userName)) {
        this.closeFriendList.push(userName);
      }
    } else {
      this.closeFriendList = this.closeFriendList.filter(u => u !== userName);
    }
  }
  

  AddCloseFriendFunction(){
    const body = {
      loggedInUserName : this.loggedInUser,
      closeFriendUserName : this.closeFriendList
    }  
    this.ServiceSrv.AddCloseFriend(body).subscribe({
      next: (res:any)=>{
        this.toastr.success("Close Friends list updated successfully");
        this.GetCloseFriendFunction(); 
      },
      error: (err:any)=>{
        console.error('Error updating close friends:', err);
        this.toastr.error("Failed to update Close Friends list");
      }
    })
  } 
  
  closeCF(){
    this.GetCloseFriendFunction(); 
  }
}