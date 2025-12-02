import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowModalComponent } from './window-modal.component';

describe('WindowModalComponent', () => {
  let component: WindowModalComponent;
  let fixture: ComponentFixture<WindowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WindowModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WindowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
