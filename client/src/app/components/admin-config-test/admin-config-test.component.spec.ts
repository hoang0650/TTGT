import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigTestComponent } from './admin-config-test.component';

describe('AdminConfigTestComponent', () => {
  let component: AdminConfigTestComponent;
  let fixture: ComponentFixture<AdminConfigTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminConfigTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
