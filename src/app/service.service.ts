import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  //  public BaseUrl :string= 'https://wizardamansociety.bsite.net';
  public BaseUrl: string = 'https://localhost:7246';
  constructor( private http : HttpClient) {

  }
  public decodeJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  Auth(item: any) {
    return this.http.post(`${this.BaseUrl}/api/auth/login`, item);
  }
}
