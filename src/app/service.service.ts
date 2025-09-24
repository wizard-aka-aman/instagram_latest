import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { isNgTemplate } from '@angular/compiler';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {

   public BaseUrl :string= 'https://xatavop939.bsite.net';
  // public BaseUrl: string = 'https://localhost:7246';
  private chatListCache: any[] = [];
  private postRefreshSubject = new BehaviorSubject<boolean>(false);
  private isSeenNoti = new BehaviorSubject<boolean>(true);
  isSeenNoti$ = this.isSeenNoti.asObservable();
  postRefresh$ = this.postRefreshSubject.asObservable();

  chatListRefreshSubject = new BehaviorSubject<boolean>(false);
  chatListRefresh$ = this.chatListRefreshSubject.asObservable();
  
  constructor(private http: HttpClient) {

  }
  setNoti(bol : boolean){
    this.isSeenNoti.next(bol);
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
  GetPostByIdWithUserNameAsync(postId: number, username: string,loggedInUsername:string) {
    return this.http.get(`${this.BaseUrl}/Posts/post/${postId}/${username}/${loggedInUsername}`);
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
  AddedToSaved(item: any) {
    return this.http.post(`${this.BaseUrl}/Saved/addtosaved`, item)
  }
  RemovedFromSaved(item: any) {
    return this.http.post(`${this.BaseUrl}/Saved/removesaved`, item)
  }
  IsSaved(username: string, postid: number) {
    return this.http.get(`${this.BaseUrl}/Saved/issaved/${username}/${postid}`)
  }
  DeleteChat(item: number) {
    return this.http.post(`${this.BaseUrl}/api/Chat/delete`, item)
  }
  GetRecentMessage(username: string) {
    return this.http.get(`${this.BaseUrl}/api/RecentMessages/recent-messages/${username}`)
  }
  SaveRecentMessage(item: any) {
    return this.http.post(`${this.BaseUrl}/api/RecentMessages/save-recent-message`, item)
  }
  GetStoryByUsername(username: string) {
    return this.http.get(`${this.BaseUrl}/api/Story/GetStoriesByUser/${username}`)
  }
  GetPersonalStories(username: string) {
    return this.http.get(`${this.BaseUrl}/api/Story/GetPersonalStories/${username}`)
  }
  PostStory(item: any) {
    return this.http.post(`${this.BaseUrl}/api/Story/AddStory`, item)
  }
  postStorySeen(data: any) {
    return this.http.post(`${this.BaseUrl}/api/Story/seen`, data);
  }
  GetWhoSeenStory(username: string) {
    return this.http.get(`${this.BaseUrl}/api/story/GetStoryViewers/${username}`);
  }
  GetLoggedInUserStory(username: string) {
    return this.http.get(`${this.BaseUrl}/api/Story/IsStoryAvailable/${username}`)
  }
  postReel(item: any) {
    return this.http.post(`${this.BaseUrl}/api/Videos/upload`, item);
  }
  GetReelsByUsername(username: string) {
    return this.http.get(`${this.BaseUrl}/api/Videos/GetReelByUsername/${username}`)
  }
  GetReelByPublicId(publicid: string,loggedInUsername:string) {
    return this.http.get(`${this.BaseUrl}/api/Videos/GetReelByPublicid/${publicid}/${loggedInUsername}`)
  }
  LikeReel(item:any){
    return this.http.post(`${this.BaseUrl}/api/Videos/LikeReel`, item)
  }
  UnLikeReel(item:any){
    return this.http.post(`${this.BaseUrl}/api/Videos/UnLikeReel`, item)
  }
  CommentReel(item:any){
    return this.http.post(`${this.BaseUrl}/api/Videos/CommentReel`, item)
  }
  GetAllSavedReel(username:string){
    return this.http.get(`${this.BaseUrl}/Saved/getallsavedreels/${username}`)
  }
  AddToSavedReel(item:any){
    return this.http.post(`${this.BaseUrl}/Saved/addtosavedreels`, item)
  }
  RemoveSavedReel(item:any){
    return this.http.post(`${this.BaseUrl}/Saved/removesavedreels`, item)
  }
  IsSavedReel(username:string , publicid:string){
    return this.http.get(`${this.BaseUrl}/Saved/issavedreels/${username}/${publicid}`)
  }
  GetFiveReel(username:string){
    return this.http.get(`${this.BaseUrl}/api/Videos/GetAllFive/${username}`)
  }
  DisplayPostHome(username:string,pageNumber:number,pageSize:number){
    return this.http.get(`${this.BaseUrl}/api/Story/DisplayPostHome/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }
  GetAllNotifications(username:string){
    return this.http.get(`${this.BaseUrl}/api/Notification/getAllNotification/${username}`)
  }
  SeenNotification(username:string){
    return this.http.get(`${this.BaseUrl}/api/Notification/SeenNotification/${username}`)
  }
  AddNotification(item:any){
    return this.http.post(`${this.BaseUrl}/api/Notification/AddNotification`,item)
  }
  GetAllRequested(username:string){
    return this.http.get(`${this.BaseUrl}/api/Requested/getAllRequested/${username}`)
  }
  AddRequested(item:any){
    return this.http.post(`${this.BaseUrl}/api/Requested/AddRequested`,item)  
  }
  IsRequested(from:string,to:string){
    return this.http.get(`${this.BaseUrl}/api/Requested/isRequested/${from}/${to}`);
  }
  DeleteRequest(from:string,to:string){
    return this.http.delete(`${this.BaseUrl}/api/Requested/DeleteRequest/${from}/${to}`);
  }
  Get10Posts(username:string){
    return this.http.get(`${this.BaseUrl}/Posts/Get10Posts/${username}`)
  }
  SendPost(item:any){
    return this.http.post(`${this.BaseUrl}/api/Chat/sendpost`,item);
  }
  SeenMessages(groupName:string ,recieve:string){
    return this.http.get(`${this.BaseUrl}/api/Chat/seen/${groupName}/${recieve}`);
  }
  GetAllRequestedDto(username:string){
    return this.http.get(`${this.BaseUrl}/api/Requested/GetAllRequestDto/${username}`);
  }
  GetAllPersonalStories(username:string,pageNumber:number,pageSize:number){
    return this.http.get(`${this.BaseUrl}/api/Story/GetAllPersonalStories/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }
}