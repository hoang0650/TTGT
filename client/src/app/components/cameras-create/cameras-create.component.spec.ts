import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamerasCreateComponent } from './cameras-create.component';

describe('CamerasCreateComponent', () => {
  let component: CamerasCreateComponent;
  let fixture: ComponentFixture<CamerasCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CamerasCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CamerasCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
