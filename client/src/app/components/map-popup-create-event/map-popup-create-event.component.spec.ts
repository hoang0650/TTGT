import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPopupCreateEventComponent } from './map-popup-create-event.component';

describe('MapPopupCreateEventComponent', () => {
  let component: MapPopupCreateEventComponent;
  let fixture: ComponentFixture<MapPopupCreateEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapPopupCreateEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapPopupCreateEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
