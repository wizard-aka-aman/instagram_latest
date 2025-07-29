import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReelViewComponent } from './reel-view.component';

describe('ReelViewComponent', () => {
  let component: ReelViewComponent;
  let fixture: ComponentFixture<ReelViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReelViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
