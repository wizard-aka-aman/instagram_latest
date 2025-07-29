import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayreelsComponent } from './displayreels.component';

describe('DisplayreelsComponent', () => {
  let component: DisplayreelsComponent;
  let fixture: ComponentFixture<DisplayreelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayreelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayreelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
