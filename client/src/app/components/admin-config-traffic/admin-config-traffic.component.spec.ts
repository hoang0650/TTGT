import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigTrafficComponent } from './admin-config-traffic.component';

describe('AdminConfigTrafficComponent', () => {
  let component: AdminConfigTrafficComponent;
  let fixture: ComponentFixture<AdminConfigTrafficComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminConfigTrafficComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigTrafficComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
