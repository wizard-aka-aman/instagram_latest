import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaymessageComponent } from './displaymessage.component';

describe('DisplaymessageComponent', () => {
  let component: DisplaymessageComponent;
  let fixture: ComponentFixture<DisplaymessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaymessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplaymessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
