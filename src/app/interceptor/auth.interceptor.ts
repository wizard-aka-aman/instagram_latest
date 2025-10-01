import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpBackend,
  HttpClient
} from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { ServiceService } from '../service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  loggedInUser :string ="";
  constructor(private serviceSrv : ServiceService) {
  
    this.loggedInUser = this.serviceSrv.getUserName();
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
     if (request.url.includes('/Follower/follow')) { 
      const userName = (request.body as any).followingUsername;
       this.loggedInUser = this.serviceSrv.getUserName();
      // Yahan dusri API call karo
      const addNotiBody = {
        loggedInUser : this.loggedInUser,
        userName : userName,
        message : "started following you."
      }
       this.serviceSrv.AddNotification(addNotiBody).subscribe({
        next:(data:any)=>{
          return next.handle(request);
        },
        error:(err:any)=>{
        }
      })
    }
    else if (request.url.includes('/Posts/like')) { 
      const userName = (request.body as any).postUsername;
       this.loggedInUser = this.serviceSrv.getUserName();
      // Yahan dusri API call karo 
      const addNotiBody = {
        loggedInUser : this.loggedInUser,
        userName : userName,
        message : "Liked your post.",
        postId : (request.body as any).postId
      }
       this.serviceSrv.AddNotification(addNotiBody).subscribe({
        next:(data:any)=>{
          return next.handle(request);
        },
        error:(err:any)=>{
        }
      })
    }
    else if (request.url.includes('/api/Videos/LikeReel')) {   
      const userName = (request.body as any).LikedBy;
       this.loggedInUser = this.serviceSrv.getUserName();
      // Yahan dusri API call karo
      const addNotiBody = {
        loggedInUser : this.loggedInUser,
        userName : userName,
        message : "Liked your reel.",
        postId : (request.body as any).postId,
        reelId : (request.body as any).Publicid
      } 
      
       this.serviceSrv.AddNotification(addNotiBody).subscribe({
        next:(data:any)=>{
          return next.handle(request);
        },
        error:(err:any)=>{
         console.log(err);
        }
      })
    }
    else if (request.url.includes('/api/Videos/CommentReel')) {  
       this.loggedInUser = this.serviceSrv.getUserName();
      // Yahan dusri API call karo
      const addNotiBody = {
        loggedInUser : this.loggedInUser,
        userName : this.loggedInUser,
        message : "Commented on your reel : "+ (request.body as any).commentText,
        postId : (request.body as any).postId,
        reelId : (request.body as any).publicId
      }
      
      console.log(addNotiBody);
      
       this.serviceSrv.AddNotification(addNotiBody).subscribe({
        next:(data:any)=>{
          return next.handle(request);
        },
        error:(err:any)=>{
         console.log(err);
        }
      })
    } 
    else if (request.url.includes('/Posts/comment')) { 
      const userName = (request.body as any).UserName;
       this.loggedInUser = this.serviceSrv.getUserName();
      // Yahan dusri API call karo
      const addNotiBody = {
        loggedInUser : this.loggedInUser,
        userName : userName,
        message : "Commented on your post : "+ (request.body as any).CommentText,
        postId : (request.body as any).PostId,
        reelId : (request.body as any).Publicid
      }      
       this.serviceSrv.AddNotification(addNotiBody).subscribe({
        next:(data:any)=>{
          return next.handle(request);
        },
        error:(err:any)=>{
         console.log(err);
        }
      })
    }else if (request.url.includes('/api/Requested/AddRequested')) { 
      console.log(request);
      const userName = (request.body as any).userNameOfReqTo;
       this.loggedInUser = this.serviceSrv.getUserName();
      // Yahan dusri API call karo
      const addNotiBody = {
        loggedInUser : this.loggedInUser,
        userName : userName,
        message : "Requested to follow you.",
        postId : (request.body as any).PostId,
        reelId : (request.body as any).Publicid
      }
      console.log(addNotiBody);
      
       this.serviceSrv.AddNotification(addNotiBody).subscribe({
        next:(data:any)=>{
          return next.handle(request);
        },
        error:(err:any)=>{
         console.log(err);
        }
      })
    }
     return next.handle(request);
  }
}

