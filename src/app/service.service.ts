import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  //  public BaseUrl :string= 'https://wizardamansociety.bsite.net';
  public BaseUrl: string = 'https://localhost:7246';

  private postRefreshSubject = new BehaviorSubject<boolean>(false);
  postRefresh$ = this.postRefreshSubject.asObservable();
  constructor(private http: HttpClient) {

  }
  emitPostRefresh() {
    this.postRefreshSubject.next(true);
  }
  public decodeJwt(token: string) {
    let value;
    try {
      value = jwtDecode(token);

      // console.log(value);
    } catch (error) {
      value = "Invalid Token"
      console.log(error);
    }
    return value
  }


  public isValidToken() {
    let value = false;
    try {
      value = true;

      // console.log(value);
    } catch (error) {
      value = false
    }
    return value
  }

  public getEmail() {
    let token = localStorage.getItem("jwt");
    let decodedToken: any = this.decodeJwt(token ?? "");
    // console.log(decodedToken);

    return decodedToken.Email;
  }
  public getFullName() {
    let token = localStorage.getItem("jwt");
    let decodedToken: any = this.decodeJwt(token ?? "");
    // console.log(decodedToken);

    return decodedToken.FullName;
  }
  public getUserName() {
    let token = localStorage.getItem("jwt");
    let decodedToken: any = this.decodeJwt(token ?? "");
    // console.log(decodedToken);

    return decodedToken.UserName;
  }

  Auth(item: any) {
    return this.http.post(`${this.BaseUrl}/api/auth/login`, item);
  }

  Authlogin(item: any) {
    return this.http.post(`${this.BaseUrl}/api/Account/login`, item);
  }
  Authsignup(item: any) {
    return this.http.post(`${this.BaseUrl}/api/Account/register`, item);
  }
  GetProfileByUserName(username: string) {
    return this.http.get(`${this.BaseUrl}/Users/${username}`);
  }
  UpdateUserProfile(item: any, username: string) {
    return this.http.put(`${this.BaseUrl}/Users/put/${username}`, item);
  }
  RemoveProfilePicture(username: String) {
    return this.http.delete(`${this.BaseUrl}/Users/profilepicture/${username}`);
  }
  UploadProfilePicture(username: string, item: any) {
    return this.http.post(`${this.BaseUrl}/Users/profilepicture/${username}`, item);
  }
  UploadPost(form: any) {
    return this.http.post(`${this.BaseUrl}/Posts/create`, form);
  }
  GetAllPostByUsername(username: string) {
    return this.http.get(`${this.BaseUrl}/Posts/${username}`);
  }
}
