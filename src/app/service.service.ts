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
  private chatListCache: any[] = [];
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


setChatList(list: any[]) {
  this.chatListCache = list;
}

getChatList(): any[] {
  return this.chatListCache;
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
  GetPostByIdWithUserNameAsync(postId: number, username: string) {
    return this.http.get(`${this.BaseUrl}/Posts/post/${postId}/${username}`);
  }
  LikePost(item: any) {
    return this.http.post(`${this.BaseUrl}/Posts/like`, item);
  }
  UnLikePost(item: any) {
    return this.http.post(`${this.BaseUrl}/Posts/unlike`, item);
  }
  AddComment(item: any) {
    return this.http.post(`${this.BaseUrl}/Posts/comment`, item);
  }
  GetFollower(username: string) {
    return this.http.get(`${this.BaseUrl}/Follower/getfollower/${username}`);
  }
  GetFollowing(username: string) {
    return this.http.get(`${this.BaseUrl}/Follower/getfollowing/${username}`);
  }
  FollowPost(item: any) {
    return this.http.post(`${this.BaseUrl}/Follower/follow`, item);
  }
  UnFollowPost(item: any) {
    return this.http.post(`${this.BaseUrl}/Follower/unfollow`, item);
  }
  isFollowing(loggedInUsername: string, displayUsername: string) {
    return this.http.get(`${this.BaseUrl}/Follower/isfollowing/${loggedInUsername}/${displayUsername}`);
  }
  GetAllUsers() {
    return this.http.get(`${this.BaseUrl}/Users/getallusers`)
  }
  SearchUsers(query: string) {
    return this.http.get(`${this.BaseUrl}/Users/search?query=${query}`);
  }
  GetAllSavedByUserName(username: string) {
    return this.http.get(`${this.BaseUrl}/Saved/getallsaved/${username}`)
  }
  AddedToSaved(item:any) {
    return this.http.post(`${this.BaseUrl}/Saved/addtosaved`,item)
  }
  RemovedFromSaved(item: any) {
    return this.http.post(`${this.BaseUrl}/Saved/removesaved`,item)
  }
  IsSaved(username:string,postid:number){
    return this.http.get(`${this.BaseUrl}/Saved/issaved/${username}/${postid}`)
  }
  DeleteChat(item:number){
    return this.http.post(`${this.BaseUrl}/api/Chat/delete`,item)
  }
  GetRecentMessage(username:string){
    return this.http.get(`${this.BaseUrl}/api/RecentMessages/recent-messages/${username}`)
  }
  SaveRecentMessage(item:any){
    return this.http.post(`${this.BaseUrl}/api/RecentMessages/save-recent-message`,item)
  }
  GetStoryByUsername(username:string){
    return this.http.get(`${this.BaseUrl}/api/Story/GetStoriesByUser/${username}`)
  }
  PostStory(item:any){
    return this.http.post(`${this.BaseUrl}/api/Story/AddStory`,item)
  }
}
