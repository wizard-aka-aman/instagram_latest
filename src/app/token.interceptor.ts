import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError, BehaviorSubject, filter, take, switchMap } from 'rxjs';
import { ServiceService } from './service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: ServiceService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token attachment for auth endpoints
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    // Attach access token
    const token = this.authService.getAccessToken();
    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }

        if (error.status === 403) {
          this.toastr.error('You do not have permission to access this resource.');
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.accessToken);
            
            // Retry the original request with new token
            return next.handle(this.addToken(request, response.accessToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.authService.logout();
            localStorage.clear()
            this.toastr.info('Session expired. Please log in again.');
            return throwError(() => err);
          })
        );
      } else {
        // No refresh token available
        this.isRefreshing = false;
        this.authService.logout();
        localStorage.clear()
        this.toastr.info('Session expired. Please log in again.');
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/login') || 
           url.includes('/register') || 
           url.includes('/refresh');
  }
}