import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayExploreComponent } from './display-explore.component';

describe('DisplayExploreComponent', () => {
  let component: DisplayExploreComponent;
  let fixture: ComponentFixture<DisplayExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayExploreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
