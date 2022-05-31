import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraGroupsComponent } from './camera-groups.component';

describe('CameraGroupsComponent', () => {
  let component: CameraGroupsComponent;
  let fixture: ComponentFixture<CameraGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CameraGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
