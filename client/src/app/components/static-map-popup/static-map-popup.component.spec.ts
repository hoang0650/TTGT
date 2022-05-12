import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticMapPopupComponent } from './static-map-popup.component';

describe('StaticMapPopupComponent', () => {
  let component: StaticMapPopupComponent;
  let fixture: ComponentFixture<StaticMapPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticMapPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticMapPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
