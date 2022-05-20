import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadeventsComponent } from './roadevents.component';

describe('RoadeventsComponent', () => {
  let component: RoadeventsComponent;
  let fixture: ComponentFixture<RoadeventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoadeventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadeventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
