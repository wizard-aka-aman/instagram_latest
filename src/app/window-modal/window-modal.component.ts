import { Component, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

@Component({
  selector: 'app-window-modal',
  templateUrl: './window-modal.component.html',
  styleUrls: ['./window-modal.component.scss']
})
export class WindowModalComponent {
  @Input() title = 'Window';
  @Input() initialPosition: WindowPosition = { x: 100, y: 100 };
  @Input() initialSize: WindowSize = { width: 450, height: 350 };
  @Input() zIndex = 1;
  @Output() onClose = new EventEmitter<void>();
  @Output() onFocus = new EventEmitter<void>();

  isDragging = false;
  isResizing = false;
  resizeDirection = '';
  isMinimized = false;
  isMaximized = false;

  position: WindowPosition;
  size: WindowSize;
  savedState: { position: WindowPosition; size: WindowSize } | null = null;

  dragStart = { x: 0, y: 0 };
  resizeStart = { x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 };

  constructor(private el: ElementRef) {
    this.position = { ...this.initialPosition };
    this.size = { ...this.initialSize };
  }

  get windowStyle() {
    if (this.isMaximized) {
      return {
        top: '0px',
        left: '0px',
        width: '100%',
        height: 'calc(100% - 30px)',
        zIndex: this.zIndex,
        display: this.isMinimized ? 'none' : 'flex'
      };
    }
    return {
      top: this.position.y + 'px',
      left: this.position.x + 'px',
      width: this.size.width + 'px',
      height: this.size.height + 'px',
      zIndex: this.zIndex,
      display: this.isMinimized ? 'none' : 'flex'
    };
  }

  startDrag(event: MouseEvent) {
    if (this.isMaximized) return;
    event.preventDefault();
    this.isDragging = true;
    this.dragStart = {
      x: event.clientX - this.position.x,
      y: event.clientY - this.position.y
    };
    this.onFocus.emit();
  }

  startResize(event: MouseEvent, direction: string) {
    if (this.isMaximized) return;
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStart = {
      x: event.clientX,
      y: event.clientY,
      width: this.size.width,
      height: this.size.height,
      posX: this.position.x,
      posY: this.position.y
    };
    this.onFocus.emit();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.position = {
        x: event.clientX - this.dragStart.x,
        y: event.clientY - this.dragStart.y
      };
    }

    if (this.isResizing) {
      const dx = event.clientX - this.resizeStart.x;
      const dy = event.clientY - this.resizeStart.y;

      if (this.resizeDirection.includes('right')) {
        this.size.width = Math.max(200, this.resizeStart.width + dx);
      }
      if (this.resizeDirection.includes('bottom')) {
        this.size.height = Math.max(150, this.resizeStart.height + dy);
      }
      if (this.resizeDirection.includes('left')) {
        const newWidth = Math.max(200, this.resizeStart.width - dx);
        this.position.x = this.resizeStart.posX + (this.resizeStart.width - newWidth);
        this.size.width = newWidth;
      }
      if (this.resizeDirection.includes('top')) {
        const newHeight = Math.max(150, this.resizeStart.height - dy);
        this.position.y = this.resizeStart.posY + (this.resizeStart.height - newHeight);
        this.size.height = newHeight;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  minimize(event: MouseEvent) {
    event.stopPropagation();
    this.isMinimized = !this.isMinimized;
  }

  toggleMaximize(event: MouseEvent) {
    event.stopPropagation();
    this.onFocus.emit();
    
    if (!this.isMaximized) {
      this.savedState = {
        position: { ...this.position },
        size: { ...this.size }
      };
      this.isMaximized = true;
      this.isMinimized = false;
    } else {
      if (this.savedState) {
        this.position = { ...this.savedState.position };
        this.size = { ...this.savedState.size };
      }
      this.isMaximized = false;
    }
  }

  close(event: MouseEvent) {
    event.stopPropagation();
    this.onClose.emit();
  }

  bringToFront() {
    this.onFocus.emit();
  }
}