import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

  isMessage = new BehaviorSubject<boolean>(false);
  isMessage$ = this.isMessage.asObservable(); 

  constructor() { }
  SetIsMessage(value:boolean){
    this.isMessage.next(value);
  } 
}
