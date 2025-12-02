import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrainService {
  private grainEnabled = new BehaviorSubject<boolean>(true);
  public grainEnabled$: Observable<boolean> = this.grainEnabled.asObservable();

  toggleGrain(): void {
    this.grainEnabled.next(!this.grainEnabled.value);
  }

  isEnabled(): boolean {
    return this.grainEnabled.value;
  }

  setGrain(enabled: boolean): void {
    this.grainEnabled.next(enabled);
  }
}