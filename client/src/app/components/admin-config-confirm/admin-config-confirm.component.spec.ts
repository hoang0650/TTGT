import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigConfirmComponent } from './admin-config-confirm.component';

describe('AdminConfigConfirmComponent', () => {
  let component: AdminConfigConfirmComponent;
  let fixture: ComponentFixture<AdminConfigConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminConfigConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
