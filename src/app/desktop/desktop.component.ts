import { Component, OnInit, OnDestroy } from '@angular/core';
import { GrainService } from '../grain.service';
import { Subscription } from 'rxjs';
import { WindowModalComponent } from '../window-modal/window-modal.component';

interface WindowData {
  id: number;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements OnInit, OnDestroy {
  windows: WindowData[] = [
    {
      id: 1,
      title: 'My Computer',
      position: { x: 150, y: 100 },
      size: { width: 500, height: 400 },
      zIndex: 1
    },
    {
      id: 2,
      title: 'My Documents',
      position: { x: 200, y: 150 },
      size: { width: 450, height: 350 },
      zIndex: 2
    }
  ];

  grainEnabled = true;
  currentTime = new Date();
  private grainSubscription?: Subscription;
  private timeInterval?: any;

  constructor(private grainService: GrainService) {}

  ngOnInit() {
    this.grainSubscription = this.grainService.grainEnabled$.subscribe(
      enabled => this.grainEnabled = enabled
    );

    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.grainSubscription) {
      this.grainSubscription.unsubscribe();
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  bringToFront(id: number) {
    const maxZ = Math.max(...this.windows.map(w => w.zIndex));
    this.windows = this.windows.map(w =>
      w.id === id ? { ...w, zIndex: maxZ + 1 } : w
    );
  }

  closeWindow(id: number) {
    this.windows = this.windows.filter(w => w.id !== id);
  }

  toggleGrain() {
    this.grainService.toggleGrain();
  }

  addNewWindow() {
    const newId = Math.max(...this.windows.map(w => w.id), 0) + 1;
    const maxZ = Math.max(...this.windows.map(w => w.zIndex), 0);
    
    this.windows.push({
      id: newId,
      title: `Window ${newId}`,
      position: { x: 100 + newId * 30, y: 80 + newId * 30 },
      size: { width: 450, height: 350 },
      zIndex: maxZ + 1
    });
  }

  get formattedTime(): string {
    return this.currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
