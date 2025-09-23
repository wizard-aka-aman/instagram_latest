import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreDisplayComponent } from './more-display.component';

describe('MoreDisplayComponent', () => {
  let component: MoreDisplayComponent;
  let fixture: ComponentFixture<MoreDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
