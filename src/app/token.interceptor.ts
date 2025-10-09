import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ServiceService } from './service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private service :ServiceService , private route: Router , private toastr: ToastrService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem("jwt");

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

   return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('jwt'); 
          this.toastr.info('Session expired. Please log in again.'); 
          window.location.reload();
        }
        return throwError(() => error);
      })
    );

  }
}
