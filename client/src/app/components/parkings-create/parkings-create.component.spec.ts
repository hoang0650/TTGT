import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingsCreateComponent } from './parkings-create.component';

describe('ParkingsCreateComponent', () => {
  let component: ParkingsCreateComponent;
  let fixture: ComponentFixture<ParkingsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParkingsCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
