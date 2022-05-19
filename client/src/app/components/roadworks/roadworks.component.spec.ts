import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadworksComponent } from './roadworks.component';

describe('RoadworksComponent', () => {
  let component: RoadworksComponent;
  let fixture: ComponentFixture<RoadworksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoadworksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadworksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
