import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticMapModalComponent } from './static-map-modal.component';

describe('StaticMapModalComponent', () => {
  let component: StaticMapModalComponent;
  let fixture: ComponentFixture<StaticMapModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticMapModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticMapModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
