import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigEventComponent } from './admin-config-event.component';

describe('AdminConfigEventComponent', () => {
  let component: AdminConfigEventComponent;
  let fixture: ComponentFixture<AdminConfigEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminConfigEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
