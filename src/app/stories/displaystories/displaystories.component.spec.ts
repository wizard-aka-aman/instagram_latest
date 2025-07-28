import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaystoriesComponent } from './displaystories.component';

describe('DisplaystoriesComponent', () => {
  let component: DisplaystoriesComponent;
  let fixture: ComponentFixture<DisplaystoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaystoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplaystoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
