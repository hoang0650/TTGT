import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapInformationComponent } from './map-information.component';

describe('MapInformationComponent', () => {
  let component: MapInformationComponent;
  let fixture: ComponentFixture<MapInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
