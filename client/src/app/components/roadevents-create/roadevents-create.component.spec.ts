import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadeventsCreateComponent } from './roadevents-create.component';

describe('RoadeventsCreateComponent', () => {
  let component: RoadeventsCreateComponent;
  let fixture: ComponentFixture<RoadeventsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoadeventsCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadeventsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
