import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigCameraComponent } from './admin-config-camera.component';

describe('AdminConfigCameraComponent', () => {
  let component: AdminConfigCameraComponent;
  let fixture: ComponentFixture<AdminConfigCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminConfigCameraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
