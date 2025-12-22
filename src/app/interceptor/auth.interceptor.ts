import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ServiceService } from '../service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  loggedInUser: string = "";

  constructor(private serviceSrv: ServiceService) {
    this.loggedInUser = this.serviceSrv.getUserName();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        // Check if response is successful (status 200)
        if (event instanceof HttpResponse && event.status === 200) {
          this.handleSuccessfulResponse(request);
        }
      })
    );
  }

  private handleSuccessfulResponse(request: HttpRequest<any>): void {
    this.loggedInUser = this.serviceSrv.getUserName();

    if (request.url.includes('/Follower/follow')) {
      const userName = (request.body as any).followingUsername;
      const addNotiBody = {
        loggedInUser: this.loggedInUser,
        userName: userName,
        message: "started following you."
      };
      this.serviceSrv.AddNotification(addNotiBody).subscribe({
        error: (err: any) => console.log(err)
      });
    } 
    else if (request.url.includes('/Posts/like')) {
      const userName = (request.body as any).postUsername;
      const addNotiBody = {
        loggedInUser: this.loggedInUser,
        userName: userName,
        message: "Liked your post.",
        postId: (request.body as any).postId
      };
      this.serviceSrv.AddNotification(addNotiBody).subscribe({
        error: (err: any) => console.log(err)
      });
    } 
    else if (request.url.includes('/api/Videos/LikeReel')) {
      const userName = (request.body as any).LikedBy;
      const addNotiBody = {
        loggedInUser: this.loggedInUser,
        userName: userName,
        message: "Liked your reel.",
        postId: (request.body as any).postId,
        reelId: (request.body as any).Publicid
      };
      this.serviceSrv.AddNotification(addNotiBody).subscribe({
        error: (err: any) => console.log(err)
      });
    } 
    else if (request.url.includes('/api/Videos/CommentReel')) {
      const addNotiBody = {
        loggedInUser: this.loggedInUser,
        userName: this.loggedInUser,
        message: "Commented on your reel : " + (request.body as any).commentText,
        postId: (request.body as any).postId,
        reelId: (request.body as any).publicId
      };
      this.serviceSrv.AddNotification(addNotiBody).subscribe({
        error: (err: any) => console.log(err)
      });
    } 
    else if (request.url.includes('/Posts/comment')) {
      const userName = (request.body as any).UserName;
      const addNotiBody = {
        loggedInUser: this.loggedInUser,
        userName: userName,
        message: "Commented on your post : " + (request.body as any).CommentText,
        postId: (request.body as any).PostId,
        reelId: (request.body as any).Publicid
      };
      this.serviceSrv.AddNotification(addNotiBody).subscribe({
        error: (err: any) => console.log(err)
      });
    } 
    else if (request.url.includes('/api/Requested/AddRequested')) {
      const userName = (request.body as any).userNameOfReqTo;
      const addNotiBody = {
        loggedInUser: this.loggedInUser,
        userName: userName,
        message: "Requested to follow you.",
        postId: (request.body as any).PostId,
        reelId: (request.body as any).Publicid
      };
      this.serviceSrv.AddNotification(addNotiBody).subscribe({
        error: (err: any) => console.log(err)
      });
    }
  }
}