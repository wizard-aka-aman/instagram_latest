import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoryTransferService {

   private storyData: any = null;

  setStory(data: any) {
    this.storyData = data;
  }

  getStory() {
    return this.storyData;
  }

  clearStory() {
    this.storyData = null;
  }
}
