import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayReelComponent } from './display-reel.component';

describe('DisplayReelComponent', () => {
  let component: DisplayReelComponent;
  let fixture: ComponentFixture<DisplayReelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayReelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayReelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
