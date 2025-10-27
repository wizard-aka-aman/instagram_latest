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
          console.log(err);

        }
      })
  }
  GetAllReq(){
    this.ServiceSrv.GetAllRequestedDto(this.loggedInUser).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.pendingRequests = res;
      },
      error: (err:any)=>{
        console.log(err);
        
      }
    })
  } 
   getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
  RemoveRequest(request:any){
    this.ServiceSrv.DeleteRequest(this.loggedInUser,request.userNameOfReqTo).subscribe({
      next: (data:any) => {
      console.log(data); 
      this.GetAllReq()
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
  displayLike(Story:any){
    this.displayLikeUser = Story.seenBy
    console.log(this.displayLikeUser);
    
  }
  FunGetPersonalStories(){
    this.ServiceSrv.GetAllPersonalStories(this.loggedInUser,this.pageNumber,this.pageSize).subscribe({
      next: (data:any)=>{
        console.log(data); 
        if(data.item1.length==0) return;
        this.previousStories = [...this.previousStories,...(data?.item1[0]?.displayStories)];
        
        console.log(this.previousStories);
        this.totalItem = data?.total
        
      },
      error: (err:any)=>{
        console.log(err);
        
      }
    })
  }
  Next(){
   if(this.pageNumber==this.totalPages || this.totalPages==0){
    console.log(this.totalPages);
    
    return;
   }
   else{
    this.pageNumber++;
    this.FunGetPersonalStories();
   }
  }
  get totalPages() {
    return Math.ceil(this.totalItem / this.pageSize);
  }

  GetCloseFriendFunction(){
    this.ServiceSrv.GetCloseFriend(this.loggedInUser).subscribe({
      next: (res:any)=>{
        // console.log(res);
        this.closeFriendList = res;
        this.previousCloseFriendList = res;
        console.log(this.previousCloseFriendList);
        this.followingdata = this.followingdata.map(e =>{
          if(this.closeFriendList.includes(e.userName)){
            e.isCF = true
          } else{
            e.isCF = false
          }
          return e;
        })
         this.followingdata = this.followingdata.sort((a, b) => {
             return (b.isCF === true ? 1 : 0) - (a.isCF === true ? 1 : 0);
         });
        console.log(this.followingdata);
        
      },
      error: (err:any)=>{
        console.log(err);
        
      }
    })
  }

onCFChange(userName: string, event: any) {
  if (event.target.checked) {
    // agar checkbox tick hua to add karo
    if (!this.closeFriendList.includes(userName)) {
      this.closeFriendList.push(userName);
    }
  } else {
    // agar untick hua to remove karo
    this.closeFriendList = this.closeFriendList.filter(u => u !== userName);
  }

  console.log("Selected Close Friends:", this.closeFriendList);
}
  

  AddCloseFriendFunction(){
    const body = {
      loggedInUserName : this.loggedInUser,
      closeFriendUserName : this.closeFriendList
    }  
    this.ServiceSrv.AddCloseFriend(body).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.toastr.success("Update Close Friends Successfully");
        this.GetCloseFriendFunction();
      },
      error: (err:any)=>{
        console.log(err);
        this.toastr.error("Something Went Wrong");
      }
    })
  } 
  closeCF(){
    console.log("closeCF called");
    
  }

}
