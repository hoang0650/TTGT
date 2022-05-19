import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsManagerPopupComponent } from './events-manager-popup.component';

describe('EventsManagerPopupComponent', () => {
  let component: EventsManagerPopupComponent;
  let fixture: ComponentFixture<EventsManagerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsManagerPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsManagerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
