import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayTaggedComponent } from './display-tagged.component';

describe('DisplayTaggedComponent', () => {
  let component: DisplayTaggedComponent;
  let fixture: ComponentFixture<DisplayTaggedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayTaggedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayTaggedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
