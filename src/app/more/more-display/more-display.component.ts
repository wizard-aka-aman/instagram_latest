import { Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  constructor(private ServiceSrv :ServiceService) { 
    this.loggedInUser = this.ServiceSrv.getUserName();
  }

  ngOnInit(): void {
    this.GetAllReq();
    this.FunGetPersonalStories();
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
}
