import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  //  public BaseUrl :string= 'https://wizardamansociety.bsite.net';
  public BaseUrl: string = 'https://localhost:7246';
  constructor( private http : HttpClient) {

  }
  public decodeJwt(token: string) {
    let value;
    try {
    value =  jwtDecode(token); 
      
    // console.log(value);
  } catch (error) {
    value = "Invalid Token"
    console.log(error); 
    }
    return value
  }


  public isValidToken(){
     let value = false;
    try {
    value =  true; 
      
    // console.log(value);
  } catch (error) {
   value = false
    }
    return value
  }

  public getEmail(){
    let token = localStorage.getItem("jwt");
    let decodedToken :any= this.decodeJwt(token??"");
    // console.log(decodedToken);
    
    return decodedToken.Email;
  }
  public getFullName(){
    let token = localStorage.getItem("jwt");
    let decodedToken :any= this.decodeJwt(token??"");
    // console.log(decodedToken);
    
    return decodedToken.FullName;
  }
  public getUserName(){
    let token = localStorage.getItem("jwt");
    let decodedToken :any= this.decodeJwt(token??"");
    // console.log(decodedToken);
    
    return decodedToken.UserName;
  }

  Auth(item: any) {
    return this.http.post(`${this.BaseUrl}/api/auth/login`, item);
  }

  Authlogin(item:any){
    return this.http.post(`${this.BaseUrl}/api/Account/login`,item);
  }
  Authsignup(item:any){
    return this.http.post(`${this.BaseUrl}/api/Account/register`,item);
  }
  GetProfileByUserName(username :string){
    return this.http.get(`${this.BaseUrl}/Users/${username}`);
  }
}
