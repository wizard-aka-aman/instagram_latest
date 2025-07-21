import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaysearchComponent } from './displaysearch.component';

describe('DisplaysearchComponent', () => {
  let component: DisplaysearchComponent;
  let fixture: ComponentFixture<DisplaysearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaysearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplaysearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
