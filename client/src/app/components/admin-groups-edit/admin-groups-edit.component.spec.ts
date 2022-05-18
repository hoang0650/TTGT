import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGroupsEditComponent } from './admin-groups-edit.component';

describe('AdminGroupsEditComponent', () => {
  let component: AdminGroupsEditComponent;
  let fixture: ComponentFixture<AdminGroupsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminGroupsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminGroupsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
